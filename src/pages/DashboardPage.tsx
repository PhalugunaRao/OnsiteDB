import { useState, useEffect } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useStore } from '../store';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowRight, CalendarDays, Phone, BadgeCheck, ClipboardList } from 'lucide-react';
import { api } from '../api/mock';
import { format } from 'date-fns';
import type { Appointment, Package, User } from '../types';

type AppointmentResult = Appointment & {
  user?: User;
  package?: Package;
};

const searchPlaceholder = 'Search by Employee ID, Appointment ID, Mobile Number or Email';

function Highlight({ value, query }: { value?: string; query: string }) {
  if (!value) return <span>-</span>;
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return <span>{value}</span>;

  const lowerValue = value.toLowerCase();
  const lowerQuery = trimmedQuery.toLowerCase();
  const parts: ReactNode[] = [];
  let cursor = 0;
  let matchIndex = lowerValue.indexOf(lowerQuery, cursor);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      parts.push(value.slice(cursor, matchIndex));
    }

    const end = matchIndex + trimmedQuery.length;
    parts.push(
      <mark key={`${matchIndex}-${end}`} className="rounded-sm bg-amber-lt px-0.5 text-n-900">
        {value.slice(matchIndex, end)}
      </mark>
    );

    cursor = end;
    matchIndex = lowerValue.indexOf(lowerQuery, cursor);
  }

  if (cursor < value.length) {
    parts.push(value.slice(cursor));
  }

  return <span>{parts}</span>;
}

function SearchSkeletonRows() {
  return (
    <div className="overflow-hidden rounded-lg border border-n-200 bg-white">
      {[0, 1, 2, 3].map(row => (
        <div key={row} className="grid animate-pulse grid-cols-1 gap-3 border-b border-n-100 p-4 last:border-b-0 md:grid-cols-[1.2fr_0.8fr_1fr_1fr_1.2fr_0.8fr_0.8fr_90px] md:items-center md:gap-4 md:px-5 md:py-3">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(cell => (
            <div key={cell} className={`h-3 rounded-full bg-n-100 ${cell === 0 || cell === 4 ? 'w-4/5' : 'w-2/3'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const selectedCamp = useStore(state => state.selectedCamp);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<AppointmentResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let ignore = false;

    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const results = await api.searchAppointments(searchQuery);
        if (!ignore) {
          setSearchResults(results);
        }
      } catch (err) {
        console.error("Search failed:", err);
        if (!ignore) {
          setSearchResults([]);
        }
      } finally {
        if (!ignore) {
          setIsSearching(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchResults, 300);
    return () => {
      ignore = true;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
  };

  const handleSearchChange = (value: string) => {
    const next = value.trimStart();
    if (next) {
      setSearchParams({ q: next }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const openAppointment = (appointmentId: string) => {
    navigate(`/appointment/${appointmentId}`, {
      state: { from: `${location.pathname}${location.search}` }
    });
  };

  const resultCount = searchResults.length;

  if (!selectedCamp) return null;

  return (
    <div className="space-y-5">
      {/* Active Camp Context */}
      <div className="flex flex-col gap-4 rounded-lg border border-brand-m bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between md:px-5">
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
      <div className="sticky top-14 z-20 -mx-4 border-b border-n-200 bg-n-50/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-lg md:border md:bg-white md:px-5 md:shadow-sm">
        <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-n-900">Search Appointments</h2>
            <p className="text-xs text-n-500">Results update as you type.</p>
          </div>
          {searchQuery.trim() && !isSearching && (
            <span className="text-xs font-medium text-n-500">{resultCount} result{resultCount === 1 ? '' : 's'}</span>
          )}
        </div>
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-n-400 group-focus-within:text-brand transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text"
            className="w-full rounded-lg border border-n-200 bg-white py-3 pl-11 pr-4 text-sm text-n-900 shadow-sm transition-all placeholder:text-n-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand-m md:text-[15px]"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </form>
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-n-500 uppercase tracking-wider">Search Results</h3>
            <button type="button" onClick={() => handleSearchChange('')} className="text-xs font-semibold text-brand hover:text-brand-dk">
              Clear
            </button>
          </div>
          {isSearching ? (
            <SearchSkeletonRows />
          ) : searchResults.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-n-200 bg-white shadow-sm">
              <div className="hidden md:block">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Appointment ID</th>
                      <th>Mobile</th>
                      <th>Package</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map(apt => (
                      <tr
                        key={apt.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => openAppointment(apt.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') openAppointment(apt.id);
                        }}
                        className="cursor-pointer transition-colors hover:bg-brand-lt/45 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
                      >
                        <td>
                          <div className="font-semibold text-n-900">
                            <Highlight value={apt.user?.full_name} query={searchQuery} />
                          </div>
                          <div className="mt-0.5 text-xs text-n-500">
                            <Highlight value={apt.user?.email} query={searchQuery} />
                          </div>
                        </td>
                        <td className="font-mono text-n-800">
                          <Highlight value={apt.user?.employee_id} query={searchQuery} />
                        </td>
                        <td className="font-mono text-n-800">
                          <Highlight value={apt.id} query={searchQuery} />
                        </td>
                        <td className="font-mono">
                          <Highlight value={apt.user?.mobile_number} query={searchQuery} />
                        </td>
                        <td>
                          <span className="line-clamp-1 text-n-800">{apt.package?.name || '-'}</span>
                        </td>
                        <td className="whitespace-nowrap">{format(new Date(apt.created_at), 'MMM d, yyyy')}</td>
                        <td>
                          <span className={`badge ${apt.booking_status === 'success' ? 'badge-ok' : apt.booking_status === 'pending' ? 'badge-warn' : 'badge-risk'} capitalize`}>
                            {apt.booking_status}
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openAppointment(apt.id);
                            }}
                            className="btn btn-secondary btn-sm whitespace-nowrap"
                          >
                            Open <ArrowRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-n-100 md:hidden">
              {searchResults.map(apt => (
                <button
                  type="button"
                  key={apt.id}
                  className="block w-full touch-manipulation p-4 text-left transition-colors active:bg-brand-lt/70"
                  onClick={() => openAppointment(apt.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-n-900">
                        <Highlight value={apt.user?.full_name} query={searchQuery} />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-n-500">
                        <span className="font-mono">
                          <Highlight value={apt.user?.employee_id} query={searchQuery} />
                        </span>
                        <span className="text-n-300">|</span>
                        <span className="font-mono">
                          <Highlight value={apt.id} query={searchQuery} />
                        </span>
                      </div>
                    </div>
                    <span className={`badge ${apt.booking_status === 'success' ? 'badge-ok' : apt.booking_status === 'pending' ? 'badge-warn' : 'badge-risk'} shrink-0 capitalize`}>
                        {apt.booking_status}
                      </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-n-600">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-n-400" />
                      <span className="font-mono">
                        <Highlight value={apt.user?.mobile_number} query={searchQuery} />
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClipboardList size={14} className="text-n-400" />
                      <span className="truncate text-n-800">{apt.package?.name || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-n-400" />
                        {format(new Date(apt.created_at), 'MMM d, yyyy')}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-brand">
                        View Details <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-n-300 bg-white py-10 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-n-100 text-n-500">
                <BadgeCheck size={22} />
              </div>
              <h4 className="font-semibold text-n-900">No matching appointments</h4>
              <p className="mt-1 text-sm text-n-600">Try an employee ID, appointment ID, mobile number, or email.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
