import {
  Activity,
  BookOpen,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Satellite,
  Sliders,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { clearSession, getUser } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/predict", label: "Predict", icon: Sliders },
  { to: "/vision", label: "Vision", icon: ImageIcon },
  { to: "/chat", label: "Assistant", icon: MessageSquare },
  { to: "/knowledge", label: "Knowledge", icon: BookOpen },
];

export function Layout() {
  const navigate = useNavigate();
  const user = getUser();

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/40 p-4 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Satellite className="h-6 w-6 text-primary" />
          <div>
            <p className="text-base font-bold leading-tight">TerraVista</p>
            <p className="text-xs text-muted-foreground">Earth Observation</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          <div className="mb-2 flex items-center gap-2 px-3 text-xs text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            <span>{user ?? "operator"}</span>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
