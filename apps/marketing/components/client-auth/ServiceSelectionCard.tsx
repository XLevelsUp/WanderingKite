import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceSelectionCardProps {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

export function ServiceSelectionCard({
  label,
  description,
  selected,
  onClick,
}: ServiceSelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start p-5 rounded-xl border text-left transition-all duration-200 outline-none select-none cursor-pointer w-full",
        selected
          ? "border-amber-500 bg-amber-500/10 shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)]"
          : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
      )}
    >
      <div className="flex w-full items-center justify-between">
        <span className={cn(
          "font-semibold text-lg transition-colors",
          selected ? "text-amber-500" : "text-white"
        )}>
          {label}
        </span>
        <div className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border transition-all",
          selected
            ? "border-amber-500 bg-amber-500 text-slate-950"
            : "border-slate-700 bg-transparent"
        )}>
          {selected && <Check className="h-3 w-3 stroke-[3]" />}
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-400 leading-relaxed">
        {description}
      </p>
    </button>
  );
}
