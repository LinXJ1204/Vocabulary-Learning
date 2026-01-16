import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Badge(props: HTMLAttributes<HTMLSpanElement>) {
  const { className, ...rest } = props;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-mutedForeground",
        className
      )}
      {...rest}
    />
  );
}

