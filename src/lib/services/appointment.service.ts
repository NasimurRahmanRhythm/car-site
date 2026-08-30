import { createClient } from "@/lib/supabase/server";

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

  return { success: true };
}
