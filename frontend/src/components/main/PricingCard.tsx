import { Card } from "@common/Card";
import { cn } from "@common/cn";
import { Button } from "@common/Button";

export function PricingCard({
  title,
  price,
  description,
  features,
  highlighted,
  onChoose,
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  onChoose?: () => void;
}) {
  return (
    <Card
      className={cn(
        "relative p-7",
        highlighted
          ? "border-indigo-300 ring-1 ring-indigo-200 shadow-md"
          : "border-slate-200",
      )}
    >
      {highlighted ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          Most Popular
        </span>
      ) : null}

      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-1 text-sm text-slate-600">{description}</div>

      <div className="mt-5 flex items-end gap-2">
        <div className="text-3xl font-semibold tracking-tight text-slate-900">
          {price}
        </div>
        {price !== "Custom" ? (
          <div className="pb-1 text-sm text-slate-500">/ month</div>
        ) : null}
      </div>

      <ul className="mt-5 space-y-2 text-sm text-slate-700">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-indigo-600" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7">
        <Button
          variant={highlighted ? "primary" : "outline"}
          className="w-full"
          title="Choose plan"
          onClick={onChoose}
        />
      </div>
    </Card>
  );
}
