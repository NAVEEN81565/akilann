import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Car,
  LayoutDashboard,
  ParkingSquare,
  Users,
  ClipboardList,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Parking Slots", path: "/slots", icon: ParkingSquare },
  { label: "Employees", path: "/employees", icon: Users },
  { label: "Parking Logs", path: "/logs", icon: ClipboardList },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

// ✅ Removed TypeScript type
const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("parking_admin_auth");
    navigate("/");
  };

  const SidebarContent = () => (
    <>
      <div
        className="flex items-center gap-3 px-6 py-6 border-b"
        style={{ borderColor: "hsl(217 33% 17%)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "hsl(173 58% 39%)" }}
        >
          <Car className="w-5 h-5" style={{ color: "white" }} />
        </div>
        <div>
          <h1 className="text-base font-bold" style={{ color: "white" }}>
            ParkAdmin
          </h1>
          <p className="text-xs" style={{ color: "hsl(213 31% 60%)" }}>
            Management System
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`sidebar-link ${
                active ? "sidebar-link-active" : "sidebar-link-inactive"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div
        className="px-3 py-4 border-t"
        style={{ borderColor: "hsl(217 33% 17%)" }}
      >
        <button
          onClick={handleLogout}
          className="sidebar-link sidebar-link-inactive w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0"
        style={{ background: "var(--gradient-sidebar)" }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="relative w-64 h-full flex flex-col"
            style={{ background: "var(--gradient-sidebar)" }}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4"
              style={{ color: "hsl(213 31% 60%)" }}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-foreground" />
          </button>
          <span className="font-bold text-foreground">ParkAdmin</span>
          <div className="w-6" />
        </header>

        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;