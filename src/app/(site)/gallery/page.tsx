import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getGalleryImages } from "@/lib/services/car.service";
import styles from "./gallery.module.css";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from across the current collection.",
};

export default async function GalleryPage() {
  const images = await getGalleryImages(60);

  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="The Collection"
          heading="Gallery"
          description="A rotating look through the cars on our floor. Tap any photo to open the vehicle."
        />

        <GalleryGrid images={images} />
      </div>
    </Container>
  );
}
