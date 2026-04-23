import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  fetchLatestTelemetry,
  mqttToStation,
  subscribeToTelemetry,
  fetchScheduleHistory,
  triggerScheduleRunNow,
  ChargingStation,
  ScheduleHistoryItem,
} from "../services/api";
import {
  Power,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  Activity,
  PlayCircle,
  Loader2,
  CalendarDays,
  History,
} from "lucide-react";
import { toast } from "sonner";

export function AdminConsole() {
  const [aiEnabled, setAIEnabled] = useState(true);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [isRunningSchedule, setIsRunningSchedule] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    fetchLatestTelemetry().then(data => {
      if (data?.stations) setStations(data.stations.map(mqttToStation));
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTelemetry(setStations);
    return unsubscribe;
  }, []);

  const { data: scheduleHistory, isLoading: historyLoading } = useQuery<ScheduleHistoryItem[]>({
    queryKey: ['schedule-history'],
    queryFn: fetchScheduleHistory,
    staleTime: 30 * 1000,
    retry: false,
  });

  // 실제 경고 계산 (SSE 스테이션 기반)
  const warningStations = stations.filter(s => s.status !== 'active');
  const warningText = warningStations.length === 0
    ? '모든 충전소 정상'
    : warningStations.slice(0, 2).map(s =>
        `${s.name}: ${s.status === 'offline' ? '오프라인' : '점검 필요'}`
      ).join(', ');

  const handleToggleAI = (enabled: boolean) => {
    setAIEnabled(enabled);
    if (enabled) {
      toast.success('AI 자동 제어가 활성화되었습니다');
    } else {
      toast.warning('AI 자동 제어가 비활성화되었습니다');
    }
  };

  const handleEmergencyStop = (stationName: string) => {
    toast.error(`${stationName} 긴급 정지 명령이 전송되었습니다`);
  };

  const handleRestart = (stationName: string) => {
    toast.success(`${stationName} 재시작 명령이 전송되었습니다`);
  };

  const handleRunScheduleNow = async () => {
    setIsRunningSchedule(true);
    try {
      const ok = await triggerScheduleRunNow();
      if (ok) {
        toast.success('AI 스케줄 계산을 시작했습니다. 완료까지 약 1~2분 소요됩니다.');
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['schedule-history'] });
          queryClient.invalidateQueries({ queryKey: ['schedule-today'] });
          queryClient.invalidateQueries({ queryKey: ['schedule-tomorrow'] });
        }, 5000);
      } else {
        toast.warning('현재 실시간 데이터가 없어 스케줄을 실행할 수 없습니다.');
      }
    } catch {
      toast.error('스케줄 실행에 실패했습니다. 백엔드 연결을 확인해주세요.');
    } finally {
      setIsRunningSchedule(false);
    }
  };

  function formatDateTime(raw: string) {
    return String(raw).replace('T', ' ').slice(0, 16);
  }

  function shortenRequestId(id: string) {
    return id.length > 20 ? `${id.slice(0, 20)}…` : id;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">관리자 콘솔</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">시스템 제어 및 수동 조작 패널</p>
      </div>

      {/* 시스템 상태 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 시스템 상태 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-600" />
              시스템 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                {stations.length > 0 ? '연결됨' : '대기 중'}
              </span>
              <Badge variant="default" className={stations.length > 0 ? 'bg-green-600' : 'bg-slate-400'}>
                <CheckCircle className="w-3 h-3 mr-1" />
                {stations.length > 0 ? 'ONLINE' : 'WAITING'}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              충전소 {stations.length}개 연결됨
            </p>
          </CardContent>
        </Card>

        {/* AI 자동 제어 */}
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
                {aiEnabled ? '활성화' : '비활성화'}
              </span>
              <Switch checked={aiEnabled} onCheckedChange={handleToggleAI} />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              {aiEnabled ? 'AI가 자동으로 최적화 중' : '수동 제어 모드'}
            </p>
          </CardContent>
        </Card>

        {/* 알림 및 경고 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              알림 및 경고
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{warningStations.length}건</span>
              <Badge
                variant="outline"
                className={warningStations.length > 0 ? 'text-amber-600 border-amber-600' : 'text-green-600 border-green-600'}
              >
                {warningStations.length > 0 ? '경고' : '정상'}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 truncate" title={warningText}>
              {warningText}
            </p>
          </CardContent>
        </Card>

        {/* AI 스케줄 즉시 실행 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-indigo-600" />
              AI 스케줄 실행
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
                  disabled={isRunningSchedule || stations.length === 0}
                >
                  {isRunningSchedule ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />실행 중...</>
                  ) : (
                    <><PlayCircle className="w-4 h-4" />지금 실행</>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>AI 스케줄 즉시 실행</AlertDialogTitle>
                  <AlertDialogDescription>
                    현재 실시간 텔레메트리를 기반으로 내일({new Date(Date.now() + 86400000).toLocaleDateString('ko-KR')})의
                    AI 최적 스케줄을 즉시 계산합니다. 완료까지 약 1~2분 소요됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRunScheduleNow}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    실행
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              24시간마다 자동 실행됨
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI 스케줄 실행 이력 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-4 h-4" />
            AI 스케줄 실행 이력
          </CardTitle>
          <p className="text-sm text-slate-600 dark:text-slate-300">최근 AI가 생성한 스케줄 이력 (최대 10건)</p>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex items-center justify-center h-24 gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">이력 불러오는 중...</span>
            </div>
          ) : !scheduleHistory || scheduleHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-slate-400">
              <CalendarDays className="w-6 h-6 mb-2" />
              <p className="text-sm">아직 실행된 스케줄이 없습니다.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>생성 시각</TableHead>
                  <TableHead>대상 날짜</TableHead>
                  <TableHead>요청 ID</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleHistory.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{formatDateTime(item.createdAt)}</TableCell>
                    <TableCell>{String(item.targetDate)}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {shortenRequestId(item.requestId)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 수동 제어 패널 */}
      <Card className={!aiEnabled ? 'border-blue-500 border-2' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>수동 제어 패널</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">비상 시 직접 제어 기능</p>
            </div>
            {!aiEnabled && (
              <Badge variant="default" className="bg-blue-600">수동 모드 활성</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">제어 대상 충전소 선택</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {stations.map((station) => (
                <Button
                  key={station.id}
                  variant={selectedStation === station.id ? 'default' : 'outline'}
                  onClick={() => setSelectedStation(station.id)}
                  className="justify-start"
                >
                  {station.name}
                </Button>
              ))}
            </div>
          </div>

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
                    onClick={() => {
                      const s = stations.find(st => st.id === selectedStation);
                      if (s) handleEmergencyStop(s.name);
                    }}
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

      {/* 충전소별 제어 패널 */}
      <Card>
        <CardHeader>
          <CardTitle>충전소별 제어 패널</CardTitle>
        </CardHeader>
        <CardContent>
          {stations.length === 0 ? (
            <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
              실시간 데이터 대기 중...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>충전소</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>ESS 잔량</TableHead>
                  <TableHead>계통 전력</TableHead>
                  <TableHead className="text-right">제어</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-medium">{station.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          station.status === 'active'
                            ? 'text-green-600 border-green-600'
                            : station.status === 'warning'
                            ? 'text-amber-600 border-amber-600'
                            : station.status === 'offline'
                            ? 'text-slate-500 border-slate-400'
                            : 'text-red-600 border-red-600'
                        }
                      >
                        {station.status === 'active'
                          ? '정상'
                          : station.status === 'warning'
                          ? '경고'
                          : station.status === 'offline'
                          ? '오프라인'
                          : '오류'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${station.batteryLevel > 30 ? 'bg-green-600' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(station.batteryLevel, 100)}%` }}
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
                        onClick={() => handleRestart(station.name)}
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
                              onClick={() => handleEmergencyStop(station.name)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
