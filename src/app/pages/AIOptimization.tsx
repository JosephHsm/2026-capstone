import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { generatePowerSchedule } from "../services/mockData";
import { Brain, TrendingDown, Award, BatteryCharging, Loader2, CalendarDays } from "lucide-react";
import {
  fetchTodaySchedule,
  fetchTomorrowSchedule,
  ScheduleResponse,
} from "../services/api";

// ---- 목업 데이터 생성기 (스케줄 없을 때 폴백) -------------------------

const generateCostSavingsHistory = () => {
  let cumulative = 0;
  return Array.from({ length: 30 }, (_, i) => {
    const dailySave = 150000 + Math.random() * 100000;
    cumulative += dailySave;
    return {
      day: `${i + 1}일`,
      dailySavings: Math.round(dailySave),
      cumulativeSavings: Math.round(cumulative),
    };
  });
};

const generateDecisionDistribution = () => [
  { action: 'ESS 충전', count: 142, fill: '#3b82f6' },
  { action: 'ESS 방전', count: 128, fill: '#10b981' },
  { action: '충전소 간 전력 이동', count: 85, fill: '#8b5cf6' },
  { action: '계통 전력 구매', count: 75, fill: '#f59e0b' },
  { action: '대기 (수명 보호)', count: 65, fill: '#94a3b8' },
];

const generateEssLifespanData = () =>
  Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}개월`,
    withAI: 100 - i * 0.3 - Math.random() * 0.1,
    withoutAI: 100 - i * 0.8 - Math.random() * 0.2,
  }));

// ---- 실제 스케줄 → 차트 데이터 변환 ----------------------------------

function scheduleToChartData(schedule: ScheduleResponse) {
  return Array.from({ length: 24 }, (_, hour) => {
    let charging = 0, discharging = 0, gridImport = 0;
    for (const station of schedule.stations) {
      const plan = station.hourlyPlan.find(p => p.hour === hour);
      if (!plan) continue;
      if (plan.essPower >= 0) charging += plan.essPower;
      else discharging += Math.abs(plan.essPower);
      gridImport += Math.max(0, plan.gridUsage);
    }
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      charging: +charging.toFixed(1),
      discharging: +discharging.toFixed(1),
      gridImport: +gridImport.toFixed(1),
      solarGeneration: 0,
    };
  });
}

const ESS_MODE_CONFIG: Record<string, { label: string; fill: string }> = {
  CHARGE:    { label: 'ESS 충전',          fill: '#3b82f6' },
  DISCHARGE: { label: 'ESS 방전',          fill: '#10b981' },
  TRANSFER:  { label: '충전소 간 전력 이동', fill: '#8b5cf6' },
  GRID:      { label: '계통 전력 구매',     fill: '#f59e0b' },
  IDLE:      { label: '대기 (수명 보호)',    fill: '#94a3b8' },
};

function scheduleToDecisionData(schedule: ScheduleResponse) {
  const counts: Record<string, number> = {};
  for (const station of schedule.stations) {
    for (const plan of station.hourlyPlan) {
      const mode = plan.essMode || 'IDLE';
      counts[mode] = (counts[mode] || 0) + 1;
    }
  }
  return Object.entries(counts).map(([mode, count]) => ({
    action: ESS_MODE_CONFIG[mode]?.label ?? mode,
    count,
    fill: ESS_MODE_CONFIG[mode]?.fill ?? '#94a3b8',
  }));
}

function formatDateTime(raw: string) {
  return String(raw).replace('T', ' ').slice(0, 16);
}

// ---- 컴포넌트 -------------------------------------------------------

export function AIOptimization() {
  const [scheduleDay, setScheduleDay] = useState<'today' | 'tomorrow'>('today');

  const { data: todaySchedule, isLoading: todayLoading } = useQuery({
    queryKey: ['schedule-today'],
    queryFn: fetchTodaySchedule,
    staleTime: 5 * 60 * 1000,
  });

  const { data: tomorrowSchedule, isLoading: tomorrowLoading } = useQuery({
    queryKey: ['schedule-tomorrow'],
    queryFn: fetchTomorrowSchedule,
    staleTime: 5 * 60 * 1000,
  });

  const { data: mockPowerSchedule } = useQuery({
    queryKey: ['power-schedule'],
    queryFn: () => Promise.resolve(generatePowerSchedule()),
  });

  const { data: savingsHistory } = useQuery({
    queryKey: ['savings-history'],
    queryFn: () => Promise.resolve(generateCostSavingsHistory()),
  });

  const { data: mockDecisionDist } = useQuery({
    queryKey: ['decision-distribution'],
    queryFn: () => Promise.resolve(generateDecisionDistribution()),
  });

  const { data: essLifespan } = useQuery({
    queryKey: ['ess-lifespan'],
    queryFn: () => Promise.resolve(generateEssLifespanData()),
  });

  const activeSchedule = scheduleDay === 'today' ? todaySchedule : tomorrowSchedule;
  const isLoadingSchedule = scheduleDay === 'today' ? todayLoading : tomorrowLoading;
  const isMockData = !isLoadingSchedule && !activeSchedule;

  const chartData = activeSchedule
    ? scheduleToChartData(activeSchedule)
    : (mockPowerSchedule ?? []);

  const decisionData = activeSchedule
    ? scheduleToDecisionData(activeSchedule)
    : (mockDecisionDist ?? []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI 강화학습 최적화</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">강화학습 모델 기반 전력 스케줄링 및 운영 성과 분석</p>
      </div>

      {/* 스케줄 차트 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>24시간 충·방전 및 전력 융통 스케줄</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                AI 모델이 예측한 하루의 최적 제어 타임라인
              </p>
            </div>
            {/* 오늘/내일 탭 */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm shrink-0">
              <button
                onClick={() => setScheduleDay('today')}
                className={`px-4 py-1.5 transition-colors ${
                  scheduleDay === 'today'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                오늘
              </button>
              <button
                onClick={() => setScheduleDay('tomorrow')}
                className={`px-4 py-1.5 border-l border-slate-200 transition-colors ${
                  scheduleDay === 'tomorrow'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                내일
              </button>
            </div>
          </div>
          {/* 메타 정보 */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {activeSchedule ? (
              <>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  실제 AI 스케줄
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  대상일: {activeSchedule.targetDate}
                </span>
                <span className="text-xs text-slate-400">
                  · 생성: {formatDateTime(activeSchedule.createdAt)}
                </span>
                <span className="text-xs text-slate-400">
                  · 상태: {activeSchedule.status}
                </span>
              </>
            ) : isMockData ? (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                시뮬레이션 데이터 (실제 스케줄 없음)
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingSchedule ? (
            <div className="flex items-center justify-center h-[350px] gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">스케줄 불러오는 중...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis tickFormatter={(v) => `${v}kW`} />
                <Tooltip formatter={(v: number) => [`${v} kW`]} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="charging"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.7}
                  name="ESS 충전 (kW)"
                />
                <Area
                  type="monotone"
                  dataKey="discharging"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.7}
                  name="ESS 방전 (kW)"
                />
                <Area
                  type="monotone"
                  dataKey="gridImport"
                  stackId="3"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.7}
                  name="계통 구매 (kW)"
                />
                {!activeSchedule && (
                  <Area
                    type="monotone"
                    dataKey="solarGeneration"
                    stackId="4"
                    stroke="#fb923c"
                    fill="#fed7aa"
                    fillOpacity={0.7}
                    name="태양광 발전 (kW)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* 스케줄 요약 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">야간 스케줄링</div>
              <div className="text-xl font-bold text-blue-600 my-1">22:00 - 06:00</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">저렴한 심야 전력 활용하여 ESS 충전</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">피크타임 대응</div>
              <div className="text-xl font-bold text-green-600 my-1">10:00 - 16:00</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">ESS 방전 및 타 충전소 잉여전력 수급</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-300">재생에너지 활용</div>
              <div className="text-xl font-bold text-orange-600 my-1">09:00 - 17:00</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">태양광 발전량 우선 사용 및 잉여분 저장</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 비용 절감 추이 & 의사결정 분포 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>최근 30일 누적 비용 절감 추이</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">AI 도입으로 인한 누적 전기요금 절감 효과</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={savingsHistory}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(v) => `₩${(v / 10000).toFixed(0)}만`} width={80} />
                <Tooltip formatter={(v: number) => [`₩${v.toLocaleString()}`, '누적 절감액']} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="cumulativeSavings"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSavings)"
                  name="누적 비용 절감액"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI 실시간 의사결정 분포</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeSchedule
                ? `실제 스케줄 기반 (${activeSchedule.stations.length}개 충전소 × 24시간)`
                : '강화학습 에이전트의 제어 명령 비율 (시뮬레이션)'}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={decisionData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="action" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="결정 횟수" radius={[4, 4, 0, 0]}>
                  {decisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {decisionData.map((item) => (
                <div key={item.action} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.fill }} />
                  <span className="truncate" title={item.action}>{item.action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ESS 수명 & AI 모델 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BatteryCharging className="w-5 h-5 text-indigo-600" />
              ESS 배터리 수명(SoH) 최적화 비교
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">충·방전 깊이(DoD) 제어에 따른 배터리 건강도 예측</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={essLifespan}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis domain={['auto', 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => [`${v.toFixed(1)}%`, 'SoH']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="withAI"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  name="AI 최적화 적용"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="withoutAI"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="단순/수동 운영 (비교군)"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-slate-800 dark:text-slate-100" />
              강화학습 모델 아키텍처
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">다중 충전소 관제에 적용된 하이퍼파라미터 및 구조</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 text-sm flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-blue-600" /> 알고리즘
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">종류</span><span className="font-medium">Multi-Agent PPO</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">레이어</span><span className="font-medium">Actor-Critic 4층</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">옵티마이저</span><span className="font-medium">AdamW</span></div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-2 text-sm flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-purple-600" /> 학습 설정
                  </h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">학습률</span><span className="font-medium">3e-4</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">할인율(γ)</span><span className="font-medium">0.99</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">배치크기</span><span className="font-medium">2048</span></div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <h4 className="font-semibold text-indigo-900 mb-2 text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" /> 주요 최적화 목표 (Objective Function)
                </h4>
                <ul className="text-sm text-indigo-800/80 space-y-1.5 list-disc list-inside">
                  <li>전력 구매 비용 최소화 (피크시간대 계통 전력 회피)</li>
                  <li>충전소 간 V2G/P2P 전력 융통을 통한 자급률 극대화</li>
                  <li>ESS 배터리의 급격한 충방전(고심도 DoD) 방지로 수명 연장</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
