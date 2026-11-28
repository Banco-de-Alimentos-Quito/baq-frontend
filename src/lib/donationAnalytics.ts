"use client";

type AnalyticsParams = Record<string, string | number | boolean | object>;

function send(event: string, params: AnalyticsParams) {
  if (typeof window === "undefined") return;
  const analyticsWindow = window as Window & {
    gtag?: (command: string, event: string, params: AnalyticsParams) => void;
    dataLayer?: unknown[];
  };
  if (analyticsWindow.gtag) {
    analyticsWindow.gtag("event", event, params);
  } else {
    // The first client render can precede next/script initialization.
    analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
    analyticsWindow.dataLayer.push(["event", event, params]);
  }
}

function donationParams(amount: number, frequency: "unica" | "mensual") {
  return {
    currency: "USD",
    value: amount,
    donation_frequency: frequency,
    items: [{ item_id: `donacion_${frequency}`, item_name: "Donación BAQ", price: amount, quantity: 1 }],
  };
}

export function trackDonationView(path: string) {
  send("view_donation", { donation_path: path });
}

export function trackDonationAmount(amount: number, frequency: "unica" | "mensual") {
  if (!Number.isFinite(amount) || amount < 1) return;
  send("select_donation_amount", donationParams(amount, frequency));
}

export function trackDonationCheckout(amount: number, frequency: "unica" | "mensual") {
  if (!Number.isFinite(amount) || amount < 1) return;
  send("begin_checkout", donationParams(amount, frequency));
}

export function trackDonationPaymentMethod(method: string, amount: number, frequency: "unica" | "mensual") {
  if (!Number.isFinite(amount) || amount < 1) return;
  send("select_payment_method", { ...donationParams(amount, frequency), payment_type: method });
}

// The backend accepted a recurring donation request. This is not a charged payment.
export function trackDonationRequestSubmitted(amount: number, method: string) {
  if (!Number.isFinite(amount) || amount < 1) return;
  send("donation_request_submitted", {
    donation_frequency: "mensual",
    payment_type: method,
    currency: "USD",
    monthly_amount: amount,
  });
}

// The backend confirmed a recurring card subscription. Its first charge is not asserted here.
export function trackSubscriptionActivated(amount: number, method: string) {
  if (!Number.isFinite(amount) || amount < 1) return;
  send("subscription_activated", {
    donation_frequency: "mensual",
    payment_type: method,
    currency: "USD",
    monthly_amount: amount,
  });
}

// Call only after the payment provider or backend confirms a charge.
export function trackDonationPurchase(transactionId: string | undefined, amount: number, method: string) {
  if (!transactionId || !Number.isFinite(amount) || amount < 1 || typeof window === "undefined") return;
  const key = `ga4_purchase_${method}_${transactionId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    sessionStorage.setItem("ga4_pending_donation_confirmation", JSON.stringify({
      transactionId,
      amount,
      method,
      confirmedAt: Date.now(),
    }));
  } catch {
    // A blocked storage API must not break payment completion.
  }
  send("purchase", { ...donationParams(amount, "unica"), transaction_id: transactionId, payment_type: method });
}

// The final funnel step is the thank-you page reached after an approved charge.
export function trackDonationConfirmationViewed() {
  if (typeof window === "undefined") return;
  try {
    const pending = sessionStorage.getItem("ga4_pending_donation_confirmation");
    if (!pending) return;
    sessionStorage.removeItem("ga4_pending_donation_confirmation");
    const receipt = JSON.parse(pending) as {
      transactionId?: string;
      amount?: number;
      method?: string;
      confirmedAt?: number;
    };
    if (!receipt.transactionId || !receipt.method || !receipt.confirmedAt ||
        Date.now() - receipt.confirmedAt > 5 * 60 * 1000) return;
    send("donation_confirmation_viewed", {
      transaction_id: receipt.transactionId,
      payment_type: receipt.method,
      donation_frequency: "unica",
    });
  } catch {
    // Storage may be unavailable; never interrupt the thank-you page.
  }
}
