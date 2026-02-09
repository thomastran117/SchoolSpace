import { Button } from "@common/Button";
import { Card } from "@common/Card";
import CheckRow from "@common/CheckRow";
import Divider from "@common/Divider";
import { Muted } from "@common/Text";
import { Pill } from "@common/Pill";

export default function ServiceTierCard({
  name,
  tagline,
  highlight,
  priceNote,
  features,
  cta,
  variant = "default",
}: {
  name: string;
  tagline: string;
  highlight?: string;
  priceNote: string;
  features: string[];
  cta: { label: string; href?: string; onClick?: () => void };
  variant?: "default" | "featured";
}) {
  const featured = variant === "featured";

  return (
    <Card
      className={[
        "p-7",
        featured
          ? "border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-white shadow-md"
          : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">{name}</div>
            {highlight ? (
              <Pill className="text-indigo-700">{highlight}</Pill>
            ) : null}
          </div>
          <Muted className="mt-1">{tagline}</Muted>
        </div>

        <div className="text-right">
          <div className="text-sm font-semibold text-slate-900">
            {priceNote}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Campus-friendly pricing
          </div>
        </div>
      </div>

      <Divider />

      <div className="mt-5 space-y-3">
        {features.map((f) => (
          <CheckRow key={f}>{f}</CheckRow>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button
          href={cta.href}
          onClick={cta.onClick}
          variant={featured ? "primary" : "outline"}
          className="sm:flex-1"
        >
          {cta.label}
        </Button>

        <Button variant="ghost" className="text-slate-700 sm:flex-1">
          See details
        </Button>
      </div>
    </Card>
  );
}
