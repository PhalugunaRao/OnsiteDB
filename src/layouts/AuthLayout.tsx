import { Outlet, Navigate } from 'react-router-dom';
import { useStore } from '../store';

export default function AuthLayout() {
  const agent = useStore(state => state.agent);
  if (agent) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-n-50 px-0 py-6 sm:px-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
