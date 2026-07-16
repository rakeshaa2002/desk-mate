import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  CreditCard, 
  Fingerprint,
  CalendarDays, 
  Settings, 
  Bell, 
  FileBarChart,
  LogOut,
  Building,
  UserCheck,
  ShieldCheck,
  ScrollText,
  ChevronDown
} from 'lucide-react';
import { authService } from '@/services/authService';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Building2, label: 'Tenants', path: '/tenants' },
  { icon: Users, label: 'Members', path: '/members' },
  { icon: Briefcase, label: 'Workspaces', path: '/workspaces' },
  { icon: CalendarDays, label: 'Subscriptions', path: '/subscriptions' },
  { icon: Fingerprint, label: 'Biometric Access', path: '/biometric' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: UserCheck, label: 'Visitors', path: '/visitors' },
  { icon: CalendarDays, label: 'Attendance', path: '/attendance' },
  { icon: FileBarChart, label: 'Reports', path: '/reports' },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const isSettingsActive = ['/settings', '/staff', '/roles', '/profile'].includes(location.pathname);
  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsActive);

  useEffect(() => {
    if (isSettingsActive) setIsSettingsOpen(true);
  }, [location.pathname, isSettingsActive]);

  const handleLogout = () => {
    authService.logout();
    navigate({ to: '/' });
  };

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 border-r border-border bg-sidebar flex flex-col hidden md:flex h-full shadow-sm"
    >
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <div className="bg-primary/20 p-2 rounded-lg mr-3">
          <Building className="w-5 h-5 text-primary" />
        </div>
        <span className="text-xl font-bold tracking-tight text-sidebar-foreground">DeskMate</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Workspace</p>

        {mainNavItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link key={item.label} to={item.path as any} className="block outline-none mb-1">
              <div className={`relative flex items-center px-3 py-2.5 rounded-md transition-colors group cursor-pointer ${isActive ? 'text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-md"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-4 h-4 mr-3 z-10 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`} />
                <span className="text-sm font-medium z-10">{item.label}</span>
              </div>
            </Link>
          );
        })}

        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-2 px-3">System</p>

        {/* Normal System Items */}
        <Link to="/notifications" className="block outline-none mb-1">
          <div className={`relative flex items-center px-3 py-2.5 rounded-md transition-colors group cursor-pointer ${location.pathname === '/notifications' ? 'text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}>
            {location.pathname === '/notifications' && (
              <motion.div layoutId="sidebar-active-sys" className="absolute inset-0 bg-primary/10 rounded-md" initial={false} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
            )}
            <Bell className={`w-4 h-4 mr-3 z-10 shrink-0 ${location.pathname === '/notifications' ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`} />
            <span className="text-sm font-medium z-10">Notifications</span>
          </div>
        </Link>
        <Link to="/audit-logs" className="block outline-none mb-1">
          <div className={`relative flex items-center px-3 py-2.5 rounded-md transition-colors group cursor-pointer ${location.pathname === '/audit-logs' ? 'text-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}>
            {location.pathname === '/audit-logs' && (
              <motion.div layoutId="sidebar-active-sys" className="absolute inset-0 bg-primary/10 rounded-md" initial={false} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
            )}
            <ScrollText className={`w-4 h-4 mr-3 z-10 shrink-0 ${location.pathname === '/audit-logs' ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`} />
            <span className="text-sm font-medium z-10">Audit Logs</span>
          </div>
        </Link>

        {/* Settings Dropdown */}
        <div className="mb-1">
          <div 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`relative flex items-center px-3 py-2.5 rounded-md transition-colors group cursor-pointer ${isSettingsActive && !isSettingsOpen ? 'text-primary bg-primary/5' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}
          >
            <Settings className={`w-4 h-4 mr-3 z-10 shrink-0 ${isSettingsActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`} />
            <span className="text-sm font-medium z-10 flex-1">Settings</span>
            <ChevronDown className={`w-4 h-4 z-10 shrink-0 text-muted-foreground transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pl-11 pr-3 py-2 space-y-1 relative before:absolute before:left-[1.35rem] before:top-0 before:bottom-2 before:w-[1px] before:bg-border">
                  {[
                    { label: 'General', path: '/settings' },
                    { label: 'Profile', path: '/profile' },
                    { label: 'Staff Directory', path: '/staff' },
                    { label: 'Roles & Permissions', path: '/roles' }
                  ].map((subItem) => {
                    const isSubActive = location.pathname === subItem.path;
                    return (
                      <Link key={subItem.path} to={subItem.path as any} className="block outline-none relative">
                        <div className={`absolute -left-[2.1rem] top-1/2 -translate-y-1/2 w-4 h-[1px] bg-border ${isSubActive ? 'bg-primary' : ''}`} />
                        <div className={`px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                          isSubActive 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        }`}>
                          {subItem.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      <div className="p-4 border-t border-border mt-auto shrink-0">
        <div className="flex items-center gap-3 p-3 bg-sidebar-accent rounded-lg">
          <img src={user?.avatar || "https://i.pravatar.cc/150"} alt="User" className="w-10 h-10 rounded-full bg-background border" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || "Admin User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role || "Super Admin"}</p>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
};
