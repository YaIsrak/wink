import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      displayName: true,
      username: true,
      bio: true,
      avatarUrl: true,
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  const displayName = user?.displayName || username;
  const userHandle = `@${user?.username || username}`;
  const bio = user?.bio
    ? user.bio.length > 120
      ? user.bio.slice(0, 117) + "..."
      : user.bio
    : "Connect and share moments with mutual follows on Wink.";
  const postsCount = user?._count.posts ?? 0;
  const followersCount = user?._count.followers ?? 0;
  const followingCount = user?._count.following ?? 0;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
            top: "-80px",
            left: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(201, 249, 151, 0.16)",
            filter: "blur(110px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-80px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background: "rgba(233, 46, 211, 0.2)",
            filter: "blur(120px)",
          }}
        />

        {/* Top Bar with Brand and Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                background: "#c9f997",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "26px",
                fontWeight: 900,
                color: "#000000",
              }}
            >
              w
            </div>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-1px",
              }}
            >
              wink
            </span>
          </div>

          <div
            style={{
              fontSize: "14px",
              fontWeight: 800,
              padding: "6px 16px",
              borderRadius: "999px",
              background: "rgba(201, 249, 151, 0.15)",
              color: "#c9f997",
              border: "1px solid rgba(201, 249, 151, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Creator Profile
          </div>
        </div>

        {/* Middle: Profile Identity Box */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "36px",
            width: "100%",
          }}
        >
          {/* Avatar / Initials Circle */}
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={displayName}
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "999px",
                objectFit: "cover",
                border: "4px solid #c9f997",
                boxShadow: "0 0 40px rgba(201, 249, 151, 0.35)",
              }}
            />
          ) : (
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #e92ed3, #c9f997)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "52px",
                fontWeight: 900,
                color: "#000000",
                boxShadow: "0 0 40px rgba(233, 46, 211, 0.3)",
              }}
            >
              {initials}
            </div>
          )}

          {/* Name, Handle, Bio */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "800px" }}>
            <h1
              style={{
                fontSize: "54px",
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: "-1.5px",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {displayName}
            </h1>
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#c9f997",
                fontFamily: "monospace",
              }}
            >
              {userHandle}
            </div>
            <p
              style={{
                fontSize: "22px",
                color: "#a1a1aa",
                margin: 0,
                marginTop: "6px",
                lineHeight: 1.35,
              }}
            >
              {bio}
            </p>
          </div>
        </div>

        {/* Bottom Bar: Stats Badges */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid #222226",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "28px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff" }}>
                {postsCount}
              </span>
              <span style={{ fontSize: "18px", color: "#71717a", fontWeight: 600 }}>
                Posts
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff" }}>
                {followersCount}
              </span>
              <span style={{ fontSize: "18px", color: "#71717a", fontWeight: 600 }}>
                Followers
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff" }}>
                {followingCount}
              </span>
              <span style={{ fontSize: "18px", color: "#71717a", fontWeight: 600 }}>
                Following
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#e92ed3",
              letterSpacing: "0.5px",
            }}
          >
            wink.social/{username}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
