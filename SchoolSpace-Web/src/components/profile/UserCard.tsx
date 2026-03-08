import type { User } from "@services/ProfileService";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@common/Card";
import Avatar from "@components/profile/Avatar";
import { Badge } from "@common/Badge";
import Divider from "@common/Divider";
import { ArrowRight } from "lucide-react";

export default function UserCard({ user }: { user: User }) {
  const displayName = user.name ?? user.username ?? "Unnamed";
  const handle = user.username ? `@${user.username}` : `#${user.id}`;

  const href = user.username ? `/u/${user.username}` : `/users/${user.id}`;

  return (
    <Link to={href} className="group block">
      <Card className="transition hover:shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar
              name={user.name}
              username={user.username}
              src={user.avatar}
            />

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {displayName}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-slate-500">
                    {handle}
                  </div>
                </div>

                <div className="shrink-0">
                  <Badge variant="info" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <Divider />

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-500">
                    Faculty
                  </div>
                  <div className="mt-0.5 truncate text-sm text-slate-900">
                    {user.faculty ?? "—"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-500">
                    School
                  </div>
                  <div className="mt-0.5 truncate text-sm text-slate-900">
                    {user.school ?? "—"}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Joined{" "}
                  <span className="font-medium text-slate-700">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 opacity-0 transition group-hover:opacity-100">
                  View <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
