import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-zinc-50">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">
            <Sidebar onNavigate={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 border-b border-zinc-200 bg-white flex items-center px-4 md:hidden sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="text-zinc-600 hover:text-zinc-900">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold ml-3">DeskMate</span>
        </header>
        <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
