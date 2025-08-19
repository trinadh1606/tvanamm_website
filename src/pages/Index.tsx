import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";

// Keep Hero eager (drives LCP)
import HeroCarousel from "@/components/home/HeroCarousel";

// Lazy-load everything else to trim initial JS
const TopPicksSection        = lazy(() => import("@/components/home/TopPicksSection"));
const MasterCatalogueSection = lazy(() => import("@/components/home/MasterCatalogueSection"));
const TestimonialsSection    = lazy(() => import("@/components/home/TestimonialsSection"));
const StatisticsSection      = lazy(() => import("@/components/home/StatisticsSection"));
const FranchiseInfoSection   = lazy(() => import("@/components/home/FranchiseInfoSection"));
const MSMESection            = lazy(() => import("@/components/home/MSMESection"));

// ✅ Popup is now eager (NOT lazy)
import LeadCapturePopup from "@/components/home/LeadCapturePopup";

// LCP image for the first hero slide (ensure HeroCarousel uses this as the first slide)
import heroLcp from "@/assets/hero-tea-garden-1.webp";

const SITE = "https://tvanamm.com";

// In-view helper
function InView({
  children,
  rootMargin = "250px",
  placeholderHeight = 280,
}: {
  children: (visible: boolean) => React.ReactNode;
  rootMargin?: string;
  placeholderHeight?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMargin]);
  return <div ref={ref}>{visible ? children(true) : <div style={{ minHeight: placeholderHeight }} />}</div>;
}

const Index: React.FC = () => {
  // Small, visible FAQ content to match JSON-LD
  const faqs = [
    {
      q: "Is T VANAMM a low investment tea franchise?",
      a: "Yes. We offer stall and café formats designed for low upfront investment with high ROI potential in Telangana & Andhra Pradesh.",
    },
    {
      q: "How long is the typical payback period?",
      a: "Many partners achieve payback within 8–12 months depending on city, footfall and format.",
    },
    {
      q: "Do you provide training and supply chain support?",
      a: "Absolutely. We provide staff training, SOPs, centralized procurement and launch marketing support.",
    },
  ];

  return (
    <>
      {/* Route-level SEO for Home */}
      <Helmet>
        {/* Primary SEO */}
        <title>Tea Franchise in India | Low Investment Chai Franchise (Under 5 Lakhs), High ROI – T VANAMM®</title>
        <meta
          name="description"
          content="Start a profitable tea franchise with T VANAMM® in Hyderabad, Telangana & Andhra Pradesh. Low investment (often under ₹5–10 lakhs), high ROI, training, supply chain & marketing support. Apply today."
        />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={`${SITE}/`} />

        {/* Expanded keywords (helps minor engines & site search) */}
        <meta
          name="keywords"
          content={[
            // Core head terms
            "tea franchise in india",
            "chai franchise",
            "tea franchise",
            "best tea franchise in india",
            "low investment tea franchise",
            "profitable tea franchise",
            "high roi franchise india",

            // Budget & pricing
            "tea franchise under 5 lakhs",
            "tea franchise under 10 lakhs",
            "tea franchise cost india",
            "tea franchise price",
            "small investment franchise india",

            // Formats & intents
            "tea shop franchise",
            "tea cafe franchise",
            "chai cafe franchise",
            "tea stall franchise",
            "tea kiosk franchise",
            "beverage franchise india",
            "food and beverage franchise low cost",

            // Location & geo-intent
            "tea franchise hyderabad",
            "tea franchise telangana",
            "tea franchise andhra pradesh",
            "chai franchise hyderabad",
            "franchise in hyderabad",

            // Consideration & comparisons
            "tea business opportunity",
            "start tea franchise",
            "tea franchise application",
            "tea franchise training",
            "tea franchise supply chain",
            "franchise marketing support",
            "franchise sop training",

            // Competitor alternatives (comparative intent)
            "tea time alternative",
            "chai sutta bar alternative",
            "mba chai wala alternative",
            "chai point alternative",
            "chaayos alternative",

            // Related
            "chai franchise india",
            "tea distributorship",
            "tea brand franchise",
            "franchise opportunities 2025 india"
          ].join(", ")}
        />

        {/* Prefetch likely next steps */}
        <link rel="prefetch" href="/franchise" as="document" />
        <link rel="prefetch" href="/contact" as="document" />

        {/* Open Graph / Twitter */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="T VANAMM" />
        <meta property="og:title" content="Tea Franchise in India | Low Investment, High ROI – T VANAMM®" />
        <meta
          property="og:description"
          content="Low investment chai franchise with training, SOPs, centralized supply chain & marketing support. Apply now."
        />
        <meta property="og:url" content={`${SITE}/`} />
        <meta property="og:image" content={`${SITE}/tea-og-image.webp`} />
        <meta property="og:image:alt" content="T VANAMM tea & chai franchise in India" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tea Franchise in India | Low Investment, High ROI – T VANAMM®" />
        <meta
          name="twitter:description"
          content="Start a profitable tea franchise. Under ₹5–10 lakhs, high ROI, full training & supply chain support."
        />
        <meta name="twitter:image" content={`${SITE}/tea-og-image.webp`} />

        {/* LCP image preload (must match first hero slide) */}
        <link rel="preload" as="image" href={heroLcp} />

        {/* JSON-LD: WebSite with SearchAction */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "T VANAMM",
            url: SITE,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE}/?s={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          })}
        </script>

        {/* JSON-LD: Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "T VANAMM",
            url: SITE,
            logo: `${SITE}/logo.png`,
            sameAs: [
              "https://facebook.com/tvanamm",
              "https://instagram.com/tvanamm",
              "https://x.com/tvanamm",
            ],
            contactPoint: [
              {
                "@type": "ContactPoint",
                telephone: "+91-9000008479",
                contactType: "customer service",
                areaServed: "IN",
                availableLanguage: ["en", "hi", "te"],
              },
            ],
          })}
        </script>

        {/* JSON-LD: LocalBusiness */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "T VANAMM",
            url: SITE,
            telephone: "+91-9000008479",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Kukatpally",
              addressLocality: "Hyderabad",
              addressRegion: "Telangana",
              postalCode: "500072",
              addressCountry: "IN",
            },
            geo: { "@type": "GeoCoordinates", latitude: 17.4875, longitude: 78.4095 },
            openingHoursSpecification: [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"
                ],
                opens: "07:00",
                closes: "23:00",
              },
            ],
            areaServed: ["Hyderabad", "Telangana", "Andhra Pradesh"],
            priceRange: "₹₹",
          })}
        </script>

        {/* JSON-LD: Breadcrumbs */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
            ],
          })}
        </script>

        {/* JSON-LD: FAQPage (matches visible FAQ below) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map(({ q, a }) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          })}
        </script>
      </Helmet>

      {/* Visually-hidden H1 to reinforce primary keyword without cluttering UI */}
      <h1 style={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap"
      }}>
        Tea Franchise in India – Low Investment, High ROI Chai Franchise | T VANAMM
      </h1>

      <div className="min-h-screen">
        {/* Hero (critical) */}
        <HeroCarousel />

        {/* Subtle keyword-support paragraph near fold */}
        <section className="mx-auto max-w-6xl px-4 py-6">
          <p className="text-sm text-muted-foreground">
            Explore <strong>tea franchise</strong> and <strong>chai franchise</strong> opportunities in{" "}
            <strong>Hyderabad</strong>, <strong>Telangana</strong> & <strong>Andhra Pradesh</strong> with
            <span> T VANAMM</span> — a <strong>low investment</strong>, <strong>high ROI</strong> model with training,
            supply chain and marketing support. Compare us with popular brands to choose the{" "}
            <strong>best tea franchise</strong> for your goals.
          </p>
        </section>

        {/* Lazy sections to keep bundle thin */}
        <InView>
          {(visible) => (
            <Suspense fallback={<div className="h-72 bg-muted animate-pulse" aria-hidden />}>
              {visible ? <TopPicksSection /> : null}
            </Suspense>
          )}
        </InView>
        <InView>
          {(visible) => (
            <Suspense fallback={<div className="h-60 bg-muted animate-pulse" aria-hidden />}>
              {visible ? <MasterCatalogueSection /> : null}
            </Suspense>
          )}
        </InView>
        <InView>
          {(visible) => (
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse" aria-hidden />}>
              {visible ? <StatisticsSection /> : null}
            </Suspense>
          )}
        </InView>
        <InView>
          {(visible) => (
            <Suspense fallback={<div className="h-80 bg-muted animate-pulse" aria-hidden />}>
              {visible ? <TestimonialsSection /> : null}
            </Suspense>
          )}
        </InView>
        <InView>
          {(visible) => (
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse" aria-hidden />}>
              {visible ? <FranchiseInfoSection /> : null}
            </Suspense>
          )}
        </InView>
        <InView>
          {(visible) => (
            <Suspense fallback={<div className="h-56 bg-muted animate-pulse" aria-hidden />}>
              {visible ? <MSMESection /> : null}
            </Suspense>
          )}
        </InView>

        {/* Lightweight visible FAQ to back the FAQPage schema */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-2xl font-semibold mb-4">Tea Franchise FAQs</h2>
          <dl className="space-y-4 text-sm">
            {faqs.map(({ q, a }) => (
              <div key={q}>
                <dt className="font-medium">{q}</dt>
                <dd className="text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 text-sm">
            Next: <a href="/franchise" className="underline">see investment formats & ROI</a> or{" "}
            <a href="/contact" className="underline">contact our franchise team</a>.
          </div>
        </section>

        {/* ✅ Popup now loads eagerly */}
        <LeadCapturePopup />
      </div>
    </>
  );
};

export default Index;
