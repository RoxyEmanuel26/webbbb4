import Link from "next/link";
import "../pages/Pages.css";

export default function EditorialPage({ title, lead, sections }) {
  return (
    <main className="page-wrapper legal-page editorial-page">
      <h1>{title}</h1>
      <p className="collection-lead">{lead}</p>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}
      <p>
        <Link href="/collections">Browse collections</Link>
      </p>
    </main>
  );
}
