export default function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((x) => (
        <li key={x} className="flex gap-3 text-sm text-slate-700">
          <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
          <span>{x}</span>
        </li>
      ))}
    </ul>
  );
}
