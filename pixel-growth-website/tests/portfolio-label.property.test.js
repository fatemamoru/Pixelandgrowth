// tests/portfolio-label.property.test.js
//
// Property 7: Every rendered portfolio card carries the demonstration label
// Tag: Feature: pixel-growth-website, Property 7: Every rendered portfolio card carries the demonstration label
//
// For any valid Demonstration_Project record (title 1-80 chars, description
// 1-500 chars, both non-empty and not whitespace-only, with optional image
// metadata), renderPortfolioCard(project) returns markup that:
//   - is non-null (the project is valid, so it must render);
//   - contains the persistent "Sample / Demonstration" label (DEMONSTRATION_LABEL)
//     rendered as a visible, NON-INTERACTIVE <span class="portfolio-card__label">;
//   - does NOT wrap that label in an interactive element (<a> or <button>), so
//     the label conveys information without requiring visitor interaction (Req 6.2).
//
// The label text "Sample / Demonstration" contains no HTML-special characters,
// so its escaped form is identical to the raw text. We still compare against the
// escaped form (via escapeHtml) to stay robust if the label ever changes.
//
// Validates: Requirements 6.2

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import {
  renderPortfolioCard,
  escapeHtml,
  DEMONSTRATION_LABEL,
} from '../js/render.js';

// A safe character set for generating title/description text. Includes letters,
// digits, spaces, and common punctuation (including HTML-special characters,
// which the renderer escapes). The label assertion is independent of this text.
const SAFE_CHARS = [
  ...'abcdefghijklmnopqrstuvwxyz',
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  ...'0123456789',
  ...' .,!?-:&<>"\'',
];

// fast-check v4: do NOT use fc.stringOf. Build a bounded string from an array of
// characters drawn from the safe set, then join.
function boundedString(minLength, maxLength) {
  return fc
    .array(fc.constantFrom(...SAFE_CHARS), { minLength, maxLength })
    .map((chars) => chars.join(''));
}

// A generated field is only a valid Project field if it is non-empty after
// trimming (the renderer rejects whitespace-only input with null). Filter the
// generated strings so the generator always produces renderable input.
// Title: 1-80 chars (Req 6.3); description: 1-500 chars (Req 6.3).
const title = boundedString(1, 80).filter((s) => s.trim().length > 0);
const description = boundedString(1, 500).filter((s) => s.trim().length > 0);

// Optional illustrative image metadata. Each field is optional so the renderer's
// defensive handling of absent image data is exercised too.
const imageMetadata = fc.record(
  {
    webp: fc.webUrl(),
    avif: fc.webUrl(),
    alt: boundedString(0, 120),
    width: fc.integer({ min: 1, max: 4000 }),
    height: fc.integer({ min: 1, max: 4000 }),
  },
  { requiredKeys: [] },
);

const validProject = fc.record(
  {
    id: fc.string(),
    title,
    description,
    image: imageMetadata,
  },
  { requiredKeys: ['title', 'description'] },
);

describe('Feature: pixel-growth-website, Property 7: Every rendered portfolio card carries the demonstration label', () => {
  it('renders a non-interactive span label on every valid portfolio card', () => {
    const escapedLabel = escapeHtml(DEMONSTRATION_LABEL);

    fc.assert(
      fc.property(validProject, (project) => {
        const html = renderPortfolioCard(project);

        // Valid input must produce markup (never null).
        expect(html, 'expected valid project to render non-null markup').not.toBeNull();

        // The demonstration label text is present.
        expect(html).toContain(escapedLabel);

        // The label is rendered inside a <span class="portfolio-card__label">
        // that carries the label text (visible, non-interactive).
        const labelSpan = new RegExp(
          `<span class="portfolio-card__label">${escapeRegExp(escapedLabel)}</span>`,
        );
        expect(html).toMatch(labelSpan);

        // The label must NOT be wrapped in an interactive element: the card
        // markup contains no anchors or buttons at all, so the label cannot be
        // a link or button (Req 6.2 — label without visitor interaction).
        expect(html).not.toMatch(/<a[\s>]/i);
        expect(html).not.toMatch(/<button[\s>]/i);
      }),
      { numRuns: 100 },
    );
  });
});

// Escape a string for safe use inside a RegExp literal.
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
