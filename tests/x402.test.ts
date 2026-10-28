/**
 * Tests for x402 payment-protocol support: the WWW-Authenticate header
 * parser and the X402Client typed wrapper.
 */

import {
  parseX402PaymentHeader,
  parseX402PaymentHeaderOrThrow
} from '../src/x402/parseHeader';
import { X402Client } from '../src/x402';
import { X402PaymentRequiredError, ValidationError } from '../src/errors';

describe('parseX402PaymentHeader', () => {
  it('parses the real header format emitted by the backend (happy path)', () => {
    // Exact shape from app/api/v1/endpoints/x402_subscriptions.py::subscribe_via_x402
    const header =
      'Payment scheme="exact", network="base", asset="USDC", amount="2000", pay_to="0xAbC1230000000000000000000000000000dEaD"';

    const result = parseX402PaymentHeader(header);

    expect(result).toEqual({
      scheme: 'exact',
      network: 'base',
      asset: 'USDC',
      amount: '2000',
      pay_to: '0xAbC1230000000000000000000000000000dEaD'
    });
  });

  it('parses correctly when the backend default scheme ("exact") was used with no override', () => {
    const header =
      'Payment scheme="exact", network="base-sepolia", asset="USDC", amount="500", pay_to="0x0000000000000000000000000000000000beef"';

    const result = parseX402PaymentHeader(header);

    expect(result?.scheme).toBe('exact');
    expect(result?.network).toBe('base-sepolia');
    expect(result?.amount).toBe('500');
  });

  it('is tolerant of extra whitespace between params', () => {
    const header = 'Payment scheme="exact",   network="base",asset="USDC",   amount="100",pay_to="0xdead"';

    const result = parseX402PaymentHeader(header);

    expect(result).toEqual({
      scheme: 'exact',
      network: 'base',
      asset: 'USDC',
      amount: '100',
      pay_to: '0xdead'
    });
  });

  it('ignores unknown/forward-compatible params instead of failing', () => {
    const header =
      'Payment scheme="exact", network="base", asset="USDC", amount="100", pay_to="0xdead", expiry="2026-11-01T00:00:00Z"';

    const result = parseX402PaymentHeader(header);

    expect(result).toMatchObject({
      scheme: 'exact',
      network: 'base',
      asset: 'USDC',
      amount: '100',
      pay_to: '0xdead'
    });
    expect((result as any).expiry).toBeUndefined();
  });

  it('returns null for a missing header', () => {
    expect(parseX402PaymentHeader(undefined)).toBeNull();
    expect(parseX402PaymentHeader(null)).toBeNull();
    expect(parseX402PaymentHeader('')).toBeNull();
  });

  it('returns null for a malformed header with the wrong scheme (e.g. Bearer)', () => {
    const header = 'Bearer realm="api"';

    expect(parseX402PaymentHeader(header)).toBeNull();
  });

  it('returns null for a malformed header that matches scheme but has no parseable params', () => {
    const header = 'Payment this is garbage not key=value pairs at all';

    expect(parseX402PaymentHeader(header)).toBeNull();
  });

  it('returns null for a malformed header with unquoted values (not the real wire format)', () => {
    const header = 'Payment scheme=exact, network=base';

    // The backend always double-quotes values; unquoted values don't match
    // PARAM_PATTERN, so this should parse as "no recognized params".
    expect(parseX402PaymentHeader(header)).toBeNull();
  });

  it('parses partial headers (some fields legitimately missing) without throwing', () => {
    const header = 'Payment scheme="exact", amount="100"';

    const result = parseX402PaymentHeader(header);

    expect(result).toEqual({ scheme: 'exact', amount: '100' });
  });
});

describe('parseX402PaymentHeaderOrThrow', () => {
  it('returns the parsed object on a valid header', () => {
    const header = 'Payment scheme="exact", network="base", asset="USDC", amount="100", pay_to="0xdead"';

    expect(parseX402PaymentHeaderOrThrow(header)).toEqual({
      scheme: 'exact',
      network: 'base',
      asset: 'USDC',
      amount: '100',
      pay_to: '0xdead'
    });
  });

  it('throws a descriptive error on a malformed/missing header', () => {
    expect(() => parseX402PaymentHeaderOrThrow(undefined)).toThrow(
      /Could not parse WWW-Authenticate header/
    );
    expect(() => parseX402PaymentHeaderOrThrow('Bearer realm="api"')).toThrow(
      /Could not parse WWW-Authenticate header/
    );
  });
});

describe('X402Client', () => {
  function makeFakeClient(postImpl: (...args: any[]) => any) {
    return {
      get: jest.fn(),
      post: postImpl
    } as any;
  }

  it('listPlans() calls GET /cloud/x402/subscriptions/plans', async () => {
    const get = jest.fn().mockResolvedValue({ data: { plans: [] }, status: 200, headers: {} });
    const fakeClient = { get, post: jest.fn() } as any;
    const x402 = new X402Client(fakeClient);

    await x402.listPlans();

    expect(get).toHaveBeenCalledWith('/cloud/x402/subscriptions/plans');
  });

  it('subscribe() resolves normally when payment_proof already satisfies the backend', async () => {
    const post = jest
      .fn()
      .mockResolvedValue({ data: { status: 'active', plan_id: 'pro' }, status: 200, headers: {} });
    const fakeClient = makeFakeClient(post);
    const x402 = new X402Client(fakeClient);

    const result = await x402.subscribe({ plan_id: 'pro', payment_proof: { tx_hash: '0x1' } });

    expect(post).toHaveBeenCalledWith('/cloud/x402/subscriptions/subscribe', {
      plan_id: 'pro',
      payment_proof: { tx_hash: '0x1' }
    });
    expect(result.data.status).toBe('active');
  });

  it('subscribe() throws a typed X402PaymentRequiredError on the 402 challenge, parsed from the header', async () => {
    const headerValue =
      'Payment scheme="exact", network="base", asset="USDC", amount="2000", pay_to="0xdead"';

    // Simulate what AINativeClient.handleError actually constructs: status
    // 402 falls into the `default` branch => a generic AINativeError whose
    // `.status === 402` and `.details` carries body + headers. We build
    // that shape directly here (rather than importing AINativeError) so
    // this test exercises X402Client's *own* conversion logic.
    const rawAinativeStyleError = {
      status: 402,
      message: 'Payment required — pay the USDC amount',
      details: {
        detail: 'Payment required — pay the USDC amount',
        error_code: 'payment_required',
        next_action: 'submit_x402_payment',
        requirements: { scheme: 'exact', network: 'base', asset: 'USDC', amount: 2000, pay_to: '0xdead' },
        headers: { 'www-authenticate': headerValue }
      }
    };

    const post = jest.fn().mockRejectedValue(rawAinativeStyleError);
    const fakeClient = makeFakeClient(post);
    const x402 = new X402Client(fakeClient);

    await expect(x402.subscribe({ plan_id: 'pro' })).rejects.toBeInstanceOf(X402PaymentRequiredError);

    try {
      await x402.subscribe({ plan_id: 'pro' });
      fail('expected subscribe() to throw');
    } catch (err) {
      const typed = err as X402PaymentRequiredError;
      // Header-derived requirements take precedence and should win over the
      // body's (which had a numeric amount vs. the header's string one).
      expect(typed.requirements).toEqual({
        scheme: 'exact',
        network: 'base',
        asset: 'USDC',
        amount: '2000',
        pay_to: '0xdead'
      });
    }
  });

  it('subscribe() falls back to the JSON body requirements when no WWW-Authenticate header is present', async () => {
    const rawError = {
      status: 402,
      message: 'Payment required',
      details: {
        detail: 'Payment required',
        error_code: 'payment_required',
        next_action: 'submit_x402_payment',
        requirements: { scheme: 'exact', network: 'base', asset: 'USDC', amount: 2000, pay_to: '0xdead' },
        headers: {}
      }
    };
    const post = jest.fn().mockRejectedValue(rawError);
    const x402 = new X402Client(makeFakeClient(post));

    try {
      await x402.subscribe({ plan_id: 'pro' });
      fail('expected subscribe() to throw');
    } catch (err) {
      const typed = err as X402PaymentRequiredError;
      expect(typed).toBeInstanceOf(X402PaymentRequiredError);
      expect(typed.requirements).toEqual({
        scheme: 'exact',
        network: 'base',
        asset: 'USDC',
        amount: 2000,
        pay_to: '0xdead'
      });
    }
  });

  it('subscribe() re-throws non-402 errors unchanged', async () => {
    const validationError = new ValidationError('plan_id is required');
    const post = jest.fn().mockRejectedValue(validationError);
    const x402 = new X402Client(makeFakeClient(post));

    await expect(x402.subscribe({ plan_id: '' })).rejects.toBe(validationError);
  });

  it('getSubscription() calls GET with the right query params', async () => {
    const get = jest.fn().mockResolvedValue({ data: { subscription: null }, status: 200, headers: {} });
    const fakeClient = { get, post: jest.fn() } as any;
    const x402 = new X402Client(fakeClient);

    await x402.getSubscription({ walletAddress: '0xdead' });

    expect(get).toHaveBeenCalledWith(
      '/cloud/x402/subscriptions/subscription?wallet_address=0xdead'
    );
  });
});
