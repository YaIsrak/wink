import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingPageView } from "@/components/landing/landing-page-view";

export const metadata = {
  title: "Wink — Social media without the noise",
  description:
    "A social media web app where real humans post photos, like genuine moments, and message mutual follows in real time.",
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
