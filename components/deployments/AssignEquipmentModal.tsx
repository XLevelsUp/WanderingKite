'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { createAssignmentAction } from '@/actions/deployments';
import {
  PlusCircle,
  X,
  User,
  Camera,
  MapPin,
  Calendar,
  Loader2,
  CheckCircle,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types matching what getAssignmentFormData() returns ────────────────────
interface EmployeeOption {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
}
interface EquipmentOption {
  id: string;
  name: string;
  serialNumber: string;
  categories: { name: string } | null;
  category_name?: string | null;
  ownership_type?: string;
  is_rental?: boolean;
  equipment_type?: string;
}
interface ClientOption {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface AssignEquipmentModalProps {
  employees: EmployeeOption[];
  equipment: EquipmentOption[];
  clients: ClientOption[];
  isEmployee?: boolean;
  currentUserId?: string;
}

// ─── Field component for DRY form fields ────────────────────────────────────
function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/50 uppercase tracking-wider">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

const selectClass =
  'w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground/85 placeholder-foreground/25 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-[#1a1a24] [&>optgroup]:bg-[#1a1a24]';

const inputClass =
  'w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-foreground/85 placeholder-foreground/30 ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-150 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed';

// ─── Main Modal ──────────────────────────────────────────────────────────────
export function AssignEquipmentModal({
  employees,
  equipment,
  clients,
  isEmployee,
  currentUserId,
}: AssignEquipmentModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterOwnership, setFilterOwnership] = useState<string>('ALL');

  const now = new Date();
  const todayDateStr = now.toISOString().slice(0, 10);
  let nowHourInt = now.getHours();
  const nowAmPmStr = nowHourInt >= 12 ? 'PM' : 'AM';
  nowHourInt = nowHourInt % 12 || 12;
  const todayHour12Str = String(nowHourInt).padStart(2, '0');

  // Controlled Date/Time states for Live Precheck
  const [assignedDate, setAssignedDate] = useState(todayDateStr);
  const [assignedHour, setAssignedHour] = useState(todayHour12Str);
  const [assignedMin, setAssignedMin] = useState("00");
  const [assignedAmPm, setAssignedAmPm] = useState(nowAmPmStr);

  const [expectedDate, setExpectedDate] = useState("");
  const [expectedHour, setExpectedHour] = useState("12");
  const [expectedMin, setExpectedMin] = useState("00");
  const [expectedAmPm, setExpectedAmPm] = useState("PM");

  const [conflictIds, setConflictIds] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  // Helper to parse the custom 12-hour fields into an ISO string
  function getIsoString(d: string, h: string, m: string, ap: string): string | null {
    if (!d) return null;
    let hour = parseInt(h, 10);
    if (ap === 'PM' && hour < 12) hour += 12;
    if (ap === 'AM' && hour === 12) hour = 0;
    return new Date(`${d}T${String(hour).padStart(2, '0')}:${m}:00`).toISOString();
  }

  // Live Precheck Effect
  useEffect(() => {
    const startIso = getIsoString(assignedDate, assignedHour, assignedMin, assignedAmPm);
    const endIso = getIsoString(expectedDate, expectedHour, expectedMin, expectedAmPm);

    if (!startIso || !endIso) {
      setConflictIds([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const res = await fetch('/api/deployments/precheck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startDate: startIso, endDate: endIso })
        });
        const data = await res.json();
        if (data.conflicts) {
          setConflictIds(data.conflicts.map((c: any) => c.equipmentId));
        } else {
          setConflictIds([]);
        }
      } catch (err) {
        toast.error("Failed to verify equipment availability");
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [assignedDate, assignedHour, assignedMin, assignedAmPm, expectedDate, expectedHour, expectedMin, expectedAmPm]);

  function validate(data: Record<string, any>) {
    const errors: Record<string, string> = {};
    if (!data.employeeId) errors.employeeId = 'Select an assignee';
    if (!data.clientId) errors.clientId = 'Select a client';
    if (!data.serviceType) errors.serviceType = 'Select a project type';
    if (!data.location) errors.location = 'Enter project location';
    if (!data.assignedAt) errors.assignedAt = 'Select a taken time';
    if (!data.expectedReturn) errors.expectedReturn = 'Select a return time';
    return errors;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    const raw = {
      employeeId: fd.get('employeeId') as string,
      equipmentIds: selectedEquipment,
      clientId: (fd.get('clientId') as string) || undefined,
      serviceType: (fd.get('serviceType') as string) || undefined,
      location: (fd.get('location') as string) || '',
      assignedAt: undefined as string | undefined, // will build from separate fields
      expectedReturn: undefined as string | undefined, // will build from separate fields
      notes: (fd.get('notes') as string) || undefined,
    };

    // Parse custom 12-hour Assigned At
    const assignedDate = fd.get('assignedDate') as string;
    const assignedHour = fd.get('assignedHour') as string;
    const assignedMin = fd.get('assignedMin') as string;
    const assignedAmPm = fd.get('assignedAmPm') as string;
    if (assignedDate) {
      let h = parseInt(assignedHour, 10);
      if (assignedAmPm === 'PM' && h < 12) h += 12;
      if (assignedAmPm === 'AM' && h === 12) h = 0;
      raw.assignedAt = new Date(`${assignedDate}T${String(h).padStart(2,'0')}:${assignedMin}:00`).toISOString();
    }

    // Parse custom 12-hour Expected Return
    if (expectedDate) {
      raw.expectedReturn = getIsoString(expectedDate, expectedHour, expectedMin, expectedAmPm) || undefined;
    }

    const errors = validate(raw);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    startTransition(async () => {
      const toastId = toast.loading('Assigning equipment...');
      const res = await createAssignmentAction(raw);
      setResult(res);
      if (res.success) {
        toast.success('Equipment assigned successfully!', { id: toastId });
        formRef.current?.reset();
        setSelectedEquipment([]);
        setSearch('');
        setExpectedDate('');
        setTimeout(() => {
          setOpen(false);
          setResult(null);
        }, 1400);
      } else {
        toast.error(res.error || 'Failed to assign equipment', { id: toastId });
      }
    });
  }

  const filteredEquipment = equipment.filter(eq => {
    const searchStr = search.toLowerCase();
    const categoryMatch = eq.category_name ? eq.category_name.toLowerCase().includes(searchStr) : false;
    const oldCategoryMatch = eq.categories?.name ? eq.categories.name.toLowerCase().includes(searchStr) : false;
    const matchesSearch = eq.name.toLowerCase().includes(searchStr) || 
                          eq.serialNumber.toLowerCase().includes(searchStr) || 
                          categoryMatch || 
                          oldCategoryMatch;
    
    if (!matchesSearch) return false;

    if (filterOwnership === 'IN_HOUSE') {
      return eq.ownership_type === 'IN_HOUSE';
    } else if (filterOwnership === 'RENTAL') {
      return eq.ownership_type === 'RENTAL';
    }
    return true;
  });

  const hasConflicts = selectedEquipment.some(id => conflictIds.includes(id));

  function toggleEquipment(id: string) {
    setSelectedEquipment(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => {
          setOpen(true);
          setResult(null);
          setFieldErrors({});
          setSelectedEquipment([]);
          setSearch('');
        }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
          bg-primary text-primary-foreground hover:bg-primary/90
          transition-all duration-150 shadow-lg shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <PlusCircle className="w-4 h-4" />
        Assign Project
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => !isPending && setOpen(false)}
        />
      )}

      {/* Modal panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
          <div
            className="w-full max-w-lg max-h-[95vh] flex flex-col bg-[rgba(17,17,25,0.98)] border border-white/10 rounded-2xl shadow-2xl
              backdrop-blur-xl pointer-events-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
              <div>
                <h2 className="text-base font-semibold text-foreground/90">
                  Assign Project
                </h2>
                <p className="text-xs text-foreground/40 mt-0.5">
                  Deploy gear to a photographer for a shoot
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground/70 hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="p-6 space-y-5 overflow-y-auto custom-scrollbar"
            >
              {/* ── Row 1: Employee + Service Type ── */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Assignee (Who)" icon={User} error={fieldErrors.employeeId}>
                  {isEmployee ? (
                    <div className="w-full px-3 py-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-sm text-foreground/60 cursor-not-allowed">
                      {employees.find(e => e.id === currentUserId)?.fullName || 'Self'}
                      <input type="hidden" name="employeeId" value={currentUserId || ''} />
                    </div>
                  ) : (
                    <select name="employeeId" className={selectClass} defaultValue="">
                      <option value="" disabled>Select an assignee...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.fullName || emp.email} ({emp.role.toLowerCase()})
                        </option>
                      ))}
                    </select>
                  )}
                </Field>

                <Field label="Project Type *" icon={MapPin} error={fieldErrors.serviceType}>
                  <select name="serviceType" className={selectClass} defaultValue="">
                    <option value="">No Project Type</option>
                    <optgroup label="Photography">
                      <option value="wedding">Wedding</option>
                      <option value="engagement">Engagement</option>
                      <option value="birthday">Birthday</option>
                      <option value="family">Family Portrait</option>
                      <option value="maternity">Maternity</option>
                      <option value="baby_shoot">Baby Shoot</option>
                    </optgroup>
                    <optgroup label="Corporate & Commercial">
                      <option value="product">Product</option>
                      <option value="cinematic_video">Cinematic Video</option>
                      <option value="social_media">Social Media</option>
                      <option value="model_shoot">Model Shoot</option>
                      <option value="headshot">Headshot</option>
                      <option value="ads">Commercial Ads</option>
                      <option value="music_video">Music Video</option>
                      <option value="short_film">Short Film</option>
                    </optgroup>
                  </select>
                </Field>
              </div>

              {/* ── Row 2: Equipment Selection ── */}
              <Field
                label="Equipment List"
                icon={Camera}
                error={fieldErrors.equipmentIds}
              >
                <div className="border border-white/10 rounded-xl bg-white/[0.02] overflow-hidden flex flex-col h-48">
                  <div className="relative border-b border-white/10 flex items-center">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                    <input 
                      type="text" 
                      placeholder="Search by name, serial, or category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 bg-transparent border-none py-2.5 pl-9 pr-3 text-sm focus:outline-none text-foreground placeholder-foreground/30"
                    />
                    <div className="border-l border-white/10 h-full px-2">
                      <select 
                        value={filterOwnership}
                        onChange={(e) => setFilterOwnership(e.target.value)}
                        className="bg-transparent text-xs focus:outline-none text-foreground/70 py-2.5 pr-2"
                      >
                        <option value="ALL" className="bg-[#1a1a24]">All Ownership</option>
                        <option value="IN_HOUSE" className="bg-[#1a1a24]">In-House</option>
                        <option value="RENTAL" className="bg-[#1a1a24]">Rental</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredEquipment.length === 0 ? (
                      <p className="text-xs text-foreground/40 text-center py-4">No equipment found.</p>
                    ) : (
                      filteredEquipment.map(eq => {
                        const isConflict = conflictIds.includes(eq.id);
                        return (
                          <label key={eq.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isConflict ? 'opacity-50 grayscale bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/5'}`}>
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary/50"
                              checked={selectedEquipment.includes(eq.id)}
                              onChange={() => toggleEquipment(eq.id)}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground/90">{eq.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] text-foreground/50">{eq.serialNumber}</p>
                                {(eq.category_name || eq.categories?.name) && (
                                  <span className="text-[10px] text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">
                                    {eq.category_name || eq.categories?.name}
                                  </span>
                                )}
                                {eq.ownership_type && (
                                  <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded">
                                    {eq.ownership_type === 'IN_HOUSE' ? 'In-House' : 'Rental'}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isConflict && (
                              <span className="text-[10px] font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Booked
                              </span>
                            )}
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
                {selectedEquipment.length > 0 && (
                  <p className="text-xs text-primary font-medium mt-1 text-right">
                    {selectedEquipment.length} item{selectedEquipment.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </Field>

              {/* ── Client + Location ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Client *" icon={User} error={fieldErrors.clientId}>
                  <select name="clientId" className={selectClass} defaultValue="">
                    <option value="" disabled>Select client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `· ${c.phone}` : ''}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Project Location *" icon={MapPin} error={fieldErrors.location}>
                  <input
                    name="location"
                    type="text"
                    placeholder="e.g. Bandra Studio, Outdoor"
                    className={inputClass}
                  />
                </Field>
              </div>

              {/* ── Taken Timing + Return Timing ── */}
              <div className="grid grid-cols-1 gap-4">
                <Field label="Equipment Taken Timing *" icon={Calendar} error={fieldErrors.assignedAt}>
                  <div className="flex flex-col sm:flex-row gap-1.5 w-full">
                    <input type="date" name="assignedDate" value={assignedDate} onChange={e => setAssignedDate(e.target.value)} className={inputClass} />
                    <div className="flex gap-1 items-center bg-white/[0.04] border border-white/10 rounded-lg px-2 flex-1 justify-center">
                      <select name="assignedHour" value={assignedHour} onChange={e => setAssignedHour(e.target.value)} className="bg-transparent text-sm focus:outline-none text-foreground/85">
                        {Array.from({length:12}, (_,i) => String(i+1).padStart(2,'0')).map(h => <option key={h} className="bg-[#1a1a24]">{h}</option>)}
                      </select>
                      <span className="text-foreground/50">:</span>
                      <select name="assignedMin" value={assignedMin} onChange={e => setAssignedMin(e.target.value)} className="bg-transparent text-sm focus:outline-none text-foreground/85">
                        {['00','15','30','45'].map(m => <option key={m} className="bg-[#1a1a24]">{m}</option>)}
                      </select>
                      <select name="assignedAmPm" value={assignedAmPm} onChange={e => setAssignedAmPm(e.target.value)} className="bg-transparent text-sm focus:outline-none text-foreground/85">
                        <option className="bg-[#1a1a24]">AM</option>
                        <option className="bg-[#1a1a24]">PM</option>
                      </select>
                    </div>
                  </div>
                </Field>
                <Field label="Expected Return Timing *" icon={Calendar} error={fieldErrors.expectedReturn}>
                  <div className="flex flex-col sm:flex-row gap-1.5 w-full">
                    <input type="date" name="expectedDate" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} min={assignedDate} className={inputClass} />
                    <div className="flex gap-1 items-center bg-white/[0.04] border border-white/10 rounded-lg px-2 flex-1 justify-center">
                      <select name="expectedHour" value={expectedHour} onChange={e => setExpectedHour(e.target.value)} className="bg-transparent text-sm focus:outline-none text-foreground/85">
                        {Array.from({length:12}, (_,i) => String(i+1).padStart(2,'0')).map(h => <option key={h} className="bg-[#1a1a24]">{h}</option>)}
                      </select>
                      <span className="text-foreground/50">:</span>
                      <select name="expectedMin" value={expectedMin} onChange={e => setExpectedMin(e.target.value)} className="bg-transparent text-sm focus:outline-none text-foreground/85">
                        {['00','15','30','45'].map(m => <option key={m} className="bg-[#1a1a24]">{m}</option>)}
                      </select>
                      <select name="expectedAmPm" value={expectedAmPm} onChange={e => setExpectedAmPm(e.target.value)} className="bg-transparent text-sm focus:outline-none text-foreground/85">
                        <option className="bg-[#1a1a24]">AM</option>
                        <option className="bg-[#1a1a24]">PM</option>
                      </select>
                    </div>
                  </div>
                </Field>
              </div>

              {/* ── Project Description ── */}
              <Field label="Project Description (optional)" icon={Camera} error={fieldErrors.notes}>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Describe the project or provide handling instructions..."
                  className={`${inputClass} resize-none`}
                />
              </Field>

              {/* ── Result feedback ── */}
              {hasConflicts && (
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>One or more selected items are already booked for these dates. Please uncheck them to proceed.</span>
                </div>
              )}
              {result?.error && !hasConflicts && (
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {result.error}
                </div>
              )}
              {result?.success && (
                <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Assignment created — matrix is refreshing…
                </div>
              )}

              {/* ── Equipment availability note ── */}
              {equipment.length === 0 && (
                <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
                  ⚠ No AVAILABLE equipment found. Mark gear as Available in the
                  Equipment page first.
                </div>
              )}

              {/* ── Footer ── */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg text-sm text-foreground/50 hover:text-foreground/80 hover:bg-white/5 transition-colors disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || equipment.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium
                    bg-primary text-primary-foreground hover:bg-primary/90
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {isPending || isChecking ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />{' '}
                      {isChecking ? 'Checking...' : 'Assigning…'}
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" /> Create Assignment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
