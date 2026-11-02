// js/portfolio-page.js
// Portfolio page entry point (Req 6.5, 6.6, 6.7).
//
// Takes the single source of truth for Demonstration_Projects
// (js/data/portfolio.js) and renders them into the page's #portfolio-list
// container using the pure renderPortfolioList helper. That helper already:
//   - attaches a persistent "Sample / Demonstration" label to every card,
//   - omits entries missing a title/description rather than throwing, and
//   - shows the "Sample projects coming soon." empty-state message when no
//     valid projects remain (so the layout is retained).
//
// This module only performs the DOM wiring; the rendering logic stays pure and
// testable in js/render.js.

import { PROJECTS } from './data/portfolio.js';
import { renderPortfolioList } from './render.js';

/**
 * Fill the #portfolio-list container with the rendered demonstration cards.
 *
 * Guarded so importing this module in a non-DOM test context (or on a page that
 * lacks the container) is a harmless no-op.
 *
 * @param {Document} [doc=document]  The document to render into (injectable for tests).
 * @returns {void}
 */
export function mountPortfolioList(doc = typeof document !== 'undefined' ? document : undefined) {
  if (!doc) {
    return;
  }

  const list = doc.getElementById('portfolio-list');
  if (!list) {
    return;
  }

  list.innerHTML = renderPortfolioList(PROJECTS);
}

// Auto-run in a browser environment only, mirroring components.js so the list
// renders whether the module loads before or after the DOM is parsed.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountPortfolioList());
  } else {
    mountPortfolioList();
  }
}
