import type { AppointmentStatus, Database } from "./database";

export type { AppointmentStatus };

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type TestDrive = Database["public"]["Tables"]["test_drives"]["Row"];

/**
 * Appointments and test drives share a shape, so anything that only reads a
 * request — the admin table, the status emails — takes this instead of picking
 * one of the two.
 */
export type BookingRequest = Appointment;
