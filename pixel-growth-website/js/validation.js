// js/validation.js
// Pure validation functions for the Contact_Form (Req 7.3, 7.4, 7.5, 7.6).
// These functions are side-effect free ("data in, result out") so they can be
// unit- and property-tested in isolation. They do NOT touch the DOM.

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid  True when the value passes validation.
 * @property {string} [field]    The field the failure refers to (present only on failure).
 * @property {string} [message]  Human-readable, field-specific failure message (present only on failure).
 */

/**
 * @typedef {Object} ContactSubmission
 * @property {string} name
 * @property {string} email
 * @property {string} businessName
 * @property {string} serviceOfInterest
 * @property {string} message
 */

/**
 * @typedef {Object} SubmitResult
 * @property {'not-connected'} status  Always 'not-connected' — no handler is wired yet.
 * @property {string} message          Placeholder confirmation; never claims the message was sent.
 */

// Standard, pragmatic email format: a non-empty local part, an "@", a domain
// label, a dot, and a TLD of at least two letters, with no whitespace anywhere.
// Kept intentionally simple and readable rather than fully RFC 5322 exhaustive.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validate that a required text field has a non-empty value after trimming.
 * Whitespace-only input (including the empty string) is treated as missing.
 *
 * @param {string} fieldName  The name of the field being validated (e.g. 'name', 'message').
 * @param {string} value      The raw value entered by the visitor.
 * @returns {ValidationResult}  {valid:true} or a field-specific required failure.
 */
export function validateRequired(fieldName, value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  if (trimmed.length === 0) {
    return {
      valid: false,
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }
  return { valid: true };
}

/**
 * Validate that a value is a well-formed email address.
 * Malformed values (including empty/whitespace-only) are rejected.
 *
 * @param {string} value  The raw email value entered by the visitor.
 * @returns {ValidationResult}  {valid:true} or an invalid-email failure on the 'email' field.
 */
export function validateEmail(value) {
  const candidate = typeof value === 'string' ? value.trim() : '';
  if (!EMAIL_PATTERN.test(candidate)) {
    return {
      valid: false,
      field: 'email',
      message: 'email is invalid',
    };
  }
  return { valid: true };
}

/**
 * Build the submit result for a (valid) contact submission.
 *
 * No submission handler has been connected and tested, so this always returns a
 * placeholder confirmation that explicitly states the form is a demonstration and
 * the message has NOT been sent. It must never claim delivery (Req 7.6).
 *
 * @param {ContactSubmission} [submission]  The validated submission (unused; kept for a stable interface).
 * @returns {SubmitResult}  The "not yet connected" placeholder result.
 */
export function buildSubmitResult(submission) {
  return {
    status: 'not-connected',
    message:
      'Thanks — this form is a demonstration and is not yet connected, so your message has not been sent.',
  };
}
