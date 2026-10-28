/**
 * Type definitions for x402 payment-protocol support.
 *
 * x402 is the "pay via HTTP 402" convention AINative uses for agent-paid
 * subscriptions (core#9247 MPP). The real wire shape comes from
 * `app/api/v1/endpoints/x402_subscriptions.py::subscribe_via_x402` in the
 * backend: a 402 response carries BOTH a JSON body (`requirements`) and a
 * `WWW-Authenticate: Payment ...` header encoding the same fields, so an
 * agent can discover payment terms from the header alone.
 */

/**
 * The x402 payment requirements, as emitted in both the 402 JSON body
 * (`requirements`) and the `WWW-Authenticate: Payment` header.
 *
 * Field names mirror the backend dict built in `X402SubscriptionService`
 * (`amount`, `asset`, `network`, `pay_to`) plus the `scheme` the endpoint
 * defaults to `"exact"` when building the header.
 */
export interface X402PaymentRequirements {
  /** Payment scheme, e.g. "exact". Defaults to "exact" when absent. */
  scheme: string;

  /** Settlement network, e.g. "base" or "base-sepolia". */
  network: string;

  /** Asset the agent must pay with, e.g. "USDC". */
  asset: string;

  /**
   * Amount required, as a string (the header always carries it quoted;
   * the JSON body may carry it as a number — callers that need a number
   * should parse this themselves).
   */
  amount: string;

  /** Wallet address the agent must pay to. */
  pay_to: string;
}

/** Fields of {@link X402PaymentRequirements} that may legitimately be absent
 * from a given `WWW-Authenticate: Payment` header. */
export type X402PaymentRequirementsField = keyof X402PaymentRequirements;

/** Plan identifiers purchasable via x402 (mirrors `SubscribeRequest.plan_id`). */
export type X402PlanId = 'hobbyist' | 'pro' | 'business' | 'enterprise' | 'cody_vcto';

/** Billing mode for an x402 subscription purchase. */
export type X402BillingMode = 'prepaid' | 'recurring';

/** The x402 payment proof an agent submits after paying on-chain/via Circle. */
export interface X402PaymentProof {
  tx_hash?: string;
  amount?: number;
  asset?: string;
  network?: string;
  [key: string]: unknown;
}

/** Request body for `POST /cloud/x402/subscriptions/subscribe`. */
export interface X402SubscribeRequest {
  plan_id: X402PlanId | string;
  billing_mode?: X402BillingMode;
  wallet_address?: string;
  user_id?: string;
  /** Omit to get the 402 challenge back; include to activate the subscription. */
  payment_proof?: X402PaymentProof;
}

/** A plan purchasable via x402, as returned by `GET /cloud/x402/subscriptions/plans`. */
export interface X402Plan {
  id: string;
  price_usd?: number;
  amount?: number;
  asset?: string;
  network?: string;
  pay_to?: string | null;
  [key: string]: unknown;
}

/** Successful (activated) result of `POST /cloud/x402/subscriptions/subscribe`. */
export interface X402Subscription {
  status?: string;
  plan_id?: string;
  wallet_address?: string | null;
  user_id?: string | null;
  network?: string;
  x402_last_tx?: string;
  [key: string]: unknown;
}

/** The JSON body of a 402 response from the x402 subscribe endpoint. */
export interface X402ChallengeBody {
  detail: string;
  error_code: 'payment_required';
  next_action: 'submit_x402_payment';
  requirements: Partial<X402PaymentRequirements> & Record<string, unknown>;
}
