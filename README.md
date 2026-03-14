# EV 충전소 관제 시스템 (EV Charging Station Management System)

전기차 충전소간 에너지 흐름 관리 및 비용 최적화를 위한 B2B 관리자용 관제 시스템입니다.

## 🎯 주요 기능

### 1. 통합 대시보드
- 실시간 충전소 상태 모니터링
- 전체 시스템 핵심 지표 표시
- 24시간 전력 소비 및 수요 예측 차트
- 기상 정보 및 AI 최적화 성과 요약

### 2. 지도 뷰 (카카오 맵 연동)
- 충전소 지리적 위치 시각화
- 실시간 상태별 마커 표시 (정상/경고/오류)
- 충전소 클릭 시 상세 정보 팝업
- ESS 잔량, 충전 현황, 발전량 실시간 표시

### 3. 에너지 모니터링
- 실시간 기상 데이터 (기온, 습도, 운량, 일사량)
- 태양광 발전량 예측 vs 실제 비교
- 에너지원별 구성 분석 (태양광/계통전력/ESS)
- 충전소별 태양광 발전 현황
- 환경 기여도 계산 (CO₂ 저감량, 재생에너지 발전량)

### 4. AI 최적화
- 강화학습 보상 함수 지표 대시보드
- 비용 절감액, ESS 수명 페널티, 피크 초과 페널티 모니터링
- 24시간 ESS 충·방전 스케줄 타임라인
- 30일 보상 점수 추이
- AI 의사결정 분포 분석
- 강화학습 모델 정보 (DQN, 보상 함수, 학습 파라미터)

### 5. 통계 및 리포트
- AI 도입 전/후 비용 비교
- 비용 구성 내역 (기본요금, 전력량요금, 피크요금)
- 일별/월별 전력 소비 추이
- 시간대별 전력 사용 패턴
- 운영 효율성 지표 (재생에너지 사용률, ESS 활용률, 피크 회피율)
- 다중 필터 검색 (기간별, 충전소별)

### 6. 관리자 콘솔
- AI 자동 제어 활성화/비활성화
- AI 제어 명령 이력 조회
- 수동 제어 패널 (ESS 충전/방전, 일시정지, 긴급정지)
- 전력 제한 설정
- 충전소별 개별 제어
- 시스템 상태 및 알림 모니터링

## 🛠️ 기술 스택

### Frontend
- **React 18.3.1** - UI 프레임워크
- **React Router 7** - 다중 페이지 라우팅 (Data Mode)
- **TanStack Query** - 서버 상태 관리 및 데이터 캐싱
- **Recharts** - 차트 및 데이터 시각화
- **Tailwind CSS v4** - 스타일링
- **Lucide React** - 아이콘
- **Shadcn/ui** - UI 컴포넌트 라이브러리
- **Sonner** - Toast 알림

### Backend Integration (Mock)
- REST API 시뮬레이션
- WebSocket 실시간 데이터 업데이트 시뮬레이션
- TanStack Query를 통한 자동 리페치 (5초 간격)

### External APIs
- **Kakao Maps API** - 지도 및 위치 시각화
- **기상청 API** (Mock) - 기상 데이터

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
# 또는
pnpm install
```

### 2. Kakao Maps API 키 설정

#### 2.1 Kakao Developers에서 API 키 발급
1. [Kakao Developers](https://developers.kakao.com/)에 접속
2. 내 애플리케이션 > 애플리케이션 추가하기
3. 앱 설정 > 플랫폼 > Web 플랫폼 등록
4. 사이트 도메인 등록 (개발: `http://localhost:5173`)
5. JavaScript 키 복사

#### 2.2 API 키 적용
`/src/app/pages/MapView.tsx` 파일에서 다음 라인을 수정:

```typescript
// 현재 (38번째 줄)
script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false`;

// 수정 후
script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_ACTUAL_API_KEY&autoload=false`;
```

### 3. 개발 서버 실행
```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 `http://localhost:5173` 접속

### 4. 빌드
```bash
npm run build
# 또는
pnpm build
```

## 📊 데이터 파이프라인

### Frontend Data Flow
```
IoT 센서 → FastAPI 백엔드 → REST API / WebSocket
                ↓
        TanStack Query (캐싱 및 상태 관리)
                ↓
        React Components (Recharts, Kakao Map)
                ↓
        실시간 UI 업데이트
```

### 현재 구현 (Mock Data)
- `/src/app/services/mockData.ts`에서 백엔드 응답 시뮬레이션
- TanStack Query의 `refetchInterval`로 실시간 업데이트 구현 (5초)
- WebSocket 시뮬레이션을 위한 `createRealtimeSubscription` 함수

### 실제 백엔드 연동 시
1. `/src/app/services/mockData.ts`의 함수들을 실제 API 호출로 교체
2. WebSocket 클라이언트 연결 추가
3. TanStack Query의 `queryFn`에서 실제 엔드포인트 호출

예시:
```typescript
// Mock (현재)
const { data } = useQuery({
  queryKey: ["stations"],
  queryFn: () => Promise.resolve(mockStations),
});

// 실제 API (연동 후)
const { data } = useQuery({
  queryKey: ["stations"],
  queryFn: async () => {
    const response = await fetch('/api/v1/stations');
    return response.json();
  },
});
```

## 🗺️ 페이지 구조

```
/ (DashboardLayout)
├── / (Dashboard) - 통합 대시보드
├── /map (MapView) - 지도 뷰
├── /energy (EnergyMonitoring) - 에너지 모니터링
├── /ai (AIOptimization) - AI 최적화
├── /statistics (Statistics) - 통계 및 리포트
└── /admin (AdminConsole) - 관리자 콘솔
```

## 🎨 UI/UX 특징

### 반응형 디자인
- 모바일, 태블릿, 데스크톱 대응
- 사이드바 네비게이션 (모바일에서는 햄버거 메뉴)

### 실시간 업데이트
- TanStack Query의 자동 리페치 (5초 간격)
- 데이터 캐싱으로 효율적인 네트워크 사용

### 인터랙티브 차트
- Recharts를 활용한 다양한 차트 타입
- 호버 시 상세 정보 표시 (Tooltip)
- 범례를 통한 데이터 필터링

### 직관적인 색상 코딩
- 🟢 녹색: 정상 상태, 긍정적 지표
- 🟡 노란색: 경고, 주의 필요
- 🔴 빨간색: 오류, 위험 상태
- 🔵 파란색: 정보, 중립적 지표

## 🔐 보안 고려사항

### API 키 관리
- 프로덕션 환경에서는 환경 변수 사용 권장
- `.env` 파일에 API 키 저장 후 `.gitignore`에 추가

### 권한 관리
- 관리자 콘솔의 제어 기능은 권한 검증 필요
- 긴급 정지 등 중요 작업은 확인 다이얼로그 표시

## 📈 성능 최적화

### 데이터 캐싱
- TanStack Query의 `staleTime: 3000ms` 설정
- 불필요한 API 호출 최소화

### 컴포넌트 최적화
- React.memo 사용 가능
- useMemo, useCallback으로 리렌더링 최적화

### 차트 렌더링
- ResponsiveContainer로 반응형 차트 구현
- 데이터 포인트 수 제한 (24시간/30일)

## 🚀 향후 개선사항

### 백엔드 연동
- [ ] FastAPI 엔드포인트 연동
- [ ] WebSocket 실시간 통신 구현
- [ ] 인증 및 권한 관리 추가

### 기능 확장
- [ ] 알림 시스템 구현
- [ ] 이메일/SMS 알림 연동
- [ ] 데이터 내보내기 (Excel, PDF)
- [ ] 사용자 설정 저장
- [ ] 대시보드 커스터마이징

### 분석 기능
- [ ] 예측 모델 시각화 개선
- [ ] 머신러닝 모델 성능 추적
- [ ] A/B 테스트 결과 분석

## 📝 라이센스

이 프로젝트는 상용 B2B 시스템으로 개발되었습니다.

## 🤝 기여

프로젝트 관련 문의나 개선 사항은 개발팀에 문의해주세요.

---

**개발자**: Figma Make AI Assistant  
**최종 업데이트**: 2026년 3월 14일
