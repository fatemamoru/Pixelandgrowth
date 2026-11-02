// tests/email.property.test.js
//
// Property 3: Email validation accepts well-formed emails and rejects malformed ones
// Tag: Feature: pixel-growth-website, Property 3: Email validation accepts well-formed emails and rejects malformed ones
//
// validateEmail(value) (js/validation.js) accepts well-formed email addresses
// and rejects malformed ones. The accepted shape is defined by the pattern
//   /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// i.e. a non-empty local part, "@", a domain label, a dot, and a TLD of at
// least two non-whitespace/non-"@" characters, with no whitespace anywhere.
//
// Two complementary properties are asserted (min 100 iterations each):
//   (1) Well-formed emails are accepted (valid:true).
//   (2) Strings that do NOT match the accepted pattern are rejected
//       (valid:false, field:'email').
//
// Validates: Requirements 7.5

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validateEmail } from '../js/validation.js';

// The exact pattern validateEmail uses, mirrored here so the arbitrary-string
// property can filter out strings that happen to be valid emails. The test
// must NOT weaken validateEmail; this mirror is only used to classify inputs.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// A character set for local/domain parts that contains no whitespace, no "@",
// and no ".", so composed pieces always satisfy the [^\s@] character classes
// and let us control dot placement explicitly.
const SAFE_CHARS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&*+-/=?^_`{|}~'.split('');

/** fast-check arbitrary for a run of safe chars (no whitespace, no "@", no "."). */
const safeRun = (minLength, maxLength) =>
  fc.array(fc.constantFrom(...SAFE_CHARS), { minLength, maxLength }).map((chars) => chars.join(''));

/**
 * Well-formed email generator producing values the accepted pattern recognises:
 * local@domainLabel.tld with a TLD of length >= 2.
 */
const wellFormedEmail = fc
  .tuple(
    safeRun(1, 20), // local part
    safeRun(1, 20), // domain label
    safeRun(2, 10), // TLD (>= 2 chars)
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

describe('Feature: pixel-growth-website, Property 3: Email validation accepts well-formed emails and rejects malformed ones', () => {
  it('accepts well-formed emails (valid:true)', () => {
    fc.assert(
      fc.property(wellFormedEmail, (email) => {
        // Sanity: the generator should always produce pattern-matching emails.
        // If this ever fails, the generator (not validateEmail) is at fault.
        expect(EMAIL_PATTERN.test(email), `generator produced a non-matching email: ${email}`).toBe(true);

        const result = validateEmail(email);
        expect(result.valid, `well-formed email was rejected: ${JSON.stringify(email)}`).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it('rejects malformed (non-pattern) strings with a field-specific email failure', () => {
    fc.assert(
      fc.property(
        // Arbitrary strings, filtered to those that are NOT accepted emails.
        // validateEmail trims first, so classify on the trimmed value to match
        // its behaviour exactly and avoid false "should-reject" expectations.
        fc.string().filter((s) => !EMAIL_PATTERN.test(s.trim())),
        (notAnEmail) => {
          const result = validateEmail(notAnEmail);
          expect(result.valid, `malformed value was accepted: ${JSON.stringify(notAnEmail)}`).toBe(false);
          expect(result.field).toBe('email');
          expect(typeof result.message).toBe('string');
        },
      ),
      { numRuns: 100 },
    );
  });
});
