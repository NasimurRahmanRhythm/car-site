import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getGalleryImages } from "@/lib/services/car.service";
import { getGalleryItems } from "@/lib/services/gallery.service";
import styles from "./gallery.module.css";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs and videos from across the current collection.",
};

export default async function GalleryPage() {
  const [items, images] = await Promise.all([getGalleryItems(), getGalleryImages(60)]);

  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="The Collection"
          heading="Gallery"
          description="Photos and videos from our floor. Tap a vehicle photo to open the car, or a video to play it."
        />

        <GalleryGrid items={items} images={images} />
      </div>
    </Container>
  );
}
