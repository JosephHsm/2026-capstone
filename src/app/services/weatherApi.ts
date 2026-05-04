// 기상청 지상(종관,ASOS) 시간자료 조회서비스
// Endpoint: http://apis.data.go.kr/1360000/AsosHourlyInfoService/getWthrDataList
// 서울(종관) 기상관측소 ID: 108

const ASOS_BASE = '/asos/1360000/AsosHourlyInfoService';
const SERVICE_KEY = import.meta.env.VITE_KMA_SERVICE_KEY ?? '';
const STATION_ID = '108'; // 서울

// ---- 내부 타입 ----------------------------------------------------------

interface AsosItem {
  tm: string;   // "2024-05-03 14:00"
  stnId: string;
  stnNm: string;
  ta: string;   // 기온 (°C)
  hm: string;   // 상대습도 (%)
  ws: string;   // 풍속 (m/s)
  wd: string;   // 풍향 (16방위)
  rn: string;   // 강수량 (mm)
  td: string;   // 이슬점온도 (°C)
  pa: string;   // 현지기압 (hPa)
  ps: string;   // 해면기압 (hPa)
}

interface AsosApiResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: { item: AsosItem | AsosItem[] };
      totalCount: number;
    };
  };
}

// ---- 공개 타입 ----------------------------------------------------------

export interface CurrentWeather {
  temperature: number;   // ta: 기온 (°C)
  humidity: number;      // hm: 상대습도 (%)
  windSpeed: number;     // ws: 풍속 (m/s)
  precipType: number;    // 0=없음 1=비  (rn > 0 이면 1)
  skyCondition: number;  // 1=맑음 4=흐림  (rn > 0 이면 4)
  observedAt: string;    // tm 원본: "YYYY-MM-DD HH:00"
}

export interface ForecastHour {
  time: string;   // "HH:00"
  date: string;   // "YYYYMMDD"
  tmp: number;    // 기온 (°C)
  reh: number;    // 습도 (%)
  sky: number;    // 1=맑음 4=흐림
  pop: number;    // 0 또는 100 (실제 강수 여부)
  pty: number;    // 0=없음 1=비
  wsd: number;    // 풍속 (m/s)
}

// ---- 날짜 범위 헬퍼 -----------------------------------------------------

// ASOS는 전날(어제) 23:00까지만 제공 — 오늘 날짜로 요청하면 resultCode 99 반환
function buildRange(hoursBack: number): {
  startDt: string; startHh: string; endDt: string; endHh: string;
} {
  const now = new Date();

  // 어제 23:00 이 API의 최대 endDt
  const maxEnd = new Date(now);
  maxEnd.setDate(maxEnd.getDate() - 1);
  maxEnd.setHours(23, 0, 0, 0);

  const end = new Date(now);
  end.setMinutes(0, 0, 0);
  end.setHours(end.getHours() - 1);

  const effectiveEnd = end <= maxEnd ? end : maxEnd;

  const start = new Date(effectiveEnd);
  start.setHours(start.getHours() - (hoursBack - 1));

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    return { date: `${y}${m}${day}`, hour: h };
  };

  const s = fmt(start);
  const e = fmt(effectiveEnd);
  return { startDt: s.date, startHh: s.hour, endDt: e.date, endHh: e.hour };
}

// ---- API 요청 공통 함수 -------------------------------------------------

async function asosGet(
  range: { startDt: string; startHh: string; endDt: string; endHh: string },
  numOfRows = '24',
): Promise<AsosItem[]> {
  const sp = new URLSearchParams({
    serviceKey: SERVICE_KEY,
    numOfRows,
    pageNo: '1',
    dataType: 'JSON',
    dataCd: 'ASOS',
    dateCd: 'HR',
    startDt: range.startDt,
    startHh: range.startHh,
    endDt: range.endDt,
    endHh: range.endHh,
    stnIds: STATION_ID,
  });

  const res = await fetch(`${ASOS_BASE}/getWthrDataList?${sp}`);
  if (!res.ok) throw new Error(`기상청 ASOS API 오류 ${res.status}`);

  const json = (await res.json()) as AsosApiResponse;
  // NODATA_ERROR(03)는 에러가 아니라 빈 배열로 처리
  if (json.response.header.resultCode === '03') return [];
  if (json.response.header.resultCode !== '00') {
    throw new Error(`기상청: ${json.response.header.resultMsg}`);
  }

  const raw = json.response.body.items.item;
  if (!raw || raw === '') return [];
  // 단건 응답 시 객체로 오는 경우 배열로 통일
  return Array.isArray(raw) ? raw : [raw];
}

// ---- 공개 API 함수 ------------------------------------------------------

/** 최신 ASOS 실황 관측값 반환 (최대 3시간 전까지 조회해 가장 최근 데이터 사용) */
export async function fetchCurrentWeather(): Promise<CurrentWeather> {
  const range = buildRange(3);
  const items = await asosGet(range, '3');
  const item = items[items.length - 1]; // 가장 최근 항목

  const rn = parseFloat(item?.rn || '0') || 0;

  return {
    temperature: parseFloat(item?.ta || '0') || 0,
    humidity: parseFloat(item?.hm || '0') || 0,
    windSpeed: parseFloat(item?.ws || '0') || 0,
    precipType: rn > 0 ? 1 : 0,
    skyCondition: rn > 0 ? 4 : 1,
    observedAt: item?.tm ?? '',
  };
}

/** 최근 24시간 ASOS 실황 관측값 반환 (태양광 추정·그래프용) */
export async function fetchWeatherForecast(): Promise<ForecastHour[]> {
  const range = buildRange(24);
  const items = await asosGet(range, '24');

  return items.map((item) => {
    const tm = item.tm ?? '';
    // tm 형식: "2024-05-03 14:00"
    const date = tm.slice(0, 10).replace(/-/g, ''); // "20240503"
    const hourStr = tm.slice(11, 13);               // "14"

    const rn = parseFloat(item.rn || '0') || 0;

    return {
      date,
      time: `${hourStr}:00`,
      tmp: parseFloat(item.ta || '0') || 0,
      reh: parseFloat(item.hm || '0') || 0,
      sky: rn > 0 ? 4 : 1,
      pop: rn > 0 ? 100 : 0,
      pty: rn > 0 ? 1 : 0,
      wsd: parseFloat(item.ws || '0') || 0,
    };
  });
}

// ---- 변환 헬퍼 ----------------------------------------------------------

export function skyToLabel(sky: number): string {
  if (sky === 1) return '맑음';
  if (sky === 3) return '구름많음';
  if (sky === 4) return '흐림';
  return '-';
}

export function precipToLabel(pty: number): string {
  if (pty === 0) return '없음';
  if (pty === 1) return '비';
  if (pty === 2) return '비/눈';
  if (pty === 3) return '눈';
  if (pty === 4) return '소나기';
  return '-';
}

/**
 * 하늘상태(SKY)와 시간(hour)으로 태양광 발전량 추정
 * @param sky  SKY 코드 (1=맑음, 3=구름많음, 4=흐림)
 * @param hour 시 (0~23)
 * @param maxKw 설비 최대 용량 (kW)
 */
export function estimateSolar(sky: number, hour: number, maxKw: number): number {
  if (hour < 6 || hour > 18) return 0;
  const skyFactor = sky === 1 ? 1.0 : sky === 3 ? 0.5 : 0.15;
  const curve = Math.sin((Math.PI * (hour - 6)) / 12);
  return Math.max(0, +(maxKw * skyFactor * curve).toFixed(1));
}
