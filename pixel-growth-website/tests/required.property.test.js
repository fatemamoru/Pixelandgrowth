// tests/required.property.test.js
//
// Property 2: Required text fields reject whitespace-only input
// Tag: Feature: pixel-growth-website, Property 2: Required text fields reject whitespace-only input
//
// For the required text fields (name and message), any whitespace-only value
// (including the empty string) is rejected with a field-specific "required"
// failure that identifies the field being validated.
//
// Validates: Requirements 7.3, 7.4

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

import { validateRequired } from '../js/validation.js';

// The required text fields covered by Requirements 7.3 (name) and 7.4 (message).
const REQUIRED_FIELDS = ['name', 'message'];

// Characters that are "whitespace-only" per String.prototype.trim(): spaces,
// tabs, newlines, carriage returns, vertical tabs, form feeds, and a couple of
// Unicode whitespace code points for good measure.
const WHITESPACE_CHARS = [' ', '\t', '\n', '\r', '\v', '\f', '\u00A0', '\u2028', '\u2029'];

// Generator producing whitespace-only strings, including the empty string.
const whitespaceOnlyString = fc
  .array(fc.constantFrom(...WHITESPACE_CHARS), { minLength: 0, maxLength: 20 })
  .map((chars) => chars.join(''));

describe('Feature: pixel-growth-website, Property 2: Required text fields reject whitespace-only input', () => {
  it('rejects empty/whitespace-only input and identifies the specific required field', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...REQUIRED_FIELDS),
        whitespaceOnlyString,
        (fieldName, value) => {
          const result = validateRequired(fieldName, value);

          expect(
            result.valid,
            `expected whitespace-only value ${JSON.stringify(value)} for field "${fieldName}" to be rejected`,
          ).toBe(false);
          expect(result.field).toBe(fieldName);
        },
      ),
      { numRuns: 100 },
    );
  });
});
