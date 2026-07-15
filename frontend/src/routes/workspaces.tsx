import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, DoorOpen, Users, Edit2, Trash2, Eye, MoreHorizontal, Wrench, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/workspaces')({
  component: () => <DashboardLayout><WorkspacesPage /></DashboardLayout>,
});

type WorkspaceStatus = 'Available' | 'Occupied' | 'Reserved' | 'Under Maintenance';
type WorkspaceType = 'Private Cabin' | 'Dedicated Desk' | 'Hot Desk' | 'Meeting Room' | 'Conference Room' | 'Event Space';

interface Workspace {
  id: string;
  name: string;
  type: WorkspaceType;
  status: WorkspaceStatus;
  capacity: number;
  price: number;
  floor?: string;
  amenities: string[];
  tenant?: string;
}

const initialWorkspaces: Workspace[] = [
  { id: '1', name: 'Cabin 1A', type: 'Private Cabin', status: 'Occupied', capacity: 4, price: 1200, floor: '1st Floor', amenities: ['WiFi', 'AC', 'Whiteboard'], tenant: 'Northlabs' },
  { id: '2', name: 'Cabin 2A', type: 'Private Cabin', status: 'Occupied', capacity: 6, price: 1800, floor: '1st Floor', amenities: ['WiFi', 'AC', 'TV Screen'], tenant: 'Fluxwave' },
  { id: '3', name: 'Desk 12', type: 'Dedicated Desk', status: 'Occupied', capacity: 1, price: 300, floor: '2nd Floor', amenities: ['WiFi', 'Locker'], tenant: 'Priya Menon' },
  { id: '4', name: 'Desk 15', type: 'Dedicated Desk', status: 'Available', capacity: 1, price: 300, floor: '2nd Floor', amenities: ['WiFi', 'Locker'] },
  { id: '5', name: 'Hot Zone A', type: 'Hot Desk', status: 'Available', capacity: 20, price: 150, floor: 'Ground Floor', amenities: ['WiFi', 'Power Outlets', 'Cafeteria'] },
  { id: '6', name: 'Sync Room', type: 'Meeting Room', status: 'Reserved', capacity: 8, price: 500, floor: '2nd Floor', amenities: ['Projector', 'Whiteboard', 'Video Conf.'] },
  { id: '7', name: 'Boardroom', type: 'Conference Room', status: 'Under Maintenance', capacity: 16, price: 800, floor: '3rd Floor', amenities: ['4K Display', 'Video Conf.', 'Sound System'] },
  { id: '8', name: 'Atrium', type: 'Event Space', status: 'Available', capacity: 120, price: 2500, floor: 'Ground Floor', amenities: ['Stage', 'PA System', 'Catering Area'] },
];

const STATUS_CONFIG: Record<WorkspaceStatus, { badge: string; dot: string; label: string }> = {
  'Available':         { badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',   dot: 'bg-green-500',  label: 'Available' },
  'Occupied':          { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',       dot: 'bg-blue-500',   label: 'Occupied' },
  'Reserved':          { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',   dot: 'bg-amber-500',  label: 'Reserved' },
  'Under Maintenance': { badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',           dot: 'bg-red-500',    label: 'Under Maintenance' },
};

const TYPE_FILTERS: ('All' | WorkspaceType)[] = ['All', 'Private Cabin', 'Dedicated Desk', 'Hot Desk', 'Meeting Room', 'Conference Room', 'Event Space'];
const STATUS_FILTERS: ('All' | WorkspaceStatus)[] = ['All', 'Available', 'Occupied', 'Reserved', 'Under Maintenance'];
const TYPES: WorkspaceType[] = ['Private Cabin', 'Dedicated Desk', 'Hot Desk', 'Meeting Room', 'Conference Room', 'Event Space'];
const STATUSES: WorkspaceStatus[] = ['Available', 'Occupied', 'Reserved', 'Under Maintenance'];

function StatusBadge({ status }: { status: WorkspaceStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// Workspace card icon
function WorkspaceIcon({ type }: { type: WorkspaceType }) {
  return (
    <div className="flex items-center justify-center w-full py-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <DoorOpen className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [typeFilter, setTypeFilter] = useState<'All' | WorkspaceType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | WorkspaceStatus>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [viewWs, setViewWs] = useState<Workspace | null>(null);
  const [editWs, setEditWs] = useState<Workspace | null>(null);

  const [form, setForm] = useState({
    name: '', type: '' as WorkspaceType | '', status: 'Available' as WorkspaceStatus,
    capacity: '', price: '', floor: '', amenities: '', tenant: '',
  });

  const filtered = workspaces.filter(w => {
    const matchType = typeFilter === 'All' || w.type === typeFilter;
    const matchStatus = statusFilter === 'All' || w.status === statusFilter;
    return matchType && matchStatus;
  });

  const handleAdd = () => {
    if (!form.name || !form.type) return;
    const newWs: Workspace = {
      id: String(Date.now()),
      name: form.name,
      type: form.type as WorkspaceType,
      status: form.status,
      capacity: parseInt(form.capacity) || 1,
      price: parseInt(form.price) || 0,
      floor: form.floor,
      amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean),
      tenant: form.tenant || undefined,
    };
    setWorkspaces(p => [newWs, ...p]);
    setShowAdd(false);
    setForm({ name: '', type: '', status: 'Available', capacity: '', price: '', floor: '', amenities: '', tenant: '' });
  };

  const handleEditSave = () => {
    if (!editWs) return;
    setWorkspaces(p => p.map(w => w.id === editWs.id ? editWs : w));
    setEditWs(null);
  };

  const handleDelete = (id: string) => setWorkspaces(p => p.filter(w => w.id !== id));

  const cycleStatus = (id: string) => {
    setWorkspaces(p => p.map(w => {
      if (w.id !== id) return w;
      const idx = STATUSES.indexOf(w.status);
      return { ...w, status: STATUSES[(idx + 1) % STATUSES.length] };
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground mt-1">Private cabins, dedicated desks, hot desks, meeting &amp; event spaces.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Add space
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Type tabs */}
        <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 border text-sm overflow-x-auto">
          {TYPE_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all ${
                typeFilter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {/* Status filter */}
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[180px] bg-muted/40 border">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map(s => <SelectItem key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20 text-muted-foreground"
            >
              No workspaces match the selected filters.
            </motion.div>
          ) : filtered.map((ws, i) => (
            <motion.div
              key={ws.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
            >
              {/* Card Icon Area */}
              <div className="relative bg-primary/5 dark:bg-primary/10 border-b">
                <WorkspaceIcon type={ws.type} />
                {/* Status badge top-right */}
                <div className="absolute top-3 right-3">
                  <StatusBadge status={ws.status} />
                </div>
                {/* Context menu top-left */}
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-44">
                      <DropdownMenuItem onClick={() => setViewWs(ws)} className="gap-2 cursor-pointer">
                        <Eye className="w-4 h-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditWs({ ...ws })} className="gap-2 cursor-pointer">
                        <Edit2 className="w-4 h-4" /> Edit Space
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => cycleStatus(ws.id)} className="gap-2 cursor-pointer">
                        <Wrench className="w-4 h-4" /> Change Status
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(ws.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                        <Trash2 className="w-4 h-4" /> Delete Space
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <h3 className="font-semibold text-base leading-tight">{ws.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{ws.type}</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Capacity {ws.capacity}
                  </span>
                  <button
                    onClick={() => setViewWs(ws)}
                    className="text-xs font-semibold text-primary hover:underline underline-offset-2 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Add Space Modal ── */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" /> Add New Space
            </DialogTitle>
            <DialogDescription>Configure a new workspace in your coworking facility.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5 col-span-2">
              <Label>Space Name *</Label>
              <Input placeholder="e.g. Cabin 3B" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as WorkspaceType }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as WorkspaceStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Capacity</Label>
              <Input type="number" placeholder="e.g. 4" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Price / Month (₹)</Label>
              <Input type="number" placeholder="e.g. 1200" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Floor</Label>
              <Input placeholder="e.g. 2nd Floor" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Tenant (if Occupied)</Label>
              <Input placeholder="Tenant name" value={form.tenant} onChange={e => setForm(f => ({ ...f, tenant: e.target.value }))} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Amenities (comma separated)</Label>
              <Input placeholder="e.g. WiFi, AC, Whiteboard" value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.type}>
              <Plus className="w-4 h-4 mr-2" /> Add Space
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Details Modal ── */}
      <Dialog open={!!viewWs} onOpenChange={() => setViewWs(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Workspace Details</DialogTitle>
          </DialogHeader>
          {viewWs && (
            <div className="space-y-4">
              {/* Top banner */}
              <div className="rounded-xl bg-primary/10 dark:bg-primary/20 p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <DoorOpen className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{viewWs.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewWs.type}</p>
                  <StatusBadge status={viewWs.status} />
                </div>
              </div>
              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Capacity', value: `${viewWs.capacity} person${viewWs.capacity > 1 ? 's' : ''}` },
                  { label: 'Price / Month', value: `₹${viewWs.price.toLocaleString()}` },
                  { label: 'Floor', value: viewWs.floor || '—' },
                  { label: 'Tenant', value: viewWs.tenant || 'Unoccupied' },
                ].map(({ label, value }) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
              {/* Amenities */}
              {viewWs.amenities.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {viewWs.amenities.map(a => (
                      <span key={a} className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium">{a}</span>
                    ))}
                  </div>
                </div>
              )}
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1 gap-2" onClick={() => { setEditWs({ ...viewWs }); setViewWs(null); }}>
                  <Edit2 className="w-4 h-4" /> Edit Space
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => { cycleStatus(viewWs.id); setViewWs(null); }}>
                  <Wrench className="w-4 h-4" /> Change Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Space Modal ── */}
      <Dialog open={!!editWs} onOpenChange={() => setEditWs(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" /> Edit Space
            </DialogTitle>
            <DialogDescription>Update workspace configuration and details.</DialogDescription>
          </DialogHeader>
          {editWs && (
            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5 col-span-2">
                <Label>Space Name</Label>
                <Input value={editWs.name} onChange={e => setEditWs(w => w ? { ...w, name: e.target.value } : w)} />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={editWs.type} onValueChange={v => setEditWs(w => w ? { ...w, type: v as WorkspaceType } : w)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={editWs.status} onValueChange={v => setEditWs(w => w ? { ...w, status: v as WorkspaceStatus } : w)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Capacity</Label>
                <Input type="number" value={editWs.capacity} onChange={e => setEditWs(w => w ? { ...w, capacity: parseInt(e.target.value) || 1 } : w)} />
              </div>
              <div className="space-y-1.5">
                <Label>Price / Month (₹)</Label>
                <Input type="number" value={editWs.price} onChange={e => setEditWs(w => w ? { ...w, price: parseInt(e.target.value) || 0 } : w)} />
              </div>
              <div className="space-y-1.5">
                <Label>Floor</Label>
                <Input value={editWs.floor || ''} onChange={e => setEditWs(w => w ? { ...w, floor: e.target.value } : w)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tenant</Label>
                <Input value={editWs.tenant || ''} onChange={e => setEditWs(w => w ? { ...w, tenant: e.target.value } : w)} placeholder="Leave empty if unoccupied" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Amenities (comma separated)</Label>
                <Input
                  value={editWs.amenities.join(', ')}
                  onChange={e => setEditWs(w => w ? { ...w, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } : w)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditWs(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
