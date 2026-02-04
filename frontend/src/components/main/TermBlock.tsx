import Divider from "@components/common/Divider";
import { Muted } from "@components/common/Text";
import { Pill } from "@components/common/Pill";

export default function TermBlock({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-24">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">{title}</div>
        </div>
        <Pill className="text-slate-600">Section</Pill>
      </div>
      <Muted className="mt-3 leading-relaxed">{children}</Muted>
      <Divider />
    </div>
  );
}
