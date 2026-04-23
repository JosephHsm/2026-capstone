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
import { Brain, TrendingDown, Award, BatteryCharging } from "lucide-react";

// Generate AI cost savings history (보상 점수 대체용)
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

// Generate decision distribution (충전소 간 전력 이동 추가)
const generateDecisionDistribution = () => {
  return [
    { action: 'ESS 충전', count: 142, fill: '#3b82f6' },
    { action: 'ESS 방전', count: 128, fill: '#10b981' },
    { action: '충전소 간 전력 이동', count: 85, fill: '#8b5cf6' }, // 새로 추가됨
    { action: '계통 전력 구매', count: 75, fill: '#f59e0b' },
    { action: '대기 (수명 보호)', count: 65, fill: '#94a3b8' },
  ];
};

// Generate ESS Lifespan prediction data (ESS 수명 지표 개편용)
const generateEssLifespanData = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}개월`,
    withAI: 100 - (i * 0.3) - Math.random() * 0.1, // AI 도입시 완만한 수명 감소
    withoutAI: 100 - (i * 0.8) - Math.random() * 0.2, // 미도입시 가파른 수명 감소
  }));
};

export function AIOptimization() {
  const { data: powerSchedule } = useQuery({
    queryKey: ["power-schedule"],
    queryFn: () => Promise.resolve(generatePowerSchedule()),
  });

  const { data: savingsHistory } = useQuery({
    queryKey: ["savings-history"],
    queryFn: () => Promise.resolve(generateCostSavingsHistory()),
  });

  const { data: decisionDist } = useQuery({
    queryKey: ["decision-distribution"],
    queryFn: () => Promise.resolve(generateDecisionDistribution()),
  });

  const { data: essLifespan } = useQuery({
    queryKey: ["ess-lifespan"],
    queryFn: () => Promise.resolve(generateEssLifespanData()),
  });

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI 강화학습 최적화</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">강화학습 모델 기반 전력 스케줄링 및 운영 성과 분석</p>
        </div>

        {/* Scheduling Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>24시간 충·방전 및 전력 융통 스케줄</CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">AI 모델이 예측한 오늘 하루의 최적 제어 타임라인</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={powerSchedule}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                    type="monotone"
                    dataKey="charging"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    name="ESS 충전 (kW)"
                />
                <Area
                    type="monotone"
                    dataKey="discharging"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    name="ESS 방전 (kW)"
                />
                <Area
                    type="monotone"
                    dataKey="gridImport"
                    stackId="3"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    name="계통 구매 (kW)"
                />
                <Area
                    type="monotone"
                    dataKey="solarGeneration"
                    stackId="4"
                    stroke="#fb923c"
                    fill="#fed7aa"
                    name="태양광 발전 (kW)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Schedule Details (수요 반응 제거됨) */}
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

        {/* Performance Charts (비용 절감 및 의사결정) */}
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
                  <YAxis
                      tickFormatter={(value) => `₩${(value / 10000).toFixed(0)}만`}
                      width={80}
                  />
                  <Tooltip
                      formatter={(value: number) => [`₩${value.toLocaleString()}`, '누적 절감액']}
                  />
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
              <p className="text-sm text-slate-500 dark:text-slate-400">강화학습 에이전트의 제어 명령 비율 (최근 24시간)</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={decisionDist} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="action" tick={{fontSize: 12}} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="결정 횟수" radius={[4, 4, 0, 0]}>
                    {decisionDist?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {decisionDist?.map((item) => (
                    <div key={item.action} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.fill }} />
                      <span className="truncate" title={item.action}>{item.action}</span>
                    </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ESS Lifespan & AI Model Info */}
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
                  <YAxis domain={['auto', 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'SoH']} />
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

          {/* AI Model Information */}
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
                      <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400 ">배치크기</span><span className="font-medium">2048</span></div>
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