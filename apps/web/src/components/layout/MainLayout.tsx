import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Navigation } from './Navigation';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
        <Outlet />
      </main>
    </div>
  );
}
