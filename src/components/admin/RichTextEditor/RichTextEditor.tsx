"use client";

import { useEffect, useRef, useState } from "react";
import type QuillType from "quill";
import { uploadNewsMediaAction } from "@/app/actions/news";
import { toRichTextHtml } from "@/lib/rich-text";
import styles from "./RichTextEditor.module.css";
import "quill/dist/quill.snow.css";

/** Server Actions cap the request body, so anything larger is refused here. */
const MAX_UPLOAD_BYTES = 24 * 1024 * 1024;

/**
 * The full Snow toolbar, written as markup rather than a config array because
 * Quill fills the empty `<select>`s with its own defaults and a custom button
 * (Embed) has nowhere to live in the array form.
 *
 * It goes in through `dangerouslySetInnerHTML` so React leaves the subtree
 * alone — Quill rewrites it heavily, swapping every select for a picker.
 */
const TOOLBAR_HTML = `
  <span class="ql-formats">
    <select class="ql-header"></select>
    <select class="ql-font"></select>
    <select class="ql-size"></select>
  </span>
  <span class="ql-formats">
    <button type="button" class="ql-bold"></button>
    <button type="button" class="ql-italic"></button>
    <button type="button" class="ql-underline"></button>
    <button type="button" class="ql-strike"></button>
  </span>
  <span class="ql-formats">
    <select class="ql-color"></select>
    <select class="ql-background"></select>
  </span>
  <span class="ql-formats">
    <button type="button" class="ql-script" value="sub"></button>
    <button type="button" class="ql-script" value="super"></button>
  </span>
  <span class="ql-formats">
    <button type="button" class="ql-blockquote"></button>
    <button type="button" class="ql-code-block"></button>
  </span>
  <span class="ql-formats">
    <button type="button" class="ql-list" value="ordered"></button>
    <button type="button" class="ql-list" value="bullet"></button>
    <button type="button" class="ql-list" value="check"></button>
  </span>
  <span class="ql-formats">
    <button type="button" class="ql-indent" value="-1"></button>
    <button type="button" class="ql-indent" value="+1"></button>
    <select class="ql-align"></select>
    <button type="button" class="ql-direction" value="rtl"></button>
  </span>
  <span class="ql-formats">
    <button type="button" class="ql-link"></button>
    <button type="button" class="ql-image" title="Upload an image"></button>
    <button type="button" class="ql-video" title="Upload a video"></button>
    <button type="button" class="ql-embed" title="Embed a YouTube or Vimeo link">Embed</button>
  </span>
  <span class="ql-formats">
    <button type="button" class="ql-clean"></button>
  </span>
`;

interface RichTextEditorProps {
  /** Form field the editor's HTML is submitted under. */
  name: string;
  /** Stored value — editor HTML, or plain text from before the editor existed. */
  defaultValue?: string | null;
  placeholder?: string;
}

/**
 * Quill, wired to a hidden input so the surrounding `<form action={…}>`
 * submits its HTML like any other field.
 *
 * Quill reaches for `document` as it loads, so it is imported inside the effect
 * rather than at the top of the file — on the server there is no DOM for it.
 */
export function RichTextEditor({ name, defaultValue, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(() => toRichTextHtml(defaultValue));
  const [status, setStatus] = useState<{ tone: "busy" | "error"; message: string } | null>(null);

  useEffect(() => {
    const container = editorRef.current;
    const toolbar = toolbarRef.current;
    if (!container || !toolbar) return;

    let quill: QuillType | null = null;
    let cancelled = false;

    /**
     * Puts a file in the news bucket and drops the result in at the cursor.
     * Quill's own image handler inlines the file as a base64 data URI, which
     * would land the whole photo in the `news` row.
     */
    function insertUpload(kind: "image" | "video") {
      const picker = document.createElement("input");
      picker.type = "file";
      picker.accept = kind === "image" ? "image/*" : "video/*";

      picker.onchange = async () => {
        const file = picker.files?.[0];
        if (!file || !quill) return;

        if (file.size > MAX_UPLOAD_BYTES) {
          setStatus({
            tone: "error",
            message: `${file.name} is over 24 MB. Compress it, or host the video elsewhere and use Embed.`,
          });
          return;
        }

        setStatus({ tone: "busy", message: `Uploading ${file.name}…` });

        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadNewsMediaAction(formData);

        if (!result.url || !quill) {
          setStatus({ tone: "error", message: result.error ?? "That upload failed." });
          return;
        }

        const index = quill.getSelection(true)?.index ?? quill.getLength();
        quill.insertEmbed(index, kind === "image" ? "image" : "nativeVideo", result.url, "user");
        quill.setSelection(index + 1, 0, "user");
        setStatus(null);
      };

      picker.click();
    }

    function insertEmbedLink() {
      if (!quill) return;
      const url = window.prompt("Paste a YouTube or Vimeo link");
      if (!url) return;
      const index = quill.getSelection(true)?.index ?? quill.getLength();
      quill.insertEmbed(index, "video", url, "user");
      quill.setSelection(index + 1, 0, "user");
    }

    async function boot() {
      const [{ default: Quill }, { BlockEmbed }] = await Promise.all([
        import("quill"),
        import("quill/blots/block"),
      ]);
      if (cancelled || !container || !toolbar) return;

      registerNativeVideo(Quill, BlockEmbed);

      quill = new Quill(container, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: {
            container: toolbar,
            handlers: {
              image: () => insertUpload("image"),
              video: () => insertUpload("video"),
              embed: insertEmbedLink,
            },
          },
        },
      });

      const existing = toRichTextHtml(defaultValue);
      if (existing) quill.clipboard.dangerouslyPasteHTML(existing, "silent");

      // The hidden input is all the form sees, so it is refreshed on every
      // change rather than read once at submit time.
      const sync = () => {
        if (!quill) return;
        setHtml(isBlank(quill) ? "" : readHtml(quill));
      };

      quill.on("text-change", sync);
      sync();
    }

    boot();

    return () => {
      cancelled = true;
      quill = null;
      // Quill decorates both nodes in place. Putting them back the way React
      // rendered them lets a remount start from a clean slate.
      container.innerHTML = "";
      container.classList.remove("ql-container", "ql-snow");
      toolbar.innerHTML = TOOLBAR_HTML;
      toolbar.classList.remove("ql-toolbar", "ql-snow");
    };
  }, [defaultValue, placeholder]);

  return (
    <div className={styles.wrapper}>
      <div
        ref={toolbarRef}
        className={styles.toolbar}
        dangerouslySetInnerHTML={{ __html: TOOLBAR_HTML }}
      />

      <div ref={editorRef} className={styles.editor} />

      <input type="hidden" name={name} value={html} readOnly />

      {status && (
        <p className={status.tone === "error" ? styles.error : styles.busy}>{status.message}</p>
      )}
    </div>
  );
}

/**
 * Quill's semantic HTML, minus its habit of turning every space into `&nbsp;`
 * — left in, the text would refuse to wrap once it is on the page.
 */
function readHtml(quill: QuillType): string {
  return quill.getSemanticHTML().replace(/&nbsp;/g, " ");
}

/** An editor holding nothing but Quill's trailing newline. */
function isBlank(quill: QuillType): boolean {
  const hasEmbed = quill.getContents().ops.some((op) => typeof op.insert === "object");
  return !hasEmbed && quill.getText().trim().length === 0;
}

/**
 * Quill's stock `video` format is a YouTube-style `<iframe>`, which cannot play
 * an uploaded file. This adds a second embed backed by a real `<video>` so both
 * an upload and a link have somewhere to go.
 */
function registerNativeVideo(Quill: typeof QuillType, BlockEmbed: typeof import("quill/blots/block").BlockEmbed) {
  if (Quill.imports["formats/nativeVideo"]) return;

  class NativeVideo extends BlockEmbed {
    static blotName = "nativeVideo";
    static tagName = "VIDEO";

    static create(value: string) {
      const node = super.create(value) as HTMLElement;
      node.setAttribute("src", value);
      node.setAttribute("controls", "controls");
      node.setAttribute("preload", "metadata");
      node.setAttribute("playsinline", "true");
      return node;
    }

    static value(node: HTMLElement) {
      return node.getAttribute("src");
    }
  }

  Quill.register(NativeVideo, true);
}
