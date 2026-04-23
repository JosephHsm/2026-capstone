// =====================================================================
// [추후 백엔드 연동 시 사용할 API 서비스 코드 모음]
// 위치: src/app/services/api.ts (새로 생성 예정)
// 패키지 설치 필요: npm install axios
// =====================================================================

/*
import axios from 'axios';

// 백엔드 서버 주소 (환경 변수로 관리하는 것을 권장합니다)
const API_BASE_URL = 'http://localhost:8000/api';

// Axios 기본 인스턴스 설정
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 5000,
});

export const api = {
  // 1. 전체 충전소 실시간 상태 목록 가져오기 (GET)
  getStations: async () => {
    const response = await apiClient.get('/stations');
    return response.data; // 백엔드에서 mockStations와 동일한 타입의 배열을 반환해야 함
  },

  // 2. 실시간 기상 데이터 가져오기 (GET)
  getWeather: async () => {
    const response = await apiClient.get('/weather/current');
    return response.data;
  },

  // 3. AI 최적화 메트릭 가져오기 (GET)
  getAIMetrics: async () => {
    const response = await apiClient.get('/ai/metrics');
    return response.data;
  },

  // 4. 충전소 긴급 정지 제어 (POST - 관리자 콘솔용)
  stopStation: async (stationId: string) => {
    const response = await apiClient.post(`/stations/${stationId}/emergency-stop`);
    return response.data;
  },

  // 5. 충전소 재시작 제어 (POST - 관리자 콘솔용)
  restartStation: async (stationId: string) => {
    const response = await apiClient.post(`/stations/${stationId}/restart`);
    return response.data;
  }
};

// =====================================================================
// [실시간 데이터 통신을 위한 WebSocket 연결 유틸리티]
// 충전소 데이터는 실시간으로 변하므로 HTTP GET 폴링 대신 웹소켓을 쓰면 좋습니다.
// =====================================================================

export const subscribeToRealtimeStations = (onUpdate: (data: any) => void) => {
  const ws = new WebSocket('ws://localhost:8000/ws/stations');

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onUpdate(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket Error:', error);
  };

  // 컴포넌트 언마운트 시 소켓 정리를 위한 함수 반환
  return () => {
    if (ws.readyState === 1) { // OPEN
      ws.close();
    }
  };
};
*/