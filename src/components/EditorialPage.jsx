import Link from "next/link";
import "../pages/Pages.css";

export default function EditorialPage({ title, lead, sections, relatedLinks }) {
  const links = relatedLinks?.length
    ? relatedLinks
    : [{ href: "/collections", label: "Browse collections" }];

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
      <nav aria-label="Explore NICEVX hubs" style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.5rem" }}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="related-cat-link">
            {link.label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
