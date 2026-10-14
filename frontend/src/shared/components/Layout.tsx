import { Outlet, useLocation } from 'react-router-dom';
import { HomeFooter } from '@/pages/home/HomeFooter';
import { Header } from './Header';
import { HelpWidget } from './HelpWidget';

export function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-svh flex-col">
      <Header transparent={isHome} />
      <main className="flex-1">
        <Outlet />
      </main>
      <HomeFooter />
      <HelpWidget />
    </div>
  );
}
