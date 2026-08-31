import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendAppointmentReceiptEmail } from "@/lib/email/appointment-notifications";

export interface AppointmentInput {
  name: string;
  email: string;
  phone?: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
}

export async function submitAppointment(
  input: AppointmentInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    preferred_date: input.preferredDate || null,
    preferred_time: input.preferredTime || null,
    message: input.message || null,
  });

  if (error) {
    console.error("submitAppointment failed:", error.message);
    return {
      success: false,
      error: "Could not book your appointment. Please try again.",
    };
  }

  // After the response, not before: the request is already saved and visible in
  // the admin panel, so a round-trip to Resend should not sit between the
  // visitor and their confirmation screen.
  after(async () => {
    await sendAppointmentReceiptEmail({
      name: input.name,
      email: input.email,
      phone: input.phone,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      message: input.message,
    });
  });

  return { success: true };
}
