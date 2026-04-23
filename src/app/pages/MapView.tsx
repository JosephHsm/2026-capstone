import { useState, useEffect } from "react";
import { Map, MapMarker, CustomOverlayMap } from "react-kakao-maps-sdk";
import { fetchLatestTelemetry, mqttToStation, subscribeToTelemetry, ChargingStation } from "../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
    BatteryCharging, X, MapPin, AlertCircle, CheckCircle2,
    ChevronRight, Sun, Zap, Activity, Car
} from "lucide-react";

export function MapView() {
    const [stations, setStations] = useState<ChargingStation[]>([]);
    // 선택된 마커 ID, 지도 중심 좌표, 그리고 세부정보 패널 열림 상태 관리
    const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState({ lat: 37.5326, lng: 126.9900 });
    const [showDetail, setShowDetail] = useState(false);

    useEffect(() => {
        fetchLatestTelemetry().then(data => {
            if (data?.stations) setStations(data.stations.map(mqttToStation));
        }).catch(console.error);
    }, []);

    useEffect(() => {
        const unsubscribe = subscribeToTelemetry(setStations);
        return unsubscribe;
    }, []);

    // 요약 통계 계산
    const totalStations = stations.length;
    const activeStations = stations.filter(s => s.status === 'active').length;
    const warningStations = stations.filter(s => s.status !== 'active').length;

    // 선택된 충전소 객체 찾기
    const selectedStation = stations.find(s => s.id === selectedStationId);

    // 리스트나 마커 클릭 시 해당 위치로 지도 이동 및 오버레이 띄우기
    const handleStationClick = (station: ChargingStation) => {
        setSelectedStationId(station.id);
        setMapCenter({ lat: station.lat, lng: station.lng });
        setShowDetail(false); // 다른 마커 클릭 시 세부정보 창은 일단 닫음
    };

    return (
        <div className="relative h-[calc(100vh-6rem)] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-50">

            {/* 1. 카카오맵 영역 (전체 배경) */}
            <div className="absolute inset-0 w-full h-full z-0">
                <Map
                    center={mapCenter}
                    style={{ width: "100%", height: "100%" }}
                    level={7}
                    onClick={() => {
                        setSelectedStationId(null);
                        setShowDetail(false);
                    }}
                >
                    {stations.map((station) => (
                        <div key={station.id}>
                            <MapMarker
                                position={{ lat: station.lat, lng: station.lng }}
                                onClick={() => handleStationClick(station)}
                            />
                            {/* 클릭 시 나타나는 마커 오버레이 */}
                            {selectedStationId === station.id && !showDetail && (
                                <CustomOverlayMap
                                    position={{ lat: station.lat, lng: station.lng }}
                                    yAnchor={1.2}
                                    clickable={true} // 👈 이 속성을 반드시 추가해야 버튼이 눌립니다!
                                >
                                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-64 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100">{station.name}</h3>
                                            <button
                                                onClick={() => setSelectedStationId(null)}
                                                className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="space-y-2 text-sm mt-3 mb-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-slate-400">상태</span>
                                                <Badge variant="outline" className={station.status === 'active' ? 'text-green-600 border-green-200 bg-green-50' : 'text-amber-600 border-amber-200 bg-amber-50'}>
                                                    {station.status === 'active' ? '정상 작동' : '점검 필요'}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500 dark:text-slate-400">ESS 잔량</span>
                                                <div className="flex items-center gap-1 font-medium">
                                                    <BatteryCharging className="w-4 h-4 text-blue-500" />
                                                    {station.batteryLevel.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                        {/* 세부정보 보기 버튼 */}
                                        <Button
                                            className="w-full h-8 text-xs gap-1 bg-slate-900 hover:bg-slate-800"
                                            onClick={() => setShowDetail(true)}
                                        >
                                            충전소 세부정보 보기
                                            <ChevronRight className="w-3 h-3" />
                                        </Button>
                                    </div>
                                </CustomOverlayMap>
                            )}
                        </div>
                    ))}
                </Map>
            </div>

            {/* 2. 좌측 플로팅 요약 및 리스트 영역 */}
            <div className="absolute top-4 left-4 z-10 w-80 max-h-[calc(100%-2rem)] flex flex-col gap-4 overflow-y-auto [&::-webkit-scrollbar]:hidden pr-1 pb-4">
                <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-md">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">실시간 관제 맵</CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">충전소 위치 및 상태 통합 모니터링</p>
                    </CardHeader>
                </Card>

                <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-md">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">전체 충전소</span>
                            <span className="text-lg font-bold">{totalStations}개소</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 p-3 rounded-xl flex flex-col items-center border border-green-100">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mb-1.5" />
                                <span className="text-xs text-slate-600 ">정상 작동</span>
                                <span className="font-bold text-green-700 text-lg">{activeStations}</span>
                            </div>
                            <div className="bg-amber-50 p-3 rounded-xl flex flex-col items-center border border-amber-100">
                                <AlertCircle className="w-5 h-5 text-amber-500 mb-1.5" />
                                <span className="text-xs text-slate-600 ">점검/경고</span>
                                <span className="font-bold text-amber-700 text-lg">{warningStations}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-md flex-1">
                    <CardHeader className="py-3 px-4 border-b border-slate-100">
                        <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100">충전소 목록</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex flex-col">
                            {stations.map((station) => (
                                <button
                                    key={station.id}
                                    onClick={() => handleStationClick(station)}
                                    className={`flex flex-col p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left ${
                                        selectedStationId === station.id ? 'bg-blue-50/60' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start w-full mb-1">
                    <span className="font-medium text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        {station.name}
                    </span>
                                        <Badge variant="outline" className={`text-[10px] px-2 py-0 border-0 ${
                                            station.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {station.status === 'active' ? '정상' : '경고'}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 pl-5">
                                        ESS: {station.batteryLevel.toFixed(1)}% | 차량: {station.currentVehicles}대
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. 하단 세부정보 패널 (상세 정보 보기 클릭 시 올라옴) */}
            {showDetail && selectedStation && (
                <div className="absolute bottom-4 right-4 left-[22rem] z-20 animate-in slide-in-from-bottom-8 fade-in duration-300">
                    <Card className="shadow-2xl border-slate-200 bg-white/95 backdrop-blur-xl">
                        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    {selectedStation.name} 상세 정보
                                </CardTitle>
                                <Badge variant="outline" className={selectedStation.status === 'active' ? 'text-green-600 border-green-600' : 'text-amber-600 border-amber-600'}>
                                    {selectedStation.status === 'active' ? '정상 가동 중' : '시스템 점검 필요'}
                                </Badge>
                            </div>
                            <button
                                onClick={() => setShowDetail(false)}
                                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 dark:text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                                {/* 패널 1: 충전 현황 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                                        <Car className="w-4 h-4 text-blue-500" /> 전기차 충전 현황
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500 dark:text-slate-400">현재 충전 중</span>
                                            <span className="font-bold">{selectedStation.currentVehicles} / {selectedStation.maxCapacity} 대</span>
                                        </div>
                                        <Progress value={(selectedStation.currentVehicles / selectedStation.maxCapacity) * 100} className="h-2" />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                        현재 {((selectedStation.currentVehicles / selectedStation.maxCapacity) * 100).toFixed(0)}%의 충전기가 사용 중입니다.
                                        {selectedStation.currentVehicles >= selectedStation.maxCapacity * 0.8 ? ' 혼잡 상태입니다.' : ' 여유가 있습니다.'}
                                    </p>
                                </div>

                                {/* 패널 2: ESS 배터리 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                                        <BatteryCharging className="w-4 h-4 text-emerald-500" /> ESS 배터리 상태
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500 dark:text-slate-400">잔여 용량 (SoC)</span>
                                            <span className="font-bold text-emerald-600">{selectedStation.batteryLevel.toFixed(1)}%</span>
                                        </div>
                                        <Progress value={selectedStation.batteryLevel} className="h-2 [&>div]:bg-emerald-500" />
                                    </div>
                                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-xs">
                                        <span className="text-slate-500 dark:text-slate-400">AI 권장 동작</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {selectedStation.batteryLevel > 70 ? '피크 시간 방전 대기' : '심야 시간 충전 예정'}
                    </span>
                                    </div>
                                </div>

                                {/* 패널 3: 전력 흐름 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                                        <Zap className="w-4 h-4 text-amber-500" /> 실시간 전력 흐름
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Sun className="w-3.5 h-3.5" /> 태양광 발전</span>
                                            <span className="text-sm font-bold text-orange-500">+{selectedStation.solarGeneration.toFixed(1)} kW</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> 계통 전력 구매</span>
                                            <span className="text-sm font-bold text-blue-600">+{selectedStation.gridConsumption.toFixed(1)} kW</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">총 소비 전력</span>
                                            <span className="text-sm font-bold text-slate-900">{(selectedStation.solarGeneration + selectedStation.gridConsumption).toFixed(1)} kW</span>
                                        </div>
                                    </div>
                                </div>

                                {/* 패널 4: AI 최적화 진단 */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold">
                                        <Activity className="w-4 h-4 text-indigo-500" /> AI 시스템 진단
                                    </div>
                                    <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl h-[calc(100%-2rem)] flex flex-col justify-center">
                                        <p className="text-xs text-indigo-900 leading-relaxed">
                                            <strong>실시간 분석: </strong>
                                            현재 태양광 발전량이 안정적이며, 확보된 ESS 잔량을 활용하여 오후 피크 시간대(14:00~16:00) 계통 전력 구매를 최소화하도록 스케줄링 되었습니다.
                                        </p>
                                        <div className="mt-2 text-[10px] text-indigo-500 font-medium text-right">
                                            최종 업데이트: 방금 전
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}