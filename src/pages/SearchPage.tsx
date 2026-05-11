import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useStore } from '../store';
import type { UserSearchResult } from '../types';
import { Search as SearchIcon, User as UserIcon, Calendar } from 'lucide-react';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UserSearchResult | null>(null);
  const [error, setError] = useState('');
  const [inputValue, setInputValue] = useState(query);
  const selectedCamp = useStore(state => state.selectedCamp);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery || !selectedCamp) return;
    try {
      setLoading(true);
      setError('');
      setResult(null);
      const res = await api.searchUser(selectedCamp.id, searchQuery);
      if (res) {
        setResult(res);
      } else {
        setError('No user or appointment found with that information.');
      }
    } catch {
      setError('An error occurred during search.');
    } finally {
      setLoading(false);
    }
  }, [selectedCamp]);

  useEffect(() => {
    if (query) {
      void Promise.resolve().then(() => fetchResults(query));
    }
  }, [fetchResults, query]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold leading-tight text-n-900">Search Records</h1>
      </div>

      <div className="ds-card p-4 md:p-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-n-400">
              <SearchIcon size={18} />
            </div>
            <input 
              type="text"
              className="ds-input pl-10 text-base"
              placeholder="Search by Email, Phone, or ID"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full sm:w-auto sm:px-8">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-n-500 font-medium text-sm uppercase tracking-widest">Searching Records</p>
        </div>
      )}

      {error && !loading && (
        <div className="ds-card bg-n-50 border-dashed py-16 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-rose-lt text-rose rounded-full flex items-center justify-center mb-4">
            <SearchIcon size={24} />
          </div>
          <h3 className="text-lg font-bold text-n-900 mb-2">No Results Found</h3>
          <p className="text-n-600 max-w-md">{error}</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-[fadeUp_0.4s_ease_both]">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Details */}
            <div className="ds-card flex flex-col">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-n-100">
                <div className="w-10 h-10 rounded-full bg-n-100 flex items-center justify-center text-n-600">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-n-900 text-lg leading-tight">{result.user.full_name}</h3>
                  <p className="text-xs font-mono text-n-500 mt-1">{result.user.employee_id} • {result.user.company}</p>
                </div>
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-n-500 uppercase tracking-wider block mb-1">Gender / DOB</span>
                    <span className="text-sm text-n-900">{result.user.gender}, {result.user.dob}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-n-500 uppercase tracking-wider block mb-1">Mobile</span>
                    <span className="text-sm font-mono text-n-900">{result.user.mobile_number}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-n-500 uppercase tracking-wider block mb-1">Email</span>
                  <span className="text-sm text-n-900">{result.user.email}</span>
                </div>
              </div>
            </div>

            {/* Appointment / Actions */}
            <div className="ds-card flex flex-col bg-brand-lt/30 border-brand-m">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-m">
                <div className="w-10 h-10 rounded bg-brand-m flex items-center justify-center text-brand">
                  <Calendar size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-n-900 text-lg leading-tight">Appointment Status</h3>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
                {result.appointment ? (
                  <>
                    <div className="badge badge-ok mb-4 px-4 py-1.5 text-sm">Booking Exists</div>
                    <p className="text-sm text-n-600 mb-6">Appointment <span className="font-mono font-medium text-n-900">{result.appointment.id}</span> is active.</p>
                    <div className="w-full space-y-3">
                      <button onClick={() => navigate(`/component-entry/${result.user.id}`)} className="btn btn-primary btn-lg w-full">
                        Capture Camp Data
                      </button>
                      <button onClick={() => navigate(`/appointment/${result.appointment!.id}`)} className="btn btn-secondary btn-lg w-full">
                        View Details
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="badge badge-neutral mb-4 px-4 py-1.5 text-sm">No Booking Yet</div>
                    <p className="text-sm text-n-600 mb-6">You can capture data now and create the booking later, or create the booking first.</p>
                    <div className="w-full space-y-3">
                      <button onClick={() => navigate(`/component-entry/${result.user.id}`)} className="btn btn-primary btn-lg w-full">
                        Capture Data Now
                      </button>
                      <button onClick={() => navigate(`/booking-review/${result.user.id}`)} className="btn btn-secondary btn-lg w-full">
                        Create Booking First
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
