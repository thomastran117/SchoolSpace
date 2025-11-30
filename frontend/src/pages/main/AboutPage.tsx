import React from "react";
import MainHeroCard from "../../components/main/MainHeroCard";
import SectionHeader from "../../components/main/SectionHeader";
import PersonaCard from "../../components/main/PersonaCard";
import StepCard from "../../components/main/StepCard";
import CallToActionSection from "../../components/main/CallToActionSection";

const AboutPage: React.FC = () => {
  return (
    <main className="service-page">
      <div className="service-page-gradient gradient-1" />
      <div className="service-page-gradient gradient-2" />

      <MainHeroCard
        badge="About SchoolSpace"
        title="Building a Better Academic Experience"
        subtitle="Our mission is to simplify communication, scheduling, and learning for students and educators everywhere."
        primaryBtnText="Get Started"
        primaryBtnIcon="bi bi-rocket-takeoff-fill"
        primaryBtnLink="/start"
      />

      <section className="service-section">
        <div className="container">
          <SectionHeader
            badge="Our Story"
            title="A platform built for clarity and connection"
            subtitle="SchoolSpace was founded to address a single problem: academic tools were too fragmented, too confusing, and too time-consuming."
          />

          <div className="row mt-4 g-4 justify-content-center">
            <div className="col-lg-8">
              <div className="card p-4">
                <p className="mb-3">
                  We believe education works best when students, teachers, and
                  administrators feel connected — not overwhelmed by dozens of
                  tools.
                </p>
                <p>
                  SchoolSpace brings everything together: class updates,
                  schedules, communication, resources, and collaboration — all
                  in one premium, modern experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="service-section muted-section">
        <div className="container">
          <SectionHeader
            badge="Our Values"
            title="What drives SchoolSpace"
            subtitle="We design software that feels calm, intuitive, and empowering."
          />

          <div className="row g-4 mt-4">
            <div className="col-md-4">
              <PersonaCard
                label="Clarity"
                text="Every interface should feel simple, spacious, and thoughtfully organized."
                features={[
                  "Minimalistic UI",
                  "Clean typography",
                  "Streamlined navigation",
                ]}
              />
            </div>

            <div className="col-md-4">
              <PersonaCard
                label="Efficiency"
                text="We save time for students, teachers, and administrators around the world."
                features={[
                  "Fast workflows",
                  "Centralized data",
                  "Smart automation",
                ]}
              />
            </div>

            <div className="col-md-4">
              <PersonaCard
                label="Trust"
                text="Schools rely on us for stability, security, and privacy."
                features={[
                  "Secure communication",
                  "Analytics-ready exports",
                  "Role-based access",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="service-section">
        <div className="container">
          <SectionHeader
            badge="How We Work"
            title="Thoughtful processes, calm execution"
            subtitle="We build with care — focusing on quality and long-lasting improvements."
          />

          <div className="row g-4 mt-4">
            <div className="col-md-4">
              <StepCard
                index={1}
                title="Listen & Understand"
                text="We work closely with schools, teachers, and students to identify their real needs."
              />
            </div>

            <div className="col-md-4">
              <StepCard
                index={2}
                title="Design with Purpose"
                text="We create interfaces that reduce friction and enhance productivity."
              />
            </div>

            <div className="col-md-4">
              <StepCard
                index={3}
                title="Deliver with Confidence"
                text="We prioritize stability, security, and accessibility in everything we ship."
              />
            </div>
          </div>
        </div>
      </section>

      <CallToActionSection
        title="Want to learn more about SchoolSpace?"
        subtitle="Discover how we’re redefining modern education."
        primaryText="Explore Features"
        primaryLink="/services"
        secondaryText="Contact Us"
        secondaryLink="/contact"
      />
    </main>
  );
};

export default AboutPage;
