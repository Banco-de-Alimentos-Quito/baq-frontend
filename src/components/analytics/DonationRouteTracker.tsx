"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackDonationView } from "@/lib/donationAnalytics";

export default function DonationRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/donacion" || pathname === "/donacion/mensual" || pathname === "/quick-donate" || pathname === "/quick-donate-4" || pathname === "/quick-donate-for") {
      trackDonationView(pathname);
    }
  }, [pathname]);

  return null;
}
