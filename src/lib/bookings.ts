/**
 * Appointments and test drives are the same request with a different intent,
 * so everything downstream — the form, the emails, the admin table, the status
 * actions — is written once and told which kind it is dealing with here.
 *
 * Adding a third kind of request means adding an entry to this map, not another
 * copy of the whole flow.
 */
export type BookingKind = "appointment" | "test_drive";

export interface BookingConfig {
  /** The Postgres table backing this kind. */
  table: "appointments" | "test_drives";
  /** Singular, lower case — reads inside a sentence. */
  noun: string;
  /** Title case, for headings and subject lines. */
  title: string;
  /** Where the public form lives. */
  path: string;
  /** Where the admin reviews these requests. */
  adminPath: string;
}

export const BOOKINGS: Record<BookingKind, BookingConfig> = {
  appointment: {
    table: "appointments",
    noun: "appointment",
    title: "Appointment",
    path: "/book-appointment",
    adminPath: "/admin/appointments",
  },
  test_drive: {
    table: "test_drives",
    noun: "test drive",
    title: "Test Drive",
    path: "/book-test-drive",
    adminPath: "/admin/test-drives",
  },
};
