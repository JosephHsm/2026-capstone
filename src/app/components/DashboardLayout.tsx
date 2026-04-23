import { Outlet, NavLink } from "react-router";
import {
  LayoutDashboard,
  Map,
  Zap,
  Brain,
  BarChart3,
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Moon,
  Sun
} from "lucide-react";
import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000,
      staleTime: 3000,
    },
  },
});

const navigation = [
  { name: "대시보드", path: "/", icon: LayoutDashboard },
  { name: "지도 뷰", path: "/map", icon: Map },
  { name: "에너지 모니터링", path: "/energy", icon: Zap },
  { name: "AI 최적화", path: "/ai", icon: Brain },
  { name: "통계 및 리포트", path: "/statistics", icon: BarChart3 },
  { name: "관리자 콘솔", path: "/admin", icon: Settings },
];

export function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 화면 크기에 따른 초기 상태 설정 및 반응형 처리
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 다크 모드 초기 설정 (로컬 스토리지 또는 OS 시스템 설정 확인)
  useEffect(() => {
    const isDark =
        localStorage.getItem("theme") === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);

    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // 다크 모드 토글 함수
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
      <QueryClientProvider client={queryClient}>
        {/* 배경색 다크모드 대응 (기본: 연한 회색, 다크모드: 아주 어두운 회색) */}
        <div className="min-h-screen bg-[#F2F4F6] dark:bg-[#121212] transition-colors duration-300">

          {/* 모바일 환경일 때 배경 어둡게 처리 (Backdrop) */}
          {isMobile && isSidebarOpen && (
              <div
                  className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                  onClick={() => setIsSidebarOpen(false)}
              />
          )}

          {/* 사이드바 영역 */}
          <aside
              className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl ${
                  isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h1 className="font-bold text-lg tracking-tight">EV 충전소 관제</h1>
                <p className="text-slate-400 text-sm">관리 시스템</p>
              </div>
              <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
              {navigation.map((item) => (
                  <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      onClick={() => isMobile && setIsSidebarOpen(false)}
                      className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                              isActive
                                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-900/20"
                                  : "text-slate-400 hover:bg-slate-800 hover:text-white font-medium"
                          }`
                      }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800 bg-slate-900">
              <div className="text-sm text-slate-400">
                <div className="flex items-center gap-2.5 mb-1.5 font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                  <span className="text-slate-300">시스템 정상 작동</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 ml-5">최종 업데이트: 방금 전</p>
              </div>
            </div>
          </aside>

          {/* 메인 콘텐츠 영역 */}
          <div
              className={`transition-all duration-300 ease-in-out flex flex-col min-h-screen ${
                  isSidebarOpen ? "lg:pl-64" : "lg:pl-0"
              }`}
          >
            {/* 상단 헤더 (다크모드 대응) */}
            <header className="bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-colors duration-300">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
                <div className="flex items-center gap-4">
                  <button
                      onClick={toggleSidebar}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 p-2 rounded-lg transition-colors flex items-center justify-center"
                  >
                    {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                  </button>

                  {!isSidebarOpen && !isMobile && (
                      <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg hidden sm:block animate-in fade-in slide-in-from-left-4 duration-300">
                        EV 관제 센터
                      </h2>
                  )}
                </div>

                {/* 우측 도구 및 사용자 프로필 */}
                <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                  {/* 다크 모드 토글 버튼 */}
                  <button
                      onClick={toggleTheme}
                      className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                      aria-label="Toggle dark mode"
                  >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>

                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 dark:text-slate-200">관리자</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">admin@evcharge.kr</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm cursor-pointer hover:bg-blue-700 transition-colors">
                    A
                  </div>
                </div>
              </div>
            </header>

            {/* 페이지 렌더링 영역 */}
            <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full max-w-7xl mx-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </QueryClientProvider>
  );
}