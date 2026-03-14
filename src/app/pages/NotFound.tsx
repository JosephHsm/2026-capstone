import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-2">페이지를 찾을 수 없습니다</h2>
        <p className="text-slate-600 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link to="/" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              뒤로 가기
            </Link>
          </Button>
          <Button asChild>
            <Link to="/" className="gap-2">
              <Home className="w-4 h-4" />
              홈으로
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
