"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

interface ConfirmDeleteButtonProps {
  label?: string;
  pendingLabel?: string;
  title?: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  className?: string;
}

export function ConfirmDeleteButton({
  label = "Delete",
  pendingLabel = "Deleting…",
  title = "Are you sure?",
  message,
  onConfirm,
  className = "admin-action admin-action-danger",
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} disabled={isPending}>
        {isPending ? pendingLabel : label}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        message={message}
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
