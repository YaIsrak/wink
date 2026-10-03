import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { getBaseUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Wink — Social media without the noise",
    template: "%s | Wink",
  },
  description:
    "Wink is a clean social media web app where genuine humans post photos, like moments, and chat with mutual follows in real time. Zero algorithms, zero ads.",
  applicationName: "Wink",
  authors: [{ name: "Wink" }],
  generator: "Next.js",
  keywords: [
    "social media",
    "wink",
    "realtime messaging",
    "mutual follows",
    "photo sharing",
    "clean social network",
    "anti algorithm",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Wink",
  publisher: "Wink",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Wink",
    title: "Wink — Social media without the noise",
    description:
      "A clean social media web app where genuine humans post photos, like moments, and chat with mutual follows in real time.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wink — Social media without the noise",
    description:
      "A clean social media web app where genuine humans post photos, like moments, and chat with mutual follows in real time.",
    creator: "@wink",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const themeScript = `(function() {
  try {
    var stored = localStorage.getItem('wink-theme');
    var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
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
