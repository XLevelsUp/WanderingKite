'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportMediaRecordsCsv, type MediaRecordFilters } from '@/actions/media-tracker';

/** Downloads the currently filtered Media Tracker records as a CSV file —
 * a way back out to spreadsheet form for reporting, without needing a copy
 * of the old hand-maintained tracker ever again. */
export function ExportCsvButton({ filters }: { filters: MediaRecordFilters }) {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const csv = await exportMediaRecordsCsv(filters);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `media-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to export CSV');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className="w-full sm:w-auto"
      disabled={busy}
      onClick={handleExport}
    >
      <Download className="h-4 w-4 mr-1.5" />
      {busy ? 'Exporting…' : 'Export CSV'}
    </Button>
  );
}
