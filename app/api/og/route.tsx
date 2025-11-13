// app/api/og/route.tsx
import { ImageResponse } from "next/og";
export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Resourcin Human Capital Advisors";
  const subtitle = searchParams.get("subtitle") || "Connecting talent with opportunity";
  const bg = "#172965";

  return new ImageResponse(
    (
      <div
        style={{
          height: 630,
          width: 1200,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
          backgroundColor: bg,
          padding: 80,
          color: "white",
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 980 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, opacity: 0.9, maxWidth: 980, letterSpacing: 0.5 }}>
          {subtitle}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
