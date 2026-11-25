import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../index.css";
import "../App.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AgeGateModal from "../components/AgeGateModal";
import MobileBottomNav from "../components/MobileBottomNav";

import Script from "next/script";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://www.nicevx.com/"),
  title: {
    default: "NICEVX — Free HD Adult Videos & International Streaming Catalog",
    template: "%s",
  },
  description:
    "Stream free HD adult videos, European & American categories, full-length movies, and top performer filmographies on NICEVX.",
  keywords: [
    "free porn videos",
    "HD porn",
    "adult videos",
    "European adult videos",
    "American pornstars",
    "full length adult movies",
    "NICEVX",
  ],
  authors: [{ name: "NICEVX" }],
  creator: "NICEVX",
  publisher: "NICEVX",
  manifest: "/manifest.webmanifest",
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
  openGraph: {
    title: "NICEVX — Free HD Adult Videos",
    description:
      "Browse curated HD adult videos, European & US categories, full movies, and top performer directories.",
    url: "https://www.nicevx.com/",
    siteName: "NICEVX",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "NICEVX — Free HD Adult Videos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NICEVX — Free HD Adult Videos",
    description:
      "Browse curated HD adult videos, European & US categories, full movies, and top performer directories.",
    images: ["/og-default.jpg"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  other: { rating: "RTA-5042-1996-1400-1577-RTA" },
};

export const viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://static-ca-cdn.eporner.com" />
        <link rel="dns-prefetch" href="https://static-ca-cdn.eporner.com" />
        <link rel="alternate" type="application/rss+xml" title="NICEVX Latest HD Videos" href="/feed.xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
            (function() {
              try {
                var savedTheme = localStorage.getItem('nicevx_theme');
                if (savedTheme === 'light') {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
                var search = window.location.search;
                if (search.includes('utm_') || search.includes('fbclid') || search.includes('gclid') || search.includes('ref=')) {
                  var params = new URLSearchParams(search);
                  var keys = Array.from(params.keys());
                  for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (key.startsWith('utm_') || key === 'fbclid' || key === 'gclid' || key === 'ref') {
                      params.delete(key);
                    }
                  }
                  var newSearch = params.toString();
                  var newUrl = window.location.pathname + (newSearch ? '?' + newSearch : '') + window.location.hash;
                  window.history.replaceState(null, '', newUrl);
                }
              } catch (e) {}
            })();
          `,
          }}
        />
      </head>
      <body>
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="VdAtEZ/WUhk9qsBEzocURw"
          strategy="lazyOnload"
        />
        <Script
          id="adsterra-social-bar"
          src="https://biomanos.org/14/6b5f74f06f7a6a6df37d65cea9803a1d"
          data-cfasync="false"
          strategy="afterInteractive"
        />
        <AgeGateModal />
        <Navbar />
        <main id="main-content" className="site-main">{children}</main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
