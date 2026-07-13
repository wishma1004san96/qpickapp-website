import { ImageResponse } from "next/og";

export const alt = "Q Pick — Sri Lanka, moved with certainty.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A1620",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            color: "#0E7C7B",
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          Sri Lanka
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 88,
              color: "#F3F6F7",
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            Q Pick
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#D7E2E6",
              maxWidth: 720,
              lineHeight: 1.3,
            }}
          >
            Sri Lanka, moved with certainty.
          </div>
        </div>
        <div style={{ display: "flex", color: "#6B7C88", fontSize: 22 }}>
          Rides · Airport · Tours
        </div>
      </div>
    ),
    { ...size },
  );
}
