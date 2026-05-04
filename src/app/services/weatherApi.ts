// 기상청 apihub - 동네예보 VilageFcstInfoService_2.0
// 초단기실황(getUltraSrtNcst): 현재 기온·습도·풍속 (정시 기준, 1시간 딜레이)
// 단기예보(getVilageFcst): 시간별 예보 (3일치)

const KMA_BASE = '/kma/api/typ02/openApi/VilageFcstInfoService_2.0';
const AUTH_KEY = import.meta.env.VITE_KMA_FORECAST_KEY ?? '';
const NX = 61;  // 강남구 격자 X (백엔드와 동일)
const NY = 125; // 강남구 격자 Y

// ---- 공개 타입 (Dashboard.tsx 인터페이스 유지) --------------------------

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipType: number;  // PTY: 0=없음 1=비 2=비/눈 3=눈 4=소나기
  skyCondition: number; // SKY: 1=맑음 3=구름많음 4=흐림
  observedAt: string;
}

export interface ForecastHour {
  time: string;   // "HH:00"
  date: string;   // "YYYYMMDD"
  tmp: number;
  reh: number;
  sky: number;
  pop: number;
  pty: number;
  wsd: number;
}

// ---- 날짜/시간 헬퍼 -----------------------------------------------------

function fmt8(d: Date): string {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

// 초단기실황 base_time: 정시 기준, 1시간 딜레이 고려
function buildNcstTime(): { base_date: string; base_time: string } {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() - 1);
  return {
    base_date: fmt8(d),
    base_time: `${String(d.getHours()).padStart(2, '0')}00`,
  };
}

// 단기예보 base_time: 02,05,08,11,14,17,20,23시 발표 + 10분 후 조회 가능
function buildFcstTime(): { base_date: string; base_time: string } {
  const now = new Date();
  const totalMin = now.getHours() * 60 + now.getMinutes();
  const slots = [2, 5, 8, 11, 14, 17, 20, 23];

  let baseHour = 23;
  let usePrevDay = true;

  for (const h of slots) {
    if (totalMin >= h * 60 + 10) {
      baseHour = h;
      usePrevDay = false;
    }
  }

  const d = new Date(now);
  if (usePrevDay) d.setDate(d.getDate() - 1);

  return {
    base_date: fmt8(d),
    base_time: `${String(baseHour).padStart(2, '0')}00`,
  };
}

// ---- API 함수 -----------------------------------------------------------

/** 초단기실황 — 현재 기온·습도·풍속 (오늘 데이터) */
export async function fetchCurrentWeather(): Promise<CurrentWeather> {
  const { base_date, base_time } = buildNcstTime();
  const sp = new URLSearchParams({
    pageNo: '1', numOfRows: '100', dataType: 'JSON',
    base_date, base_time,
    nx: String(NX), ny: String(NY),
    authKey: AUTH_KEY,
  });

  const res = await fetch(`${KMA_BASE}/getUltraSrtNcst?${sp}`);
  if (!res.ok) throw new Error(`초단기실황 API 오류 ${res.status}`);

  const json = await res.json();
  const header = json.response?.header;
  if (header?.resultCode !== '00') throw new Error(`기상청: ${header?.resultMsg}`);

  const items: { category: string; obsrValue: string }[] =
    json.response.body.items.item ?? [];

  const get = (cat: string) =>
    parseFloat(items.find(i => i.category === cat)?.obsrValue ?? '0') || 0;

  const pty = get('PTY');
  return {
    temperature: get('T1H'),
    humidity: get('REH'),
    windSpeed: get('WSD'),
    precipType: pty,
    skyCondition: pty > 0 ? 4 : 1,
    observedAt: `${base_date.slice(0, 4)}-${base_date.slice(4, 6)}-${base_date.slice(6, 8)} ${base_time.slice(0, 2)}:00`,
  };
}

/** 단기예보 — 향후 24시간 시간별 예보 */
export async function fetchWeatherForecast(): Promise<ForecastHour[]> {
  const { base_date, base_time } = buildFcstTime();
  const sp = new URLSearchParams({
    pageNo: '1', numOfRows: '1000', dataType: 'JSON',
    base_date, base_time,
    nx: String(NX), ny: String(NY),
    authKey: AUTH_KEY,
  });

  const res = await fetch(`${KMA_BASE}/getVilageFcst?${sp}`);
  if (!res.ok) throw new Error(`단기예보 API 오류 ${res.status}`);

  const json = await res.json();
  const header = json.response?.header;
  if (header?.resultCode !== '00') throw new Error(`기상청: ${header?.resultMsg}`);

  const items: { fcstDate: string; fcstTime: string; category: string; fcstValue: string }[] =
    json.response.body.items.item ?? [];

  // (fcstDate, fcstTime) 기준으로 pivot
  const pivot = new Map<string, Record<string, string>>();
  for (const item of items) {
    const key = `${item.fcstDate}_${item.fcstTime}`;
    if (!pivot.has(key)) pivot.set(key, { date: item.fcstDate, time: item.fcstTime });
    pivot.get(key)![item.category] = item.fcstValue;
  }

  return Array.from(pivot.values())
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 24)
    .map(slot => ({
      date: slot.date,
      time: `${slot.time.slice(0, 2)}:00`,
      tmp: parseFloat(slot.TMP ?? '0') || 0,
      reh: parseFloat(slot.REH ?? '0') || 0,
      sky: parseInt(slot.SKY ?? '1') || 1,
      pop: parseFloat(slot.POP ?? '0') || 0,
      pty: parseInt(slot.PTY ?? '0') || 0,
      wsd: parseFloat(slot.WSD ?? '0') || 0,
    }));
}

// ---- 변환 헬퍼 (Dashboard.tsx에서 사용) ---------------------------------

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

export function estimateSolar(sky: number, hour: number, maxKw: number): number {
  if (hour < 6 || hour > 18) return 0;
  const skyFactor = sky === 1 ? 1.0 : sky === 3 ? 0.5 : 0.15;
  const curve = Math.sin((Math.PI * (hour - 6)) / 12);
  return Math.max(0, +(maxKw * skyFactor * curve).toFixed(1));
}
