import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf9f6",
          color: "#1b1e1a",
          padding: "72px",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#0e5a4f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f4faf8",
              fontSize: "24px",
            }}
          >
            &uarr;
          </span>
          <span style={{ fontSize: "30px", fontWeight: 700 }}>
            Edu<span style={{ color: "#0e5a4f" }}>Match</span>
          </span>
        </div>
        <div
          style={{
            fontSize: "72px",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: "900px",
          }}
        >
          Where great educators meet the right institution.
        </div>
        <div style={{ fontSize: "26px", color: "#5b5f57" }}>
          Indian higher education &middot; built for educators &amp; institutions
        </div>
      </div>
    ),
    size
  );
}