import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { mockStations, ChargingStation } from "../services/mockData";
import { Battery, Zap, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    kakao: any;
  }
}

export function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: stations } = useQuery({
    queryKey: ["stations"],
    queryFn: () => Promise.resolve(mockStations),
  });

  // Load Kakao Maps SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_MAP_API_KEY&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        setMapLoaded(true);
      });
    };
    
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !stations) return;

    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780), // Seoul
      level: 7,
    };

    const map = new window.kakao.maps.Map(container, options);

    // Add markers
    stations.forEach((station) => {
      const markerPosition = new window.kakao.maps.LatLng(station.lat, station.lng);
      
      // Custom marker content
      const content = `
        <div style="
          background: ${
            station.status === "active"
              ? "#10b981"
              : station.status === "warning"
              ? "#f59e0b"
              : "#ef4444"
          };
          color: white;
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
        ">
          ${station.name}
        </div>
      `;

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: markerPosition,
        content: content,
        yAnchor: 1,
      });

      customOverlay.setMap(map);

      // Add click event
      const overlayElement = customOverlay.a;
      if (overlayElement) {
        overlayElement.addEventListener("click", () => {
          setSelectedStation(station);
          map.setCenter(markerPosition);
          map.setLevel(5);
        });
      }
    });
  }, [mapLoaded, stations]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">충전소 위치 지도</h1>
        <p className="text-slate-600 mt-1">실시간 충전소 상태 및 위치 모니터링</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div
              ref={mapRef}
              className="w-full h-[600px] rounded-lg"
              style={{ background: "#f1f5f9" }}
            >
              {!mapLoaded && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">지도를 불러오는 중...</p>
                    <p className="text-sm text-slate-500 mt-2">
                      카카오 맵 API 키가 필요합니다
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Station Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>충전소 상세 정보</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedStation ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg">{selectedStation.name}</h3>
                    <p className="text-sm text-slate-600">ID: {selectedStation.id}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">상태</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                          selectedStation.status === "active"
                            ? "bg-green-100 text-green-800"
                            : selectedStation.status === "warning"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedStation.status === "active"
                          ? "정상"
                          : selectedStation.status === "warning"
                          ? "경고"
                          : "오류"}
                      </span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">충전 현황</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {selectedStation.currentVehicles} / {selectedStation.maxCapacity}
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${
                              (selectedStation.currentVehicles / selectedStation.maxCapacity) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Battery className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">ESS 잔량</span>
                      </div>
                      <div className="text-2xl font-bold">{selectedStation.batteryLevel.toFixed(1)}%</div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${selectedStation.batteryLevel}%` }}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">태양광 발전</span>
                        <span className="font-medium">{selectedStation.solarGeneration.toFixed(1)} kW</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">계통 사용</span>
                        <span className="font-medium">{selectedStation.gridConsumption.toFixed(1)} kW</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>지도에서 충전소를 선택하세요</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">상태 범례</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <span className="text-sm">정상 운영</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500" />
                <span className="text-sm">경고 (90% 이상 사용)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500" />
                <span className="text-sm">오류 (시스템 이상)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
