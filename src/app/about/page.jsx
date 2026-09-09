import EditorialPage from "@/components/EditorialPage";
export const metadata = {
  title: "About NICEVX",
  description: "Learn more about NICEVX and how the site works.",
  alternates: { canonical: "https://www.nicevx.com/about" },
};
export default function Page() {
  return (
    <EditorialPage
      title="About NICEVX"
      lead="NICEVX helps adults browse videos by category, popularity, and recent additions."
      sections={[
        {
          heading: "What you can do here",
          body: [
            "Browse collections, open related videos, and save favorites for later. Videos are provided by third-party sources and are not hosted by NICEVX.",
          ],
        },
        {
          heading: "Privacy",
          body: [
            "Favorites, recent viewing, and small event counters are kept in localStorage on the visitor’s device. Search terms and personal watch history are not sent to a NICEVX database. Aggregate traffic measurement uses the analytics service disclosed in the Privacy Policy.",
          ],
        },
      ]}
    />
  );
}
