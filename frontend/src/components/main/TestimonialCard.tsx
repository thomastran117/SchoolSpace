import React from "react";
import { Card } from "@common/Card";

export function TestimonialCard({
  quote,
  author,
  role,
  organization,
}: {
  quote: string;
  author: string;
  role: string;
  organization: string;
}) {
  return (
    <Card className="p-7">
      <p className="text-sm italic leading-relaxed text-slate-700">“{quote}”</p>
      <div className="mt-5">
        <div className="text-sm font-semibold text-slate-900">{author}</div>
        <div className="text-xs text-slate-500">
          {role} · {organization}
        </div>
      </div>
    </Card>
  );
}
