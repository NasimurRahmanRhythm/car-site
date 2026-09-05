import type { AboutContent } from "@/types/about";

/**
 * The About Us copy the site ships with.
 *
 * The live text and photograph are edited in the admin panel and stored in
 * `about_content`; this is what every field falls back to before its first
 * save, so the page always has something to show.
 */
export const ABOUT_FALLBACK: AboutContent = {
  eyebrow: "Since 2010",
  heading: "A House Built on Rare Machines",
  intro:
    "VIP Motors was founded on a single conviction: that the finest automobiles deserve a home as considered as the craftsmanship behind them. From limited-run hypercars to bespoke grand tourers, every unit that enters our showroom is chosen, inspected, and presented on its own terms.",
  paragraphs: [
    "What began as a small collection of hand-picked vehicles has grown into one of the region's most trusted addresses for collectors, enthusiasts, and first-time buyers alike. We work directly with manufacturers, private collections, and international auction houses to source vehicles that meet our standard — not the other way around.",
    "Every car that carries the VIP Motors name has been inspected by our in-house specialists, documented in full, and prepared to the same standard whether it is destined for a showroom floor or a private collection halfway across the world.",
  ],
  stats: [
    { value: "500+", label: "Vehicles Delivered" },
    { value: "40+", label: "Marques Represented" },
    { value: "15", label: "Years of Trust" },
  ],
  showroom: {
    src: "/images/IMG-20260830-WA0002.jpg",
    alt: "A Land Rover Defender parked outside the VIP Motors showroom in Dhaka.",
    // Intrinsic size of the file — next/image needs it to reserve the space
    // before the image loads.
    width: 960,
    height: 1090,
  },
};
