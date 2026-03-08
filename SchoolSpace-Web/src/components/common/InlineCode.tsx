export default function InlineCode({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-700">
      {children}
    </span>
  );
}
