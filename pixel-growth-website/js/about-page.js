// js/about-page.js
// Per-section failure handling for the About Page (Req 4.6).
//
// The About Page content is static HTML (intro, mission, values, approach), so
// there is no data fetch to fail. What this module guarantees is resilience: if
// any one section is missing from the DOM or renders empty (for example because
// a content block was removed, failed to parse, or was stripped by an
// extension), the remaining sections MUST still render and the broken section
// MUST show a VISIBLE "section unavailable" indication rather than silently
// disappearing (Req 4.6).
//
// Each content <section> carries a `data-section="<name>"` attribute. This
// module validates every expected section independently inside its own
// try/catch so one failing section can never take down the others. A section is
// treated as failed when it is absent from the DOM or contains no meaningful
// rendered content (no non-whitespace text). On failure, the section — when it
// exists — has its content replaced by a visible notice; when the element is
// missing entirely, a notice element is inserted into <main> as a placeholder
// so the Visitor still sees that something is unavailable.
//
// The renderers (`renderSectionUnavailableNotice`) and the pure checker
// (`isSectionHealthy`) are exported so they can be unit/property tested without
// a live DOM, mirroring the separation used in components.js.

/**
 * The content sections expected on the About Page, in document order, with the
 * human-readable label used in the failure notice. Keys match the
 * `data-section` attribute values embedded in about.html.
 *
 * @type {ReadonlyArray<{ name: string, label: string }>}
 */
export const ABOUT_SECTIONS = [
  { name: 'intro', label: 'Introduction' },
  { name: 'mission', label: 'Mission' },
  { name: 'values', label: 'Values' },
  { name: 'approach', label: 'Approach' },
];

/**
 * Minimal HTML-escape for text interpolated into a notice string. Kept local so
 * this module has no import-time dependency and stays usable in isolation.
 *
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Build the visible "section unavailable" notice markup for a section (Req 4.6).
 * Uses `role="status"` so assistive technology announces it, mirroring the
 * shared-component notice convention in components.js.
 *
 * @param {string} label  Human-readable section name (e.g. "Values").
 * @returns {string}  HTML string for the notice.
 */
export function renderSectionUnavailableNotice(label) {
  return `<p class="section-unavailable" role="status">The ${escapeHtml(
    label
  )} section is temporarily unavailable.</p>`;
}

/**
 * Pure check: does this element represent a healthy, rendered section?
 *
 * A section is healthy when it exists and contains at least one non-whitespace
 * character of text content. Missing (null) or empty sections are unhealthy and
 * should surface the "unavailable" notice.
 *
 * @param {Element | null | undefined} el
 * @returns {boolean}
 */
export function isSectionHealthy(el) {
  if (!el) {
    return false;
  }
  const text = (el.textContent || '').trim();
  return text.length > 0;
}

/**
 * Validate one section and, if it has failed, surface a visible notice.
 *
 * Wrapped by the caller in a try/catch so a throw while inspecting one section
 * cannot stop the others from being processed.
 *
 * @param {Document} doc
 * @param {{ name: string, label: string }} section
 * @returns {boolean}  true if the section is healthy, false if a notice was shown.
 */
function guardSection(doc, section) {
  const el = doc.querySelector(`[data-section="${section.name}"]`);

  if (isSectionHealthy(el)) {
    return true;
  }

  const noticeHtml = renderSectionUnavailableNotice(section.label);

  if (el) {
    // Section exists but is empty/broken: replace its content with the notice
    // while leaving the surrounding sections intact.
    el.innerHTML = noticeHtml;
  } else {
    // Section is missing entirely: insert a placeholder notice into <main> so
    // the Visitor still sees an indication that content is unavailable.
    const main = doc.querySelector('main');
    if (main) {
      const wrapper = doc.createElement('section');
      wrapper.setAttribute('data-section', section.name);
      wrapper.innerHTML = noticeHtml;
      main.appendChild(wrapper);
    }
  }

  return false;
}

/**
 * Guard every expected About Page section (Req 4.6).
 *
 * Each section is checked in its own try/catch so one failing section can never
 * prevent the others from rendering or being repaired. Returns a small report
 * of which sections were healthy, useful for tests.
 *
 * @param {Document} [doc=document]  Document to inspect (injectable for tests).
 * @returns {{ checked: number, healthy: string[], unavailable: string[] }}
 */
export function guardAboutSections(
  doc = typeof document !== 'undefined' ? document : undefined
) {
  const healthy = [];
  const unavailable = [];

  if (!doc) {
    return { checked: 0, healthy, unavailable };
  }

  for (const section of ABOUT_SECTIONS) {
    try {
      if (guardSection(doc, section)) {
        healthy.push(section.name);
      } else {
        unavailable.push(section.name);
      }
    } catch {
      // Defensive: even the guard for one section failing must not stop the
      // rest. Record it as unavailable and continue.
      unavailable.push(section.name);
    }
  }

  return { checked: ABOUT_SECTIONS.length, healthy, unavailable };
}

// Auto-run in a browser environment only. The guard keeps the exports usable as
// pure functions in a non-DOM test context without triggering a DOM pass.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => guardAboutSections());
  } else {
    guardAboutSections();
  }
}
