import { HeroCard } from "@common/HeroCard";
import { Input } from "@common/Input";
import { Pill } from "@common/Pill";

export default function CoursesHeader() {
  return (
    <HeroCard
      eyebrow={
        <>
          <span className="h-2 w-2 rounded-full bg-indigo-600" /> Courses
        </>
      }
      title="Browse courses"
      subtitle="Explore offerings, filter by year, and enroll with one click."
      badge={{ text: "Winter 2026", variant: "info" }}
      stats={[
        { label: "Available", value: "128" },
        { label: "Your enrollments", value: "5" },
        { label: "Departments", value: "14" },
      ]}
      primaryAction={{ label: "View my schedule", onClick: () => {} }}
      secondaryAction={{ label: "Enrollment rules", onClick: () => {} }}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <Input placeholder="Search by course name or code…" />
        <div className="flex flex-wrap items-center gap-2">
          <Pill>1st year</Pill>
          <Pill>2nd year</Pill>
          <Pill>3rd year</Pill>
          <Pill>4th year</Pill>
        </div>
        <Input placeholder="Department…" />
      </div>
    </HeroCard>
  );
}
