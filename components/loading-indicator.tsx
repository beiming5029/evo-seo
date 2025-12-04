import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LoadingIndicatorProps = {
  label?: string;
  size?: "sm" | "md";
  className?: string;
  rounded?: boolean;
};

export function LoadingIndicator({
  label = "加载中...",
  size = "md",
  className,
  rounded = true,
}: LoadingIndicatorProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border border-border/60 bg-muted/50 px-3 py-1 text-muted-foreground shadow-sm",
        rounded ? "rounded-full" : "rounded-md",
        textSize,
        className
      )}
    >
      <Loader2 className={cn(iconSize, "animate-spin text-primary")} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
