import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Employees = () => {
  // ❌ removed <Employee[]>
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // ❌ removed <Employee | null>
  const [editing, setEditing] = useState(null);

  // ❌ removed "as ShiftType"
  const [form, setForm] = useState({
    emp_id: "",
    name: "",
    vehicle_number: "",
    shift_type: "morning",
  });

  const { toast } = useToast();

  const reload = () => setEmployees(getEmployees());
  useEffect(() => {
    reload();
  }, []);

  const filtered = employees.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.emp_id.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      e.vehicle_number.toLowerCase().includes(q)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      emp_id: "",
      name: "",
      vehicle_number: "",
      shift_type: "morning",
    });
    setDialogOpen(true);
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      emp_id: emp.emp_id,
      name: emp.name,
      vehicle_number: emp.vehicle_number,
      shift_type: emp.shift_type,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (
      !form.emp_id.trim() ||
      !form.name.trim() ||
      !form.vehicle_number.trim()
    ) {
      toast({
        title: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (editing) {
      updateEmployee(editing.emp_id, {
        name: form.name,
        vehicle_number: form.vehicle_number,
        shift_type: form.shift_type,
      });
      toast({ title: "Employee updated" });
    } else {
      if (employees.find((e) => e.emp_id === form.emp_id)) {
        toast({
          title: "Employee ID already exists",
          variant: "destructive",
        });
        return;
      }

      addEmployee({
        ...form,
        created_at: new Date().toISOString(),
      });

      toast({ title: "Employee added" });
    }

    setDialogOpen(false);
    reload();
  };

  // ❌ removed (id: string)
  const handleDelete = (id) => {
    deleteEmployee(id);
    toast({ title: "Employee deleted" });
    reload();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Employees
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage registered employees
            </p>
          </div>

          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Emp ID</th>
                  <th>Name</th>
                  <th>Vehicle No.</th>
                  <th>Shift</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.emp_id}>
                    <td className="font-mono font-medium">
                      {emp.emp_id}
                    </td>
                    <td>{emp.name}</td>
                    <td className="font-mono text-sm">
                      {emp.vehicle_number}
                    </td>
                    <td className="capitalize">
                      {emp.shift_type}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(emp)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDelete(emp.emp_id)
                          }
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No employees found
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
            <DialogTitle>
              {editing ? "Edit Employee" : "Add Employee"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input
                value={form.emp_id}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    emp_id: e.target.value,
                  }))
                }
                disabled={!!editing}
                placeholder="e.g. EMP005"
              />
            </div>

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g. John Doe"
              />
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
              <Label>Shift Type</Label>
              <Select
                value={form.shift_type}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    shift_type: v,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">
                    Morning
                  </SelectItem>
                  <SelectItem value="night">
                    Night
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave}>
              {editing ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Employees;