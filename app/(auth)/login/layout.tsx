import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Sign in to your Wink account to connect with mutual friends and check your feed.",
  openGraph: {
    title: "Log In | Wink",
    description:
      "Sign in to your Wink account to connect with mutual friends and check your feed.",
  },
  twitter: {
    title: "Log In | Wink",
    description:
      "Sign in to your Wink account to connect with mutual friends and check your feed.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
