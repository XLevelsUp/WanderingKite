'use client';

import { useState, useEffect } from 'react';
import { updateEquipment, getMaintenanceRecords, getEquipmentAuditLog } from '@/actions/equipment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Pencil, CheckCircle2, Plus, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { useNotify } from '@/hooks/useNotify';

// ── ImageUploadField ──────────────────────────────────────────────────────────
function ImageUploadField({
  name,
  defaultValue,
  disabled,
  onChange,
  bucket,
}: {
  name: string;
  defaultValue?: string | null;
  disabled?: boolean;
  onChange?: (url: string) => void;
  bucket?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? '');

  const handleChange = (newUrl: string) => {
    setUrl(newUrl);
    onChange?.(newUrl);
  };

  return (
    <>
      <input type="hidden" name={name} value={url} />
      <ImageUpload
        value={url || null}
        onChange={handleChange}
        bucket={bucket ?? "equipment-images"}
        disabled={disabled}
      />
    </>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
}
interface Branch {
  id: string;
  name: string;
}

interface EquipmentData {
  id: string;
  name: string;
  serialNumber: string;
  categoryId: string | null;
  branchId: string | null;
  pricingPlans: Array<{ name: string; durationHours: number; rate: number }>;
  image_url?: string | null;
  specs?: string[] | null;
  ownership_type?: string;
  is_rental?: boolean;
  equipment_type?: string;
  category_name?: string | null;
  purchase_date?: string | null;
  warranty_duration_months?: number | null;
  warranty_expiration_date?: string | null;
  service_cost?: number;
  repair_cost?: number;
  purchase_bill?: string | null;
  description?: string | null;
}

interface EditEquipmentFormProps {
  equipment: EquipmentData;
  categories: Category[];
  branches: Branch[];
  auditLogs?: any[];
  maintenanceRecords?: any[];
}

// ── Inline Image-Only Quick-Upload Panel ─────────────────────────────────────
export function QuickImageUpload({
  equipmentId,
  currentImageUrl,
  equipmentName,
  serialNumber,
  categoryId,
  branchId,
  pricingPlans,
  specs,
  description,
}: {
  equipmentId: string;
  currentImageUrl?: string | null;
  equipmentName: string;
  serialNumber: string;
  categoryId?: string | null;
  branchId?: string | null;
  pricingPlans: any[];
  specs?: string[] | null;
  description?: string | null;
}) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(currentImageUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const fd = new FormData();
      fd.set('name', equipmentName);
      fd.set('serial_number', serialNumber);
      fd.set('category_id', categoryId ?? '');
      fd.set('branch_id', branchId ?? '');
      fd.set('pricing_plans', JSON.stringify(pricingPlans));
      fd.set('image_url', imageUrl);
      fd.set('specs', Array.isArray(specs) ? specs.join(', ') : '');
      fd.set('description', description ?? '');
      await updateEquipment(equipmentId, fd);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save image.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Equipment Image
        </CardTitle>
        <CardDescription className="text-xs">
          Drag &amp; drop or click to upload. Image is saved to Supabase Storage
          automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ImageUpload
          value={imageUrl || null}
          onChange={setImageUrl}
          bucket="equipment-images"
          disabled={saving}
        />

        {error && (
          <p className="text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button
          type="button"
          size="sm"
          className="w-full"
          onClick={handleSave}
          disabled={saving || imageUrl === (currentImageUrl ?? '')}
        >
          {saving ? (
            'Saving…'
          ) : saved ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Image Saved
            </span>
          ) : (
            'Save Image'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

function MaintenanceHistoryTracker({ 
  equipmentId, 
  records, 
  onRecordAdded 
}: { 
  equipmentId: string; 
  records: any[]; 
  onRecordAdded?: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState('SERVICE');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showError, showSuccess } = useNotify();

  const handleAdd = async () => {
    if (!cost || !date) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('equipment_id', equipmentId);
      fd.append('maintenance_type', type);
      fd.append('cost', cost);
      fd.append('date', date);
      fd.append('notes', notes);
      
      const { addMaintenanceRecord } = await import('@/actions/equipment');
      await addMaintenanceRecord(fd);
      
      setAdding(false);
      setCost('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      onRecordAdded?.();
      router.refresh();
      showSuccess('Maintenance record added successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to add maintenance record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4 mt-6">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Maintenance History</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => setAdding(!adding)} disabled={loading}>
          {adding ? 'Cancel' : 'Add Record'}
        </Button>
      </div>

      {adding && (
        <div className="space-y-3 p-3 bg-background rounded-xl border border-border mt-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SERVICE">SERVICE</SelectItem>
                  <SelectItem value="REPAIR">REPAIR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Cost (₹)</Label>
              <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details..." />
            </div>
          </div>
          <Button type="button" size="sm" onClick={handleAdd} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Record'}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {records && records.length > 0 ? (
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {records.map((record) => (
              <div key={record.id} className="flex justify-between items-center bg-background rounded p-2 text-xs border border-border">
                <div>
                  <span className={`font-semibold mr-2 ${record.maintenance_type === 'SERVICE' ? 'text-blue-400' : 'text-amber-400'}`}>{record.maintenance_type}</span>
                  <span className="text-muted-foreground">{new Date(record.date).toLocaleDateString()}</span>
                  {record.notes && <p className="text-muted-foreground mt-1">{record.notes}</p>}
                </div>
                <div className="font-semibold">₹{record.cost}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted-foreground italic py-2">No maintenance records found.</div>
        )}
      </div>
    </div>
  );
}

// ── Full Edit Dialog ──────────────────────────────────────────────────────────
export function EditEquipmentDialog({
  equipment,
  categories,
  branches,
  auditLogs = [],
  maintenanceRecords = [],
}: EditEquipmentFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isLoading) {
        setOpen(val);
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-3.5 w-3.5" />
          Edit Equipment
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isLoading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
          <DialogDescription>
            Update details for <strong>{equipment.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <EditEquipmentFormContent
            equipment={equipment}
            categories={categories}
            branches={branches}
            auditLogs={auditLogs}
            maintenanceRecords={maintenanceRecords}
            onClose={() => setOpen(false)}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface EditEquipmentFormContentProps extends EditEquipmentFormProps {
  onClose: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

function EditEquipmentFormContent({
  equipment,
  categories,
  branches,
  auditLogs = [],
  maintenanceRecords = [],
  onClose,
  isLoading,
  setIsLoading,
}: EditEquipmentFormContentProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { showError, showInfo } = useNotify();

  const [maintRecords, setMaintRecords] = useState<any[]>(maintenanceRecords);
  const [logs, setLogs] = useState<any[]>(auditLogs);
  const [fetchingData, setFetchingData] = useState(false);

  const refreshData = async () => {
    try {
      const fetchedMaint = await getMaintenanceRecords(equipment.id);
      setMaintRecords(fetchedMaint);
    } catch (err) {
      console.error('Failed to refresh maintenance records:', err);
    }
  };

  useEffect(() => {
    let active = true;
    async function loadData() {
      setFetchingData(true);
      try {
        const [fetchedMaint, fetchedLogs] = await Promise.all([
          getMaintenanceRecords(equipment.id).catch(() => []),
          getEquipmentAuditLog(equipment.id).catch(() => []),
        ]);
        if (active) {
          setMaintRecords(fetchedMaint);
          setLogs(fetchedLogs);
        }
      } catch (err) {
        console.error('Failed to load maintenance data:', err);
      } finally {
        if (active) {
          setFetchingData(false);
        }
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [equipment.id]);

  const [selectedCategory, setSelectedCategory] = useState(
    equipment.categoryId ?? ''
  );
  const [selectedBranch, setSelectedBranch] = useState(
    equipment.branchId ?? ''
  );
  const [ownershipType, setOwnershipType] = useState(
    equipment.ownership_type ?? 'IN_HOUSE'
  );
  const [isRental, setIsRental] = useState(
    equipment.is_rental ?? true
  );
  const [classification, setClassification] = useState(() => {
    if (equipment.ownership_type === 'RENTAL') {
      return 'RENTAL';
    }
    if (equipment.ownership_type === 'IN_HOUSE' && equipment.is_rental) {
      return 'IN_HOUSE_RENTAL';
    }
    return 'IN_HOUSE';
  });
  const [categoryName, setCategoryName] = useState(
    equipment.category_name ?? ''
  );

  // Plans manager state inside modal
  const [plans, setPlans] = useState<Array<{ name: string; durationHours: number; rate: number }>>(() => {
    return equipment.pricingPlans || [];
  });

  const [baseHourlyRate, setBaseHourlyRate] = useState<string>(() => {
    const hourlyPlan = equipment.pricingPlans?.find((p) => p.name.toLowerCase() === 'hourly');
    return hourlyPlan ? String(hourlyPlan.rate) : '';
  });

  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('');
  const [newPlanRate, setNewPlanRate] = useState('');

  // Inline editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanDuration, setEditPlanDuration] = useState('');
  const [editPlanRate, setEditPlanRate] = useState('');

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBaseHourlyRate(val);
    const rate = parseFloat(val);
    if (!isNaN(rate) && rate > 0) {
      setPlans([
        { name: 'Hourly', durationHours: 1, rate: rate },
        { name: 'Daily', durationHours: 8, rate: rate * 8 },
        { name: 'Weekly', durationHours: 56, rate: rate * 8 * 7 },
      ]);
    } else {
      setPlans([]);
    }
  };

  const handleAddPlan = () => {
    if (!newPlanName || !newPlanDuration || !newPlanRate) {
      showInfo('Please fill out all pricing plan fields');
      return;
    }
    const duration = parseInt(newPlanDuration, 10);
    const rate = parseFloat(newPlanRate);

    if (isNaN(duration) || duration <= 0) {
      showError('Duration must be a positive number of hours');
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      showError('Rate must be a positive number');
      return;
    }
    if (plans.some((p) => p.name.toLowerCase() === newPlanName.toLowerCase())) {
      showError('A plan with this name already exists');
      return;
    }

    setPlans((prev) => [...prev, { name: newPlanName, durationHours: duration, rate }]);
    setNewPlanName('');
    setNewPlanDuration('');
    setNewPlanRate('');
  };

  const handleSaveEditPlan = (index: number) => {
    if (!editPlanName || !editPlanDuration || !editPlanRate) {
      showInfo('Please fill out all pricing plan fields');
      return;
    }
    const duration = parseInt(editPlanDuration, 10);
    const rate = parseFloat(editPlanRate);

    if (isNaN(duration) || duration <= 0) {
      showError('Duration must be a positive number of hours');
      return;
    }
    if (isNaN(rate) || rate <= 0) {
      showError('Rate must be a positive number');
      return;
    }
    if (plans.some((p, idx) => idx !== index && p.name.toLowerCase() === editPlanName.toLowerCase())) {
      showError('A plan with this name already exists');
      return;
    }

    setPlans((prev) => {
      const next = [...prev];
      next[index] = { name: editPlanName, durationHours: duration, rate };
      return next;
    });
    setEditingIndex(null);
  };

  const handleRemovePlan = (nameToRemove: string) => {
    setPlans((prev) => prev.filter((p) => p.name !== nameToRemove));
    if (editingIndex !== null && plans[editingIndex]?.name === nameToRemove) {
      setEditingIndex(null);
    }
  };

  const handleLoadDefaults = () => {
    setBaseHourlyRate('150');
    setPlans([
      { name: 'Hourly', durationHours: 1, rate: 150 },
      { name: 'Daily', durationHours: 8, rate: 1200 },
      { name: 'Weekly', durationHours: 56, rate: 8400 },
    ]);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (plans.length === 0) {
      setError('Please configure at least one pricing plan');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('category_id', selectedCategory);
      formData.set('branch_id', selectedBranch);
      formData.set('ownership_type', ownershipType);
      formData.set('is_rental', isRental.toString());
      formData.set('category_name', categoryName);
      formData.set('pricing_plans', JSON.stringify(plans));

      await updateEquipment(equipment.id, formData);
      onClose();
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update equipment');
    } finally {
      setIsLoading(false);
    }
  }

  const specsString = Array.isArray(equipment.specs)
    ? equipment.specs.join(', ')
    : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Hidden input to pass pricing plans */}
      <input type="hidden" name="pricing_plans" value={JSON.stringify(plans)} />

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="edit-name">Equipment Name *</Label>
        <Input
          id="edit-name"
          name="name"
          defaultValue={equipment.name}
          required
          disabled={isLoading}
        />
      </div>

      {/* Serial */}
      <div className="space-y-2">
        <Label htmlFor="edit-serial">Serial Number *</Label>
        <Input
          id="edit-serial"
          name="serial_number"
          defaultValue={equipment.serialNumber}
          required
          disabled={isLoading}
        />
      </div>

      {/* Category Name */}
      <div className="space-y-2">
        <Label htmlFor="edit-category-name">Category Name *</Label>
        <Select
          value={categoryName}
          onValueChange={setCategoryName}
          required
          disabled={isLoading}
        >
          <SelectTrigger id="edit-category-name">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="category_name" value={categoryName} />
      </div>

      {/* Branch & Ownership */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Branch *</Label>
          <Select
            value={selectedBranch}
            onValueChange={setSelectedBranch}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-classification">Classification *</Label>
          <Select
            value={classification}
            onValueChange={(val) => {
              setClassification(val);
              if (val === 'IN_HOUSE') {
                setOwnershipType('IN_HOUSE');
                setIsRental(false);
              } else if (val === 'IN_HOUSE_RENTAL') {
                setOwnershipType('IN_HOUSE');
                setIsRental(true);
              } else if (val === 'RENTAL') {
                setOwnershipType('RENTAL');
                setIsRental(true);
              }
            }}
            disabled={isLoading}
          >
            <SelectTrigger id="edit-classification">
              <SelectValue placeholder="Select classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IN_HOUSE">In-House</SelectItem>
              <SelectItem value="IN_HOUSE_RENTAL">In-House Rental (Internal Use)</SelectItem>
              <SelectItem value="RENTAL">External Rental</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Is Rental Toggle or explanatory text */}
      {classification === 'RENTAL' ? (
        <div className="space-y-2">
          <Label htmlFor="edit-is-rental-toggle">Is Rental (External Availability) *</Label>
          <Select
            value={isRental ? 'true' : 'false'}
            onValueChange={(val) => setIsRental(val === 'true')}
            disabled={isLoading}
          >
            <SelectTrigger id="edit-is-rental-toggle">
              <SelectValue placeholder="Is Rental" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-2 flex flex-col justify-end pb-2">
          <p className="text-xs text-muted-foreground italic">
            {classification === 'IN_HOUSE'
              ? 'Staff use only. Hidden from public portals.'
              : 'Studio use only. Displayed in Studio Space booking (/studiospace).'}
          </p>
        </div>
      )}

      {/* Pricing Plans Manager */}
      <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pricing Plans *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLoadDefaults}
            className="gap-1.5 text-xs"
            disabled={isLoading}
          >
            <RefreshCw className="h-3 w-3" /> Reset to Defaults
          </Button>
        </div>

        <div className="space-y-2 border-b border-border/60 pb-3 mb-2">
          <Label htmlFor="edit-base-hourly-rate" className="text-xs font-semibold text-foreground">
            Base Hourly Rate (₹/hr) *
          </Label>
          <Input
            id="edit-base-hourly-rate"
            type="number"
            placeholder="e.g. 150"
            value={baseHourlyRate}
            onChange={handleHourlyRateChange}
            required
            disabled={isLoading}
            className="h-9 bg-background"
          />
          <p className="text-[10px] text-muted-foreground">
            Type an hourly rate to automatically calculate Daily (8 hours) and Weekly (56 hours) plans.
          </p>
        </div>

        {/* List of active plans */}
        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
          {plans.map((p, idx) => {
            const isEditing = editingIndex === idx;
            if (isEditing) {
              return (
                <div
                  key={p.name}
                  className="flex flex-col gap-2 p-2.5 rounded-xl border border-warning/30 bg-muted/40 text-sm"
                >
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Name</Label>
                      <Input
                        value={editPlanName}
                        onChange={(e) => setEditPlanName(e.target.value)}
                        disabled={isLoading}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Duration (h)</Label>
                      <Input
                        type="number"
                        value={editPlanDuration}
                        onChange={(e) => setEditPlanDuration(e.target.value)}
                        disabled={isLoading}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">Rate (₹)</Label>
                      <Input
                        type="number"
                        value={editPlanRate}
                        onChange={(e) => setEditPlanRate(e.target.value)}
                        disabled={isLoading}
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1 border-t border-border/50">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setEditingIndex(null)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs text-warning hover:bg-warning/10"
                      onClick={() => handleSaveEditPlan(idx)}
                      disabled={isLoading}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={p.name}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground min-w-[80px]">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Duration: {p.durationHours === 8 ? '1 Day (8h)' : p.durationHours === 56 ? '1 Week (56h)' : `${p.durationHours}h`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary mr-2">₹{p.rate}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingIndex(idx);
                      setEditPlanName(p.name);
                      setEditPlanDuration(String(p.durationHours));
                      setEditPlanRate(String(p.rate));
                    }}
                    className="h-7 w-7 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                    disabled={isLoading}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePlan(p.name)}
                    className="h-7 w-7 p-0 text-red-400 hover:bg-red-500/10 hover:text-red-500"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </Button>
                </div>
              </div>
            );
          })}
          {plans.length === 0 && (
            <p className="text-xs text-muted-foreground italic py-2">No pricing plans defined. Create one below.</p>
          )}
        </div>

        {/* Dynamic plan creator */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
          <div className="space-y-1">
            <Label htmlFor="edit-plan-name" className="text-[10px] text-muted-foreground">Plan Name</Label>
            <Input
              id="edit-plan-name"
              placeholder="e.g. Weekend"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              disabled={isLoading}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-plan-duration" className="text-[10px] text-muted-foreground">Duration (Hours)</Label>
            <Input
              id="edit-plan-duration"
              type="number"
              placeholder="e.g. 48"
              value={newPlanDuration}
              onChange={(e) => setNewPlanDuration(e.target.value)}
              disabled={isLoading}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="edit-plan-rate" className="text-[10px] text-muted-foreground">Rate (₹)</Label>
            <div className="flex items-center gap-1.5">
              <Input
                id="edit-plan-rate"
                type="number"
                placeholder="4000"
                value={newPlanRate}
                onChange={(e) => setNewPlanRate(e.target.value)}
                disabled={isLoading}
                className="h-8 text-xs flex-1"
              />
              <Button
                type="button"
                onClick={handleAddPlan}
                className="h-8 w-8 p-0"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="space-y-2">
        <Label>Equipment Image</Label>
        <p className="text-xs text-muted-foreground">
          Drag &amp; drop or click to upload — saved directly to Supabase
          Storage.
        </p>
        <ImageUploadField
          name="image_url"
          defaultValue={equipment.image_url}
          disabled={isLoading}
          bucket="equipment-images"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-purchase-date">Purchase Date</Label>
          <Input
            id="edit-purchase-date"
            name="purchase_date"
            type="date"
            defaultValue={equipment.purchase_date?.split('T')[0] ?? ''}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-warranty-duration">Warranty Duration (Months)</Label>
          <Input
            id="edit-warranty-duration"
            name="warranty_duration_months"
            type="number"
            min="0"
            defaultValue={equipment.warranty_duration_months ?? ''}
            disabled={isLoading}
            onChange={(e) => {
              const months = parseInt(e.target.value, 10);
              const purchaseDateInput = document.getElementById('edit-purchase-date') as HTMLInputElement;
              const expDateInput = document.getElementById('edit-warranty-expiration') as HTMLInputElement;
              if (!isNaN(months) && purchaseDateInput?.value && expDateInput) {
                const pd = new Date(purchaseDateInput.value);
                pd.setMonth(pd.getMonth() + months);
                expDateInput.value = pd.toISOString().split('T')[0];
              }
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-warranty-expiration">Warranty Expiration Date</Label>
          <Input
            id="edit-warranty-expiration"
            name="warranty_expiration_date"
            type="date"
            defaultValue={equipment.warranty_expiration_date?.split('T')[0] ?? ''}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label>Purchase Bill</Label>
          <ImageUploadField 
            name="purchase_bill" 
            defaultValue={equipment.purchase_bill}
            disabled={isLoading} 
            bucket="equipment-images" 
          />
        </div>
      </div>

      <MaintenanceHistoryTracker 
        equipmentId={equipment.id} 
        records={maintRecords} 
        onRecordAdded={refreshData}
      />

      {/* Specs */}
      <div className="space-y-2">
        <Label htmlFor="edit-specs">Specifications</Label>
        <Input
          id="edit-specs"
          name="specs"
          defaultValue={specsString}
          placeholder="33MP, 4K 60fps, IBIS"
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated list of key features.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Textarea
          id="edit-description"
          name="description"
          defaultValue={equipment.description ?? ''}
          placeholder="Additional details…"
          rows={3}
          disabled={isLoading}
        />
      </div>

      {/* Audit History */}
      {logs && logs.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/60">
          <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Audit History</Label>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {logs.map((log: any) => (
              <div key={log.id} className="text-xs bg-muted/30 p-3 rounded-lg border border-border/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-foreground">
                    {log.action === 'CREATED' && <span className="text-emerald-500">Created</span>}
                    {log.action === 'UPDATED' && <span className="text-blue-500">Updated</span>}
                    {log.action === 'DELETED' && <span className="text-red-500">Deleted</span>}
                    {' by '}{log.user?.fullName || log.user?.email || 'Unknown'}
                  </span>
                  <span className="text-muted-foreground">{new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                {log.notes && <p className="text-muted-foreground mt-1">{log.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2 mt-4 border-t border-border/60">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Saving…' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
