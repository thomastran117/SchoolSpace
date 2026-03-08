export default function DataTable({
  rows,
}: {
  rows: Array<{ category: string; examples: string; purpose: string }>;
}) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-12 gap-0 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700">
        <div className="col-span-3">Category</div>
        <div className="col-span-4">Examples</div>
        <div className="col-span-5">Purpose</div>
      </div>
      <div className="divide-y divide-slate-200">
        {rows.map((r) => (
          <div key={r.category} className="grid grid-cols-12 gap-0 px-4 py-3">
            <div className="col-span-3 text-sm font-medium text-slate-900">
              {r.category}
            </div>
            <div className="col-span-4 text-sm text-slate-700">
              {r.examples}
            </div>
            <div className="col-span-5 text-sm text-slate-700">{r.purpose}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
