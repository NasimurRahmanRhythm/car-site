import { HeroVideo } from "@/components/home/HeroVideo";
import { InventorySearch } from "@/components/home/InventorySearch";
import { FeaturedCars } from "@/components/home/FeaturedCars";
import { BrandStatement } from "@/components/home/BrandStatement";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { NewsStrip } from "@/components/home/NewsStrip";
import { DealershipStrip } from "@/components/home/DealershipStrip";
import { StoreMap } from "@/components/home/StoreMap";
import { ContactCta } from "@/components/home/ContactCta";
import { MarqueeStrip } from "@/components/common/MarqueeStrip";
import { getFeaturedCars, getFilterOptions } from "@/lib/services/car.service";
import { getLatestNews } from "@/lib/services/news.service";
import { getAboutContent } from "@/lib/services/about.service";
import styles from "./page.module.css";

export default async function HomePage() {
  const [featuredCars, filterOptions, latestNews, about] = await Promise.all([
    getFeaturedCars(3),
    getFilterOptions(),
    getLatestNews(5),
    getAboutContent(),
  ]);

  return (
    <>
      <HeroVideo />
      <InventorySearch makes={filterOptions.makes} />
      <FeaturedCars cars={featuredCars} />
      <MarqueeStrip />
      <BrandStatement about={about} />
      <div className={styles.backdrop}>
        <CategoryStrip />
        <NewsStrip posts={latestNews} />
      </div>
      <DealershipStrip />
      <StoreMap />
      <ContactCta />
    </>
  );
}
