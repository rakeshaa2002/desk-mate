import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppProvider } from '@/providers/AppProvider';

export const Route = createRootRoute({
  component: () => (
    <AppProvider>
      <Outlet />
    </AppProvider>
  ),
});
