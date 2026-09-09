import EditorialPage from "@/components/EditorialPage";
export const metadata = {
  title: "Editorial Policy — NICEVX",
  description:
    "Rules for titles, descriptions, classifications, and corrections.",
  alternates: { canonical: "https://www.nicevx.com/editorial-policy" },
};
export default function Page() {
  return (
    <EditorialPage
      title="Editorial policy"
      lead="Titles and descriptions should be clear, accurate, and useful to visitors."
      sections={[
        {
          heading: "Titles and details",
          body: [
            "We may clean up unreadable titles or tags, but we do not add performers, scenes, dates, or other details that are not provided by the source.",
          ],
        },
        {
          heading: "Corrections and removal",
          body: [
            "Unavailable, misleading, duplicated, or reported videos may be corrected or removed. Use the Report Content link if something needs attention.",
          ],
        },
      ]}
    />
  );
}
