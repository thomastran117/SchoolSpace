import { Pill } from "./Pill";
import { Muted } from "./Text";

export default function TimelineItem({
  when,
  title,
  desc,
  tag,
}: {
  when: string;
  title: string;
  desc: string;
  tag: string;
}) {
  return (
    <div className="grid gap-2 py-5 md:grid-cols-12 md:gap-6">
      <div className="md:col-span-3">
        <div className="text-xs font-medium text-slate-500">{when}</div>
        <div className="mt-2 inline-flex">
          <Pill className="text-slate-600">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
            {tag}
          </Pill>
        </div>
      </div>

      <div className="md:col-span-9">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <Muted className="mt-1">{desc}</Muted>
      </div>
    </div>
  );
}
