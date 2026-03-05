import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/organisms/Navbar.js';

export function MainLayout(): JSX.Element {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
