import EditorialPage from "@/components/EditorialPage";
export const metadata = {
  title: "Content Sources — NICEVX",
  description: "Where videos and information shown on NICEVX come from.",
  alternates: { canonical: "https://www.nicevx.com/content-sources" },
};
export default function Page() {
  return (
    <EditorialPage
      title="Content sources"
      lead="Videos on NICEVX currently play through Eporner, and every watch page links back to the original source."
      sections={[
        {
          heading: "Video information",
          body: [
            "Titles, thumbnails, duration, views, ratings, and player links come from the source. NICEVX does not host the video files.",
          ],
        },
        {
          heading: "Availability",
          body: [
            "A video may be removed if its source page or player stops working. You can report a broken or incorrectly labeled video through the Report Content page.",
          ],
        },
      ]}
    />
  );
}
