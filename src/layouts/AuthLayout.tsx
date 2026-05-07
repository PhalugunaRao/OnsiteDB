import { Outlet, Navigate } from 'react-router-dom';
import { useStore } from '../store';

export default function AuthLayout() {
  const agent = useStore(state => state.agent);
  if (agent) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-n-50">
      <div className="max-w-md w-full">
        <Outlet />
      </div>
    </div>
  );
}
