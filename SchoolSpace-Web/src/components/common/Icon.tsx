export default function Icon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
      <span className="text-indigo-600">{children}</span>
    </span>
  );
}
