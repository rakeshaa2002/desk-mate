import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, QrCode, Clock, CheckCircle2, XCircle, LogIn, LogOut,
  MoreHorizontal, Eye, Trash2, Users, CalendarCheck, AlertCircle, Phone, Mail, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/visitors')({
  component: () => <DashboardLayout><VisitorsPage /></DashboardLayout>,
});

type VisitorStatus = 'Pending Approval' | 'Active' | 'Checked In' | 'Checked Out' | 'Denied';

interface Visitor {
  id: string;
  name: string;
  email: string;
  mobile: string;
  host: string;
  hostEmail: string;
  purpose: string;
  eta: string;
  date: string;
  status: VisitorStatus;
  passCode: string;
  company?: string;
}

function generatePassCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

const initialVisitors: Visitor[] = [
  { id: 'v1', name: 'Rahul Iyer',   email: 'rahul@demo.com', mobile: '+91 9876543210', host: 'Aarav Sharma', hostEmail: 'aarav@northlabs.io', purpose: 'Business Meeting', eta: '10:30 AM', date: '2026-07-15', status: 'Pending Approval', passCode: generatePassCode(), company: 'DemoTech' },
  { id: 'v2', name: 'Maya Chen',    email: 'maya@visit.co',  mobile: '+91 9123456789', host: 'Priya Menon',  hostEmail: 'priya@fluxwave.com',  purpose: 'Interview',        eta: '11:00 AM', date: '2026-07-15', status: 'Active',           passCode: generatePassCode(), company: 'Visit.co' },
  { id: 'v3', name: 'Leo Park',     email: 'leo@parkco.io',  mobile: '+91 9988776655', host: 'Sofia Rossi', hostEmail: 'sofia@paperkite.eu',  purpose: 'Client Visit',     eta: '02:00 PM', date: '2026-07-15', status: 'Active',           passCode: generatePassCode(), company: 'ParkCo' },
  { id: 'v4', name: 'Anna Schmidt', email: 'anna@intl.de',   mobile: '+49 1512345678', host: 'Tom Chen',    hostEmail: 'tom@nexgen.io',       purpose: 'Workshop',         eta: '09:00 AM', date: '2026-07-14', status: 'Checked Out',      passCode: generatePassCode(), company: 'Intl GmbH' },
  { id: 'v5', name: 'James Wu',     email: 'james@wu.sg',    mobile: '+65 91234567',   host: 'Aarav Sharma', hostEmail: 'aarav@northlabs.io', purpose: 'Demo Session',     eta: '03:30 PM', date: '2026-07-14', status: 'Checked In',       passCode: generatePassCode(), company: 'WuTech' },
];

const STATUS_STYLE: Record<VisitorStatus, string> = {
  'Pending Approval': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  'Active':           'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  'Checked In':       'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  'Checked Out':      'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  'Denied':           'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

const avatarColors = ['bg-blue-100 text-blue-700','bg-purple-100 text-purple-700','bg-amber-100 text-amber-700','bg-green-100 text-green-700','bg-rose-100 text-rose-700','bg-teal-100 text-teal-700'];
function getInitials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

const HOSTS = ['Aarav Sharma', 'Priya Menon', 'Sofia Rossi', 'Tom Chen', 'Kenji Watanabe', 'Aisha Patel'];
const PURPOSES = ['Business Meeting', 'Interview', 'Client Visit', 'Workshop', 'Demo Session', 'Training', 'Other'];

function QRDisplay({ passCode, name }: { passCode: string; name: string }) {
  // Build a simple visual QR-like grid from passCode chars
  const size = 9;
  const seed = passCode.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = Array.from({ length: size * size }, (_, i) => {
    const row = Math.floor(i / size); const col = i % size;
    // Fixed corner squares
    if ((row < 3 && col < 3) || (row < 3 && col >= size - 3) || (row >= size - 3 && col < 3)) return true;
    return ((seed * (i + 7) * 13) % 17) > 8;
  });
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="p-4 bg-white rounded-2xl shadow-lg border">
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 144, height: 144 }}>
          {cells.map((filled, i) => (
            <div key={i} className={`rounded-sm ${filled ? 'bg-zinc-900' : 'bg-white'}`} style={{ width: 14, height: 14 }} />
          ))}
        </div>
      </div>
      <div className="text-center">
        <p className="font-mono text-lg font-bold tracking-widest">{passCode}</p>
        <p className="text-sm text-muted-foreground mt-1">Visitor Pass — {name}</p>
      </div>
      <Button variant="outline" className="gap-2 w-full" onClick={() => window.print()}>
        <QrCode className="w-4 h-4" /> Print Pass
      </Button>
    </div>
  );
}

function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors);
  const [showAdd, setShowAdd] = useState(false);
  const [viewVisitor, setViewVisitor] = useState<Visitor | null>(null);
  const [qrVisitor, setQrVisitor] = useState<Visitor | null>(null);
  const [tabFilter, setTabFilter] = useState<'Today' | 'All' | VisitorStatus>('Today');

  const [form, setForm] = useState({
    name: '', email: '', mobile: '', company: '', host: '', purpose: '', eta: '', date: '',
  });

  const today = new Date().toISOString().split('T')[0];

  const filtered = visitors.filter(v => {
    if (tabFilter === 'Today') return v.date === today;
    if (tabFilter === 'All') return true;
    return v.status === tabFilter;
  });

  // Today's visitors for cards
  const todayVisitors = visitors.filter(v => v.date === today);

  const handleAdd = () => {
    if (!form.name || !form.host) return;
    const newV: Visitor = {
      id: String(Date.now()), name: form.name, email: form.email, mobile: form.mobile,
      company: form.company, host: form.host, hostEmail: '',
      purpose: form.purpose || 'Visit', eta: form.eta || '12:00 PM',
      date: form.date || today, status: 'Pending Approval', passCode: generatePassCode(),
    };
    setVisitors(p => [newV, ...p]);
    setShowAdd(false);
    setForm({ name: '', email: '', mobile: '', company: '', host: '', purpose: '', eta: '', date: '' });
  };

  const updateStatus = (id: string, status: VisitorStatus) =>
    setVisitors(p => p.map(v => v.id === id ? { ...v, status } : v));

  const handleDelete = (id: string) => setVisitors(p => p.filter(v => v.id !== id));

  const tabs: ('Today' | 'All' | VisitorStatus)[] = ['Today', 'All', 'Pending Approval', 'Active', 'Checked In', 'Checked Out'];

  // Stats
  const checkedIn  = visitors.filter(v => v.status === 'Checked In' && v.date === today).length;
  const pending    = visitors.filter(v => v.status === 'Pending Approval').length;
  const totalToday = todayVisitors.length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitor management</h1>
          <p className="text-muted-foreground mt-1">Pre-register visitors, generate QR passes, and track check-in/out.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 shrink-0">
          <UserPlus className="w-4 h-4" /> Pre-register
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Today's Visitors", value: totalToday, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Checked In',       value: checkedIn,  icon: CalendarCheck, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Pending Approval', value: pending,    icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
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

      {/* Today's Visitor Cards */}
      {todayVisitors.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today's Visitors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {todayVisitors.map((visitor, i) => (
                <motion.div key={visitor.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow group"
                >
                  {/* Card Top */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-base">{visitor.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Hosted by <span className="text-primary">{visitor.host}</span></p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[visitor.status]}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {visitor.status}
                    </span>
                  </div>

                  {/* ETA + Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> ETA {visitor.eta}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {visitor.status === 'Pending Approval' && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => updateStatus(visitor.id, 'Active')}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => updateStatus(visitor.id, 'Denied')}>
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Deny
                          </Button>
                        </>
                      )}
                      {visitor.status === 'Active' && (
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => updateStatus(visitor.id, 'Checked In')}>
                          <LogIn className="w-3.5 h-3.5 mr-1" /> Check In
                        </Button>
                      )}
                      {visitor.status === 'Checked In' && (
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => updateStatus(visitor.id, 'Checked Out')}>
                          <LogOut className="w-3.5 h-3.5 mr-1" /> Check Out
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={() => setQrVisitor(visitor)}>
                        <QrCode className="w-3.5 h-3.5" /> QR pass
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* All Visitors Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="font-semibold">All Visitors</h2>
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 border text-sm overflow-x-auto">
            {tabs.map(t => (
              <button key={t} onClick={() => setTabFilter(t)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${tabFilter === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left font-semibold text-foreground px-6 py-3.5">Visitor</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Host</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Purpose</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">ETA</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Date</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-muted-foreground">No visitors found.</td></tr>
                ) : filtered.map((visitor, i) => (
                  <motion.tr key={visitor.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                          {getInitials(visitor.name)}
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{visitor.name}</p>
                          <p className="text-xs text-muted-foreground">{visitor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-primary font-medium">{visitor.host}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{visitor.purpose}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{visitor.eta}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">{visitor.date}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[visitor.status]}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />{visitor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setViewVisitor(visitor)} className="gap-2 cursor-pointer">
                            <Eye className="w-4 h-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setQrVisitor(visitor)} className="gap-2 cursor-pointer">
                            <QrCode className="w-4 h-4" /> QR Pass
                          </DropdownMenuItem>
                          {visitor.status === 'Pending Approval' && (
                            <DropdownMenuItem onClick={() => updateStatus(visitor.id, 'Active')} className="gap-2 cursor-pointer text-green-600 focus:text-green-600">
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </DropdownMenuItem>
                          )}
                          {visitor.status === 'Active' && (
                            <DropdownMenuItem onClick={() => updateStatus(visitor.id, 'Checked In')} className="gap-2 cursor-pointer text-blue-600 focus:text-blue-600">
                              <LogIn className="w-4 h-4" /> Check In
                            </DropdownMenuItem>
                          )}
                          {visitor.status === 'Checked In' && (
                            <DropdownMenuItem onClick={() => updateStatus(visitor.id, 'Checked Out')} className="gap-2 cursor-pointer">
                              <LogOut className="w-4 h-4" /> Check Out
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(visitor.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" /> Remove
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

      {/* ── Pre-register Modal ── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Pre-register Visitor
            </DialogTitle>
            <DialogDescription>Register an upcoming visitor and generate a QR pass.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Full Name *</Label>
              <Input placeholder="Visitor's full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" type="email" placeholder="visitor@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Mobile</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="+91 98765 43210" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Company</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Visitor's company" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Host Member *</Label>
              <Select value={form.host} onValueChange={v => setForm(f => ({ ...f, host: v }))}>
                <SelectTrigger><SelectValue placeholder="Select host" /></SelectTrigger>
                <SelectContent>{HOSTS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Purpose</Label>
              <Select value={form.purpose} onValueChange={v => setForm(f => ({ ...f, purpose: v }))}>
                <SelectTrigger><SelectValue placeholder="Select purpose" /></SelectTrigger>
                <SelectContent>{PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Expected Time (ETA)</Label>
              <Input type="time" value={form.eta} onChange={e => {
                const [h, m] = e.target.value.split(':');
                const hNum = parseInt(h); const ampm = hNum >= 12 ? 'PM' : 'AM';
                const h12 = hNum % 12 || 12;
                setForm(f => ({ ...f, eta: `${h12}:${m} ${ampm}` }));
              }} />
            </div>
            <div className="space-y-1.5">
              <Label>Visit Date</Label>
              <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.host}>
              <UserPlus className="w-4 h-4 mr-2" /> Register &amp; Generate Pass
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── QR Pass Modal ── */}
      <Dialog open={!!qrVisitor} onOpenChange={() => setQrVisitor(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" /> Visitor QR Pass
            </DialogTitle>
          </DialogHeader>
          {qrVisitor && <QRDisplay passCode={qrVisitor.passCode} name={qrVisitor.name} />}
        </DialogContent>
      </Dialog>

      {/* ── View Visitor Modal ── */}
      <Dialog open={!!viewVisitor} onOpenChange={() => setViewVisitor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Visitor Details</DialogTitle></DialogHeader>
          {viewVisitor && (
            <div className="space-y-4">
              <div className={`flex items-center gap-4 p-4 rounded-xl bg-muted/40`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${avatarColors[0]}`}>
                  {getInitials(viewVisitor.name)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{viewVisitor.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewVisitor.company || 'Individual Visitor'}</p>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[viewVisitor.status]}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />{viewVisitor.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Email', value: viewVisitor.email || '—' },
                  { label: 'Mobile', value: viewVisitor.mobile || '—' },
                  { label: 'Host', value: viewVisitor.host },
                  { label: 'Purpose', value: viewVisitor.purpose },
                  { label: 'ETA', value: viewVisitor.eta },
                  { label: 'Date', value: viewVisitor.date },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-2" onClick={() => { setQrVisitor(viewVisitor); setViewVisitor(null); }}>
                  <QrCode className="w-4 h-4" /> View QR Pass
                </Button>
                {viewVisitor.status === 'Active' && (
                  <Button variant="outline" className="gap-2" onClick={() => { updateStatus(viewVisitor.id, 'Checked In'); setViewVisitor(null); }}>
                    <LogIn className="w-4 h-4" /> Check In
                  </Button>
                )}
                {viewVisitor.status === 'Checked In' && (
                  <Button variant="outline" className="gap-2" onClick={() => { updateStatus(viewVisitor.id, 'Checked Out'); setViewVisitor(null); }}>
                    <LogOut className="w-4 h-4" /> Check Out
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
