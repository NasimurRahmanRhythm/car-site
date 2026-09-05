/**
 * Rich text produced by the admin panel's editor.
 *
 * The editor hands back HTML, and that HTML is stored verbatim in the `news`
 * table. Only whitelisted admins can write it, but "only an admin typed it"
 * stops being true the moment an admin account is borrowed, so nothing is
 * rendered without passing through `sanitizeRichText` first: an allow-list of
 * tags, attributes and style properties, with everything else dropped.
 *
 * Posts written before the editor existed are plain text with blank lines
 * between paragraphs. `toRichTextHtml` promotes those on read, so old and new
 * posts render — and edit — through the same path.
 */

/** Tags the editor can produce, plus the embeds it inserts. */
const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "span", "div",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "strike", "sub", "sup",
  "blockquote", "pre", "code",
  "ol", "ul", "li",
  "a", "img", "video", "source", "iframe",
  "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
]);

/** Attributes allowed on every tag. Values are still validated below. */
const GLOBAL_ATTRIBUTES = new Set(["class", "style", "dir"]);

const TAG_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading"]),
  video: new Set(["src", "poster", "controls", "width", "height", "preload", "playsinline", "loop", "muted"]),
  source: new Set(["src", "type"]),
  iframe: new Set(["src", "title", "width", "height", "allow", "allowfullscreen", "frameborder"]),
  li: new Set(["data-list", "data-checked"]),
  ol: new Set(["start"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
};

/**
 * Quill writes colour inline (there is no class-based colour format), so a
 * narrow set of style properties has to survive. Everything else — positioning,
 * `background` shorthand with its `url()`, anything that could pull a request
 * or cover the page — is dropped.
 */
const ALLOWED_STYLE_PROPERTIES = new Set([
  "color",
  "background-color",
  "text-align",
  "direction",
]);

const SAFE_STYLE_VALUE = /^[#a-zA-Z0-9\s,.%()/-]+$/;

/** Editor formatting classes only: `ql-align-center`, `ql-indent-2`, … */
const SAFE_CLASS = /^ql-[a-z0-9-]+$/i;

/** Anything that leaves the page, plus the `data:` images the editor inlines. */
const SAFE_URL = /^(https?:\/\/|mailto:|tel:|\/|#|data:image\/(png|jpe?g|gif|webp|avif);base64,)/i;

const VOID_TAGS = new Set(["br", "hr", "img", "source"]);

const ATTRIBUTE_PATTERN = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;

const TAG_PATTERN = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>?/g;

/** Any tag or comment, quoted attribute values included, for text extraction. */
const ANY_TAG_PATTERN = /<!--[\s\S]*?-->|<\/?[a-zA-Z!][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>?/g;

/** True when the value already carries markup, rather than being plain text. */
export function isHtml(value: string): boolean {
  return /<(p|br|div|h[1-6]|ul|ol|li|blockquote|pre|img|video|iframe|strong|em|u|s|span|a)\b[^>]*>/i.test(
    value
  );
}

/**
 * Strips everything not on the allow-list. Disallowed tags are removed rather
 * than escaped, so `<script>alert(1)</script>` leaves `alert(1)` sitting on the
 * page as text instead of running.
 */
export function sanitizeRichText(html: string): string {
  if (!html) return "";

  return html.replace(TAG_PATTERN, (match, rawName?: string, rawAttrs?: string) => {
    if (!rawName) return ""; // an HTML comment

    const tag = rawName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";

    if (match.startsWith("</")) return `</${tag}>`;

    const attributes = sanitizeAttributes(tag, rawAttrs ?? "");
    const open = attributes ? `<${tag} ${attributes}` : `<${tag}`;

    return VOID_TAGS.has(tag) ? `${open} />` : `${open}>`;
  });
}

function sanitizeAttributes(tag: string, raw: string): string {
  const allowed = TAG_ATTRIBUTES[tag];
  const kept: string[] = [];

  for (const found of raw.matchAll(ATTRIBUTE_PATTERN)) {
    const name = found[1].toLowerCase();
    if (!GLOBAL_ATTRIBUTES.has(name) && !allowed?.has(name)) continue;

    const value = unquote(found[2]);
    const cleaned = cleanAttributeValue(name, value);
    if (cleaned === null) continue;

    kept.push(`${name}="${escapeAttribute(cleaned)}"`);
  }

  // An off-site link opened in a new tab gets the opener reference severed.
  if (tag === "a" && kept.some((attr) => attr.startsWith('target="'))) {
    kept.push('rel="noopener noreferrer"');
  }

  return kept.join(" ");
}

function cleanAttributeValue(name: string, value: string): string | null {
  if (name === "href" || name === "src") {
    return SAFE_URL.test(value.trim()) ? value.trim() : null;
  }

  if (name === "class") {
    const classes = value.split(/\s+/).filter((token) => SAFE_CLASS.test(token));
    return classes.length > 0 ? classes.join(" ") : null;
  }

  if (name === "style") {
    const declarations = value
      .split(";")
      .map((declaration) => declaration.split(":"))
      .filter(([property, ...rest]) => {
        const styleValue = rest.join(":").trim();
        return (
          property !== undefined &&
          ALLOWED_STYLE_PROPERTIES.has(property.trim().toLowerCase()) &&
          styleValue.length > 0 &&
          SAFE_STYLE_VALUE.test(styleValue)
        );
      })
      .map(([property, ...rest]) => `${property.trim().toLowerCase()}: ${rest.join(":").trim()}`);

    return declarations.length > 0 ? `${declarations.join("; ")};` : null;
  }

  return value;
}

function unquote(value: string | undefined): string {
  if (value === undefined) return "";
  const first = value[0];
  return first === '"' || first === "'" ? value.slice(1, -1) : value;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Sanitized HTML ready to render, whether the stored value came from the
 * editor or from the plain-text field that preceded it.
 */
export function toRichTextHtml(value: string | null | undefined): string {
  const source = (value ?? "").trim();
  if (!source) return "";
  if (isHtml(source)) return sanitizeRichText(source);

  return source
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeText(block).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/**
 * The text of a rich-text value, for card excerpts, meta descriptions and
 * anywhere else the markup would only show up as noise.
 */
export function richTextToPlainText(value: string | null | undefined): string {
  if (!value) return "";

  return value
    // Block boundaries are word boundaries — without this, "one</p><p>two"
    // would come back as "onetwo".
    .replace(/<\/(p|div|li|h[1-6]|blockquote|pre|tr)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(ANY_TAG_PATTERN, "")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
      if (entity.startsWith("#x") || entity.startsWith("#X")) {
        return String.fromCodePoint(parseInt(entity.slice(2), 16));
      }
      if (entity.startsWith("#")) return String.fromCodePoint(parseInt(entity.slice(1), 10));
      return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
    })
    .replace(/\s+/g, " ")
    .trim();
}
