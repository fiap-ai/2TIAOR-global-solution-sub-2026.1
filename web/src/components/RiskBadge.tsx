import { cn } from "@/lib/utils";
import { RISK_STYLES } from "@/lib/risk";
import type { RiskLabel } from "@/lib/types";

interface RiskBadgeProps {
  label: RiskLabel;
  className?: string;
}

/** Colored pill showing a territorial-risk verdict. */
export function RiskBadge({ label, className }: RiskBadgeProps) {
  const style = RISK_STYLES[label];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        style.bg,
        style.text,
        className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", style.dot)} />
      {label}
    </span>
  );
}
