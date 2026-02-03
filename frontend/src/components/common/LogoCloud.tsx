import React from "react";
import { Card } from "./Card";

export function LogoCloud({ names }: { names: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {names.map((n) => (
        <Card
          key={n}
          className="flex h-14 items-center justify-center px-4 text-sm font-semibold text-slate-400"
        >
          {n}
        </Card>
      ))}
    </div>
  );
}
