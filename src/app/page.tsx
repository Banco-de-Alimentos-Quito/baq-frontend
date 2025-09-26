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

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <WhatWeDoSection />
      <OurAliances />
      <HowToHelpSection />
      <DonationSection />
      <FloatingDonationButton />
      <TestimonialsSection />
      <ImpactStories />
      <Location />
    </div>
  );
}
