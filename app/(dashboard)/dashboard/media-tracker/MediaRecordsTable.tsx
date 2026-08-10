'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { DEVICE_TYPE_LABEL, hasBackupRisk, NoBackupPill, hasUnloggedContent, NotLoggedPill } from './status';
import { DeleteMediaRecordButton } from '@/components/dashboard/DeleteMediaRecordButton';
import { EditMediaRecordDialog } from './EditMediaRecordDialog';
import { bulkDeleteMediaRecords } from '@/actions/media-tracker';

export function MediaRecordsTable({
  records,
  clientOptions,
  deviceOptions,
  isEmployee,
}: {
  records: any[];
  clientOptions: { id: string; name: string }[];
  deviceOptions: { id: string; label: string; type: string }[];
  isEmployee: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const allSelected = records.length > 0 && selected.size === records.length;
  const someSelected = selected.size > 0 && !allSelected;
  const selectedTitles = useMemo(
    () => records.filter((r) => selected.has(r.id)).map((r) => r.title),
    [records, selected]
  );

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(records.map((r) => r.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    setShowConfirm(false);
    try {
      const result = await bulkDeleteMediaRecords(Array.from(selected));
      toast.success(`${result.deleted} media record(s) deleted`);
      setSelected(new Set());
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete selected media records');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {!isEmployee && selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 mb-3 px-3 py-2 rounded-lg border border-primary/25 bg-primary/8">
          <span className="text-sm font-medium">
            {selected.size} record{selected.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {!isEmployee && (
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    aria-label="Select all records"
                    className="h-4 w-4"
                  />
                </TableHead>
              )}
              <TableHead>Client</TableHead>
              <TableHead>Shoot / Title</TableHead>
              <TableHead>Primary Storage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEmployee ? 4 : 5} className="text-center py-10 text-slate-500">
                  No media records found.
                </TableCell>
              </TableRow>
            ) : (
              records.map((r: any) => (
                <TableRow key={r.id} className={selected.has(r.id) ? 'bg-primary/5' : undefined}>
                  {!isEmployee && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggleOne(r.id)}
                        aria-label={`Select ${r.title}`}
                        className="h-4 w-4"
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    {r.client?.name ?? (
                      <span className="text-slate-500">No client</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/media-tracker/${r.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {r.title}
                    </Link>
                    {(r.shoot_date || r.category) && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {r.shoot_date &&
                          new Date(r.shoot_date).toLocaleDateString('en-IN')}
                        {r.shoot_date && r.category && ' · '}
                        {r.category}
                      </p>
                    )}
                    {(hasBackupRisk(r) || hasUnloggedContent(r)) && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {hasBackupRisk(r) && <NoBackupPill />}
                        {hasUnloggedContent(r) && <NotLoggedPill />}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.primary_storage ? (
                      <span className="text-sm">
                        {r.primary_storage.label}{' '}
                        <span className="text-slate-500">
                          ({DEVICE_TYPE_LABEL[r.primary_storage.type] ?? r.primary_storage.type})
                        </span>
                        {!r.primary_storage.is_active && (
                          <span className="ml-1.5 text-[10px] uppercase text-amber-500">
                            Retired
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/media-tracker/${r.id}`}>
                        <Button size="sm" variant="secondary">
                          View
                        </Button>
                      </Link>
                      {!isEmployee && (
                        <>
                          <EditMediaRecordDialog
                            record={r}
                            clients={clientOptions}
                            devices={deviceOptions}
                          />
                          <DeleteMediaRecordButton
                            recordId={r.id}
                            recordTitle={r.title}
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <Modal
            id="bulk-delete-media-records"
            title="Delete Media Records"
            description={`Are you sure you want to delete ${selected.size} record${selected.size > 1 ? 's' : ''}${selectedTitles.length <= 5 ? `: "${selectedTitles.join('", "')}"` : ''}? They'll be hidden everywhere in the app, and can be restored from the database if needed.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={handleBulkDelete}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
