"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { trackEvent } from "@/lib/meta-pixel";
import { CheckCircle, CreditCard, Lock, X } from "lucide-react";

/** --- Stripe singleton --- */
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

/** --- Exporteerbare opener (voor CTA’s elders op de pagina) --- */
let externalOpen: null | (() => void) = null;
export function openPaymentModal() {
  if (externalOpen) externalOpen();
}

/** --- Types --- */
type PriceInfo = {
  price: string; // "27"
  currency: string; // "USD"
  productName: string; // "ADHD Identity Method"
  originalPrice?: string; // "1035"
  priceId?: string;
};

export default function SimpleEmbeddedCheckout() {
  /** UI state */
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [price, setPrice] = useState<PriceInfo | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  /** Modal + checkout state */
  const [isOpen, setIsOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Refs */
  const lastFocusedEl = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  /** Stripe init */
  useEffect(() => {
    stripePromise.then(setStripe);
  }, []);

  /** Prijs ophalen (unchanged endpoint, met fallback voor originalPrice) */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/get-price");
        const data = res.ok ? await res.json() : null;
        if (!alive) return;
        if (data) {
          setPrice({
            ...data,
            price: parseFloat(data.price).toFixed(0),
            // Fallback als endpoint geen originalPrice stuurt
            originalPrice:
              data.originalPrice != null && data.originalPrice !== ""
                ? parseFloat(data.originalPrice).toFixed(0)
                : "1035",
          });
        }
      } catch {
        // prijs tonen is nice-to-have; bij failure tonen we fallback
        if (alive) {
          setPrice({
            price: "27",
            currency: "USD",
            productName: "ADHD Identity Method",
            originalPrice: "1035",
          });
        }
      } finally {
        if (alive) setLoadingPrice(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /** Externe open-koppeling */
  useEffect(() => {
    externalOpen = () => void openCheckout();
    return () => {
      externalOpen = null;
    };
  }, [price, stripe]);

  /** Body scroll lock + Escape + focus trap */
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll (simpel & betrouwbaar)
    const { scrollY } = window;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "Tab" && modalRef.current) {
        // simpele focus trap
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  /** Open + maak Checkout Session + set clientSecret */
  async function openCheckout() {
    if (!price) return;
    if (!stripe) return;

    // Meta Pixel — behouden zoals gevraagd
    trackEvent("InitiateCheckout", {
      value: parseFloat(price.price),
      currency: price.currency,
      content_name: price.productName,
      content_category: "Digital Product",
    });

    lastFocusedEl.current = document.activeElement as HTMLElement | null;
    setIsOpen(true);
    setError(null);
    setCreatingSession(true);

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: price.priceId || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          mode: "payment",
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || "Failed to create checkout session");
      }
      const { clientSecret } = await res.json();
      setClientSecret(clientSecret);
    } catch (e: any) {
      setError(e?.message || "Something went wrong creating your checkout.");
    } finally {
      setCreatingSession(false);
    }
  }

  function closeModal() {
    setIsOpen(false);
    setClientSecret(null); // EmbeddedCheckout unmount → clean slate
    setError(null);
    setCreatingSession(false);
    if (lastFocusedEl.current) {
      // focus terugzetten
      lastFocusedEl.current.focus();
    }
  }

  /** Currency + discount helpers */
  const currency = (price?.currency ?? "USD").toUpperCase();
  const symbol = currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  const original = price?.originalPrice ? Number(price.originalPrice) : null;
  const current = price?.price ? Number(price.price) : null;

  const percentOff =
    original && current && original > current
      ? Math.round(((original - current) / original) * 100)
      : null;

  const youSave =
    original && current && original > current
      ? Math.round(original - current)
      : null;

  /** UI */
  const displayPrice = loadingPrice
    ? null
    : price?.price
    ? `${symbol}${price.price}`
    : `${symbol}27`;

  return (
    <>
      {/* CTA / Price card */}
      <div className="rounded-2xl border border-adhd-yellow/30 p-6 sm:p-8 bg-black/40">
        <div className="text-center mb-6">
          {/* Kortingsbadge */}
          {percentOff ? (
            <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-600/20 border border-red-500/40 text-red-200 mb-3">
              LIMITED TIME: {percentOff}% OFF
            </div>
          ) : null}

          {/* Vergelijkingsprijs */}
          {original ? (
            <div className="text-gray-400 text-sm mb-1">
              Total value:{" "}
              <span className="line-through">
                {symbol}
                {original}
              </span>
            </div>
          ) : null}

          {/* Huidige prijs */}
          <div className="text-5xl sm:text-6xl font-extrabold text-adhd-yellow">
            {displayPrice ?? "…"}
          </div>

          {/* You save of note */}
            <div className="text-xs text-gray-300 mt-1">
              One-time payment • No subscription
            </div>
        </div>

        <button
          onClick={openCheckout}
          disabled={creatingSession || loadingPrice}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-adhd-yellow text-black font-bold text-lg sm:text-xl py-4 disabled:opacity-60"
        >
          <CreditCard className="w-5 h-5" />
          {creatingSession ? "Loading checkout…" : "Get Instant Access"}
        </button>

        {/* Trust badges */}
        <div className="flex flex-col gap-2 text-sm text-gray-300 mt-4 items-center">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-adhd-green" />
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-adhd-green" />
            <span>Instant access (start in 2 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-adhd-green" />
            <span>Secure payment by Stripe</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Secure checkout"
          onMouseDown={(e) => {
            // klik buiten sluit
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-3xl h-[92dvh] sm:h-[86dvh] mx-4 rounded-2xl border border-white/10 bg-black flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-adhd-green" />
                <h2 className="text-lg sm:text-xl font-bold">
                  Secure Checkout
                </h2>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close"
                className="p-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-adhd-yellow"
                autoFocus
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body (scrollable) */}
            <div className="flex-1 overflow-auto px-2 sm:px-4 py-3">
              {error && (
                <div className="mx-2 mb-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {/* Stripe Embedded Checkout */}
              {stripe && clientSecret ? (
                <div className="rounded-xl border border-white/10 p-2">
                  <EmbeddedCheckoutProvider
                    stripe={stripe}
                    options={{ clientSecret }}
                  >
                    {/* Stripe iFrame vult automatisch de container */}
                    <div className="min-h-[420px] sm:min-h-[520px]">
                      <EmbeddedCheckout />
                    </div>
                  </EmbeddedCheckoutProvider>
                </div>
              ) : (
                <div className="text-center text-sm text-gray-300 py-10">
                  Initializing secure checkout…
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-white/10 text-center text-xs text-gray-400">
              Apple Pay, Google Pay, and all major cards accepted
            </div>
          </div>
        </div>
      )}

      {/* Minimal styles for safe-area support */}
      <style jsx global>{`
        @supports (padding: max(0px)) {
          [role="dialog"] > div {
            padding-bottom: max(0px, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </>
  );
}
