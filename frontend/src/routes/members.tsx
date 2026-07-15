import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Search, Mail, Phone, Building2, 
  MoreHorizontal, Eye, Edit2, Trash2,
  Fingerprint, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/members')({
  component: () => <DashboardLayout><MembersPage /></DashboardLayout>,
});


type Status = 'Active' | 'Expired' | 'Suspended' | 'Pending Approval';

interface Member {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: string;
  workspace: string;
  joined: string;
  status: Status;
  mobile: string;
  designation: string;
}

const initialMembers: Member[] = [
  { id: '1', name: 'Aarav Sharma', email: 'aarav@northlabs.io', company: 'NorthLabs', plan: 'Annual', workspace: 'Cabin 4B', joined: '2024-11-02', status: 'Active', mobile: '+91 9876543210', designation: 'CTO' },
  { id: '2', name: 'Priya Menon', email: 'priya@fluxwave.com', company: 'Fluxwave', plan: 'Monthly', workspace: 'Desk 12', joined: '2025-03-14', status: 'Active', mobile: '+91 9123456789', designation: 'UX Designer' },
  { id: '3', name: 'Kenji Watanabe', email: 'kenji@orbit.co', company: 'Orbit', plan: 'Quarterly', workspace: 'Hot Desk', joined: '2025-06-01', status: 'Expired', mobile: '+91 9988776655', designation: 'Software Engineer' },
  { id: '4', name: 'Sofia Rossi', email: 'sofia@paperkite.eu', company: 'Paperkite', plan: 'Half-Yearly', workspace: 'Cabin 2A', joined: '2025-01-20', status: 'Active', mobile: '+91 9871234567', designation: 'Product Manager' },
  { id: '5', name: 'Marcus Bell', email: 'marcus@steelroot.io', company: 'Steelroot', plan: 'Day Pass', workspace: 'Hot Desk', joined: '2026-07-14', status: 'Pending Approval', mobile: '+91 9765432109', designation: 'Consultant' },
  { id: '6', name: 'Lina Haddad', email: 'lina@vestra.app', company: 'Vestra', plan: 'Monthly', workspace: 'Desk 05', joined: '2025-09-08', status: 'Suspended', mobile: '+91 9654321098', designation: 'Data Analyst' },
  { id: '7', name: 'Tom Chen', email: 'tom@nexgen.io', company: 'NexGen', plan: 'Annual', workspace: 'Cabin 1A', joined: '2024-05-12', status: 'Active', mobile: '+91 9543210987', designation: 'CEO' },
  { id: '8', name: 'Aisha Patel', email: 'aisha@springboard.co', company: 'Springboard', plan: 'Monthly', workspace: 'Desk 08', joined: '2025-11-30', status: 'Active', mobile: '+91 9432109876', designation: 'Marketing Lead' },
];

const statusConfig: Record<Status, { className: string }> = {
  'Active': { className: 'bg-green-100 text-green-700 border-green-200' },
  'Expired': { className: 'bg-red-100 text-red-700 border-red-200' },
  'Suspended': { className: 'bg-red-100 text-red-700 border-red-200' },
  'Pending Approval': { className: 'bg-amber-100 text-amber-700 border-amber-200' },
};

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
  'bg-orange-100 text-orange-700',
];

const ITEMS_PER_PAGE = 8;

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function MembersPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | Status>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMember, setViewMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);

  const [form, setForm] = useState({
    name: '', email: '', mobile: '', company: '', designation: '',
    plan: '', workspace: '', status: 'Active' as Status,
  });

  const filtered = members.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.company.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'All' || m.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = (id: string) => setMembers(prev => prev.filter(m => m.id !== id));

  const handleAddMember = () => {
    if (!form.name || !form.email) return;
    const newMember: Member = {
      id: String(Date.now()),
      name: form.name,
      email: form.email,
      mobile: form.mobile,
      company: form.company,
      designation: form.designation,
      plan: form.plan || 'Monthly',
      workspace: form.workspace || 'Hot Desk',
      joined: new Date().toISOString().split('T')[0],
      status: form.status,
    };
    setMembers(prev => [newMember, ...prev]);
    setShowAddModal(false);
    setForm({ name: '', email: '', mobile: '', company: '', designation: '', plan: '', workspace: '', status: 'Active' });
  };

  const handleEditSave = () => {
    if (!editMember) return;
    setMembers(prev => prev.map(m => m.id === editMember.id ? editMember : m));
    setEditMember(null);
  };

  const tabs: ('All' | Status)[] = ['All', 'Active', 'Expired', 'Suspended'];

  const workspaceOptions = ['Cabin 1A', 'Cabin 2A', 'Cabin 4B', 'Desk 05', 'Desk 08', 'Desk 12', 'Hot Desk'];
  const planOptions = ['Day Pass', 'Weekly Pass', 'Monthly Membership', 'Quarterly Membership', 'Half-Yearly Membership', 'Annual Membership'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground mt-1">Manage member profiles, memberships, and workspace assignments.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2 shrink-0">
          <UserPlus className="w-4 h-4" />
          Add member
        </Button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, company..."
              className="pl-9 bg-muted/40 border-none focus-visible:ring-1"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 border text-sm">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="font-semibold text-foreground pl-6">Member</TableHead>
              <TableHead className="font-semibold text-foreground">Company</TableHead>
              <TableHead className="font-semibold text-foreground">Plan</TableHead>
              <TableHead className="font-semibold text-foreground">Workspace</TableHead>
              <TableHead className="font-semibold text-foreground">Joined</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="w-12 pr-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    No members found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : paginated.map((member, i) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors group"
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <p className="font-medium text-sm leading-tight">{member.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.company}</TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-blue-600">{member.plan}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.workspace}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{member.joined}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[member.status].className}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {member.status}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => setViewMember(member)} className="gap-2 cursor-pointer">
                          <Eye className="w-4 h-4" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditMember({ ...member })} className="gap-2 cursor-pointer">
                          <Edit2 className="w-4 h-4" /> Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <Fingerprint className="w-4 h-4" /> Biometric Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(member.id)}
                          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" /> Delete Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t text-sm text-muted-foreground">
            <span>
              Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filtered.length)}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="icon" className="h-8 w-8" onClick={() => setCurrentPage(page)}>
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add Member Modal ── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" /> Add New Member
            </DialogTitle>
            <DialogDescription>Fill in the details to register a new workspace member.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Full Name *</Label>
              <Input placeholder="e.g. John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" type="email" placeholder="john@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Mobile</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="+91 98765 43210" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Company</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Company name" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Designation</Label>
              <Input placeholder="e.g. Software Engineer" value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Membership Plan</Label>
              <Select value={form.plan} onValueChange={v => setForm(f => ({ ...f, plan: v }))}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  {planOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assigned Workspace</Label>
              <Select value={form.workspace} onValueChange={v => setForm(f => ({ ...f, workspace: v }))}>
                <SelectTrigger><SelectValue placeholder="Select workspace" /></SelectTrigger>
                <SelectContent>
                  {workspaceOptions.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Status }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['Active', 'Pending Approval', 'Suspended'] as Status[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={!form.name || !form.email}>
              <UserPlus className="w-4 h-4 mr-2" /> Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Profile Modal ── */}
      <Dialog open={!!viewMember} onOpenChange={() => setViewMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Member Profile</DialogTitle>
          </DialogHeader>
          {viewMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${avatarColors[0]}`}>
                  {getInitials(viewMember.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{viewMember.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewMember.designation} · {viewMember.company}</p>
                  <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[viewMember.status].className}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {viewMember.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Email', value: viewMember.email },
                  { label: 'Mobile', value: viewMember.mobile },
                  { label: 'Membership Plan', value: viewMember.plan, blue: true },
                  { label: 'Workspace', value: viewMember.workspace },
                  { label: 'Joining Date', value: viewMember.joined },
                  { label: 'Designation', value: viewMember.designation },
                ].map(({ label, value, blue }) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-muted-foreground text-xs">{label}</p>
                    <p className={`font-medium ${blue ? 'text-blue-600' : ''}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-2" onClick={() => { setEditMember({ ...viewMember }); setViewMember(null); }}>
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </Button>
                <Button variant="outline" className="gap-2">
                  <Fingerprint className="w-4 h-4" /> Biometrics
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Member Modal ── */}
      <Dialog open={!!editMember} onOpenChange={() => setEditMember(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Member
            </DialogTitle>
            <DialogDescription>Update member details and membership settings.</DialogDescription>
          </DialogHeader>
          {editMember && (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5 col-span-2">
                <Label>Full Name</Label>
                <Input value={editMember.name} onChange={e => setEditMember(m => m ? { ...m, name: e.target.value } : m)} />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input value={editMember.company} onChange={e => setEditMember(m => m ? { ...m, company: e.target.value } : m)} />
              </div>
              <div className="space-y-1.5">
                <Label>Designation</Label>
                <Input value={editMember.designation} onChange={e => setEditMember(m => m ? { ...m, designation: e.target.value } : m)} />
              </div>
              <div className="space-y-1.5">
                <Label>Workspace</Label>
                <Select value={editMember.workspace} onValueChange={v => setEditMember(m => m ? { ...m, workspace: v } : m)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {workspaceOptions.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Plan</Label>
                <Select value={editMember.plan} onValueChange={v => setEditMember(m => m ? { ...m, plan: v } : m)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {planOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Status</Label>
                <Select value={editMember.status} onValueChange={v => setEditMember(m => m ? { ...m, status: v as Status } : m)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['Active', 'Expired', 'Suspended', 'Pending Approval'] as Status[]).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
