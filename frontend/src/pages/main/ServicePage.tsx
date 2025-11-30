import React from "react";
import "../../styles/main/ServicePage.css";

import MainHeroCard from "../../components/main/MainHeroCard";
import SectionHeader from "../../components/main/SectionHeader";
import ServiceCard from "../../components/main/ServiceCard";
import PersonaCard from "../../components/main/PersonaCard";
import StepCard from "../../components/main/StepCard";
import CallToActionSection from "../../components/main/CallToActionSection";

const ServicePage: React.FC = () => {
  return (
    <main className="service-page">
      <div className="service-page-gradient gradient-1" />
      <div className="service-page-gradient gradient-2" />

      <MainHeroCard
        badge="Premium Academic Services"
        title="Modern academic services, all in one place."
        subtitle="SchoolSpace centralizes communication, scheduling, and resource management into a single, premium platform built for schools."
        primaryBtnText="Talk to our team"
        primaryBtnIcon="bi bi-chat-dots-fill"
        secondaryBtnText="View Pricing"
        secondaryBtnIcon="bi bi-tag-fill"
      />

      <section className="service-section">
        <div className="container">
          <SectionHeader
            badge="What you get"
            title="Core SchoolSpace services"
            subtitle="Everything your school community needs to stay organized and connected."
          />

          <div className="row g-4 mt-4">
            <div className="col-md-4">
              <ServiceCard
                letter="C"
                title="Centralized Communication"
                text="Announcements, class updates, and reminders all in one streamlined hub."
                features={[
                  "Smart announcement feeds",
                  "Role-based notifications",
                  "Student & parent channels",
                ]}
              />
            </div>

            <div className="col-md-4">
              <ServiceCard
                letter="S"
                title="Scheduling & Timetables"
                text="Structured schedules for classes, exams, and events."
                features={[
                  "Personalized student views",
                  "Conflict-aware scheduling",
                  "Calendar export & sync",
                ]}
                delay={1}
              />
            </div>

            <div className="col-md-4">
              <ServiceCard
                letter="R"
                title="Resources & Workspaces"
                text="A focused place for notes, documents, and assignments."
                features={[
                  "Class resource collections",
                  "Secure document sharing",
                  "Lightweight student workspaces",
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
            badge="Built for everyone"
            title="Designed for your entire school"
            subtitle="Tailored views for each role."
          />

          <div className="row g-4 mt-4">
            <div className="col-md-4">
              <PersonaCard
                label="For Students"
                text="Stay on top of classes and deadlines with a focused academic dashboard."
                features={[
                  "Daily agenda",
                  "Unified class overview",
                  "Distraction-free UI",
                ]}
              />
            </div>

            <div className="col-md-4">
              <PersonaCard
                label="For Teachers"
                text="Simplify communication and keep classes aligned effortlessly."
                features={[
                  "One-click announcements",
                  "Class resource hubs",
                  "Calendar-based planning",
                ]}
              />
            </div>

            <div className="col-md-4">
              <PersonaCard
                label="For Administrators"
                text="Operate confidently with complete visibility into school operations."
                features={[
                  "Configurable permissions",
                  "Broadcast announcements",
                  "Analytics-ready exports",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="service-section">
        <div className="container">
          <SectionHeader
            badge="How it works"
            title="A calm, connected school workflow"
            subtitle="SchoolSpace becomes the reliable center of your operations."
          />

          <div className="row g-4 mt-4 justify-content-center">
            <div className="col-md-4">
              <StepCard
                index={1}
                title="Onboard your community"
                text="Import classes, invite students, and configure permissions."
              />
            </div>

            <div className="col-md-4">
              <StepCard
                index={2}
                title="Centralize your day-to-day"
                text="Use SchoolSpace as the source of truth for schedules and updates."
              />
            </div>

            <div className="col-md-4">
              <StepCard
                index={3}
                title="Grow with confidence"
                text="Scale programs and operations while maintaining consistency."
              />
            </div>
          </div>
        </div>
      </section>

      <CallToActionSection
        title="Ready to bring calm to your school?"
        subtitle="See how SchoolSpace can simplify communication and scheduling."
        primaryText="Book a Live Demo"
        primaryLink="/demo"
        secondaryText="Download Overview"
        secondaryLink="/overview"
      />
    </main>
  );
};

export default ServicePage;
