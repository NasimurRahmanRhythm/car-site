/** YouTube video ids are always 11 characters from this alphabet. */
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Pulls the video id out of anything an admin is likely to paste: a watch URL,
 * a youtu.be short link, a Shorts / embed / live URL, or the bare id itself.
 * Returns null for anything that is not recognisably a YouTube video.
 */
export function parseYoutubeId(input: string): string | null {
  const value = input.trim();
  if (VIDEO_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value.includes("://") ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
  let candidate: string | null = null;

  if (host === "youtu.be") {
    candidate = url.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      candidate = url.searchParams.get("v");
    } else {
      const [, section, id] = url.pathname.split("/");
      if (["shorts", "embed", "live", "v"].includes(section)) candidate = id ?? null;
    }
  }

  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** `hqdefault` exists for every video, unlike `maxresdefault`. */
export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
