"use client";

import { useState } from "react";
import { createEquipment } from "@/actions/equipment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { useNotify } from "@/hooks/useNotify";
import { Loader2 } from "lucide-react";

interface NewEquipmentFormProps {
  categories: Array<{ id: string; name: string }>;
  branches: Array<{ id: string; name: string }>;
}

// ── ImageUploadField ──────────────────────────────────────────────────────────
// Keeps the public URL in state and syncs it to a hidden <input> so FormData
// picks it up on submit — no changes needed to the server action.
function ImageUploadField({
  name,
  defaultValue,
  disabled,
}: {
  name: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
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
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const { showError, showInfo, showSuccess } = useNotify();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    let timeoutId: NodeJS.Timeout;

    try {
      timeoutId = setTimeout(() => {
        showInfo(
          "This is taking longer than usual. Please check your connection.",
        );
      }, 8000);

      const formData = new FormData(e.currentTarget);
      formData.set("category_id", selectedCategory);
      formData.set("branch_id", selectedBranch);

      await createEquipment(formData);
      showSuccess("Equipment created successfully");
      router.push("/dashboard/equipment");
      router.refresh();
    } catch (err: any) {
      showError(err.message || "Failed to create equipment");
    } finally {
      clearTimeout(timeoutId!);
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rental_price">Rental Price (per day) *</Label>
              <Input
                id="rental_price"
                name="rental_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekly_price">Weekly Price</Label>
              <Input
                id="weekly_price"
                name="weekly_price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                disabled={isLoading}
              />
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
              {isLoading ? "Creating..." : "Create Equipment"}
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
