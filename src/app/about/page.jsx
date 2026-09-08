import EditorialPage from '@/components/EditorialPage';
export const metadata = { title: 'About NICEVX', description: 'NICEVX is a small, transparent adult video discovery catalog.', alternates: { canonical: 'https://www.nicevx.com/about' } };
export default function Page() { return <EditorialPage title="About NICEVX" lead="NICEVX is being rebuilt as a transparent discovery layer: fewer pages, verified records, explainable ranking, and local-only personalization." sections={[
  { heading: 'Purpose', body: ['The site helps adults navigate a limited curated set using collections, factual panels, and related clusters. It is not an owner or host of the embedded videos and does not claim a catalog size that it cannot verify.'] },
  { heading: 'Privacy', body: ['Favorites, recent viewing, and small event counters are kept in localStorage on the visitor’s device. Search terms and personal watch history are not sent to a NICEVX database. Aggregate traffic measurement uses the analytics service disclosed in the Privacy Policy.'] },
]} />; }
