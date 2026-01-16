import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
  }
) {
  const { className, variant = "primary", size = "md", ...rest } = props;

  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<Variant, string> = {
    primary: "bg-primary text-primaryForeground hover:bg-primary/90",
    secondary: "bg-muted text-foreground hover:bg-muted/80",
    ghost: "bg-transparent text-foreground hover:bg-muted",
    danger: "bg-danger text-dangerForeground hover:bg-danger/90"
  };

  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm"
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...rest} />;
}

