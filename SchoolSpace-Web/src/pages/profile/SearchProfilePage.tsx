import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X, Users } from "lucide-react";

import { Container } from "@common/Container";
import { Breadcrumb } from "@common/BreadCrumb";
import { HeroCard } from "@common/HeroCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@common/Card";
import { Input } from "@common/Input";
import { Badge } from "@common/Badge";
import { Button } from "@common/Button";
import { EmptyState } from "@common/EmptyState";

import { getUsers, type User } from "@services/ProfileService";
import { Dropdown, type DropdownOption } from "@common/Dropdown";
import UserCard from "@/components/profile/UserCard";

type SortKey = "relevance" | "newest" | "username";

type Filters = {
  role: string;
  faculty: string;
  school: string;
};

const DEFAULT_FILTERS: Filters = { role: "All", faculty: "All", school: "All" };

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function uniqSorted(values: Array<string | null | undefined>) {
  const set = new Set(
    values.map((v) => (v ?? "").trim()).filter((v) => v.length > 0),
  );
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function initials(nameOrUsername: string) {
  const raw = nameOrUsername.trim();
  if (!raw) return "?";
  const parts = raw.split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  return letters || raw[0].toUpperCase();
}

function scoreUser(u: User, q: string) {
  const query = normalize(q);
  if (!query) return 0;

  const fields = [
    u.username ?? "",
    u.name ?? "",
    u.faculty ?? "",
    u.school ?? "",
    u.role ?? "",
  ].map(normalize);

  let score = 0;

  for (const f of fields) {
    if (!f) continue;
    if (f === query) score += 100;
    else if (f.startsWith(query)) score += 40;
    else if (f.includes(query)) score += 15;
  }

  return score;
}

export default function SearchProfilePage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("relevance");

  const inputRef = useRef<HTMLInputElement | null>(null);

  const sortOptions: DropdownOption[] = [
    { label: "Relevance", value: "relevance" },
    { label: "Newest", value: "newest" },
    { label: "Username", value: "username" },
  ];

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUsers();
        if (!mounted) return;
        setUsers(data ?? []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message ?? "Failed to load users.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const facets = useMemo(() => {
    const roles = uniqSorted(users.map((u) => u.role));
    const faculties = uniqSorted(users.map((u) => u.faculty));
    const schools = uniqSorted(users.map((u) => u.school));

    return {
      roles: ["All", ...roles],
      faculties: ["All", ...faculties],
      schools: ["All", ...schools],
    };
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim();

    let list = users;

    if (filters.role !== "All")
      list = list.filter((u) => u.role === filters.role);
    if (filters.faculty !== "All")
      list = list.filter((u) => (u.faculty ?? "") === filters.faculty);
    if (filters.school !== "All")
      list = list.filter((u) => (u.school ?? "") === filters.school);

    if (q) {
      const nq = normalize(q);
      list = list.filter((u) => {
        const hay = [u.username, u.name, u.role, u.faculty, u.school]
          .filter(Boolean)
          .join(" ");
        return normalize(hay).includes(nq);
      });
    }

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "newest") {
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      }
      if (sort === "username") {
        return (a.username ?? "").localeCompare(b.username ?? "");
      }

      const sa = scoreUser(a, q);
      const sb = scoreUser(b, q);
      if (sb !== sa) return sb - sa;

      const na = (a.name ?? a.username ?? "").toLowerCase();
      const nb = (b.name ?? b.username ?? "").toLowerCase();
      return na.localeCompare(nb);
    });

    return sorted;
  }, [users, query, filters, sort]);

  const activeFilterCount =
    (filters.role !== "All" ? 1 : 0) +
    (filters.faculty !== "All" ? 1 : 0) +
    (filters.school !== "All" ? 1 : 0);

  const clearAll = () => {
    setQuery("");
    setFilters(DEFAULT_FILTERS);
    setSort("relevance");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Container className="py-8">
        <div className="space-y-4">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "People", current: true },
            ]}
          />

          <HeroCard
            eyebrow={
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span>Community directory</span>
              </span>
            }
            title="Find people on SchoolSpace"
            subtitle="Search public profiles by name or username, then filter by role, faculty, and school. Keep it simple, fast, and admin-friendly."
            badge={{
              text: loading
                ? "Loading…"
                : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`,
              variant: "info",
            }}
            stats={[
              { label: "Total users", value: users.length },
              { label: "Active filters", value: activeFilterCount },
              {
                label: "Sort",
                value: <span className="capitalize">{sort}</span>,
              },
            ]}
            tone="soft"
          >
            <div className="grid gap-4 md:grid-cols-12 md:items-end">
              <div className="md:col-span-6">
                <Input
                  ref={inputRef}
                  label="Search"
                  placeholder="Search by name, username, faculty, or school…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Dropdown
                  label="Role"
                  value={filters.role}
                  onChange={(v) => setFilters((p) => ({ ...p, role: v }))}
                  options={facets.roles.map((r) => ({
                    label: r,
                    value: r,
                  }))}
                />
              </div>

              <div className="md:col-span-2">
                <Dropdown
                  label="Faculty"
                  value={filters.faculty}
                  onChange={(v) => setFilters((p) => ({ ...p, role: v }))}
                  options={facets.faculties.map((r) => ({
                    label: r,
                    value: r,
                  }))}
                />
              </div>

              <div className="md:col-span-2">
                <Dropdown
                  label="School"
                  value={filters.school}
                  onChange={(v) => setFilters((p) => ({ ...p, role: v }))}
                  options={facets.schools.map((r) => ({
                    label: r,
                    value: r,
                  }))}
                />
              </div>

              <div className="md:col-span-12">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="neutral"
                      className="inline-flex items-center gap-1.5"
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span>
                        {query.trim()
                          ? `Searching “${query.trim()}”`
                          : "No search query"}
                      </span>
                    </Badge>

                    <Badge
                      variant={activeFilterCount ? "warning" : "neutral"}
                      className="inline-flex items-center gap-1.5"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span>
                        {activeFilterCount
                          ? `${activeFilterCount} filter(s) active`
                          : "No filters"}
                      </span>
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="w-full sm:w-52">
                      <Dropdown
                        label="Sort"
                        value={sort}
                        onChange={(v) => setSort(v as SortKey)}
                        options={sortOptions}
                      />
                    </div>

                    <div className="w-full sm:w-auto">
                      <div className="h-[22px]" />{" "}
                      <Button
                        variant="outline"
                        leftIcon={<X className="h-4 w-4" />}
                        onClick={clearAll}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </HeroCard>

          {/* Body */}
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Only public-safe fields are shown (name, username, avatar, role,
                faculty, school).
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error ? (
                <EmptyState
                  title="Couldn’t load profiles"
                  description={error}
                  actionLabel="Retry"
                  onAction={() => window.location.reload()}
                />
              ) : loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[170px] rounded-3xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="h-11 w-11 rounded-2xl bg-slate-100" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-2/3 rounded bg-slate-100" />
                            <div className="h-3 w-1/3 rounded bg-slate-100" />
                            <div className="mt-4 h-10 w-full rounded-2xl bg-slate-100" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  title="No matches"
                  description="Try a different search term, or clear filters to broaden results."
                  actionLabel="Clear search & filters"
                  onAction={clearAll}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((u) => (
                    <UserCard key={u.id} user={u} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
