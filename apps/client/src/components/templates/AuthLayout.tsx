import { Outlet } from 'react-router-dom';

export function AuthLayout(): JSX.Element {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white font-bold text-lg">
            EP
          </div>
          <h1 className="text-2xl font-bold text-secondary-900">EventPulse</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Discover and manage events seamlessly.
          </p>
        </div>
        <div className="rounded-2xl border border-secondary-200 bg-white p-8 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
