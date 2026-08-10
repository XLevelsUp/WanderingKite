'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Modal } from '@/components/ui/Modal';
import {
  createStudioPackage,
  updateStudioPackage,
  deleteStudioPackage,
  createStudioAddOn,
  updateStudioAddOn,
  deleteStudioAddOn,
} from '@/actions/studio-pricing';
import { useNotify } from '@/hooks/useNotify';
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react';

interface StudioPackageRow {
  id: string;
  name: string;
  price: number;
  original_price: number;
  duration_label: string;
  description: string;
  is_best_value: boolean;
  sort_order: number;
  is_active: boolean;
}

interface StudioAddOnRow {
  id: string;
  name: string;
  price: number;
  unit: string;
  sort_order: number;
  is_active: boolean;
}

const emptyPackageForm = {
  name: '',
  price: '',
  originalPrice: '',
  durationLabel: '',
  description: '',
  isBestValue: false,
  sortOrder: '0',
  isActive: true,
};

const emptyAddOnForm = {
  name: '',
  price: '',
  unit: 'hr',
  sortOrder: '0',
  isActive: true,
};

export function StudioPricingClient({
  initialPackages,
  initialAddOns,
}: {
  initialPackages: StudioPackageRow[];
  initialAddOns: StudioAddOnRow[];
}) {
  const router = useRouter();
  const { showSuccess, showError } = useNotify();

  const [packages, setPackages] = useState(initialPackages);
  const [addOns, setAddOns] = useState(initialAddOns);
  useEffect(() => setPackages(initialPackages), [initialPackages]);
  useEffect(() => setAddOns(initialAddOns), [initialAddOns]);

  // ── Packages ────────────────────────────────────────────────────────────
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState(emptyPackageForm);
  const [isAddingPackage, setIsAddingPackage] = useState(false);
  const [savingPackage, setSavingPackage] = useState(false);
  const [deletePackageId, setDeletePackageId] = useState<string | null>(null);

  const startEditPackage = (pkg: StudioPackageRow) => {
    setIsAddingPackage(false);
    setEditingPackageId(pkg.id);
    setPackageForm({
      name: pkg.name,
      price: String(pkg.price),
      originalPrice: String(pkg.original_price),
      durationLabel: pkg.duration_label,
      description: pkg.description,
      isBestValue: pkg.is_best_value,
      sortOrder: String(pkg.sort_order),
      isActive: pkg.is_active,
    });
  };

  const startAddPackage = () => {
    setEditingPackageId(null);
    setIsAddingPackage(true);
    setPackageForm({ ...emptyPackageForm, sortOrder: String(packages.length + 1) });
  };

  const cancelPackageEdit = () => {
    setEditingPackageId(null);
    setIsAddingPackage(false);
  };

  const savePackage = async () => {
    setSavingPackage(true);
    try {
      const payload = {
        name: packageForm.name,
        price: Number(packageForm.price) || 0,
        originalPrice: Number(packageForm.originalPrice) || 0,
        durationLabel: packageForm.durationLabel,
        description: packageForm.description,
        isBestValue: packageForm.isBestValue,
        sortOrder: Number(packageForm.sortOrder) || 0,
        isActive: packageForm.isActive,
      };
      const result = isAddingPackage
        ? await createStudioPackage(payload)
        : await updateStudioPackage(editingPackageId as string, payload);

      if ('error' in result && result.error) {
        showError(result.error);
        return;
      }
      showSuccess(isAddingPackage ? 'Package created.' : 'Package updated.');
      cancelPackageEdit();
      router.refresh();
    } catch (err: any) {
      showError(err?.message || 'Failed to save package.');
    } finally {
      setSavingPackage(false);
    }
  };

  const confirmDeletePackage = async () => {
    if (!deletePackageId) return;
    try {
      const result = await deleteStudioPackage(deletePackageId);
      if ('error' in result && result.error) {
        showError(result.error);
        return;
      }
      showSuccess('Package deleted.');
      router.refresh();
    } catch (err: any) {
      showError(err?.message || 'Failed to delete package.');
    } finally {
      setDeletePackageId(null);
    }
  };

  // ── Add-ons ─────────────────────────────────────────────────────────────
  const [editingAddOnId, setEditingAddOnId] = useState<string | null>(null);
  const [addOnForm, setAddOnForm] = useState(emptyAddOnForm);
  const [isAddingAddOn, setIsAddingAddOn] = useState(false);
  const [savingAddOn, setSavingAddOn] = useState(false);
  const [deleteAddOnId, setDeleteAddOnId] = useState<string | null>(null);

  const startEditAddOn = (addon: StudioAddOnRow) => {
    setIsAddingAddOn(false);
    setEditingAddOnId(addon.id);
    setAddOnForm({
      name: addon.name,
      price: String(addon.price),
      unit: addon.unit,
      sortOrder: String(addon.sort_order),
      isActive: addon.is_active,
    });
  };

  const startAddAddOn = () => {
    setEditingAddOnId(null);
    setIsAddingAddOn(true);
    setAddOnForm({ ...emptyAddOnForm, sortOrder: String(addOns.length + 1) });
  };

  const cancelAddOnEdit = () => {
    setEditingAddOnId(null);
    setIsAddingAddOn(false);
  };

  const saveAddOn = async () => {
    setSavingAddOn(true);
    try {
      const payload = {
        name: addOnForm.name,
        price: Number(addOnForm.price) || 0,
        unit: addOnForm.unit,
        sortOrder: Number(addOnForm.sortOrder) || 0,
        isActive: addOnForm.isActive,
      };
      const result = isAddingAddOn
        ? await createStudioAddOn(payload)
        : await updateStudioAddOn(editingAddOnId as string, payload);

      if ('error' in result && result.error) {
        showError(result.error);
        return;
      }
      showSuccess(isAddingAddOn ? 'Add-on created.' : 'Add-on updated.');
      cancelAddOnEdit();
      router.refresh();
    } catch (err: any) {
      showError(err?.message || 'Failed to save add-on.');
    } finally {
      setSavingAddOn(false);
    }
  };

  const confirmDeleteAddOn = async () => {
    if (!deleteAddOnId) return;
    try {
      const result = await deleteStudioAddOn(deleteAddOnId);
      if ('error' in result && result.error) {
        showError(result.error);
        return;
      }
      showSuccess('Add-on deleted.');
      router.refresh();
    } catch (err: any) {
      showError(err?.message || 'Failed to delete add-on.');
    } finally {
      setDeleteAddOnId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── SESSION PACKAGES ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Session Packages</CardTitle>
            <CardDescription>The tiers shown on the Studio Space quotation and the client booking flow.</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={startAddPackage} disabled={isAddingPackage}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Package
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Actual Price (₹)</TableHead>
                  <TableHead>Offer Price (₹)</TableHead>
                  <TableHead>Duration Label</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Best Value</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAddingPackage && (
                  <TableRow>
                    <TableCell><Input className="w-32 h-8" value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} placeholder="e.g. Quick Session" /></TableCell>
                    <TableCell><Input type="number" className="w-24 h-8" value={packageForm.originalPrice} onChange={(e) => setPackageForm({ ...packageForm, originalPrice: e.target.value })} /></TableCell>
                    <TableCell><Input type="number" className="w-24 h-8" value={packageForm.price} onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })} /></TableCell>
                    <TableCell><Input className="w-28 h-8" value={packageForm.durationLabel} onChange={(e) => setPackageForm({ ...packageForm, durationLabel: e.target.value })} placeholder="e.g. 4 Hours" /></TableCell>
                    <TableCell><Input className="w-48 h-8" value={packageForm.description} onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })} /></TableCell>
                    <TableCell>
                      <input type="checkbox" className="h-4 w-4" checked={packageForm.isBestValue} onChange={(e) => setPackageForm({ ...packageForm, isBestValue: e.target.checked })} />
                    </TableCell>
                    <TableCell>
                      <input type="checkbox" className="h-4 w-4" checked={packageForm.isActive} onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })} />
                    </TableCell>
                    <TableCell className="space-x-2 whitespace-nowrap text-right">
                      <Button size="sm" onClick={savePackage} disabled={savingPackage}>
                        {savingPackage && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />} Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelPackageEdit} disabled={savingPackage} data-no-track>Cancel</Button>
                    </TableCell>
                  </TableRow>
                )}
                {packages.length === 0 && !isAddingPackage ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-slate-500">No packages yet.</TableCell>
                  </TableRow>
                ) : (
                  packages.map((pkg) => (
                    <TableRow key={pkg.id} className={!pkg.is_active ? 'opacity-50' : undefined}>
                      {editingPackageId === pkg.id ? (
                        <>
                          <TableCell><Input className="w-32 h-8" value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} /></TableCell>
                          <TableCell><Input type="number" className="w-24 h-8" value={packageForm.originalPrice} onChange={(e) => setPackageForm({ ...packageForm, originalPrice: e.target.value })} /></TableCell>
                          <TableCell><Input type="number" className="w-24 h-8" value={packageForm.price} onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })} /></TableCell>
                          <TableCell><Input className="w-28 h-8" value={packageForm.durationLabel} onChange={(e) => setPackageForm({ ...packageForm, durationLabel: e.target.value })} /></TableCell>
                          <TableCell><Input className="w-48 h-8" value={packageForm.description} onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })} /></TableCell>
                          <TableCell>
                            <input type="checkbox" className="h-4 w-4" checked={packageForm.isBestValue} onChange={(e) => setPackageForm({ ...packageForm, isBestValue: e.target.checked })} />
                          </TableCell>
                          <TableCell>
                            <input type="checkbox" className="h-4 w-4" checked={packageForm.isActive} onChange={(e) => setPackageForm({ ...packageForm, isActive: e.target.checked })} />
                          </TableCell>
                          <TableCell className="space-x-2 whitespace-nowrap text-right">
                            <Button size="sm" onClick={savePackage} disabled={savingPackage}>
                              {savingPackage && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />} Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelPackageEdit} disabled={savingPackage} data-no-track>Cancel</Button>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">
                            {pkg.name}
                            {pkg.is_best_value && (
                              <span className="ml-2 rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-500">Best Value</span>
                            )}
                          </TableCell>
                          <TableCell className="line-through text-muted-foreground">₹{pkg.original_price.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="font-semibold text-amber-500">₹{pkg.price.toLocaleString('en-IN')}</TableCell>
                          <TableCell>{pkg.duration_label}</TableCell>
                          <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{pkg.description}</TableCell>
                          <TableCell>{pkg.is_best_value ? 'Yes' : '—'}</TableCell>
                          <TableCell>{pkg.is_active ? 'Yes' : 'Hidden'}</TableCell>
                          <TableCell className="space-x-2 whitespace-nowrap text-right">
                            <Button size="sm" variant="outline" onClick={() => startEditPackage(pkg)}>
                              <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setDeletePackageId(pkg.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── ADD-ONS ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Add-Ons</CardTitle>
            <CardDescription>Optional extras clients can add to a studio booking.</CardDescription>
          </div>
          <Button size="sm" variant="outline" onClick={startAddAddOn} disabled={isAddingAddOn}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Add-on
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAddingAddOn && (
                <TableRow>
                  <TableCell><Input className="w-40 h-8" value={addOnForm.name} onChange={(e) => setAddOnForm({ ...addOnForm, name: e.target.value })} placeholder="e.g. Pro Cameraman" /></TableCell>
                  <TableCell><Input type="number" className="w-24 h-8" value={addOnForm.price} onChange={(e) => setAddOnForm({ ...addOnForm, price: e.target.value })} /></TableCell>
                  <TableCell><Input className="w-20 h-8" value={addOnForm.unit} onChange={(e) => setAddOnForm({ ...addOnForm, unit: e.target.value })} /></TableCell>
                  <TableCell>
                    <input type="checkbox" className="h-4 w-4" checked={addOnForm.isActive} onChange={(e) => setAddOnForm({ ...addOnForm, isActive: e.target.checked })} />
                  </TableCell>
                  <TableCell className="space-x-2 whitespace-nowrap text-right">
                    <Button size="sm" onClick={saveAddOn} disabled={savingAddOn}>
                      {savingAddOn && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />} Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelAddOnEdit} disabled={savingAddOn} data-no-track>Cancel</Button>
                  </TableCell>
                </TableRow>
              )}
              {addOns.length === 0 && !isAddingAddOn ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-500">No add-ons yet.</TableCell>
                </TableRow>
              ) : (
                addOns.map((addon) => (
                  <TableRow key={addon.id} className={!addon.is_active ? 'opacity-50' : undefined}>
                    {editingAddOnId === addon.id ? (
                      <>
                        <TableCell><Input className="w-40 h-8" value={addOnForm.name} onChange={(e) => setAddOnForm({ ...addOnForm, name: e.target.value })} /></TableCell>
                        <TableCell><Input type="number" className="w-24 h-8" value={addOnForm.price} onChange={(e) => setAddOnForm({ ...addOnForm, price: e.target.value })} /></TableCell>
                        <TableCell><Input className="w-20 h-8" value={addOnForm.unit} onChange={(e) => setAddOnForm({ ...addOnForm, unit: e.target.value })} /></TableCell>
                        <TableCell>
                          <input type="checkbox" className="h-4 w-4" checked={addOnForm.isActive} onChange={(e) => setAddOnForm({ ...addOnForm, isActive: e.target.checked })} />
                        </TableCell>
                        <TableCell className="space-x-2 whitespace-nowrap text-right">
                          <Button size="sm" onClick={saveAddOn} disabled={savingAddOn}>
                            {savingAddOn && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />} Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancelAddOnEdit} disabled={savingAddOn} data-no-track>Cancel</Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{addon.name}</TableCell>
                        <TableCell>₹{addon.price.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{addon.unit}</TableCell>
                        <TableCell>{addon.is_active ? 'Yes' : 'Hidden'}</TableCell>
                        <TableCell className="space-x-2 whitespace-nowrap text-right">
                          <Button size="sm" variant="outline" onClick={() => startEditAddOn(addon)}>
                            <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => setDeleteAddOnId(addon.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AnimatePresence>
        {deletePackageId && (
          <Modal
            id="delete-studio-package"
            title="Delete Package"
            description="Are you sure you want to delete this session package? This cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={confirmDeletePackage}
            onCancel={() => setDeletePackageId(null)}
          />
        )}
        {deleteAddOnId && (
          <Modal
            id="delete-studio-add-on"
            title="Delete Add-on"
            description="Are you sure you want to delete this add-on? This cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={confirmDeleteAddOn}
            onCancel={() => setDeleteAddOnId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
