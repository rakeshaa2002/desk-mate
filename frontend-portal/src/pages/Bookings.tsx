import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CalendarX2, Building2 } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { extractErrorMessage } from '../services/authService';

const STATUS_STYLE: Record<string, string> = {
  Confirmed: 'bg-green-100 text-green-700',
  Pending: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-zinc-100 text-zinc-500',
  Completed: 'bg-blue-100 text-blue-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function Bookings() {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingService.listMine,
  });

  const cancelMutation = useMutation({
    mutationFn: bookingService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled');
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Could not cancel this booking')),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Bookings</h1>
        <p className="text-zinc-500 mt-1">Your workspace reservations and payment status.</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="border border-zinc-200 rounded-xl bg-white p-4 h-16 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && bookings?.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <CalendarX2 className="w-10 h-10 mx-auto mb-3" />
          <p>You haven't booked a workspace yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {bookings?.map((b) => (
          <div
            key={b.id}
            className="border border-zinc-200 rounded-xl bg-white p-4 shadow-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{b.workspace_name}</p>
                <p className="text-sm text-zinc-500">
                  {formatDate(b.start_date)} → {formatDate(b.end_date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="font-semibold">₹{b.amount.toFixed(2)}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[b.status] ?? ''}`}>
                {b.status}
              </span>
              {(b.status === 'Confirmed' || b.status === 'Pending') && (
                <button
                  onClick={() => cancelMutation.mutate(b.id)}
                  disabled={cancelMutation.isPending}
                  className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
