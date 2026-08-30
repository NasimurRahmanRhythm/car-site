import { CATEGORIES } from "@/lib/constants";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Inventory", href: "/inventory", dropdown: CATEGORIES },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
  { label: "About Us", href: "/about-us" },
  { label: "360° View", href: "/360-view" },
  { label: "Book Appointment", href: "/book-appointment" },
  { label: "Contact Us", href: "/contact-us" },
] as const;
