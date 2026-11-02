// js/contact.js
// Contact Page wiring (Req 7.1–7.6, 9.2, 9.3).
//
// This module performs CLIENT-SIDE VALIDATION ONLY. It is explicitly NOT a
// working submission pipeline: on a fully valid submit it shows a placeholder
// confirmation that states the form is a demonstration and the message has NOT
// been sent (Req 7.6). It never claims delivery.
//
// Validation uses the pure functions in js/validation.js so the rules stay
// testable in isolation:
//   - name     required          (validateRequired)   Req 7.3
//   - message  required          (validateRequired)   Req 7.4
//   - email    standard format   (validateEmail)      Req 7.5
//
// The "service of interest" <select> is populated from SERVICES (single source
// of truth) so the five options always match the Services data (Req 7.2).

import {
  validateRequired,
  validateEmail,
  buildSubmitResult,
} from './validation.js';
import { SERVICES } from './data/services.js';

/** Id of the Contact_Form element in contact.html. */
export const CONTACT_FORM_ID = 'contact-form';

/** Id of the <select> populated with the five Services. */
export const SERVICE_SELECT_ID = 'serviceOfInterest';

/**
 * The fields validated on submit, each mapped to the id of its control, the id
 * of its inline error container (<p class="field-error">), and the validator
 * that produces a {@link ValidationResult} for its value.
 *
 * Only name, message, and email are validated (Req 7.3, 7.4, 7.5). businessName
 * is optional and serviceOfInterest defaults to a valid selection, so neither
 * blocks submission.
 *
 * @type {ReadonlyArray<{ id: string, errorId: string, validate: (value: string) => { valid: boolean, message?: string } }>}
 */
export const VALIDATED_FIELDS = [
  { id: 'name', errorId: 'name-error', validate: (v) => validateRequired('name', v) },
  { id: 'email', errorId: 'email-error', validate: (v) => validateEmail(v) },
  { id: 'message', errorId: 'message-error', validate: (v) => validateRequired('message', v) },
];

/**
 * Build the <option> markup for the service-of-interest <select> from the five
 * Services (Req 7.2). Pure (data in, markup out) so it is unit-testable. The
 * leading placeholder option keeps "Select a service" as the default.
 *
 * @param {ReadonlyArray<{ id: string, title: string }>} [services=SERVICES]
 * @returns {string}  Concatenated <option> markup, placeholder first.
 */
export function buildServiceOptions(services = SERVICES) {
  const list = Array.isArray(services) ? services : [];
  const options = ['<option value="">Select a service</option>'];
  for (const service of list) {
    if (!service || typeof service.id !== 'string' || typeof service.title !== 'string') {
      continue;
    }
    const id = escapeHtml(service.id);
    const title = escapeHtml(service.title);
    options.push(`<option value="${id}">${title}</option>`);
  }
  return options.join('');
}

/**
 * Minimal HTML-attribute/text escaping so Service data can never inject markup.
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
 * Populate the service-of-interest <select> with the five Service options
 * (Req 7.2). No-op if the element is absent.
 *
 * @param {Document} doc
 * @returns {void}
 */
export function populateServiceSelect(doc) {
  const select = doc.getElementById(SERVICE_SELECT_ID);
  if (!select) {
    return;
  }
  select.innerHTML = buildServiceOptions(SERVICES);
}

/**
 * Validate every tracked field and reflect the outcome in the DOM: write each
 * field's inline, field-specific message into its error container and toggle the
 * control's `aria-invalid` (Req 7.3, 7.4, 7.5, 9.2). Pure w.r.t. logic but it
 * updates the DOM it is given; returns whether the whole form is valid.
 *
 * @param {Document} doc
 * @returns {boolean}  True when all validated fields pass.
 */
export function validateForm(doc) {
  let allValid = true;

  for (const field of VALIDATED_FIELDS) {
    const control = doc.getElementById(field.id);
    const errorBox = doc.getElementById(field.errorId);
    const value = control && 'value' in control ? control.value : '';
    const result = field.validate(value);

    if (result.valid) {
      if (errorBox) errorBox.textContent = '';
      if (control) control.setAttribute('aria-invalid', 'false');
    } else {
      allValid = false;
      if (errorBox) errorBox.textContent = result.message ?? `${field.id} is invalid`;
      if (control) control.setAttribute('aria-invalid', 'true');
    }
  }

  return allValid;
}

/**
 * Read the current Contact_Form values into a ContactSubmission-shaped object.
 *
 * @param {Document} doc
 * @returns {{ name: string, email: string, businessName: string, serviceOfInterest: string, message: string }}
 */
export function readSubmission(doc) {
  const read = (id) => {
    const el = doc.getElementById(id);
    return el && 'value' in el ? el.value : '';
  };
  return {
    name: read('name'),
    email: read('email'),
    businessName: read('businessName'),
    serviceOfInterest: read(SERVICE_SELECT_ID),
    message: read('message'),
  };
}

/**
 * Handle a Contact_Form submit: prevent the default navigation, run validation,
 * and on success show the "not yet connected" placeholder confirmation in
 * `.form-result` (Req 7.6). On failure the inline field messages remain and the
 * result area is cleared so no confirmation is shown.
 *
 * @param {Event} event
 * @param {Document} doc
 * @returns {void}
 */
export function handleSubmit(event, doc) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  const resultBox = doc.querySelector('.form-result');
  const isValid = validateForm(doc);

  if (!isValid) {
    if (resultBox) resultBox.textContent = '';
    // Move focus to the first invalid control for keyboard users (Req 9.5).
    const firstInvalid = VALIDATED_FIELDS
      .map((field) => doc.getElementById(field.id))
      .find((el) => el && el.getAttribute('aria-invalid') === 'true');
    if (firstInvalid && typeof firstInvalid.focus === 'function') {
      firstInvalid.focus();
    }
    return;
  }

  const submission = readSubmission(doc);
  const result = buildSubmitResult(submission);
  if (resultBox) {
    resultBox.textContent = result.message;
  }
}

/**
 * Wire the Contact Page: populate the service <select> and attach the submit
 * handler. The only DOM-touching entry point; kept separate from the pure
 * helpers above so the logic stays testable. No-op when the form is absent.
 *
 * @param {Document} [doc=document]  Document to operate on (injectable for tests).
 * @returns {void}
 */
export function initContactPage(doc = typeof document !== 'undefined' ? document : undefined) {
  if (!doc) {
    return;
  }
  const form = doc.getElementById(CONTACT_FORM_ID);
  if (!form) {
    return;
  }
  populateServiceSelect(doc);
  form.addEventListener('submit', (event) => handleSubmit(event, doc));
}

// Auto-run in a browser environment only. The guard keeps the pure helpers
// importable in a non-DOM test context without triggering DOM work.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initContactPage());
  } else {
    // DOM already parsed (module loaded with defer after parse): init now.
    initContactPage();
  }
}
