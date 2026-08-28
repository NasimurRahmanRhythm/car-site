import { HeroVideo } from "@/components/home/HeroVideo";
import { InventorySearch } from "@/components/home/InventorySearch";
import { FeaturedCars } from "@/components/home/FeaturedCars";
import { BrandStatement } from "@/components/home/BrandStatement";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { StoreMap } from "@/components/home/StoreMap";
import { ContactCta } from "@/components/home/ContactCta";
import { MarqueeStrip } from "@/components/common/MarqueeStrip";
import { getFeaturedCars, getFilterOptions } from "@/lib/services/car.service";

export default async function HomePage() {
  const [featuredCars, filterOptions] = await Promise.all([
    getFeaturedCars(3),
    getFilterOptions(),
  ]);

  const marqueeItems =
    filterOptions.makes.length > 0
      ? filterOptions.makes
      : ["Rolls-Royce", "Ferrari", "Lamborghini", "Bentley", "McLaren", "Porsche"];

  return (
    <>
      <HeroVideo />
      <InventorySearch makes={filterOptions.makes} />
      <FeaturedCars cars={featuredCars} />
      <MarqueeStrip items={marqueeItems} />
      <BrandStatement />
      <CategoryStrip />
      <StoreMap />
      <ContactCta />
    </>
  );
}
