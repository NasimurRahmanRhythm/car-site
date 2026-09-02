import { HeroVideo } from "@/components/home/HeroVideo";
import { InventorySearch } from "@/components/home/InventorySearch";
import { FeaturedCars } from "@/components/home/FeaturedCars";
import { BrandStatement } from "@/components/home/BrandStatement";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { NewsStrip } from "@/components/home/NewsStrip";
import { StoreMap } from "@/components/home/StoreMap";
import { ContactCta } from "@/components/home/ContactCta";
import { MarqueeStrip } from "@/components/common/MarqueeStrip";
import { getFeaturedCars, getFilterOptions } from "@/lib/services/car.service";
import { getLatestNews } from "@/lib/services/news.service";
import styles from "./page.module.css";

export default async function HomePage() {
  const [featuredCars, filterOptions, latestNews] = await Promise.all([
    getFeaturedCars(3),
    getFilterOptions(),
    getLatestNews(5),
  ]);

  return (
    <>
      <HeroVideo />
      <InventorySearch makes={filterOptions.makes} />
      <FeaturedCars cars={featuredCars} />
      <MarqueeStrip />
      <BrandStatement />
      <div className={styles.backdrop}>
        <CategoryStrip />
        <NewsStrip posts={latestNews} />
      </div>
      <StoreMap />
      <ContactCta />
    </>
  );
}
