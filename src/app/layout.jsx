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
  title: 'NICEVX — Free HD Porn Videos | 4M+ Videos',
  description: 'Watch free HD porn videos on NICEVX. Over 4 million videos updated daily.',
  openGraph: {
    title: 'NICEVX — Free HD Porn Videos',
    description: 'Watch free HD porn videos on NICEVX. Over 4 million videos updated daily.',
    url: 'https://nicevx.com',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport = {
  themeColor: '#0f0f11',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
