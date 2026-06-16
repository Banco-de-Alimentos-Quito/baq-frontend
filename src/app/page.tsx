import React from "react";
import HeroSection from "@/components/sections/HeroSection";
import WhatWeDoSection from "@/components/sections/WhatWeDoSection";
import HowToHelpSection from "@/components/sections/HowToHelpSection";
import DonationSection from "@/components/sections/DonationSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";

import FloatingDonationButton from "@/components/ui/floating-donation-button";
import Location from "@/components/sections/Location";
import ImpactStories from "@/components/sections/ImpactStories";
import OurAliances from "@/components/sections/OurAliances";
import AchievementsSection from "@/components/sections/AchievementsSection";
import EnvironmentalImpactSection from "@/components/sections/EnvironmentalImpactSection";
import AmbassadorsSection from "@/components/sections/Ambassadors";
import WhyWeDoExist from "@/components/sections/WhyWeDoExist";
import QuickDonateButton from "./quick-donate/QuickDoanteButton";
import CampaignPopup from "@/components/ui/CampaignPopup";

export default function Home() {
  return (
    <div className="min-h-screen">
      <CampaignPopup />
      <HeroSection />
      <WhatWeDoSection />
      <WhyWeDoExist />
      <OurAliances />
      <AchievementsSection />
      <EnvironmentalImpactSection />

      <HowToHelpSection />
      <DonationSection />
      <FloatingDonationButton />
      <TestimonialsSection />
      {/* <AmbassadorsSection /> */}
      <ImpactStories />
      <Location />
    </div>
  );
}
