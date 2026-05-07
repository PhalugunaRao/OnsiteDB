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
    } catch (err: any) {
      setErrorMsg('Booking failed. Your data is preserved.');
      addBookingFailure({
        id: `fail-${Date.now()}`,
        local_reference_id: `loc-${Date.now()}`,
        user_id: user.id,
        camp_id: selectedCamp.id,
        provider_id: selectedCamp.provider_id,
        failure_reason: err.message || 'Partner API Timeout',
        last_attempted_at: new Date().toISOString(),
        retry_count: 1,
        preserved_component_entry_ids: Object.keys(draftEntries)
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-n-500">Loading details...</div>;
  if (!user || !pkg) return <div className="p-10 text-center text-rose">Error loading user.</div>;

  const capturedCount = pkg.components.filter(c => draftEntries[c.id]).length;
  const totalCount = pkg.components.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-lt text-brand flex items-center justify-center mx-auto mb-4">
          <CalendarPlus size={32} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-n-900 mb-2">Review & Create Booking</h1>
        <p className="text-n-600">Please review the details before confirming the appointment.</p>
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
        <h3 className="font-semibold text-n-900 mb-4 border-b border-n-100 pb-2">User Details</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-n-100 flex items-center justify-center text-n-500">
            <UserIcon size={24} />
          </div>
          <div>
            <div className="font-semibold text-n-900 text-lg">{user.full_name}</div>
            <div className="text-sm font-mono text-n-500">{user.employee_id} • {user.mobile_number}</div>
          </div>
        </div>

        <h3 className="font-semibold text-n-900 mb-4 border-b border-n-100 pb-2">Camp & Provider</h3>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="text-n-500 block mb-1">Camp Name</span>
            <span className="font-medium text-n-900">{selectedCamp?.name}</span>
          </div>
          <div>
            <span className="text-n-500 block mb-1">Provider</span>
            <span className="font-medium text-n-900">{selectedCamp?.provider_name}</span>
          </div>
        </div>

        <h3 className="font-semibold text-n-900 mb-4 border-b border-n-100 pb-2">Captured Data Summary</h3>
        <div className="flex items-center justify-between p-4 rounded-lg bg-n-50 mb-8">
          <div>
            <div className="font-medium text-n-900">{pkg.name}</div>
            <div className="text-sm text-n-600 mt-1">Data will be pushed with the booking request</div>
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
          className={`btn btn-brand w-full btn-lg ${submitting ? 'btn-loading' : ''}`}
        >
          {submitting ? 'Creating Booking...' : 'Confirm & Create Booking'}
        </button>
      </div>
    </div>
  );
}
