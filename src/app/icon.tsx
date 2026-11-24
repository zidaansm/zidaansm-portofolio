import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0A0A",
          border: "2px solid #FAFAFA",
          color: "#FAFAFA",
          fontSize: 20,
          fontWeight: 900,
          fontFamily: "sans-serif",
          letterSpacing: "-0.04em",
        }}
      >
        Z
      </div>
    ),
    {
      ...size,
    }
  );
}
