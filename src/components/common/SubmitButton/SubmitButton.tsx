"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/common/Button";
import { Spinner } from "@/components/common/Spinner";

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Spinner /> : label}
    </Button>
  );
}
