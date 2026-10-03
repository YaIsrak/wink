import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export const alt = "Wink — Social media without the noise";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#000000",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow Spheres */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-100px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "rgba(201, 249, 151, 0.18)",
            filter: "blur(100px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            right: "-100px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "rgba(233, 46, 211, 0.22)",
            filter: "blur(110px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "20%",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background: "rgba(201, 249, 151, 0.08)",
            filter: "blur(80px)",
          }}
        />

        {/* Top Header Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "16px",
                background: "#c9f997",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                fontWeight: 900,
                color: "#000000",
                boxShadow: "0 0 30px rgba(201, 249, 151, 0.4)",
              }}
            >
              w
            </div>
            <span
              style={{
                fontSize: "40px",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-1.5px",
              }}
            >
              wink
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 800,
                padding: "6px 14px",
                borderRadius: "999px",
                background: "rgba(233, 46, 211, 0.15)",
                color: "#e92ed3",
                border: "1px solid rgba(233, 46, 211, 0.35)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              beta
            </span>
          </div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#a1a1aa",
              letterSpacing: "0.5px",
            }}
          >
            wink.social
          </div>
        </div>

        {/* Main Center Stage */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "1000px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "#c9f997",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            The Anti-Algorithmic Social App
          </div>
          <h1
            style={{
              fontSize: "66px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.1,
              letterSpacing: "-2.5px",
              margin: 0,
            }}
          >
            Social media without the corporate cringe.
          </h1>
          <p
            style={{
              fontSize: "26px",
              color: "#a1a1aa",
              lineHeight: 1.4,
              margin: 0,
            }}
          >
            Post genuine espresso photos, message mutual follows in real time,
            and enjoy a chronological feed with zero ads.
          </p>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          {[
            "Mutuals-Only DMs",
            "Zero Algorithmic Sludge",
            "Realtime Reactivity",
            "OLED Dark & Neon",
          ].map((tag, i) => (
            <div
              key={tag}
              style={{
                fontSize: "16px",
                fontWeight: 700,
                padding: "10px 20px",
                borderRadius: "999px",
                background: "#141416",
                color: i === 0 ? "#c9f997" : i === 3 ? "#e92ed3" : "#fefefe",
                border: "1px solid #27272a",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
