import type { MetadataRoute } from "next";
import { getAllCarSlugs } from "@/lib/services/car.service";
import { CATEGORIES } from "@/lib/constants";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/inventory",
    "/about-us",
    "/governing-body",
    "/contact-us",
    "/360-view",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${baseUrl}/categories/${category.value}`,
    lastModified: new Date(),
  }));

  const carSlugs = await getAllCarSlugs();
  const carRoutes: MetadataRoute.Sitemap = carSlugs.map((car) => ({
    url: `${baseUrl}/inventory/${car.slug}`,
    lastModified: new Date(car.updated_at),
  }));

  return [...staticRoutes, ...categoryRoutes, ...carRoutes];
}
