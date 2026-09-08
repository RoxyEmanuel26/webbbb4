import '../index.css';
import '../App.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AgeGateModal from '../components/AgeGateModal';

import Script from 'next/script';

export const runtime = 'edge';

export const metadata = {
  metadataBase: new URL('https://www.nicevx.com/'),
  title: {
    default: 'NICEVX — Curated Adult Video Discovery',
    template: '%s',
  },
  description: 'A curated adult video discovery catalog ranked from factual source signals, with transparent methodology and privacy-first local recommendations.',
  keywords: ['free porn videos', 'HD porn', 'adult videos', 'free sex videos', 'porn tube', 'NICEVX', 'watch porn online'],
  authors: [{ name: 'NICEVX' }],
  creator: 'NICEVX',
  publisher: 'NICEVX',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'NICEVX — Curated Adult Video Discovery',
    description: 'A curated adult video discovery catalog ranked from factual source signals.',
    url: 'https://www.nicevx.com/',
    siteName: 'NICEVX',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        alt: 'NICEVX — Free HD Porn Videos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NICEVX — Curated Adult Video Discovery',
    description: 'A curated adult video discovery catalog ranked from factual source signals.',
    images: ['/favicon.png'],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  alternates: {
    canonical: 'https://www.nicevx.com/',
  },
  other: { rating: 'adult' },
};

export const viewport = {
  themeColor: '#0f0f11',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NICEVX',
    url: 'https://www.nicevx.com',
    description: 'Curated adult video discovery using factual source signals.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.nicevx.com/search?query={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://static-ca-cdn.eporner.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
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
          `
        }} />
      </head>
      <body>
        <Script 
          src="https://analytics.ahrefs.com/analytics.js" 
          data-key="VdAtEZ/WUhk9qsBEzocURw" 
          strategy="lazyOnload" 
        />
        <AgeGateModal />
        <Navbar />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
