import { site } from '../data/site';

/**
 * JSON-LD builders. Every node gets a stable @id so search engines and AI answer
 * engines can connect Organization ⇄ WebSite ⇄ WebPage ⇄ Service entities.
 */
const abs = (path: string) => new URL(path, site.url).toString();
export const ids = {
  org: `${site.url}/#organization`,
  website: `${site.url}/#website`,
};

export const organization = () => ({
  '@type': 'Organization',
  '@id': ids.org,
  name: site.name,
  url: site.url + '/',
  description: site.description,
  slogan: site.tagline,
  email: site.email,
  areaServed: site.areaServed,
  knowsAbout: site.knowsAbout,
});

export const website = () => ({
  '@type': 'WebSite',
  '@id': ids.website,
  url: site.url + '/',
  name: site.name,
  description: site.shortDescription,
  inLanguage: site.language,
  publisher: { '@id': ids.org },
});

export const webPage = (o: { path: string; title: string; description: string; type?: string; image?: string; breadcrumbs?: boolean; dateModified?: string }) => ({
  '@type': o.type ?? 'WebPage',
  '@id': `${abs(o.path)}#webpage`,
  url: abs(o.path),
  name: o.title,
  description: o.description,
  inLanguage: site.language,
  isPartOf: { '@id': ids.website },
  about: { '@id': ids.org },
  ...(o.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: abs(o.image) } } : {}),
  ...(o.breadcrumbs ? { breadcrumb: { '@id': `${abs(o.path)}#breadcrumb` } } : {}),
  ...(o.dateModified ? { dateModified: o.dateModified } : {}),
});

export const breadcrumbs = (path: string, items: { name: string; path: string }[]) => ({
  '@type': 'BreadcrumbList',
  '@id': `${abs(path)}#breadcrumb`,
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
});

export const faqPage = (path: string, faqs: { q: string; a: string }[]) => ({
  '@type': 'FAQPage',
  '@id': `${abs(path)}#faq`,
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

export const serviceCatalog = (services: { title: string; slug: string; description: string }[]) => ({
  '@type': 'OfferCatalog',
  '@id': `${site.url}/#method`,
  name: `${site.name} method`,
  itemListElement: services.map((s) => ({
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', '@id': `${site.url}/#service-${s.slug}`, name: s.title, description: s.description, provider: { '@id': ids.org }, areaServed: site.areaServed },
  })),
});

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
export { abs };
