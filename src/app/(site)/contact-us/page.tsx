import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { InquiryForm } from "@/components/car-detail/InquiryForm";
import { CONTACT } from "@/data/contact";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact Us",
};

export default function ContactUsPage() {
  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow={CONTACT.eyebrow}
          heading={CONTACT.heading}
          description={CONTACT.intro}
        />

        <div className={styles.layout}>
          <ContactInfo />
          <InquiryForm />
        </div>
      </div>
    </Container>
  );
}
