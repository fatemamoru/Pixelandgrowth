// tests/portfolio-order.property.test.js
//
// Property 6: Portfolio rendering omits invalid projects and preserves valid ones in order
// Tag: Feature: pixel-growth-website, Property 6: Portfolio rendering omits invalid projects and preserves valid ones in order
//
// For any list mixing valid Demonstration_Project records (non-empty title AND
// description) with invalid ones (missing/empty title or description),
// renderPortfolioList(projects):
//   - renders ONLY the valid projects (invalid ones are omitted), and
//   - preserves the valid projects' original relative order.
// Order is verified by giving every valid project a unique, index-tagged title,
// locating each escaped title in the rendered output, and asserting the found
// indices are strictly increasing. Invalid projects' content must not appear.
// When no project is valid, the output must equal the empty-state message
// markup ('Sample projects coming soon.').
//
// Validates: Requirements 6.7

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import {
  renderPortfolioList,
  escapeHtml,
  PORTFOLIO_EMPTY_MESSAGE,
} from '../js/render.js';

// A safe character set for generating text. HTML-special characters are handled
// by escaping: assertions use escapeHtml() on expected substrings.
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

// Non-empty-after-trim text (what the renderer treats as a present field).
const nonEmptyText = (min, max) => boundedString(min, max).filter((s) => s.trim().length > 0);

// Whitespace-only (or empty) text — the renderer treats this as a MISSING field
// and omits the card. Covers '' and runs of spaces.
const whitespaceOnly = fc
  .array(fc.constantFrom(' '), { minLength: 0, maxLength: 6 })
  .map((chars) => chars.join(''));

// A VALID project body (before we stamp a unique, index-tagged title on it).
const validBody = fc.record({
  title: nonEmptyText(1, 60),
  description: nonEmptyText(1, 200),
});

// An INVALID project: at least one of title/description is missing or
// whitespace-only. We cover the distinct failure shapes:
//   - missing title (whitespace-only), valid description
//   - valid title, missing description (whitespace-only)
//   - both missing
//   - title field absent entirely
//   - description field absent entirely
//   - non-object (null)
const invalidProject = fc.oneof(
  fc.record({ title: whitespaceOnly, description: nonEmptyText(1, 50) }),
  fc.record({ title: nonEmptyText(1, 50), description: whitespaceOnly }),
  fc.record({ title: whitespaceOnly, description: whitespaceOnly }),
  fc.record({ description: nonEmptyText(1, 50) }),
  fc.record({ title: nonEmptyText(1, 50) }),
  fc.constant(null),
);

// An entry in the mixed list is tagged so we know whether it should render.
const mixedEntry = fc.oneof(
  validBody.map((body) => ({ kind: 'valid', body })),
  invalidProject.map((project) => ({ kind: 'invalid', project })),
);

describe('Feature: pixel-growth-website, Property 6: Portfolio rendering omits invalid projects and preserves valid ones in order', () => {
  it('renders only valid projects, in original relative order, omitting invalid ones', () => {
    fc.assert(
      fc.property(fc.array(mixedEntry, { maxLength: 20 }), (entries) => {
        // Build the actual input list. Valid entries get a UNIQUE, index-tagged
        // title so each one is individually locatable in the output and order
        // can be verified unambiguously.
        const projects = entries.map((entry, i) => {
          if (entry.kind === 'valid') {
            return {
              id: `p${i}`,
              title: `Project#${i}:${entry.body.title}`,
              description: entry.body.description,
            };
          }
          return entry.project;
        });

        // The valid projects, in their original relative order.
        const validProjects = [];
        entries.forEach((entry, i) => {
          if (entry.kind === 'valid') {
            validProjects.push({
              title: `Project#${i}:${entry.body.title}`,
              description: entry.body.description,
            });
          }
        });

        const html = renderPortfolioList(projects);

        if (validProjects.length === 0) {
          // No valid projects -> the empty-state message markup.
          expect(html).toBe(
            `<p class="portfolio-empty">${escapeHtml(PORTFOLIO_EMPTY_MESSAGE)}</p>`,
          );
          return;
        }

        // Each valid project's (escaped, unique) title appears, and the indices
        // at which they appear are strictly increasing -> relative order kept.
        let previousIndex = -1;
        for (const project of validProjects) {
          const needle = escapeHtml(project.title);
          const foundIndex = html.indexOf(needle);
          expect(
            foundIndex,
            `expected valid title to be present: ${project.title}`,
          ).toBeGreaterThan(-1);
          expect(
            foundIndex,
            'expected valid titles to render in original relative order',
          ).toBeGreaterThan(previousIndex);
          previousIndex = foundIndex;
        }

        // Exactly the valid projects render: card count equals valid count.
        const cardCount = (html.match(/<article class="portfolio-card">/g) || []).length;
        expect(cardCount).toBe(validProjects.length);
      }),
      { numRuns: 100 },
    );
  });
});
