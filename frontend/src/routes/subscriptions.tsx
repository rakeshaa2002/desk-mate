import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Star, Plus, Edit2, Trash2, RefreshCw, AlertCircle, MoreHorizontal, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Switch } from '@/components/ui/switch';

export const Route = createFileRoute('/subscriptions')({
  component: () => <DashboardLayout><SubscriptionsPage /></DashboardLayout>,
});

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  periodLabel: string;
  features: string[];
  popular?: boolean;
  color: string;
}

interface Subscription {
  id: string;
  memberId: string;
  memberName: string;
  email: string;
  plan: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'Active' | 'Expired' | 'Pending' | 'Cancelled';
  autoRenew: boolean;
}

const initialPlans: Plan[] = [
  {
    id: 'day',
    name: 'Day Pass',
    price: 25,
    period: 'day',
    periodLabel: '/day',
    features: ['Hot desk access', 'Wi-Fi & coffee', '8h workspace'],
    color: 'border-border',
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 299,
    period: 'mo',
    periodLabel: '/mo',
    features: ['Dedicated desk', '24/7 access', '10h meeting room'],
    popular: true,
    color: 'border-primary',
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 799,
    period: '3 mo',
    periodLabel: '/3 mo',
    features: ['Everything in Monthly', 'Priority booking', 'Guest passes'],
    color: 'border-border',
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 2499,
    period: 'yr',
    periodLabel: '/yr',
    features: ['Private cabin', 'Unlimited rooms', 'Concierge'],
    color: 'border-border',
  },
];

const initialSubscriptions: Subscription[] = [
  { id: 's1', memberId: 'M-001', memberName: 'Aarav Sharma', email: 'aarav@northlabs.io', plan: 'Annual', startDate: '2024-11-02', endDate: '2025-11-02', amount: 2499, status: 'Active', autoRenew: true },
  { id: 's2', memberId: 'M-002', memberName: 'Priya Menon', email: 'priya@fluxwave.com', plan: 'Monthly', startDate: '2025-06-14', endDate: '2025-07-14', amount: 299, status: 'Active', autoRenew: true },
  { id: 's3', memberId: 'M-003', memberName: 'Kenji Watanabe', email: 'kenji@orbit.co', plan: 'Monthly', startDate: '2025-05-01', endDate: '2025-06-01', amount: 299, status: 'Expired', autoRenew: false },
  { id: 's4', memberId: 'M-004', memberName: 'Sofia Rossi', email: 'sofia@paperkite.eu', plan: 'Quarterly', startDate: '2025-04-20', endDate: '2025-07-20', amount: 799, status: 'Active', autoRenew: true },
  { id: 's5', memberId: 'M-005', memberName: 'Marcus Bell', email: 'marcus@steelroot.io', plan: 'Day Pass', startDate: '2026-07-14', endDate: '2026-07-14', amount: 25, status: 'Active', autoRenew: false },
  { id: 's6', memberId: 'M-006', memberName: 'Lina Haddad', email: 'lina@vestra.app', plan: 'Monthly', startDate: '2025-03-08', endDate: '2025-04-08', amount: 299, status: 'Cancelled', autoRenew: false },
];

const STATUS_STYLE: Record<string, string> = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  Expired: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  Cancelled: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />{status}
    </span>
  );
}

const avatarColors = [
  'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700', 'bg-green-100 text-green-700',
  'bg-rose-100 text-rose-700', 'bg-teal-100 text-teal-700',
];
function getInitials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [viewSub, setViewSub] = useState<Subscription | null>(null);
  const [renewSub, setRenewSub] = useState<Subscription | null>(null);
  const [showAddSub, setShowAddSub] = useState(false);
  const [tabFilter, setTabFilter] = useState<'All' | 'Active' | 'Expired' | 'Cancelled'>('All');

  const [addForm, setAddForm] = useState({
    memberName: '', email: '', plan: '', startDate: '', amount: '', autoRenew: true,
  });

  // Edit plan handlers
  const handlePlanSave = () => {
    if (!editPlan) return;
    setPlans(p => p.map(pl => pl.id === editPlan.id ? editPlan : pl));
    setEditPlan(null);
  };

  // Renew subscription
  const handleRenew = () => {
    if (!renewSub) return;
    const endDate = new Date(renewSub.endDate);
    // Add duration based on plan
    if (renewSub.plan === 'Monthly') endDate.setMonth(endDate.getMonth() + 1);
    else if (renewSub.plan === 'Quarterly') endDate.setMonth(endDate.getMonth() + 3);
    else if (renewSub.plan === 'Annual') endDate.setFullYear(endDate.getFullYear() + 1);
    else endDate.setDate(endDate.getDate() + 1);

    setSubscriptions(p => p.map(s => s.id === renewSub.id
      ? { ...s, status: 'Active', endDate: endDate.toISOString().split('T')[0] }
      : s
    ));
    setRenewSub(null);
  };

  // Add subscription
  const handleAddSub = () => {
    if (!addForm.memberName || !addForm.plan) return;
    const today = new Date().toISOString().split('T')[0];
    const end = new Date();
    if (addForm.plan === 'Annual') end.setFullYear(end.getFullYear() + 1);
    else if (addForm.plan === 'Quarterly') end.setMonth(end.getMonth() + 3);
    else if (addForm.plan === 'Monthly') end.setMonth(end.getMonth() + 1);
    else end.setDate(end.getDate() + 1);

    const newSub: Subscription = {
      id: String(Date.now()),
      memberId: `M-00${subscriptions.length + 1}`,
      memberName: addForm.memberName,
      email: addForm.email,
      plan: addForm.plan,
      startDate: addForm.startDate || today,
      endDate: end.toISOString().split('T')[0],
      amount: parseInt(addForm.amount) || 0,
      status: 'Active',
      autoRenew: addForm.autoRenew,
    };
    setSubscriptions(p => [newSub, ...p]);
    setShowAddSub(false);
    setAddForm({ memberName: '', email: '', plan: '', startDate: '', amount: '', autoRenew: true });
  };

  const handleCancel = (id: string) => {
    setSubscriptions(p => p.map(s => s.id === id ? { ...s, status: 'Cancelled' } : s));
  };

  const handleDelete = (id: string) => {
    setSubscriptions(p => p.filter(s => s.id !== id));
  };

  const toggleAutoRenew = (id: string) => {
    setSubscriptions(p => p.map(s => s.id === id ? { ...s, autoRenew: !s.autoRenew } : s));
  };

  const filtered = subscriptions.filter(s => tabFilter === 'All' || s.status === tabFilter);
  const tabs: ('All' | 'Active' | 'Expired' | 'Cancelled')[] = ['All', 'Active', 'Expired', 'Cancelled'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription plans</h1>
          <p className="text-muted-foreground mt-1">Manage plans, pricing and renewal policies.</p>
        </div>
        <Button onClick={() => setShowAddSub(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> New Subscription
        </Button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`relative rounded-2xl border-2 bg-card p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow ${plan.popular ? 'border-primary shadow-primary/10' : 'border-border'}`}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Most Popular
                </span>
              </div>
            )}

            {/* Plan header */}
            <div className="pt-2">
              <p className="text-sm font-medium text-muted-foreground">{plan.name}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-bold">${plan.price.toLocaleString()}</span>
                <span className="text-muted-foreground text-sm">{plan.periodLabel}</span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2.5 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0" strokeWidth={2.5} />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            {/* Edit button */}
            <Button
              variant={plan.popular ? 'default' : 'outline'}
              className="w-full mt-2"
              onClick={() => setEditPlan({ ...plan })}
            >
              <Edit2 className="w-4 h-4 mr-2" /> Edit plan
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Active Subscriptions Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="font-semibold text-base">Active Subscriptions</h2>
            <p className="text-sm text-muted-foreground mt-0.5">All member subscription records.</p>
          </div>
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 border text-sm">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTabFilter(t)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${tabFilter === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
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
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Plan</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Start Date</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">End Date</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Amount</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Auto Renew</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-muted-foreground">No subscriptions found.</td></tr>
                ) : filtered.map((sub, i) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                          {getInitials(sub.memberName)}
                        </div>
                        <div>
                          <p className="font-medium leading-tight">{sub.memberName}</p>
                          <p className="text-xs text-muted-foreground">{sub.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-primary">{sub.plan}</span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">{sub.startDate}</td>
                    <td className={`px-4 py-3.5 font-medium ${sub.status === 'Expired' ? 'text-red-500' : ''}`}>{sub.endDate}</td>
                    <td className="px-4 py-3.5 font-medium">${sub.amount}</td>
                    <td className="px-4 py-3.5">
                      <Switch
                        checked={sub.autoRenew}
                        onCheckedChange={() => toggleAutoRenew(sub.id)}
                        className="scale-90"
                      />
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={sub.status} /></td>
                    <td className="px-4 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setViewSub(sub)} className="gap-2 cursor-pointer">
                            <Eye className="w-4 h-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setRenewSub(sub)} className="gap-2 cursor-pointer">
                            <RefreshCw className="w-4 h-4" /> Renew
                          </DropdownMenuItem>
                          {sub.status === 'Active' && (
                            <DropdownMenuItem onClick={() => handleCancel(sub.id)} className="gap-2 cursor-pointer text-amber-600 focus:text-amber-600">
                              <X className="w-4 h-4" /> Cancel
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(sub.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" /> Delete
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

      {/* ── Edit Plan Modal ── */}
      <Dialog open={!!editPlan} onOpenChange={() => setEditPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Plan — {editPlan?.name}
            </DialogTitle>
            <DialogDescription>Update pricing and features for this plan.</DialogDescription>
          </DialogHeader>
          {editPlan && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Plan Name</Label>
                <Input value={editPlan.name} onChange={e => setEditPlan(p => p ? { ...p, name: e.target.value } : p)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Price ($)</Label>
                  <Input type="number" value={editPlan.price} onChange={e => setEditPlan(p => p ? { ...p, price: parseInt(e.target.value) || 0 } : p)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Period Label</Label>
                  <Input value={editPlan.periodLabel} placeholder="e.g. /mo" onChange={e => setEditPlan(p => p ? { ...p, periodLabel: e.target.value } : p)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Features (one per line)</Label>
                <textarea
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                  value={editPlan.features.join('\n')}
                  onChange={e => setEditPlan(p => p ? { ...p, features: e.target.value.split('\n').filter(Boolean) } : p)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!editPlan.popular}
                  onCheckedChange={v => setEditPlan(p => p ? { ...p, popular: v } : p)}
                />
                <Label>Mark as Most Popular</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlan(null)}>Cancel</Button>
            <Button onClick={handlePlanSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Subscription Modal ── */}
      <Dialog open={!!viewSub} onOpenChange={() => setViewSub(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
          </DialogHeader>
          {viewSub && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/40 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${avatarColors[0]}`}>
                  {getInitials(viewSub.memberName)}
                </div>
                <div>
                  <p className="font-semibold">{viewSub.memberName}</p>
                  <p className="text-sm text-muted-foreground">{viewSub.email}</p>
                  <StatusBadge status={viewSub.status} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Member ID', value: viewSub.memberId },
                  { label: 'Plan', value: viewSub.plan },
                  { label: 'Start Date', value: viewSub.startDate },
                  { label: 'End Date', value: viewSub.endDate },
                  { label: 'Amount', value: `$${viewSub.amount}` },
                  { label: 'Auto Renew', value: viewSub.autoRenew ? 'Enabled' : 'Disabled' },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-2" onClick={() => { setRenewSub(viewSub); setViewSub(null); }}>
                  <RefreshCw className="w-4 h-4" /> Renew Subscription
                </Button>
                {viewSub.status === 'Active' && (
                  <Button variant="outline" className="gap-2" onClick={() => { handleCancel(viewSub.id); setViewSub(null); }}>
                    <X className="w-4 h-4" /> Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Renew Modal ── */}
      <Dialog open={!!renewSub} onOpenChange={() => setRenewSub(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-primary" /> Renew Subscription
            </DialogTitle>
          </DialogHeader>
          {renewSub && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-400">Renew Confirmation</p>
                  <p className="text-amber-700 dark:text-amber-500 mt-0.5">
                    Renewing <strong>{renewSub.plan}</strong> for <strong>{renewSub.memberName}</strong>. This will extend access and activate biometric login.
                  </p>
                </div>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="font-medium">{renewSub.plan}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">${renewSub.amount}</span></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewSub(null)}>Cancel</Button>
            <Button onClick={handleRenew}>
              <RefreshCw className="w-4 h-4 mr-2" /> Confirm Renewal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Subscription Modal ── */}
      <Dialog open={showAddSub} onOpenChange={setShowAddSub}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> New Subscription
            </DialogTitle>
            <DialogDescription>Assign a membership plan to a workspace member.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Member Name *</Label>
              <Input placeholder="e.g. John Doe" value={addForm.memberName} onChange={e => setAddForm(f => ({ ...f, memberName: e.target.value }))} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Email</Label>
              <Input type="email" placeholder="john@company.com" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Plan *</Label>
              <Select value={addForm.plan} onValueChange={v => setAddForm(f => ({ ...f, plan: v }))}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  {plans.map(p => <SelectItem key={p.id} value={p.name}>{p.name} — ${p.price}{p.periodLabel}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Amount ($)</Label>
              <Input type="number" placeholder="e.g. 299" value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" value={addForm.startDate} onChange={e => setAddForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <Switch checked={addForm.autoRenew} onCheckedChange={v => setAddForm(f => ({ ...f, autoRenew: v }))} />
              <Label>Auto Renew</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddSub(false)}>Cancel</Button>
            <Button onClick={handleAddSub} disabled={!addForm.memberName || !addForm.plan}>
              <Plus className="w-4 h-4 mr-2" /> Create Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
