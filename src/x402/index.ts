/**
 * x402 payment-protocol client for TypeScript/JavaScript.
 *
 * Thin typed wrapper around the backend's x402 subscription endpoints
 * (`app/api/v1/endpoints/x402_subscriptions.py`, mounted under
 * `/cloud/x402/subscriptions`), so an SDK consumer gets a typed
 * {@link X402PaymentRequiredError} (with parsed `requirements`) on the
 * standard "pay via HTTP 402" challenge, rather than a raw fetch/axios
 * error they have to pick apart themselves.
 */

import type { AINativeClient } from '../client';
import type { ApiResponse } from '../types';
import type {
  X402Plan,
  X402SubscribeRequest,
  X402Subscription,
  X402PaymentRequirements
} from '../types/x402';
import { X402PaymentRequiredError } from '../errors';
import { parseX402PaymentHeader } from './parseHeader';

export { parseX402PaymentHeader, parseX402PaymentHeaderOrThrow } from './parseHeader';

export class X402Client {
  constructor(private client: AINativeClient) {}

  /**
   * List every plan purchasable via x402, with its payment target
   * (amount, pay_to wallet, network). No auth required — agents shop
   * before paying.
   */
  async listPlans(): Promise<ApiResponse<{ plans: X402Plan[] }>> {
    return this.client.get<{ plans: X402Plan[] }>('/cloud/x402/subscriptions/plans');
  }

  /**
   * Buy a subscription via x402.
   *
   * - Called **without** `payment_proof`: the backend returns an HTTP 402
   *   challenge. This method converts that into a thrown
   *   {@link X402PaymentRequiredError} whose `.requirements` is populated
   *   from the response — preferring the `WWW-Authenticate: Payment`
   *   header (the MPP discovery convention, core#9247) and falling back
   *   to the JSON body's `requirements` field if the header is somehow
   *   absent — so callers get a single typed shape regardless of which
   *   carried the data.
   * - Called **with** `payment_proof`: resolves normally with the
   *   activated (or already-active) subscription.
   *
   * @throws {X402PaymentRequiredError} on the 402 challenge.
   * @throws {AINativeError} (or a subclass) on any other failure.
   */
  async subscribe(body: X402SubscribeRequest): Promise<ApiResponse<X402Subscription>> {
    try {
      return await this.client.post<X402Subscription>(
        '/cloud/x402/subscriptions/subscribe',
        body
      );
    } catch (error: any) {
      if (error?.status === 402) {
        throw this.toPaymentRequiredError(error);
      }
      throw error;
    }
  }

  /** The agent's current x402-activated subscription (by wallet or user_id). */
  async getSubscription(params: {
    walletAddress?: string;
    userId?: string;
  }): Promise<ApiResponse<{ subscription: X402Subscription | null }>> {
    const query = new URLSearchParams();
    if (params.walletAddress) query.append('wallet_address', params.walletAddress);
    if (params.userId) query.append('user_id', params.userId);

    return this.client.get<{ subscription: X402Subscription | null }>(
      `/cloud/x402/subscriptions/subscription?${query}`
    );
  }

  /**
   * Convert a caught 402 error (as produced by `AINativeClient`'s error
   * handling) into a typed {@link X402PaymentRequiredError}.
   */
  private toPaymentRequiredError(error: any): X402PaymentRequiredError {
    const headerValue: string | undefined =
      error?.details?.headers?.['www-authenticate'] ??
      error?.details?.headers?.['WWW-Authenticate'];

    const fromHeader = parseX402PaymentHeader(headerValue);
    const fromBody: Partial<X402PaymentRequirements> | undefined =
      error?.details?.requirements;

    const requirements: Partial<X402PaymentRequirements> | undefined =
      fromHeader ?? fromBody ?? undefined;

    const message: string =
      error?.details?.detail ||
      error?.message ||
      'Payment required — pay the required amount to pay_to, then re-call with payment_proof.';

    return new X402PaymentRequiredError(message, requirements, error?.details);
  }
}
