import { Outlet, NavLink } from "react-router";
import {
  LayoutDashboard,
  Map,
  Zap,
  Brain,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div>
              <h1 className="font-semibold text-lg">EV 충전소 관제</h1>
              <p className="text-slate-400 text-sm">관리 시스템</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
            <div className="text-sm text-slate-400">
              <p>시스템 상태: 정상</p>
              <p className="text-xs mt-1">최종 업데이트: 방금 전</p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-600 hover:text-slate-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div className="flex items-center gap-4 ml-auto">
                <div className="text-right">
                  <p className="text-sm text-slate-600">관리자</p>
                  <p className="text-xs text-slate-500">admin@evcharge.kr</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  A
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
