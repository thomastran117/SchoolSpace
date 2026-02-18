import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@common/Card";
import { Section } from "@common/Section";
import { Button } from "@common/Button";
import Divider from "@common/Divider";
import { Eyebrow, H1, Lead, Muted } from "@common/Text";
import { Pill } from "@common/Pill";

import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Mail,
  MessageSquareText,
  RefreshCcw,
  Server,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

type ServiceStatus = "up" | "degraded" | "down";

function StatusPill({ status }: { status: ServiceStatus }) {
  const cls =
    status === "up"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "degraded"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-rose-200 bg-rose-50 text-rose-700";

  const icon =
    status === "up" ? (
      <CheckCircle2 className="h-3.5 w-3.5" />
    ) : status === "degraded" ? (
      <Clock className="h-3.5 w-3.5" />
    ) : (
      <XCircle className="h-3.5 w-3.5" />
    );

  const label = status === "up" ? "Operational" : status === "degraded" ? "Degraded" : "Down";

  return (
    <Pill className={`gap-2 border ${cls}`}>
      {icon}
      {label}
    </Pill>
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${v}%` }} />
    </div>
  );
}

function StatRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-xs font-medium text-slate-600">{label}</div>
        {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
      </div>
      <div className="shrink-0 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function MiniTile({
  icon,
  title,
  value,
  sub,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="hover:shadow-md transition">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
            {icon}
          </div>
          <Button
            href={href}
            variant="ghost"
            size="sm"
            className="text-indigo-700 hover:bg-indigo-50"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            {cta}
          </Button>
        </div>
        <div className="mt-4">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{sub}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight text-slate-900">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminHomeOverviewPage() {
  // Replace these with real API calls (or pass as props).
  const overview = useMemo(
    () => ({
      users: {
        total: 3214,
        new7d: 84,
        active30d: 2410,
        pendingRoleRequests: 12,
      },
      courses: {
        total: 186,
        active: 164,
        pendingApprovals: 9,
        drafts: 14,
      },
      inbox: {
        contactRequestsOpen: 7,
        ticketsOpen: 26,
        reportsThisMonth: 12,
      },
      monitoring: {
        overall: "up" as ServiceStatus,
        uptime30d: "99.95%",
        apiLatencyP95: "142ms",
        errorRate: "0.18%",
        services: [
          { name: "Backend API", status: "up" as ServiceStatus, meta: "p95 142ms • 0.18% err" },
          { name: "Database", status: "up" as ServiceStatus, meta: "41/100 conns • healthy" },
          { name: "Redis", status: "degraded" as ServiceStatus, meta: "increased latency (cache warmup)" },
          { name: "Worker / Queue", status: "up" as ServiceStatus, meta: "12 jobs • 0 failed" },
        ],
        gauges: [
          { label: "API latency", value: "142ms", pct: 78 },
          { label: "Error rate", value: "0.18%", pct: 18 },
          { label: "Queue backlog", value: "12 jobs", pct: 62 },
          { label: "DB load", value: "41%", pct: 41 },
        ],
      },
    }),
    []
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Hero */}
      <Section className="py-10 md:py-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Eyebrow className="w-fit">
              <ShieldCheck className="h-4 w-4 text-indigo-700" />
              Admin • Overview
            </Eyebrow>

            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <H1 className="md:text-4xl">Admin Home</H1>
                <Lead className="mt-2 max-w-2xl">
                  Quick visibility into users, courses, inbox, and backend health.
                </Lead>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  href="/admin/contact"
                  variant="outline"
                  leftIcon={<Mail className="h-4 w-4" />}
                >
                  Contact Requests
                </Button>

                <Button
                  href="/admin/tickets"
                  variant="outline"
                  leftIcon={<MessageSquareText className="h-4 w-4" />}
                >
                  Tickets
                </Button>

                <Button
                  href="/admin/reports"
                  variant="primary"
                  leftIcon={<FileText className="h-4 w-4" />}
                >
                  Reports
                </Button>
              </div>
            </div>
          </div>

          <Divider />
        </div>
      </Section>

      {/* Overview Tiles */}
      <Section className="py-0 md:py-0" containerClassName="pb-10">
        <div className="grid gap-4 md:grid-cols-2">
          <MiniTile
            icon={<Users className="h-5 w-5" />}
            title="Users"
            sub="Accounts, roles, and activity."
            value={overview.users.total.toLocaleString()}
            href="/admin/users"
            cta="Manage"
          />

          <MiniTile
            icon={<BookOpen className="h-5 w-5" />}
            title="Courses"
            sub="Templates, approvals, and publishing."
            value={overview.courses.total.toLocaleString()}
            href="/admin/courses"
            cta="Open"
          />
        </div>

        {/* Users + Courses Containers */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Users container */}
          <Card className="lg:col-span-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>User Overview</CardTitle>
                  <CardDescription>
                    Recent activity and pending admin actions.
                  </CardDescription>
                </div>
                <Button
                  href="/admin/users"
                  variant="ghost"
                  size="sm"
                  className="text-indigo-700 hover:bg-indigo-50"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View users
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <StatRow
                  label="New users (7d)"
                  value={overview.users.new7d.toLocaleString()}
                  hint="Created accounts in the last 7 days"
                />
                <StatRow
                  label="Active users (30d)"
                  value={overview.users.active30d.toLocaleString()}
                  hint="Signed in or performed activity"
                />
                <StatRow
                  label="Pending role requests"
                  value={overview.users.pendingRoleRequests.toLocaleString()}
                  hint="Awaiting admin review"
                />

                <Divider />

                <div className="flex flex-wrap gap-2">
                  <Button
                    href="/admin/users/create"
                    variant="outline"
                    leftIcon={<Users className="h-4 w-4" />}
                  >
                    Add user
                  </Button>
                  <Button
                    href="/admin/users/roles"
                    variant="outline"
                    leftIcon={<ShieldCheck className="h-4 w-4" />}
                  >
                    Roles & access
                  </Button>
                  <Button
                    href="/admin/users/audit"
                    variant="ghost"
                    className="text-indigo-700 hover:bg-indigo-50"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Audit log
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courses container */}
          <Card className="lg:col-span-6">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Course Overview</CardTitle>
                  <CardDescription>
                    Publish flow, pending approvals, and drafts.
                  </CardDescription>
                </div>
                <Button
                  href="/admin/courses"
                  variant="ghost"
                  size="sm"
                  className="text-indigo-700 hover:bg-indigo-50"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View courses
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <StatRow
                  label="Active courses"
                  value={overview.courses.active.toLocaleString()}
                  hint="Currently visible to students"
                />
                <StatRow
                  label="Pending approvals"
                  value={overview.courses.pendingApprovals.toLocaleString()}
                  hint="Waiting for admin approval"
                />
                <StatRow
                  label="Drafts"
                  value={overview.courses.drafts.toLocaleString()}
                  hint="Not yet submitted or published"
                />

                <Divider />

                <div className="flex flex-wrap gap-2">
                  <Button
                    href="/admin/courses/create"
                    variant="outline"
                    leftIcon={<BookOpen className="h-4 w-4" />}
                  >
                    Create course
                  </Button>
                  <Button
                    href="/admin/courses/approvals"
                    variant="outline"
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    Approvals
                  </Button>
                  <Button
                    href="/admin/courses/catalogue"
                    variant="ghost"
                    className="text-indigo-700 hover:bg-indigo-50"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Catalogue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inbox / Requests container */}
          <Card className="lg:col-span-7">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Inbox</CardTitle>
                  <CardDescription>
                    Contact requests, tickets, and report generation shortcuts.
                  </CardDescription>
                </div>
                <Button
                  href="/admin/inbox"
                  variant="ghost"
                  size="sm"
                  className="text-indigo-700 hover:bg-indigo-50"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Open inbox
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <Pill className="gap-2">
                      <Mail className="h-4 w-4 text-indigo-700" />
                      Contact
                    </Pill>
                    <div className="text-xl font-semibold text-slate-900">
                      {overview.inbox.contactRequestsOpen}
                    </div>
                  </div>
                  <Muted className="mt-2">Open requests awaiting a response.</Muted>
                  <div className="mt-3">
                    <Button
                      href="/admin/contact"
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Review
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <Pill className="gap-2">
                      <MessageSquareText className="h-4 w-4 text-indigo-700" />
                      Tickets
                    </Pill>
                    <div className="text-xl font-semibold text-slate-900">
                      {overview.inbox.ticketsOpen}
                    </div>
                  </div>
                  <Muted className="mt-2">Support tickets requiring triage.</Muted>
                  <div className="mt-3">
                    <Button
                      href="/admin/tickets"
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Triage
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <Pill className="gap-2">
                      <BarChart3 className="h-4 w-4 text-indigo-700" />
                      Reports
                    </Pill>
                    <div className="text-xl font-semibold text-slate-900">
                      {overview.inbox.reportsThisMonth}
                    </div>
                  </div>
                  <Muted className="mt-2">Reports generated this month.</Muted>
                  <div className="mt-3">
                    <Button
                      href="/admin/reports"
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

            <div className="my-5 h-px w-full bg-slate-200" />
              <div className="flex flex-wrap gap-2">
                <Button
                  href="/admin/contact"
                  variant="outline"
                  leftIcon={<Mail className="h-4 w-4" />}
                >
                  Contact requests
                </Button>
                <Button
                  href="/admin/tickets"
                  variant="outline"
                  leftIcon={<MessageSquareText className="h-4 w-4" />}
                >
                  Tickets
                </Button>
                <Button
                  href="/admin/reports"
                  variant="primary"
                  leftIcon={<FileText className="h-4 w-4" />}
                >
                  Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Service Monitoring container */}
          <Card className="lg:col-span-5">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Service Monitoring</CardTitle>
                  <CardDescription>Backend status & key health indicators.</CardDescription>
                </div>
                <StatusPill status={overview.monitoring.overall} />
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Server className="h-4 w-4 text-indigo-700" />
                      Uptime (30d)
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                      {overview.monitoring.uptime30d}
                    </div>
                    <Muted className="mt-1">Rolling last 30 days.</Muted>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <RefreshCcw className="h-4 w-4 text-indigo-700" />
                      p95 latency
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">
                      {overview.monitoring.apiLatencyP95}
                    </div>
                    <Muted className="mt-1">API response percentile.</Muted>
                  </div>
                </div>

                <Divider />

                <div className="space-y-3">
                  {overview.monitoring.services.map((s) => (
                    <div
                      key={s.name}
                      className="rounded-2xl border border-slate-200 bg-white p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {s.name === "Backend API" ? (
                            <Server className="h-4 w-4 text-indigo-700" />
                          ) : s.name === "Database" ? (
                            <Database className="h-4 w-4 text-indigo-700" />
                          ) : s.name === "Redis" ? (
                            <ShieldCheck className="h-4 w-4 text-indigo-700" />
                          ) : (
                            <BarChart3 className="h-4 w-4 text-indigo-700" />
                          )}
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              {s.name}
                            </div>
                            <div className="truncate text-xs text-slate-600">
                              {s.meta}
                            </div>
                          </div>
                        </div>
                        <StatusPill status={s.status} />
                      </div>
                    </div>
                  ))}
                </div>

                <Divider />

                <div className="space-y-3">
                  {overview.monitoring.gauges.map((g) => (
                    <div key={g.label}>
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-medium text-slate-900">{g.label}</div>
                        <div className="text-slate-600">{g.value}</div>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={g.pct} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <Button
                    href="/admin/monitoring"
                    variant="outline"
                    leftIcon={<Server className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                  >
                    Open monitoring
                  </Button>
                  <Button
                    href="/admin/logs"
                    variant="ghost"
                    className="w-full text-indigo-700 hover:bg-indigo-50 sm:w-auto"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    View logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </div>
  );
}
