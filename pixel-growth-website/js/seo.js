// js/seo.js
// Pure SEO metadata module (Req 10.1, 10.2, 10.5).
//
// Provides the single source of truth for each page's <title> and
// <meta name="description"> content, plus pure validation helpers that report
// which page and which element (title or description) is missing or out of range.
//
// Length rules (from the design SEO Strategy section):
//   - title:       10–60 characters inclusive, unique across all pages (Req 10.1)
//   - description: 50–160 characters inclusive, non-empty (Req 10.2)
//
// These functions are pure (data in, result out) so they can be exercised by
// property-based and example tests over all five pages.

/**
 * @typedef {'home' | 'about' | 'services' | 'portfolio' | 'contact'} PageKey
 */

/**
 * @typedef {Object} PageMetadata
 * @property {string} title        The page's <title> text (10–60 chars, unique).
 * @property {string} description  The page's meta description (50–160 chars).
 */

/** Inclusive length bounds for a page title (Req 10.1). */
export const TITLE_MIN = 10;
export const TITLE_MAX = 60;

/** Inclusive length bounds for a meta description (Req 10.2). */
export const DESCRIPTION_MIN = 50;
export const DESCRIPTION_MAX = 160;

/** The five page keys, in site navigation order. */
export const PAGE_KEYS = /** @type {readonly PageKey[]} */ ([
  'home',
  'about',
  'services',
  'portfolio',
  'contact',
]);

/**
 * Single source of truth for per-page SEO metadata (Req 10.1, 10.2).
 * Keyed by PageKey. Titles follow the pattern
 * "Pixel & Growth | <Page> for Small Businesses" (or a close variant) and are
 * unique; descriptions are unique, human-written, and length-bounded.
 *
 * @type {Readonly<Record<PageKey, PageMetadata>>}
 */
export const PAGE_METADATA = Object.freeze({
  home: {
    // 43 chars
    title: 'Pixel & Growth | Web & Marketing Agency',
    // 148 chars
    description:
      'Pixel & Growth helps small businesses build, connect, and grow online with professional website design, digital marketing, SEO, and social media.',
  },
  about: {
    // 44 chars
    title: 'About Pixel & Growth | Our Mission & Values',
    // 151 chars
    description:
      'Learn about Pixel & Growth, the digital solutions agency helping small businesses grow online, and discover our mission, values, and client approach.',
  },
  services: {
    // 48 chars
    title: 'Services | Pixel & Growth Digital Solutions',
    // 155 chars
    description:
      'Explore Pixel & Growth services for small businesses: website design, digital marketing, social media management, SEO, and practical technology solutions.',
  },
  portfolio: {
    // 50 chars
    title: 'Portfolio | Pixel & Growth Sample Project Work',
    // 149 chars
    description:
      'Browse sample demonstration projects from Pixel & Growth that showcase the quality and style of web design and digital work we create for businesses.',
  },
  contact: {
    // 46 chars
    title: 'Contact Pixel & Growth | Start Your Project',
    // 146 chars
    description:
      'Contact Pixel & Growth to discuss helping your small business grow online. Tell us about your project and the service you are most interested in today.',
  },
});

/**
 * Whether a value is a non-empty string after trimming.
 * @param {unknown} value
 * @returns {boolean}
 */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Classify a single SEO element (title or description) for one page.
 * Returns `null` when the element is valid, otherwise an issue describing the
 * page, the element, and the reason it failed.
 *
 * @param {PageKey | string} page
 * @param {'title' | 'description'} element
 * @param {unknown} value
 * @param {number} min
 * @param {number} max
 * @returns {{ page: string, element: 'title' | 'description', reason: 'missing' | 'too-short' | 'too-long', length: number } | null}
 */
function checkElement(page, element, value, min, max) {
  if (!isNonEmptyString(value)) {
    return { page: String(page), element, reason: 'missing', length: 0 };
  }
  const length = /** @type {string} */ (value).length;
  if (length < min) {
    return { page: String(page), element, reason: 'too-short', length };
  }
  if (length > max) {
    return { page: String(page), element, reason: 'too-long', length };
  }
  return null;
}

/**
 * Validate a single page's metadata record (Req 10.5).
 * Reports which page and which element (title and/or description) is missing or
 * out of range. A missing/non-string element is reported as `missing`.
 *
 * @param {PageKey | string} page  The page key this metadata belongs to.
 * @param {Partial<PageMetadata> | null | undefined} metadata
 * @returns {{ page: string, valid: boolean, issues: Array<{ page: string, element: 'title' | 'description', reason: 'missing' | 'too-short' | 'too-long', length: number }> }}
 */
export function checkSeo(page, metadata) {
  const record = metadata ?? {};
  const issues = [];

  const titleIssue = checkElement(
    page,
    'title',
    record.title,
    TITLE_MIN,
    TITLE_MAX,
  );
  if (titleIssue) issues.push(titleIssue);

  const descriptionIssue = checkElement(
    page,
    'description',
    record.description,
    DESCRIPTION_MIN,
    DESCRIPTION_MAX,
  );
  if (descriptionIssue) issues.push(descriptionIssue);

  return { page: String(page), valid: issues.length === 0, issues };
}

/**
 * Validate every page in a metadata set (defaults to PAGE_METADATA).
 * Also checks title uniqueness across all pages (Req 10.1): any page whose
 * title duplicates another page's title is reported with a `duplicate-title`
 * issue in addition to any length/missing issues.
 *
 * @param {Readonly<Record<string, Partial<PageMetadata>>>} [metadataSet]
 * @returns {{ valid: boolean, results: ReturnType<typeof checkSeo>[], issues: Array<{ page: string, element: 'title' | 'description', reason: string, length: number }> }}
 */
export function checkAllSeo(metadataSet = PAGE_METADATA) {
  const entries = Object.entries(metadataSet);
  const results = entries.map(([page, metadata]) => checkSeo(page, metadata));

  // Detect duplicate titles across pages (Req 10.1: no two identical titles).
  /** @type {Map<string, string[]>} */
  const titleToPages = new Map();
  for (const [page, metadata] of entries) {
    const title = metadata && typeof metadata.title === 'string' ? metadata.title : undefined;
    if (title === undefined) continue;
    const pages = titleToPages.get(title) ?? [];
    pages.push(page);
    titleToPages.set(title, pages);
  }

  const duplicateIssues = [];
  for (const [, pages] of titleToPages) {
    if (pages.length > 1) {
      for (const page of pages) {
        duplicateIssues.push({
          page,
          element: /** @type {'title'} */ ('title'),
          reason: 'duplicate-title',
          length: 0,
        });
      }
    }
  }

  const allIssues = [
    ...results.flatMap((result) => result.issues),
    ...duplicateIssues,
  ];

  return {
    valid: allIssues.length === 0,
    results,
    issues: allIssues,
  };
}
