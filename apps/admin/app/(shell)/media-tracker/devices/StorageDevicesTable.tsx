'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Pencil, HardDrive, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/Modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createStorageDevice,
  updateStorageDevice,
  setStorageDeviceActive,
  deleteStorageDevice,
} from '@/actions/media-tracker';
import { DEVICE_TYPE_LABEL } from '../status';

interface Device {
  id: string;
  label: string;
  type: string;
  capacity: string | null;
  notes: string | null;
  is_active: boolean;
}

interface FormState {
  label: string;
  type: string;
  capacity: string;
  notes: string;
}

const EMPTY_FORM: FormState = { label: '', type: 'HDD', capacity: '', notes: '' };

export function StorageDevicesTable({
  devices,
  isEmployee,
}: {
  devices: Device[];
  isEmployee: boolean;
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Device | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Device | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (d: Device) => {
    setEditing(d);
    setForm({
      label: d.label,
      type: d.type,
      capacity: d.capacity ?? '',
      notes: d.notes ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.label.trim()) {
      toast.error('Label is required');
      return;
    }
    setBusy(true);
    try {
      const input = {
        label: form.label,
        type: form.type as 'HDD' | 'SSD' | 'CLOUD',
        capacity: form.capacity || undefined,
        notes: form.notes || undefined,
      };
      if (editing) {
        await updateStorageDevice(editing.id, input);
        toast.success('Device updated');
      } else {
        await createStorageDevice(input);
        toast.success('Device added');
      }
      setDialogOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (d: Device) => {
    setBusy(true);
    try {
      await setStorageDeviceActive(d.id, !d.is_active);
      toast.success(d.is_active ? 'Device retired' : 'Device reactivated');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await deleteStorageDevice(deleteTarget.id);
      toast.success('Device deleted');
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete device');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">{devices.length} device(s)</p>
        {!isEmployee && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Device
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              {!isEmployee && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isEmployee ? 4 : 5}
                  className="text-center py-10 text-slate-500"
                >
                  No storage devices yet.
                </TableCell>
              </TableRow>
            ) : (
              devices.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-slate-500" />
                    {d.label}
                  </TableCell>
                  <TableCell>{DEVICE_TYPE_LABEL[d.type] ?? d.type}</TableCell>
                  <TableCell>{d.capacity || '—'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        d.is_active
                          ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/25'
                          : 'bg-slate-500/12 text-slate-400 border border-slate-500/25'
                      }`}
                    >
                      {d.is_active ? 'Active' : 'Retired'}
                    </span>
                  </TableCell>
                  {!isEmployee && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(d)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant={d.is_active ? 'destructive' : 'secondary'}
                          disabled={busy}
                          onClick={() => toggleActive(d)}
                        >
                          {d.is_active ? 'Retire' : 'Reactivate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
                          disabled={busy}
                          title="Delete this device permanently"
                          onClick={() => setDeleteTarget(d)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <Modal
            id={`delete-storage-device-${deleteTarget.id}`}
            title="Delete Storage Device"
            description={`Delete "${deleteTarget.label}"? This removes it from the device list entirely. Devices still referenced by a media record can't be deleted — retire those instead.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Device' : 'Add Storage Device'}</DialogTitle>
            <DialogDescription>
              Devices appear in the storage/backup selects on media records.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dev-label">Label</Label>
              <Input
                id="dev-label"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. WD-2TB-Blue-01"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HDD">HDD</SelectItem>
                  <SelectItem value="SSD">SSD</SelectItem>
                  <SelectItem value="CLOUD">Cloud</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dev-capacity">Capacity (optional)</Label>
              <Input
                id="dev-capacity"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                placeholder="e.g. 2TB"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dev-notes">Notes (optional)</Label>
              <Textarea
                id="dev-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={busy} data-no-track>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save Changes' : 'Add Device'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
