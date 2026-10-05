"use client";

import { useActionState } from "react";
import { saveAboutAction, type AboutFormState } from "@/app/actions/about";
import { FileDropzone } from "@/components/common/FileDropzone";
import { SubmitButton } from "@/components/common/SubmitButton";
import type { AboutContent } from "@/types/about";
import styles from "./AboutForm.module.css";

const initialState: AboutFormState | null = null;

interface AboutFormProps {
  about: AboutContent;
  /** False while the page is still on the copy checked into the repo. */
  isStored: boolean;
}

export function AboutForm({ about, isStored }: AboutFormProps) {
  const [state, formAction] = useActionState(saveAboutAction, initialState);

  return (
    <form action={formAction} className={styles.form}>
      {!isStored && (
        <p className={styles.notice}>
          Nothing has been saved yet, so these fields are pre-filled with the text and
          photograph the site currently shows. Save to take over from them.
        </p>
      )}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Heading</legend>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="eyebrow">
            Eyebrow
          </label>
          <input
            id="eyebrow"
            name="eyebrow"
            type="text"
            defaultValue={about.eyebrow}
            className={styles.input}
          />
          <p className={styles.hint}>The small line above the heading — “Since 2010”.</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="heading">
            Heading
          </label>
          <input
            id="heading"
            name="heading"
            type="text"
            required
            defaultValue={about.heading}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="intro">
            Intro
          </label>
          <textarea
            id="intro"
            name="intro"
            rows={5}
            defaultValue={about.intro}
            className={styles.textarea}
          />
          <p className={styles.hint}>
            Opens the About Us page, and appears again beside the photograph on the home
            page.
          </p>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Story</legend>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="paragraphs">
            Paragraphs
          </label>
          <textarea
            id="paragraphs"
            name="paragraphs"
            rows={12}
            defaultValue={about.paragraphs.join("\n\n")}
            className={styles.textarea}
          />
          <p className={styles.hint}>Leave a blank line between paragraphs.</p>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="stats">
            Figures
          </label>
          <textarea
            id="stats"
            name="stats"
            rows={5}
            defaultValue={about.stats.map((stat) => `${stat.value} | ${stat.label}`).join("\n")}
            className={styles.textarea}
          />
          <p className={styles.hint}>
            One per line, as <code>value | label</code> — for example{" "}
            <code>500+ | Vehicles Delivered</code>.
          </p>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Photograph</legend>

        <div className={styles.field}>
          <FileDropzone
            id="about-image"
            name="image"
            currentImageUrl={about.showroom.src}
            label="Add photograph"
            hint="Shown on the About Us page and on the home page. Pick a file to replace the current one; leave it alone to keep it."
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="image_alt">
            Image description
          </label>
          <input
            id="image_alt"
            name="image_alt"
            type="text"
            defaultValue={about.showroom.alt}
            className={styles.input}
          />
          <p className={styles.hint}>
            Read aloud by screen readers, and shown if the photograph fails to load.
          </p>
        </div>
      </fieldset>

      <div className={styles.footer}>
        {state?.saved && <p className={styles.success}>Saved. The site is showing it now.</p>}
        {state?.error && <p className={styles.error}>{state.error}</p>}
        <SubmitButton label="Save Changes" />
      </div>
    </form>
  );
}
