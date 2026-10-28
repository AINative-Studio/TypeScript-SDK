/**
 * Parser for the `WWW-Authenticate: Payment ...` header AINative emits on a
 * 402 Payment Required response from an x402-protected endpoint.
 *
 * The REAL header format, as emitted by
 * `app/api/v1/endpoints/x402_subscriptions.py::subscribe_via_x402`
 * (core#9247, MPP discovery convention):
 *
 *   Payment scheme="exact", network="base", asset="USDC", amount="2000", pay_to="0xabc..."
 *
 * i.e. the literal word `Payment` followed by a comma-separated list of
 * `key="value"` pairs. This is NOT full RFC 7235 challenge syntax (no
 * `realm`, no `Payment` registered as an IANA auth-scheme) — it is
 * AINative's own convention, so this parser matches that exact shape
 * rather than a generic WWW-Authenticate grammar.
 */

import type { X402PaymentRequirements } from '../types/x402';

/** The literal auth-scheme word the backend emits. */
const PAYMENT_SCHEME_PREFIX = 'Payment';

/** Matches one `key="value"` pair. Values are always double-quoted by the backend. */
const PARAM_PATTERN = /([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"((?:[^"\\]|\\.)*)"/g;

/**
 * Parse a `WWW-Authenticate: Payment ...` header value into a structured
 * {@link X402PaymentRequirements}-shaped object.
 *
 * Returns `null` when `header` is falsy or does not start with the
 * `Payment` scheme — callers should treat `null` as "not an x402 challenge"
 * rather than throwing, since a 401/other-scheme WWW-Authenticate header on
 * the same route is a normal, non-x402 case.
 *
 * Any individual field missing from the header is simply omitted from the
 * result (left `undefined`) rather than defaulted — callers that need a
 * guaranteed `scheme` should fall back to `"exact"` themselves, matching
 * the backend's own default when building the header.
 */
export function parseX402PaymentHeader(
  header: string | null | undefined
): Partial<X402PaymentRequirements> | null {
  if (!header || typeof header !== 'string') {
    return null;
  }

  const trimmed = header.trim();
  if (!trimmed.toLowerCase().startsWith(PAYMENT_SCHEME_PREFIX.toLowerCase())) {
    return null;
  }

  // Everything after the leading scheme word is the param list.
  const paramsPart = trimmed.slice(PAYMENT_SCHEME_PREFIX.length);

  const result: Partial<X402PaymentRequirements> = {};
  let match: RegExpExecArray | null;

  // Reset lastIndex since PARAM_PATTERN is a shared module-level regex with /g.
  PARAM_PATTERN.lastIndex = 0;
  while ((match = PARAM_PATTERN.exec(paramsPart)) !== null) {
    const [, rawKey, rawValue] = match;
    const key = rawKey.toLowerCase();
    const value = rawValue.replace(/\\(.)/g, '$1'); // unescape \" and \\

    switch (key) {
      case 'scheme':
      case 'network':
      case 'asset':
      case 'amount':
      case 'pay_to':
        result[key as keyof X402PaymentRequirements] = value;
        break;
      default:
        // Unknown/forward-compatible param — ignore rather than fail.
        break;
    }
  }

  // No recognized params at all means this wasn't really a Payment challenge
  // we understand, even though the scheme word matched.
  if (Object.keys(result).length === 0) {
    return null;
  }

  return result;
}

/**
 * Like {@link parseX402PaymentHeader}, but throws a descriptive `Error`
 * instead of returning `null` when the header is missing or unparseable.
 * Useful for callers that have already confirmed (e.g. via a 402 status
 * code) that a payment challenge is expected.
 */
export function parseX402PaymentHeaderOrThrow(
  header: string | null | undefined
): Partial<X402PaymentRequirements> {
  const parsed = parseX402PaymentHeader(header);
  if (!parsed) {
    throw new Error(
      `Could not parse WWW-Authenticate header as an x402 Payment challenge: ${JSON.stringify(
        header
      )}`
    );
  }
  return parsed;
}
