// src/ui/HeroCard.tsx
import React from "react";
import { cn } from "./cn";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button, type ButtonProps } from "./Button";

type HeroCardAction = Pick<ButtonProps, "onClick" | "href"> & {
  label: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: ButtonProps["type"];
};

type HeroStat = {
  label: string;
  value: React.ReactNode;
};

export function HeroCard({
  eyebrow,
  title,
  subtitle,
  badge,
  stats,
  primaryAction,
  secondaryAction,
  children,
  tone = "default",
  align = "left",
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: {
    text: string;
    variant?: "neutral" | "info" | "success" | "warning";
  };
  stats?: HeroStat[];
  primaryAction?: HeroCardAction;
  secondaryAction?: HeroCardAction;
  children?: React.ReactNode; // optional slot for filters/search/etc.
  tone?: "default" | "soft";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        tone === "soft" && "bg-slate-50/60",
        className,
      )}
    >
      {/* Subtle highlight */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/2 h-56 w-[680px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-50 via-white to-indigo-50 blur-3xl" />
      </div>

      <div
        className={cn(
          "relative p-6 md:p-8",
          align === "center" ? "text-center" : "text-left",
        )}
      >
        {/* Top row: eyebrow + badge */}
        <div
          className={cn(
            "flex flex-col gap-3",
            align === "center" ? "items-center" : "items-start",
          )}
        >
          <div
            className={cn(
              "flex flex-wrap items-center gap-2",
              align === "center" ? "justify-center" : "justify-start",
            )}
          >
            {eyebrow ? (
              <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                {eyebrow}
              </div>
            ) : null}

            {badge ? (
              <Badge variant={badge.variant ?? "info"}>{badge.text}</Badge>
            ) : null}
          </div>

          {/* Title + subtitle */}
          <div className={cn("w-full", align === "center" && "max-w-3xl")}>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>

          {/* Actions */}
          {(primaryAction || secondaryAction) && (
            <div
              className={cn(
                "mt-1 flex flex-col gap-2 sm:flex-row",
                align === "center" ? "justify-center" : "justify-start",
              )}
            >
              {primaryAction ? (
                <Button
                  variant={primaryAction.variant ?? "primary"}
                  size={primaryAction.size ?? "md"}
                  onClick={primaryAction.onClick}
                  // @ts-expect-error - expected
                  href={primaryAction.href}
                  leftIcon={primaryAction.leftIcon}
                  rightIcon={primaryAction.rightIcon}
                  loading={primaryAction.loading}
                  disabled={primaryAction.disabled}
                  type={primaryAction.type}
                >
                  {primaryAction.label}
                </Button>
              ) : null}

              {secondaryAction ? (
                <Button
                  variant={secondaryAction.variant ?? "outline"}
                  size={secondaryAction.size ?? "md"}
                  onClick={secondaryAction.onClick}
                  // @ts-expect-error - expected
                  href={secondaryAction.href}
                  leftIcon={secondaryAction.leftIcon}
                  rightIcon={secondaryAction.rightIcon}
                  loading={secondaryAction.loading}
                  disabled={secondaryAction.disabled}
                  type={secondaryAction.type}
                >
                  {secondaryAction.label}
                </Button>
              ) : null}
            </div>
          )}
        </div>

        {/* filters/search */}
        {children ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            {children}
          </div>
        ) : null}

        {/* Stats */}
        {stats && stats.length > 0 ? (
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {stats.slice(0, 3).map((s) => (
              <div
                key={String(s.label)}
                className={cn(
                  "rounded-2xl border border-slate-200 bg-white p-4",
                  align === "center" && "text-left",
                )}
              >
                <div className="text-xs font-medium text-slate-500">
                  {s.label}
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
