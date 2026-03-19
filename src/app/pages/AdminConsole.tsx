import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { mockStations } from "../services/mockData";
import {
  Power,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

// Mock AI control commands
const generateAICommands = () => {
  const commands = [
    { time: "14:32:15", station: "강남 충전소", action: "ESS 방전 시작", power: 120, status: "실행됨" },
    { time: "14:30:42", station: "여의도 충전소", action: "태양광 우선 사용", power: 85, status: "실행됨" },
    { time: "14:28:11", station: "잠실 충전소", action: "계통 전력 감소", power: 45, status: "실행됨" },
    { time: "14:25:33", station: "홍대 충전소", action: "ESS 충전 중단", power: 0, status: "실행됨" },
    { time: "14:22:58", station: "판교 충전소", action: "비상 모드 해제", power: 65, status: "실행됨" },
  ];
  return commands;
};

export function AdminConsole() {
  const [aiEnabled, setAIEnabled] = useState(true);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const { data: stations } = useQuery({
    queryKey: ["stations"],
    queryFn: () => Promise.resolve(mockStations),
  });

  const { data: aiCommands } = useQuery({
    queryKey: ["ai-commands"],
    queryFn: () => Promise.resolve(generateAICommands()),
  });

  const handleToggleAI = (enabled: boolean) => {
    setAIEnabled(enabled);
    if (enabled) {
      toast.success("AI 자동 제어가 활성화되었습니다");
    } else {
      toast.warning("AI 자동 제어가 비활성화되었습니다");
    }
  };

  const handleEmergencyStop = (stationId: string) => {
    toast.error(`${stationId} 긴급 정지 명령이 전송되었습니다`);
  };

  const handleRestart = (stationId: string) => {
    toast.success(`${stationId} 재시작 명령이 전송되었습니다`);
  };

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">관리자 콘솔</h1>
          <p className="text-slate-600 mt-1">시스템 제어 및 수동 조작 패널</p>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-600" />
                시스템 상태
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">정상 작동 중</span>
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  ONLINE
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-2">가동 시간: 72일 15시간</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                AI 자동 제어
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                {aiEnabled ? "활성화" : "비활성화"}
              </span>
                <Switch checked={aiEnabled} onCheckedChange={handleToggleAI} />
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {aiEnabled ? "AI가 자동으로 최적화 중" : "수동 제어 모드"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                알림 및 경고
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">2건</span>
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  경고
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-2">잠실: 높은 사용률, 판교: 낮은 ESS</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Command History */}
        <Card>
          <CardHeader>
            <CardTitle>AI 제어 명령 이력</CardTitle>
            <p className="text-sm text-slate-600">최근 AI가 실행한 제어 명령</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>시간</TableHead>
                  <TableHead>충전소</TableHead>
                  <TableHead>제어 명령</TableHead>
                  <TableHead className="text-right">전력 (kW)</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aiCommands?.map((cmd, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{cmd.time}</TableCell>
                      <TableCell>{cmd.station}</TableCell>
                      <TableCell>{cmd.action}</TableCell>
                      <TableCell className="text-right font-medium">{cmd.power}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {cmd.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Manual Control Panel */}
        <Card className={!aiEnabled ? "border-blue-500 border-2" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>수동 제어 패널</CardTitle>
                <p className="text-sm text-slate-600 mt-1">비상 시 직접 제어 기능</p>
              </div>
              {!aiEnabled && (
                  <Badge variant="default" className="bg-blue-600">
                    수동 모드 활성
                  </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Station Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">제어 대상 충전소 선택</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {stations?.map((station) => (
                    <Button
                        key={station.id}
                        variant={selectedStation === station.id ? "default" : "outline"}
                        onClick={() => setSelectedStation(station.id)}
                        className="justify-start"
                    >
                      {station.name}
                    </Button>
                ))}
              </div>
            </div>

            {/* Control Buttons (긴급 정지만 남김) */}
            <div className="pt-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                      variant="destructive"
                      className="gap-2 w-full md:w-auto"
                      disabled={!selectedStation}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    선택 충전소 긴급 정지
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>긴급 정지</AlertDialogTitle>
                    <AlertDialogDescription>
                      선택한 충전소를 즉시 긴급 정지합니다. 이 작업은 즉시 실행되며 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => selectedStation && handleEmergencyStop(selectedStation)}
                        className="bg-red-600 hover:bg-red-700"
                    >
                      긴급 정지 실행
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {aiEnabled && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>알림:</strong> AI 자동 제어가 활성화되어 있습니다. 수동 제어를
                    사용하려면 상단의 AI 자동 제어를 비활성화해주세요.
                  </p>
                </div>
            )}
          </CardContent>
        </Card>

        {/* Station Control Table */}
        <Card>
          <CardHeader>
            <CardTitle>충전소별 제어 패널</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>충전소</TableHead>
                  <TableHead>충전 상태</TableHead>
                  <TableHead>ESS 잔량</TableHead>
                  <TableHead>현재 전력</TableHead>
                  <TableHead className="text-right">제어</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations?.map((station) => (
                    <TableRow key={station.id}>
                      <TableCell className="font-medium">{station.name}</TableCell>
                      <TableCell>
                        <Badge
                            variant="outline"
                            className={
                              station.status === "active"
                                  ? "text-green-600 border-green-600"
                                  : station.status === "warning"
                                      ? "text-amber-600 border-amber-600"
                                      : "text-red-600 border-red-600"
                            }
                        >
                          {station.status === "active"
                              ? "정상"
                              : station.status === "warning"
                                  ? "경고"
                                  : "오류"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${station.batteryLevel}%` }}
                            />
                          </div>
                          <span className="text-sm">{station.batteryLevel.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{station.gridConsumption.toFixed(1)} kW</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestart(station.id)}
                        >
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                              <Power className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{station.name} 긴급 정지</AlertDialogTitle>
                              <AlertDialogDescription>
                                이 충전소를 긴급 정지하시겠습니까?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                  onClick={() => handleEmergencyStop(station.id)}
                                  className="bg-red-600 hover:bg-red-700"
                              >
                                정지
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}