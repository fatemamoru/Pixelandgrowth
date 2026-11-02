// js/render.js
// Pure render helpers: "data in, markup out" (Req 2.6, 3.3, 5.2, 5.3).
//
// Every function in this module is side-effect free and returns an HTML string
// (or null for invalid input). Keeping them pure makes the rendering logic
// unit- and property-testable in isolation, and keeps the beginner mental model
// simple. These functions do NOT touch the DOM.
//
// All dynamic text and attribute values are HTML-escaped before being placed
// into markup so that content can never inject markup or break out of an
// attribute (defense-in-depth, even though current data is trusted).
//
// NOTE: Portfolio card/list helpers (task 5.2) are intended to be appended to
// this same module. This file is written so those additions slot in alongside
// the shared `escapeHtml` helper below without changes to existing exports.

/**
 * Escape a value for safe inclusion in HTML text content and double-quoted
 * attribute values.
 *
 * Replaces the five characters that are significant in HTML/attribute contexts:
 *   &  ->  &amp;   (must be first so later entities are not double-escaped)
 *   <  ->  &lt;
 *   >  ->  &gt;
 *   "  ->  &quot;
 *   '  ->  &#39;
 *
 * Non-string input is coerced to a string first; nullish input becomes ''.
 *
 * @param {unknown} value  The raw value to escape.
 * @returns {string}  The escaped, markup-safe string.
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render the single shared call-to-action button.
 *
 * Every CTA across the site uses this one helper so button styling is identical
 * everywhere (Req 2.6). It produces an anchor carrying the single shared
 * `btn btn-cta` class; both the visible label and the destination href are
 * escaped to prevent markup/attribute injection.
 *
 * @param {string} label  The visible button text.
 * @param {string} href   The destination URL (e.g. 'contact.html').
 * @returns {string}  HTML string for the anchor-styled CTA button.
 */
export function renderButton(label, href) {
  const safeLabel = escapeHtml(label);
  const safeHref = escapeHtml(href);
  return `<a class="btn btn-cta" href="${safeHref}">${safeLabel}</a>`;
}

/**
 * Render a single Service as a reusable service card (Req 3.3, 5.2, 5.3).
 *
 * The returned markup contains the service's title and description as escaped
 * text content, wrapped in a `service-card` element. Used for both the Home
 * services overview and the Services page list.
 *
 * Invalid input degrades to omission rather than a thrown error: the function
 * returns `null` when the service is missing, or when its title or description
 * is missing, non-string, or empty/whitespace-only. Callers skip `null`.
 *
 * @param {{ id?: string, title: string, description: string }} service  The service to render.
 * @returns {string | null}  HTML string for the card, or null for invalid input.
 */
export function renderServiceCard(service) {
  if (!service || typeof service !== 'object') {
    return null;
  }

  const { title, description } = service;

  if (typeof title !== 'string' || title.trim().length === 0) {
    return null;
  }
  if (typeof description !== 'string' || description.trim().length === 0) {
    return null;
  }

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  return (
    `<article class="service-card">` +
    `<h3 class="service-card__title">${safeTitle}</h3>` +
    `<p class="service-card__description">${safeDescription}</p>` +
    `</article>`
  );
}

/**
 * The persistent, non-interactive label text shown on every portfolio card so
 * visitors always know the work is illustrative, not real client work
 * (Req 6.2). It is rendered as a plain `<span>` — never a link or button — so
 * it conveys information without being interactive.
 *
 * @type {string}
 */
export const DEMONSTRATION_LABEL = 'Sample / Demonstration';

/**
 * The empty-state message shown on the Portfolio page when no valid
 * Demonstration_Projects are available to display (Req 6.6). Rendering this
 * message (rather than an empty region) retains the page layout.
 *
 * @type {string}
 */
export const PORTFOLIO_EMPTY_MESSAGE = 'Sample projects coming soon.';

/**
 * Path to the neutral, on-brand placeholder image swapped in when a
 * demonstration image fails to load (Req 11.5). Because the swap only changes
 * the `<img>` `src` (its declared `width`/`height` are untouched), the
 * placeholder fills the already-reserved box and the surrounding layout does
 * not shift.
 *
 * @type {string}
 */
export const IMAGE_PLACEHOLDER_SRC = 'assets/img/placeholder.svg';

/**
 * Render a single Demonstration_Project as a reusable portfolio card
 * (Req 6.2, 6.5, 6.7).
 *
 * The returned markup is an `<article class="portfolio-card">` containing:
 *   - a persistent, NON-INTERACTIVE "Sample / Demonstration" label rendered as
 *     a `<span>` (never a link/button) so every card is clearly flagged as
 *     illustrative without requiring visitor interaction (Req 6.2);
 *   - the project's escaped title and description text;
 *   - a `<picture>` offering AVIF and WebP sources with an `<img>` fallback
 *     that declares intrinsic width/height (to reserve space and avoid layout
 *     shift), uses `loading="lazy"` (portfolio cards are below the fold,
 *     Req 11.2), carries descriptive alt text, and has a self-removing
 *     `onerror` handler that swaps in a placeholder within the reserved
 *     dimensions so a failed image never shifts surrounding content (Req 11.5).
 *
 * Invalid input degrades to omission rather than a thrown error: the function
 * returns `null` when the project is missing, or when its title or description
 * is missing, non-string, or empty/whitespace-only (Req 6.7). Callers skip
 * `null` results.
 *
 * Image metadata is treated as optional/defensive: a card still renders when
 * image fields are absent, simply omitting the sources/attributes it cannot
 * build. The card's validity hinges only on title and description.
 *
 * @param {{ id?: string, title: string, description: string,
 *           image?: { webp?: string, avif?: string, alt?: string,
 *                     width?: number, height?: number } }} project  The project to render.
 * @returns {string | null}  HTML string for the card, or null for invalid input.
 */
export function renderPortfolioCard(project) {
  if (!project || typeof project !== 'object') {
    return null;
  }

  const { title, description } = project;

  if (typeof title !== 'string' || title.trim().length === 0) {
    return null;
  }
  if (typeof description !== 'string' || description.trim().length === 0) {
    return null;
  }

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  const image = project.image && typeof project.image === 'object' ? project.image : {};

  // Build the <picture> sources only for formats that are actually provided.
  let sources = '';
  if (typeof image.avif === 'string' && image.avif.length > 0) {
    sources += `<source type="image/avif" srcset="${escapeHtml(image.avif)}">`;
  }
  if (typeof image.webp === 'string' && image.webp.length > 0) {
    sources += `<source type="image/webp" srcset="${escapeHtml(image.webp)}">`;
  }

  // The <img> fallback: prefer the WebP path as its src, falling back to AVIF
  // if only that is provided. Width/height reserve space to avoid layout shift.
  const imgSrc =
    typeof image.webp === 'string' && image.webp.length > 0
      ? image.webp
      : typeof image.avif === 'string' && image.avif.length > 0
        ? image.avif
        : '';

  const altText = typeof image.alt === 'string' ? image.alt : '';
  const widthAttr = Number.isFinite(image.width) ? ` width="${escapeHtml(image.width)}"` : '';
  const heightAttr = Number.isFinite(image.height) ? ` height="${escapeHtml(image.height)}"` : '';

  // If the image fails to load, swap in the neutral placeholder WITHOUT changing
  // the img's declared width/height, so the reserved box is filled and the page
  // layout does not shift (Req 11.5). `this.onerror=null` runs first so a failing
  // placeholder can never retrigger the handler (no infinite error loop). The
  // placeholder path is a fixed, escaped literal (not visitor-controlled).
  const onErrorAttr =
    ` onerror="this.onerror=null;this.src=&#39;${escapeHtml(IMAGE_PLACEHOLDER_SRC)}&#39;"`;

  const img =
    `<img class="portfolio-card__image" src="${escapeHtml(imgSrc)}"` +
    ` alt="${escapeHtml(altText)}"${widthAttr}${heightAttr} loading="lazy"${onErrorAttr}>`;

  const picture = `<picture>${sources}${img}</picture>`;

  return (
    `<article class="portfolio-card">` +
    `<span class="portfolio-card__label">${escapeHtml(DEMONSTRATION_LABEL)}</span>` +
    picture +
    `<h3 class="portfolio-card__title">${safeTitle}</h3>` +
    `<p class="portfolio-card__description">${safeDescription}</p>` +
    `</article>`
  );
}

/**
 * Render a list of Demonstration_Projects as portfolio cards (Req 6.6, 6.7).
 *
 * Each project is rendered via {@link renderPortfolioCard}. Projects missing a
 * title or description produce `null` and are omitted, while the remaining
 * valid projects are kept in their original relative order (Req 6.7).
 *
 * If no projects are valid (empty input, non-array input, or every entry
 * omitted), the function returns the "coming soon" empty-state message so the
 * page layout is retained rather than left blank (Req 6.6).
 *
 * @param {Array<object>} projects  The projects to render.
 * @returns {string}  Concatenated card markup, or the empty-state message.
 */
export function renderPortfolioList(projects) {
  const list = Array.isArray(projects) ? projects : [];

  const cards = list
    .map((project) => renderPortfolioCard(project))
    .filter((card) => card !== null);

  if (cards.length === 0) {
    return `<p class="portfolio-empty">${escapeHtml(PORTFOLIO_EMPTY_MESSAGE)}</p>`;
  }

  return cards.join('');
}
