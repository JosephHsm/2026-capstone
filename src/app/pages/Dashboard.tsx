import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap, Sun, BatteryCharging, Activity, CalendarCheck, Loader2, Thermometer, Droplets, Wind, Cloud, CloudRain, Snowflake } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { fetchCurrentWeather, fetchWeatherForecast, skyToLabel, precipToLabel, ForecastHour } from "../services/weatherApi";
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
  fetchLatestTelemetry,
  mqttToStation,
  subscribeToTelemetry,
  fetchTodaySchedule,
  ChargingStation,
  ScheduleResponse,
} from "../services/api";

function SkyIcon({ sky, pty }: { sky: number; pty: number }) {
  if (pty === 1 || pty === 4) return <CloudRain className="w-5 h-5 text-blue-400" />;
  if (pty === 3) return <Snowflake className="w-5 h-5 text-blue-200" />;
  if (pty === 2) return <CloudRain className="w-5 h-5 text-slate-400" />;
  if (sky === 1) return <Sun className="w-5 h-5 text-yellow-400" />;
  if (sky === 3) return <Cloud className="w-5 h-5 text-slate-400" />;
  return <Cloud className="w-5 h-5 text-slate-500" />;
}

function scheduleToHourlyData(schedule: ScheduleResponse) {
  return Array.from({ length: 24 }, (_, hour) => {
    let gridUsage = 0, essPower = 0;
    for (const station of schedule.stations) {
      const plan = station.hourlyPlan.find(p => p.hour === hour);
      if (!plan) continue;
      gridUsage += Math.max(0, plan.gridUsage);
      essPower += plan.essPower;
    }
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      gridUsage: +gridUsage.toFixed(1),
      essPower: +essPower.toFixed(1),
    };
  });
}

export function Dashboard() {
  const [stations, setStations] = useState<ChargingStation[]>([]);

  useEffect(() => {
    fetchLatestTelemetry().then(data => {
      if (data?.stations) setStations(data.stations.map(mqttToStation));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTelemetry(setStations);
    return unsubscribe;
  }, []);

  const { data: todaySchedule, isLoading: scheduleLoading } = useQuery({
    queryKey: ["schedule-today"],
    queryFn: fetchTodaySchedule,
    staleTime: 5 * 60 * 1000,
  });

  const { data: weather, isLoading: weatherLoading, isError: weatherError } = useQuery({
    queryKey: ["current-weather"],
    queryFn: fetchCurrentWeather,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const { data: forecast = [] } = useQuery({
    queryKey: ["weather-forecast"],
    queryFn: fetchWeatherForecast,
    staleTime: 30 * 60 * 1000,
    retry: false,
  });

  const totalSolar = stations.reduce((sum, s) => sum + s.solarGeneration, 0);
  const totalGrid = stations.reduce((sum, s) => sum + s.gridConsumption, 0);
  const avgBattery = stations.length > 0
    ? stations.reduce((sum, s) => sum + s.batteryLevel, 0) / stations.length
    : 0;
  const activeCount = stations.filter(s => s.status === "active").length;

  const hourlyData = todaySchedule ? scheduleToHourlyData(todaySchedule) : [];

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">통합 관제 대시보드</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">AI 예측 모델 기반 실시간 모니터링</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 클러스터 실시간 현황 + 기상 정보 */}
          <Card className="bg-gradient-to-br from-slate-50 to-blue-50/30 border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-slate-800 dark:text-slate-100">클러스터 실시간 현황</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* 클러스터 통계 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="p-2.5 bg-yellow-50 rounded-lg text-yellow-500">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">태양광 발전</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {totalSolar.toFixed(1)} <span className="text-sm font-normal">kW</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="p-2.5 bg-blue-50 rounded-lg text-blue-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">계통 소비</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {totalGrid.toFixed(1)} <span className="text-sm font-normal">kW</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="p-2.5 bg-green-50 rounded-lg text-green-500">
                    <BatteryCharging className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">평균 ESS 충전율</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {avgBattery.toFixed(1)} <span className="text-sm font-normal">%</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                  <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-500">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">활성 충전소</p>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
                      {activeCount} <span className="text-sm font-normal">/ {stations.length}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 구분선 + 기상 현황 */}
              <div className="border-t border-slate-200 pt-4 space-y-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">실시간 기상 현황</p>

                {/* 현재 날씨 */}
                {weatherError ? (
                  <div className="bg-red-50 rounded-xl px-4 py-3 border border-red-100 text-sm text-red-400">
                    날씨 정보를 불러오지 못했습니다 (기상청 API 오류)
                  </div>
                ) : weatherLoading ? (
                  <div className="bg-white rounded-xl px-4 py-3 border border-slate-100 text-sm text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />날씨 불러오는 중...
                  </div>
                ) : weather ? (
                  <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <SkyIcon sky={weather.skyCondition} pty={weather.precipType} />
                      <div>
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-none">
                          {weather.temperature.toFixed(1)}<span className="text-base font-normal">°C</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {weather.precipType > 0 ? precipToLabel(weather.precipType) : skyToLabel(weather.skyCondition)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-slate-600 flex items-center justify-end gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-400" />
                        습도 {weather.humidity.toFixed(0)}%
                      </p>
                      <p className="text-sm text-slate-600 flex items-center justify-end gap-1">
                        <Wind className="w-3.5 h-3.5 text-slate-400" />
                        {weather.windSpeed.toFixed(1)} m/s
                      </p>
                      <p className="text-xs text-slate-400">{weather.observedAt}</p>
                    </div>
                  </div>
                ) : null}

                {/* 시간별 예보 */}
                {forecast.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">시간별 예보</p>
                    <div className="overflow-x-auto">
                      <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
                        {forecast.slice(0, 10).map((f: ForecastHour, i: number) => (
                          <div key={i} className="flex flex-col items-center gap-1 bg-white rounded-lg border border-slate-100 px-2.5 py-2 min-w-[52px]">
                            <p className="text-xs text-slate-500">{f.time}</p>
                            <SkyIcon sky={f.sky} pty={f.pty} />
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{f.tmp.toFixed(0)}°</p>
                            <p className="text-xs text-blue-400">{f.pop}%</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-400 text-right">기상청 초단기실황 · 단기예보</p>
              </div>
            </CardContent>
          </Card>

          {/* 오늘의 AI 스케줄 현황 */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-blue-500" />
                오늘의 AI 스케줄 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-center h-[calc(100%-4rem)]">
              {scheduleLoading ? (
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>스케줄 로딩 중...</span>
                </div>
              ) : todaySchedule ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-600">스케줄 상태</span>
                    <span className="text-sm font-bold text-green-600">{todaySchedule.status}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-600">대상 날짜</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{todaySchedule.targetDate}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-600">스케줄 충전소 수</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{todaySchedule.stations.length}개소</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-600">생성 시각</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {todaySchedule.createdAt.replace('T', ' ').slice(0, 16)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-6">
                  <CalendarCheck className="w-10 h-10 opacity-30" />
                  <p className="text-sm">오늘 생성된 AI 스케줄이 없습니다</p>
                  <p className="text-xs">매 시간 정각에 자동으로 스케줄이 생성됩니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI 스케줄 기반 시간별 전력 계획 */}
        <Card>
          <CardHeader>
            <CardTitle>오늘의 AI 전력 운용 계획 (시간별)</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              AI가 수립한 오늘의 계통 구매량과 ESS 운용 계획입니다.
              {!todaySchedule && !scheduleLoading && " (스케줄 없음 - AI 분석 대기 중)"}
            </p>
          </CardHeader>
          <CardContent>
            {hourlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `${v}kW`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="gridUsage" stroke="#3b82f6" strokeWidth={3}
                    fillOpacity={1} fill="url(#colorGrid)" name="계통 구매 계획 (kW)" animationDuration={1500} />
                  <Area type="monotone" dataKey="essPower" stroke="#10b981" strokeWidth={3}
                    fillOpacity={1} fill="url(#colorEss)" name="ESS 운용 계획 (kW)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                <div className="text-center">
                  <Loader2 className={`w-8 h-8 mx-auto mb-2 ${scheduleLoading ? 'animate-spin' : 'opacity-30'}`} />
                  <p className="text-sm">{scheduleLoading ? "스케줄 로딩 중..." : "스케줄 데이터 없음"}</p>
                </div>
              </div>
            )}
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
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">충전소명</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">상태</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">충전 차량</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">ESS 잔량</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">현재 발전량</th>
                </tr>
                </thead>
                <tbody>
                {stations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                      실시간 데이터 수신 대기 중...
                    </td>
                  </tr>
                ) : stations.map((station) => (
                    <tr key={station.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-100">{station.name}</td>
                      <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          station.status === "active" ? "bg-green-100 text-green-700"
                          : station.status === "warning" ? "bg-amber-100 text-amber-700"
                          : station.status === "error" ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700 dark:text-slate-200"
                      }`}>
                        {station.status === "active" ? "정상"
                          : station.status === "warning" ? "경고"
                          : station.status === "error" ? "오류"
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
