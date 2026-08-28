import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutStory } from "@/components/about/AboutStory";

export const metadata: Metadata = {
  title: "About Us",
};

export default function AboutUsPage() {
  return (
    <>
      <AboutHero />
      <AboutStory />
    </>
  );
}
