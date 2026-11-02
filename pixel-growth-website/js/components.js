// js/components.js
// SINGLE definition of the shared Navigation_Menu and Footer, rendered on all
// five Pages from one source (Req 12.2, 12.3). Also sets the active-state
// indicator on exactly one nav link (Req 1.6) and injects the markup into the
// empty shared landmarks on DOMContentLoaded.
//
// Design reference: "Components and Interfaces" + Architecture ("How shared
// components work without a build step"). Each page ships an empty
// <header data-component="site-nav"> and <footer data-component="site-footer">
// landmark; this module fills them in at load time. No build step is required.
//
// `renderNav` and `renderFooter` are PURE exports (data in, markup out) so they
// can be unit- and property-tested in isolation without touching the DOM. The
// DOM injection (`mountSharedComponents`) is kept separate and only runs in a
// browser-like environment.
//
// GRACEFUL DEGRADATION (Req 12.5): if a Reusable_Component fails to inject (an
// error thrown while rendering, or a missing host landmark), the page MUST still
// show its primary content and a VISIBLE indication that a shared element is
// unavailable, rather than throwing and leaving the page broken.
// `mountSharedComponents` therefore wraps each injection in try/catch and, on
// failure, writes a visible `<p class="shared-unavailable">…</p>` notice into
// the host instead of re-throwing.
//
// NO-JAVASCRIPT FALLBACK (Req 12.5): so navigation survives with JS disabled or
// failed to load, every Page MUST embed a `<noscript>` list of the five page
// links directly inside its shared landmarks. The exact landmark markup pattern
// pages must use (wired in task 10) is:
//
//   <header data-component="site-nav">
//     <noscript>
//       <ul>
//         <li><a href="index.html">Home</a></li>
//         <li><a href="about.html">About</a></li>
//         <li><a href="services.html">Services</a></li>
//         <li><a href="portfolio.html">Portfolio</a></li>
//         <li><a href="contact.html">Contact</a></li>
//       </ul>
//     </noscript>
//   </header>
//   ...primary page content...
//   <footer data-component="site-footer">
//     <noscript>
//       <ul>
//         <li><a href="index.html">Home</a></li>
//         <li><a href="about.html">About</a></li>
//         <li><a href="services.html">Services</a></li>
//         <li><a href="portfolio.html">Portfolio</a></li>
//         <li><a href="contact.html">Contact</a></li>
//       </ul>
//     </noscript>
//   </footer>
//
// The `<noscript>` content is exported as the `NOSCRIPT_FALLBACK` constant so
// task 10 can embed the identical five-link list in all five pages consistently.
// When JS runs, `mountSharedComponents` replaces the landmark's inner HTML (the
// `<noscript>` block is inert once JS has filled the landmark); when JS does not
// run, the browser surfaces the `<noscript>` links.
//
// NOTE: The mobile toggle click wiring (task 12.1) is intentionally NOT
// implemented here. The structure (toggle button with aria-expanded/
// aria-controls) is in place so that task can slot in without reworking this
// module.

import { escapeHtml } from './render.js';

/**
 * @typedef {'home' | 'about' | 'services' | 'portfolio' | 'contact'} PageKey
 */

/**
 * The five Pages, defined exactly once as a single ordered array so the
 * Navigation_Menu and Footer stay in lock-step and always contain exactly five
 * links, one per Page (Req 1.1, 1.3, 1.8).
 *
 * @type {ReadonlyArray<{ key: PageKey, href: string, label: string }>}
 */
export const PAGES = [
  { key: 'home', href: 'index.html', label: 'Home' },
  { key: 'about', href: 'about.html', label: 'About' },
  { key: 'services', href: 'services.html', label: 'Services' },
  { key: 'portfolio', href: 'portfolio.html', label: 'Portfolio' },
  { key: 'contact', href: 'contact.html', label: 'Contact' },
];

/**
 * No-JavaScript fallback navigation (Req 12.5).
 *
 * A plain `<noscript>` list of the five page links, derived from the single
 * `PAGES` definition so it can never drift from the JS-rendered Navigation_Menu.
 * Each Page embeds this identical block inside BOTH its `site-nav` and
 * `site-footer` landmarks (see the landmark pattern documented at the top of
 * this file). When JavaScript runs, `mountSharedComponents` overwrites the
 * landmark's inner HTML and the `<noscript>` content is ignored by the browser;
 * when JavaScript is disabled or fails to load, the browser renders these links
 * so navigation still works.
 *
 * Exported as a constant so task 10 can embed the exact same markup in every
 * page rather than hand-writing (and risking divergence of) five copies.
 *
 * @type {string}
 */
export const NOSCRIPT_FALLBACK =
  `<noscript><ul class="noscript-nav">` +
  PAGES.map(
    (page) =>
      `<li><a href="${escapeHtml(page.href)}">${escapeHtml(page.label)}</a></li>`
  ).join('') +
  `</ul></noscript>`;

/** The business name, declared once (Req 1.8, 2.4). */
const BUSINESS_NAME = 'Pixel & Growth';

/** The brand tagline, declared once (Req 1.8). */
const TAGLINE = 'Build. Connect. Grow.';

/**
 * Render the shared Navigation_Menu from the single page definition.
 *
 * Produces:
 *  - The horizontal Logo (icon on the LEFT via <img>, business name on the
 *    RIGHT) linking to the Home Page (Req 1.9, 1.10, 2.4).
 *  - A collapsible mobile toggle button carrying `aria-expanded="false"` and
 *    `aria-controls="nav-links"` for the mobile Breakpoint (Req 8.2). The
 *    click wiring itself is task 12.1; only the structure is provided here.
 *  - A `<ul id="nav-links">` with exactly five links, one per Page (Req 1.3),
 *    using the descriptive page labels as link text (Req 10.4).
 *
 * Exactly one link — the one whose key matches `currentPageKey` — receives the
 * `is-active` class and `aria-current="page"`; no other link does (Req 1.6).
 * If `currentPageKey` matches no Page, no link is marked active (a defensive,
 * well-defined fallback rather than an error).
 *
 * This function is pure: it returns an HTML string and does not touch the DOM.
 *
 * @param {PageKey | string} currentPageKey  Key of the Page currently displayed.
 * @returns {string}  HTML string for the navigation markup.
 */
export function renderNav(currentPageKey) {
  const links = PAGES.map((page) => {
    const isActive = page.key === currentPageKey;
    const classAttr = isActive ? ' class="nav-link is-active"' : ' class="nav-link"';
    const currentAttr = isActive ? ' aria-current="page"' : '';
    return (
      `<li class="nav-item">` +
      `<a${classAttr}${currentAttr} href="${escapeHtml(page.href)}">${escapeHtml(page.label)}</a>` +
      `</li>`
    );
  }).join('');

  return (
    `<nav class="site-nav" aria-label="Primary">` +
    // Horizontal logo: icon left, business name right (Req 2.4), links Home (Req 1.10).
    // The icon is DECORATIVE (alt="") because the business name is already
    // rendered as adjacent visible text in the <span>; giving the icon the same
    // alt would duplicate that text for assistive tech (Req 9.1).
    `<a class="site-nav__logo" href="index.html" aria-label="${escapeHtml(BUSINESS_NAME)} home">` +
    `<img class="site-nav__logo-icon" src="assets/logo/pixel-growth-logo.svg" alt="" width="32" height="32">` +
    `<span class="site-nav__logo-name">${escapeHtml(BUSINESS_NAME)}</span>` +
    `</a>` +
    // Mobile collapsible toggle (Req 8.2). Wiring is task 12.1.
    `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links">` +
    `<span class="nav-toggle__label">Menu</span>` +
    `</button>` +
    // Exactly five links, one per Page (Req 1.3).
    `<ul id="nav-links" class="nav-links">${links}</ul>` +
    `</nav>`
  );
}

/**
 * Render the shared Footer from the single page definition.
 *
 * Contains the business name "Pixel & Growth", the tagline "Build. Connect.
 * Grow.", and links to all five Pages (Req 1.8). Pure: returns an HTML string.
 *
 * @returns {string}  HTML string for the footer markup.
 */
export function renderFooter() {
  const links = PAGES.map(
    (page) =>
      `<li class="footer-item">` +
      `<a class="footer-link" href="${escapeHtml(page.href)}">${escapeHtml(page.label)}</a>` +
      `</li>`
  ).join('');

  return (
    `<div class="site-footer__inner">` +
    `<p class="site-footer__brand">${escapeHtml(BUSINESS_NAME)}</p>` +
    `<p class="site-footer__tagline">${escapeHtml(TAGLINE)}</p>` +
    `<nav class="site-footer__nav" aria-label="Footer">` +
    `<ul class="footer-links">${links}</ul>` +
    `</nav>` +
    `</div>`
  );
}

/**
 * Wire the mobile Navigation_Menu toggle (task 12.1, Req 8.2).
 *
 * After the nav markup is injected, this attaches a click handler to the
 * `.nav-toggle` button that:
 *   - flips the button's `aria-expanded` between "false" and "true"; and
 *   - toggles the `is-open` class on the controlled `<ul class="nav-links">`
 *     so the mobile-breakpoint CSS shows/hides the links.
 *
 * The toggle button is only visible below the tablet Breakpoint (the CSS hides
 * it at >=768px), so on larger viewports this handler is effectively inert even
 * though it stays attached.
 *
 * Fully defensive (Req 12.5): if the host, the toggle, or the link list is
 * absent it is a no-op and never throws, so wiring can never break a page whose
 * nav injected only partially. The link list is resolved via the toggle's
 * `aria-controls` id first, falling back to a `.nav-links` lookup within the
 * host.
 *
 * @param {Element | null} host  The landmark the nav was injected into.
 * @returns {void}
 */
export function wireNavToggle(host) {
  if (!host || typeof host.querySelector !== 'function') {
    return;
  }

  const toggle = host.querySelector('.nav-toggle');
  if (!toggle) {
    return;
  }

  // Prefer the element referenced by aria-controls; fall back to .nav-links.
  const controlsId = toggle.getAttribute('aria-controls');
  const ownerDoc = host.ownerDocument || (typeof document !== 'undefined' ? document : null);
  const links =
    (controlsId && ownerDoc && ownerDoc.getElementById(controlsId)) ||
    host.querySelector('.nav-links');
  if (!links) {
    return;
  }

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

/**
 * Build the visible "shared element unavailable" notice for a landmark (Req 12.5).
 *
 * Shown in place of a Reusable_Component when its injection fails, so the
 * failure is visible to the Visitor rather than silent, while the rest of the
 * page keeps rendering.
 *
 * @param {string} label  Human-readable name of the unavailable element (e.g. "Navigation").
 * @returns {string}  HTML string for the failure notice.
 */
export function renderUnavailableNotice(label) {
  return `<p class="shared-unavailable" role="status">${escapeHtml(label)} is temporarily unavailable.</p>`;
}

/**
 * Safely inject a single shared component into its host landmark (Req 12.5).
 *
 * Runs `render()` and writes the result into `host`. If the host is missing,
 * nothing is injected (the page's primary content is untouched). If `render()`
 * throws, the host is filled with a visible "unavailable" notice instead of the
 * error propagating — so one broken Reusable_Component can never take down the
 * whole page. The browser's own `<noscript>` fallback covers the JS-off case.
 *
 * @param {Element | null} host    The landmark element to fill, or null if absent.
 * @param {() => string} render    Produces the component markup; may throw.
 * @param {string} label           Human-readable element name for the failure notice.
 * @returns {boolean}  true if the component rendered successfully, false otherwise.
 */
function injectShared(host, render, label) {
  if (!host) {
    return false;
  }
  try {
    host.innerHTML = render();
    return true;
  } catch (err) {
    // Degrade gracefully: surface a visible notice, keep the page alive.
    try {
      host.innerHTML = renderUnavailableNotice(label);
    } catch {
      // Even writing the notice failed (detached/foreign node); swallow so the
      // rest of the mount can still proceed.
    }
    return false;
  }
}

/**
 * Inject the shared nav and footer into their landmarks.
 *
 * Reads the current Page key from `body[data-page]`, then fills the empty
 * `header[data-component="site-nav"]` with `renderNav(key)` and the empty
 * `footer[data-component="site-footer"]` with `renderFooter()` (Req 12.2, 12.3).
 *
 * This is the only DOM-touching function in the module; keeping it separate
 * from the pure renderers keeps those testable. Each injection is isolated in a
 * try/catch (see `injectShared`): if a Reusable_Component fails to render, the
 * host shows a visible "unavailable" notice and the rest of the page — plus the
 * other landmark — still renders (Req 12.5). The `<noscript>` fallback embedded
 * in each landmark (see `NOSCRIPT_FALLBACK`) covers the no-JavaScript case.
 *
 * @param {Document} [doc=document]  The document to mount into (injectable for tests).
 * @returns {void}
 */
export function mountSharedComponents(doc = typeof document !== 'undefined' ? document : undefined) {
  if (!doc || !doc.body) {
    return;
  }

  const currentPageKey = doc.body.getAttribute('data-page') || '';

  const navHost = doc.querySelector('header[data-component="site-nav"]');
  const navMounted = injectShared(navHost, () => renderNav(currentPageKey), 'Navigation');
  // Wire the mobile toggle only once the nav markup is actually in place
  // (task 12.1). wireNavToggle is itself defensive, so this is safe either way.
  if (navMounted) {
    wireNavToggle(navHost);
  }

  const footerHost = doc.querySelector('footer[data-component="site-footer"]');
  injectShared(footerHost, () => renderFooter(), 'Footer');
}

// Auto-run in a browser environment only. The guard keeps `renderNav` and
// `renderFooter` importable as pure functions in a non-DOM test context without
// triggering a mount.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountSharedComponents());
  } else {
    // DOM already parsed (e.g. module loaded with defer after parse): mount now.
    mountSharedComponents();
  }
}
