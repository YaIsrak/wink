import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingPageView } from "@/components/landing/landing-page-view";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wink — Social media without the noise",
  description:
    "A clean social media web app where real humans post photos, like genuine moments, and message mutual follows in real time. Zero algorithms, zero ads.",
  openGraph: {
    title: "Wink — Social media without the noise",
    description:
      "A clean social media web app where real humans post photos, like genuine moments, and message mutual follows in real time.",
    url: "/",
  },
  twitter: {
    title: "Wink — Social media without the noise",
    description:
      "A clean social media web app where real humans post photos, like genuine moments, and message mutual follows in real time.",
  },
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Signed in users bypass the landing page and head straight to their feed
  if (user) {
    redirect("/feed");
  }

  // Guests view the public landing page
  return <LandingPageView />;
}
