// Mock data service simulating FastAPI backend responses

export interface ChargingStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'active' | 'warning' | 'error' | 'offline';
  currentVehicles: number;
  maxCapacity: number;
  batteryLevel: number;
  solarGeneration: number;
  gridConsumption: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  cloudCover: number;
  solarRadiation: number;
  timestamp: string;
}

export interface AIMetrics {
  costSavings: number;
  essLifetimePenalty: number;
  peakPowerPenalty: number;
  rewardScore: number;
}

export interface PowerSchedule {
  time: string;
  charging: number;
  discharging: number;
  gridImport: number;
  solarGeneration: number;
}

export interface CostComparison {
  period: string;
  beforeAI: number;
  afterAI: number;
}

// Mock charging stations in Seoul area
export const mockStations: ChargingStation[] = [
  {
    id: 'CS001',
    name: '강남 충전소',
    lat: 37.4979,
    lng: 127.0276,
    status: 'active',
    currentVehicles: 8,
    maxCapacity: 12,
    batteryLevel: 85,
    solarGeneration: 45.2,
    gridConsumption: 120.5,
  },
  {
    id: 'CS002',
    name: '여의도 충전소',
    lat: 37.5219,
    lng: 126.9245,
    status: 'active',
    currentVehicles: 15,
    maxCapacity: 20,
    batteryLevel: 62,
    solarGeneration: 38.7,
    gridConsumption: 185.3,
  },
  {
    id: 'CS003',
    name: '잠실 충전소',
    lat: 37.5133,
    lng: 127.1028,
    status: 'warning',
    currentVehicles: 18,
    maxCapacity: 20,
    batteryLevel: 45,
    solarGeneration: 42.1,
    gridConsumption: 198.7,
  },
  {
    id: 'CS004',
    name: '홍대 충전소',
    lat: 37.5563,
    lng: 126.9241,
    status: 'active',
    currentVehicles: 6,
    maxCapacity: 10,
    batteryLevel: 91,
    solarGeneration: 32.5,
    gridConsumption: 89.2,
  },
  {
    id: 'CS005',
    name: '판교 충전소',
    lat: 37.3943,
    lng: 127.1110,
    status: 'error',
    currentVehicles: 3,
    maxCapacity: 15,
    batteryLevel: 25,
    solarGeneration: 15.8,
    gridConsumption: 45.6,
  },
];
let currentWeaterState = { temp: 22.5, hum: 45, cloud: 30, solar: 450 };
// Generate weather data
export const generateWeatherData = (): WeatherData => {
  // 5초마다 미세하게 값 변동
  currentWeaterState.temp += (Math.random() - 0.5) * 0.5;
  currentWeaterState.hum += (Math.random() - 0.5) * 2;
  currentWeaterState.cloud += (Math.random() - 0.5) * 5;
  currentWeaterState.solar += (Math.random() - 0.5) * 20;

  // 값 범위 제한
  currentWeaterState.hum = Math.max(0, Math.min(100, currentWeaterState.hum));
  currentWeaterState.cloud = Math.max(0, Math.min(100, currentWeaterState.cloud));
  currentWeaterState.solar = Math.max(0, currentWeaterState.solar);

  return {
    temperature: currentWeaterState.temp,
    humidity: currentWeaterState.hum,
    cloudCover: currentWeaterState.cloud,
    solarRadiation: currentWeaterState.solar,
    timestamp: new Date().toISOString(),
  };
};

// Generate AI metrics
export const generateAIMetrics = (): AIMetrics => ({
  costSavings: 12500000 + Math.random() * 2000000,
  essLifetimePenalty: 150000 + Math.random() * 50000,
  peakPowerPenalty: 80000 + Math.random() * 30000,
  rewardScore: 0.85 + Math.random() * 0.1,
});

// Generate power schedule for 24 hours
export const generatePowerSchedule = (): PowerSchedule[] => {
  const schedule: PowerSchedule[] = [];
  for (let hour = 0; hour < 24; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00`;
    const isMorning = hour >= 6 && hour < 12;
    const isAfternoon = hour >= 12 && hour < 18;
    const isPeak = hour >= 10 && hour < 14;
    
    schedule.push({
      time,
      charging: isPeak ? 0 : 50 + Math.random() * 100,
      discharging: isPeak ? 80 + Math.random() * 120 : 0,
      gridImport: isPeak ? 20 + Math.random() * 40 : 100 + Math.random() * 150,
      solarGeneration: (isMorning || isAfternoon) ? 30 + Math.random() * 70 : 0,
    });
  }
  return schedule;
};

// Generate cost comparison data
export const generateCostComparison = (): CostComparison[] => {
  const months = ['1월', '2월', '3월', '4월', '5월', '6월'];
  return months.map(period => ({
    period,
    beforeAI: 15000000 + Math.random() * 5000000,
    afterAI: 8000000 + Math.random() * 3000000,
  }));
};

// 현재 시간 기준 향후 24시간의 전력 예측 데이터 생성 (실제 소비 제외)
export const generateHourlyPowerData = () => {
  const currentHour = new Date().getHours();

  return Array.from({ length: 24 }, (_, i) => {
    const targetHour = (currentHour + i) % 24;
    const timeLabel = `${targetHour.toString().padStart(2, '0')}:00`;

    // 시간대별 패턴 (낮 시간대, 피크 시간대 반영)
    const isDaytime = targetHour >= 7 && targetHour <= 18;
    const isPeak = targetHour >= 10 && targetHour <= 16;

    // 실시간으로 변동하는 느낌을 주기 위한 랜덤 값 추가
    const noise = Math.random() * 15;

    // 예상 발전량 (낮에만 발전)
    const predictedSolar = isDaytime ? 40 + noise + (isPeak ? 30 : 0) : 0;

    // 예상 수요 (활동 시간에 증가)
    const predictedDemand = 80 + noise + (targetHour >= 8 && targetHour <= 22 ? 50 : 0) + (isPeak ? 40 : 0);

    return {
      time: timeLabel,
      predictedDemand: Math.round(predictedDemand),
      predictedSolar: Math.round(predictedSolar),
    };
  });
};

// Generate daily statistics for a month
export const generateDailyStats = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `3/${i + 1}`,
    consumption: 1800 + Math.random() * 400,
    charging: 1200 + Math.random() * 300,
    solar: 400 + Math.random() * 200,
  }));
};

// Simulate real-time updates
export const createRealtimeSubscription = (
  onUpdate: (data: ChargingStation[]) => void
) => {
  const interval = setInterval(() => {
    const updatedStations = mockStations.map(station => ({
      ...station,
      currentVehicles: Math.min(
        station.maxCapacity,
        Math.max(0, station.currentVehicles + Math.floor(Math.random() * 3 - 1))
      ),
      batteryLevel: Math.min(100, Math.max(0, station.batteryLevel + Math.random() * 10 - 5)),
      solarGeneration: Math.max(0, station.solarGeneration + Math.random() * 10 - 5),
      gridConsumption: Math.max(0, station.gridConsumption + Math.random() * 20 - 10),
    }));
    onUpdate(updatedStations);
  }, 3000);

  return () => clearInterval(interval);
};
