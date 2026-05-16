import { useEffect } from 'react';

/**
 * Sprint 2: Lightweight in-house SEO helper. Mutates document.title and a small
 * set of <meta>/<link>/<script> tags directly — no `react-helmet-async` dependency
 * needed (avoids a fresh `npm install` on every developer's machine).
 *
 * Pass `noindex` for /account, /admin, /checkout etc. Pass `jsonLd` to inject
 * a JSON-LD <script> block (e.g. `Product` schema on the product detail page).
 */

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  noindex?: boolean;
  /** Object to be JSON.stringify-ed into a single `<script type="application/ld+json">` */
  jsonLd?: Record<string, unknown> | null;
  /** Open Graph type. Defaults to "website". */
  ogType?: string;
}

const DEFAULT_TITLE = 'Urban Drape — Modern Indian Apparel';
const DEFAULT_DESCRIPTION =
  'Urban Drape brings you contemporary, ethically made Indian apparel — sarees, kurtas, and modern essentials.';
const DEFAULT_IMAGE = '/og-default.jpg';

const ensureMeta = (selector: string, attrs: Record<string, string>) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
};

const ensureLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

export const SEO = ({
  title,
  description,
  canonical,
  image,
  noindex,
  jsonLd,
  ogType = 'website',
}: SEOProps) => {
  useEffect(() => {
    const finalTitle = title ? `${title} | Urban Drape` : DEFAULT_TITLE;
    const finalDescription = description || DEFAULT_DESCRIPTION;
    const finalImage = image || DEFAULT_IMAGE;
    // Sprint 6 / BUG-F-082: build canonical from origin + pathname only (drop
    // query string AND hash). Strip trailing slash and lowercase the host so
    // /product/abc and /product/abc/ don't compete as separate canonicals.
    const buildCanonical = (): string | undefined => {
      if (canonical) return canonical;
      if (typeof window === 'undefined') return undefined;
      const { origin, pathname } = window.location;
      const lowerOrigin = origin.toLowerCase();
      const trimmedPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
      return `${lowerOrigin}${trimmedPath}`;
    };
    const finalCanonical = buildCanonical();

    document.title = finalTitle;

    ensureMeta('meta[name="description"]', { name: 'description', content: finalDescription });
    ensureMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow',
    });

    // Open Graph
    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: finalTitle });
    ensureMeta('meta[property="og:description"]', { property: 'og:description', content: finalDescription });
    ensureMeta('meta[property="og:type"]', { property: 'og:type', content: ogType });
    ensureMeta('meta[property="og:image"]', { property: 'og:image', content: finalImage });
    if (finalCanonical) ensureMeta('meta[property="og:url"]', { property: 'og:url', content: finalCanonical });

    // Twitter
    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: finalTitle });
    ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: finalDescription });
    ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: finalImage });

    // Canonical
    if (finalCanonical) ensureLink('canonical', finalCanonical);

    // JSON-LD
    const SCRIPT_ID = 'seo-jsonld';
    const existing = document.getElementById(SCRIPT_ID);
    if (jsonLd) {
      const script = (existing as HTMLScriptElement) || document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      if (!existing) document.head.appendChild(script);
    } else if (existing) {
      existing.remove();
    }
  }, [title, description, canonical, image, noindex, jsonLd, ogType]);

  return null;
};

export default SEO;
