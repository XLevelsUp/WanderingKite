import { ImageIcon, Play } from 'lucide-react';

/** Stand-in for a photo or video slot until real media is uploaded. Theme tokens only, so it fits light, sandstone and dark sections. */
export function MediaPlaceholder({
  kind = 'image',
  label,
  className = '',
  corners = true,
}: {
  kind?: 'image' | 'video';
  label?: string;
  className?: string;
  /** Off where text overlays the frame (category tiles). */
  corners?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={label ?? (kind === 'video' ? 'Video coming soon' : 'Photo coming soon')}
      // `relative` only when the caller doesn't position it — `relative` + `absolute inset-0` together collapsed it to the top.
      className={`${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} flex items-center justify-center overflow-hidden bg-card ${className}`}
    >
      {/* Faint diagonal hatch + corner marks read as "frame waiting for a picture", not a broken image. */}
      <span aria-hidden className="absolute inset-0 opacity-60 [background-image:repeating-linear-gradient(135deg,hsl(var(--border)/0.5)_0_1px,transparent_1px_14px)]" />
      {corners && (
        <>
          <span aria-hidden className="absolute left-4 top-4 h-4 w-4 border-l border-t border-foreground/25" />
          <span aria-hidden className="absolute right-4 top-4 h-4 w-4 border-r border-t border-foreground/25" />
          <span aria-hidden className="absolute bottom-4 left-4 h-4 w-4 border-b border-l border-foreground/25" />
          <span aria-hidden className="absolute bottom-4 right-4 h-4 w-4 border-b border-r border-foreground/25" />
        </>
      )}
      <span className="relative flex flex-col items-center gap-2 text-foreground/50">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/20 bg-background/70 backdrop-blur-sm">
          {kind === 'video' ? <Play className="ml-0.5 h-5 w-5" aria-hidden /> : <ImageIcon className="h-5 w-5" aria-hidden />}
        </span>
        {label && <span className="px-4 text-center text-[11px] font-semibold uppercase tracking-[0.2em]">{label}</span>}
      </span>
    </div>
  );
}
