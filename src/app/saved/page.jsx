import SavedVideosClient from "@/components/SavedVideosClient";
import "../../pages/Pages.css";

export const metadata = {
  title: "Saved Videos — NICEVX",
  description: "Open the videos you saved on NICEVX.",
  robots: "noindex, follow",
  alternates: { canonical: "https://www.nicevx.com/saved" },
};

export default function SavedPage() {
  return (
    <main className="page-wrapper saved-page-wrapper">
      <SavedVideosClient />
    </main>
  );
}
