import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Fingerprint, ScanFace, CheckCircle2, ShieldAlert, History } from 'lucide-react';
import { webauthnService, type BiometricMethod } from '../services/webauthnService';
import { extractErrorMessage } from '../services/authService';

export function Biometric() {
  const queryClient = useQueryClient();
  const supported = webauthnService.supported();

  const { data: status } = useQuery({
    queryKey: ['webauthn', 'status'],
    queryFn: webauthnService.status,
    enabled: supported,
  });

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', 'mine'],
    queryFn: webauthnService.listMyAttendance,
    enabled: supported,
  });

  const enrollMutation = useMutation({
    mutationFn: (method: BiometricMethod) => webauthnService.enroll(method),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webauthn', 'status'] });
      toast.success(`${data.method} enrolled on this device`);
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Enrollment failed or was cancelled')),
  });

  const checkInMutation = useMutation({
    mutationFn: () => webauthnService.checkInOrOut(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'mine'] });
      const label = data.action === 'check-in' ? 'Checked in' : 'Checked out';
      toast.success(`${label} at ${new Date(data.time).toLocaleTimeString()}`);
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Verification failed or was cancelled')),
  });

  if (!supported) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Biometric Check-In</h1>
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-3 flex gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          Your browser doesn't support WebAuthn (fingerprint/Face ID) biometrics. Open this page on a modern
          mobile browser (Chrome, Safari) to enroll.
        </div>
      </div>
    );
  }

  const isEnrolled = (method: BiometricMethod) => status?.methods?.includes(method) ?? false;

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Biometric Check-In</h1>
        <p className="text-zinc-500 mt-1">
          Enroll your phone's fingerprint or Face ID once, then use it to check in/out at the workspace.
        </p>
      </div>

      <div className="border border-zinc-200 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold mb-3">1. Enroll a biometric method</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => enrollMutation.mutate('Fingerprint')}
            disabled={enrollMutation.isPending}
            className="border border-zinc-300 rounded-md py-3 text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
          >
            <Fingerprint className={`w-6 h-6 ${isEnrolled('Fingerprint') ? 'text-green-600' : 'text-zinc-500'}`} />
            {isEnrolled('Fingerprint') ? (
              <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled — re-enroll
              </span>
            ) : (
              'Enroll Fingerprint'
            )}
          </button>
          <button
            onClick={() => enrollMutation.mutate('Face')}
            disabled={enrollMutation.isPending}
            className="border border-zinc-300 rounded-md py-3 text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
          >
            <ScanFace className={`w-6 h-6 ${isEnrolled('Face') ? 'text-green-600' : 'text-zinc-500'}`} />
            {isEnrolled('Face') ? (
              <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled — re-enroll
              </span>
            ) : (
              'Enroll Face ID'
            )}
          </button>
        </div>
        <p className="text-xs text-zinc-400 mt-3">
          This triggers your device's native biometric prompt. Your fingerprint/face data never leaves your phone —
          only a cryptographic confirmation is sent to DeskMate.
        </p>
      </div>

      <div className="border border-zinc-200 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold mb-3">2. Check in / check out</h2>
        <button
          onClick={() => checkInMutation.mutate()}
          disabled={checkInMutation.isPending || !status?.enrolled}
          className="w-full bg-zinc-900 text-white rounded-md py-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {checkInMutation.isPending ? 'Verifying…' : 'Verify & Check In / Out'}
        </button>
        {!status?.enrolled && (
          <p className="text-xs text-amber-600 mt-2">Enroll a biometric method above first.</p>
        )}
        <p className="text-xs text-zinc-400 mt-3">
          Tap this while you're at the workspace. We automatically detect whether it's a check-in or check-out
          based on your open attendance record for today.
        </p>
      </div>

      <div className="border border-zinc-200 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <History className="w-4 h-4" /> Recent attendance
        </h2>
        {isLoading && <p className="text-sm text-zinc-500">Loading…</p>}
        {!isLoading && attendance?.length === 0 && (
          <p className="text-sm text-zinc-500">No attendance recorded yet.</p>
        )}
        <div className="space-y-2">
          {attendance?.map((a) => (
            <div key={a.id} className="flex items-center justify-between text-sm py-2 border-b border-zinc-100 last:border-0">
              <span className="text-zinc-500">{a.date}</span>
              <span>
                {new Date(a.check_in).toLocaleTimeString()} →{' '}
                {a.check_out ? new Date(a.check_out).toLocaleTimeString() : '—'}
              </span>
              <span className="text-xs font-medium text-zinc-500">{a.flag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
