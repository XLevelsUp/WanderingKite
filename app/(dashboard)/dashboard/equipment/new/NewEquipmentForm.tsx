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
import { Loader2 } from 'lucide-react';
import { PricingPlansManager, type PricingPlan } from '@/components/dashboard/PricingPlansManager';

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
  const [isRental, setIsRental] = useState(false);
  const [isStudioSpace, setIsStudioSpace] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const { showError, showInfo, showSuccess } = useNotify();

  // Pricing Plans state (External Rental)
  const [plans, setPlans] = useState<PricingPlan[]>([
    { name: 'Hourly', durationHours: 1, rate: 150 },
    { name: 'Daily', durationHours: 8, rate: 1200 },
    { name: 'Weekly', durationHours: 56, rate: 8400 },
  ]);

  // Pricing Plans state (Studio Space)
  const [studioPlans, setStudioPlans] = useState<PricingPlan[]>([
    { name: 'Hourly', durationHours: 1, rate: 150 },
    { name: 'Daily', durationHours: 8, rate: 1200 },
    { name: 'Weekly', durationHours: 56, rate: 8400 },
  ]);

  const handleCategoryChange = (valName: string) => {
    setCategoryName(valName);
    const matched = categories.find((c) => c.name === valName);
    setSelectedCategory(matched ? matched.id : '');
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isRental && plans.length === 0) {
      showError('Please configure at least one pricing plan for External Rental');
      return;
    }
    if (isStudioSpace && studioPlans.length === 0) {
      showError('Please configure at least one pricing plan for Studio Space');
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
      formData.set('is_studio_space', isStudioSpace.toString());
      formData.set('is_rental', isRental.toString());
      formData.set('category_name', categoryName);
      formData.set('pricing_plans', JSON.stringify(plans));
      formData.set('studio_pricing_plans', JSON.stringify(studioPlans));

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
      <input type="hidden" name="studio_pricing_plans" value={JSON.stringify(studioPlans)} />
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
            <Label htmlFor="category_name">Category Name *</Label>
            <Select
              value={categoryName}
              onValueChange={handleCategoryChange}
              required
              disabled={isLoading}
            >
              <SelectTrigger id="category_name">
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

          {/* Conditional Studio Space Pricing */}
          {isStudioSpace && (
            <PricingPlansManager
              title="Studio Space Pricing Plans"
              description="Configure pricing structure when rented inside the studio"
              initialPlans={studioPlans}
              onChange={setStudioPlans}
              disabled={isLoading}
            />
          )}

          {/* Conditional External Rental Pricing */}
          {isRental && (
            <PricingPlansManager
              title="External Rental Pricing Plans"
              description="Configure pricing structure when rented externally"
              initialPlans={plans}
              onChange={setPlans}
              disabled={isLoading}
            />
          )}

          <div className="space-y-2">
            <Label>Equipment Image</Label>
            <p className="text-xs text-muted-foreground">
              Drag &amp; drop an image, or click to browse. Uploaded
              automatically to Supabase Storage.
            </p>
            <ImageUploadField name="image_url" disabled={isLoading} bucket="equipment-images" />
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4">
            <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Management & Maintenance</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch_id">Branch *</Label>
                <Select
                  value={selectedBranch}
                  onValueChange={setSelectedBranch}
                  required
                  disabled={isLoading}
                >
                  <SelectTrigger id="branch_id">
                    <SelectValue placeholder="Select a branch" />
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
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warranty_months">Warranty Period (Months)</Label>
                <Input
                  id="warranty_months"
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
