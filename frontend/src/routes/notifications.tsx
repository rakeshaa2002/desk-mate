import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Smartphone, MessageSquare, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/notifications')({
  component: () => <DashboardLayout><NotificationsPage /></DashboardLayout>,
});

const INITIAL_CHANNELS = [
  { id: 'email', label: 'Email', icon: Mail, enabled: true },
  { id: 'sms', label: 'SMS', icon: Smartphone, enabled: true },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, enabled: false },
  { id: 'push', label: 'Push', icon: Bell, enabled: true },
];

const INITIAL_TRIGGERS = [
  { id: 'membership_expiry', label: 'Membership expiry', enabled: true },
  { id: 'renewal_reminder', label: 'Renewal reminder', enabled: true },
  { id: 'successful_payment', label: 'Successful payment', enabled: true },
  { id: 'payment_failure', label: 'Payment failure', enabled: true },
  { id: 'biometric_failure', label: 'Biometric failure', enabled: true },
  { id: 'access_granted', label: 'Access granted', enabled: true },
  { id: 'access_denied', label: 'Access denied', enabled: true },
];

function NotificationsPage() {
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [triggers, setTriggers] = useState(INITIAL_TRIGGERS);

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const toggleTrigger = (id: string) => {
    setTriggers(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground mt-1">Configure channels and event triggers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Channels */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-5 font-semibold border-b">Channels</div>
            <div className="p-2 space-y-1">
              {channels.map(channel => (
                <div key={channel.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                      <channel.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{channel.label}</span>
                  </div>
                  <Switch checked={channel.enabled} onCheckedChange={() => toggleChannel(channel.id)} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Event Triggers */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-5 font-semibold border-b">Event triggers</div>
            <div className="p-2 space-y-1">
              {triggers.map(trigger => (
                <div key={trigger.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="text-sm">{trigger.label}</span>
                  <Switch checked={trigger.enabled} onCheckedChange={() => toggleTrigger(trigger.id)} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
