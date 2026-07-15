import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Download, Eye, Edit2, Trash2, MoreHorizontal,
  CheckCircle2, Clock, AlertCircle, TrendingUp,
  Mail, Send, Printer, CreditCard, Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/billing')({
  component: () => <DashboardLayout><BillingPage /></DashboardLayout>,
});

type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Draft';

interface Invoice {
  id: string;
  invoiceNo: string;
  member: string;
  email: string;
  plan: string;
  amount: number;
  gst: number;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
}

const GST_RATE = 0.18;

const initialInvoices: Invoice[] = [
  { id: 'i1', invoiceNo: 'INV-2841', member: 'Priya Menon',    email: 'priya@fluxwave.com',     plan: 'Monthly Membership',      amount: 299,  gst: 53.82,  date: '2026-07-10', dueDate: '2026-07-17', status: 'Paid' },
  { id: 'i2', invoiceNo: 'INV-2842', member: 'Aarav Sharma',   email: 'aarav@northlabs.io',     plan: 'Annual Membership',        amount: 2499, gst: 449.82, date: '2026-07-09', dueDate: '2026-07-16', status: 'Paid' },
  { id: 'i3', invoiceNo: 'INV-2843', member: 'Kenji Watanabe', email: 'kenji@orbit.co',          plan: 'Quarterly Membership',     amount: 799,  gst: 143.82, date: '2026-07-08', dueDate: '2026-07-15', status: 'Pending' },
  { id: 'i4', invoiceNo: 'INV-2844', member: 'Sofia Rossi',    email: 'sofia@paperkite.eu',     plan: 'Half-Yearly Membership',   amount: 1499, gst: 269.82, date: '2026-07-05', dueDate: '2026-07-12', status: 'Paid' },
  { id: 'i5', invoiceNo: 'INV-2840', member: 'Marcus Bell',    email: 'marcus@steelroot.io',    plan: 'Day Pass',                 amount: 25,   gst: 4.50,   date: '2026-07-03', dueDate: '2026-07-03', status: 'Paid' },
  { id: 'i6', invoiceNo: 'INV-2839', member: 'Lina Haddad',   email: 'lina@vestra.app',        plan: 'Monthly Membership',      amount: 299,  gst: 53.82,  date: '2026-06-30', dueDate: '2026-07-07', status: 'Overdue' },
  { id: 'i7', invoiceNo: 'INV-2838', member: 'Tom Chen',       email: 'tom@nexgen.io',          plan: 'Annual Membership',        amount: 2499, gst: 449.82, date: '2026-06-25', dueDate: '2026-07-02', status: 'Paid' },
  { id: 'i8', invoiceNo: 'INV-2837', member: 'Aisha Patel',   email: 'aisha@springboard.co',   plan: 'Monthly Membership',      amount: 299,  gst: 53.82,  date: '2026-06-20', dueDate: '2026-06-27', status: 'Draft' },
];

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  Paid:    'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  Draft:   'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

const avatarColors = ['bg-blue-100 text-blue-700','bg-purple-100 text-purple-700','bg-amber-100 text-amber-700','bg-green-100 text-green-700','bg-rose-100 text-rose-700','bg-teal-100 text-teal-700','bg-indigo-100 text-indigo-700','bg-orange-100 text-orange-700'];
function getInitials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

const MEMBERS = ['Aarav Sharma', 'Priya Menon', 'Kenji Watanabe', 'Sofia Rossi', 'Marcus Bell', 'Lina Haddad', 'Tom Chen', 'Aisha Patel'];
const PLANS = [
  { name: 'Day Pass', amount: 25 },
  { name: 'Weekly Pass', amount: 99 },
  { name: 'Monthly Membership', amount: 299 },
  { name: 'Quarterly Membership', amount: 799 },
  { name: 'Half-Yearly Membership', amount: 1499 },
  { name: 'Annual Membership', amount: 2499 },
];

function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />{status}
    </span>
  );
}

function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [tabFilter, setTabFilter] = useState<'All' | InvoiceStatus>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [viewInv, setViewInv] = useState<Invoice | null>(null);
  const [editInv, setEditInv] = useState<Invoice | null>(null);

  const [form, setForm] = useState({ member: '', email: '', plan: '', amount: '', status: 'Draft' as InvoiceStatus });

  const tabs: ('All' | InvoiceStatus)[] = ['All', 'Paid', 'Pending', 'Overdue', 'Draft'];

  const filtered = invoices.filter(i => tabFilter === 'All' || i.status === tabFilter);

  // Stats
  const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.amount + i.gst, 0);
  const pendingAmt  = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.amount + i.gst, 0);
  const overdueAmt  = invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount + i.gst, 0);
  const paidCount   = invoices.filter(i => i.status === 'Paid').length;

  const handleAdd = () => {
    if (!form.member || !form.plan) return;
    const amt = parseInt(form.amount) || PLANS.find(p => p.name === form.plan)?.amount || 0;
    const gst = parseFloat((amt * GST_RATE).toFixed(2));
    const today = new Date().toISOString().split('T')[0];
    const due = new Date(); due.setDate(due.getDate() + 7);
    const nextNo = `INV-${2845 + invoices.length}`;
    const newInv: Invoice = {
      id: String(Date.now()), invoiceNo: nextNo,
      member: form.member, email: form.email,
      plan: form.plan, amount: amt, gst,
      date: today, dueDate: due.toISOString().split('T')[0],
      status: form.status,
    };
    setInvoices(p => [newInv, ...p]);
    setShowAdd(false);
    setForm({ member: '', email: '', plan: '', amount: '', status: 'Draft' });
  };

  const handleMarkPaid = (id: string) => setInvoices(p => p.map(i => i.id === id ? { ...i, status: 'Paid' } : i));
  const handleDelete = (id: string) => setInvoices(p => p.filter(i => i.id !== id));

  // Export CSV
  const handleExport = () => {
    const header = 'Invoice,Member,Email,Plan,Amount,GST,Total,Date,Due Date,Status\n';
    const rows = invoices.map(i =>
      `${i.invoiceNo},${i.member},${i.email},${i.plan},$${i.amount},$${i.gst},$${(i.amount + i.gst).toFixed(2)},${i.date},${i.dueDate},${i.status}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'invoices.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Print invoice
  const handlePrint = (inv: Invoice) => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>${inv.invoiceNo}</title>
      <style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:0 auto}h1{color:#1d4ed8}table{width:100%;border-collapse:collapse;margin-top:20px}td,th{padding:10px;border:1px solid #e2e8f0;text-align:left}.total{font-weight:bold;font-size:1.1em}</style>
      </head><body>
      <h1>DeskMate — ${inv.invoiceNo}</h1>
      <p><strong>Member:</strong> ${inv.member}</p>
      <p><strong>Email:</strong> ${inv.email}</p>
      <table>
        <tr><th>Description</th><th>Amount</th></tr>
        <tr><td>${inv.plan}</td><td>$${inv.amount}</td></tr>
        <tr><td>GST (18%)</td><td>$${inv.gst}</td></tr>
        <tr class="total"><td>Total</td><td>$${(inv.amount + inv.gst).toFixed(2)}</td></tr>
      </table>
      <p style="margin-top:20px"><strong>Date:</strong> ${inv.date} &nbsp; <strong>Due:</strong> ${inv.dueDate}</p>
      <p><strong>Status:</strong> ${inv.status}</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  const handlePlanChange = (planName: string) => {
    const plan = PLANS.find(p => p.name === planName);
    setForm(f => ({ ...f, plan: planName, amount: String(plan?.amount || '') }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing &amp; invoices</h1>
          <p className="text-muted-foreground mt-1">Generate invoices, apply GST, and track payments.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Invoice
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Paid Invoices', value: String(paidCount), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Pending Amount', value: `$${pendingAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Overdue Amount', value: `$${overdueAmt.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="rounded-xl border bg-card p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
            <div className={`w-11 h-11 rounded-full flex items-center justify-center ${s.bg}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Invoice Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 border text-sm">
            {tabs.map(t => (
              <button key={t} onClick={() => setTabFilter(t)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${tabFilter === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {t}
              </button>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{filtered.length} invoice{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left font-semibold text-foreground px-6 py-3.5">Invoice</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Member</th>
                <th className="text-left font-semibold text-primary px-4 py-3.5">Amount</th>
                <th className="text-left font-semibold text-primary px-4 py-3.5">GST</th>
                <th className="text-left font-semibold text-primary px-4 py-3.5">Date</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-16 text-muted-foreground">No invoices found.</td></tr>
                ) : filtered.map((inv, i) => (
                  <motion.tr key={inv.id}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{inv.invoiceNo}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                          {getInitials(inv.member)}
                        </div>
                        <span className="font-semibold">{inv.member}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold">${inv.amount.toLocaleString()}</td>
                    <td className="px-4 py-4 text-muted-foreground">${inv.gst.toFixed(2)}</td>
                    <td className="px-4 py-4 text-muted-foreground">{inv.date}</td>
                    <td className="px-4 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setViewInv(inv)} className="gap-2 cursor-pointer">
                            <Eye className="w-4 h-4" /> View Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditInv({ ...inv })} className="gap-2 cursor-pointer">
                            <Edit2 className="w-4 h-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrint(inv)} className="gap-2 cursor-pointer">
                            <Printer className="w-4 h-4" /> Print Invoice
                          </DropdownMenuItem>
                          {inv.status !== 'Paid' && (
                            <DropdownMenuItem onClick={() => handleMarkPaid(inv.id)} className="gap-2 cursor-pointer text-green-600 focus:text-green-600">
                              <CheckCircle2 className="w-4 h-4" /> Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(inv.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
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
                <tr className="border-t bg-muted/10">
                  <td colSpan={2} className="px-6 py-3 text-sm font-semibold text-muted-foreground">
                    Total ({filtered.length} invoices)
                  </td>
                  <td className="px-4 py-3 font-bold">
                    ${filtered.reduce((s, i) => s + i.amount, 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-bold text-muted-foreground">
                    ${filtered.reduce((s, i) => s + i.gst, 0).toFixed(2)}
                  </td>
                  <td colSpan={3} className="px-4 py-3 font-bold text-primary text-right pr-6">
                    Total: ${filtered.reduce((s, i) => s + i.amount + i.gst, 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* ── New Invoice Modal ── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> New Invoice
            </DialogTitle>
            <DialogDescription>Create a new invoice for a workspace member.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Member *</Label>
              <Select value={form.member} onValueChange={v => setForm(f => ({ ...f, member: v }))}>
                <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>{MEMBERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Email</Label>
              <Input type="email" placeholder="member@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Plan *</Label>
              <Select value={form.plan} onValueChange={handlePlanChange}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>{PLANS.map(p => <SelectItem key={p.name} value={p.name}>{p.name} — ${p.amount}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount ($)</Label>
              <Input type="number" placeholder="Auto-filled from plan" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as InvoiceStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['Draft', 'Pending', 'Paid'] as InvoiceStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 p-3 rounded-lg bg-muted/40 border text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>${parseInt(form.amount) || 0}</span>
              </div>
              <div className="flex justify-between text-muted-foreground mt-1">
                <span>GST (18%)</span><span>${((parseInt(form.amount) || 0) * GST_RATE).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground mt-2 pt-2 border-t">
                <span>Total</span><span>${((parseInt(form.amount) || 0) * (1 + GST_RATE)).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.member || !form.plan}>
              <Plus className="w-4 h-4 mr-2" /> Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Invoice Modal ── */}
      <Dialog open={!!viewInv} onOpenChange={() => setViewInv(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" /> {viewInv?.invoiceNo}
            </DialogTitle>
          </DialogHeader>
          {viewInv && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${avatarColors[0]}`}>
                    {getInitials(viewInv.member)}
                  </div>
                  <div>
                    <p className="font-semibold">{viewInv.member}</p>
                    <p className="text-xs text-muted-foreground">{viewInv.email}</p>
                  </div>
                </div>
                <StatusBadge status={viewInv.status} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">{viewInv.plan}</span>
                  <span className="font-medium">${viewInv.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span className="font-medium">${viewInv.gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">${(viewInv.amount + viewInv.gst).toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Invoice Date</p><p className="font-medium">{viewInv.date}</p></div>
                <div><p className="text-xs text-muted-foreground">Due Date</p><p className="font-medium">{viewInv.dueDate}</p></div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-2" onClick={() => handlePrint(viewInv)}>
                  <Printer className="w-4 h-4" /> Print
                </Button>
                {viewInv.status !== 'Paid' && (
                  <Button variant="outline" className="gap-2 text-green-600 hover:text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => { handleMarkPaid(viewInv.id); setViewInv(null); }}>
                    <CheckCircle2 className="w-4 h-4" /> Mark Paid
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Invoice Modal ── */}
      <Dialog open={!!editInv} onOpenChange={() => setEditInv(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Invoice — {editInv?.invoiceNo}
            </DialogTitle>
          </DialogHeader>
          {editInv && (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5">
                <Label>Amount ($)</Label>
                <Input type="number" value={editInv.amount} onChange={e => setEditInv(i => i ? { ...i, amount: parseInt(e.target.value) || 0, gst: parseFloat(((parseInt(e.target.value) || 0) * GST_RATE).toFixed(2)) } : i)} />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editInv.status} onValueChange={v => setEditInv(i => i ? { ...i, status: v as InvoiceStatus } : i)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['Draft', 'Pending', 'Paid', 'Overdue'] as InvoiceStatus[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={editInv.dueDate} onChange={e => setEditInv(i => i ? { ...i, dueDate: e.target.value } : i)} />
              </div>
              <div className="col-span-2 p-3 rounded-lg bg-muted/40 text-sm flex justify-between font-bold">
                <span>Total (incl. GST)</span>
                <span>${(editInv.amount + editInv.gst).toFixed(2)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditInv(null)}>Cancel</Button>
            <Button onClick={() => { if (editInv) { setInvoices(p => p.map(i => i.id === editInv.id ? editInv : i)); setEditInv(null); } }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
