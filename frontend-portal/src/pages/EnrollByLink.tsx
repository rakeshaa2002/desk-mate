import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Fingerprint, ScanFace, CheckCircle2, ShieldAlert, Building2 } from 'lucide-react';
import { enrollLinkService } from '../services/enrollLinkService';
import { webauthnService, type BiometricMethod } from '../services/webauthnService';
import { extractErrorMessage } from '../services/authService';

export function EnrollByLink() {
  const { token = '' } = useParams();
  const supported = webauthnService.supported();
  const [done, setDone] = useState<string | null>(null);

  const { data: info, isLoading, isError, error } = useQuery({
    queryKey: ['enroll-link', token],
    queryFn: () => enrollLinkService.getInfo(token),
    retry: false,
  });

  const enrollMutation = useMutation({
    mutationFn: (method: BiometricMethod) => enrollLinkService.enroll(token, method),
    onSuccess: (data) => setDone(`${data.member_name} is enrolled.`),
  });

  useEffect(() => {
    document.title = 'DeskMate — Biometric Enrollment';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-xl shadow-sm p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-zinc-900 text-white p-1.5 rounded-lg">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight">DeskMate</span>
        </div>

        {isLoading && <p className="text-zinc-500">Loading…</p>}

        {isError && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-4 py-3">
            {extractErrorMessage(error, 'This enrollment link is invalid or has expired.')}
          </div>
        )}

        {!isLoading && !isError && !supported && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-4 py-3 flex gap-2 text-left">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            This browser doesn't support fingerprint/Face ID enrollment. Open this link in a modern mobile
            browser (Chrome, Safari).
          </div>
        )}

        {!isLoading && !isError && supported && !done && info && (
          <>
            <h1 className="text-xl font-bold tracking-tight mb-1">Enroll biometric access</h1>
            <p className="text-sm text-zinc-500 mb-6">
              For <span className="font-medium text-zinc-900">{info.member_name}</span> ({info.member_email})
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => enrollMutation.mutate('Fingerprint')}
                disabled={enrollMutation.isPending}
                className="border border-zinc-300 rounded-md py-4 text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
              >
                <Fingerprint className="w-6 h-6 text-zinc-600" />
                Fingerprint
              </button>
              <button
                onClick={() => enrollMutation.mutate('Face')}
                disabled={enrollMutation.isPending}
                className="border border-zinc-300 rounded-md py-4 text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50 flex flex-col items-center gap-2"
              >
                <ScanFace className="w-6 h-6 text-zinc-600" />
                Face ID
              </button>
            </div>
            {enrollMutation.isError && (
              <p className="text-sm text-red-600 mt-4">
                {extractErrorMessage(enrollMutation.error, 'Enrollment failed or was cancelled')}
              </p>
            )}
            <p className="text-xs text-zinc-400 mt-6">
              This uses your device's native biometric sensor. Your fingerprint/face data never leaves this
              phone — only a cryptographic confirmation is sent to DeskMate.
            </p>
          </>
        )}

        {done && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="font-semibold">Enrollment complete</p>
            <p className="text-sm text-zinc-500">{done} You can close this page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
