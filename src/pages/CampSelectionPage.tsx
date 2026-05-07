import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export default function CampSelectionPage() {
  const { activeCamps, setSelectedCamp } = useStore();
  const navigate = useNavigate();

  const handleSelect = (camp: any) => {
    setSelectedCamp(camp);
    navigate('/');
  };

  if (activeCamps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-n-100 flex items-center justify-center text-n-400 mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-xl font-semibold text-n-900 mb-2">No Active Camps</h2>
        <p className="text-n-600 text-center max-w-sm">You are not mapped to any active camps at the moment. Please contact your operations admin.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-n-900 mb-2 tracking-tight">Select Active Camp</h1>
        <p className="text-n-600">You are mapped to {activeCamps.length} active camp{activeCamps.length > 1 ? 's' : ''}. Select one to begin operations.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {activeCamps.map(camp => (
          <div key={camp.id} className="ds-card cursor-pointer group" onClick={() => handleSelect(camp)}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <img src={camp.provider_logo} alt={camp.provider_name} className="w-10 h-10 rounded border border-n-200" />
                <div>
                  <h3 className="font-semibold text-n-900 group-hover:text-brand transition-colors">{camp.name}</h3>
                  <p className="text-xs text-n-500 font-medium">{camp.provider_name}</p>
                </div>
              </div>
              <span className="badge badge-ok">Active</span>
            </div>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-2 text-sm text-n-600">
                <Calendar size={16} className="text-n-400" />
                <span>{format(new Date(camp.start_date), 'MMM d')} - {format(new Date(camp.end_date), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-n-600">
                <MapPin size={16} className="text-n-400" />
                <span>{camp.location}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-n-100 flex justify-end">
              <button className="btn btn-brand btn-sm w-full">Select Camp</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
