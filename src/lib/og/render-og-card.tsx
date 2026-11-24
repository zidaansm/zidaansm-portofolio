import { ImageResponse } from "next/og";

export interface OgCardData {
  eyebrow: string;
  badgeText: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  footerRight: string;
}

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export function renderBrutalistOgImage(data: OgCardData) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#F4F4F5",
          padding: 44,
          fontFamily: "sans-serif",
          color: "#0A0A0A",
        }}
      >
        {/* Main Editorial Swiss-Brutalist Card */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#FFFFFF",
            border: "4px solid #0A0A0A",
            boxShadow: "14px 14px 0px #0A0A0A",
            padding: 44,
          }}
        >
          {/* Top Header Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "3px solid #0A0A0A",
              paddingBottom: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#0A0A0A",
                  color: "#FAFAFA",
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                Z
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#525252",
                }}
              >
                {data.eyebrow}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#0A0A0A",
                color: "#FAFAFA",
                padding: "10px 18px",
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: "#FAFAFA",
                  display: "flex",
                }}
              />
              <span>{data.badgeText}</span>
            </div>
          </div>

          {/* Center Body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 12,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 56,
                fontWeight: 900,
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                color: "#0A0A0A",
              }}
            >
              {data.title}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: "#27272A",
              }}
            >
              {data.subtitle}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 21,
                lineHeight: 1.4,
                color: "#525252",
                maxWidth: 960,
              }}
            >
              {data.description}
            </div>
          </div>

          {/* Bottom Metadata Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "3px solid #0A0A0A",
              paddingTop: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {data.tags.slice(0, 6).map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    border: "2px solid #0A0A0A",
                    backgroundColor: "#FAFAFA",
                    padding: "6px 14px",
                    fontSize: 16,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#525252",
              }}
            >
              {data.footerRight}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_IMAGE_SIZE,
    }
  );
}
