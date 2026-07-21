'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';
import {
  Upload,
  X,
  ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useNotify } from '@/hooks/useNotify';

interface ImageUploadProps {
  /** Current image URL (from DB). Controls the visible preview on load. */
  value?: string | null;
  /** Called with the new public URL after a successful upload, or '' when cleared. */
  onChange: (url: string) => void;
  /** Supabase Storage bucket name — must be PUBLIC. Default: 'equipment-images' */
  bucket?: string;
  /** Optional prefix folder inside the bucket. Default: '' (root) */
  folder?: string;
  /** Disable interaction */
  disabled?: boolean;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const ACCEPTED = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/dng',
];
const MAX_MB = 50;

async function compressImage(
  file: File,
  maxWidthPx = 1920,
  qualityJpeg = 0.82
): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidthPx / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(
            new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
            })
          );
        },
        'image/jpeg',
        qualityJpeg
      );
    };
    img.src = url;
  });
}

export function ImageUpload({
  value,
  onChange,
  bucket = 'equipment-images',
  folder = '',
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    before: number;
    after: number;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showError, showInfo } = useNotify();

  // ── Upload logic ─────────────────────────────────────────────────────────────
  const uploadFile = useCallback(
    async (rawFile: File) => {
      setErrorMsg('');
      setCompressionStats(null);

      // Client-side validation
      if (!ACCEPTED.includes(rawFile.type)) {
        setErrorMsg('Only JPG, PNG, WebP or GIF images are supported.');
        return;
      }
      if (rawFile.size > MAX_MB * 1024 * 1024) {
        setErrorMsg(`File too large — maximum size is ${MAX_MB} MB.`);
        return;
      }

      setUploadState('uploading');

      let fileToUpload = rawFile;
      try {
        const compressed = await compressImage(rawFile);
        fileToUpload = compressed;
        if (compressed.size < rawFile.size) {
          setCompressionStats({ before: rawFile.size, after: compressed.size });
        }
      } catch (err) {
        logger.error('[ImageUpload] Compression failed:', err);
      }

      // Show local preview immediately for snappy UX
      const objectUrl = URL.createObjectURL(fileToUpload);
      setPreview(objectUrl);

      let timeoutId: NodeJS.Timeout;

      try {
        timeoutId = setTimeout(() => {
          showInfo(
            'This is taking longer than usual. Please check your connection.'
          );
        }, 8000);

        const supabase = createClient();
        const ext = fileToUpload.name.split('.').pop() ?? 'jpg';
        const timestamp = Date.now();
        const safeName = fileToUpload.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[^a-z0-9]/gi, '-')
          .toLowerCase()
          .slice(0, 40);
        const filePath = folder
          ? `${folder}/${safeName}-${timestamp}.${ext}`
          : `${safeName}-${timestamp}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, fileToUpload, {
            upsert: true,
            contentType: fileToUpload.type,
          });

        if (uploadError) throw new Error(uploadError.message);

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        const publicUrl = data.publicUrl;

        setPreview(publicUrl);
        setUploadState('success');
        onChange(publicUrl);

        // Revoke the temporary object URL
        URL.revokeObjectURL(objectUrl);
      } catch (err: any) {
        setUploadState('error');
        setErrorMsg(err.message ?? 'Upload failed. Please try again.');
        // Keep the previous stable preview if one existed
        setPreview(value || null);
        showError(
          'Upload failed. Please check your connection and try again.',
          {
            title: 'Upload Failed',
            action: (
              <button
                onClick={() => uploadFile(rawFile)}
                className="text-sm font-semibold text-red-400 hover:text-red-300 transition-colors"
              >
                Retry Upload
              </button>
            ),
          }
        );
      } finally {
        clearTimeout(timeoutId!);
      }
    },
    [bucket, folder, onChange, value, showError, showInfo]
  );

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) {
        uploadFile(file);
      } else {
        // Dragging from browser (e.g. Google Images) doesn't expose a File —
        // the browser blocks cross-origin file access. Show a clear error.
        setUploadState('error');
        setErrorMsg(
          'Cannot drag images directly from Google. Right-click the image → Save as… then drag the saved file here.'
        );
      }
    },
    [disabled, uploadFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    },
    [uploadFile]
  );

  const handleClear = useCallback(() => {
    setPreview(null);
    setUploadState('idle');
    setErrorMsg('');
    setCompressionStats(null);
    onChange('');
  }, [onChange]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const isUploading = uploadState === 'uploading';

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload equipment image"
        onClick={() => !disabled && !isUploading && fileRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isUploading)
            fileRef.current?.click();
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center',
          'rounded-xl border-2 border-dashed transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isDragOver
            ? 'border-amber-500 bg-amber-500/5 scale-[1.01]'
            : uploadState === 'error'
              ? 'border-red-500/50 bg-red-500/5'
              : preview
                ? 'border-border bg-muted/30'
                : 'border-border bg-muted/20 hover:border-amber-500/50 hover:bg-amber-500/5',
          disabled ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
      >
        {/* Preview image */}
        {preview && !isUploading ? (
          <>
            <div className="relative h-[160px] w-full overflow-hidden rounded-lg p-2">
              <Image
                src={preview}
                alt="Equipment preview"
                fill
                className="object-contain"
                sizes="400px"
                unoptimized
              />
            </div>

            {/* Success indicator */}
            {uploadState === 'success' && (
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/30 w-fit">
                  <CheckCircle2 className="h-3 w-3" />
                  Uploaded
                </div>
                {compressionStats && (
                  <div className="flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border w-fit backdrop-blur-sm">
                    {formatSize(compressionStats.before)} →{' '}
                    {formatSize(compressionStats.after)}
                  </div>
                )}
              </div>
            )}

            {/* Clear button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!disabled) handleClear();
              }}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Re-upload overlay on hover */}
            <div className="absolute inset-0 flex items-end justify-center pb-3 opacity-0 hover:opacity-100 transition-opacity">
              <span className="rounded-full bg-background/90 border border-border px-3 py-1 text-xs text-muted-foreground shadow">
                Click or drag to replace
              </span>
            </div>
          </>
        ) : isUploading ? (
          /* Uploading state */
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 animate-ping rounded-full bg-amber-500/30" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Uploading…</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {compressionStats
                  ? `Compressed: ${formatSize(compressionStats.before)} → ${formatSize(compressionStats.after)}`
                  : 'Please wait while we upload your image'}
              </p>
            </div>
          </div>
        ) : (
          /* Empty / drag-ready state */
          <div className="flex flex-col items-center gap-3 py-8 px-4 text-center">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                isDragOver ? 'bg-amber-500/20' : 'bg-muted'
              }`}
            >
              {isDragOver ? (
                <Upload className="h-7 w-7 text-amber-500" />
              ) : (
                <ImageIcon className="h-7 w-7 text-muted-foreground/50" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragOver
                  ? 'Drop to upload'
                  : 'Drop image here, or click to browse'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, WebP or GIF · max {MAX_MB} MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {uploadState === 'error' && errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        tabIndex={-1}
      />
    </div>
  );
}
