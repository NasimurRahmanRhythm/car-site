"use server";

import { revalidatePath } from "next/cache";
import { saveAbout, type AboutInput } from "@/lib/services/about.service";
import type { AboutStat } from "@/types/about";

export interface AboutFormState {
  error?: string;
  saved?: boolean;
  completedAt: number;
}

/** One paragraph per blank-line-separated block, matching how the page reads. */
function parseParagraphs(value: string): string[] {
  return value
    .split(/\n{2,}/)
    .map((block) => block.trim().replace(/\s*\n\s*/g, " "))
    .filter(Boolean);
}

/** `500+ | Vehicles Delivered`, one figure per line. */
function parseStats(value: string): AboutStat[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [statValue, ...labelParts] = line.split("|");
      return { value: statValue.trim(), label: labelParts.join("|").trim() };
    })
    .filter((stat) => stat.value && stat.label);
}

export async function saveAboutAction(
  _prevState: AboutFormState | null,
  formData: FormData
): Promise<AboutFormState> {
  const heading = String(formData.get("heading") ?? "").trim();
  if (!heading) {
    return { error: "The heading cannot be empty.", completedAt: Date.now() };
  }

  const input: AboutInput = {
    eyebrow: String(formData.get("eyebrow") ?? "").trim(),
    heading,
    intro: String(formData.get("intro") ?? "").trim(),
    paragraphs: parseParagraphs(String(formData.get("paragraphs") ?? "")),
    stats: parseStats(String(formData.get("stats") ?? "")),
    image_alt: String(formData.get("image_alt") ?? "").trim() || null,
  };

  const file = formData.get("image");
  const image = file instanceof File && file.size > 0 ? file : null;

  const { error } = await saveAbout(input, image);
  if (error) return { error, completedAt: Date.now() };

  // The copy shows on the About Us page and again in the home page's brand
  // statement, so the whole site is refreshed rather than a single route.
  revalidatePath("/", "layout");

  return { saved: true, completedAt: Date.now() };
}
