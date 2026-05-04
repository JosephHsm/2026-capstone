// =====================================================================
// 백엔드 API 서비스 (Spring Boot, port 8080)
// 로컬 개발: Vite proxy가 /api, /sse, /schedule → http://localhost:8080 으로 포워딩
// =====================================================================

// ---- MQTT 백엔드 타입 (백엔드 DTO와 1:1 매핑) -------------------------
// 주의: Jackson @JsonProperty 기준 직렬화 키명을 사용해야 함

export interface MqttHeader {
  station_id: number;
  is_physical: boolean;
  timestamp: string;
  day_idx: number;
  step: number;
}

export interface MqttChargerStatus {
  charger_id: number;
  has_demand: boolean;   // @JsonProperty("has_demand") → JSON 키는 has_demand
}

export interface MqttPowerMetrics {
  p_pv: number;
  p_load: number;
  p_ess: number;
  p_grid: number;
  p_tr: number;
}

export interface MqttStateOfCharge {
  mode: string;
  soc: number;
  capacity_wh: number;
}

export interface MqttStationPayload {
  charger_status: MqttChargerStatus[];
  power_metrics_w: MqttPowerMetrics;
  state_of_charge: MqttStateOfCharge;
}

export interface MqttStationStatus {
  is_active: boolean;    // @JsonProperty("is_active") → JSON 키는 is_active
  error_code: number;
}

export interface MqttStation {
  header: MqttHeader;
  payload: MqttStationPayload;
  status: MqttStationStatus;
}

export interface MqttTelemetry {
  stations: MqttStation[];
}

// ---- 프론트엔드 도메인 타입 -------------------------------------------

export interface ChargingStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'active' | 'warning' | 'error' | 'offline';
  currentVehicles: number;
  maxCapacity: number;
  batteryLevel: number;   // %
  solarGeneration: number; // kW
  gridConsumption: number; // kW
  essMode?: string;
  pLoad?: number;          // kW
  pEss?: number;           // kW
}

// 스테이션 ID → 이름/좌표 매핑 (실제 설치 위치로 교체하세요)
const STATION_META: Record<number, { name: string; lat: number; lng: number }> = {
  0: { name: '강남 충전소',  lat: 37.4979, lng: 127.0276 },
  1: { name: '여의도 충전소', lat: 37.5219, lng: 126.9245 },
  2: { name: '잠실 충전소',  lat: 37.5133, lng: 127.1028 },
  3: { name: '홍대 충전소',  lat: 37.5563, lng: 126.9241 },
  4: { name: '판교 충전소',  lat: 37.3943, lng: 127.1110 },
};

/** MQTT 스테이션 데이터 → 프론트엔드 ChargingStation 변환 */
export function mqttToStation(s: MqttStation): ChargingStation {
  const id = s.header.station_id;
  const meta = STATION_META[id] ?? {name: `충전소 ${id}`, lat: 37.5, lng: 127.0};
  const chargers = s.payload?.charger_status ?? [];
  const power = s.payload?.power_metrics_w;
  const soc = s.payload?.state_of_charge;

  const statusCode = s.status?.error_code ?? 0;
  const isActive = s.status?.is_active ?? false;
  const stationStatus: ChargingStation['status'] = !isActive
      ? 'offline'
      : statusCode > 0
          ? 'warning'
          : 'active';

  return {
    id: String(id),
    name: meta.name,
    lat: meta.lat,
    lng: meta.lng,
    status: stationStatus,
    currentVehicles: chargers.filter(c => c.has_demand).length,
    maxCapacity: chargers.length,
    batteryLevel: (soc?.soc ?? 0) * 100,
    solarGeneration: (power?.p_pv ?? 0) / 1000,
    gridConsumption: Math.max(0, power?.p_grid ?? 0) / 1000,
    essMode: soc?.mode,
    pLoad: (power?.p_load ?? 0) / 1000,
    pEss: (power?.p_ess ?? 0) / 1000,
  };
}
export interface HourlyPlan {
  hour: number;
  essMode: string;
  essPower: number;
  gridUsage: number;
  pvPriority: number;
  transfer: { targetStationId: number; power: number }[];
}

export interface StationSchedule {
  stationId: number;
  stationName: string;
  hourlyPlan: HourlyPlan[];
}

export interface DailyStats {
  date: string;
  solar: number;
  consumption: number;
  grid: number;
  avgSoc: number;
  peakDemand: number;
}

export interface ScheduleResponse {
  requestId: string;
  targetDate: string;
  createdAt: string;
  status: string;
  stations: StationSchedule[];
}

export interface ScheduleHistoryItem {
  requestId: string;
  targetDate: string;
  createdAt: string;
  status: string;
}

// ---- REST API 함수 ---------------------------------------------------

/** 최신 텔레메트리 1회 조회 (SSE 연결 전 초기값용) */
export async function fetchLatestTelemetry(): Promise<MqttTelemetry | null> {
  const res = await fetch('/api/telemetry/latest');
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`텔레메트리 조회 실패: ${res.status}`);
  return res.json();
}

/** 오늘 AI 스케줄 조회 */
export async function fetchTodaySchedule(): Promise<ScheduleResponse | null> {
  const res = await fetch('/api/schedule/today');
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`스케줄 조회 실패: ${res.status}`);
  return res.json();
}

/** 내일 AI 스케줄 조회 */
export async function fetchTomorrowSchedule(): Promise<ScheduleResponse | null> {
  const res = await fetch('/api/schedule/tomorrow');
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`스케줄 조회 실패: ${res.status}`);
  return res.json();
}

/** 특정 날짜 스케줄 조회 */
export async function fetchScheduleByDate(date: string): Promise<ScheduleResponse | null> {
  const res = await fetch(`/api/schedule/date/${date}`);
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`스케줄 조회 실패: ${res.status}`);
  return res.json();
}

/** 최근 스케줄 실행 이력 조회 (최대 10건) */
export async function fetchScheduleHistory(): Promise<ScheduleHistoryItem[]> {
  const res = await fetch('/api/schedule/history');
  if (!res.ok) throw new Error(`이력 조회 실패: ${res.status}`);
  return res.json();
}

/** 최근 N일 일별 통계 조회 */
export async function fetchDailyStats(days = 30): Promise<DailyStats[]> {
  const res = await fetch(`/api/stats/daily?days=${days}`);
  if (!res.ok) throw new Error(`통계 조회 실패: ${res.status}`);
  return res.json();
}

/** 현재 실시간 텔레메트리 기반 AI 스케줄 즉시 실행 및 결과 저장 */
export async function triggerScheduleRunNow(): Promise<boolean> {
  const res = await fetch('/ai/request', { method: 'POST' });
  if (res.status === 204) return false;
  if (!res.ok) throw new Error(`스케줄 실행 실패: ${res.status}`);
  return true;
}

/** AI 서버로 전송할 Raw 요청 JSON 미리보기 (전송하지 않음) */
export async function fetchAiRequestPreview(): Promise<Record<string, unknown>> {
  const res = await fetch('/ai/v2/preview');
  if (!res.ok) throw new Error(`AI 요청 미리보기 실패: ${res.status}`);
  return res.json();
}

/** Raw 데이터를 AI 서버에 직접 전송 (응답은 AI 서버가 /ai/result로 콜백) */
export async function sendRawAiRequest(): Promise<string> {
  const res = await fetch('/ai/v2/send', { method: 'POST' });
  if (!res.ok) throw new Error(`AI 서버 전송 실패: ${res.status}`);
  return res.text();
}

// ---- SSE 실시간 구독 ---------------------------------------------------

/**
 * 백엔드 SSE 스트림 구독
 * @param onData  텔레메트리 수신 콜백
 * @returns       구독 해제 함수 (컴포넌트 cleanup에서 호출)
 */
export function subscribeToTelemetry(
  onData: (stations: ChargingStation[]) => void
): () => void {
  const es = new EventSource('/sse/telemetry');

  es.addEventListener('telemetry', (event: MessageEvent) => {
    try {
      const telemetry: MqttTelemetry = JSON.parse(event.data);
      if (telemetry.stations) {
        onData(telemetry.stations.map(mqttToStation));
      }
    } catch (e) {
      console.error('[SSE] 파싱 오류:', e);
    }
  });

  es.onerror = (e) => {
    console.error('[SSE] 연결 오류:', e);
  };

  return () => es.close();
}
