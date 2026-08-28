import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { MemberGrid } from "@/components/governing-body/MemberGrid";
import { GOVERNING_BODY } from "@/data/governingBody";
import styles from "./governing-body.module.css";

export const metadata: Metadata = {
  title: "Governing Body",
};

export default function GoverningBodyPage() {
  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="Leadership"
          heading="Governing Body"
          description="The people responsible for every vehicle that carries our name."
        />
        <MemberGrid members={GOVERNING_BODY} />
      </div>
    </Container>
  );
}
