import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { api } from '../api/mock';
import type { Package, PackageComponent, User } from '../types';
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

  if (loading) return <div className="p-10 text-center text-sm font-medium text-n-500">Loading component data...</div>;
  if (!user || !pkg) return <div className="empty-state ds-surface mx-auto max-w-xl"><div className="empty-state-title">Error loading data</div><p className="empty-state-desc">This employee record is not available for the selected camp.</p></div>;

  // Group components by section
  const sections = pkg.components.reduce((acc, comp) => {
    if (!acc[comp.section]) acc[comp.section] = [];
    acc[comp.section].push(comp);
    return acc;
  }, {} as Record<string, typeof pkg.components>);

  const handleSaveComponent = async (componentId: string, value: string) => {
    if (!value) return;
    const entry = await api.saveComponentEntry({
      temporary_local_id: `temp-${componentId}`,
      user_id: user.id,
      camp_id: selectedCamp!.id,
      package_component_id: componentId,
      section_name: activeSection || '',
      values: { value },
      status: 'draft_saved',
      saved_by: agent!.id
    });
    updateDraftEntry(componentId, entry);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-24">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="kicker mb-2">Component Entry</div>
          <h1 className="display text-[30px] font-bold leading-tight text-n-900">{user.full_name}</h1>
          <p className="mt-2 text-sm text-n-600"><span className="font-mono font-semibold text-n-900">{user.employee_id}</span> · {pkg.name}</p>
        </div>
        <button onClick={() => navigate(`/booking-review/${user.id}`)} className="btn btn-primary btn-lg w-full md:w-auto">
          Review & Create Booking <ArrowRight size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(sections).map(([sectionName, components]) => {
          const isOpen = activeSection === sectionName;
          const isComplete = components.every(c => draftEntries[c.id]);
          
          return (
            <div key={sectionName} className="ds-card overflow-hidden p-0">
              <div 
                className={`flex cursor-pointer items-center justify-between p-4 transition-colors md:p-5 ${isOpen ? 'border-b border-n-200 bg-n-50' : 'hover:bg-n-50'}`}
                onClick={() => setActiveSection(isOpen ? null : sectionName)}
              >
                <div className="flex items-center gap-3">
                  {isComplete ? (
                    <CheckCircle2 size={20} className="text-green" />
                  ) : (
                    <Circle size={20} className="text-n-300" />
                  )}
                  <h3 className="text-base font-bold text-n-900">{sectionName}</h3>
                  <span className="badge badge-neutral ml-2">
                    {components.filter(c => draftEntries[c.id]).length} / {components.length}
                  </span>
                </div>
                {isOpen ? <ChevronUp size={20} className="text-n-500" /> : <ChevronDown size={20} className="text-n-500" />}
              </div>

              {isOpen && (
                <div className="space-y-5 bg-n-0 p-4 md:p-6">
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

function ComponentField({ component, savedValue, onSave }: { component: PackageComponent, savedValue?: unknown, onSave: (val: string) => Promise<void> }) {
  const savedText = typeof savedValue === 'string' || typeof savedValue === 'number' ? String(savedValue) : '';
  const [val, setVal] = useState(savedText);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle'|'saved'>('idle');

  const handleSave = async () => {
    if (!val) return;
    setSaving(true);
    await onSave(val);
    setSaving(false);
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <div className="flex flex-col gap-4 border-b border-n-100 pb-5 last:border-0 last:pb-0 md:flex-row md:items-end">
      <div className="flex-1">
        <label className="ds-label">{component.name} {component.required && <span className="text-rose">*</span>}</label>
        <input 
          type={component.type === 'numeric' ? 'number' : 'text'}
          className={`ds-input ${component.type === 'numeric' ? 'font-mono' : ''}`}
          value={val}
          onChange={(e) => { setVal(e.target.value); setStatus('idle'); }}
          placeholder={`Enter ${component.name.toLowerCase()}`}
        />
      </div>
      <div className="flex items-center gap-3">
        {status === 'saved' && <span className="text-xs font-semibold text-green flex items-center gap-1"><CheckCircle2 size={14}/> Saved</span>}
        <button 
          onClick={handleSave} 
          disabled={saving || !val || val === savedText}
          className={`btn btn-lg w-full md:w-auto ${savedText && val === savedText ? 'btn-secondary' : 'btn-primary'} ${saving ? 'btn-loading' : ''}`}
        >
          {savedText ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
}
