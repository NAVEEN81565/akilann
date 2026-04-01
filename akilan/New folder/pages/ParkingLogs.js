import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  getLogs,
  addLog,
  updateLog,
  getSlots,
  updateSlot,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Search, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ParkingLogs = () => {
  // ❌ removed <ParkingLog[]>
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // ❌ removed type casting
  const [form, setForm] = useState({
    person_name: "",
    person_type: "employee",
    vehicle_number: "",
    slot_id: "",
  });

  const { toast } = useToast();

  const reload = () => setLogs(getLogs());
  useEffect(() => {
    reload();
  }, []);

  const filtered = logs
    .filter((l) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !l.person_name.toLowerCase().includes(q) &&
          !l.vehicle_number.toLowerCase().includes(q)
        )
          return false;
      }

      if (typeFilter !== "all" && l.person_type !== typeFilter)
        return false;

      if (dateFilter) {
        const logDate = new Date(l.in_time)
          .toISOString()
          .split("T")[0];
        if (logDate !== dateFilter) return false;
      }

      return true;
    })
    .reverse();

  const freeSlots = getSlots().filter((s) => s.status === "free");

  const handleCheckIn = () => {
    if (
      !form.person_name.trim() ||
      !form.vehicle_number.trim() ||
      !form.slot_id
    ) {
      toast({
        title: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    addLog({
      id: Date.now().toString(),
      ...form,
      in_time: new Date().toISOString(),
      out_time: null,
    });

    // ❌ removed "as const"
    updateSlot(form.slot_id, { status: "occupied" });

    toast({ title: "Vehicle checked in" });

    setDialogOpen(false);
    reload();
  };

  // ❌ removed (log: ParkingLog)
  const handleCheckOut = (log) => {
    updateLog(log.id, { out_time: new Date().toISOString() });
    updateSlot(log.slot_id, { status: "free" });

    toast({ title: "Vehicle checked out" });
    reload();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Parking Logs
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track vehicle entries and exits
            </p>
          </div>

          <Button
            onClick={() => {
              setForm({
                person_name: "",
                person_type: "employee",
                vehicle_number: "",
                slot_id: "",
              });
              setDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Check In
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[180px]"
          />

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="visitor">Visitor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Type</th>
                  <th>Vehicle</th>
                  <th>Slot</th>
                  <th>In Time</th>
                  <th>Out Time</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td className="font-medium">
                      {log.person_name}
                    </td>

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

                    <td className="text-sm">
                      {log.out_time ? (
                        new Date(log.out_time).toLocaleString()
                      ) : (
                        <span className="badge-occupied">
                          Active
                        </span>
                      )}
                    </td>

                    <td>
                      {!log.out_time && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckOut(log)}
                        >
                          <LogOut className="w-4 h-4 mr-1" />
                          Out
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vehicle Check-In</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Person Name</Label>
              <Input
                value={form.person_name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    person_name: e.target.value,
                  }))
                }
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="space-y-2">
              <Label>Person Type</Label>
              <Select
                value={form.person_type}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    person_type: v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">
                    Employee
                  </SelectItem>
                  <SelectItem value="visitor">
                    Visitor
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vehicle Number</Label>
              <Input
                value={form.vehicle_number}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    vehicle_number: e.target.value,
                  }))
                }
                placeholder="e.g. MH-12-AB-1234"
              />
            </div>

            <div className="space-y-2">
              <Label>Assign Slot</Label>
              <Select
                value={form.slot_id}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    slot_id: v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select free slot" />
                </SelectTrigger>

                <SelectContent>
                  {freeSlots.map((s) => (
                    <SelectItem
                      key={s.slot_id}
                      value={s.slot_id}
                    >
                      {s.slot_id} ({s.slot_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleCheckIn}>
              Check In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ParkingLogs;