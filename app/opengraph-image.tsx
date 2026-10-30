import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const alt = "videorc/ui — the Videorc component library";
export const size = { height: 630, width: 1200 };
export const contentType = "image/png";

const OpengraphImage = () =>
  new ImageResponse(
    <div
      style={{
        background:
          "radial-gradient(circle at 30% 20%, #3a3a40 0%, #121215 45%, #050506 100%)",
        color: "#f4f4f5",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "flex-end",
        padding: 80,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
        <div
          style={{
            background: "#ef3b2d",
            borderRadius: 999,
            boxShadow: "0 0 24px #ef3b2d",
            height: 22,
            width: 22,
          }}
        />
        <div
          style={{
            background: "#ef3b2d",
            borderRadius: 999,
            boxShadow: "0 0 24px #ef3b2d",
            height: 22,
            width: 22,
          }}
        />
      </div>
      <div style={{ fontSize: 88, fontWeight: 600, letterSpacing: -2 }}>
        {siteConfig.name}
      </div>
      <div style={{ color: "#a1a1aa", fontSize: 36, marginTop: 16 }}>
        The Videorc component library for shadcn/ui
      </div>
    </div>,
    size
  );

export default OpengraphImage;
