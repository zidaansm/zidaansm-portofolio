import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FAFAFA",
          padding: 14,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0A0A0A",
            border: "6px solid #0A0A0A",
            boxShadow: "8px 8px 0px #0A0A0A",
            color: "#FAFAFA",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.05em",
            }}
          >
            Z
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 4,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.24em",
              color: "#A1A1AA",
            }}
          >
            ZSM
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
