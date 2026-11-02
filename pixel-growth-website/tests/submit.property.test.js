// tests/submit.property.test.js
//
// Property 4: Valid submission with no connected handler yields a non-delivery placeholder
// Tag: Feature: pixel-growth-website, Property 4: Valid submission with no connected handler yields a non-delivery placeholder
//
// For all valid ContactSubmission records, buildSubmitResult(submission) returns
// the "not yet connected" placeholder confirmation. The result must explicitly
// state the message was NOT sent and must never claim delivery (Req 7.6).
//
// Validates: Requirements 7.6

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { buildSubmitResult } from '../js/validation.js';

// Generator for a valid ContactSubmission record. The exact field contents are
// irrelevant to the placeholder result (the handler is not wired), so we vary
// them broadly to confirm the result is independent of the input.
const contactSubmissionArb = fc.record({
  name: fc.string(),
  email: fc.string(),
  businessName: fc.string(),
  serviceOfInterest: fc.string(),
  message: fc.string(),
});

describe('Feature: pixel-growth-website, Property 4: Valid submission with no connected handler yields a non-delivery placeholder', () => {
  it('returns the non-delivery placeholder and never claims the message was sent', () => {
    fc.assert(
      fc.property(contactSubmissionArb, (submission) => {
        const result = buildSubmitResult(submission);

        // The status must mark the form as not yet connected.
        expect(result.status).toBe('not-connected');

        // The confirmation message must be a non-empty string.
        expect(typeof result.message).toBe('string');
        expect(result.message.trim().length).toBeGreaterThan(0);

        const lower = result.message.toLowerCase();

        // It must NOT claim the message was delivered/sent successfully.
        expect(lower).not.toContain('has been sent');

        // It must explicitly state non-delivery — either that the message has
        // NOT been sent or that the form is not yet connected.
        const disclaimsDelivery =
          lower.includes('not been sent') || lower.includes('not yet connected');
        expect(
          disclaimsDelivery,
          `placeholder message must disclaim delivery, got: "${result.message}"`,
        ).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
