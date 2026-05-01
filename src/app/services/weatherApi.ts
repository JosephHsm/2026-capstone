// 기상청 API허브 동네예보 서비스 (예특보 seqApi=10)
// 초단기실황(getUltraSrtNcst) + 초단기예보(getUltraSrtFcst) + 단기예보(getVilageFcst)
// 서울 중구 격자 좌표: nx=60, ny=127

const KMA_BASE = '/kma/api/typ02/openApi/VilageFcstInfoService_2.0';
const AUTH_KEY = import.meta.env.VITE_KMA_API_KEY ?? '';
const NX = 60;
const NY = 127;

// ---- 내부 타입 ----------------------------------------------------------

interface KmaItem {
  baseDate?: string;
  baseTime?: string;
  fcstDate?: string;
  fcstTime?: string;
  category: string;
  obsrValue?: string;
  fcstValue?: string;
}

interface KmaApiResponse {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: { items: { item: KmaItem[] }; totalCount: number };
  };
}

// ---- 공개 타입 ----------------------------------------------------------

export interface CurrentWeather {
  temperature: number;   // T1H: 현재 기온 (°C)
  humidity: number;      // REH: 현재 상대습도 (%)
  windSpeed: number;     // WSD: 풍속 (m/s)
  precipType: number;    // PTY: 0=없음 1=비 2=비/눈 3=눈 4=소나기
  skyCondition: number;  // SKY(초단기예보 첫 값): 1=맑음 3=구름많음 4=흐림
  observedAt: string;    // "YYYY-MM-DD HH:00" (KST)
}

export interface ForecastHour {
  time: string;   // "HH:00"
  date: string;   // "YYYYMMDD"
  tmp: number;    // TMP: 기온 (°C)
  reh: number;    // REH: 습도 (%)
  sky: number;    // SKY: 1/3/4
  pop: number;    // POP: 강수확률 (%)
  pty: number;    // PTY: 강수형태
  wsd: number;    // WSD: 풍속 (m/s)
}

// ---- 발표 시각 계산 헬퍼 ------------------------------------------------

// 초단기실황(getUltraSrtNcst): 매 정시 발표, 10분 후 공개
function getNcstBase(): { base_date: string; base_time: string } {
  const now = new Date();
  let h = now.getHours();
  if (now.getMinutes() < 10) h -= 1;
  if (h < 0) { h = 23; now.setDate(now.getDate() - 1); }
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return { base_date: `${y}${m}${d}`, base_time: `${String(h).padStart(2, '0')}00` };
}

// 초단기예보(getUltraSrtFcst): 매 정시 발표, 45분 후 공개
function getFcstSrtBase(): { base_date: string; base_time: string } {
  const now = new Date();
  let h = now.getHours();
  if (now.getMinutes() < 45) h -= 1;
  if (h < 0) { h = 23; now.setDate(now.getDate() - 1); }
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return { base_date: `${y}${m}${d}`, base_time: `${String(h).padStart(2, '0')}00` };
}

// 단기예보: 0200/0500/0800/1100/1400/1700/2000/2300 발표, 10분 후 공개
function getVilageBase(): { base_date: string; base_time: string } {
  const HOURS = [2, 5, 8, 11, 14, 17, 20, 23];
  const now = new Date();
  const h = now.getHours();
  const min = now.getMinutes();
  let baseH = -1;
  for (let i = HOURS.length - 1; i >= 0; i--) {
    if (h > HOURS[i] || (h === HOURS[i] && min >= 10)) { baseH = HOURS[i]; break; }
  }
  const base = new Date(now);
  if (baseH === -1) { base.setDate(base.getDate() - 1); baseH = 23; }
  const y = base.getFullYear();
  const mo = String(base.getMonth() + 1).padStart(2, '0');
  const da = String(base.getDate()).padStart(2, '0');
  return { base_date: `${y}${mo}${da}`, base_time: `${String(baseH).padStart(2, '0')}00` };
}

// ---- API 요청 공통 함수 -------------------------------------------------

async function kmaGet(
  endpoint: string,
  extra: Record<string, string>,
): Promise<KmaApiResponse> {
  const sp = new URLSearchParams({
    dataType: 'JSON',
    numOfRows: '1000',
    pageNo: '1',
    nx: String(NX),
    ny: String(NY),
    authKey: AUTH_KEY,
    ...extra,
  });
  const res = await fetch(`${KMA_BASE}/${endpoint}?${sp}`);
  if (!res.ok) throw new Error(`기상청 API 오류 ${res.status}`);
  const json = (await res.json()) as KmaApiResponse;
  if (json.response.header.resultCode !== '00') {
    throw new Error(`기상청: ${json.response.header.resultMsg}`);
  }
  return json;
}

// ---- 공개 API 함수 ------------------------------------------------------

/**
 * 실시간 날씨 반환
 * - 기온·습도·풍속·강수형태: 초단기실황 getUltraSrtNcst (10분 후 공개)
 * - 하늘상태: 초단기예보 getUltraSrtFcst (45분 후 공개, 실패 시 맑음 기본값)
 */
export async function fetchCurrentWeather(): Promise<CurrentWeather> {
  const ncstBase = getNcstBase();

  // 초단기실황: 기온(T1H), 습도(REH), 풍속(WSD), 강수형태(PTY)
  const ncst = await kmaGet('getUltraSrtNcst', ncstBase);
  const ncstItems = ncst.response.body.items.item;
  const get = (cat: string) =>
    parseFloat(ncstItems.find((i) => i.category === cat)?.obsrValue ?? '0');

  // 초단기예보: 하늘상태(SKY) — 45분 임계값, 실패 시 기본값 1(맑음)
  let sky = 1;
  try {
    const fcstBase = getFcstSrtBase();
    const fcst = await kmaGet('getUltraSrtFcst', fcstBase);
    const skyRaw = fcst.response.body.items.item.find((i) => i.category === 'SKY')?.fcstValue;
    if (skyRaw) sky = parseInt(skyRaw);
  } catch {
    // 미발표 시간대이거나 오류 시 기본값 유지
  }

  const dd = ncstBase.base_date;
  return {
    temperature: get('T1H'),
    humidity: get('REH'),
    windSpeed: get('WSD'),
    precipType: get('PTY'),
    skyCondition: sky,
    observedAt: `${dd.slice(0, 4)}-${dd.slice(4, 6)}-${dd.slice(6)} ${ncstBase.base_time.slice(0, 2)}:00`,
  };
}

/** 단기예보 24시간 시간별 데이터 반환 (기온·습도·하늘상태·강수확률·풍속) */
export async function fetchWeatherForecast(): Promise<ForecastHour[]> {
  const base = getVilageBase();
  const res = await kmaGet('getVilageFcst', base);
  const items = res.response.body.items.item;

  const map = new Map<string, ForecastHour>();
  for (const item of items) {
    if (!item.fcstDate || !item.fcstTime) continue;
    const key = `${item.fcstDate}-${item.fcstTime}`;
    if (!map.has(key)) {
      map.set(key, {
        date: item.fcstDate,
        time: `${item.fcstTime.slice(0, 2)}:00`,
        tmp: 0,
        reh: 0,
        sky: 1,
        pop: 0,
        pty: 0,
        wsd: 0,
      });
    }
    const e = map.get(key)!;
    const v = parseFloat(item.fcstValue ?? '0');
    switch (item.category) {
      case 'TMP': e.tmp = v; break;
      case 'REH': e.reh = v; break;
      case 'SKY': e.sky = v; break;
      case 'POP': e.pop = v; break;
      case 'PTY': e.pty = v; break;
      case 'WSD': e.wsd = v; break;
    }
  }

  // 현재 시각 이후 24개만 반환
  const now = new Date();
  const todayStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const curH = now.getHours();

  return Array.from(map.values())
    .filter((f) => {
      if (f.date > todayStr) return true;
      if (f.date === todayStr) return parseInt(f.time) >= curH;
      return false;
    })
    .slice(0, 24);
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
  // 06~18시 사인 곡선 (정오 피크)
  const curve = Math.sin((Math.PI * (hour - 6)) / 12);
  return Math.max(0, +(maxKw * skyFactor * curve).toFixed(1));
}
