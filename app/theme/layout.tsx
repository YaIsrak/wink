import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design System & Theme Showcase",
  description:
    "Living design system showcase for Wink design tokens, interactive components, and theme states.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThemeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
