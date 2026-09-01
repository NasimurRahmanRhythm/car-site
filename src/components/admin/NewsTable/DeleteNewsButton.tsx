"use client";

import { ConfirmDeleteButton } from "@/components/common/ConfirmDialog";
import { deleteNewsAction } from "@/app/actions/news";

export function DeleteNewsButton({ postId }: { postId: string }) {
  return (
    <ConfirmDeleteButton
      title="Delete this post?"
      message="This cannot be undone."
      onConfirm={() => deleteNewsAction(postId)}
    />
  );
}
