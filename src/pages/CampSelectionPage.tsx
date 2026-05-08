import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Building2, Calendar, Clock3, MapPin, Search, UsersRound } from 'lucide-react';

import { useStore } from '../store';
import type { Camp } from '../types';

function CampSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {[0, 1].map(item => (
        <div key={item} className="skeleton-card">
          <div className="mb-6 flex items-start gap-4">
            <div className="skeleton skeleton-circle h-12 w-12" />
            <div className="flex-1">
              <div className="skeleton skeleton-line w-60" />
              <div className="skeleton skeleton-line w-40" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map(line => <div key={line} className="skeleton skeleton-line" />)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CampSelectionPage() {
  const { activeCamps, setSelectedCamp } = useStore();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredCamps = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return activeCamps;
    return activeCamps.filter(camp => [
      camp.name,
      camp.organization_name,
      camp.provider_name,
      camp.location,
      camp.address,
      camp.timing
    ].filter(Boolean).some(value => value!.toLowerCase().includes(normalizedQuery)));
  }, [activeCamps, query]);

  const handleSelect = (camp: Camp) => {
    setSelectedCamp(camp);
    navigate('/');
  };

  if (!loading && activeCamps.length === 0) {
    return (
      <div className="empty-state mx-auto max-w-xl">
        <div className="empty-state-icon">
          <Building2 size={30} />
        </div>
        <h2 className="empty-state-title">No Active Camps</h2>
        <p className="empty-state-desc">You are not mapped to any active camps at the moment. Please contact your operations admin.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-n-900">Select Active Camp</h1>
        </div>
        <span className="badge badge-neutral w-fit"><span className="font-mono">{activeCamps.length}</span> active</span>
      </div>

      <div className="ds-surface p-3 sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-n-400" size={18} />
          <input
            className="ds-input pl-10 text-base"
            placeholder="Search camps by name, organization, provider, or location"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <CampSkeleton />
      ) : filteredCamps.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredCamps.map(camp => (
            <button
              key={camp.id}
              type="button"
              className="ds-card group touch-manipulation p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              onClick={() => handleSelect(camp)}
            >
              <div className="p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-brand-m bg-brand-lt text-brand">
                      <Building2 size={24} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold leading-snug text-n-900 transition-colors group-hover:text-brand">{camp.name}</h2>
                      <p className="mt-1 text-sm font-semibold text-n-700">{camp.organization_name || camp.provider_name}</p>
                      <p className="mt-0.5 text-xs text-n-500">{camp.provider_name}</p>
                    </div>
                  </div>
                  <span className="badge badge-ok shrink-0">● Active</span>
                </div>

                <div className="grid gap-3 text-sm text-n-700 sm:grid-cols-2">
                  <div className="flex gap-2">
                    <MapPin size={17} className="mt-0.5 shrink-0 text-n-400" />
                    <span>{camp.address || camp.location}</span>
                  </div>
                  <div className="flex gap-2">
                    <Calendar size={17} className="mt-0.5 shrink-0 text-n-400" />
                    <span className="font-mono text-[13px]">{format(new Date(camp.start_date), 'MMM d')} - {format(new Date(camp.end_date), 'MMM d, yyyy')}</span>
                  </div>
                  <div className="flex gap-2">
                    <Clock3 size={17} className="mt-0.5 shrink-0 text-n-400" />
                    <span className="font-mono text-[13px]">{camp.timing || 'Camp timing pending'}</span>
                  </div>
                  <div className="flex gap-2">
                    <UsersRound size={17} className="mt-0.5 shrink-0 text-n-400" />
                    <span><span className="font-mono font-semibold">{camp.assigned_agent_count || 0}</span> assigned agents</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-n-100 bg-n-50 px-5 py-4 sm:px-6">
                <span className="btn btn-primary w-full">Select Camp</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state ds-surface">
          <div className="empty-state-icon bg-brand-lt text-brand">
            <Search size={28} />
          </div>
          <h2 className="empty-state-title">No camps match your search</h2>
          <p className="empty-state-desc">Try another camp name, provider, organization, or location.</p>
          <button type="button" onClick={() => setQuery('')} className="btn btn-secondary">Clear Search</button>
        </div>
      )}
    </div>
  );
}
