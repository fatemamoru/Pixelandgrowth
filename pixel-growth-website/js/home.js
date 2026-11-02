// js/home.js
// Home Page module: fills the services-overview container with the five Service
// cards (Req 3.3) from the single SERVICES source, each linking to the Services
// page (Req 3.4). Loaded as a deferred ES module from index.html.
//
// Rendering stays "data in, markup out": this module imports the pure
// `renderServiceCard` helper and the `SERVICES` dataset, builds the markup, and
// injects it into the `#services-overview` container's card grid on load.
//
// GRACEFUL DEGRADATION (consistent with components.js, Req 12.5): the injection
// is wrapped in try/catch. If the container is missing or rendering throws, the
// page keeps its primary content and a visible notice is shown in place of the
// overview rather than the error propagating. Invalid service entries are
// skipped by `renderServiceCard` (it returns null), so a single bad entry can
// never blank the whole overview.

import { SERVICES } from './data/services.js';
import { renderServiceCard, escapeHtml } from './render.js';

/** Destination page every service card links to (Req 3.4). */
const SERVICES_HREF = 'services.html';

/**
 * Build the Home services-overview markup from the SERVICES dataset.
 *
 * Each valid Service is rendered via the shared `renderServiceCard` helper and
 * wrapped in a link to the Services page so selecting any Service navigates
 * there (Req 3.4). Invalid entries (null from the renderer) are skipped so the
 * overview degrades gracefully rather than breaking.
 *
 * Pure: returns an HTML string and does not touch the DOM.
 *
 * @param {ReadonlyArray<{ id?: string, title: string, description: string }>} services
 * @returns {string}  Concatenated linked service-card markup.
 */
export function renderHomeServiceCards(services) {
  const list = Array.isArray(services) ? services : [];

  return list
    .map((service) => {
      const card = renderServiceCard(service);
      if (card === null) {
        return '';
      }
      const label = escapeHtml(
        service && typeof service.title === 'string' ? service.title : 'service'
      );
      // Wrap each card in a link to the Services page (Req 3.4). The visually
      // hidden suffix keeps the link text descriptive for assistive tech
      // (Req 10.4) without changing the card's visible content.
      return (
        `<a class="service-card-link" href="${SERVICES_HREF}" ` +
        `aria-label="${label} — view all services">${card}</a>`
      );
    })
    .join('');
}

/**
 * Inject the service cards into the Home services-overview container.
 *
 * Reads the `#services-overview` host, fills its `[data-service-cards]` grid
 * (falling back to the host itself) with the rendered cards. Degrades
 * gracefully on any failure (Req 12.5): a visible notice replaces the grid and
 * the rest of the page is untouched.
 *
 * @param {Document} [doc=document]  Document to mount into (injectable for tests).
 * @returns {void}
 */
export function mountHomeServices(doc = typeof document !== 'undefined' ? document : undefined) {
  if (!doc) {
    return;
  }

  const host = doc.getElementById('services-overview');
  if (!host) {
    return;
  }

  const grid = host.querySelector('[data-service-cards]') || host;

  try {
    grid.innerHTML = renderHomeServiceCards(SERVICES);
  } catch (err) {
    try {
      grid.innerHTML =
        '<p class="shared-unavailable" role="status">Services overview is temporarily unavailable.</p>';
    } catch {
      // Even writing the notice failed; swallow so the rest of the page lives.
    }
  }
}

// Auto-run in a browser environment only, so the pure render helper above stays
// importable in a non-DOM test context without triggering a mount.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => mountHomeServices());
  } else {
    mountHomeServices();
  }
}
