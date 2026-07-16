import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Briefcase, CalendarDays, Fingerprint, ArrowRight, CheckCircle2, CircleAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { webauthnService } from '../services/webauthnService';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function Dashboard() {
  const { user } = useAuth();

  const { data: bookings } = useQuery({ queryKey: ['bookings'], queryFn: bookingService.listMine });
  const { data: status } = useQuery({ queryKey: ['webauthn', 'status'], queryFn: webauthnService.status });

  const activeBookings = bookings?.filter((b) => b.status === 'Confirmed' || b.status === 'Pending') ?? [];
  const nextBooking = [...activeBookings].sort((a, b) => a.start_date.localeCompare(b.start_date))[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.first_name}</h1>
        <p className="text-zinc-500 mt-1">Here's what's happening with your workspace access.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-zinc-200 rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500 flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Active bookings
          </p>
          <p className="text-3xl font-bold mt-1">{activeBookings.length}</p>
        </div>
        <div className="border border-zinc-200 rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500 flex items-center gap-2">
            <Fingerprint className="w-4 h-4" /> Biometric
          </p>
          <p className="text-lg font-semibold mt-1 flex items-center gap-1.5">
            {status?.enrolled ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Enrolled
              </>
            ) : (
              <>
                <CircleAlert className="w-4 h-4 text-amber-500" /> Not enrolled
              </>
            )}
          </p>
        </div>
        <div className="border border-zinc-200 rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500 flex items-center gap-2">
            <Briefcase className="w-4 h-4" /> Next booking
          </p>
          <p className="text-lg font-semibold mt-1">
            {nextBooking ? `${nextBooking.workspace_name} · ${formatDate(nextBooking.start_date)}` : 'None yet'}
          </p>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/workspaces"
            className="group border border-zinc-200 rounded-xl bg-white p-5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex items-center justify-between"
          >
            <div>
              <p className="font-semibold">Book a workspace</p>
              <p className="text-sm text-zinc-500">Browse desks, cabins & rooms</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/biometric"
            className="group border border-zinc-200 rounded-xl bg-white p-5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex items-center justify-between"
          >
            <div>
              <p className="font-semibold">Check in / out</p>
              <p className="text-sm text-zinc-500">Verify with fingerprint or Face ID</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/bookings"
            className="group border border-zinc-200 rounded-xl bg-white p-5 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all flex items-center justify-between"
          >
            <div>
              <p className="font-semibold">My bookings</p>
              <p className="text-sm text-zinc-500">View & manage reservations</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
