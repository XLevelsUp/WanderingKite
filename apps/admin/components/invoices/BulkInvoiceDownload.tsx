'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { AnimatePresence } from 'framer-motion';
import { FileDown, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/Modal';
import { getInvoicesByIds } from '@/actions/invoices';
import { logger } from '@/lib/logger';
import { InvoiceDocument, type InvoiceRecord } from '@/components/invoices/InvoiceView';

/**
 * Downloads every entry currently on screen as ONE multi-page PDF.
 *
 * It rasterises the same <InvoiceDocument> the detail page and the print
 * stylesheet use, so a bulk page and a singly-downloaded PDF are the same
 * document — there is no second invoice layout to keep in step.
 *
 * One combined file rather than a zip of individual PDFs: jspdf and
 * html2canvas are already here for the single download, so this adds no
 * dependency, and a single artefact is what actually gets mailed to an
 * accountant or filed for the month.
 */

// The capture runs at a fixed width so the output does not depend on the
// operator's viewport — it matches the detail page's max-w-3xl (768px) less
// its md:p-8 padding, i.e. what the single download captures on a desktop.
const CAPTURE_WIDTH_PX = 704;

// Past this many entries the run is long enough to be worth confirming: each
// one is a full render plus a rasterise, so a few hundred is minutes of work.
const CONFIRM_THRESHOLD = 40;

// JPEG, not the single download's PNG: a hundred PNG pages held in memory at
// once risks exhausting the tab. At this quality the difference on black text
// over white is not visible in print.
const IMAGE_FORMAT = 'JPEG' as const;
const IMAGE_QUALITY = 0.92;

function safeFilePart(s: string) {
  return s.replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Places one captured document onto the pdf, slicing it across pages if tall. */
function addCapture(pdf: any, canvas: HTMLCanvasElement, isFirst: boolean) {
  if (!isFirst) pdf.addPage();

  const imgData = canvas.toDataURL('image/jpeg', IMAGE_QUALITY);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, IMAGE_FORMAT, 0, position, imgWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position -= pageHeight;
    pdf.addPage();
    pdf.addImage(imgData, IMAGE_FORMAT, 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;
  }
}

export function BulkInvoiceDownload({
  ids,
  scopeLabel,
}: {
  /** Ids of the entries currently visible, in the order the listing shows them. */
  ids: string[];
  /** Human scope for the filename, e.g. 'Invoiced-2026-09'. */
  scopeLabel: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [running, setRunning] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);

  // The invoice currently mounted on the offscreen stage. One at a time keeps
  // the DOM small no matter how many entries the run covers.
  const [staged, setStaged] = useState<InvoiceRecord | null>(null);
  const cancelledRef = useRef(false);
  // Which entry the run is on, so a throw can name it rather than failing anonymously.
  const failingRef = useRef<string | null>(null);

  useEffect(() => setMounted(true), []);

  // flushSync commits the render before it returns, so the node exists by the
  // next line; the two frames after it let the browser lay the document out,
  // because html2canvas measures live geometry and would otherwise photograph
  // a node with no size yet.
  //
  // Deliberately not an effect-plus-stored-resolver handshake: that hangs
  // forever if a paint is ever missed, and a stuck progress counter is a far
  // worse failure than a thrown error.
  const stage = useCallback((invoice: InvoiceRecord) => {
    flushSync(() => {
      setStaged(invoice);
    });
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  }, []);

  const run = useCallback(async () => {
    cancelledRef.current = false;
    failingRef.current = null;
    setRunning(true);
    setDone(0);
    setTotal(ids.length);

    try {
      const [{ default: html2canvas }, { jsPDF }, records] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
        getInvoicesByIds(ids),
      ]);

      const list = (records ?? []) as unknown as InvoiceRecord[];
      if (list.length === 0) {
        toast.error('Could not load these entries — none came back from the server.');
        return;
      }
      // A short read means the fetch partly failed rather than the download
      // being wrong; say so instead of silently producing a thinner PDF.
      if (list.length < ids.length) {
        toast.warning(`Only ${list.length} of ${ids.length} entries could be loaded.`);
      }
      setTotal(list.length);

      const pdf = new jsPDF({ unit: 'mm', format: 'a5' });
      let written = 0;

      for (const invoice of list) {
        if (cancelledRef.current) break;
        failingRef.current = invoice.invoice_number;

        await stage(invoice);
        const node = document.getElementById('bulk-invoice-capture');
        if (!node) break;

        // No onclone repositioning here: html2canvas measures the geometry of
        // the *clone*, after onclone has run. Dropping the stage back into the
        // cloned document's flow would hand it whatever width the dashboard's
        // layout gives it, so leaving the offscreen positioning alone is what
        // keeps the capture the size it is on screen.
        const canvas = await html2canvas(node, {
          scale: 2,
          backgroundColor: '#ffffff',
          logging: false,
        });

        if (!canvas.width || !canvas.height) {
          throw new Error(
            `${invoice.invoice_number} rendered with no size (${canvas.width}x${canvas.height}).`
          );
        }

        addCapture(pdf, canvas, written === 0);
        written += 1;
        setDone(written);

        // Release the backing bitmap before the next one is built.
        canvas.width = 0;
        canvas.height = 0;
      }

      // Past the loop, so a failure in save() is not blamed on an entry.
      failingRef.current = null;

      if (written === 0) {
        toast.info('Download cancelled.');
        return;
      }

      pdf.save('Invoices-' + safeFilePart(scopeLabel) + '.pdf');

      if (cancelledRef.current) {
        toast.success('Cancelled — saved the first ' + written + ' of ' + list.length + '.');
      } else {
        toast.success('Downloaded ' + written + (written === 1 ? ' entry.' : ' entries.'));
      }
    } catch (err) {
      // Surfacing the real reason matters here: this loop fails per-entry, and
      // "something went wrong" gives an operator nothing to act on. The
      // console keeps the stack; the toast carries enough to report.
      const detail = err instanceof Error ? err.message : String(err);
      logger.error('Bulk invoice download failed', err, { at: failingRef.current });
      toast.error(
        failingRef.current
          ? `Failed on ${failingRef.current}: ${detail}`
          : `Failed to generate the PDF: ${detail}`
      );
    } finally {
      setStaged(null);
      setRunning(false);
    }
  }, [ids, scopeLabel, stage]);

  const handleClick = () => {
    if (ids.length === 0 || running) return;
    if (ids.length > CONFIRM_THRESHOLD) {
      setConfirming(true);
      return;
    }
    void run();
  };

  if (ids.length === 0) return null;

  return (
    <>
      {running ? (
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground tabular-nums">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Building PDF — {done} of {total}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              cancelledRef.current = true;
            }}
          >
            <X className="h-4 w-4 mr-1.5" />
            Cancel
          </Button>
        </div>
      ) : (
        <Button type="button" size="sm" variant="outline" onClick={handleClick}>
          <FileDown className="h-4 w-4 mr-1.5" />
          Download all ({ids.length})
        </Button>
      )}

      <AnimatePresence>
        {confirming && (
          <Modal
            id="bulk-invoice-download"
            title="Download all entries"
            description={
              'This builds a single PDF from ' +
              ids.length +
              ' entries, one page each. It runs in this tab and can take a few minutes — narrowing to a month first will be quicker.'
            }
            confirmText="Download"
            cancelText="Cancel"
            onConfirm={() => {
              setConfirming(false);
              void run();
            }}
            onCancel={() => setConfirming(false)}
          />
        )}
      </AnimatePresence>

      {/* Offscreen stage. Kept in the layout (not display:none) because
          html2canvas can only photograph a node the browser has laid out. */}
      {mounted &&
        createPortal(
          <div
            id="bulk-invoice-stage"
            aria-hidden="true"
            style={{
              position: 'fixed',
              left: '-20000px',
              top: 0,
              width: CAPTURE_WIDTH_PX,
              pointerEvents: 'none',
              zIndex: -1,
              background: '#ffffff',
            }}
          >
            <div id="bulk-invoice-capture">
              {staged && (
                <InvoiceDocument
                  invoice={staged}
                  status={staged.status}
                  issueDate={staged.issue_date}
                  documentNumber={staged.invoice_number}
                  isInvoiced={staged.is_invoiced ?? true}
                />
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
