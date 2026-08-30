"use server";

import { revalidatePath } from "next/cache";
import { submitAppointment } from "@/lib/services/appointment.service";
import {
  deleteAppointment,
  setAppointmentStatus,
} from "@/lib/services/admin.service";
import type { AppointmentStatus } from "@/types/appointment";

export interface AppointmentActionState {
  success: boolean;
  error?: string;
}

export async function bookAppointmentAction(
  _prevState: AppointmentActionState | null,
  formData: FormData
): Promise<AppointmentActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const preferredDate = String(formData.get("preferred_date") ?? "").trim();
  const preferredTime = String(formData.get("preferred_time") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email) {
    return { success: false, error: "Name and email are required." };
  }

  return submitAppointment({
    name,
    email,
    phone,
    preferredDate,
    preferredTime,
    message,
  });
}

export async function setAppointmentStatusAction(
  id: string,
  status: AppointmentStatus
): Promise<void> {
  await setAppointmentStatus(id, status);
  revalidatePath("/admin/appointments");
}

export async function deleteAppointmentAction(id: string): Promise<void> {
  await deleteAppointment(id);
  revalidatePath("/admin/appointments");
}
