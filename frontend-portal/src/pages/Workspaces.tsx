import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Users, X, BriefcaseBusiness } from 'lucide-react';
import { toast } from 'sonner';
import { workspaceService, type Workspace } from '../services/workspaceService';
import { bookingService } from '../services/bookingService';
import { extractErrorMessage } from '../services/authService';

const STATUS_STYLE: Record<string, string> = {
  Available: 'bg-green-100 text-green-700',
  Occupied: 'bg-red-100 text-red-700',
  Reserved: 'bg-amber-100 text-amber-700',
  'Under Maintenance': 'bg-zinc-100 text-zinc-500',
};

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function Workspaces() {
  const queryClient = useQueryClient();
  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceService.list,
  });

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selected, setSelected] = useState<Workspace | null>(null);
  const [dates, setDates] = useState({ start: todayISO(), end: todayISO() });
  const [error, setError] = useState<string | null>(null);

  const types = useMemo(() => ['All', ...new Set((workspaces ?? []).map((w) => w.type))], [workspaces]);

  const filtered = (workspaces ?? []).filter((w) => {
    const matchesType = typeFilter === 'All' || w.type === typeFilter;
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      bookingService.create({
        workspace_id: selected!.id,
        start_date: dates.start,
        end_date: dates.end,
      }),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(`Booked "${booking.workspace_name}" — ₹${booking.amount.toFixed(2)} paid`);
      setSelected(null);
    },
    onError: (err) => setError(extractErrorMessage(err, 'Could not complete this booking')),
  });

  const days = Math.max(
    1,
    Math.round((new Date(dates.end).getTime() - new Date(dates.start).getTime()) / 86400000) + 1
  );
  const previewAmount = selected ? Math.round((selected.price_per_month / 30) * days * 100) / 100 : 0;

  const openBooking = (workspace: Workspace) => {
    setSelected(workspace);
    setError(null);
    setDates({ start: todayISO(), end: todayISO() });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workspaces</h1>
        <p className="text-zinc-500 mt-1">Browse and book a desk, cabin, or meeting room.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workspaces…"
            className="w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-zinc-200 rounded-xl bg-white p-5 h-40 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <BriefcaseBusiness className="w-10 h-10 mx-auto mb-3" />
          <p>No workspaces match your search.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ws) => (
          <div key={ws.id} className="border border-zinc-200 rounded-xl bg-white p-5 shadow-sm flex flex-col hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold">{ws.name}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[ws.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                {ws.status}
              </span>
            </div>
            <p className="text-sm text-zinc-500">{ws.type}</p>
            <p className="text-sm text-zinc-500 mb-4 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Capacity: {ws.capacity}
            </p>
            <div className="mt-auto flex items-center justify-between">
              <span className="font-semibold">₹{ws.price_per_month}/mo</span>
              <button
                onClick={() => openBooking(ws)}
                disabled={ws.status !== 'Available'}
                className="text-sm font-medium bg-zinc-900 text-white rounded-md px-3 py-1.5 hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-20">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-lg font-bold mb-1">Book {selected.name}</h2>
            <p className="text-sm text-zinc-500 mb-4">Payment is confirmed instantly on booking.</p>

            {error && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Start date</label>
                <input
                  type="date"
                  value={dates.start}
                  min={todayISO()}
                  onChange={(e) => setDates({ ...dates, start: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">End date</label>
                <input
                  type="date"
                  value={dates.end}
                  min={dates.start}
                  onChange={(e) => setDates({ ...dates, end: e.target.value })}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 mb-6">
              <span className="text-zinc-500">{days} day{days > 1 ? 's' : ''}</span>
              <span className="font-semibold">₹{previewAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelected(null)}
                className="text-sm font-medium text-zinc-600 px-4 py-2 rounded-md hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => bookMutation.mutate()}
                disabled={bookMutation.isPending}
                className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {bookMutation.isPending ? 'Processing payment…' : 'Confirm & pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
