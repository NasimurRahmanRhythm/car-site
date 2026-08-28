import { getCars } from "@/lib/services/car.service";
import type { CarCategory, CarSort, CarWithImages } from "@/types/car";

export async function getCarsByCategory(
  category: CarCategory,
  options: { page?: number; sort?: CarSort } = {}
): Promise<{ cars: CarWithImages[]; total: number }> {
  return getCars({ category, page: options.page, sort: options.sort });
}
