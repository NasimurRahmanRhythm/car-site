import { CATEGORIES } from "@/lib/constants";

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Inventory", href: "/inventory", dropdown: CATEGORIES },
  { label: "Gallery", href: "/gallery" },
  { label: "News", href: "/news" },
  { label: "Dealerships", href: "/dealerships" },
  { label: "About Us", href: "/about-us" },
  { label: "360° View", href: "/360-view" },
  { label: "Book Appointment", href: "/book-appointment" },
  { label: "Book Test Drive", href: "/book-test-drive" },
] as const;
