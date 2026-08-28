import { createClient } from "@/lib/supabase/server";

export interface InquiryInput {
  carId?: string | null;
  name: string;
  email: string;
  phone?: string;
  message?: string;
}

export async function submitInquiry(
  input: InquiryInput
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").insert({
    car_id: input.carId ?? null,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    message: input.message ?? null,
  });

  if (error) {
    console.error("submitInquiry failed:", error.message);
    return { success: false, error: "Could not submit your inquiry. Please try again." };
  }

  return { success: true };
}
