'use client';

import { useState } from 'react';
import { updateEquipment, getCategories, getBranches } from '@/actions/equipment';
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
import { Pencil, CheckCircle2 } from 'lucide-react';

// ── ImageUploadField ──────────────────────────────────────────────────────────
function ImageUploadField({
  name,
  defaultValue,
  disabled,
  onChange,
}: {
  name: string;
  defaultValue?: string | null;
  disabled?: boolean;
  onChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(defaultValue ?? '');

  const handleChange = (newUrl: string) => {
    setUrl(newUrl);
    onChange?.(newUrl);
  };

  return (
    <>
      <input type='hidden' name={name} value={url} />
      <ImageUpload
        value={url || null}
        onChange={handleChange}
        bucket='equipment-images'
        disabled={disabled}
      />
    </>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Category { id: string; name: string }
interface Branch   { id: string; name: string }

interface EquipmentData {
  id: string;
  name: string;
  serialNumber: string;
  categoryId: string | null;
  branchId: string | null;
  rental_price: number;
  weekly_price?: number | null;
  image_url?: string | null;
  specs?: string[] | null;
  description?: string | null;
}

interface EditEquipmentFormProps {
  equipment: EquipmentData;
  categories: Category[];
  branches: Branch[];
}

// ── Inline Image-Only Quick-Upload Panel ─────────────────────────────────────
// This panel is shown on the detail page for a fast, focused image-only update.
export function QuickImageUpload({
  equipmentId,
  currentImageUrl,
  equipmentName,
  serialNumber,
  categoryId,
  branchId,
  rentalPrice,
  weeklyPrice,
  specs,
  description,
}: {
  equipmentId: string;
  currentImageUrl?: string | null;
  equipmentName: string;
  serialNumber: string;
  categoryId?: string | null;
  branchId?: string | null;
  rentalPrice: number;
  weeklyPrice?: number | null;
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
      fd.set('rental_price', String(rentalPrice));
      fd.set('weekly_price', String(weeklyPrice ?? 0));
      fd.set('image_url', imageUrl);
      fd.set('specs', Array.isArray(specs) ? specs.join(', ') : '');
      fd.set('description', description ?? '');
      await updateEquipment(equipmentId, fd);
      setSaved(true);
      router.refresh();
      // Reset "Saved" indicator after 3s
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message ?? 'Failed to save image.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
          Equipment Image
        </CardTitle>
        <CardDescription className='text-xs'>
          Drag &amp; drop or click to upload. Image is saved to Supabase Storage automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <ImageUpload
          value={imageUrl || null}
          onChange={setImageUrl}
          bucket='equipment-images'
          disabled={saving}
        />

        {error && (
          <p className='text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2 rounded-lg'>
            {error}
          </p>
        )}

        <Button
          type='button'
          size='sm'
          className='w-full'
          onClick={handleSave}
          disabled={saving || imageUrl === (currentImageUrl ?? '')}
        >
          {saving ? (
            'Saving…'
          ) : saved ? (
            <span className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4' /> Image Saved
            </span>
          ) : (
            'Save Image'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Full Edit Dialog ──────────────────────────────────────────────────────────
export function EditEquipmentDialog({
  equipment,
  categories,
  branches,
}: EditEquipmentFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(equipment.categoryId ?? '');
  const [selectedBranch, setSelectedBranch]     = useState(equipment.branchId ?? '');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('category_id', selectedCategory);
      formData.set('branch_id', selectedBranch);

      await updateEquipment(equipment.id, formData);
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Pencil className='h-3.5 w-3.5' />
          Edit Equipment
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
          <DialogDescription>
            Update details for <strong>{equipment.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 mt-2'>
          {error && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm'>
              {error}
            </div>
          )}

          {/* Name */}
          <div className='space-y-2'>
            <Label htmlFor='edit-name'>Equipment Name *</Label>
            <Input
              id='edit-name'
              name='name'
              defaultValue={equipment.name}
              required
              disabled={isLoading}
            />
          </div>

          {/* Serial */}
          <div className='space-y-2'>
            <Label htmlFor='edit-serial'>Serial Number *</Label>
            <Input
              id='edit-serial'
              name='serial_number'
              defaultValue={equipment.serialNumber}
              required
              disabled={isLoading}
            />
          </div>

          {/* Category & Branch */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label>Category *</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Branch *</Label>
              <Select
                value={selectedBranch}
                onValueChange={setSelectedBranch}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select branch' />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pricing */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='edit-rental'>Daily Rate (₹) *</Label>
              <Input
                id='edit-rental'
                name='rental_price'
                type='number'
                step='0.01'
                min='0'
                defaultValue={equipment.rental_price}
                required
                disabled={isLoading}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='edit-weekly'>Weekly Rate (₹)</Label>
              <Input
                id='edit-weekly'
                name='weekly_price'
                type='number'
                step='0.01'
                min='0'
                defaultValue={equipment.weekly_price ?? 0}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Image */}
          <div className='space-y-2'>
            <Label>Equipment Image</Label>
            <p className='text-xs text-muted-foreground'>
              Drag &amp; drop or click to upload — saved directly to Supabase Storage.
            </p>
            <ImageUploadField
              name='image_url'
              defaultValue={equipment.image_url}
              disabled={isLoading}
            />
          </div>

          {/* Specs */}
          <div className='space-y-2'>
            <Label htmlFor='edit-specs'>Specifications</Label>
            <Input
              id='edit-specs'
              name='specs'
              defaultValue={specsString}
              placeholder='33MP, 4K 60fps, IBIS'
              disabled={isLoading}
            />
            <p className='text-xs text-muted-foreground'>Comma-separated list of key features.</p>
          </div>

          {/* Description */}
          <div className='space-y-2'>
            <Label htmlFor='edit-description'>Description</Label>
            <Textarea
              id='edit-description'
              name='description'
              defaultValue={equipment.description ?? ''}
              placeholder='Additional details…'
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className='flex gap-3 pt-2'>
            <Button type='submit' disabled={isLoading} className='flex-1'>
              {isLoading ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
