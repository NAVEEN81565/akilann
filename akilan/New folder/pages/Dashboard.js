import { useEffect, useState } from "react";
import { getDashboardStats, getSlots, getLogs } from "@/lib/store";
import {
  ParkingSquare,
  Users,
  Car,
  Activity,
  CircleCheckBig,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AdminLayout from "@/components/AdminLayout";

const COLORS = [
  "hsl(173, 58%, 39%)",
  "hsl(0, 72%, 51%)",
  "hsl(199, 89%, 48%)",
  "hsl(38, 92%, 50%)",
];

const Dashboard = () => {
  // ❌ Removed TypeScript type
  const [stats, setStats] = useState({
    totalSlots: 0,
    occupiedSlots: 0,
    freeSlots: 0,
    totalEmployees: 0,
    activeVehicles: 0,
  });

  useEffect(() => {
    setStats(getDashboardStats());
  }, []);

  const slots = getSlots();
  const logs = getLogs();

  const pieData = [
    { name: "Free", value: stats.freeSlots },
    { name: "Occupied", value: stats.occupiedSlots },
  ];

  const slotTypeData = [
    {
      name: "Car Slots",
      free: slots.filter(
        (s) => s.slot_type === "car" && s.status === "free"
      ).length,
      occupied: slots.filter(
        (s) => s.slot_type === "car" && s.status === "occupied"
      ).length,
    },
    {
      name: "Bike Slots",
      free: slots.filter(
        (s) => s.slot_type === "bike" && s.status === "free"
      ).length,
      occupied: slots.filter(
        (s) => s.slot_type === "bike" && s.status === "occupied"
      ).length,
    },
  ];

  const recentLogs = logs.slice(-5).reverse();

  const statCards = [
    {
      label: "Total Slots",
      value: stats.totalSlots,
      icon: ParkingSquare,
      color: "hsl(173, 58%, 39%)",
    },
    {
      label: "Occupied",
      value: stats.occupiedSlots,
      icon: Car,
      color: "hsl(0, 72%, 51%)",
    },
    {
      label: "Free Slots",
      value: stats.freeSlots,
      icon: CircleCheckBig,
      color: "hsl(142, 71%, 45%)",
    },
    {
      label: "Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "hsl(199, 89%, 48%)",
    },
    {
      label: "Active Vehicles",
      value: stats.activeVehicles,
      icon: Activity,
      color: "hsl(38, 92%, 50%)",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of parking management system
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="stat-card">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: card.color + "1a" }}
                >
                  <card.icon
                    className="w-5 h-5"
                    style={{ color: card.color }}
                  />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground mt-3">
                {card.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {card.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Slot Availability
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Slots by Type
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={slotTypeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220 13% 91%)"
                />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="free"
                  fill={COLORS[0]}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="occupied"
                  fill={COLORS[1]}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Recent Activity
          </h3>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Type</th>
                  <th>Vehicle</th>
                  <th>Slot</th>
                  <th>In Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-medium">{log.person_name}</td>
                    <td>
                      <span
                        className={
                          log.person_type === "employee"
                            ? "badge-car"
                            : "badge-bike"
                        }
                      >
                        {log.person_type}
                      </span>
                    </td>
                    <td className="font-mono text-sm">
                      {log.vehicle_number}
                    </td>
                    <td>{log.slot_id}</td>
                    <td className="text-sm">
                      {new Date(log.in_time).toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={
                          log.out_time
                            ? "badge-free"
                            : "badge-occupied"
                        }
                      >
                        {log.out_time ? "Exited" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;