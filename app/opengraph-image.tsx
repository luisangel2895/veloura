import { ImageResponse } from "next/og";

export const alt = "Veloura — Intimate Atelier";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0a0a0a",
        color: "#fafaf9",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#fafaf9",
          }}
        >
          Veloura
        </div>
        <div
          style={{
            fontSize: 16,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: "#a8a29e",
          }}
        >
          Intimate Atelier
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 20,
            color: "#78716c",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Luxury editorial lingerie storefront with Stripe-ready checkout
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          gap: "32px",
          fontSize: 14,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#57534e",
        }}
      >
        <span>Balconette</span>
        <span>Bridal</span>
        <span>Bodysuits</span>
        <span>Lounge</span>
      </div>
    </div>,
    { ...size },
  );
}
