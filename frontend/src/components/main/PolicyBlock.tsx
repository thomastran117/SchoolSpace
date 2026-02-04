import { Pill } from "@components/common/Pill";
import { Muted } from "@components/common/Text";
import Divider from "@components/common/Divider";

export default function PolicyBlock({
  id,
  title,
  children,
  tag = "Section",
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  tag?: string;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex items-start justify-between gap-4">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <Pill className="text-slate-600">{tag}</Pill>
      </div>
      <Muted className="mt-3 leading-relaxed">{children}</Muted>
      <Divider />
    </div>
  );
}
