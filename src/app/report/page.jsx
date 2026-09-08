import EditorialPage from '@/components/EditorialPage';
export const metadata = { title: 'Report Content — NICEVX', description: 'How to report unavailable, mislabeled, or unlawful embedded content.', alternates: { canonical: 'https://www.nicevx.com/report' } };
export default function Page() { return <EditorialPage title="Moderation and reporting" lead="Use the original-source link on the relevant watch page to identify the exact provider record, then include that NICEVX URL in your report." sections={[
  { heading: 'What to report', body: ['Reports may cover unavailable embeds, incorrect classification, rights concerns, suspected non-consensual content, underage-content concerns, or other unlawful material. For copyright notices, follow the detailed requirements on the DMCA page.'] },
  { heading: 'Urgent source action', body: ['Because the media is embedded and hosted by Eporner, also report urgent safety or legality concerns directly to Eporner using the source page. NICEVX can remove the discovery record but cannot remove a media file from the provider.'] },
]} />; }
