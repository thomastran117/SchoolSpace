function initials(nameOrUsername: string) {
  const raw = nameOrUsername.trim();
  if (!raw) return "?";
  const parts = raw.split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  return letters || raw[0].toUpperCase();
}

export default function Avatar({
  name,
  username,
  src,
}: {
  name?: string | null;
  username?: string | null;
  src?: string | null;
}) {
  const label = name || username || "User";
  const fallback = initials(label);

  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      {src ? (
        <img
          src={src}
          alt={`${label} avatar`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-sm font-semibold text-slate-700">
          {fallback}
        </div>
      )}

      {/* subtle ring */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/40" />
    </div>
  );
}
