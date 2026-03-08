import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  X,
  BookOpen,
  Clock,
  Users,
  GraduationCap,
  Star,
} from "lucide-react";

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
import { Dropdown, type DropdownOption } from "@common/Dropdown";
import { Pill } from "@common/Pill";

type Category = "All" | "Course" | "Program" | "School";
type SortKey = "relevance" | "newest" | "name" | "rating";

type CatalogueItem = {
  id: string;
  title: string;
  category: "Course" | "Program" | "School";
  institution: string;
  description: string;
  tags: string[];
  rating: number;
  enrolled: number;
  duration: string;
  updatedAt: string;
};

const SAMPLE_DATA: CatalogueItem[] = [
  {
    id: "1",
    title: "COMP 2406 – Web Development",
    category: "Course",
    institution: "Carleton University",
    description:
      "Full-stack web development using modern JavaScript frameworks, REST APIs, and databases.",
    tags: ["Computer Science", "Web", "Full-stack"],
    rating: 4.7,
    enrolled: 312,
    duration: "1 semester",
    updatedAt: "2026-01-15",
  },
  {
    id: "2",
    title: "PSYC 1001 – Introduction to Psychology",
    category: "Course",
    institution: "University of Ottawa",
    description:
      "Survey of major psychological concepts including cognition, behaviour, and mental health.",
    tags: ["Psychology", "Social Science"],
    rating: 4.3,
    enrolled: 540,
    duration: "1 semester",
    updatedAt: "2026-02-01",
  },
  {
    id: "3",
    title: "B.Sc. Computer Science",
    category: "Program",
    institution: "Carleton University",
    description:
      "Four-year honours program covering algorithms, systems, AI, and software engineering.",
    tags: ["Computer Science", "Honours", "4-year"],
    rating: 4.6,
    enrolled: 1280,
    duration: "4 years",
    updatedAt: "2025-09-01",
  },
  {
    id: "4",
    title: "MATH 1007 – Elementary Calculus I",
    category: "Course",
    institution: "Carleton University",
    description:
      "Limits, derivatives, and integrals of single-variable functions with applications.",
    tags: ["Mathematics", "Calculus"],
    rating: 4.1,
    enrolled: 620,
    duration: "1 semester",
    updatedAt: "2026-01-10",
  },
  {
    id: "5",
    title: "University of Ottawa",
    category: "School",
    institution: "Ottawa, ON",
    description:
      "Canada's largest bilingual university with over 40,000 students and 450+ programs.",
    tags: ["Bilingual", "Research", "Ontario"],
    rating: 4.4,
    enrolled: 42000,
    duration: "",
    updatedAt: "2025-08-20",
  },
  {
    id: "6",
    title: "BIOL 1010 – General Biology",
    category: "Course",
    institution: "Algonquin College",
    description:
      "Introduction to cell biology, genetics, evolution, and ecology.",
    tags: ["Biology", "Science"],
    rating: 4.0,
    enrolled: 280,
    duration: "1 semester",
    updatedAt: "2026-01-20",
  },
  {
    id: "7",
    title: "B.A. Psychology",
    category: "Program",
    institution: "University of Ottawa",
    description:
      "Comprehensive study of human behaviour with optional co-op and research streams.",
    tags: ["Psychology", "Co-op", "3-year"],
    rating: 4.5,
    enrolled: 960,
    duration: "3–4 years",
    updatedAt: "2025-09-15",
  },
  {
    id: "8",
    title: "Carleton University",
    category: "School",
    institution: "Ottawa, ON",
    description:
      "Known for engineering, computer science, journalism, and public affairs. 30,000+ students.",
    tags: ["Research", "Ontario", "Co-op"],
    rating: 4.5,
    enrolled: 31000,
    duration: "",
    updatedAt: "2025-08-15",
  },
  {
    id: "9",
    title: "ECON 1001 – Introduction to Economics",
    category: "Course",
    institution: "University of Ottawa",
    description:
      "Fundamentals of micro and macroeconomics, market structures, and fiscal policy.",
    tags: ["Economics", "Social Science"],
    rating: 4.2,
    enrolled: 410,
    duration: "1 semester",
    updatedAt: "2026-02-05",
  },
];

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function scoreItem(item: CatalogueItem, q: string) {
  const query = normalize(q);
  if (!query) return 0;

  const fields = [
    item.title,
    item.institution,
    item.description,
    ...item.tags,
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

const categoryIcon: Record<CatalogueItem["category"], React.ReactNode> = {
  Course: <BookOpen className="h-4 w-4" />,
  Program: <GraduationCap className="h-4 w-4" />,
  School: <Users className="h-4 w-4" />,
};

function CatalogueCard({ item }: { item: CatalogueItem }) {
  return (
    <Card className="flex flex-col justify-between p-5 transition hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              {categoryIcon[item.category]}
            </div>
            <Badge
              variant={
                item.category === "Course"
                  ? "info"
                  : item.category === "Program"
                    ? "success"
                    : "warning"
              }
            >
              {item.category}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-amber-600">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span className="font-medium">{item.rating}</span>
          </div>
        </div>

        <h3 className="mt-3 text-base font-semibold text-slate-900 leading-snug">
          {item.title}
        </h3>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {item.institution}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">
          {item.description}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <Pill key={tag} className="text-[11px]">
              {tag}
            </Pill>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {item.duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {item.duration}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {item.enrolled.toLocaleString()}
          </span>
        </div>
        <Button variant="outline" size="sm" title="View" href={`#`} />
      </div>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-slate-100" />
          <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
        <div className="h-4 w-10 rounded bg-slate-100" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-5 w-3/4 rounded bg-slate-100" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
        <div className="mt-2 h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-2/3 rounded bg-slate-100" />
      </div>
      <div className="mt-4 flex gap-1.5">
        <div className="h-5 w-16 rounded-full bg-slate-100" />
        <div className="h-5 w-20 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("search") ?? "";

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<Category>("All");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CatalogueItem[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const sortOptions: DropdownOption[] = [
    { label: "Relevance", value: "relevance" },
    { label: "Newest", value: "newest" },
    { label: "Name (A–Z)", value: "name" },
    { label: "Rating", value: "rating" },
  ];

  const categoryOptions: DropdownOption[] = [
    { label: "All", value: "All" },
    { label: "Courses", value: "Course" },
    { label: "Programs", value: "Program" },
    { label: "Schools", value: "School" },
  ];

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setItems(SAMPLE_DATA);
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (query && query !== current) {
      setSearchParams({ search: query }, { replace: true });
    } else if (!query && current) {
      setSearchParams({}, { replace: true });
    }
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim();
    let list = items;

    if (category !== "All") {
      list = list.filter((item) => item.category === category);
    }

    if (q) {
      const nq = normalize(q);
      list = list.filter((item) => {
        const hay = [
          item.title,
          item.institution,
          item.description,
          ...item.tags,
        ]
          .join(" ");
        return normalize(hay).includes(nq);
      });
    }

    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sort === "newest")
        return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      if (sort === "name") return a.title.localeCompare(b.title);
      if (sort === "rating") return b.rating - a.rating;

      const sa = scoreItem(a, q);
      const sb = scoreItem(b, q);
      if (sb !== sa) return sb - sa;
      return a.title.localeCompare(b.title);
    });

    return sorted;
  }, [items, query, category, sort]);

  const activeFilterCount = category !== "All" ? 1 : 0;

  const clearAll = () => {
    setQuery("");
    setCategory("All");
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
              { label: "Catalogue", current: true },
            ]}
          />

          <HeroCard
            eyebrow={
              <span className="inline-flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-500" />
                <span>Catalogue</span>
              </span>
            }
            title="Search courses, programs, and schools"
            subtitle="Explore the full academic catalogue. Filter by type, sort by what matters, and find the right fit for your goals."
            badge={{
              text: loading
                ? "Loading…"
                : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`,
              variant: "info",
            }}
            stats={[
              { label: "Total listings", value: items.length },
              { label: "Active filters", value: activeFilterCount },
              {
                label: "Sort",
                value: <span className="capitalize">{sort}</span>,
              },
            ]}
            tone="soft"
          >
            <div className="grid gap-4 md:grid-cols-12 md:items-end">
              <div className="md:col-span-5">
                <Input
                  ref={inputRef}
                  label="Search"
                  placeholder="Search by name, subject, institution…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="md:col-span-3">
                <Dropdown
                  label="Category"
                  value={category}
                  onChange={(v) => setCategory(v as Category)}
                  options={categoryOptions}
                />
              </div>

              <div className="md:col-span-2">
                <Dropdown
                  label="Sort"
                  value={sort}
                  onChange={(v) => setSort(v as SortKey)}
                  options={sortOptions}
                />
              </div>

              <div className="md:col-span-2">
                <div className="hidden md:block">
                  <div className="h-[22px]" />
                </div>
                <Button
                  variant="outline"
                  leftIcon={<X className="h-4 w-4" />}
                  onClick={clearAll}
                  className="w-full"
                >
                  Clear
                </Button>
              </div>

              <div className="md:col-span-12">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="neutral"
                    className="inline-flex items-center gap-1.5"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>
                      {query.trim()
                        ? `Searching "${query.trim()}"`
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
              </div>
            </div>
          </HeroCard>

          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Browse courses, programs, and institutions across the
                SchoolSpace catalogue.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  title="No results found"
                  description="Try a different search term, or clear filters to see all listings."
                  actionLabel="Clear search & filters"
                  onAction={clearAll}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((item) => (
                    <CatalogueCard key={item.id} item={item} />
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
