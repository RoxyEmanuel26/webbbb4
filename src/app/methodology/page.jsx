import EditorialPage from "@/components/EditorialPage";
export const metadata = {
  title: "How NICEVX Works",
  description: "How videos and collections are organized on NICEVX.",
  alternates: { canonical: "https://www.nicevx.com/methodology" },
};
export default function Page() {
  return (
    <EditorialPage
      title="How NICEVX works"
      lead="The site keeps browsing simple while checking that every listed video is still available."
      sections={[
        {
          heading: "Choosing what to show",
          body: [
            "Videos need a working player, thumbnail, title, and source page before they appear. Unavailable videos are removed during regular updates.",
          ],
        },
        {
          heading: "Ordering videos",
          body: [
            "Lists can be sorted by newest, most viewed, top rated, or recommended. Recommendations use the information shown on the site, such as popularity, rating, and recency.",
          ],
        },
        {
          heading: "Building collections",
          body: [
            "Collections grow as suitable videos are added. Similar collections are kept separate only when they offer a useful way to browse.",
          ],
        },
      ]}
    />
  );
}
