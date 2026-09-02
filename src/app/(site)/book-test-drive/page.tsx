import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { AppointmentForm } from "@/components/appointment/AppointmentForm";
import styles from "./test-drive.module.css";

export const metadata: Metadata = {
  title: "Book a Test Drive",
  description:
    "Request a test drive at the showroom — pick a date and time and we'll confirm by email.",
};

export default function BookTestDrivePage() {
  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="Behind The Wheel"
          heading="Book a Test Drive"
          description="Tell us when suits you and leave your email — we'll confirm the slot and have the vehicle ready when you arrive."
        />

        <div className={styles.layout}>
          <ContactInfo />
          <AppointmentForm kind="test_drive" />
        </div>
      </div>
    </Container>
  );
}
