import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { LogOut, Activity } from 'lucide-react';

export default function AppLayout() {
  const { agent, selectedCamp, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const showBackButton = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/camp-selection';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-n-50">
      <header className="sticky top-0 z-50 bg-n-0 border-b border-n-200 shadow-sm h-[60px] flex items-center px-6">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)} 
              className="mr-2 p-2 text-n-600 hover:text-brand bg-n-50 hover:bg-brand-lt rounded-md transition-colors md:hidden"
              aria-label="Go back"
            >
              ←
            </button>
          )}
          <div className="w-8 h-8 rounded bg-brand-lt text-brand flex items-center justify-center">
            <Activity size={18} />
          </div>
          <span className="font-semibold text-n-900 hidden sm:inline">Onsite Dashboard</span>
        </div>

        {selectedCamp && (
          <div className="ml-10 hidden md:flex items-center gap-6 text-sm">
            <Link to="/" className="text-n-600 hover:text-brand font-medium">Dashboard</Link>
            <Link to="/failures" className="text-n-600 hover:text-brand font-medium">Retry Queue</Link>
          </div>
        )}

        <div className="ml-auto flex items-center gap-6">
          {selectedCamp && (
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold tracking-wider uppercase text-brand">Active Camp</span>
              <span className="text-sm font-medium text-n-900">{selectedCamp.name}</span>
            </div>
          )}
          
          <div className="h-8 w-px bg-n-200 hidden md:block"></div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs text-n-500">{agent?.role}</span>
              <span className="text-sm font-medium text-n-800">{agent?.name}</span>
            </div>
            <button onClick={handleLogout} className="text-n-500 hover:text-n-900 transition-colors p-2">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
