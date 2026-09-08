import EditorialPage from '@/components/EditorialPage';
export const metadata = { title: 'Content Sources — NICEVX', description: 'Where NICEVX metadata and embedded media originate.', alternates: { canonical: 'https://www.nicevx.com/content-sources' } };
export default function Page() { return <EditorialPage title="Content sources" lead="NICEVX currently discovers public metadata and embeds from Eporner and clearly attributes the original source on every watch page." sections={[
  { heading: 'What NICEVX stores', body: ['The curated catalog stores an identifier, canonical slug, cleaned title and tags, factual description, category, thumbnails, embed and source URLs, duration, publication date, views, rating, availability, and synchronization time. NICEVX does not host the media file.'] },
  { heading: 'Provider terms', body: ['Monetization is disabled while NICEVX does not have written commercial permission. Each watch page includes a visible link to the original Eporner page. If the provider changes its terms or an item becomes unavailable, the item can be removed at the next catalog validation.'] },
]} />; }
