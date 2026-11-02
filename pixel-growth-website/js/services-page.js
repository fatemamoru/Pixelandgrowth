// js/services-page.js
// Services Page renderer (Req 5.1, 5.2, 5.3, 5.5).
//
// Renders all five Service entries into the page's #services-list container
// using the single reusable `renderServiceCard` component (Req 5.1, 5.2, 5.3).
//
// GRACEFUL DEGRADATION (Req 5.5): rendering is isolated per entry. If one or
// more Service entries fail to load (renderServiceCard returns null, or throws
// for any single entry), the page still displays every successfully loaded
// Service card AND appends a VISIBLE "one or more services are unavailable"
// notice, while keeping the page layout intact. A single bad entry can never
// blank the whole list.
//
// The CTA linking to the Contact Page (Req 5.4) lives directly in services.html
// so it survives even if this module fails to load.

import { SERVICES } from './data/services.js';
import { renderServiceCard } from './render.js';

/** Id of the container the Service cards are rendered into. */
export const SERVICES_LIST_ID = 'services-list';

/**
 * Visible message shown when one or more Service entries fail to load (Req 5.5).
 * Rendered as a `role="status"` notice so it is announced to assistive tech and
 * stays visible alongside the cards that did load.
 *
 * @type {string}
 */
export const SERVICES_UNAVAILABLE_MESSAGE =
  'One or more services are currently unavailable.';

/**
 * Build the markup for the Services list from a set of Service entries.
 *
 * Pure (data in, markup out) so it can be unit-tested without the DOM. Each
 * entry is rendered via the reusable `renderServiceCard`. Rendering is isolated
 * per entry: a card that returns `null` or throws is counted as a failure and
 * skipped, and the remaining valid cards are still produced in order.
 *
 * When at least one entry fails (or the input is not the expected non-empty
 * list), a visible "one or more services are unavailable" notice is appended
 * after the loaded cards so the layout is retained (Req 5.5).
 *
 * @param {ReadonlyArray<object>} services  The Service entries to render.
 * @returns {string}  Concatenated card markup, plus the unavailable notice when needed.
 */
export function buildServicesMarkup(services) {
  const list = Array.isArray(services) ? services : [];

  let failed = list.length === 0; // nothing to show is itself a degraded state
  const cards = [];

  for (const service of list) {
    let card = null;
    try {
      card = renderServiceCard(service);
    } catch {
      card = null;
    }
    if (card === null) {
      failed = true;
    } else {
      cards.push(card);
    }
  }

  let markup = cards.join('');

  if (failed) {
    markup +=
      `<p class="services-unavailable" role="status">` +
      SERVICES_UNAVAILABLE_MESSAGE +
      `</p>`;
  }

  return markup;
}

/**
 * Render the Service cards into the page's #services-list container.
 *
 * The only DOM-touching function in the module; kept separate from
 * `buildServicesMarkup` so the markup logic stays testable. If the container is
 * missing, nothing happens (the page's primary content and CTA are untouched).
 *
 * @param {Document} [doc=document]  Document to render into (injectable for tests).
 * @returns {void}
 */
export function renderServicesPage(doc = typeof document !== 'undefined' ? document : undefined) {
  if (!doc) {
    return;
  }
  const container = doc.getElementById(SERVICES_LIST_ID);
  if (!container) {
    return;
  }
  container.innerHTML = buildServicesMarkup(SERVICES);
}

// Auto-run in a browser environment only. The guard keeps the pure
// `buildServicesMarkup` export importable in a non-DOM test context without
// triggering a render.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderServicesPage());
  } else {
    // DOM already parsed (module loaded with defer after parse): render now.
    renderServicesPage();
  }
}
