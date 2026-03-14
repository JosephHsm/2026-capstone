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
import { generateAIMetrics, generatePowerSchedule } from "../services/mockData";
import { Brain, TrendingDown, AlertTriangle, Award } from "lucide-react";
import { Progress } from "../components/ui/progress";

// Generate reward history
const generateRewardHistory = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `${i + 1}일`,
    reward: 0.7 + Math.random() * 0.25,
    costSavings: 10000000 + Math.random() * 5000000,
  }));
};

// Generate decision distribution
const generateDecisionDistribution = () => {
  return [
    { action: 'ESS 충전', count: 142, fill: '#3b82f6' },
    { action: 'ESS 방전', count: 178, fill: '#10b981' },
    { action: '계통 구매', count: 95, fill: '#f59e0b' },
    { action: '대기', count: 65, fill: '#94a3b8' },
  ];
};

export function AIOptimization() {
  const { data: aiMetrics } = useQuery({
    queryKey: ["ai-metrics"],
    queryFn: () => Promise.resolve(generateAIMetrics()),
  });

  const { data: powerSchedule } = useQuery({
    queryKey: ["power-schedule"],
    queryFn: () => Promise.resolve(generatePowerSchedule()),
  });

  const { data: rewardHistory } = useQuery({
    queryKey: ["reward-history"],
    queryFn: () => Promise.resolve(generateRewardHistory()),
  });

  const { data: decisionDist } = useQuery({
    queryKey: ["decision-distribution"],
    queryFn: () => Promise.resolve(generateDecisionDistribution()),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI 강화학습 최적화</h1>
        <p className="text-slate-600 mt-1">실시간 의사결정 및 성과 지표 모니터링</p>
      </div>

      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-green-600" />
              </div>
              <CardTitle className="text-sm">비용 절감액</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₩{aiMetrics?.costSavings.toLocaleString()}
            </div>
            <p className="text-xs text-slate-600 mt-1">월 누적</p>
            <div className="mt-3">
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-sm">보상 점수</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(aiMetrics?.rewardScore || 0).toFixed(3)}
            </div>
            <p className="text-xs text-slate-600 mt-1">평균 보상 함수값</p>
            <div className="mt-3">
              <Progress value={(aiMetrics?.rewardScore || 0) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <CardTitle className="text-sm">ESS 수명 페널티</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ₩{aiMetrics?.essLifetimePenalty.toLocaleString()}
            </div>
            <p className="text-xs text-slate-600 mt-1">월 누적</p>
            <div className="mt-3">
              <Progress value={15} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <CardTitle className="text-sm">피크 초과 페널티</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₩{aiMetrics?.peakPowerPenalty.toLocaleString()}
            </div>
            <p className="text-xs text-slate-600 mt-1">월 누적</p>
            <div className="mt-3">
              <Progress value={8} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduling Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>24시간 ESS 충·방전 스케줄</CardTitle>
          <p className="text-sm text-slate-600 mt-1">AI 강화학습 기반 최적 제어 타임라인</p>
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

          {/* Schedule Details */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-slate-600">야간 충전</div>
              <div className="text-xl font-bold text-blue-600">22:00-06:00</div>
              <div className="text-xs text-slate-500 mt-1">저렴한 심야 전력 활용</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-slate-600">피크 방전</div>
              <div className="text-xl font-bold text-green-600">10:00-14:00</div>
              <div className="text-xs text-slate-500 mt-1">비싼 전력요금 절감</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-slate-600">태양광 활용</div>
              <div className="text-xl font-bold text-orange-600">09:00-17:00</div>
              <div className="text-xs text-slate-500 mt-1">재생에너지 우선 사용</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-sm text-slate-600">수요 반응</div>
              <div className="text-xl font-bold text-purple-600">실시간</div>
              <div className="text-xs text-slate-500 mt-1">동적 부하 조정</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>30일 보상 점수 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={rewardHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="reward"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="보상 점수"
                  dot={{ fill: '#3b82f6', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI 의사결정 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={decisionDist}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="action" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" name="결정 횟수" radius={[8, 8, 0, 0]}>
                  {decisionDist?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {decisionDist?.map((item) => (
                <div key={item.action} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ background: item.fill }} />
                    <span>{item.action}</span>
                  </div>
                  <span className="font-medium">{item.count}회</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Model Information */}
      <Card>
        <CardHeader>
          <CardTitle>강화학습 모델 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600" />
                모델 구조
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">알고리즘</span>
                  <span className="font-medium">Deep Q-Network (DQN)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">신경망 레이어</span>
                  <span className="font-medium">4층 (256-128-64-32)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">활성화 함수</span>
                  <span className="font-medium">ReLU</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">옵티마이저</span>
                  <span className="font-medium">Adam</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-green-600" />
                보상 함수
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">비용 절감 가중치</span>
                  <span className="font-medium">+0.7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ESS 수명 가중치</span>
                  <span className="font-medium">-0.2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">피크 초과 가중치</span>
                  <span className="font-medium">-0.5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">재생에너지 가중치</span>
                  <span className="font-medium">+0.3</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-purple-600" />
                학습 파라미터
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">학습률</span>
                  <span className="font-medium">0.001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">할인율 (γ)</span>
                  <span className="font-medium">0.95</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">탐험율 (ε)</span>
                  <span className="font-medium">0.05</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">배치 크기</span>
                  <span className="font-medium">64</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">AI 최적화 효과</p>
                <p className="text-blue-700">
                  강화학습 기반 스케줄링을 통해 기존 대비 월평균 <strong>₩12,500,000</strong>의 전력
                  비용을 절감하고 있으며, ESS 수명 관리와 피크 전력 제어를 통해 안정적인 운영을
                  실현하고 있습니다.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
