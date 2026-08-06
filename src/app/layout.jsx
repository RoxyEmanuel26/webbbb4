import '../index.css';
import '../App.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AgeGateModal from '../components/AgeGateModal';

import AdSocialBar from '../components/AdSocialBar';
import AdPopunder from '../components/AdPopunder';
import CustomTopBanner from '../components/CustomTopBanner';
import CustomBottomBanner from '../components/CustomBottomBanner';

import Script from 'next/script';

export const runtime = 'edge';

export const metadata = {
  metadataBase: new URL('https://nicevx.com'),
  title: {
    default: 'NICEVX — Free HD Porn Videos | 4M+ Videos',
    template: '%s | NICEVX',
  },
  description: 'Watch free HD porn videos on NICEVX. Over 4 million videos updated daily — amateur, teen, MILF, Asian, hardcore and more in stunning 1080p HD quality.',
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
    title: 'NICEVX — Free HD Porn Videos | 4M+ Videos',
    description: 'Watch free HD porn videos on NICEVX. Over 4 million videos updated daily — amateur, teen, MILF, Asian, hardcore and more in stunning 1080p HD quality.',
    url: 'https://nicevx.com',
    siteName: 'NICEVX',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/favicon.webp',
        width: 512,
        height: 512,
        alt: 'NICEVX — Free HD Porn Videos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NICEVX — Free HD Porn Videos | 4M+ Videos',
    description: 'Watch free HD porn videos on NICEVX. Over 4 million videos updated daily.',
    images: ['/favicon.webp'],
  },
  icons: {
    icon: '/favicon.webp',
    shortcut: '/favicon.webp',
    apple: '/favicon.webp',
  },
  alternates: {
    canonical: '/',
  },
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
    url: 'https://nicevx.com',
    description: 'Free HD porn videos — over 4 million videos updated daily.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://nicevx.com/search?query={search_term_string}',
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
        <AdSocialBar />
        <AdPopunder />
        <AgeGateModal />
        <Navbar />
        <CustomTopBanner />
        
        <main>
          {children}
        </main>
        <CustomBottomBanner />
        <Footer />
      </body>
    </html>
  );
}
