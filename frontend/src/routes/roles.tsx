import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Shield, MoreHorizontal, Check } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { roleService, type RoleDto } from '@/services/roleService';

export const Route = createFileRoute('/roles')({
  component: () => <DashboardLayout><RolesPage /></DashboardLayout>,
});

const ALL_PERMISSIONS = [
  'All modules', 'Tenants', 'Workspaces', 'Members', 'Members read',
  'Billing', 'Payments', 'Invoices', 'Own invoices',
  'Reports', 'Visitors', 'Check-in', 'Attendance', 'Own attendance',
  'Biometric logs', 'Access alerts', 'Roles', 'Tickets', 'Own profile'
];

type Role = {
  id: string;
  name: string;
  permissions: string[];
};

function toRole(dto: RoleDto): Role {
  return { id: String(dto.id), name: dto.name, permissions: dto.permissions };
}

function RolesPage() {
  const queryClient = useQueryClient();
  const { data: roleDtos, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: roleService.list,
  });
  const roles = (roleDtos ?? []).map(toRole);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Form state
  const [roleName, setRoleName] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  const invalidateRoles = () => queryClient.invalidateQueries({ queryKey: ['roles'] });

  const createMutation = useMutation({
    mutationFn: roleService.create,
    onSuccess: () => { invalidateRoles(); toast.success('Role created'); },
    onError: () => toast.error('Failed to create role'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof roleService.update>[1] }) =>
      roleService.update(id, data),
    onSuccess: () => { invalidateRoles(); toast.success('Role updated'); },
    onError: () => toast.error('Failed to update role'),
  });

  const deleteMutation = useMutation({
    mutationFn: roleService.remove,
    onSuccess: () => { invalidateRoles(); toast.success('Role deleted'); },
    onError: () => toast.error('Failed to delete role'),
  });

  const handleOpenCreate = () => {
    setEditingRole(null);
    setRoleName('');
    setSelectedPerms(new Set());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setSelectedPerms(new Set(role.permissions));
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(Number(id));
  };

  const togglePermission = (perm: string) => {
    setSelectedPerms(prev => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  const handleSave = () => {
    if (!roleName.trim()) return;

    if (editingRole) {
      updateMutation.mutate({
        id: Number(editingRole.id),
        data: { name: roleName, permissions: Array.from(selectedPerms) },
      });
    } else {
      createMutation.mutate({ name: roleName, permissions: Array.from(selectedPerms) });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles &amp; permissions</h1>
          <p className="text-muted-foreground mt-1">RBAC — configure what each role can access.</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Create Role
        </Button>
      </div>

      {/* Grid */}
      {isLoading && <p className="text-sm text-muted-foreground">Loading roles…</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {roles.map((role, i) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group relative"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{role.name}</h3>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenEdit(role)} className="gap-2 cursor-pointer">
                      <Edit2 className="w-4 h-4" /> Edit Role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(role.id)} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4" /> Delete Role
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto">
                {role.permissions.map(perm => (
                  <span
                    key={perm}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 text-muted-foreground dark:bg-muted/40"
                  >
                    {perm}
                  </span>
                ))}
                {role.permissions.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No permissions assigned</span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Create / Edit Role Modal ── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole ? 'Modify permissions for this role.' : 'Define a new role and assign specific permissions.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name <span className="text-destructive">*</span></Label>
              <Input 
                id="name" 
                placeholder="e.g. Community Manager" 
                value={roleName} 
                onChange={e => setRoleName(e.target.value)} 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Permissions</Label>
                <span className="text-xs text-muted-foreground">{selectedPerms.size} selected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ALL_PERMISSIONS.map(perm => (
                  <label
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPerms.has(perm)
                        ? 'bg-primary/5 border-primary/20 dark:bg-primary/10 dark:border-primary/30'
                        : 'bg-muted/30 hover:bg-muted/60'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      selectedPerms.has(perm)
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-input bg-background'
                    }`}>
                      {selectedPerms.has(perm) && <Check className="w-3 h-3" />}
                    </div>
                    <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {perm}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!roleName.trim()}>
              {editingRole ? 'Save Changes' : 'Create Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
