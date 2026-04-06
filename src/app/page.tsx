import SiteHeader from "@/components/marketing/SiteHeader";
import ForBusinessSection from "@/components/marketing/ForBusinessSection";
import HomeJourney from "@/components/marketing/HomeJourney";
import MarketingHero from "@/components/marketing/MarketingHero";

/** Avoid stale CDN/browser cache hiding UI updates during iteration. */
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden hero-gradient mesh-bg">
      <SiteHeader />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(250,250,250,0.9))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(9,9,11,0.85))]" />

      <main className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col justify-start gap-16 px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
        <MarketingHero />
        <ForBusinessSection />
        <HomeJourney />
      </main>
    </div>
  );
}
