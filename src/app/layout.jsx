import '../index.css';
import '../App.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AgeGateModal from '../components/AgeGateModal';
import AdPopunder from '../components/AdPopunder';
import AdSocialBar from '../components/AdSocialBar';
import AdBanner from '../components/AdBanner';

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <AdPopunder />
        <AdSocialBar />
        <AgeGateModal />
        <Navbar />
        
        {/* Global Top Banner (728x90 Desktop / 320x50 Mobile) */}
        <div className="page-wrapper" style={{ marginTop: '1.5rem' }}>
          <div className="ad-row ad-row--top">
            <div className="ad-desktop-only">
              <AdBanner adKey="6cb50045b61eddee00e504ba14847190" width={728} height={90} />
            </div>
            <div className="ad-mobile-only">
              <AdBanner adKey="05f054fa88f5e6d6b183797a8f9213f9" width={320} height={50} />
            </div>
          </div>
        </div>

        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
