import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { api } from '../api/mock';
import type { Package, User } from '../types';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

export default function ComponentEntryPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const selectedCamp = useStore(state => state.selectedCamp);
  const agent = useStore(state => state.agent);
  const draftEntries = useStore(state => state.draftEntries);
  const updateDraftEntry = useStore(state => state.updateDraftEntry);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // Need a way to fetch just user and package by ID. Reusing search mock for now.
      // In a real app we'd have a specific endpoint.
      const res = await api.searchUser(userId || '');
      if (res) {
        setUser(res.user);
        setPkg(res.package || null);
        if (res.package && res.package.components.length > 0) {
          setActiveSection(res.package.components[0].section);
        }
      }
      setLoading(false);
    };
    init();
  }, [userId]);

  if (loading) return <div className="p-10 text-center text-n-500">Loading component data...</div>;
  if (!user || !pkg) return <div className="p-10 text-center text-rose">Error loading data.</div>;

  // Group components by section
  const sections = pkg.components.reduce((acc, comp) => {
    if (!acc[comp.section]) acc[comp.section] = [];
    acc[comp.section].push(comp);
    return acc;
  }, {} as Record<string, typeof pkg.components>);

  const handleSaveComponent = async (componentId: string, value: any) => {
    if (!value) return;
    const entry = await api.saveComponentEntry({
      temporary_local_id: `temp-${Date.now()}`,
      user_id: user.id,
      camp_id: selectedCamp!.id,
      package_component_id: componentId,
      section_name: activeSection || '',
      values: { value },
      status: 'draft_saved',
      saved_by: agent!.id
    });
    updateDraftEntry(componentId, entry as any);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <div className="kicker mb-1 text-n-500">Component Entry</div>
          <h1 className="text-2xl font-serif font-bold text-n-900 tracking-tight">{user.full_name}</h1>
          <p className="text-sm font-mono text-n-500 mt-1">{user.employee_id} • {pkg.name}</p>
        </div>
        <button onClick={() => navigate(`/booking-review/${user.id}`)} className="btn btn-brand">
          Review & Create Booking <ArrowRight size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(sections).map(([sectionName, components]) => {
          const isOpen = activeSection === sectionName;
          const isComplete = components.every(c => draftEntries[c.id]);
          
          return (
            <div key={sectionName} className="ds-card p-0 overflow-hidden">
              <div 
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${isOpen ? 'bg-n-50 border-b border-n-200' : 'hover:bg-n-50'}`}
                onClick={() => setActiveSection(isOpen ? null : sectionName)}
              >
                <div className="flex items-center gap-3">
                  {isComplete ? (
                    <CheckCircle2 size={20} className="text-green" />
                  ) : (
                    <Circle size={20} className="text-n-300" />
                  )}
                  <h3 className="font-semibold text-n-900">{sectionName}</h3>
                  <span className="badge badge-neutral ml-2">
                    {components.filter(c => draftEntries[c.id]).length} / {components.length}
                  </span>
                </div>
                {isOpen ? <ChevronUp size={20} className="text-n-500" /> : <ChevronDown size={20} className="text-n-500" />}
              </div>

              {isOpen && (
                <div className="p-6 bg-n-0 space-y-6">
                  {components.map(comp => (
                    <ComponentField 
                      key={comp.id} 
                      component={comp} 
                      savedValue={draftEntries[comp.id]?.values?.value} 
                      onSave={(val) => handleSaveComponent(comp.id, val)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComponentField({ component, savedValue, onSave }: { component: any, savedValue: any, onSave: (val: any) => Promise<void> }) {
  const [val, setVal] = useState(savedValue || '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle'|'saved'>('idle');

  useEffect(() => {
    if (savedValue) setVal(savedValue);
  }, [savedValue]);

  const handleSave = async () => {
    if (!val) return;
    setSaving(true);
    await onSave(val);
    setSaving(false);
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4 border-b border-n-100 pb-6 last:border-0 last:pb-0">
      <div className="flex-1">
        <label className="ds-label">{component.name} {component.required && <span className="text-rose">*</span>}</label>
        <input 
          type={component.type === 'numeric' ? 'number' : 'text'}
          className="ds-input"
          value={val}
          onChange={(e) => { setVal(e.target.value); setStatus('idle'); }}
          placeholder={`Enter ${component.name.toLowerCase()}`}
        />
      </div>
      <div className="flex items-center gap-3">
        {status === 'saved' && <span className="text-xs font-semibold text-green flex items-center gap-1"><CheckCircle2 size={14}/> Saved</span>}
        <button 
          onClick={handleSave} 
          disabled={saving || !val || val === savedValue}
          className={`btn ${savedValue && val === savedValue ? 'btn-secondary' : 'btn-primary'} ${saving ? 'btn-loading' : ''}`}
        >
          {savedValue ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
}
