import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { getSlots, getLogs, getEmployees } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['hsl(173, 58%, 39%)', 'hsl(0, 72%, 51%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)'];

const Reports = () => {
  const { toast } = useToast();
  const slots = getSlots();
  const logs = getLogs();
  const employees = getEmployees();

  const [activeTab, setActiveTab] = useState('usage');

  // Daily usage (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLogs = logs.filter(l => l.in_time.split('T')[0] === dateStr);

    return {
      date: d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      entries: dayLogs.length
    };
  });

  const slotDistribution = [
    { name: 'Car - Free', value: slots.filter(s => s.slot_type === 'car' && s.status === 'free').length },
    { name: 'Car - Occupied', value: slots.filter(s => s.slot_type === 'car' && s.status === 'occupied').length },
    { name: 'Bike - Free', value: slots.filter(s => s.slot_type === 'bike' && s.status === 'free').length },
    { name: 'Bike - Occupied', value: slots.filter(s => s.slot_type === 'bike' && s.status === 'occupied').length },
  ];

  const empParkingHistory = employees.map(emp => ({
    name: emp.name,
    visits: logs.filter(l => l.vehicle_number === emp.vehicle_number).length,
  }));

  const visitorLogs = logs.filter(l => l.person_type === 'visitor');

  const exportCSV = (data, filename) => {
    if (data.length === 0) {
      toast({ title: 'No data to export', variant: 'destructive' });
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => `"${row[h] ?? ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);

    toast({ title: `${filename} downloaded` });
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Parking Management Report', 14, 22);

    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    doc.setFontSize(14);
    doc.text('Slot Summary', 14, 42);

    autoTable(doc, {
      startY: 46,
      head: [['Metric', 'Count']],
      body: [
        ['Total Slots', slots.length.toString()],
        ['Free', slots.filter(s => s.status === 'free').length.toString()],
        ['Occupied', slots.filter(s => s.status === 'occupied').length.toString()],
        ['Employees', employees.length.toString()],
      ],
    });

    doc.addPage();

    doc.setFontSize(14);
    doc.text('Recent Parking Logs', 14, 22);

    autoTable(doc, {
      startY: 26,
      head: [['Person', 'Type', 'Vehicle', 'Slot', 'In Time', 'Out Time']],
      body: logs.slice(-20).map(l => [
        l.person_name,
        l.person_type,
        l.vehicle_number,
        l.slot_id,
        new Date(l.in_time).toLocaleString(),
        l.out_time
          ? new Date(l.out_time).toLocaleString()
          : 'Active'
      ]),
    });

    doc.save('parking-report.pdf');
    toast({ title: 'PDF report downloaded' });
  };

  const tabs = [
    { key: 'usage', label: 'Daily Usage' },
    { key: 'employee', label: 'Employee History' },
    { key: 'visitor', label: 'Visitor Logs' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Analytics and exportable reports
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => exportCSV(logs.map(l => ({ ...l })), 'parking-logs.csv')}
            >
              <Download className="w-4 h-4 mr-2" />CSV
            </Button>

            <Button onClick={exportPDF}>
              <FileText className="w-4 h-4 mr-2" />PDF
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Daily Entries</h3>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={last7Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="entries" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Slot Distribution</h3>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={slotDistribution} dataKey="value">
                    {slotDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default Reports;