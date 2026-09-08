import EditorialPage from '@/components/EditorialPage';
export const metadata = { title: 'Editorial Policy — NICEVX', description: 'Rules for titles, descriptions, classifications, and corrections.', alternates: { canonical: 'https://www.nicevx.com/editorial-policy' } };
export default function Page() { return <EditorialPage title="Editorial policy" lead="Automated assistance may improve readability, but published factual claims must be supported by source metadata or measured snapshots." sections={[
  { heading: 'AI boundaries', body: ['DeepSeek may clean malformed titles, normalize tags, choose from an allowed category list, and summarize supplied facts. Outputs that add unsupported performers, acts, dates, popularity, or production details are rejected. AI does not create trend claims.'] },
  { heading: 'Corrections and removal', body: ['Unavailable, misleading, malformed, duplicated, or reported records are removed from the publication set. A missing curated ID returns 404 rather than a generic successful page.'] },
]} />; }
