import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function FailureQueuePage() {
  const bookingFailures = useStore(state => state.bookingFailures);
  const navigate = useNavigate();

  if (bookingFailures.length === 0) {
    return (
      <div className="empty-state mx-auto max-w-xl">
        <div className="empty-state-icon bg-green-lt text-green">
          <AlertCircle size={32} />
        </div>
        <h2 className="empty-state-title">All Clear</h2>
        <p className="empty-state-desc">There are no failed bookings in the queue.</p>
        <button onClick={() => navigate('/')} className="btn btn-secondary">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="mb-8 flex items-center gap-3 border-b border-n-200 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-lt text-rose">
          <AlertCircle size={20} />
        </div>
        <div>
          <div className="kicker mb-1">Sync Failures</div>
          <h1 className="display text-[30px] font-bold text-n-900">Retry Queue</h1>
          <p className="text-sm text-n-600 mt-1">{bookingFailures.length} booking(s) require your attention.</p>
        </div>
      </div>

      <div className="space-y-4">
        {bookingFailures.map(failure => (
          <div key={failure.id} className="ds-card bordered-rose flex flex-col items-start justify-between gap-6 p-5 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs text-n-500 bg-n-100 px-2 py-1 rounded">User {failure.user_id}</span>
                <span className="text-xs text-n-500 font-medium">{format(new Date(failure.last_attempted_at), 'MMM d, p')}</span>
              </div>
              <h3 className="font-medium text-n-900 text-base mb-1">Booking failed to sync</h3>
              <p className="text-sm text-rose font-medium">{failure.failure_reason}</p>
              <p className="text-xs text-n-500 mt-2">Data is preserved: {failure.preserved_component_entry_ids.length} components captured</p>
            </div>
            
            <div className="mt-4 flex w-full items-center gap-3 md:mt-0 md:w-auto">
              <button 
                onClick={() => navigate(`/booking-review/${failure.user_id}`)}
                className="btn btn-secondary w-full md:w-auto"
              >
                Review
              </button>
              <button 
                onClick={() => navigate(`/booking-review/${failure.user_id}`)}
                className="btn btn-primary w-full md:w-auto"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
