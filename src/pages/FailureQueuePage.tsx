import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export default function FailureQueuePage() {
  const bookingFailures = useStore(state => state.bookingFailures);
  const navigate = useNavigate();

  if (bookingFailures.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-lt text-green flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-semibold text-n-900 mb-2">All Clear!</h2>
        <p className="text-n-600">There are no failed bookings in the queue.</p>
        <button onClick={() => navigate('/')} className="btn btn-secondary mt-6">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-n-200">
        <div className="w-10 h-10 rounded-full bg-rose-lt text-rose flex items-center justify-center">
          <AlertCircle size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-n-900">Retry Queue</h1>
          <p className="text-sm text-n-600 mt-1">{bookingFailures.length} booking(s) require your attention.</p>
        </div>
      </div>

      <div className="space-y-4">
        {bookingFailures.map(failure => (
          <div key={failure.id} className="ds-card bordered-rose flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-5">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs text-n-500 bg-n-100 px-2 py-1 rounded">User {failure.user_id}</span>
                <span className="text-xs text-n-500 font-medium">{format(new Date(failure.last_attempted_at), 'MMM d, p')}</span>
              </div>
              <h3 className="font-medium text-n-900 text-base mb-1">Booking failed to sync</h3>
              <p className="text-sm text-rose font-medium">{failure.failure_reason}</p>
              <p className="text-xs text-n-500 mt-2">Data is preserved: {failure.preserved_component_entry_ids.length} components captured</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
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
