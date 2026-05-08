import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarDays, ClipboardList, Eye, Mail, Phone, Search, UserRoundCheck } from 'lucide-react';

import { api } from '../api/mock';
import { useStore } from '../store';
import type { Appointment, User } from '../types';

type AppointmentResult = Appointment & {
  user?: User;
};

const searchPlaceholder = 'Search by Employee ID, Appointment ID, Name, Mobile Number or Email';
const avatarPalette = ['#E8F1F6', '#E6F3F0', '#EFF6FF', '#F2EBFD', '#FDF1E4'];
const avatarInkPalette = ['#1D6FA4', '#14866D', '#2563EB', '#7C3AED', '#D97706'];

function initials(name?: string) {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/);
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || parts[0]?.[1] || ''}`.toUpperCase();
}

function avatarColor(value?: string) {
  const source = value || 'A';
  const index = source.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarPalette.length;
  return avatarPalette[index];
}

function avatarInk(value?: string) {
  const source = value || 'A';
  const index = source.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarInkPalette.length;
  return avatarInkPalette[index];
}

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
    if (matchIndex > cursor) parts.push(value.slice(cursor, matchIndex));
    const end = matchIndex + trimmedQuery.length;
    parts.push(
      <mark key={`${matchIndex}-${end}`} className="rounded-sm bg-amber-lt px-0.5 text-n-900">
        {value.slice(matchIndex, end)}
      </mark>
    );
    cursor = end;
    matchIndex = lowerValue.indexOf(lowerQuery, cursor);
  }

  if (cursor < value.length) parts.push(value.slice(cursor));
  return <span>{parts}</span>;
}

function SearchSkeletonRows() {
  return (
    <div className="overflow-hidden rounded-lg border border-n-200 bg-white">
      {[0, 1, 2, 3].map(row => (
        <div key={row} className="grid animate-pulse grid-cols-1 gap-3 border-b border-n-100 p-4 last:border-b-0 md:grid-cols-[0.9fr_1.4fr_1fr_1.45fr_0.9fr_0.8fr_44px] md:items-center md:gap-4 md:px-5 md:py-3">
          {[0, 1, 2, 3, 4, 5, 6].map(cell => (
            <div key={cell} className={`h-3 rounded-full bg-n-100 ${cell === 1 || cell === 3 ? 'w-4/5' : 'w-2/3'}`} />
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
        if (!ignore) setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
        if (!ignore) setSearchResults([]);
      } finally {
        if (!ignore) setIsSearching(false);
      }
    };

    const debounceTimer = window.setTimeout(fetchResults, 250);
    return () => {
      ignore = true;
      window.clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

  const resultCount = searchResults.length;
  const searched = searchQuery.trim().length > 0;
  const statusCounts = useMemo(() => ({
    success: searchResults.filter(result => result.booking_status === 'success').length,
    pending: searchResults.filter(result => result.booking_status === 'pending').length,
  }), [searchResults]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
  };

  const handleSearchChange = (value: string) => {
    const next = value.trimStart();
    if (next) setSearchParams({ q: next }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  const openAppointment = (appointmentId: string) => {
    navigate(`/appointment/${appointmentId}`, {
      state: { from: `${location.pathname}${location.search}` }
    });
  };

  if (!selectedCamp) return null;

  return (
    <div className="space-y-5">
      <div className="ds-surface p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-brand-m bg-brand-lt text-brand">
              <ClipboardList size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight text-n-900">{selectedCamp.name}</h1>
              <p className="mt-1 text-sm text-n-600">{selectedCamp.provider_name} · {selectedCamp.location}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-ok">● Active Now</span>
            <span className="badge badge-neutral"><span className="font-mono">{selectedCamp.assigned_agent_count || 0}</span> Agents</span>
          </div>
        </div>
      </div>

      <div className="sticky top-14 z-20 -mx-4 border-b border-n-200 bg-n-50/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-lg md:border md:bg-white md:px-5 md:shadow-sm">
        <div className="mb-3 flex justify-end">
          {searched && !isSearching && (
            <div className="flex flex-wrap gap-2 text-xs font-medium text-n-500">
              <span><span className="font-mono text-n-900">{resultCount}</span> result{resultCount === 1 ? '' : 's'}</span>
              <span><span className="font-mono text-green">{statusCounts.success}</span> success</span>
              <span><span className="font-mono text-amber">{statusCounts.pending}</span> pending</span>
            </div>
          )}
        </div>
        <form onSubmit={handleSearch} className="relative group">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-n-400 transition-colors group-focus-within:text-brand" size={18} />
          <input
            type="text"
            className="ds-input pl-11 text-base"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </form>
      </div>

      {searched ? (
        <div className="space-y-3 pb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-n-500">Search Results</h3>
            <button type="button" onClick={() => handleSearchChange('')} className="btn btn-link text-xs">
              Clear
            </button>
          </div>

          {isSearching ? (
            <SearchSkeletonRows />
          ) : searchResults.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-n-200 bg-white shadow-sm">
              <div className="hidden overflow-x-auto lg:block">
                <table className="ds-table min-w-[930px]">
                  <thead className="sticky top-0 z-10">
                    <tr>
                      <th>EMPLOYEE ID</th>
                      <th>NAME</th>
                      <th>APPOINTMENT ID</th>
                      <th>CONTACT</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                      <th className="text-right" aria-label="View appointment"></th>
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
                        className="clickable-row group cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-brand"
                      >
                        <td className="font-mono font-semibold text-n-800">
                          <Highlight value={apt.user?.employee_id} query={searchQuery} />
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="avatar avatar-md" style={{ background: avatarColor(apt.user?.full_name), color: avatarInk(apt.user?.full_name) }}>
                              {initials(apt.user?.full_name)}
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold text-n-900">
                                <Highlight value={apt.user?.full_name} query={searchQuery} />
                              </div>
                              <div className="mt-0.5 text-xs text-n-500">{apt.user?.company}</div>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono font-semibold text-n-800">
                          <Highlight value={apt.id} query={searchQuery} />
                        </td>
                        <td>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono text-xs text-n-800">
                              <Phone size={13} className="text-n-400" />
                              <Highlight value={apt.user?.mobile_number} query={searchQuery} />
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-n-600">
                              <Mail size={13} className="text-n-400" />
                              <Highlight value={apt.user?.email} query={searchQuery} />
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap font-mono text-xs">{format(new Date(apt.created_at), 'MMM d, yyyy')}</td>
                        <td>
                          <span className={`badge ${apt.booking_status === 'success' ? 'badge-ok' : apt.booking_status === 'pending' ? 'badge-warn' : 'badge-risk'} capitalize`}>
                            {apt.booking_status}
                          </span>
                        </td>
                        <td className="text-right">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-n-200 bg-white text-brand transition-colors group-hover:border-brand-m group-hover:bg-brand-lt" aria-hidden="true">
                            <Eye size={16} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-n-100 lg:hidden">
                {searchResults.map(apt => (
                  <button
                    type="button"
                    key={apt.id}
                    className="block w-full touch-manipulation p-4 text-left transition-colors active:bg-brand-lt"
                    onClick={() => openAppointment(apt.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <span className="avatar avatar-md" style={{ background: avatarColor(apt.user?.full_name), color: avatarInk(apt.user?.full_name) }}>
                          {initials(apt.user?.full_name)}
                        </span>
                        <div className="min-w-0">
                          <div className="truncate text-base font-semibold text-n-900">
                            <Highlight value={apt.user?.full_name} query={searchQuery} />
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-n-500">
                            <span className="font-mono"><Highlight value={apt.user?.employee_id} query={searchQuery} /></span>
                            <span className="text-n-300">|</span>
                            <span className="font-mono"><Highlight value={apt.id} query={searchQuery} /></span>
                          </div>
                        </div>
                      </div>
                      <span className={`badge ${apt.booking_status === 'success' ? 'badge-ok' : apt.booking_status === 'pending' ? 'badge-warn' : 'badge-risk'} shrink-0 capitalize`}>
                        {apt.booking_status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-xs text-n-600">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-n-400" />
                        <span className="font-mono"><Highlight value={apt.user?.mobile_number} query={searchQuery} /></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-n-400" />
                        <span className="truncate"><Highlight value={apt.user?.email} query={searchQuery} /></span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-n-100 pt-3">
                      <span className="flex items-center gap-2 text-xs font-mono text-n-500">
                        <CalendarDays size={14} className="text-n-400" />
                        {format(new Date(apt.created_at), 'MMM d, yyyy')}
                      </span>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-n-200 bg-white text-brand" aria-hidden="true">
                        <Eye size={16} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state ds-surface">
              <div className="empty-state-icon bg-brand-lt text-brand">
                <UserRoundCheck size={28} />
              </div>
              <h4 className="empty-state-title">No matching appointments</h4>
              <p className="empty-state-desc">Try an employee ID, appointment ID, name, mobile number, or email.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state ds-surface">
          <div className="empty-state-icon bg-brand-lt text-brand">
            <ClipboardList size={28} />
          </div>
          <h2 className="empty-state-title">Search appointments</h2>
        </div>
      )}
    </div>
  );
}
