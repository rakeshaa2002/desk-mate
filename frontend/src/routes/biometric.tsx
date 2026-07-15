import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Fingerprint, ScanFace, ShieldCheck, ShieldX, Cpu, Eye,
  Plus, Download, RefreshCw, Search, MoreHorizontal, Trash2,
  CheckCircle2, XCircle, Wifi, WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/biometric')({
  component: () => <DashboardLayout><BiometricPage /></DashboardLayout>,
});

type AccessResult = 'Granted' | 'Denied — Expired' | 'Failed' | 'Denied — Suspended';
type Method = 'Fingerprint' | 'Face';
type MemberStatus = 'Active' | 'Expired' | 'Suspended';

interface AccessLog {
  id: string;
  time: string;
  user: string;
  method: Method;
  door: string;
  memberStatus: MemberStatus | 'Unknown';
  result: AccessResult;
}

interface EnrolledMember {
  id: string;
  name: string;
  email: string;
  methods: Method[];
  status: MemberStatus;
  enrolledAt: string;
}

const initialLogs: AccessLog[] = [
  { id: 'l1', time: '09:42 AM', user: 'Aarav Sharma', method: 'Fingerprint', door: 'Main Entry', memberStatus: 'Active', result: 'Granted' },
  { id: 'l2', time: '09:38 AM', user: 'Priya Menon', method: 'Face', door: 'Floor 3', memberStatus: 'Active', result: 'Granted' },
  { id: 'l3', time: '09:33 AM', user: 'Unknown', method: 'Fingerprint', door: 'Main Entry', memberStatus: 'Unknown', result: 'Failed' },
  { id: 'l4', time: '09:22 AM', user: 'Kenji Watanabe', method: 'Face', door: 'Main Entry', memberStatus: 'Expired', result: 'Denied — Expired' },
  { id: 'l5', time: '09:14 AM', user: 'Sofia Rossi', method: 'Fingerprint', door: 'Boardroom', memberStatus: 'Active', result: 'Granted' },
  { id: 'l6', time: '08:55 AM', user: 'Tom Chen', method: 'Face', door: 'Main Entry', memberStatus: 'Active', result: 'Granted' },
  { id: 'l7', time: '08:41 AM', user: 'Lina Haddad', method: 'Fingerprint', door: 'Floor 2', memberStatus: 'Suspended', result: 'Denied — Suspended' },
  { id: 'l8', time: '08:30 AM', user: 'Aisha Patel', method: 'Fingerprint', door: 'Main Entry', memberStatus: 'Active', result: 'Granted' },
];

const initialEnrolled: EnrolledMember[] = [
  { id: 'e1', name: 'Aarav Sharma', email: 'aarav@northlabs.io', methods: ['Fingerprint', 'Face'], status: 'Active', enrolledAt: '2024-11-02' },
  { id: 'e2', name: 'Priya Menon', email: 'priya@fluxwave.com', methods: ['Face'], status: 'Active', enrolledAt: '2025-03-14' },
  { id: 'e3', name: 'Sofia Rossi', email: 'sofia@paperkite.eu', methods: ['Fingerprint'], status: 'Active', enrolledAt: '2025-01-20' },
  { id: 'e4', name: 'Tom Chen', email: 'tom@nexgen.io', methods: ['Fingerprint', 'Face'], status: 'Active', enrolledAt: '2024-05-12' },
  { id: 'e5', name: 'Kenji Watanabe', email: 'kenji@orbit.co', methods: ['Face'], status: 'Expired', enrolledAt: '2025-06-01' },
  { id: 'e6', name: 'Lina Haddad', email: 'lina@vestra.app', methods: ['Fingerprint'], status: 'Suspended', enrolledAt: '2025-09-08' },
];

const RESULT_STYLE: Record<AccessResult, string> = {
  'Granted': 'text-green-600 dark:text-green-400',
  'Denied — Expired': 'text-red-500 dark:text-red-400',
  'Denied — Suspended': 'text-red-500 dark:text-red-400',
  'Failed': 'text-red-500 dark:text-red-400',
};

const STATUS_BADGE: Record<string, string> = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  Expired: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  Suspended: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  Unknown: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

const avatarColors = ['bg-blue-100 text-blue-700','bg-purple-100 text-purple-700','bg-green-100 text-green-700','bg-amber-100 text-amber-700','bg-rose-100 text-rose-700','bg-teal-100 text-teal-700'];
function getInitials(name: string) { return name === 'Unknown' ? '?' : name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

const DOORS = ['Main Entry', 'Floor 2', 'Floor 3', 'Boardroom', 'Server Room', 'Cafeteria'];

function BiometricPage() {
  const [logs, setLogs] = useState<AccessLog[]>(initialLogs);
  const [enrolled, setEnrolled] = useState<EnrolledMember[]>(initialEnrolled);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<'All' | AccessResult>('All');
  const [showEnroll, setShowEnroll] = useState(false);
  const [showSimulate, setShowSimulate] = useState(false);
  const [viewLog, setViewLog] = useState<AccessLog | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollDone, setEnrollDone] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const liveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [enrollForm, setEnrollForm] = useState({ name: '', email: '', methods: [] as Method[], status: 'Active' as MemberStatus });
  const [simForm, setSimForm] = useState({ user: '', method: 'Fingerprint' as Method, door: 'Main Entry' });

  // Live log simulation
  useEffect(() => {
    if (!liveMode) { if (liveRef.current) clearInterval(liveRef.current); return; }
    const users = ['Aarav Sharma', 'Priya Menon', 'Tom Chen', 'Aisha Patel', 'Unknown'];
    const methods: Method[] = ['Fingerprint', 'Face'];
    const results: { status: MemberStatus | 'Unknown'; result: AccessResult }[] = [
      { status: 'Active', result: 'Granted' },
      { status: 'Active', result: 'Granted' },
      { status: 'Expired', result: 'Denied — Expired' },
      { status: 'Unknown', result: 'Failed' },
    ];
    liveRef.current = setInterval(() => {
      const user = users[Math.floor(Math.random() * users.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const door = DOORS[Math.floor(Math.random() * DOORS.length)];
      const { status, result } = results[Math.floor(Math.random() * results.length)];
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const newLog: AccessLog = { id: String(Date.now()), time, user, method, door, memberStatus: status, result };
      setLogs(p => [newLog, ...p.slice(0, 49)]);
    }, 6000);
    return () => { if (liveRef.current) clearInterval(liveRef.current); };
  }, [liveMode]);

  // Enroll biometric with scan animation
  const handleEnroll = () => {
    if (!enrollForm.name || !enrollForm.email || enrollForm.methods.length === 0) return;
    setEnrolling(true);
    setTimeout(() => {
      setEnrolling(false);
      setEnrollDone(true);
      setTimeout(() => {
        const newMember: EnrolledMember = {
          id: String(Date.now()),
          name: enrollForm.name,
          email: enrollForm.email,
          methods: enrollForm.methods,
          status: enrollForm.status,
          enrolledAt: new Date().toISOString().split('T')[0],
        };
        setEnrolled(p => [newMember, ...p]);
        setEnrollDone(false);
        setShowEnroll(false);
        setEnrollForm({ name: '', email: '', methods: [], status: 'Active' });
      }, 1200);
    }, 2500);
  };

  // Simulate access
  const handleSimulate = () => {
    if (!simForm.user) return;
    const member = enrolled.find(e => e.name === simForm.user);
    const status: MemberStatus | 'Unknown' = member?.status || 'Unknown';
    let result: AccessResult = 'Failed';
    if (!member) result = 'Failed';
    else if (status === 'Expired') result = 'Denied — Expired';
    else if (status === 'Suspended') result = 'Denied — Suspended';
    else result = 'Granted';
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const newLog: AccessLog = { id: String(Date.now()), time, user: simForm.user, method: simForm.method, door: simForm.door, memberStatus: status, result };
    setLogs(p => [newLog, ...p]);
    setShowSimulate(false);
  };

  // Export CSV
  const handleExport = () => {
    const header = 'Time,User,Method,Door,Status,Result\n';
    const rows = logs.map(l => `${l.time},${l.user},${l.method},${l.door},${l.memberStatus},${l.result}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'biometric_logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const toggleMethod = (m: Method) => {
    setEnrollForm(f => ({
      ...f, methods: f.methods.includes(m) ? f.methods.filter(x => x !== m) : [...f.methods, m]
    }));
  };

  const filteredLogs = logs.filter(l => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.door.toLowerCase().includes(search.toLowerCase());
    const matchResult = resultFilter === 'All' || l.result === resultFilter;
    return matchSearch && matchResult;
  });

  const grantedToday = logs.filter(l => l.result === 'Granted').length;
  const deniedToday = logs.filter(l => l.result !== 'Granted').length;
  const fingerprintDevices = 12;
  const faceDevices = 6;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biometric access control</h1>
          <p className="text-muted-foreground mt-1">Live logs from fingerprint &amp; face-recognition devices across all doors.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" className="gap-2" onClick={() => setShowSimulate(true)}>
            <ScanFace className="w-4 h-4" /> Simulate Scan
          </Button>
          <Button onClick={() => setShowEnroll(true)} className="gap-2">
            <Fingerprint className="w-4 h-4" /> Enroll biometric
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Successful today', value: grantedToday, icon: ShieldCheck, iconClass: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Denied today', value: deniedToday, icon: ShieldX, iconClass: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
          { label: 'Fingerprint devices', value: fingerprintDevices, icon: Fingerprint, iconClass: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Face devices', value: faceDevices, icon: ScanFace, iconClass: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-xl border bg-card p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconClass}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live Access Logs */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold">Live access logs</h2>
            <button
              onClick={() => setLiveMode(v => !v)}
              className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border font-medium transition-colors ${liveMode ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400' : 'bg-muted text-muted-foreground border-border'}`}
            >
              {liveMode ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {liveMode ? 'Live' : 'Paused'}
            </button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search user or door..." className="pl-9 bg-muted/40 border-none h-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={resultFilter} onValueChange={v => setResultFilter(v as any)}>
              <SelectTrigger className="h-9 w-36 bg-muted/40 border-none"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Results</SelectItem>
                <SelectItem value="Granted">Granted</SelectItem>
                <SelectItem value="Denied — Expired">Denied — Expired</SelectItem>
                <SelectItem value="Denied — Suspended">Denied — Suspended</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5 h-9" onClick={handleExport}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left font-semibold text-foreground px-6 py-3.5">Time</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">User</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Method</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Door</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Result</th>
                <th className="px-4 py-3.5 w-10" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredLogs.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-muted-foreground">No logs found.</td></tr>
                ) : filteredLogs.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{log.time}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${log.user === 'Unknown' ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300' : avatarColors[i % avatarColors.length]}`}>
                          {getInitials(log.user)}
                        </div>
                        <span className="font-semibold">{log.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${log.method === 'Fingerprint' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`}>
                        {log.method === 'Fingerprint' ? <Fingerprint className="w-3.5 h-3.5" /> : <ScanFace className="w-3.5 h-3.5" />}
                        {log.method}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{log.door}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_BADGE[log.memberStatus]}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {log.memberStatus}
                        </span>
                        <span className={`text-xs font-medium ${RESULT_STYLE[log.result]}`}>{log.result}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => setViewLog(log)} className="gap-2 cursor-pointer">
                            <Eye className="w-4 h-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setLogs(p => p.filter(l => l.id !== log.id))} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" /> Remove Log
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Enroll Modal ── */}
      <Dialog open={showEnroll} onOpenChange={v => { if (!enrolling) { setShowEnroll(v); setEnrollDone(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-primary" /> Enroll Biometric
            </DialogTitle>
            <DialogDescription>Register a member's fingerprint or face for access control.</DialogDescription>
          </DialogHeader>

          {enrollDone ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3 py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <p className="font-semibold text-lg">Enrollment Complete!</p>
              <p className="text-sm text-muted-foreground">{enrollForm.name} has been enrolled successfully.</p>
            </motion.div>
          ) : enrolling ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <Fingerprint className="w-10 h-10 text-primary" />
              </motion.div>
              <p className="font-medium">Scanning biometric data…</p>
              <p className="text-sm text-muted-foreground">Please hold still during capture.</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input placeholder="e.g. John Doe" value={enrollForm.name} onChange={e => setEnrollForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" placeholder="john@company.com" value={enrollForm.email} onChange={e => setEnrollForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Biometric Methods *</Label>
                <div className="flex gap-3">
                  {(['Fingerprint', 'Face'] as Method[]).map(m => (
                    <button
                      key={m}
                      onClick={() => toggleMethod(m)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${enrollForm.methods.includes(m) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}
                    >
                      {m === 'Fingerprint' ? <Fingerprint className="w-4 h-4" /> : <ScanFace className="w-4 h-4" />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Membership Status</Label>
                <Select value={enrollForm.status} onValueChange={v => setEnrollForm(f => ({ ...f, status: v as MemberStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {!enrolling && !enrollDone && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEnroll(false)}>Cancel</Button>
              <Button onClick={handleEnroll} disabled={!enrollForm.name || !enrollForm.email || enrollForm.methods.length === 0}>
                <Fingerprint className="w-4 h-4 mr-2" /> Start Enrollment
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Simulate Scan Modal ── */}
      <Dialog open={showSimulate} onOpenChange={setShowSimulate}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanFace className="w-5 h-5 text-primary" /> Simulate Scan
            </DialogTitle>
            <DialogDescription>Test how the system handles an access attempt.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Select Member</Label>
              <Select value={simForm.user} onValueChange={v => setSimForm(f => ({ ...f, user: v }))}>
                <SelectTrigger><SelectValue placeholder="Choose member" /></SelectTrigger>
                <SelectContent>
                  {enrolled.map(m => <SelectItem key={m.id} value={m.name}>{m.name} ({m.status})</SelectItem>)}
                  <SelectItem value="Unknown">Unknown (Unregistered)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Method</Label>
              <div className="flex gap-3">
                {(['Fingerprint', 'Face'] as Method[]).map(m => (
                  <button key={m} onClick={() => setSimForm(f => ({ ...f, method: m }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${simForm.method === m ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}>
                    {m === 'Fingerprint' ? <Fingerprint className="w-4 h-4" /> : <ScanFace className="w-4 h-4" />}{m}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Door</Label>
              <Select value={simForm.door} onValueChange={v => setSimForm(f => ({ ...f, door: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOORS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSimulate(false)}>Cancel</Button>
            <Button onClick={handleSimulate} disabled={!simForm.user}>
              <ScanFace className="w-4 h-4 mr-2" /> Run Simulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Log Modal ── */}
      <Dialog open={!!viewLog} onOpenChange={() => setViewLog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Access Log Details</DialogTitle></DialogHeader>
          {viewLog && (
            <div className="space-y-3 py-2">
              <div className={`p-4 rounded-xl border ${viewLog.result === 'Granted' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                <div className="flex items-center gap-2">
                  {viewLog.result === 'Granted' ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-500" />}
                  <span className={`font-semibold ${viewLog.result === 'Granted' ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{viewLog.result}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Time', value: viewLog.time },
                  { label: 'User', value: viewLog.user },
                  { label: 'Method', value: viewLog.method },
                  { label: 'Door', value: viewLog.door },
                  { label: 'Member Status', value: viewLog.memberStatus },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
