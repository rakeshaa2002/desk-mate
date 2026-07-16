import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { KeyRound, User as UserIcon } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { profileService, type MemberOut } from '@/services/profileService';

export const Route = createFileRoute('/profile')({
  component: () => <DashboardLayout><ProfilePage /></DashboardLayout>,
});

const EMPTY_FORM = { firstName: '', lastName: '', email: '', phone: '', avatar: '' };

function toForm(member: MemberOut) {
  return {
    firstName: member.first_name,
    lastName: member.last_name,
    email: member.email,
    phone: member.phone ?? '',
    avatar: member.avatar ?? '',
  };
}

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: member, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.get,
  });

  const [form, setForm] = useState(EMPTY_FORM);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    if (member) setForm(toForm(member));
  }, [member]);

  const saveProfileMutation = useMutation({
    mutationFn: () =>
      profileService.update({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        avatar: form.avatar,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['profile'], updated);
      toast.success('Profile updated');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Failed to update profile'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      profileService.update({
        current_password: passwords.current,
        new_password: passwords.next,
      }),
    onSuccess: () => {
      toast.success('Password changed');
      setPasswords({ current: '', next: '', confirm: '' });
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Failed to change password'),
  });

  const handleSaveProfile = () => saveProfileMutation.mutate();

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.next) return;
    if (passwords.next !== passwords.confirm) {
      toast.error('New password and confirmation do not match');
      return;
    }
    changePasswordMutation.mutate();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your personal account details.</p>
      </div>

      {/* Profile Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <UserIcon className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Account details</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16 border border-border">
            <AvatarImage src={form.avatar} alt={form.firstName} />
            <AvatarFallback>{form.firstName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              placeholder="https://..."
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveProfile} disabled={saveProfileMutation.isPending || isLoading} className="min-w-[120px]">
            {saveProfileMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </motion.div>

      <Separator />

      {/* Change Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-6">
          <KeyRound className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold">Change password</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              value={passwords.next}
              onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleChangePassword}
            disabled={changePasswordMutation.isPending || !passwords.current || !passwords.next}
            className="min-w-[160px]"
          >
            {changePasswordMutation.isPending ? 'Updating...' : 'Update password'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
