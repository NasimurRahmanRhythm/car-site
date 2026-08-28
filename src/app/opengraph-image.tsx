import { ImageResponse } from "next/og";
import { SITE } from "@/data/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b0b",
          color: "#f5f3f0",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#b08d57",
            marginBottom: 24,
          }}
        >
          {SITE.shortName}
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 600,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {SITE.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
