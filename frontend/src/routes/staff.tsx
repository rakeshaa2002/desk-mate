import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, MoreHorizontal, Edit2, Trash2, Mail,
  ShieldAlert, ShieldCheck, UserCheck, Shield, Eye, EyeOff
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { staffService, type StaffMemberDto } from '@/services/staffService';

export const Route = createFileRoute('/staff')({
  component: () => <DashboardLayout><StaffPage /></DashboardLayout>,
});

type StaffStatus = 'Active' | 'Inactive' | 'Invited';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: StaffStatus;
  joinedDate: string;
}

const ROLES = [
  'Super Admin',
  'Organization Admin',
  'Receptionist',
  'Security',
  'Accounts',
  'Support'
];

function toStaffMember(dto: StaffMemberDto): StaffMember {
  return {
    id: String(dto.id),
    name: dto.name,
    email: dto.email,
    role: dto.role,
    status: dto.status,
    joinedDate: dto.joined_date ? dto.joined_date.split('T')[0] : '—',
  };
}

const avatarColors = ['bg-blue-100 text-blue-700','bg-purple-100 text-purple-700','bg-amber-100 text-amber-700','bg-green-100 text-green-700','bg-rose-100 text-rose-700','bg-teal-100 text-teal-700'];
function getInitials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

const STATUS_STYLE: Record<StaffStatus, string> = {
  'Active': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  'Inactive': 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  'Invited': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
};

const ROLE_STYLE: Record<string, string> = {
  'Super Admin': 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/30 dark:bg-purple-900/20 dark:text-purple-400',
  'Organization Admin': 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400',
  'Receptionist': 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900/30 dark:bg-teal-900/20 dark:text-teal-400',
  'Security': 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400',
  'Accounts': 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400',
  'Support': 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/20 dark:text-orange-400',
};

function StaffPage() {
  const queryClient = useQueryClient();
  const { data: staffDtos, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: staffService.list,
  });
  const staff = (staffDtos ?? []).map(toStaffMember);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: '', status: 'Active' as StaffStatus });
  const [showPassword, setShowPassword] = useState(false);

  const invalidateStaff = () => queryClient.invalidateQueries({ queryKey: ['staff'] });

  const createMutation = useMutation({
    mutationFn: staffService.create,
    onSuccess: () => { invalidateStaff(); toast.success('Staff member added'); },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Failed to add staff member'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof staffService.update>[1] }) =>
      staffService.update(id, data),
    onSuccess: () => { invalidateStaff(); toast.success('Staff member updated'); },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Failed to update staff member'),
  });

  const deleteMutation = useMutation({
    mutationFn: staffService.remove,
    onSuccess: () => { invalidateStaff(); toast.success('Staff member removed'); },
    onError: () => toast.error('Failed to remove staff member'),
  });

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setForm({ name: '', email: '', password: '', role: '', status: 'Active' });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setEditingStaff(member);
    setForm({ name: member.name, email: member.email, password: '', role: member.role, status: member.status });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(Number(id));
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.role || (!editingStaff && !form.password)) return;

    if (editingStaff) {
      updateMutation.mutate({
        id: Number(editingStaff.id),
        data: {
          name: form.name,
          email: form.email,
          role: form.role,
          status: form.status,
          ...(form.password ? { password: form.password } : {}),
        },
      });
    } else {
      createMutation.mutate({
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
        password: form.password,
      });
    }
    setIsModalOpen(false);
  };

  const activeCount = staff.filter(s => s.status === 'Active').length;
  const adminCount = staff.filter(s => s.role === 'Super Admin' || s.role === 'Organization Admin').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Directory</h1>
          <p className="text-muted-foreground mt-1">Manage internal employees and assign RBAC roles.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <UserPlus className="w-4 h-4" /> Add Staff Member
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><UserCheck className="w-4 h-4 text-blue-500"/> Total Staff</p>
          <p className="text-3xl font-bold mt-1">{staff.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500"/> Active Members</p>
          <p className="text-3xl font-bold mt-1">{activeCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-purple-500"/> Admins</p>
          <p className="text-3xl font-bold mt-1">{adminCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground flex items-center gap-2"><Mail className="w-4 h-4 text-amber-500"/> Pending Invites</p>
          <p className="text-3xl font-bold mt-1">{staff.filter(s => s.status === 'Invited').length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left font-semibold text-foreground px-6 py-4">Employee</th>
                <th className="text-left font-semibold text-foreground px-6 py-4">Assigned Role</th>
                <th className="text-left font-semibold text-foreground px-6 py-4">Status</th>
                <th className="text-left font-semibold text-foreground px-6 py-4">Joined Date</th>
                <th className="px-4 py-4 w-12" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading staff…</td>
                </tr>
              )}
              <AnimatePresence mode="popLayout">
                {staff.map((member, i) => (
                  <motion.tr 
                    key={member.id}
                    initial={{ opacity: 0, y: 4 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b last:border-0 hover:bg-muted/20 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                          {getInitials(member.name)}
                        </div>
                        <div>
                          <p className="font-semibold leading-tight">{member.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${ROLE_STYLE[member.role] || 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[member.status]}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />{member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {member.joinedDate}
                    </td>
                    <td className="px-4 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleOpenEdit(member)} className="gap-2 cursor-pointer">
                            <Edit2 className="w-4 h-4" /> Edit Profile
                          </DropdownMenuItem>
                          {member.status !== 'Invited' && (
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Mail className="w-4 h-4" /> Reset Password
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(member.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4" /> Remove Access
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

      {/* ── Add / Edit Staff Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </DialogTitle>
            <DialogDescription>
              {editingStaff ? 'Update details or change the assigned role.' : 'Invite a new employee and grant them platform access.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                placeholder="e.g. Jane Doe" 
                value={form.name} 
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Work Email *</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="e.g. jane@company.com" 
                value={form.email} 
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password">{editingStaff ? 'New Password (Optional)' : 'Password *'}</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder={editingStaff ? "Leave blank to keep current" : "••••••••"} 
                  value={form.password} 
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assigned Role *</Label>
              <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Account Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as StaffStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Invited">Invited (Pending Setup)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.email || !form.role || (!editingStaff && !form.password)}>
              {editingStaff ? 'Save Changes' : 'Add Staff'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
