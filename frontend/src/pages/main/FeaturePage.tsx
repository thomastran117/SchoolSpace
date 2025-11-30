import React from "react";
import MainHeroCard from "../../components/main/MainHeroCard";
import SectionHeader from "../../components/main/SectionHeader";
import ServiceCard from "../../components/main/ServiceCard";
import StepCard from "../../components/main/StepCard";
import CallToActionSection from "../../components/main/CallToActionSection";

const FeaturePage: React.FC = () => {
  return (
    <main className="service-page">
      <div className="service-page-gradient gradient-1" />
      <div className="service-page-gradient gradient-2" />

      <MainHeroCard
        badge="Features"
        title="Tools that simplify academic life"
        subtitle="SchoolSpace unifies communication, scheduling, and resources into a single, modern platform."
        primaryBtnText="Get Started"
        primaryBtnIcon="bi bi-rocket-takeoff-fill"
        primaryBtnLink="/start"
        secondaryBtnText="View Pricing"
        secondaryBtnIcon="bi bi-currency-dollar"
        secondaryBtnLink="/pricing"
      />

      <section className="service-section">
        <div className="container">
          <SectionHeader
            badge="Core Features"
            title="Everything you need, all in one place"
            subtitle="Powerful tools that reduce friction and help schools stay organized."
          />

          <div className="row g-4 mt-4">
            <div className="col-md-4">
              <ServiceCard
                letter="C"
                title="Announcements"
                text="Modern communication tools that keep classes aligned."
                features={[
                  "Smart feeds",
                  "Role-based alerts",
                  "Parent/teacher channels",
                ]}
              />
            </div>

            <div className="col-md-4">
              <ServiceCard
                letter="S"
                title="Scheduling"
                text="Dynamic timetables that sync across the entire community."
                features={[
                  "Class & exam schedules",
                  "Conflict prevention",
                  "Calendar sync",
                ]}
                delay={1}
              />
            </div>

            <div className="col-md-4">
              <ServiceCard
                letter="R"
                title="Resources"
                text="A dedicated hub for class notes, files, and assignments."
                features={[
                  "Document storage",
                  "Resource tagging",
                  "Class collections",
                ]}
                delay={2}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="service-section muted-section">
        <div className="container">
          <SectionHeader
            badge="Advanced Tools"
            title="Built for modern academic operations"
            subtitle="Simplify workflows with automation, analytics, and controls."
          />

          <div className="row g-4 mt-4">
            <div className="col-md-4">
              <ServiceCard
                letter="A"
                title="Admin Controls"
                text="Manage permissions, classes, users, and announcements."
                features={[
                  "Role-based access",
                  "Broadcast messages",
                  "District-level analytics",
                ]}
              />
            </div>

            <div className="col-md-4">
              <ServiceCard
                letter="D"
                title="Data Insights"
                text="Track engagement, communication activity, and scheduling analytics."
                features={[
                  "Usage metrics",
                  "Exportable reports",
                  "Class participation data",
                ]}
                delay={1}
              />
            </div>

            <div className="col-md-4">
              <ServiceCard
                letter="S"
                title="Student Dashboard"
                text="A clean, calm workspace for daily tasks, homework, and reminders."
                features={["Agenda view", "Task board", "Upcoming deadlines"]}
                delay={2}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="service-section">
        <div className="container">
          <SectionHeader
            badge="How It Works"
            title="A simple, connected academic workflow"
            subtitle="A seamless experience from setup to daily operations."
          />

          <div className="row g-4 mt-4">
            <div className="col-md-4">
              <StepCard
                index={1}
                title="Create your SchoolSpace"
                text="Set up your institution and import your classes."
              />
            </div>

            <div className="col-md-4">
              <StepCard
                index={2}
                title="Invite your community"
                text="Onboard students, teachers, and parents in minutes."
              />
            </div>

            <div className="col-md-4">
              <StepCard
                index={3}
                title="Run your school smoothly"
                text="Use the dashboard to manage schedules, resources, and updates."
              />
            </div>
          </div>
        </div>
      </section>

      <CallToActionSection
        title="Experience the full SchoolSpace platform"
        subtitle="All the tools you need to create a connected academic environment."
        primaryText="Start for Free"
        primaryLink="/start"
        secondaryText="See Pricing"
        secondaryLink="/pricing"
      />
    </main>
  );
};

export default FeaturePage;
