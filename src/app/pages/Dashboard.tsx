import { useQuery } from "@tanstack/react-query";
import { Battery, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  LineChart,
  Line,
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

  const totalVehicles = stations?.reduce((sum, s) => sum + s.currentVehicles, 0) || 0;
  const totalCapacity = stations?.reduce((sum, s) => sum + s.maxCapacity, 0) || 0;
  const avgBattery =
    stations?.reduce((sum, s) => sum + s.batteryLevel, 0) / (stations?.length || 1);
  const totalSolarGen = stations?.reduce((sum, s) => sum + s.solarGeneration, 0) || 0;
  const activeStations = stations?.filter((s) => s.status === "active").length || 0;
  const warningStations = stations?.filter((s) => s.status === "warning").length || 0;
  const errorStations = stations?.filter((s) => s.status === "error").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">통합 관제 대시보드</h1>
        <p className="text-slate-600 mt-1">전체 충전소 실시간 모니터링</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">충전 중 차량</CardTitle>
            <Zap className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalVehicles} / {totalCapacity}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              가동률 {((totalVehicles / totalCapacity) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">평균 ESS 잔량</CardTitle>
            <Battery className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgBattery.toFixed(1)}%</div>
            <p className="text-xs text-slate-600 mt-1">전체 충전소 평균</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">태양광 발전량</CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSolarGen.toFixed(1)} kW</div>
            <p className="text-xs text-slate-600 mt-1">현재 발전 중</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">충전소 상태</CardTitle>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeStations} / {stations?.length || 0}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              경고 {warningStations}개, 오류 {errorStations}개
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>24시간 전력 소비 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  name="소비량 (kW)"
                />
                <Area
                  type="monotone"
                  dataKey="generation"
                  stackId="2"
                  stroke="#10b981"
                  fill="#10b981"
                  name="태양광 발전 (kW)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>실시간 수요 예측</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="예상 수요 (kW)"
                />
                <Line
                  type="monotone"
                  dataKey="consumption"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="실제 소비 (kW)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Station Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>충전소별 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">충전소명</th>
                  <th className="text-left py-3 px-4">상태</th>
                  <th className="text-right py-3 px-4">충전 차량</th>
                  <th className="text-right py-3 px-4">ESS 잔량</th>
                  <th className="text-right py-3 px-4">태양광 발전</th>
                  <th className="text-right py-3 px-4">계통 사용</th>
                </tr>
              </thead>
              <tbody>
                {stations?.map((station) => (
                  <tr key={station.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{station.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                          station.status === "active"
                            ? "bg-green-100 text-green-800"
                            : station.status === "warning"
                            ? "bg-amber-100 text-amber-800"
                            : station.status === "error"
                            ? "bg-red-100 text-red-800"
                            : "bg-slate-100 text-slate-800"
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
                    <td className="py-3 px-4 text-right">
                      {station.currentVehicles} / {station.maxCapacity}
                    </td>
                    <td className="py-3 px-4 text-right">{station.batteryLevel.toFixed(1)}%</td>
                    <td className="py-3 px-4 text-right">{station.solarGeneration.toFixed(1)} kW</td>
                    <td className="py-3 px-4 text-right">{station.gridConsumption.toFixed(1)} kW</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weather & AI Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>현재 기상 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">기온</p>
                <p className="text-2xl font-bold">{weather?.temperature.toFixed(1)}°C</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">습도</p>
                <p className="text-2xl font-bold">{weather?.humidity.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">운량</p>
                <p className="text-2xl font-bold">{weather?.cloudCover.toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">일사량</p>
                <p className="text-2xl font-bold">{weather?.solarRadiation.toFixed(0)} W/m²</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI 최적화 성과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">비용 절감액</span>
                  <span className="font-bold text-green-600">
                    ₩{aiMetrics?.costSavings.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">보상 점수</span>
                  <span className="font-bold">{(aiMetrics?.rewardScore || 0).toFixed(2)}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${((aiMetrics?.rewardScore || 0) * 100).toFixed(0)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
