import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn("rounded-lg border border-border bg-white shadow-sm", className)}
      {...rest}
    />
  );
}

export function CardHeader(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cn("border-b border-border px-5 py-4", className)} {...rest} />;
}

export function CardTitle(props: HTMLAttributes<HTMLHeadingElement>) {
  const { className, ...rest } = props;
  return <h2 className={cn("text-base font-semibold tracking-tight", className)} {...rest} />;
}

export function CardContent(props: HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return <div className={cn("px-5 py-4", className)} {...rest} />;
}

