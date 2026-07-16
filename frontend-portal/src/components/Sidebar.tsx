import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, CalendarDays, Fingerprint, Building2, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/workspaces', label: 'Workspaces', icon: Briefcase },
  { to: '/bookings', label: 'My Bookings', icon: CalendarDays },
  { to: '/biometric', label: 'Biometric', icon: Fingerprint },
];

interface SidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
}

export function Sidebar({ onNavigate, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-full bg-white border-r border-zinc-200 flex flex-col shrink-0">
      <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-zinc-900 text-white p-1.5 rounded-lg">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight">DeskMate</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-zinc-400 hover:text-zinc-700">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-200 shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-zinc-900 text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {user?.first_name?.charAt(0) ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user ? `${user.first_name} ${user.last_name}` : ''}</p>
            <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
          </div>
          <button onClick={logout} className="p-1.5 text-zinc-400 hover:text-red-600 rounded-md transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
