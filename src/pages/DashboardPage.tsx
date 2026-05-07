import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Search, Users, AlertCircle, FilePlus, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../api/mock';
import { format } from 'date-fns';

export default function DashboardPage() {
  const selectedCamp = useStore(state => state.selectedCamp);
  const bookingFailures = useStore(state => state.bookingFailures);
  const draftEntries = useStore(state => state.draftEntries);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const results = await api.searchAppointments(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (!selectedCamp) return null;

  return (
    <div className="space-y-8">
      {/* Active Camp Context */}
      <div className="ds-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-brand-lt border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="flex items-center gap-4 relative z-10">
          <img src={selectedCamp.provider_logo} alt="Provider" className="w-14 h-14 rounded-lg bg-white border border-brand-m p-1" />
          <div>
            <div className="kicker mb-1 text-brand">Live Camp</div>
            <h1 className="text-2xl font-serif font-bold text-n-900">{selectedCamp.name}</h1>
            <p className="text-sm text-n-600 mt-1">{selectedCamp.provider_name} • {selectedCamp.location}</p>
          </div>
        </div>
        <div className="relative z-10">
          <span className="badge badge-ok bg-white shadow-sm border border-green-m px-3 py-1.5"><span className="w-2 h-2 rounded-full bg-green mr-1 inline-block animate-pulse"></span> Active Now</span>
        </div>
      </div>

      {/* Primary Search Action */}
      <div className="max-w-2xl mx-auto py-8">
        <h2 className="text-center text-xl font-semibold text-n-900 mb-6">Search User or Appointment</h2>
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-n-400 group-focus-within:text-brand transition-colors">
            <Search size={20} />
          </div>
          <input 
            type="text"
            className="w-full pl-11 pr-4 py-4 rounded-xl border border-n-200 shadow-sm focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-m transition-all text-n-900 text-lg placeholder:text-n-400"
            placeholder="Enter Email, Phone Number, or Appointment ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-n-500 uppercase tracking-wider mb-4">Search Results</h3>
          {isSearching ? (
             <div className="py-10 text-center">
               <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
               <p className="text-n-500 text-sm">Searching...</p>
             </div>
          ) : searchResults.length > 0 ? (
            <div className="bg-white rounded-lg border border-n-200 overflow-hidden shadow-sm overflow-x-auto">
              <table className="ds-table w-full">
                <thead>
                  <tr>
                    <th>Patient Details</th>
                    <th>Appointment ID</th>
                    <th>Package</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map(apt => (
                    <tr key={apt.id} className="cursor-pointer hover:bg-n-50 transition-colors" onClick={() => navigate(`/appointment/${apt.id}`)}>
                      <td>
                        <div className="font-semibold text-n-900">{apt.user?.full_name}</div>
                        <div className="text-xs font-mono text-n-500">{apt.user?.mobile_number}</div>
                      </td>
                      <td className="font-mono text-n-900">{apt.id}</td>
                      <td className="text-n-700">{apt.package?.name}</td>
                      <td className="text-n-700 font-mono text-sm">{format(new Date(apt.created_at), 'MMM d, yyyy')}</td>
                      <td>
                        <span className={`badge ${apt.booking_status === 'success' ? 'badge-ok' : 'badge-warn'}`}>
                          {apt.booking_status}
                        </span>
                      </td>
                      <td className="text-right">
                        <ArrowRight size={16} className="text-n-400 inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="ds-card py-10 text-center bg-n-50 border-dashed">
              <p className="text-n-600">No appointments found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats Grid */}
      <div>
        <div className="kicker mb-4 text-n-500">Today's Overview</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="ds-card py-5 px-5 flex flex-col hover:border-brand-m transition-colors">
            <div className="flex items-center justify-between mb-3 text-n-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Searches</span>
              <Users size={16} />
            </div>
            <div className="text-3xl font-mono font-bold text-n-900">124</div>
          </div>
          
          <div className="ds-card py-5 px-5 flex flex-col hover:border-green-m transition-colors">
            <div className="flex items-center justify-between mb-3 text-n-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Bookings</span>
              <Calendar size={16} />
            </div>
            <div className="text-3xl font-mono font-bold text-green">89</div>
          </div>

          <div className="ds-card py-5 px-5 flex flex-col cursor-pointer hover:border-brand transition-colors" onClick={() => navigate('/search')}>
            <div className="flex items-center justify-between mb-3 text-n-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
              <FilePlus size={16} />
            </div>
            <div className="text-3xl font-mono font-bold text-n-900">{Object.keys(draftEntries).length}</div>
            <div className="text-xs text-brand font-medium mt-2">View Pending →</div>
          </div>

          <div className={`ds-card py-5 px-5 flex flex-col cursor-pointer transition-colors ${bookingFailures.length > 0 ? 'bordered-rose hover:bg-rose-lt/30' : 'hover:border-n-300'}`} onClick={() => navigate('/failures')}>
            <div className="flex items-center justify-between mb-3 text-n-500">
              <span className="text-xs font-semibold uppercase tracking-wider">Failures</span>
              <AlertCircle size={16} className={bookingFailures.length > 0 ? 'text-rose' : ''} />
            </div>
            <div className={`text-3xl font-mono font-bold ${bookingFailures.length > 0 ? 'text-rose' : 'text-n-900'}`}>{bookingFailures.length}</div>
            {bookingFailures.length > 0 && <div className="text-xs text-rose font-medium mt-2">Requires Action →</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
