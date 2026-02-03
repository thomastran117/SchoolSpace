import React from "react";
import { cn } from "./cn";

export function Eyebrow({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function H1({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl",
        className
      )}
      {...props}
    />
  );
}

export function H2({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl",
        className
      )}
      {...props}
    />
  );
}

export function Lead({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-base leading-relaxed text-slate-600 md:text-lg", className)} {...props} />
  );
}

export function Muted({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm leading-relaxed text-slate-600", className)} {...props} />
  );
}