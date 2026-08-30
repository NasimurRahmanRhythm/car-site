import type { Metadata } from "next";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { AppointmentForm } from "@/components/appointment/AppointmentForm";
import styles from "./appointment.module.css";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Reserve a private viewing at the showroom — pick a date and time and we'll confirm by email.",
};

export default function BookAppointmentPage() {
  return (
    <Container>
      <div className={styles.wrapper}>
        <SectionHeading
          eyebrow="Private Viewing"
          heading="Book an Appointment"
          description="Tell us when suits you and leave your email — we'll confirm the slot and have the vehicle ready when you arrive."
        />

        <div className={styles.layout}>
          <ContactInfo />
          <AppointmentForm />
        </div>
      </div>
    </Container>
  );
}
