import type { Metadata } from "next";
import { DealershipsHero } from "@/components/dealerships/DealershipsHero";
import { DealershipFeature } from "@/components/dealerships/DealershipFeature";
import { DEALERSHIPS, DEALERSHIPS_PAGE } from "@/data/dealerships";

export const metadata: Metadata = {
  title: "Dealerships",
  description: DEALERSHIPS_PAGE.intro,
};

export default function DealershipsPage() {
  return (
    <>
      <DealershipsHero />
      {DEALERSHIPS.map((dealership, index) => (
        <DealershipFeature key={dealership.slug} dealership={dealership} index={index} />
      ))}
    </>
  );
}
