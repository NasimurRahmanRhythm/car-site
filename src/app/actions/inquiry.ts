"use server";

import { submitInquiry } from "@/lib/services/inquiry.service";

export interface InquiryActionState {
  success: boolean;
  error?: string;
}

export async function submitInquiryAction(
  _prevState: InquiryActionState | null,
  formData: FormData
): Promise<InquiryActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const carId = String(formData.get("carId") ?? "").trim();

  if (!name || !email) {
    return { success: false, error: "Name and email are required." };
  }

  const result = await submitInquiry({
    carId: carId || null,
    name,
    email,
    phone,
    message,
  });

  return result;
}
