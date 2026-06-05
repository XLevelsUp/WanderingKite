'use client';

import { useState } from 'react';
import { createEquipment } from '@/actions/equipment';
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
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { useNotify } from '@/hooks/useNotify';
import { Loader2, Plus, Trash2, RefreshCw, Pencil } from 'lucide-react';

interface NewEquipmentFormProps {
  categories: Array<{ id: string; name: string }>;
  branches: Array<{ id: string; name: string }>;
}

// ── ImageUploadField ──────────────────────────────────────────────────────────
function ImageUploadField({
  name,
  defaultValue,
  disabled,
  bucket,
}: {
  name: string;
  defaultValue?: string;
  disabled?: boolean;
  bucket?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? '');
  return (
    <>
      <input type="hidden" name={name} value={url} />
      <ImageUpload
        value={url || null}
        onChange={setUrl}
        bucket={bucket ?? "equipment-images"}
        disabled={disabled}
      />
    </>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────
export function NewEquipmentForm({
  categories,
  branches,
}: NewEquipmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [ownershipType, setOwnershipType] = useState('IN_HOUSE');
  const { showError, showInfo, showSuccess } = useNotify();

  // Pricing Plans state
  const [baseHourlyRate, setBaseHourlyRate] = useState<string>('150');
  const [plans, setPlans] = useState<Array<{ name: string; durationHours: number; rate: number }>>([
    { name: 'Hourly', durationHours: 1, rate: 150 },
    { name: 'Daily', durationHours: 8, rate: 1200 },
    { name: 'Weekly', durationHours: 56, rate: 8400 },
  ]);

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
      showError('Please configure at least one pricing plan');
      return;
    }
    setIsLoading(true);
    let timeoutId: NodeJS.Timeout;

    try {
      timeoutId = setTimeout(() => {
        showInfo(
          'This is taking longer than usual. Please check your connection.'
        );
      }, 8000);

      const formData = new FormData(e.currentTarget);
      formData.set('category_id', selectedCategory);
      formData.set('branch_id', selectedBranch);
      formData.set('ownership_type', ownershipType);
      formData.set('pricing_plans', JSON.stringify(plans));

      await createEquipment(formData);
      showSuccess('Equipment created successfully');
      router.push('/dashboard/equipment');
      router.refresh();
    } catch (err: any) {
      showError(err.message || 'Failed to create equipment');
    } finally {
      clearTimeout(timeoutId!);
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="pricing_plans" value={JSON.stringify(plans)} />
      <Card>
        <CardHeader>
          <CardTitle>Equipment Details</CardTitle>
          <CardDescription>
            Enter the details for the new equipment item
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Equipment Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Canon EOS R5"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serial_number">Serial Number *</Label>
            <Input
              id="serial_number"
              name="serial_number"
              placeholder="e.g., SN123456789"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              required
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch *</Label>
            <Select
              value={selectedBranch}
              onValueChange={setSelectedBranch}
              required
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownership_type">Ownership Type *</Label>
            <Select
              value={ownershipType}
              onValueChange={setOwnershipType}
              required
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ownership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_HOUSE">In-House</SelectItem>
                <SelectItem value="RENTAL">Rental</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              <Label htmlFor="base-hourly-rate" className="text-xs font-semibold text-foreground">
                Base Hourly Rate (₹/hr) *
              </Label>
              <Input
                id="base-hourly-rate"
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
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
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
                      <span className="text-xs text-muted-foreground">Duration: {p.durationHours}h</span>
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
                <Label htmlFor="plan-name" className="text-[10px] text-muted-foreground">Plan Name</Label>
                <Input
                  id="plan-name"
                  placeholder="e.g. Weekend"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  disabled={isLoading}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-duration" className="text-[10px] text-muted-foreground">Duration (Hours)</Label>
                <Input
                  id="plan-duration"
                  type="number"
                  placeholder="e.g. 48"
                  value={newPlanDuration}
                  onChange={(e) => setNewPlanDuration(e.target.value)}
                  disabled={isLoading}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="plan-rate" className="text-[10px] text-muted-foreground">Rate (₹)</Label>
                <div className="flex items-center gap-1.5">
                  <Input
                    id="plan-rate"
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

          <div className="space-y-2">
            <Label>Equipment Image</Label>
            <p className="text-xs text-muted-foreground">
              Drag &amp; drop an image, or click to browse. Uploaded
              automatically to Supabase Storage.
            </p>
            <ImageUploadField name="image_url" disabled={isLoading} bucket="equipment-images" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                name="purchase_date"
                type="date"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_duration_months">Warranty Duration (Months)</Label>
              <Input
                id="warranty_duration_months"
                name="warranty_duration_months"
                type="number"
                min="0"
                placeholder="e.g. 12"
                disabled={isLoading}
                onChange={(e) => {
                  const months = parseInt(e.target.value, 10);
                  const purchaseDateInput = document.getElementById('purchase_date') as HTMLInputElement;
                  const expDateInput = document.getElementById('warranty_expiration_date') as HTMLInputElement;
                  if (!isNaN(months) && purchaseDateInput?.value && expDateInput) {
                    const pd = new Date(purchaseDateInput.value);
                    pd.setMonth(pd.getMonth() + months);
                    expDateInput.value = pd.toISOString().split('T')[0];
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_expiration_date">Warranty Expiration Date</Label>
              <Input
                id="warranty_expiration_date"
                name="warranty_expiration_date"
                type="date"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Purchase Bill</Label>
              <ImageUploadField name="purchase_bill" disabled={isLoading} bucket="equipment-images" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_cost">Service Cost (₹)</Label>
              <Input
                id="service_cost"
                name="service_cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repair_cost">Repair Cost (₹)</Label>
              <Input
                id="repair_cost"
                name="repair_cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specs">Specifications</Label>
            <Input
              id="specs"
              name="specs"
              placeholder="33MP Full-Frame, 4K 60fps, IBIS"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of key features.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Additional details about this equipment..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Creating...' : 'Create Equipment'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
