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
    <div className="homepage-light">
      <MainHeroCard />
      <ServicesSection />
      <WhyUsSection />
      <HowItWorksSection />
      <ReviewSection />
      <FrequentlyAskedSection />
      <CallToActionSection />
    </div>
  );
};

export default HomePage;
