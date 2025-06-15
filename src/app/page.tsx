import HeroSection from '@/components/sections/HeroSection';
import WhatWeDoSection from '@/components/sections/WhatWeDoSection';
import HowToHelpSection from '@/components/sections/HowToHelpSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import DonationSection from '@/components/sections/DonationSection';
import FloatingDonationButton from '@/components/ui/floating-donation-button';

export default function HomePage() {
  return (

    <>
      <HeroSection />
      <WhatWeDoSection />
      <HowToHelpSection />
      <TestimonialsSection />
      <DonationSection />
      <FloatingDonationButton />
    </>
  );
}
