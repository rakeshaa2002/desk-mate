import { createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export const Route = createFileRoute('/audit-logs')({
  component: () => <DashboardLayout><AuditLogsPage /></DashboardLayout>,
});

const LOGS = [
  { id: 1, timestamp: '2026-07-15 09:44', actor: 'admin@deskmate.io', action: 'Renewed subscription', target: 'DM-1026' },
  { id: 2, timestamp: '2026-07-15 09:30', actor: 'reception@deskmate.io', action: 'Approved visitor', target: 'Rahul Iyer' },
  { id: 3, timestamp: '2026-07-15 08:55', actor: 'system', action: 'Marked expired', target: 'DM-1029' },
  { id: 4, timestamp: '2026-07-14 18:12', actor: 'accounts@deskmate.io', action: 'Generated invoice', target: 'INV-2044' },
];

function AuditLogsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit logs</h1>
        <p className="text-muted-foreground mt-1">Immutable trail of platform actions.</p>
      </div>

      {/* Table Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border bg-card shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left font-semibold text-foreground px-6 py-4">Timestamp</th>
                <th className="text-left font-semibold text-foreground px-6 py-4">Actor</th>
                <th className="text-left font-semibold text-foreground px-6 py-4">Action</th>
                <th className="text-left font-semibold text-foreground px-6 py-4">Target</th>
              </tr>
            </thead>
            <tbody>
              {LOGS.map((log, i) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-medium">{log.timestamp}</td>
                  <td className="px-6 py-4 text-muted-foreground">{log.actor}</td>
                  <td className="px-6 py-4 font-medium">{log.action}</td>
                  <td className="px-6 py-4 text-muted-foreground">{log.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
