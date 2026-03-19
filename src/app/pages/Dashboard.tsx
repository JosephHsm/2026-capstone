import { useQuery } from "@tanstack/react-query";
import { Sun, Cloud, Droplets, Thermometer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  mockStations,
  generateWeatherData,
  generateAIMetrics,
  generateHourlyPowerData,
} from "../services/mockData";

export function Dashboard() {
  const { data: stations } = useQuery({
    queryKey: ["stations"],
    queryFn: () => Promise.resolve(mockStations),
  });

  const { data: weather } = useQuery({
    queryKey: ["weather"],
    queryFn: () => Promise.resolve(generateWeatherData()),
  });

  const { data: aiMetrics } = useQuery({
    queryKey: ["ai-metrics"],
    queryFn: () => Promise.resolve(generateAIMetrics()),
  });

  const { data: hourlyData } = useQuery({
    queryKey: ["hourly-power"],
    queryFn: () => Promise.resolve(generateHourlyPowerData()),
  });

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">통합 관제 대시보드</h1>
          <p className="text-slate-600 mt-1">AI 예측 모델 기반 실시간 모니터링</p>
        </div>

        {/* Weather & AI Metrics - 상단 배치 및 UI 개선 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 기상 정보 위젯 */}
          <Card className="bg-gradient-to-br from-slate-50 to-blue-50/30 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-slate-800">실시간 기상 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="p-2.5 bg-orange-50 rounded-lg text-orange-500">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">기온</p>
                    <p className="text-xl font-bold text-slate-800">
                      {weather?.temperature.toFixed(1)}°C
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="p-2.5 bg-blue-50 rounded-lg text-blue-500">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">습도</p>
                    <p className="text-xl font-bold text-slate-800">
                      {weather?.humidity.toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="p-2.5 bg-slate-100 rounded-lg text-slate-500">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">운량</p>
                    <p className="text-xl font-bold text-slate-800">
                      {weather?.cloudCover.toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="p-2.5 bg-yellow-50 rounded-lg text-yellow-500">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">일사량</p>
                    <p className="text-xl font-bold text-slate-800">
                      {weather?.solarRadiation.toFixed(0)} <span className="text-sm font-normal">W/m²</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI 최적화 성과 */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">AI 최적화 성과 (실시간)</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center h-[calc(100%-4rem)]">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-600">누적 비용 절감액</span>
                    <span className="text-2xl font-bold text-green-600">
                    ₩{aiMetrics?.costSavings.toLocaleString()}
                  </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-in-out" style={{ width: "85%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-600">AI 모델 보상 점수</span>
                    <span className="text-2xl font-bold text-blue-600">
                    {(aiMetrics?.rewardScore || 0).toFixed(3)}
                  </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-in-out"
                        style={{ width: `${((aiMetrics?.rewardScore || 0) * 100).toFixed(0)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 미래 예측 통합 차트 (현재 시간 기준 24시간) */}
        <Card>
          <CardHeader>
            <CardTitle>향후 24시간 수요 및 발전 예측 (AI 기반)</CardTitle>
            <p className="text-sm text-slate-500">
              현재 시간부터 24시간 동안의 예상 전력 수요와 예상 태양광 발전량을 실시간으로 예측합니다. (실제 소비 제외)
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickMargin={10} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${value}kW`} />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Area
                    type="monotone"
                    dataKey="predictedDemand"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorDemand)"
                    name="예상 전력 수요 (kW)"
                    animationDuration={1500}
                />
                <Area
                    type="monotone"
                    dataKey="predictedSolar"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSolar)"
                    name="예상 태양광 발전량 (kW)"
                    animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 충전소별 상태 테이블 */}
        <Card>
          <CardHeader>
            <CardTitle>충전소별 실시간 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">충전소명</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600">상태</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600">충전 차량</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600">ESS 잔량</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600">현재 발전량</th>
                </tr>
                </thead>
                <tbody>
                {stations?.map((station) => (
                    <tr key={station.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800">{station.name}</td>
                      <td className="py-3 px-4">
                      <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              station.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : station.status === "warning"
                                      ? "bg-amber-100 text-amber-700"
                                      : station.status === "error"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-slate-100 text-slate-700"
                          }`}
                      >
                        {station.status === "active"
                            ? "정상"
                            : station.status === "warning"
                                ? "경고"
                                : station.status === "error"
                                    ? "오류"
                                    : "오프라인"}
                      </span>
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        {station.currentVehicles} / {station.maxCapacity}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 hidden sm:block">
                            <div
                                className={`h-1.5 rounded-full ${station.batteryLevel > 30 ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${station.batteryLevel}%` }}
                            />
                          </div>
                          <span>{station.batteryLevel.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-orange-600 font-medium tabular-nums">
                        {station.solarGeneration.toFixed(1)} kW
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}