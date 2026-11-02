// tests/seo-checker.property.test.js
//
// Property 12: SEO checker identifies missing title or description
// Tag: Feature: pixel-growth-website, Property 12: SEO checker identifies missing title or description
//
// For any page key and a metadata record where the title and/or the
// description element is omitted (undefined or empty/whitespace-only),
// checkSeo(page, metadata) SHALL fail the SEO validation check and report an
// issue that identifies BOTH the page and the specific missing element
// (reason === 'missing'). At least one element is always omitted here, so a
// failure is always expected.
//
// Validates: Requirements 10.5

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { checkSeo } from '../js/seo.js';

// A realistic page key for the site. The checker treats the page as an opaque
// label, so we sample the five real keys plus some arbitrary non-empty strings.
const pageKeyArb = fc.oneof(
  fc.constantFrom('home', 'about', 'services', 'portfolio', 'contact'),
  fc
    .array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz-'.split('')), {
      minLength: 1,
      maxLength: 12,
    })
    .map((chars) => chars.join('')),
);

// A "present" element value: a plausible non-empty string. We deliberately keep
// it within valid length bounds so a present element does NOT register a
// missing issue (titles 10-60, descriptions 50-160). We pad to be safe and
// trim in the model below only for the "omitted" decision.
const presentTitleArb = fc
  .array(fc.constantFrom(...'abcdefghij klmnop'.split('')), {
    minLength: 10,
    maxLength: 60,
  })
  .map((chars) => chars.join('').padEnd(10, 'x').slice(0, 60));

const presentDescriptionArb = fc
  .array(fc.constantFrom(...'abcdefghij klmnop'.split('')), {
    minLength: 50,
    maxLength: 160,
  })
  .map((chars) => chars.join('').padEnd(50, 'x').slice(0, 160));

// An "omitted" element value: undefined, empty string, or whitespace-only.
const omittedValueArb = fc.oneof(
  fc.constant(undefined),
  fc.constant(''),
  fc
    .array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 8 })
    .map((chars) => chars.join('')),
);

// Decide which elements are omitted. At least one must be omitted so a failure
// is always expected. Combinations: omit title only, description only, or both.
const omissionArb = fc.constantFrom(
  { omitTitle: true, omitDescription: false },
  { omitTitle: false, omitDescription: true },
  { omitTitle: true, omitDescription: true },
);

describe('Feature: pixel-growth-website, Property 12: SEO checker identifies missing title or description', () => {
  it('reports a missing-element issue naming the page and each omitted element', () => {
    fc.assert(
      fc.property(
        pageKeyArb,
        omissionArb,
        presentTitleArb,
        presentDescriptionArb,
        omittedValueArb,
        omittedValueArb,
        (page, omission, presentTitle, presentDescription, omitTitleVal, omitDescVal) => {
          const metadata = {
            title: omission.omitTitle ? omitTitleVal : presentTitle,
            description: omission.omitDescription ? omitDescVal : presentDescription,
          };

          const result = checkSeo(page, metadata);

          // The check must fail overall and name the page.
          expect(
            result.valid,
            `expected checkSeo to fail for page "${page}" with omission ${JSON.stringify(omission)}`,
          ).toBe(false);
          expect(result.page).toBe(String(page));

          if (omission.omitTitle) {
            const titleIssue = result.issues.find(
              (issue) => issue.element === 'title' && issue.reason === 'missing',
            );
            expect(
              titleIssue,
              `expected a missing-title issue for page "${page}", got ${JSON.stringify(result.issues)}`,
            ).toBeDefined();
            expect(titleIssue.page).toBe(String(page));
          }

          if (omission.omitDescription) {
            const descIssue = result.issues.find(
              (issue) => issue.element === 'description' && issue.reason === 'missing',
            );
            expect(
              descIssue,
              `expected a missing-description issue for page "${page}", got ${JSON.stringify(result.issues)}`,
            ).toBeDefined();
            expect(descIssue.page).toBe(String(page));
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
