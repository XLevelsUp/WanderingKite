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
import { PricingPlansManager, type PricingPlan } from '@/components/dashboard/PricingPlansManager';
import { logger } from '@/lib/logger';

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
  studioPricingPlans?: Array<{ name: string; durationHours: number; rate: number }> | null;
  image_url?: string | null;
  specs?: string[] | null;
  is_studio_space?: boolean;
  is_rental?: boolean;
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
  studioPricingPlans,
  specs,
  description,
  isStudioSpace,
  isRental,
}: {
  equipmentId: string;
  currentImageUrl?: string | null;
  equipmentName: string;
  serialNumber: string;
  categoryId?: string | null;
  branchId?: string | null;
  pricingPlans: any[];
  studioPricingPlans: any[];
  specs?: string[] | null;
  description?: string | null;
  isStudioSpace?: boolean;
  isRental?: boolean;
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
      fd.set('studio_pricing_plans', JSON.stringify(studioPricingPlans || []));
      fd.set('image_url', imageUrl);
      fd.set('specs', Array.isArray(specs) ? specs.join(', ') : '');
      fd.set('description', description ?? '');
      fd.set('is_studio_space', String(isStudioSpace ?? false));
      fd.set('is_rental', String(isRental ?? false));
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
              <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
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
      logger.error('Failed to refresh maintenance records:', err);
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
        logger.error('Failed to load maintenance data:', err);
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
  const [isRental, setIsRental] = useState(
    equipment.is_rental ?? false
  );
  const [isStudioSpace, setIsStudioSpace] = useState(
    equipment.is_studio_space ?? false
  );
  const [categoryName, setCategoryName] = useState(
    equipment.category_name ?? ''
  );

  // Plans manager state inside modal
  const [plans, setPlans] = useState<PricingPlan[]>(() => {
    return (equipment.pricingPlans as PricingPlan[]) || [];
  });

  const [studioPlans, setStudioPlans] = useState<PricingPlan[]>(() => {
    return (equipment.studioPricingPlans as PricingPlan[]) || [];
  });

  const handleCategoryChange = (valName: string) => {
    setCategoryName(valName);
    const matched = categories.find((c) => c.name === valName);
    setSelectedCategory(matched ? matched.id : '');
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isRental && plans.length === 0) {
      setError('Please configure at least one pricing plan for External Rental');
      return;
    }
    if (isStudioSpace && studioPlans.length === 0) {
      setError('Please configure at least one pricing plan for Studio Space');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('category_id', selectedCategory);
      formData.set('branch_id', selectedBranch);
      formData.set('is_studio_space', isStudioSpace.toString());
      formData.set('is_rental', isRental.toString());
      formData.set('category_name', categoryName);
      formData.set('pricing_plans', JSON.stringify(plans));
      formData.set('studio_pricing_plans', JSON.stringify(studioPlans));

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
      <input type="hidden" name="studio_pricing_plans" value={JSON.stringify(studioPlans)} />

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
          onValueChange={handleCategoryChange}
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
      </div>

      {/* Visibility Checklist */}
      <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
        <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Visibility & Availability</Label>
        <div className="space-y-4 pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isStudioSpace}
              onChange={(e) => setIsStudioSpace(e.target.checked)}
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/50 cursor-pointer disabled:opacity-40"
            />
            <div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Available in Studio Space
              </span>
              <p className="text-xs text-muted-foreground">
                Allows this equipment to be selected/booked inside the Studio Space booking (/studiospace).
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={isRental}
              onChange={(e) => setIsRental(e.target.checked)}
              disabled={isLoading}
              className="mt-1 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/50 cursor-pointer disabled:opacity-40"
            />
            <div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Available for External Rental
              </span>
              <p className="text-xs text-muted-foreground">
                Makes this equipment visible and cartable on the public rentals catalog (/rentals).
              </p>
            </div>
          </label>
        </div>
        <div className="text-xs text-muted-foreground italic mt-2 border-t border-border/40 pt-2">
          {!isStudioSpace && !isRental && 'Staff use only. Hidden from public portals (ERP system only).'}
          {isStudioSpace && !isRental && 'Studio use only. Displayed in Studio Space booking (/studiospace).'}
          {isStudioSpace && isRental && 'Displayed on both /studiospace and /rentals pages.'}
          {!isStudioSpace && isRental && 'Displayed on /rentals page only.'}
        </div>
      </div>

      {/* Conditional Pricing Sections */}
      {(isStudioSpace || isRental) && (
        <div className={`grid gap-6 w-full ${isStudioSpace && isRental ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {isStudioSpace && (
            <PricingPlansManager
              title="Studio Pricing"
              description="Rates for inside the studio."
              initialPlans={studioPlans}
              onChange={setStudioPlans}
              disabled={isLoading}
            />
          )}

          {isRental && (
            <PricingPlansManager
              title="External Pricing"
              description="Rates for taken outside."
              initialPlans={plans}
              onChange={setPlans}
              disabled={isLoading}
            />
          )}
        </div>
      )}

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
