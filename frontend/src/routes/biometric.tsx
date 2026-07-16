import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Fingerprint, ScanFace, ShieldCheck, ShieldX, Eye,
  Download, Search, MoreHorizontal, Trash2, Copy,
  CheckCircle2, XCircle, Wifi, WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { biometricService, type AccessLogDto, type EnrolledMemberDto } from '@/services/biometricService';
import { memberService } from '@/services/memberService';

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
  memberId: number;
  name: string;
  email: string;
  methods: Method[];
  status: MemberStatus;
  enrolledAt: string;
}

function toAccessLog(dto: AccessLogDto): AccessLog {
  return {
    id: String(dto.id),
    time: new Date(dto.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    user: dto.member_name ?? 'Unknown',
    method: (dto.method as Method) ?? 'Fingerprint',
    door: dto.door ?? '—',
    memberStatus: (dto.member_status as MemberStatus) ?? 'Unknown',
    result: dto.result as AccessResult,
  };
}

function toEnrolledMember(dto: EnrolledMemberDto): EnrolledMember {
  return {
    id: String(dto.id),
    memberId: dto.member_id,
    name: dto.member_name ?? `Member #${dto.member_id}`,
    email: dto.member_email ?? '',
    methods: dto.methods as Method[],
    status: (dto.member_status as MemberStatus) ?? 'Active',
    enrolledAt: dto.enrolled_at.split('T')[0],
  };
}

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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<'All' | AccessResult>('All');
  const [showEnroll, setShowEnroll] = useState(false);
  const [showSimulate, setShowSimulate] = useState(false);
  const [viewLog, setViewLog] = useState<AccessLog | null>(null);
  const [liveMode, setLiveMode] = useState(true);

  const [enrollMemberId, setEnrollMemberId] = useState('');
  const [enrollLink, setEnrollLink] = useState<{ url: string; qrDataUrl: string } | null>(null);
  const [simForm, setSimForm] = useState({ user: '', method: 'Fingerprint' as Method, door: 'Main Entry' });

  const { data: logDtos } = useQuery({
    queryKey: ['biometric', 'logs'],
    queryFn: biometricService.listLogs,
    refetchInterval: liveMode ? 5000 : false,
  });
  const logs = (logDtos ?? []).map(toAccessLog);

  const { data: enrolledDtos } = useQuery({
    queryKey: ['biometric', 'enrolled'],
    queryFn: biometricService.listEnrolled,
  });
  const enrolled = (enrolledDtos ?? []).map(toEnrolledMember);

  const { data: members } = useQuery({ queryKey: ['members'], queryFn: memberService.list });

  const generateLinkMutation = useMutation({
    mutationFn: biometricService.generateEnrollmentLink,
    onSuccess: async ({ token }) => {
      const portalUrl = import.meta.env.VITE_MEMBER_PORTAL_URL || 'http://localhost:5175';
      const url = `${portalUrl}/enroll/${token}`;
      const qrDataUrl = await QRCode.toDataURL(url, { width: 220, margin: 1 });
      setEnrollLink({ url, qrDataUrl });
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Could not generate enrollment link'),
  });
  const createLogMutation = useMutation({
    mutationFn: biometricService.createLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['biometric', 'logs'] }),
    onError: () => toast.error('Failed to log access attempt'),
  });
  const deleteLogMutation = useMutation({
    mutationFn: biometricService.deleteLog,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['biometric', 'logs'] }),
    onError: () => toast.error('Failed to remove log'),
  });

  const handleGenerateLink = () => {
    if (!enrollMemberId) return;
    generateLinkMutation.mutate(Number(enrollMemberId));
  };

  const handleCloseEnrollModal = () => {
    setShowEnroll(false);
    setEnrollMemberId('');
    setEnrollLink(null);
    queryClient.invalidateQueries({ queryKey: ['biometric', 'enrolled'] });
  };

  const handleCopyLink = () => {
    if (!enrollLink) return;
    navigator.clipboard.writeText(enrollLink.url);
    toast.success('Link copied');
  };

  // Simulate access
  const handleSimulate = () => {
    if (!simForm.user) return;
    const member = enrolled.find((e) => e.name === simForm.user);
    const memberStatus: MemberStatus | 'Unknown' = member?.status || 'Unknown';
    let result: AccessResult;
    if (!member) result = 'Failed';
    else if (memberStatus === 'Expired') result = 'Denied — Expired';
    else if (memberStatus === 'Suspended') result = 'Denied — Suspended';
    else result = 'Granted';

    createLogMutation.mutate({
      member_id: member ? member.memberId : null,
      method: simForm.method,
      door: simForm.door,
      member_status: memberStatus,
      result,
    });
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

  const filteredLogs = logs.filter(l => {
    const matchSearch = l.user.toLowerCase().includes(search.toLowerCase()) || l.door.toLowerCase().includes(search.toLowerCase());
    const matchResult = resultFilter === 'All' || l.result === resultFilter;
    return matchSearch && matchResult;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysLogs = (logDtos ?? []).filter((d) => d.time.split('T')[0] === todayStr);
  const grantedToday = todaysLogs.filter(d => d.result === 'Granted').length;
  const deniedToday = todaysLogs.filter(d => d.result !== 'Granted').length;
  const fingerprintEnrolledCount = enrolled.filter(e => e.methods.includes('Fingerprint')).length;
  const faceEnrolledCount = enrolled.filter(e => e.methods.includes('Face')).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biometric access control</h1>
          <p className="text-muted-foreground mt-1">Live logs from fingerprint &amp; face-recognition check-ins across all doors.</p>
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
          { label: 'Fingerprint enrolled', value: fingerprintEnrolledCount, icon: Fingerprint, iconClass: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Face ID enrolled', value: faceEnrolledCount, icon: ScanFace, iconClass: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
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
                          <DropdownMenuItem onClick={() => deleteLogMutation.mutate(Number(log.id))} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
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
      <Dialog open={showEnroll} onOpenChange={v => { if (!v) handleCloseEnrollModal(); else setShowEnroll(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-primary" /> Enroll Biometric
            </DialogTitle>
            <DialogDescription>
              Generate a one-time link for a member to enroll their own fingerprint/Face ID on their phone.
            </DialogDescription>
          </DialogHeader>

          {enrollLink ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <img src={enrollLink.qrDataUrl} alt="Enrollment QR code" className="w-48 h-48 rounded-lg border" />
              <div className="w-full flex items-center gap-2">
                <Input readOnly value={enrollLink.url} className="text-xs" />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Have the member scan this QR code or open the link on their own phone. It expires in 10 minutes
                and can only be used once. Their fingerprint/face data never leaves their device.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Member *</Label>
                <Select value={enrollMemberId} onValueChange={setEnrollMemberId}>
                  <SelectTrigger><SelectValue placeholder="Select a member" /></SelectTrigger>
                  <SelectContent>
                    {(members ?? []).map(m => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.first_name} {m.last_name} ({m.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            {enrollLink ? (
              <Button onClick={handleCloseEnrollModal}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCloseEnrollModal}>Cancel</Button>
                <Button onClick={handleGenerateLink} disabled={!enrollMemberId || generateLinkMutation.isPending}>
                  <Fingerprint className="w-4 h-4 mr-2" /> {generateLinkMutation.isPending ? 'Generating…' : 'Generate Link'}
                </Button>
              </>
            )}
          </DialogFooter>
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
