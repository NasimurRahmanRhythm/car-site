import type { AboutStat, Database } from "./database";

export type AboutRow = Database["public"]["Tables"]["about_content"]["Row"];

export type { AboutStat };

/** The About Us image, sized so `next/image` can reserve its space. */
export interface AboutImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * The About Us copy as the pages consume it — the stored row where there is
 * one, and the checked-in fallback everywhere it is blank.
 */
export interface AboutContent {
  eyebrow: string;
  heading: string;
  intro: string;
  paragraphs: string[];
  stats: AboutStat[];
  showroom: AboutImage;
}
