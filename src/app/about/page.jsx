import EditorialPage from "@/components/EditorialPage";
import JsonLd from "@/components/JsonLd";
import { faqPageSchema, breadcrumbListSchema } from "@/lib/jsonld";

export const metadata = {
  title: "About NICEVX – Free HD Adult Video Platform | NICEVX",
  description: "Learn about NICEVX, an index of verified free adult videos, curated collections, privacy-first features, and content standards.",
  alternates: { canonical: "https://www.nicevx.com/about" },
  openGraph: {
    title: "About NICEVX – Free HD Adult Video Platform | NICEVX",
    description: "Learn about NICEVX, an index of verified free adult videos, curated collections, privacy-first features, and content standards.",
    url: "https://www.nicevx.com/about",
    type: "website",
    images: [{ url: "/favicon.png", width: 512, height: 512, alt: "About NICEVX" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About NICEVX – Free HD Adult Video Platform | NICEVX",
    description: "Learn about NICEVX, an index of verified free adult videos, curated collections, privacy-first features, and content standards.",
    images: ["/favicon.png"],
  },
};

const FAQS = [
  {
    question: "What is NICEVX?",
    answer: "NICEVX is a free adult streaming index and discovery platform that curates high-definition adult videos across verified categories, featuring client-side privacy controls, fast streaming playback, and curated topic collections.",
  },
  {
    question: "Is NICEVX free to watch?",
    answer: "Yes. All curated clips and streaming videos indexed on NICEVX are free to watch in high definition without requiring user registration, subscriptions, or credit card information.",
  },
  {
    question: "Does NICEVX store personal browsing history?",
    answer: "No. NICEVX uses a privacy-first architecture where watch history, saved favorites, and preferences are kept exclusively inside your browser's local storage and are never uploaded to a remote database.",
  },
  {
    question: "How does NICEVX curate video collections?",
    answer: "NICEVX curates content using automated discovery algorithms combined with editorial review, evaluating video duration, view velocity, tag relevance, and HD stream availability to deliver topic-focused collections.",
  },
];

export default function Page() {
  return (
    <>
      <JsonLd
        data={[
          faqPageSchema(FAQS),
          breadcrumbListSchema([
            { name: "Home", url: "/" },
            { name: "About", url: "/about" },
          ]),
        ]}
      />
      <EditorialPage
        title="About NICEVX"
        lead="NICEVX helps adults browse videos by category, popularity, and recent additions."
        sections={[
          {
            heading: "What you can do here",
            body: [
              "Browse collections, open related videos, and save videos for later. Videos are provided by third-party sources and are not hosted by NICEVX.",
            ],
          },
          {
            heading: "Privacy",
            body: [
              "Saved videos, recent viewing, and small event counters are kept in localStorage on the visitor’s device. Search terms and personal watch history are not sent to a NICEVX database. Aggregate traffic measurement uses the analytics service disclosed in the Privacy Policy.",
            ],
          },
          {
            heading: "Content Standards & Discovery",
            body: [
              "NICEVX organizes its catalog into focused entry points including A-Z Categories, topic Collections, Full-Length Movies (25+ minutes), Performer profiles, and weekly Trending charts so visitors can locate high-definition scenes without clutter.",
              "Every category and collection page exposes structured metadata, clear duration labels, and direct related links while keeping strict compliance with 18+ age restrictions and DMCA takedown procedures.",
            ],
          },
          {
            heading: "Frequently Asked Questions",
            body: FAQS.flatMap((f) => ['Q: ' + f.question, f.answer]),
          },
        ]}
        relatedLinks={[
          { href: "/collections", label: "Browse Collections" },
          { href: "/cats", label: "All Categories A-Z" },
          { href: "/movies", label: "Full-Length Movies" },
          { href: "/pornstars", label: "Popular Pornstars" },
          { href: "/trends/weekly", label: "Trending This Week" },
          { href: "/privacy", label: "Privacy Policy" },
        ]}
      />
    </>
  );
}
