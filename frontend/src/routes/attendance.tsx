import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Clock, CheckCircle2, AlertCircle, Download,
  UserCheck, MoreHorizontal, Eye, Edit2, Trash2, TrendingUp, LogIn, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/attendance')({
  component: () => <DashboardLayout><AttendancePage /></DashboardLayout>,
});

type AttendanceFlag = 'On time' | 'Late entry' | 'Early exit' | 'Absent' | 'Overtime';

interface AttendanceRecord {
  id: string;
  member: string;
  email: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  flag: AttendanceFlag;
  date: string;
  workspace: string;
}

const FLAG_STYLE: Record<AttendanceFlag, string> = {
  'On time':    'text-green-600 dark:text-green-400',
  'Late entry': 'text-amber-600 dark:text-amber-400',
  'Early exit': 'text-orange-600 dark:text-orange-400',
  'Absent':     'text-red-600 dark:text-red-400',
  'Overtime':   'text-blue-600 dark:text-blue-400',
};

const FLAG_BADGE: Record<AttendanceFlag, string> = {
  'On time':    'bg-green-100 dark:bg-green-900/30',
  'Late entry': 'bg-amber-100 dark:bg-amber-900/30',
  'Early exit': 'bg-orange-100 dark:bg-orange-900/30',
  'Absent':     'bg-red-100 dark:bg-red-900/30',
  'Overtime':   'bg-blue-100 dark:bg-blue-900/30',
};

function calcDuration(checkIn: string, checkOut: string): string {
  if (!checkIn || !checkOut || checkIn === '—' || checkOut === '—') return '—';
  const [ih, im] = checkIn.split(':').map(Number);
  const [oh, om] = checkOut.split(':').map(Number);
  const totalMins = (oh * 60 + om) - (ih * 60 + im);
  if (totalMins <= 0) return '—';
  return `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;
}

function calcFlag(checkIn: string, checkOut: string): AttendanceFlag {
  if (!checkIn || checkIn === '—') return 'Absent';
  const [ih] = checkIn.split(':').map(Number);
  const [oh] = (checkOut || '00:00').split(':').map(Number);
  const totalH = oh - ih;
  if (ih > 10) return 'Late entry';
  if (totalH > 9) return 'Overtime';
  if (totalH < 7 && checkOut && checkOut !== '—') return 'Early exit';
  return 'On time';
}

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const initialRecords: AttendanceRecord[] = [
  { id: 'a1', member: 'Aarav Sharma',   email: 'aarav@northlabs.io', checkIn: '09:02', checkOut: '18:45', duration: '9h 43m', flag: 'On time',    date: today,     workspace: 'Cabin 4B' },
  { id: 'a2', member: 'Priya Menon',    email: 'priya@fluxwave.com', checkIn: '09:38', checkOut: '17:12', duration: '7h 34m', flag: 'Late entry',  date: today,     workspace: 'Desk 12' },
  { id: 'a3', member: 'Sofia Rossi',    email: 'sofia@paperkite.eu', checkIn: '08:47', checkOut: '19:20', duration: '10h 33m', flag: 'On time',   date: today,     workspace: 'Cabin 2A' },
  { id: 'a4', member: 'Lina Haddad',   email: 'lina@vestra.app',    checkIn: '10:14', checkOut: '16:40', duration: '6h 26m', flag: 'Late entry',  date: today,     workspace: 'Desk 05' },
  { id: 'a5', member: 'Tom Chen',       email: 'tom@nexgen.io',      checkIn: '08:55', checkOut: '18:00', duration: '9h 05m', flag: 'On time',    date: today,     workspace: 'Cabin 1A' },
  { id: 'a6', member: 'Aisha Patel',   email: 'aisha@springboard.co', checkIn: '09:10', checkOut: '17:30', duration: '8h 20m', flag: 'On time', date: today,     workspace: 'Desk 08' },
  { id: 'a7', member: 'Kenji Watanabe', email: 'kenji@orbit.co',     checkIn: '—',     checkOut: '—',     duration: '—',      flag: 'Absent',     date: today,     workspace: 'Hot Desk' },
  { id: 'a8', member: 'Aarav Sharma',   email: 'aarav@northlabs.io', checkIn: '09:00', checkOut: '18:30', duration: '9h 30m', flag: 'On time',    date: yesterday, workspace: 'Cabin 4B' },
  { id: 'a9', member: 'Priya Menon',    email: 'priya@fluxwave.com', checkIn: '10:05', checkOut: '17:00', duration: '6h 55m', flag: 'Late entry',  date: yesterday, workspace: 'Desk 12' },
  { id: 'a10', member: 'Marcus Bell',   email: 'marcus@steelroot.io', checkIn: '11:00', checkOut: '15:30', duration: '4h 30m', flag: 'Early exit', date: yesterday, workspace: 'Hot Desk' },
];

const avatarColors = ['bg-blue-100 text-blue-700','bg-purple-100 text-purple-700','bg-amber-100 text-amber-700','bg-green-100 text-green-700','bg-rose-100 text-rose-700','bg-teal-100 text-teal-700','bg-indigo-100 text-indigo-700','bg-orange-100 text-orange-700'];
function getInitials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

const MEMBERS = ['Aarav Sharma','Priya Menon','Sofia Rossi','Lina Haddad','Tom Chen','Aisha Patel','Kenji Watanabe','Marcus Bell'];

function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);
  const [selectedDate, setSelectedDate] = useState(today);
  const [flagFilter, setFlagFilter] = useState<'All' | AttendanceFlag>('All');
  const [viewRecord, setViewRecord] = useState<AttendanceRecord | null>(null);
  const [editRecord, setEditRecord] = useState<AttendanceRecord | null>(null);
  const [showManual, setShowManual] = useState(false);

  const [manualForm, setManualForm] = useState({
    member: '', date: today, checkIn: '', checkOut: '', workspace: '',
  });

  const filtered = records.filter(r => {
    const matchDate = r.date === selectedDate;
    const matchFlag = flagFilter === 'All' || r.flag === flagFilter;
    return matchDate && matchFlag;
  });

  // Stats for selected date
  const dateRecords = records.filter(r => r.date === selectedDate);
  const onTime  = dateRecords.filter(r => r.flag === 'On time').length;
  const late    = dateRecords.filter(r => r.flag === 'Late entry' || r.flag === 'Early exit').length;
  const absent  = dateRecords.filter(r => r.flag === 'Absent').length;
  const total   = dateRecords.length;

  const handleManualAdd = () => {
    if (!manualForm.member || !manualForm.checkIn) return;
    const duration = calcDuration(manualForm.checkIn, manualForm.checkOut);
    const flag = calcFlag(manualForm.checkIn, manualForm.checkOut);
    const newRec: AttendanceRecord = {
      id: String(Date.now()),
      member: manualForm.member,
      email: `${manualForm.member.split(' ')[0].toLowerCase()}@company.com`,
      checkIn: manualForm.checkIn,
      checkOut: manualForm.checkOut || '—',
      duration,
      flag,
      date: manualForm.date || today,
      workspace: manualForm.workspace || 'Hot Desk',
    };
    setRecords(p => [newRec, ...p]);
    setShowManual(false);
    setManualForm({ member: '', date: today, checkIn: '', checkOut: '', workspace: '' });
  };

  const handleEditSave = () => {
    if (!editRecord) return;
    const duration = calcDuration(editRecord.checkIn, editRecord.checkOut);
    const flag = calcFlag(editRecord.checkIn, editRecord.checkOut);
    setRecords(p => p.map(r => r.id === editRecord.id ? { ...editRecord, duration, flag } : r));
    setEditRecord(null);
  };

  const handleDelete = (id: string) => setRecords(p => p.filter(r => r.id !== id));

  // Export CSV
  const handleExport = () => {
    const header = 'Date,Member,Email,Check-in,Check-out,Duration,Flag,Workspace\n';
    const rows = filtered.map(r => `${r.date},${r.member},${r.email},${r.checkIn},${r.checkOut},${r.duration},${r.flag},${r.workspace}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `attendance_${selectedDate}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const flagTabs: ('All' | AttendanceFlag)[] = ['All', 'On time', 'Late entry', 'Early exit', 'Absent', 'Overtime'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-1">Auto-generated from biometric check-ins &amp; check-outs.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button className="gap-2" onClick={() => setShowManual(true)}>
            <LogIn className="w-4 h-4" /> Manual Entry
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Records',  value: total,  icon: UserCheck,     color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'On Time',        value: onTime, icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Late / Early',   value: late,   icon: AlertCircle,   color: 'text-amber-600',  bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Absent',         value: absent, icon: TrendingUp,    color: 'text-red-600',    bg: 'bg-red-100 dark:bg-red-900/30' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-xl border bg-card p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-3xl font-bold mt-1">{s.value}</p>
            </div>
            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Card */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-muted/40 border rounded-lg px-3 py-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-medium outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 border text-sm overflow-x-auto">
            {flagTabs.map(t => (
              <button key={t} onClick={() => setFlagFilter(t)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${flagFilter === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left font-semibold text-foreground px-6 py-3.5">Member</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Check-in</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Check-out</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Duration</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Flag</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Workspace</th>
                <th className="px-4 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-muted-foreground">
                      No attendance records for {selectedDate}.
                    </td>
                  </tr>
                ) : filtered.map((record, i) => (
                  <motion.tr key={record.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          record.flag === 'Absent' ? 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-300' : avatarColors[i % avatarColors.length]
                        }`}>
                          {getInitials(record.member)}
                        </div>
                        <div>
                          <p className={`font-semibold leading-tight ${record.flag === 'Absent' ? 'text-muted-foreground' : ''}`}>{record.member}</p>
                          <p className="text-xs text-muted-foreground">{record.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`font-mono text-sm font-medium ${record.checkIn === '—' ? 'text-muted-foreground' : ''}`}>
                        {record.checkIn}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`font-mono text-sm font-medium ${record.checkOut === '—' ? 'text-muted-foreground' : ''}`}>
                        {record.checkOut}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm font-semibold ${record.duration === '—' ? 'text-muted-foreground' : ''}`}>
                        {record.duration}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${FLAG_BADGE[record.flag]} ${FLAG_STYLE[record.flag]}`}>
                        {record.flag}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{record.workspace}</td>
                    <td className="px-4 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => setViewRecord(record)} className="gap-2 cursor-pointer">
                            <Eye className="w-4 h-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditRecord({ ...record })} className="gap-2 cursor-pointer">
                            <Edit2 className="w-4 h-4" /> Edit Record
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(record.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t bg-muted/10 text-sm">
                  <td className="px-6 py-3 font-semibold text-muted-foreground">
                    {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                  </td>
                  <td colSpan={6} className="px-4 py-3 text-right pr-6 text-muted-foreground text-xs">
                    <span className="text-green-600 dark:text-green-400 font-medium">{filtered.filter(r => r.flag === 'On time').length} on time</span>
                    {' · '}
                    <span className="text-amber-600 dark:text-amber-400 font-medium">{filtered.filter(r => r.flag === 'Late entry' || r.flag === 'Early exit').length} irregular</span>
                    {' · '}
                    <span className="text-red-600 dark:text-red-400 font-medium">{filtered.filter(r => r.flag === 'Absent').length} absent</span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── Manual Entry Modal ── */}
      <Dialog open={showManual} onOpenChange={setShowManual}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-primary" /> Manual Attendance Entry
            </DialogTitle>
            <DialogDescription>Add an attendance record for a member manually.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Member *</Label>
              <Select value={manualForm.member} onValueChange={v => setManualForm(f => ({ ...f, member: v }))}>
                <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>{MEMBERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={manualForm.date} onChange={e => setManualForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Workspace</Label>
              <Input placeholder="e.g. Cabin 1A" value={manualForm.workspace} onChange={e => setManualForm(f => ({ ...f, workspace: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Check-in Time *</Label>
              <Input type="time" value={manualForm.checkIn} onChange={e => setManualForm(f => ({ ...f, checkIn: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Check-out Time</Label>
              <Input type="time" value={manualForm.checkOut} onChange={e => setManualForm(f => ({ ...f, checkOut: e.target.value }))} />
            </div>
            {manualForm.checkIn && (
              <div className="col-span-2 p-3 rounded-lg bg-muted/40 border text-sm flex justify-between">
                <span className="text-muted-foreground">Calculated Duration</span>
                <span className="font-semibold">{manualForm.checkOut ? calcDuration(manualForm.checkIn, manualForm.checkOut) : 'In progress'}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManual(false)}>Cancel</Button>
            <Button onClick={handleManualAdd} disabled={!manualForm.member || !manualForm.checkIn}>
              <LogIn className="w-4 h-4 mr-2" /> Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Record Modal ── */}
      <Dialog open={!!viewRecord} onOpenChange={() => setViewRecord(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Attendance Details</DialogTitle></DialogHeader>
          {viewRecord && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${avatarColors[0]}`}>
                  {getInitials(viewRecord.member)}
                </div>
                <div>
                  <p className="font-semibold">{viewRecord.member}</p>
                  <p className="text-sm text-muted-foreground">{viewRecord.email}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${FLAG_BADGE[viewRecord.flag]} ${FLAG_STYLE[viewRecord.flag]}`}>
                    {viewRecord.flag}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Date', value: viewRecord.date },
                  { label: 'Workspace', value: viewRecord.workspace },
                  { label: 'Check-in', value: viewRecord.checkIn },
                  { label: 'Check-out', value: viewRecord.checkOut },
                  { label: 'Duration', value: viewRecord.duration },
                  { label: 'Status Flag', value: viewRecord.flag },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full gap-2" onClick={() => { setEditRecord({ ...viewRecord }); setViewRecord(null); }}>
                <Edit2 className="w-4 h-4" /> Edit Record
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Record Modal ── */}
      <Dialog open={!!editRecord} onOpenChange={() => setEditRecord(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Attendance
            </DialogTitle>
            <DialogDescription>Manually adjust check-in/out times for {editRecord?.member}.</DialogDescription>
          </DialogHeader>
          {editRecord && (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5">
                <Label>Check-in Time</Label>
                <Input type="time" value={editRecord.checkIn} onChange={e => setEditRecord(r => r ? { ...r, checkIn: e.target.value } : r)} />
              </div>
              <div className="space-y-1.5">
                <Label>Check-out Time</Label>
                <Input type="time" value={editRecord.checkOut === '—' ? '' : editRecord.checkOut} onChange={e => setEditRecord(r => r ? { ...r, checkOut: e.target.value } : r)} />
              </div>
              <div className="space-y-1.5">
                <Label>Workspace</Label>
                <Input value={editRecord.workspace} onChange={e => setEditRecord(r => r ? { ...r, workspace: e.target.value } : r)} />
              </div>
              <div className="col-span-1 p-3 rounded-lg bg-muted/40 text-sm space-y-1">
                <p className="text-muted-foreground text-xs">Calculated</p>
                <p className="font-bold">{calcDuration(editRecord.checkIn, editRecord.checkOut)}</p>
                <p className={`text-xs font-semibold ${FLAG_STYLE[calcFlag(editRecord.checkIn, editRecord.checkOut)]}`}>
                  {calcFlag(editRecord.checkIn, editRecord.checkOut)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRecord(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
