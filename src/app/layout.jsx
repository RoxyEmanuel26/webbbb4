import '../index.css';
import '../App.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AgeGateModal from '../components/AgeGateModal';
import AdPopunder from '../components/AdPopunder';
import AdSocialBar from '../components/AdSocialBar';

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
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
