import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { LogOut, Activity, ArrowLeft, MapPinned } from 'lucide-react';

export default function AppLayout() {
  const { agent, selectedCamp, logout } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const getBackTarget = () => {
    const from = location.state?.from;
    const pathname = location.pathname;

    if (pathname === '/') return '/select-camp';
    if (pathname === '/select-camp') return selectedCamp ? '/' : '/login';
    if (pathname.startsWith('/appointment/')) return typeof from === 'string' ? from : '/';
    if (pathname.startsWith('/component-entry/')) return typeof from === 'string' ? from : '/';
    if (pathname.startsWith('/booking-review/')) return typeof from === 'string' ? from : '/';
    if (pathname === '/search' || pathname === '/failures') return '/';
    return typeof from === 'string' ? from : '/';
  };

  const showBackButton = location.pathname !== '/login';

  const handleBack = () => {
    navigate(getBackTarget());
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col bg-n-50">
      <header className="sticky top-0 z-50 flex h-[52px] items-center border-b border-n-200 bg-n-50/95 px-4 backdrop-blur md:px-6">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button 
              onClick={handleBack}
              className="btn btn-icon btn-secondary btn-sm mr-1"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-lt text-brand">
            <Activity size={16} />
          </div>
          <Link to="/" className="hidden font-semibold text-n-900 transition-colors hover:text-brand sm:inline">
            Onsite Healthcare
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {selectedCamp && (
            <>
              <div className="hidden sm:block">
                <span className="inline-flex items-center gap-2 rounded-full border border-n-200 bg-white px-3 py-1.5 text-sm font-medium text-n-900">
                  <MapPinned size={14} className="text-brand" />
                  {selectedCamp.name}
                </span>
              </div>
              <div className="hidden h-5 w-px bg-n-200 sm:block"></div>
            </>
          )}
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-semibold tracking-wider text-n-500 uppercase">{agent?.role}</span>
              <span className="text-sm font-medium text-n-900 leading-tight">{agent?.name}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-icon btn-tertiary btn-sm" title="Logout" aria-label="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
