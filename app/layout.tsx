import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wink — Social Platform",
  description: "Connect, share moments, and chat with mutual follows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased suppressHydrationWarning`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className:
              "border border-border bg-card text-card-foreground shadow-sm rounded-md text-sm",
          }}
        />
      </body>
    </html>
  );
}
