export default function SectionLink({
  title,
  active,
  onClick,
}: {
  id: string;
  title: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-xl border px-3 py-2 text-left text-sm transition",
        active
          ? "border-indigo-200 bg-indigo-50/60 text-indigo-800"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        <span className="mt-1 inline-flex h-4 w-4 items-center justify-center">
          <span
            className={[
              "h-1.5 w-1.5 rounded-full",
              active ? "bg-indigo-500" : "bg-slate-300",
            ].join(" ")}
          />
        </span>
        <span className="font-medium">{title}</span>
      </div>
    </button>
  );
}
