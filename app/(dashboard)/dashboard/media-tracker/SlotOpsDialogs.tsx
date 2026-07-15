'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, Copy, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/Modal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { setStorageSlot, type StorageSlot } from '@/actions/media-tracker';
import { DEVICE_TYPE_LABEL } from './status';

export const SLOT_LABEL: Record<StorageSlot, string> = {
  primary: 'Primary Storage',
  original_backup: 'Original Backup',
  backup_copy: 'Backup Copy',
};

export interface DeviceOption {
  id: string;
  label: string;
  type: string;
}

function DeviceSelect({
  value,
  onChange,
  devices,
  excludeId,
}: {
  value: string;
  onChange: (v: string) => void;
  devices: DeviceOption[];
  excludeId?: string | null;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select device" />
      </SelectTrigger>
      <SelectContent>
        {devices
          .filter((d) => d.id !== excludeId)
          .map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.label} ({DEVICE_TYPE_LABEL[d.type] ?? d.type})
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
}

/**
 * Copy / Transfer / Remove / Assign controls for ONE storage slot of a record.
 * All operations are tracking updates only (no physical files touched):
 *   Assign   — empty slot → pick a device
 *   Copy     — this slot's device → also record it into another EMPTY slot
 *   Transfer — replace this slot's device with a different one
 *   Remove   — clear this slot
 */
export function SlotActions({
  recordId,
  recordTitle,
  slot,
  currentDeviceId,
  emptySlots,
  devices,
  compact = false,
}: {
  recordId: string;
  recordTitle: string;
  slot: StorageSlot;
  currentDeviceId: string | null;
  emptySlots: StorageSlot[];
  devices: DeviceOption[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [copyOpen, setCopyOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [targetDevice, setTargetDevice] = useState('');
  const [targetSlot, setTargetSlot] = useState<StorageSlot | ''>(
    emptySlots[0] ?? ''
  );

  const run = async (
    s: StorageSlot,
    deviceId: string | null,
    successMsg: string,
    close: () => void
  ) => {
    setBusy(true);
    try {
      await setStorageSlot(recordId, s, deviceId);
      toast.success(successMsg);
      close();
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || 'Operation failed');
    } finally {
      setBusy(false);
    }
  };

  const btnCls = compact ? 'h-7 px-2 text-[11px]' : '';

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {currentDeviceId ? (
        <>
          <Button
            size="sm"
            variant="outline"
            className={btnCls}
            disabled={emptySlots.length === 0 || busy}
            title={
              emptySlots.length === 0
                ? 'All three locations are already filled'
                : 'Record a copy of this footage on another device'
            }
            onClick={() => {
              setTargetSlot(emptySlots[0] ?? '');
              setTargetDevice('');
              setCopyOpen(true);
            }}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={btnCls}
            disabled={busy}
            title="Move this location to a different device"
            onClick={() => {
              setTargetDevice('');
              setTransferOpen(true);
            }}
          >
            <ArrowRightLeft className="h-3 w-3 mr-1" />
            Transfer
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`${btnCls} text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/20`}
            disabled={busy}
            title="Clear this location from the record"
            onClick={() => setRemoveOpen(true)}
          >
            <X className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className={btnCls}
          disabled={busy}
          onClick={() => {
            setTargetDevice('');
            setAssignOpen(true);
          }}
        >
          <Plus className="h-3 w-3 mr-1" />
          Assign device
        </Button>
      )}

      {/* Copy dialog — pick empty slot + device */}
      <Dialog open={copyOpen} onOpenChange={setCopyOpen}>
        <DialogContent className="max-w-sm w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Copy to another device</DialogTitle>
            <DialogDescription>
              Record that &ldquo;{recordTitle}&rdquo; now also exists on another
              device. (Tracking only — copy the real files yourself.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Save into location</Label>
              <Select
                value={targetSlot}
                onValueChange={(v) => setTargetSlot(v as StorageSlot)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a free location" />
                </SelectTrigger>
                <SelectContent>
                  {emptySlots.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SLOT_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target device</Label>
              <DeviceSelect
                value={targetDevice}
                onChange={setTargetDevice}
                devices={devices}
                excludeId={currentDeviceId}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              disabled={busy || !targetDevice || !targetSlot}
              onClick={() =>
                run(
                  targetSlot as StorageSlot,
                  targetDevice,
                  'Copy recorded',
                  () => setCopyOpen(false)
                )
              }
            >
              {busy ? 'Saving…' : 'Record Copy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer dialog — new device for THIS slot */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-sm w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Transfer {SLOT_LABEL[slot]}</DialogTitle>
            <DialogDescription>
              Move this location of &ldquo;{recordTitle}&rdquo; to a different
              device. (Tracking only.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>New device</Label>
            <DeviceSelect
              value={targetDevice}
              onChange={setTargetDevice}
              devices={devices}
              excludeId={currentDeviceId}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              disabled={busy || !targetDevice}
              onClick={() =>
                run(slot, targetDevice, 'Transfer recorded', () =>
                  setTransferOpen(false)
                )
              }
            >
              {busy ? 'Saving…' : 'Transfer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign dialog — device for an EMPTY slot */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-sm w-[calc(100%-2rem)]">
          <DialogHeader>
            <DialogTitle>Assign {SLOT_LABEL[slot]}</DialogTitle>
            <DialogDescription>
              Pick the device where &ldquo;{recordTitle}&rdquo; is stored.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Device</Label>
            <DeviceSelect
              value={targetDevice}
              onChange={setTargetDevice}
              devices={devices}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              disabled={busy || !targetDevice}
              onClick={() =>
                run(slot, targetDevice, 'Device assigned', () =>
                  setAssignOpen(false)
                )
              }
            >
              {busy ? 'Saving…' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirm */}
      <AnimatePresence>
        {removeOpen && (
          <Modal
            id={`remove-slot-${recordId}-${slot}`}
            title={`Remove ${SLOT_LABEL[slot]}`}
            description={`Clear this storage location from "${recordTitle}"? The tracking entry is removed — real files are not affected.`}
            confirmText="Remove"
            cancelText="Cancel"
            onConfirm={() =>
              run(slot, null, 'Location removed', () => setRemoveOpen(false))
            }
            onCancel={() => setRemoveOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/** Utility: which of a record's slots are empty, given the joined shape. */
export function getEmptySlots(record: {
  primary_storage?: { id: string } | null;
  original_backup?: { id: string } | null;
  backup_copy?: { id: string } | null;
}): StorageSlot[] {
  const empty: StorageSlot[] = [];
  if (!record.primary_storage) empty.push('primary');
  if (!record.original_backup) empty.push('original_backup');
  if (!record.backup_copy) empty.push('backup_copy');
  return empty;
}
