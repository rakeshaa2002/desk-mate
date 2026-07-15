import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { settingsService, type OrgSettings } from '@/services/settingsService';

export const Route = createFileRoute('/settings')({
  component: () => <DashboardLayout><SettingsPage /></DashboardLayout>,
});

const EMPTY_FORM = { orgName: '', supportEmail: '', currency: 'INR', gstRate: '18' };

function toForm(settings: OrgSettings) {
  return {
    orgName: settings.org_name ?? '',
    supportEmail: settings.support_email ?? '',
    currency: settings.currency,
    gstRate: String(Math.round(settings.gst_rate * 100)),
  };
}

function SettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['org-settings'],
    queryFn: settingsService.get,
  });

  useEffect(() => {
    if (settings) setForm(toForm(settings));
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () =>
      settingsService.update({
        org_name: form.orgName,
        support_email: form.supportEmail,
        currency: form.currency,
        gst_rate: Number(form.gstRate) / 100,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['org-settings'], updated);
      toast.success('Settings saved');
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const handleReset = () => {
    if (settings) setForm(toForm(settings));
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const isSaving = saveMutation.isPending;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Workspace-wide configuration.</p>
      </div>

      {/* Settings Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy={isLoading}>
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization name</Label>
            <Input
              id="orgName"
              value={form.orgName}
              onChange={(e) => setForm({ ...form, orgName: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={form.supportEmail}
              onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default currency</Label>
            <Select
              value={form.currency}
              onValueChange={(v) => setForm({ ...form, currency: v })}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstRate">GST rate (%)</Label>
            <Input
              id="gstRate"
              type="number"
              value={form.gstRate}
              onChange={(e) => setForm({ ...form, gstRate: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline" onClick={handleReset} disabled={isSaving || isLoading}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading} className="min-w-[120px]">
            {isSaving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
