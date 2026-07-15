import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings2, Building2, Users, MoreHorizontal, Edit2, Trash2, Eye, Ban, CheckCircle2, Mail, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { type Tenant, type TenantStatus, tenantService } from '@/services/tenantService';
import { toast } from 'sonner';

export const Route = createFileRoute('/tenants')({
  component: () => <DashboardLayout><TenantsPage /></DashboardLayout>,
});

const cardColors = [
  { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
  { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300' },
  { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300' },
  { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-700 dark:text-teal-300' },
];

function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewTenant, setViewTenant] = useState<Tenant | null>(null);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', plan: '', contact_person: '', contact_email: '', contact_phone: '', status: 'active' as TenantStatus,
  });

  const fetchTenants = async () => {
    try {
      const data = await tenantService.getAll();
      setTenants(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleAdd = async () => {
    if (!form.name) return;
    setIsSubmitting(true);
    try {
      const newTenant = await tenantService.create(form);
      setTenants(p => [newTenant, ...p]);
      setShowAdd(false);
      setForm({ name: '', plan: '', contact_person: '', contact_email: '', contact_phone: '', status: 'active' });
      toast.success('Tenant created successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSave = async () => {
    if (!editTenant) return;
    setIsSubmitting(true);
    try {
      const updated = await tenantService.update(editTenant.id, editTenant);
      setTenants(p => p.map(t => t.id === updated.id ? updated : t));
      setEditTenant(null);
      toast.success('Tenant updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update tenant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tenant?')) return;
    try {
      await tenantService.delete(id);
      setTenants(p => p.filter(t => t.id !== id));
      toast.success('Tenant deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete tenant');
    }
  };

  const toggleStatus = async (tenant: Tenant) => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    try {
      const updated = await tenantService.update(tenant.id, { status: newStatus });
      setTenants(p => p.map(t => t.id === tenant.id ? updated : t));
      toast.success(`Tenant ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  const statusBadge = (status: string) => {
    const isActive = status?.toLowerCase() === 'active';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        isActive ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800' : 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  const tableStatusBadge = (status: string) => {
    const isActive = status?.toLowerCase() === 'active';
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
          <p className="text-muted-foreground mt-1">
            Onboard organizations, allocate workspaces, and manage tenant lifecycle.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          New tenant
        </Button>
      </div>

      {/* Tenant Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {tenants.map((tenant, i) => {
            const color = cardColors[i % cardColors.length];
            return (
              <motion.div
                key={tenant.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4"
              >
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${color.bg} ${color.text}`}>
                    {tenant.name.charAt(0).toUpperCase()}
                  </div>
                  {statusBadge(tenant.status)}
                </div>

                {/* Card Info */}
                <div>
                  <h3 className="font-semibold text-base">{tenant.name}</h3>
                  <p className="text-sm text-muted-foreground">{tenant.plan || 'No'} plan</p>
                </div>

                {/* Card Footer */}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {tenant.members_count || 0} members
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10 h-7 px-2 text-xs gap-1"
                    onClick={() => setViewTenant(tenant)}
                  >
                    Manage <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Tenants Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left font-semibold text-foreground px-6 py-3.5">Tenant ID</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Name</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Plan</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Members</th>
                <th className="text-left font-semibold text-foreground px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {tenants.map((tenant, i) => (
                  <motion.tr
                    key={tenant.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-6 py-3.5 text-muted-foreground font-mono text-xs">T-0{tenant.id}</td>
                    <td className="px-4 py-3.5 font-semibold">{tenant.name}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{tenant.plan || '-'}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{tenant.members_count || 0}</td>
                    <td className="px-4 py-3.5">{tableStatusBadge(tenant.status)}</td>
                    <td className="px-4 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setViewTenant(tenant)} className="gap-2 cursor-pointer">
                            <Eye className="w-4 h-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditTenant({ ...tenant })} className="gap-2 cursor-pointer">
                            <Edit2 className="w-4 h-4" /> Edit Tenant
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(tenant)} className="gap-2 cursor-pointer">
                            {tenant.status === 'active'
                              ? <><Ban className="w-4 h-4" /> Suspend</>
                              : <><CheckCircle2 className="w-4 h-4" /> Activate</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(tenant.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" /> Delete Tenant
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    No tenants found. Click "New tenant" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add Tenant Modal ── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> New Tenant
            </DialogTitle>
            <DialogDescription>Onboard a new organization to the workspace platform.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Organization Name *</Label>
              <Input placeholder="e.g. Acme Corp" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Plan</Label>
              <Select value={form.plan} onValueChange={v => setForm(f => ({ ...f, plan: v }))}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  {['Startup', 'Business', 'Enterprise'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as TenantStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Contact Person</Label>
              <Input placeholder="Contact person's name" value={form.contact_person} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" type="email" placeholder="org@company.com" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Mobile</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="+91 98765 43210" value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.name || isSubmitting}>
              {isSubmitting ? 'Creating...' : <><Plus className="w-4 h-4 mr-2" /> Create Tenant</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View / Manage Modal ── */}
      <Dialog open={!!viewTenant} onOpenChange={() => setViewTenant(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tenant Profile</DialogTitle>
            <DialogDescription>Organization details and workspace allocation.</DialogDescription>
          </DialogHeader>
          {viewTenant && (() => {
            const i = tenants.findIndex(t => t.id === viewTenant.id);
            const color = cardColors[i % cardColors.length] || cardColors[0];
            return (
              <div className="space-y-4">
                <div className={`flex items-center gap-4 p-4 rounded-xl ${color.bg}`}>
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold bg-white/50 dark:bg-black/20 ${color.text}`}>
                    {viewTenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${color.text}`}>{viewTenant.name}</h3>
                    <p className={`text-sm opacity-80 ${color.text}`}>{viewTenant.plan} Plan</p>
                    {statusBadge(viewTenant.status)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Tenant ID', value: 'T-0' + viewTenant.id },
                    { label: 'Members', value: `${viewTenant.members_count || 0} members` },
                    { label: 'Contact Person', value: viewTenant.contact_person },
                    { label: 'Email', value: viewTenant.contact_email },
                    { label: 'Mobile', value: viewTenant.contact_phone },
                    { label: 'Workspaces', value: `${viewTenant.workspaces_assigned || 0} assigned` },
                  ].map(({ label, value }) => (
                    <div key={label} className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium">{value || '—'}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 gap-2" onClick={() => { setEditTenant({ ...viewTenant }); setViewTenant(null); }}>
                    <Edit2 className="w-4 h-4" /> Edit Tenant
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => { toggleStatus(viewTenant); setViewTenant(null); }}
                  >
                    {viewTenant.status === 'active' ? <><Ban className="w-4 h-4" /> Suspend</> : <><CheckCircle2 className="w-4 h-4" /> Activate</>}
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Edit Tenant Modal ── */}
      <Dialog open={!!editTenant} onOpenChange={() => setEditTenant(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Tenant
            </DialogTitle>
            <DialogDescription>Update organization details.</DialogDescription>
          </DialogHeader>
          {editTenant && (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5 col-span-2">
                <Label>Organization Name</Label>
                <Input value={editTenant.name} onChange={e => setEditTenant(t => t ? { ...t, name: e.target.value } : t)} />
              </div>
              <div className="space-y-1.5">
                <Label>Plan</Label>
                <Select value={editTenant.plan || ''} onValueChange={v => setEditTenant(t => t ? { ...t, plan: v } : t)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Startup', 'Business', 'Enterprise'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editTenant.status} onValueChange={v => setEditTenant(t => t ? { ...t, status: v as TenantStatus } : t)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Contact Person</Label>
                <Input value={editTenant.contact_person || ''} onChange={e => setEditTenant(t => t ? { ...t, contact_person: e.target.value } : t)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={editTenant.contact_email || ''} onChange={e => setEditTenant(t => t ? { ...t, contact_email: e.target.value } : t)} />
              </div>
              <div className="space-y-1.5">
                <Label>Mobile</Label>
                <Input value={editTenant.contact_phone || ''} onChange={e => setEditTenant(t => t ? { ...t, contact_phone: e.target.value } : t)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTenant(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
