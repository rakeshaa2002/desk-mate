import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import {
  Download, FileBarChart, TrendingUp, Users, Building2,
  CalendarDays, CreditCard, UserCheck, ClipboardList,
  RefreshCw, FileText, Receipt, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/reports')({
  component: () => <DashboardLayout><ReportsPage /></DashboardLayout>,
});

// ── Chart Data ──────────────────────────────────────────────
const monthlyRevenue = [
  { month: 'Jan', revenue: 62000, subscriptions: 38, newMembers: 12 },
  { month: 'Feb', revenue: 68000, subscriptions: 42, newMembers: 15 },
  { month: 'Mar', revenue: 71000, subscriptions: 44, newMembers: 11 },
  { month: 'Apr', revenue: 74000, subscriptions: 48, newMembers: 18 },
  { month: 'May', revenue: 78000, subscriptions: 51, newMembers: 14 },
  { month: 'Jun', revenue: 81000, subscriptions: 55, newMembers: 20 },
  { month: 'Jul', revenue: 85000, subscriptions: 58, newMembers: 22 },
];

const occupancyData = [
  { name: 'Private Cabins', occupied: 8, total: 10, pct: 80 },
  { name: 'Dedicated Desks', occupied: 14, total: 20, pct: 70 },
  { name: 'Hot Desks', occupied: 30, total: 40, pct: 75 },
  { name: 'Meeting Rooms', occupied: 3, total: 5, pct: 60 },
  { name: 'Conference Rooms', occupied: 2, total: 4, pct: 50 },
  { name: 'Event Spaces', occupied: 1, total: 2, pct: 50 },
];

const attendanceTrend = [
  { day: 'Mon', present: 42, absent: 8 },
  { day: 'Tue', present: 48, absent: 6 },
  { day: 'Wed', present: 45, absent: 9 },
  { day: 'Thu', present: 50, absent: 4 },
  { day: 'Fri', present: 38, absent: 12 },
  { day: 'Sat', present: 20, absent: 5 },
];

// ── Report Definitions ──────────────────────────────────────
interface ReportDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const REPORTS: ReportDef[] = [
  { id: 'daily',       title: 'Daily Revenue',       description: 'Revenue collected today from all plans.',           icon: CreditCard,    color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'monthly',     title: 'Monthly Revenue',     description: 'Full revenue breakdown for the current month.',     icon: TrendingUp,    color: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'yearly',      title: 'Yearly Revenue',      description: 'Annual financial summary with GST breakdown.',      icon: FileBarChart,  color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 'membership',  title: 'Membership Report',   description: 'Active, expired and suspended member details.',     icon: Users,         color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  { id: 'attendance',  title: 'Attendance Report',   description: 'Check-in/out logs with flag summary.',             icon: UserCheck,     color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'occupancy',   title: 'Workspace Occupancy', description: 'Occupancy rates across all workspace types.',      icon: Building2,     color: 'text-teal-600',   bg: 'bg-teal-100 dark:bg-teal-900/30' },
  { id: 'subscription',title: 'Subscription Report', description: 'Plan-wise subscription distribution & renewals.',  icon: ClipboardList, color: 'text-rose-600',   bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { id: 'payment',     title: 'Payment Report',      description: 'Paid, pending and overdue invoice summary.',       icon: Receipt,       color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 'visitor',     title: 'Visitor Report',      description: 'Visitor log with check-in/out and host details.',  icon: CalendarDays,  color: 'text-cyan-600',   bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
];

// ── Report CSV generators ────────────────────────────────────
function generateCSV(reportId: string): string {
  switch (reportId) {
    case 'daily':
    case 'monthly':
    case 'yearly':
      return 'Month,Revenue,Subscriptions,New Members\n' +
        monthlyRevenue.map(r => `${r.month},$${r.revenue},${r.subscriptions},${r.newMembers}`).join('\n');
    case 'membership':
      return 'Member,Email,Plan,Status,Expiry\n' +
        'Aarav Sharma,aarav@northlabs.io,Annual,Active,2025-11-02\n' +
        'Priya Menon,priya@fluxwave.com,Monthly,Active,2025-07-14\n' +
        'Kenji Watanabe,kenji@orbit.co,Monthly,Expired,2025-06-01\n' +
        'Sofia Rossi,sofia@paperkite.eu,Quarterly,Active,2025-07-20';
    case 'attendance':
      return 'Day,Present,Absent\n' +
        attendanceTrend.map(d => `${d.day},${d.present},${d.absent}`).join('\n');
    case 'occupancy':
      return 'Workspace Type,Occupied,Total,Occupancy %\n' +
        occupancyData.map(o => `${o.name},${o.occupied},${o.total},${o.pct}%`).join('\n');
    case 'subscription':
      return 'Plan,Count,Revenue\nDay Pass,5,$125\nMonthly,22,$6578\nQuarterly,18,$14382\nAnnual,13,$32487';
    case 'payment':
      return 'Invoice,Member,Amount,GST,Status\nINV-2841,Priya Menon,$299,$53.82,Paid\nINV-2842,Aarav Sharma,$2499,$449.82,Paid\nINV-2843,Kenji Watanabe,$799,$143.82,Pending';
    case 'visitor':
      return 'Visitor,Host,Purpose,ETA,Status,Date\nRahul Iyer,Aarav Sharma,Business Meeting,10:30 AM,Active,2026-07-15\nMaya Chen,Priya Menon,Interview,11:00 AM,Checked In,2026-07-15';
    default:
      return 'No data available';
  }
}

function downloadCSV(reportId: string, title: string) {
  const csv = generateCSV(reportId);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Custom Tooltip ───────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === 'revenue' ? `$${p.value.toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Preview Modals ───────────────────────────────────────────
function OccupancyBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-primary"
        />
      </div>
    </div>
  );
}

function ReportsPage() {
  const [period, setPeriod] = useState('monthly');
  const [preview, setPreview] = useState<ReportDef | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = (report: ReportDef) => {
    setGenerating(report.id);
    setTimeout(() => {
      downloadCSV(report.id, report.title);
      setGenerating(null);
    }, 800);
  };

  // Chart data based on selected period
  const chartData = period === 'weekly'
    ? attendanceTrend.map(d => ({ month: d.day, revenue: d.present * 1200 }))
    : monthlyRevenue;

  // KPI summary
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const avgMonthly   = Math.round(totalRevenue / monthlyRevenue.length);
  const topMonth     = monthlyRevenue.reduce((a, b) => a.revenue > b.revenue ? a : b);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports &amp; analytics</h1>
          <p className="text-muted-foreground mt-1">Generate and export operational and financial reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36 bg-muted/40 border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="quarterly">This Quarter</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={() => downloadCSV('monthly', 'full_report')}>
            <Download className="w-4 h-4" /> Export All
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue (YTD)',  value: `$${totalRevenue.toLocaleString()}`, sub: '+12.4% vs last year', positive: true },
          { label: 'Avg Monthly Revenue',  value: `$${avgMonthly.toLocaleString()}`,   sub: 'Across 7 months',     positive: true },
          { label: 'Best Month',           value: topMonth.month,                      sub: `$${topMonth.revenue.toLocaleString()}`,  positive: true },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
            <p className={`text-xs mt-1 ${kpi.positive ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-base">Monthly revenue</h2>
            <p className="text-sm text-muted-foreground">Revenue collected per month (Jan–Jul 2026)</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => downloadCSV('monthly', 'monthly_revenue')}>
            <Download className="w-4 h-4" /> CSV
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'hsl(var(--muted))', radius: 8 }} />
            <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Two side-by-side charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Subscriptions Trend */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <h2 className="font-semibold mb-4">Subscription Growth</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<RevenueTooltip />} />
              <Area type="monotone" dataKey="subscriptions" name="Subscriptions" stroke="hsl(var(--primary))" fill="url(#subGrad)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Trend */}
        <div className="rounded-xl border bg-card shadow-sm p-6">
          <h2 className="font-semibold mb-4">Weekly Attendance</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={attendanceTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barSize={20} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<RevenueTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="present" name="Present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold">Generate Reports</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Click Generate to download a CSV report.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Row 1 */}
          {REPORTS.slice(0, 3).map(report => (
            <ReportCard key={report.id} report={report} generating={generating} onGenerate={handleGenerate} onPreview={() => setPreview(report)} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border border-t">
          {REPORTS.slice(3, 6).map(report => (
            <ReportCard key={report.id} report={report} generating={generating} onGenerate={handleGenerate} onPreview={() => setPreview(report)} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border border-t">
          {REPORTS.slice(6, 9).map(report => (
            <ReportCard key={report.id} report={report} generating={generating} onGenerate={handleGenerate} onPreview={() => setPreview(report)} />
          ))}
        </div>
      </div>

      {/* ── Preview / Generate Modal ── */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {preview && <preview.icon className={`w-5 h-5 ${preview.color}`} />}
              {preview?.title}
            </DialogTitle>
            <DialogDescription>{preview?.description}</DialogDescription>
          </DialogHeader>

          {preview?.id === 'occupancy' && (
            <div className="space-y-3 py-2">
              {occupancyData.map(o => <OccupancyBar key={o.name} label={o.name} pct={o.pct} />)}
            </div>
          )}

          {(preview?.id === 'monthly' || preview?.id === 'daily' || preview?.id === 'yearly') && (
            <div className="py-2">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyRevenue} barSize={28}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {preview?.id === 'attendance' && (
            <div className="py-2">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={attendanceTrend} barSize={20}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Bar dataKey="present" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!['occupancy', 'monthly', 'daily', 'yearly', 'attendance'].includes(preview?.id || '') && (
            <div className="py-4 flex flex-col items-center gap-2 text-muted-foreground">
              <FileText className="w-12 h-12 opacity-30" />
              <p className="text-sm">Click Generate to download this report as CSV.</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button className="flex-1 gap-2" onClick={() => { if (preview) handleGenerate(preview); setPreview(null); }}>
              <Download className="w-4 h-4" /> Download CSV
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Report Card Component ─────────────────────────────────────
function ReportCard({ report, generating, onGenerate, onPreview }: {
  report: ReportDef;
  generating: string | null;
  onGenerate: (r: ReportDef) => void;
  onPreview: () => void;
}) {
  const isLoading = generating === report.id;
  return (
    <div className="p-5 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors group">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${report.bg}`}>
          <report.icon className={`w-4 h-4 ${report.color}`} />
        </div>
        <div>
          <p className="font-medium text-sm">{report.title}</p>
          <p className="text-xs text-muted-foreground hidden sm:block">{report.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onPreview}>
          <Eye className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => onGenerate(report)}
          disabled={isLoading}
        >
          {isLoading
            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating…</>
            : <><Download className="w-3.5 h-3.5" /> Generate</>}
        </Button>
      </div>
    </div>
  );
}
