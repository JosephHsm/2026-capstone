// import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import {
//   generateCostComparison,
//   generateDailyStats,
//   generateHourlyPowerData,
// } from "../services/mockData";
// import { Calendar, DollarSign, TrendingDown, TrendingUp, Download } from "lucide-react";
// import { Button } from "../components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
//
// // Generate monthly statistics
// const generateMonthlyStats = () => {
//   return Array.from({ length: 12 }, (_, i) => ({
//     month: `${i + 1}월`,
//     consumption: 45000 + Math.random() * 10000,
//     cost: 12000000 + Math.random() * 3000000,
//     solar: 8000 + Math.random() * 2000,
//     efficiency: 75 + Math.random() * 15,
//   }));
// };
//
// // Generate cost breakdown
// const generateCostBreakdown = () => {
//   return [
//     { name: '기본요금', value: 3200000, fill: '#3b82f6' },
//     { name: '전력량요금', value: 8500000, fill: '#10b981' },
//     { name: '피크요금', value: 1800000, fill: '#f59e0b' },
//     { name: '기타', value: 500000, fill: '#94a3b8' },
//   ];
// };
//
// export function Statistics() {
//   const [period, setPeriod] = useState("monthly");
//   const [stationFilter, setStationFilter] = useState("all");
//
//   const { data: costComparison } = useQuery({
//     queryKey: ["cost-comparison"],
//     queryFn: () => Promise.resolve(generateCostComparison()),
//   });
//
//   const { data: dailyStats } = useQuery({
//     queryKey: ["daily-stats"],
//     queryFn: () => Promise.resolve(generateDailyStats()),
//   });
//
//   const { data: monthlyStats } = useQuery({
//     queryKey: ["monthly-stats"],
//     queryFn: () => Promise.resolve(generateMonthlyStats()),
//   });
//
//   const { data: costBreakdown } = useQuery({
//     queryKey: ["cost-breakdown"],
//     queryFn: () => Promise.resolve(generateCostBreakdown()),
//   });
//
//   const { data: hourlyData } = useQuery({
//     queryKey: ["hourly-power"],
//     queryFn: () => Promise.resolve(generateHourlyPowerData()),
//   });
//
//   // Calculate total savings
//   const totalSavings = costComparison?.reduce(
//     (sum, item) => sum + (item.beforeAI - item.afterAI),
//     0
//   ) || 0;
//
//   const avgSavingsRate =
//     costComparison?.reduce(
//       (sum, item) => sum + ((item.beforeAI - item.afterAI) / item.beforeAI) * 100,
//       0
//     ) / (costComparison?.length || 1);
//
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900">통계 및 리포트</h1>
//           <p className="text-slate-600 dark:text-slate-300 mt-1">전력 사용 분석 및 비용 정산 현황</p>
//         </div>
//         <Button className="gap-2">
//           <Download className="w-4 h-4" />
//           리포트 다운로드
//         </Button>
//       </div>
//
//       {/* Filters */}
//       <div className="flex gap-4">
//         <Select value={period} onValueChange={setPeriod}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="기간 선택" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="daily">일별</SelectItem>
//             <SelectItem value="weekly">주별</SelectItem>
//             <SelectItem value="monthly">월별</SelectItem>
//             <SelectItem value="yearly">연별</SelectItem>
//           </SelectContent>
//         </Select>
//
//         <Select value={stationFilter} onValueChange={setStationFilter}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="충전소 선택" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">전체 충전소</SelectItem>
//             <SelectItem value="CS001">강남 충전소</SelectItem>
//             <SelectItem value="CS002">여의도 충전소</SelectItem>
//             <SelectItem value="CS003">잠실 충전소</SelectItem>
//             <SelectItem value="CS004">홍대 충전소</SelectItem>
//             <SelectItem value="CS005">판교 충전소</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>
//
//       {/* Key Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="pb-3">
//             <div className="flex items-center gap-2">
//               <DollarSign className="w-5 h-5 text-green-600" />
//               <CardTitle className="text-sm">총 절감액</CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">₩{totalSavings.toLocaleString()}</div>
//             <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">6개월 누적</p>
//           </CardContent>
//         </Card>
//
//         <Card>
//           <CardHeader className="pb-3">
//             <div className="flex items-center gap-2">
//               <TrendingDown className="w-5 h-5 text-blue-600" />
//               <CardTitle className="text-sm">평균 절감률</CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-blue-600">{avgSavingsRate.toFixed(1)}%</div>
//             <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">AI 도입 효과</p>
//           </CardContent>
//         </Card>
//
//         <Card>
//           <CardHeader className="pb-3">
//             <div className="flex items-center gap-2">
//               <Calendar className="w-5 h-5 text-purple-600" />
//               <CardTitle className="text-sm">이번 달 전력 사용</CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">48,523 kWh</div>
//             <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">전월 대비 -8.2%</p>
//           </CardContent>
//         </Card>
//
//         <Card>
//           <CardHeader className="pb-3">
//             <div className="flex items-center gap-2">
//               <TrendingUp className="w-5 h-5 text-orange-600" />
//               <CardTitle className="text-sm">이번 달 전력 요금</CardTitle>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">₩14,000,000</div>
//             <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">전월 대비 -12.5%</p>
//           </CardContent>
//         </Card>
//       </div>
//
//       {/* Tabs for different views */}
//       <Tabs defaultValue="cost" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="cost">비용 분석</TabsTrigger>
//           <TabsTrigger value="power">전력 사용</TabsTrigger>
//           <TabsTrigger value="efficiency">효율성</TabsTrigger>
//         </TabsList>
//
//         <TabsContent value="cost" className="space-y-6">
//           {/* Cost Comparison */}
//           <Card>
//             <CardHeader>
//               <CardTitle>AI 도입 전/후 비용 비교</CardTitle>
//               <p className="text-sm text-slate-600 dark:text-slate-300">월별 전력 비용 절감 효과</p>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={350}>
//                 <BarChart data={costComparison}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="period" />
//                   <YAxis />
//                   <Tooltip
//                     formatter={(value) => `₩${Number(value).toLocaleString()}`}
//                   />
//                   <Legend />
//                   <Bar dataKey="beforeAI" fill="#94a3b8" name="AI 도입 전" radius={[8, 8, 0, 0]} />
//                   <Bar dataKey="afterAI" fill="#10b981" name="AI 도입 후" radius={[8, 8, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//
//               <div className="mt-6 grid grid-cols-3 gap-4">
//                 {costComparison?.slice(0, 3).map((item, index) => (
//                   <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
//                     <div className="text-sm text-slate-600 dark:text-slate-300 mb-1">{item.period}</div>
//                     <div className="text-xl font-bold text-green-600">
//                       ₩{(item.beforeAI - item.afterAI).toLocaleString()}
//                     </div>
//                     <div className="text-xs text-slate-500 dark:text-slate-400">
//                       {(((item.beforeAI - item.afterAI) / item.beforeAI) * 100).toFixed(1)}% 절감
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </CardContent>
//           </Card>
//
//           {/* Cost Breakdown */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>비용 구성 내역</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={costBreakdown}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                       outerRadius={100}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {costBreakdown?.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.fill} />
//                       ))}
//                     </Pie>
//                     <Tooltip formatter={(value) => `₩${Number(value).toLocaleString()}`} />
//                   </PieChart>
//                 </ResponsiveContainer>
//
//                 <div className="mt-4 space-y-2">
//                   {costBreakdown?.map((item) => (
//                     <div key={item.name} className="flex items-center justify-between text-sm">
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 rounded" style={{ background: item.fill }} />
//                         <span>{item.name}</span>
//                       </div>
//                       <span className="font-medium">₩{item.value.toLocaleString()}</span>
//                     </div>
//                   ))}
//                   <div className="flex items-center justify-between font-bold pt-2 border-t">
//                     <span>총계</span>
//                     <span>
//                       ₩
//                       {costBreakdown
//                         ?.reduce((sum, item) => sum + item.value, 0)
//                         .toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//
//             <Card>
//               <CardHeader>
//                 <CardTitle>월별 비용 추이</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <LineChart data={monthlyStats}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip formatter={(value) => `₩${Number(value).toLocaleString()}`} />
//                     <Legend />
//                     <Line
//                       type="monotone"
//                       dataKey="cost"
//                       stroke="#3b82f6"
//                       strokeWidth={2}
//                       name="전력 비용"
//                       dot={{ fill: '#3b82f6', r: 4 }}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>
//
//         <TabsContent value="power" className="space-y-6">
//           {/* Daily Power Usage */}
//           <Card>
//             <CardHeader>
//               <CardTitle>일별 전력 소비 추이</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={350}>
//                 <AreaChart data={dailyStats}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="date" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Area
//                     type="monotone"
//                     dataKey="consumption"
//                     stackId="1"
//                     stroke="#3b82f6"
//                     fill="#3b82f6"
//                     name="총 소비량 (kWh)"
//                   />
//                   <Area
//                     type="monotone"
//                     dataKey="solar"
//                     stackId="2"
//                     stroke="#f59e0b"
//                     fill="#fed7aa"
//                     name="태양광 발전 (kWh)"
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//
//           {/* Hourly Pattern */}
//           <Card>
//             <CardHeader>
//               <CardTitle>시간대별 전력 사용 패턴</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={hourlyData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="hour" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Bar dataKey="consumption" fill="#3b82f6" name="소비량 (kW)" radius={[8, 8, 0, 0]} />
//                   <Bar dataKey="generation" fill="#10b981" name="발전량 (kW)" radius={[8, 8, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </TabsContent>
//
//         <TabsContent value="efficiency" className="space-y-6">
//           {/* Efficiency Metrics */}
//           <Card>
//             <CardHeader>
//               <CardTitle>월별 운영 효율성</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={350}>
//                 <LineChart data={monthlyStats}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="month" />
//                   <YAxis domain={[0, 100]} />
//                   <Tooltip />
//                   <Legend />
//                   <Line
//                     type="monotone"
//                     dataKey="efficiency"
//                     stroke="#10b981"
//                     strokeWidth={2}
//                     name="효율성 (%)"
//                     dot={{ fill: '#10b981', r: 4 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-sm">재생에너지 사용률</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-3xl font-bold text-green-600">32.5%</div>
//                 <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">전체 에너지 중 태양광 비율</p>
//                 <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
//                   <div className="bg-green-500 h-3 rounded-full" style={{ width: "32.5%" }} />
//                 </div>
//               </CardContent>
//             </Card>
//
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-sm">ESS 활용률</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-3xl font-bold text-blue-600">78.3%</div>
//                 <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">배터리 충방전 효율</p>
//                 <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
//                   <div className="bg-blue-500 h-3 rounded-full" style={{ width: "78.3%" }} />
//                 </div>
//               </CardContent>
//             </Card>
//
//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-sm">피크 회피율</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-3xl font-bold text-purple-600">91.2%</div>
//                 <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">피크 시간대 전력 절감</p>
//                 <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
//                   <div className="bg-purple-500 h-3 rounded-full" style={{ width: "91.2%" }} />
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  BarChart,
  Bar,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  generateDailyStats,
  generateHourlyPowerData,
} from "../services/mockData";
import { Calendar, TrendingUp, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

// Generate monthly statistics
const generateMonthlyStats = () => {
  return Array.from({ length: 12 }, (_, i) => ({
    month: `${i + 1}월`,
    consumption: 45000 + Math.random() * 10000,
    cost: 12000000 + Math.random() * 3000000,
    solar: 8000 + Math.random() * 2000,
    efficiency: 75 + Math.random() * 15,
  }));
};

// Generate cost breakdown
const generateCostBreakdown = () => {
  return [
    { name: '기본요금', value: 3200000, fill: '#3b82f6' },
    { name: '전력량요금', value: 8500000, fill: '#10b981' },
    { name: '피크요금', value: 1800000, fill: '#f59e0b' },
    { name: '기타', value: 500000, fill: '#94a3b8' },
  ];
};

export function Statistics() {
  const [period, setPeriod] = useState("monthly");
  const [stationFilter, setStationFilter] = useState("all");

  const { data: dailyStats } = useQuery({
    queryKey: ["daily-stats"],
    queryFn: () => Promise.resolve(generateDailyStats()),
  });

  const { data: monthlyStats } = useQuery({
    queryKey: ["monthly-stats"],
    queryFn: () => Promise.resolve(generateMonthlyStats()),
  });

  const { data: costBreakdown } = useQuery({
    queryKey: ["cost-breakdown"],
    queryFn: () => Promise.resolve(generateCostBreakdown()),
  });

  const { data: hourlyData } = useQuery({
    queryKey: ["hourly-power"],
    queryFn: () => Promise.resolve(generateHourlyPowerData()),
  });

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">통계 및 리포트</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1">전력 사용 분석 및 비용 정산 현황</p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            리포트 다운로드
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">일별</SelectItem>
              <SelectItem value="weekly">주별</SelectItem>
              <SelectItem value="monthly">월별</SelectItem>
              {/* 연별 옵션 제거됨 */}
            </SelectContent>
          </Select>

          <Select value={stationFilter} onValueChange={setStationFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="충전소 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 충전소</SelectItem>
              <SelectItem value="CS001">강남 충전소</SelectItem>
              <SelectItem value="CS002">여의도 충전소</SelectItem>
              <SelectItem value="CS003">잠실 충전소</SelectItem>
              <SelectItem value="CS004">홍대 충전소</SelectItem>
              <SelectItem value="CS005">판교 충전소</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Statistics (절감액 관련 제거 및 2열 배치로 변경) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-sm">이번 달 전력 사용</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48,523 kWh</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">전월 대비 -8.2%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-sm">이번 달 전력 요금</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₩14,000,000</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">전월 대비 -12.5%</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="cost" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cost">비용 분석</TabsTrigger>
            <TabsTrigger value="power">전력 사용</TabsTrigger>
            <TabsTrigger value="efficiency">효율성</TabsTrigger>
          </TabsList>

          <TabsContent value="cost" className="space-y-6">
            {/* Cost Breakdown (비용 절감 비교 차트는 제거됨) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>비용 구성 내역</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                          data={costBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                      >
                        {costBreakdown?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₩${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="mt-4 space-y-2">
                    {costBreakdown?.map((item) => (
                        <div key={item.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ background: item.fill }} />
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium">₩{item.value.toLocaleString()}</span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between font-bold pt-2 border-t">
                      <span>총계</span>
                      <span>
                      ₩
                        {costBreakdown
                            ?.reduce((sum, item) => sum + item.value, 0)
                            .toLocaleString()}
                    </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>월별 비용 추이</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₩${Number(value).toLocaleString()}`} />
                      <Legend />
                      <Line
                          type="monotone"
                          dataKey="cost"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          name="전력 비용"
                          dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="power" className="space-y-6">
            {/* Daily Power Usage */}
            <Card>
              <CardHeader>
                <CardTitle>일별 전력 소비 추이</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="consumption"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        name="총 소비량 (kWh)"
                    />
                    <Area
                        type="monotone"
                        dataKey="solar"
                        stackId="2"
                        stroke="#f59e0b"
                        fill="#fed7aa"
                        name="태양광 발전 (kWh)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Hourly Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>시간대별 전력 사용 패턴</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="consumption" fill="#3b82f6" name="소비량 (kW)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="generation" fill="#10b981" name="발전량 (kW)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="efficiency" className="space-y-6">
            {/* Efficiency Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>월별 운영 효율성</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="efficiency"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="효율성 (%)"
                        dot={{ fill: '#10b981', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">재생에너지 사용률</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">32.5%</div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">전체 에너지 중 태양광 비율</p>
                  <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: "32.5%" }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">ESS 활용률</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">78.3%</div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">배터리 충방전 효율</p>
                  <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: "78.3%" }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">피크 회피율</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">91.2%</div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">피크 시간대 전력 절감</p>
                  <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full" style={{ width: "91.2%" }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
}