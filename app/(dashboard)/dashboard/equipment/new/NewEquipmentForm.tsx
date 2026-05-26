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
import { Loader2, Plus, Trash2, RefreshCw } from 'lucide-react';

interface NewEquipmentFormProps {
  categories: Array<{ id: string; name: string }>;
  branches: Array<{ id: string; name: string }>;
}

// ── ImageUploadField ──────────────────────────────────────────────────────────
function ImageUploadField({
  name,
  defaultValue,
  disabled,
}: {
  name: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? '');
  return (
    <>
      <input type="hidden" name={name} value={url} />
      <ImageUpload
        value={url || null}
        onChange={setUrl}
        bucket="equipment-images"
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
  const { showError, showInfo, showSuccess } = useNotify();

  // Pricing Plans state
  const [plans, setPlans] = useState<Array<{ name: string; durationHours: number; rate: number }>>([
    { name: 'Hourly', durationHours: 1, rate: 150 },
    { name: 'Daily', durationHours: 24, rate: 1500 },
    { name: 'Weekly', durationHours: 168, rate: 8500 },
  ]);

  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('');
  const [newPlanRate, setNewPlanRate] = useState('');

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

  const handleRemovePlan = (nameToRemove: string) => {
    setPlans((prev) => prev.filter((p) => p.name !== nameToRemove));
  };

  const handleLoadDefaults = () => {
    setPlans([
      { name: 'Hourly', durationHours: 1, rate: 150 },
      { name: 'Daily', durationHours: 24, rate: 1500 },
      { name: 'Weekly', durationHours: 168, rate: 8500 },
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

            {/* List of active plans */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {plans.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-foreground min-w-[80px]">{p.name}</span>
                    <span className="text-xs text-muted-foreground">Duration: {p.durationHours}h</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-primary">₹{p.rate}</span>
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
              ))}
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
            <ImageUploadField name="image_url" disabled={isLoading} />
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
