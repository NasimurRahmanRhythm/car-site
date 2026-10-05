import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutStory } from "@/components/about/AboutStory";
import { getAboutContent } from "@/lib/services/about.service";

export const metadata: Metadata = {
  title: "About Us",
};

export default async function AboutUsPage() {
  const about = await getAboutContent();

  return (
    <>
      <AboutHero about={about} />
      <AboutStory about={about} />
    </>
  );
}
