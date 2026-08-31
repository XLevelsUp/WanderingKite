'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SourcePickerControlled } from '@/components/dashboard/SourcePicker';
import { SOURCE_META } from '@/lib/sourceUtils';
import { SOURCE_REQUIRES_DETAIL, type ClientSource } from '@/lib/validations/schemas';
import { updateClientSource } from '@/actions/clients';

interface ClientSourceCellProps {
  clientId: string;
  clientName: string;
  source: ClientSource | null;
  sourceDetail: string | null;
}

/**
 * Source badge in the clients table. Clicking it opens a modal to change the
 * channel without leaving the list — the same updateClientSource action the
 * client detail page uses, so both stay in sync.
 */
export function ClientSourceCell({
  clientId,
  clientName,
  source,
  sourceDetail,
}: ClientSourceCellProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Live values shown in the table — updated optimistically after a save so
  // the row reflects the change before the server revalidation lands.
  const [current, setCurrent] = useState<ClientSource | null>(source);
  const [currentDetail, setCurrentDetail] = useState<string | null>(sourceDetail);

  // Staged values inside the modal
  const [pendingSource, setPendingSource] = useState<ClientSource | null>(source);
  const [pendingDetail, setPendingDetail] = useState<string>(sourceDetail ?? '');

  const openModal = () => {
    // Reset staged values to what is currently saved, so a cancelled edit
    // does not leak into the next one.
    setPendingSource(current);
    setPendingDetail(currentDetail ?? '');
    setOpen(true);
  };

  const detailRequired = pendingSource === SOURCE_REQUIRES_DETAIL;
  const detailMissing = detailRequired && !pendingDetail.trim();
  const canSave = pendingSource !== null && !detailMissing && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const detailToSave = detailRequired ? pendingDetail.trim() : null;
      await updateClientSource(clientId, pendingSource, detailToSave);
      setCurrent(pendingSource);
      setCurrentDetail(detailToSave);
      setOpen(false);
      toast.success('Client source updated.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update source.');
    } finally {
      setSaving(false);
    }
  };

  const meta = current ? SOURCE_META[current] : null;

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        data-no-track
        title="Click to change source"
        className="group flex flex-col gap-0.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        {meta ? (
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-all group-hover:brightness-125 ${meta.color}`}
          >
            <span>{meta.emoji}</span>
            <span>{meta.label}</span>
          </span>
        ) : (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-dashed border-slate-600 px-2.5 py-1 text-[11px] font-semibold text-slate-400 transition-colors group-hover:border-slate-400 group-hover:text-slate-200">
            + Set source
          </span>
        )}
        {current === SOURCE_REQUIRES_DETAIL && currentDetail && (
          <span className="pl-1 text-[10px] text-slate-400">{currentDetail}</span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Client source</DialogTitle>
            <DialogDescription>
              How did {clientName} find us? This drives conversion reporting.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <SourcePickerControlled
              value={pendingSource}
              detail={pendingDetail}
              onChangeSource={setPendingSource}
              onChangeDetail={setPendingDetail}
              disabled={saving}
            />
            {detailMissing && (
              <p className="mt-2 text-xs text-red-400">
                Please specify which social media platform.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={!canSave}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
