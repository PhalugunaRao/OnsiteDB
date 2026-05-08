import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { api } from '../api/mock';
import type { User, Package } from '../types';
import { CheckCircle2, AlertTriangle, CalendarPlus, User as UserIcon } from 'lucide-react';

export default function BookingReviewPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const selectedCamp = useStore(state => state.selectedCamp);
  const draftEntries = useStore(state => state.draftEntries);
  const addBookingFailure = useStore(state => state.addBookingFailure);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const init = async () => {
      const res = await api.searchUser(userId || '');
      if (res) {
        setUser(res.user);
        setPkg(res.package || null);
      }
      setLoading(false);
    };
    init();
  }, [userId]);

  const handleCreateBooking = async () => {
    if (!user || !selectedCamp || !pkg) return;
    setSubmitting(true);
    setErrorMsg('');
    
    try {
      const res = await api.createBooking({
        user_id: user.id,
        camp_id: selectedCamp.id,
        provider_id: selectedCamp.provider_id,
        package_id: pkg.id,
        component_entries: Object.keys(draftEntries)
      });
      navigate(`/appointment/${res.appointment_id}`);
    } catch (err: unknown) {
      setErrorMsg('Booking failed. Your data is preserved.');
      const failureReason = err instanceof Error ? err.message : 'Partner API Timeout';
      addBookingFailure({
        id: `fail-${Date.now()}`,
        local_reference_id: `loc-${Date.now()}`,
        user_id: user.id,
        camp_id: selectedCamp.id,
        provider_id: selectedCamp.provider_id,
        failure_reason: failureReason,
        last_attempted_at: new Date().toISOString(),
        retry_count: 1,
        preserved_component_entry_ids: Object.keys(draftEntries)
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-sm font-medium text-n-500">Loading details...</div>;
  if (!user || !pkg) return <div className="empty-state ds-surface mx-auto max-w-xl"><div className="empty-state-title">Error loading user</div><p className="empty-state-desc">This employee record is not available for booking review.</p></div>;

  const capturedCount = pkg.components.filter(c => draftEntries[c.id]).length;
  const totalCount = pkg.components.length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-lt text-brand">
          <CalendarPlus size={32} />
        </div>
        <h1 className="text-2xl font-bold leading-tight text-n-900">Review & Create Booking</h1>
      </div>

      {errorMsg && (
        <div className="ds-card bordered-rose bg-rose-lt/30 p-4 flex gap-4 animate-[fadeUp_0.3s_ease]">
          <AlertTriangle className="text-rose flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-rose text-sm">Booking Failed</h4>
            <p className="text-xs text-rose mt-1 mb-3">{errorMsg}</p>
            <div className="flex gap-3">
              <button onClick={handleCreateBooking} disabled={submitting} className={`btn btn-danger btn-sm ${submitting ? 'btn-loading' : ''}`}>Retry Booking</button>
              <button onClick={() => navigate('/failures')} className="btn btn-secondary btn-sm">View in Queue</button>
            </div>
          </div>
        </div>
      )}

      <div className="ds-card">
        <h3 className="mb-4 border-b border-n-100 pb-2 text-base font-bold text-n-900">User Details</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-lt text-brand">
            <UserIcon size={24} />
          </div>
          <div>
            <div className="font-semibold text-n-900 text-lg">{user.full_name}</div>
            <div className="text-sm font-mono text-n-500">{user.employee_id} • {user.mobile_number}</div>
          </div>
        </div>

        <h3 className="mb-4 border-b border-n-100 pb-2 text-base font-bold text-n-900">Camp & Provider</h3>
        <div className="mb-6 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <span className="text-n-500 block mb-1">Camp Name</span>
            <span className="font-medium text-n-900">{selectedCamp?.name}</span>
          </div>
          <div>
            <span className="text-n-500 block mb-1">Provider</span>
            <span className="font-medium text-n-900">{selectedCamp?.provider_name}</span>
          </div>
        </div>

        <h3 className="mb-4 border-b border-n-100 pb-2 text-base font-bold text-n-900">Captured Data Summary</h3>
        <div className="mb-8 flex flex-col gap-3 rounded-lg bg-n-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-medium text-n-900">{pkg.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="font-mono text-lg font-bold text-n-900">{capturedCount}/{totalCount}</div>
            <span className="text-xs font-semibold uppercase text-n-500 tracking-wider">Saved</span>
            {capturedCount === totalCount && <CheckCircle2 size={20} className="text-green ml-1" />}
          </div>
        </div>

        <button 
          onClick={handleCreateBooking} 
          disabled={submitting} 
          className={`btn btn-primary btn-lg w-full ${submitting ? 'btn-loading' : ''}`}
        >
          {submitting ? 'Creating Booking...' : 'Confirm & Create Booking'}
        </button>
      </div>
    </div>
  );
}
