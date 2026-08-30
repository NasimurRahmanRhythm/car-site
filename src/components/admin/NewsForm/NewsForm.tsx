import { SubmitButton } from "@/components/common/SubmitButton";
import { FileDropzone } from "@/components/common/FileDropzone";
import type { NewsPost } from "@/types/news";
import styles from "./NewsForm.module.css";

interface NewsFormProps {
  post?: NewsPost;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
}

export function NewsForm({ post, action, submitLabel }: NewsFormProps) {
  return (
    <form action={action} className={styles.form}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Post</legend>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={post?.title}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={12}
            defaultValue={post?.description ?? ""}
            className={styles.textarea}
            placeholder="Leave a blank line between paragraphs."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="image">
            Image
          </label>
          <FileDropzone
            id="image"
            name="image"
            currentImageUrl={post?.image_url}
            label="Add cover image"
            hint={
              post?.image_url
                ? "Pick a file to replace the current image. Leave it as is to keep it."
                : "Optional — shown on the news card and at the top of the post."
            }
          />
        </div>
      </fieldset>

      <div className={styles.footer}>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
