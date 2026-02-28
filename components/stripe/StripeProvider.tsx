"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface StripeElementHandle {
  mount: (element: string | HTMLElement) => void;
  unmount: () => void;
  destroy?: () => void;
}

export interface StripeElementsHandle {
  create: (type: "payment", options?: Record<string, unknown>) => StripeElementHandle;
}

export interface StripePaymentIntentResult {
  id: string;
  status: string;
}

export interface StripeConfirmPaymentResult {
  error?: { message?: string };
  paymentIntent?: StripePaymentIntentResult;
}

export interface StripeClient {
  elements: (options: {
    clientSecret: string;
    appearance?: Record<string, unknown>;
  }) => StripeElementsHandle;
  confirmPayment: (options: {
    elements: StripeElementsHandle;
    confirmParams: { return_url: string };
    redirect: "if_required";
  }) => Promise<StripeConfirmPaymentResult>;
}

type StripeFactory = (publishableKey: string) => StripeClient;

declare global {
  interface Window {
    Stripe?: StripeFactory;
  }
}

interface StripeContextValue {
  publishableKey: string | null;
  isReady: boolean;
  error: string | null;
  getStripe: () => StripeClient | null;
}

const STRIPE_JS_URL = "https://js.stripe.com/v3";

const StripeContext = createContext<StripeContextValue | null>(null);

export function StripeProvider({ children }: { children: ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;
  const [isReady, setIsReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.Stripe),
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const stripeClientRef = useRef<StripeClient | null>(null);

  useEffect(() => {
    stripeClientRef.current = null;
  }, [publishableKey]);

  useEffect(() => {
    if (!publishableKey) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (window.Stripe) {
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-stripe-js="true"]',
    );

    const handleLoad = () => {
      if (window.Stripe) {
        setIsReady(true);
      } else {
        setLoadError("Stripe.js loaded but the Stripe client was not found.");
      }
    };

    const handleError = () => {
      setLoadError("Unable to load Stripe.js in this session.");
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);

      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.src = STRIPE_JS_URL;
    script.async = true;
    script.dataset.stripeJs = "true";
    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [publishableKey]);

  const error = publishableKey ? loadError : "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.";

  const value = useMemo<StripeContextValue>(
    () => ({
      publishableKey,
      isReady,
      error,
      getStripe: () => {
        if (!publishableKey || typeof window === "undefined" || !window.Stripe) {
          return null;
        }

        if (!stripeClientRef.current) {
          stripeClientRef.current = window.Stripe(publishableKey);
        }

        return stripeClientRef.current;
      },
    }),
    [error, isReady, publishableKey],
  );

  return <StripeContext.Provider value={value}>{children}</StripeContext.Provider>;
}

export function useStripeRuntime() {
  const context = useContext(StripeContext);

  if (!context) {
    throw new Error("useStripeRuntime must be used inside StripeProvider.");
  }

  return context;
}
