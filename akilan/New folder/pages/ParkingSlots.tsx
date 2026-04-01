import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ParkingSlot, SlotType, ShiftType, SlotStatus } from '@/types/parking';
import { getSlots, addSlot, updateSlot, deleteSlot } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ParkingSlots = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ParkingSlot | null>(null);
  const [form, setForm] = useState({ slot_id: '', slot_type: 'car' as SlotType, shift_type: 'morning' as ShiftType, status: 'free' as SlotStatus });
  const { toast } = useToast();

  const reload = () => setSlots(getSlots());
  useEffect(() => { reload(); }, []);

  const filtered = slots.filter(s => {
    if (search && !s.slot_id.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && s.slot_type !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ slot_id: '', slot_type: 'car', shift_type: 'morning', status: 'free' });
    setDialogOpen(true);
  };

  const openEdit = (slot: ParkingSlot) => {
    setEditing(slot);
    setForm({ slot_id: slot.slot_id, slot_type: slot.slot_type, shift_type: slot.shift_type, status: slot.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.slot_id.trim()) { toast({ title: 'Slot ID is required', variant: 'destructive' }); return; }
    if (editing) {
      updateSlot(editing.slot_id, { slot_type: form.slot_type, shift_type: form.shift_type, status: form.status });
      toast({ title: 'Slot updated successfully' });
    } else {
      if (slots.find(s => s.slot_id === form.slot_id)) { toast({ title: 'Slot ID already exists', variant: 'destructive' }); return; }
      addSlot({ ...form, created_at: new Date().toISOString() });
      toast({ title: 'Slot created successfully' });
    }
    setDialogOpen(false);
    reload();
  };

  const handleDelete = (id: string) => {
    deleteSlot(id);
    toast({ title: 'Slot deleted' });
    reload();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Parking Slots</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all parking slots</p>
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" />Add Slot</Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by slot ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="bike">Bike</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Slot ID</th><th>Type</th><th>Shift</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(slot => (
                  <tr key={slot.slot_id}>
                    <td className="font-mono font-medium">{slot.slot_id}</td>
                    <td><span className={slot.slot_type === 'car' ? 'badge-car' : 'badge-bike'}>{slot.slot_type}</span></td>
                    <td className="capitalize">{slot.shift_type}</td>
                    <td><span className={slot.status === 'free' ? 'badge-free' : 'badge-occupied'}>{slot.status}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(slot)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(slot.slot_id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No slots found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Slot' : 'Add New Slot'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Slot ID</Label>
              <Input value={form.slot_id} onChange={e => setForm(f => ({ ...f, slot_id: e.target.value }))} disabled={!!editing} placeholder="e.g. A-05" />
            </div>
            <div className="space-y-2">
              <Label>Slot Type</Label>
              <Select value={form.slot_type} onValueChange={(v: SlotType) => setForm(f => ({ ...f, slot_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="car">Car</SelectItem><SelectItem value="bike">Bike</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Shift Type</Label>
              <Select value={form.shift_type} onValueChange={(v: ShiftType) => setForm(f => ({ ...f, shift_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="morning">Morning</SelectItem><SelectItem value="night">Night</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: SlotStatus) => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="free">Free</SelectItem><SelectItem value="occupied">Occupied</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ParkingSlots;
