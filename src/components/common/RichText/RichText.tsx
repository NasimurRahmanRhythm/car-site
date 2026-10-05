import { cn } from "@/lib/utils";
import { toRichTextHtml } from "@/lib/rich-text";
import styles from "./RichText.module.css";

interface RichTextProps {
  /** Editor HTML, or the plain text posts used before the editor existed. */
  value: string | null | undefined;
  className?: string;
}

/**
 * Renders admin-authored rich text.
 *
 * `toRichTextHtml` runs the value through the tag allow-list on the way out, so
 * this is safe against a post that was written before the sanitiser existed —
 * or stored by anything other than the current admin form.
 */
export function RichText({ value, className }: RichTextProps) {
  const html = toRichTextHtml(value);
  if (!html) return null;

  return (
    <div
      className={cn(styles.richText, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
