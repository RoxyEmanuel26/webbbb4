import EditorialPage from "@/components/EditorialPage";
import JsonLd from "@/components/JsonLd";
import { faqPageSchema, breadcrumbListSchema } from "@/lib/jsonld";

export const metadata = {
  title: "About NICEVX – Free HD Adult Video Platform | NICEVX",
  description: "Learn how NICEVX organizes free HD adult videos across clean categories, thematic collections, performer profiles, and privacy-first local storage.",
  alternates: { canonical: "https://www.nicevx.com/about" },
  openGraph: {
    title: "About NICEVX – Free HD Adult Video Platform | NICEVX",
    description: "Learn how NICEVX organizes free HD adult videos across clean categories, thematic collections, performer profiles, and privacy-first local storage.",
    url: "https://www.nicevx.com/about",
    type: "website",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "About NICEVX" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About NICEVX – Free HD Adult Video Platform | NICEVX",
    description: "Learn how NICEVX organizes free HD adult videos across clean categories, thematic collections, performer profiles, and privacy-first local storage.",
    images: ["/og-default.jpg"],
  },
};

const FAQS = [
  {
    question: "What is NICEVX?",
    answer: "NICEVX is a free adult streaming index and discovery catalog that organizes high-definition adult videos into clear topic categories, specialized collections, performer profiles, and duration-filtered hubs.",
  },
  {
    question: "How are video categories and collections structured?",
    answer: "Instead of exposing hundreds of overlapping search archives, NICEVX separates primary genre categories from specialized thematic collections so every topic hub highlights distinct runtimes, related tags, and high-definition streaming listings.",
  },
  {
    question: "Is NICEVX free to watch without creating an account?",
    answer: "Yes. Every clip and full-length scene listed on NICEVX can be streamed directly without user registration, monthly subscriptions, or payment walls.",
  },
  {
    question: "Does NICEVX store personal watch history on a server?",
    answer: "No. Watch history, saved favorites, and age confirmation preferences stay strictly inside your local browser storage and can be cleared anytime from your device.",
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
        lead="NICEVX is an adult streaming catalog built for fast browsing by genre, runtime, performer, and popularity without logins or clutter."
        sections={[
          {
            heading: "How the NICEVX Catalog Works",
            body: [
              "Finding a specific scene on massive tube websites often means sifting through broken thumbnails, shouty spam titles, and unorganized search feeds. NICEVX focuses on a cleaner discovery experience where every indexed listing includes clear title formatting, accurate scene duration, tag groupings, and visual storyboard frame previews before playback begins.",
              "Pages are organized into non-overlapping entry hubs: core genre categories (/cat/*), specialized thematic collections (/collections/*), full-length scenes running 25 minutes or longer (/movies), rising weekly highlights (/trends/weekly), and performer profiles (/pornstars).",
            ],
          },
          {
            heading: "Third-Party Sources & Playback Standards",
            body: [
              "NICEVX operates strictly as a metadata index and discovery layer. Video files and media streams are hosted and delivered directly by third-party providers such as Eporner through official embedded players rather than hosted on NICEVX servers.",
              "Every embedded player loads only after an adult visitor confirms 18+ eligibility and explicitly starts playback, keeping initial browsing pages fast on both desktop browsers and mobile connections.",
            ],
          },
          {
            heading: "Privacy-First Architecture",
            body: [
              "Bookmarks in Saved Videos, recent viewing history, and local playback settings such as autoplay preferences stay exclusively inside localStorage on your own device. Search inputs and personal watch activity are never written to a NICEVX user profile database.",
            ],
          },
          {
            heading: "Age Restrictions, Legal Compliance & Content Removal",
            body: [
              "NICEVX restricts access strictly to legal adults aged 18 or older (or the age of majority in your jurisdiction) and declares RTA classification headers across the site. All indexed listings must satisfy source availability and metadata checks.",
              "If an upstream video goes offline, becomes mislabeled, or triggers a valid copyright or compliance notice, our DMCA and Content Reporting workflow provides direct removal paths.",
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
