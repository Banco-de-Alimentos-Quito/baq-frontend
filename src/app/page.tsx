import Image from "next/image";
import PayPalButton from "./components/Paypal";
import { PluxButton } from "./components/PluxButton";
import HeroSection from '@/components/sections/HeroSection';
import WhatWeDoSection from '@/components/sections/WhatWeDoSection';
import HowToHelpSection from '@/components/sections/HowToHelpSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import DonationSection from '@/components/sections/DonationSection';

export default function HomePage() {
  return (

    <>
      <HeroSection />
      <WhatWeDoSection />
      <HowToHelpSection />
      <TestimonialsSection />
      <DonationSection />
    </>
  );
}
