import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  generateWeatherData,
  generateHourlyPowerData,
  mockStations,
} from "../services/mockData";
import { Sun, Cloud, Droplets, Thermometer, Wind } from "lucide-react";

// Generate solar forecast data
const generateSolarForecast = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    predicted: i >= 6 && i < 18 ? 20 + Math.random() * 60 : 0,
    actual: i >= 6 && i < 18 ? 18 + Math.random() * 55 : 0,
  }));
};

// Generate renewable energy mix
const generateEnergyMix = () => {
  return [
    { name: '태양광', value: 245, fill: '#f59e0b' },
    { name: '계통전력', value: 580, fill: '#3b82f6' },
    { name: 'ESS 방전', value: 120, fill: '#10b981' },
  ];
};

export function EnergyMonitoring() {
  const { data: weather } = useQuery({
    queryKey: ["weather"],
    queryFn: () => Promise.resolve(generateWeatherData()),
  });

  const { data: hourlyData } = useQuery({
    queryKey: ["hourly-power"],
    queryFn: () => Promise.resolve(generateHourlyPowerData()),
  });

  const { data: solarForecast } = useQuery({
    queryKey: ["solar-forecast"],
    queryFn: () => Promise.resolve(generateSolarForecast()),
  });

  const { data: energyMix } = useQuery({
    queryKey: ["energy-mix"],
    queryFn: () => Promise.resolve(generateEnergyMix()),
  });

  const { data: stations } = useQuery({
    queryKey: ["stations"],
    queryFn: () => Promise.resolve(mockStations),
  });

  const totalSolarGen = stations?.reduce((sum, s) => sum + s.solarGeneration, 0) || 0;
  const totalGridConsumption = stations?.reduce((sum, s) => sum + s.gridConsumption, 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">신재생 에너지 모니터링</h1>
        <p className="text-slate-600 mt-1">태양광 발전 및 기상 데이터 실시간 분석</p>
      </div>

      {/* Weather Information */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Thermometer className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">기온</p>
                <p className="text-2xl font-bold">{weather?.temperature.toFixed(1)}°C</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">습도</p>
                <p className="text-2xl font-bold">{weather?.humidity.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-100 rounded-lg">
                <Cloud className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">운량</p>
                <p className="text-2xl font-bold">{weather?.cloudCover.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Sun className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">일사량</p>
                <p className="text-xl font-bold">{weather?.solarRadiation.toFixed(0)} W/m²</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Generation Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">태양광 발전량</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{totalSolarGen.toFixed(1)} kW</div>
            <p className="text-sm text-slate-600 mt-1">전체 충전소 합계</p>
            <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
              <div className="bg-orange-500 h-3 rounded-full" style={{ width: "68%" }} />
            </div>
            <p className="text-xs text-slate-500 mt-1">설비용량 대비 68%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">계통전력 사용량</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalGridConsumption.toFixed(1)} kW</div>
            <p className="text-sm text-slate-600 mt-1">현재 사용 중</p>
            <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
              <div className="bg-blue-500 h-3 rounded-full" style={{ width: "82%" }} />
            </div>
            <p className="text-xs text-slate-500 mt-1">계약전력 대비 82%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">재생에너지 비율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {((totalSolarGen / (totalSolarGen + totalGridConsumption)) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-slate-600 mt-1">전체 에너지 대비</p>
            <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{
                  width: `${((totalSolarGen / (totalSolarGen + totalGridConsumption)) * 100).toFixed(0)}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">탄소 중립 기여도</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>태양광 발전량 예측 vs 실제</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={solarForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#fb923c"
                  fill="#fed7aa"
                  name="예측 발전량 (kW)"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#f97316"
                  fill="#fb923c"
                  name="실제 발전량 (kW)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>에너지원별 구성</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={energyMix} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                  {energyMix?.map((entry, index) => (
                    <Bar key={`cell-${index}`} dataKey="value" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {energyMix?.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ background: item.fill }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value} kW</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>24시간 에너지 생산·소비</CardTitle>
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
                  dataKey="consumption"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="소비 (kW)"
                />
                <Line
                  type="monotone"
                  dataKey="generation"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="태양광 생산 (kW)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>충전소별 태양광 발전 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stations?.map((station) => (
                <div key={station.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{station.name}</span>
                    <span className="text-orange-600 font-bold">
                      {station.solarGeneration.toFixed(1)} kW
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${(station.solarGeneration / 80) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact */}
      <Card>
        <CardHeader>
          <CardTitle>환경 기여도</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {(totalSolarGen * 24 * 0.45).toFixed(0)} kg
              </div>
              <p className="text-sm text-slate-600 mt-1">일일 CO₂ 저감량</p>
              <p className="text-xs text-slate-500 mt-2">소나무 약 {Math.floor(totalSolarGen * 24 * 0.45 / 6.6)}그루 효과</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {(totalSolarGen * 24).toFixed(0)} kWh
              </div>
              <p className="text-sm text-slate-600 mt-1">일일 재생에너지 발전량</p>
              <p className="text-xs text-slate-500 mt-2">일반 가정 약 {Math.floor(totalSolarGen * 24 / 10)}가구 전력</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {(totalSolarGen * 24 * 0.45 * 365 / 1000).toFixed(1)} ton
              </div>
              <p className="text-sm text-slate-600 mt-1">연간 CO₂ 저감 예상</p>
              <p className="text-xs text-slate-500 mt-2">승용차 {Math.floor(totalSolarGen * 24 * 0.45 * 365 / 2300)}대 감축 효과</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
