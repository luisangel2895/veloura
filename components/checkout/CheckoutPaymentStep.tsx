"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { CreditCard, Loader2, LockKeyhole } from "lucide-react";

import {
  type StripeElementsHandle,
  type StripeElementHandle,
  useStripeRuntime,
} from "@/components/stripe/StripeProvider";
import { Button } from "@/components/ui/button";

interface CheckoutPaymentItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

interface CheckoutPaymentShipping {
  fullName: string;
  email: string;
  country: string;
  city: string;
  street: string;
  streetNumber: string;
  apartment: string;
  reference: string;
  postalCode: string;
  shippingMethod: string;
}

interface CheckoutPaymentStepProps {
  items: CheckoutPaymentItem[];
  shipping: CheckoutPaymentShipping;
  clientSecret: string | null;
  paymentIntentStatus: string | null;
  paymentError: string | null;
  onPaymentIntentCreated: (clientSecret: string) => void;
  onPaymentConfirmed: (payload: { paymentIntentId: string; paymentIntentStatus: string }) => void;
  onPaymentFailed: (message: string) => void;
  payLabel: string;
  locale: "es" | "en";
}

const CLIENT_PAYMENT_INTENT_TIMEOUT_MS = 12_000;

function getPaymentElementAppearance(isDark: boolean) {
  return {
    theme: isDark ? "night" : "stripe",
    variables: {
      colorPrimary: isDark ? "#fcd34d" : "#b48c34",
      colorText: isDark ? "#f7f4ef" : "#2f2923",
      colorBackground: isDark ? "#2a2724" : "#f3eee6",
      colorDanger: "#dc2626",
      borderRadius: "16px",
    },
  };
}

export function CheckoutPaymentStep({
  items,
  shipping,
  clientSecret,
  paymentIntentStatus,
  paymentError,
  onPaymentIntentCreated,
  onPaymentConfirmed,
  onPaymentFailed,
  payLabel,
  locale,
}: CheckoutPaymentStepProps) {
  const { isReady, error: stripeRuntimeError, getStripe } = useStripeRuntime();
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isElementMounted, setIsElementMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const paymentElementRef = useRef<StripeElementHandle | null>(null);
  const elementsRef = useRef<StripeElementsHandle | null>(null);
  const completedIntentRequestKeyRef = useRef<string | null>(null);
  const inflightIntentRequestKeyRef = useRef<string | null>(null);
  const mountedClientSecretRef = useRef<string | null>(null);

  const handleIntentCreated = useEffectEvent((nextClientSecret: string) => {
    onPaymentIntentCreated(nextClientSecret);
  });

  const reportRequestError = useEffectEvent((error: unknown, timeout: boolean) => {
    const message = timeout
      ? locale === "es"
        ? "Stripe tardó demasiado en responder. Intenta nuevamente."
        : "Stripe took too long to respond. Please try again."
      : error instanceof Error && error.message.trim()
        ? error.message
        : locale === "es"
          ? "No se pudo preparar el pago."
          : "We could not prepare the payment.";

    setRequestError(message);
    onPaymentFailed(message);
  });

  const reportMountError = useEffectEvent((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : locale === "es"
          ? "No se pudo montar el formulario de Stripe."
          : "We could not mount the Stripe payment form.";

    setRequestError(message);
    onPaymentFailed(message);
  });

  const intentFingerprint = useMemo(
    () =>
      JSON.stringify({
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          size: item.size ?? null,
        })),
        shipping,
      }),
    [items, shipping],
  );
  const intentRequestKey = `${intentFingerprint}:${retryCount}`;

  useEffect(() => {
    if (clientSecret || !items.length) {
      return;
    }

    if (
      completedIntentRequestKeyRef.current === intentRequestKey ||
      inflightIntentRequestKeyRef.current === intentRequestKey
    ) {
      return;
    }

    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, CLIENT_PAYMENT_INTENT_TIMEOUT_MS);

    async function createPaymentIntent() {
      inflightIntentRequestKeyRef.current = intentRequestKey;
      setIsCreatingIntent(true);
      setRequestError(null);

      try {
        const response = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items,
            shipping,
          }),
          signal: controller.signal,
        });

        const payload = (await response.json()) as
          | { clientSecret?: string; error?: string }
          | undefined;

        if (!response.ok || !payload?.clientSecret) {
          throw new Error(payload?.error ?? "");
        }

        completedIntentRequestKeyRef.current = intentRequestKey;
        handleIntentCreated(payload.clientSecret);
      } catch (error) {
        if (didTimeout) {
          reportRequestError(error, true);
          return;
        }

        if (controller.signal.aborted) {
          return;
        }

        reportRequestError(error, false);
      } finally {
        window.clearTimeout(timeoutId);
        if (inflightIntentRequestKeyRef.current === intentRequestKey) {
          inflightIntentRequestKeyRef.current = null;
        }
        setIsCreatingIntent(false);
      }
    }

    void createPaymentIntent();

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
      if (inflightIntentRequestKeyRef.current === intentRequestKey) {
        inflightIntentRequestKeyRef.current = null;
      }
    };
  }, [clientSecret, intentRequestKey, items, shipping]);

  useEffect(() => {
    if (
      !clientSecret ||
      !isReady ||
      !hostRef.current ||
      mountedClientSecretRef.current === clientSecret
    ) {
      return;
    }

    const stripe = getStripe();

    if (!stripe) {
      return;
    }

    setIsElementMounted(false);

    try {
      const isDark = document.documentElement.classList.contains("dark");
      const nextElements = stripe.elements({
        clientSecret,
        appearance: getPaymentElementAppearance(isDark),
      });
      const nextPaymentElement = nextElements.create("payment", {
        layout: {
          type: "tabs",
        },
      });

      nextPaymentElement.mount(hostRef.current);
      elementsRef.current = nextElements;
      paymentElementRef.current = nextPaymentElement;
      mountedClientSecretRef.current = clientSecret;
      setIsElementMounted(true);
    } catch (error) {
      reportMountError(error);
    }

    return () => {
      if (paymentElementRef.current) {
        try {
          paymentElementRef.current.destroy?.();
        } catch {
          // Stripe may already have removed the node during internal cleanup.
        }
      }

      paymentElementRef.current = null;
      elementsRef.current = null;
      mountedClientSecretRef.current = null;
    };
  }, [clientSecret, getStripe, isReady]);

  async function handleConfirmPayment() {
    if (!clientSecret || !elementsRef.current) {
      return;
    }

    const stripe = getStripe();

    if (!stripe) {
      const message =
        stripeRuntimeError ??
        (locale === "es" ? "Stripe.js todavía no está listo." : "Stripe.js is not ready yet.");
      setRequestError(message);
      onPaymentFailed(message);
      return;
    }

    setIsConfirmingPayment(true);
    setRequestError(null);

    try {
      const result = await stripe.confirmPayment({
        elements: elementsRef.current,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?step=complete`,
        },
        redirect: "if_required",
      });

      if (result.error?.message) {
        setRequestError(result.error.message);
        onPaymentFailed(result.error.message);
        return;
      }

      if (!result.paymentIntent) {
        const message =
          locale === "es"
            ? "Stripe no devolvió un PaymentIntent válido."
            : "Stripe did not return a valid PaymentIntent.";
        setRequestError(message);
        onPaymentFailed(message);
        return;
      }

      onPaymentConfirmed({
        paymentIntentId: result.paymentIntent.id,
        paymentIntentStatus: result.paymentIntent.status,
      });
    } finally {
      setIsConfirmingPayment(false);
    }
  }

  const inlineError = requestError ?? stripeRuntimeError ?? paymentError;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-background/60 p-5 dark:border-amber-500/10 dark:bg-background/30">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/80 text-amber-700 dark:border-amber-500/10 dark:bg-card/70 dark:text-amber-200">
            <CreditCard className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              {locale === "es" ? "Pago seguro con Stripe" : "Secure payment with Stripe"}
            </p>
            <p className="text-sm text-muted-foreground">
              {locale === "es"
                ? "El PaymentIntent se calcula en el servidor y el formulario se monta con PaymentElement."
                : "The PaymentIntent is computed on the server and the form mounts with PaymentElement."}
            </p>
          </div>
        </div>

        <div className="relative mt-5 min-h-40 rounded-2xl border border-border bg-card/70 p-4 dark:border-amber-500/10 dark:bg-card/60">
          <div
            ref={hostRef}
            className={`min-h-32 ${!isElementMounted ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
          />

          {!clientSecret || !isReady || !isElementMounted ? (
            <div className="absolute inset-4 flex min-h-32 items-center justify-center text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                {isCreatingIntent
                  ? locale === "es"
                    ? "Preparando PaymentIntent..."
                    : "Preparing PaymentIntent..."
                  : clientSecret && isReady
                    ? locale === "es"
                      ? "Montando formulario de pago..."
                      : "Mounting payment form..."
                    : locale === "es"
                      ? "Cargando Stripe Elements..."
                      : "Loading Stripe Elements..."}
              </span>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <LockKeyhole className="size-4" />
            {locale === "es"
              ? "Los datos sensibles viajan directo a Stripe."
              : "Sensitive payment details go directly to Stripe."}
          </p>

          <Button
            type="button"
            onClick={handleConfirmPayment}
            disabled={!clientSecret || !isReady || isCreatingIntent || isConfirmingPayment}
            className="h-14 rounded-none bg-amber-700 px-8 text-xs font-semibold uppercase tracking-[0.18em] text-amber-50 hover:bg-amber-600 disabled:opacity-70 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
          >
            {isConfirmingPayment ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CreditCard className="size-3.5" />
            )}
            {payLabel}
          </Button>
        </div>
      </div>

      {paymentIntentStatus ? (
        <div className="rounded-2xl border border-border bg-card/80 px-4 py-4 text-sm text-muted-foreground dark:border-amber-500/10 dark:bg-card/70">
          <p className="font-medium text-foreground">
            {locale === "es" ? "PaymentIntent confirmado" : "PaymentIntent confirmed"}
          </p>
          <p className="mt-1">
            {locale === "es" ? "Estado:" : "Status:"} {paymentIntentStatus}
          </p>
        </div>
      ) : null}

      {inlineError ? <p className="text-sm text-destructive">{inlineError}</p> : null}

      {inlineError && !clientSecret ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setRetryCount((current) => current + 1)}
          disabled={isCreatingIntent}
          className="h-14 rounded-none border-border bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.2em] hover:bg-accent dark:border-amber-500/20 dark:hover:bg-amber-500/10"
        >
          {locale === "es" ? "Reintentar pago" : "Retry payment setup"}
        </Button>
      ) : null}
    </div>
  );
}
