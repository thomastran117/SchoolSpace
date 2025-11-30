import React from "react";
import MainHeroCard from "../../components/main/MainHeroCard";
import ServicesSection from "../../components/main/ServicesSection";
import WhyUsSection from "../../components/main/WhyUsSection";
import HowItWorksSection from "../../components/main/HowItWorksSection";
import ReviewSection from "../../components/main/ReviewSection";
import CallToActionSection from "../../components/main/CallToActionSection";
import FrequentlyAskedSection from "../../components/main/FrequentlyAskedSection";

import "../../styles/main/HomePage.css";

const HomePage: React.FC = () => {
  return (
    <div className="service-page">
      <MainHeroCard
        badge="Empowering Students & Educators"
        title="SchoolSpace"
        subtitle="Discover courses, enroll instantly, and enjoy education — all in one place."
        primaryBtnText="Get Started"
        primaryBtnIcon="bi bi-play-circle-fill"
        primaryBtnLink="/get-started"
        secondaryBtnText="How It Works"
        secondaryBtnIcon="bi bi-info-circle"
        secondaryBtnLink="/how-it-works"
      />
      <ServicesSection />
      <WhyUsSection />
      <HowItWorksSection />
      <ReviewSection />
      <FrequentlyAskedSection />
      <CallToActionSection
        title="Ready to Transform Your Learning?"
        subtitle="Join thousands of students and educators using SchoolSpace."
        primaryText="Get Started"
        primaryLink="/start"
      />
    </div>
  );
};

export default HomePage;
