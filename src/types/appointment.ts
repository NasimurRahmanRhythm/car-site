import type { AppointmentStatus, Database } from "./database";

export type { AppointmentStatus };

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
