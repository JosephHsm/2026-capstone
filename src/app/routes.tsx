import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./pages/Dashboard";
import { MapView } from "./pages/MapView";
import { EnergyMonitoring } from "./pages/EnergyMonitoring";
import { AIOptimization } from "./pages/AIOptimization";
import { Statistics } from "./pages/Statistics";
import { AdminConsole } from "./pages/AdminConsole";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "map", Component: MapView },
      { path: "energy", Component: EnergyMonitoring },
      { path: "ai", Component: AIOptimization },
      { path: "statistics", Component: Statistics },
      { path: "admin", Component: AdminConsole },
      { path: "*", Component: NotFound },
    ],
  },
]);
