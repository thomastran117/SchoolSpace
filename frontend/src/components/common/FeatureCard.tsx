import React from "react";
import { Card } from "./Card";
import { cn } from "./cn";

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
          {icon ?? <span className="h-5 w-5 rounded bg-indigo-200" />}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-600">
            {description}
          </div>
        </div>
      </div>
    </Card>
  );
}
