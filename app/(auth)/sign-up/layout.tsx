import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join Wink today. Claim your username and experience social media without algorithms.",
  openGraph: {
    title: "Create Account | Wink",
    description:
      "Join Wink today. Claim your username and experience social media without algorithms.",
  },
  twitter: {
    title: "Create Account | Wink",
    description:
      "Join Wink today. Claim your username and experience social media without algorithms.",
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
