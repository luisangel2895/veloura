"use client";

import { useEffect, useReducer, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";

import { CheckoutPaymentStep } from "@/components/checkout/CheckoutPaymentStep";
import { useLanguage } from "@/components/providers/language-provider";
import {
  CHECKOUT_STORAGE_KEY,
  checkoutReducer,
  createInitialCheckoutState,
  createOrderSnapshot,
  editableSteps,
  formatShippingAddress,
  isFailedRedirectStatus,
  isSuccessfulPaymentStatus,
  parsePersistedCheckoutState,
  stepFieldOrder,
  steps,
  validateCheckoutStep,
  type CheckoutErrors,
  type CheckoutField,
  type CheckoutStep,
  type EditableCheckoutStep,
  type PersistedCheckoutState,
} from "@/lib/checkout/checkout-machine";
import {
  SHIPPING_COUNTRIES,
  SHIPPING_METHODS,
  getCityOptions,
  getPostalCodeHint,
  getShippingFeeCents,
} from "@/lib/checkout/shipping";
import { Price } from "@/components/store/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";

function StepMarker({
  current,
  target,
  label,
  onSelect,
}: {
  current: CheckoutStep;
  target: CheckoutStep;
  label: string;
  onSelect: (target: CheckoutStep) => void;
}) {
  const currentIndex = steps.indexOf(current);
  const targetIndex = steps.indexOf(target);
  const active = currentIndex >= targetIndex;
  const isCurrent = current === target;

  return (
    <button
      type="button"
      onClick={() => onSelect(target)}
      disabled={target === "complete" || current === "complete"}
      className={`flex min-w-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors disabled:cursor-default disabled:opacity-100 ${
        isCurrent
          ? "border-amber-700 bg-amber-700/8 dark:border-amber-300 dark:bg-amber-300/10"
          : "border-border bg-background/60 hover:bg-accent dark:border-amber-500/10 dark:bg-background/30 dark:hover:bg-amber-500/8"
      }`}
    >
      <span
        className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold leading-none ${
          active
            ? "border-amber-700 bg-amber-700 text-amber-50 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950"
            : "border-border text-muted-foreground dark:border-amber-500/20"
        }`}
      >
        {targetIndex + 1}
      </span>
      <span
        className={`min-w-0 text-sm leading-none ${active ? "text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
    </button>
  );
}

export function CheckoutFlow() {
  const { copy, locale } = useLanguage();
  const [state, dispatch] = useReducer(checkoutReducer, undefined, createInitialCheckoutState);
  const hasRestoredCheckoutRef = useRef(false);
  const searchParams = useSearchParams();
  const hasHydrated = useCart((cart) => cart.hasHydrated);
  const { items, subtotal, clearCart } = useCart((cart) => ({
    items: cart.items,
    subtotal: cart.subtotal,
    clearCart: cart.clearCart,
  }));
  const inputRefs = useRef<
    Partial<
      Record<CheckoutField, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>
    >
  >({});

  const labels = {
    shipping: locale === "es" ? "Envío" : "Shipping",
    payment: locale === "es" ? "Pago" : "Payment",
    review: locale === "es" ? "Revisión" : "Review",
    complete: locale === "es" ? "Completo" : "Complete",
    shippingTitle: locale === "es" ? "Entrega y contacto" : "Shipping and contact",
    shippingMethodTitle: locale === "es" ? "Velocidad de entrega" : "Delivery speed",
    paymentTitle: locale === "es" ? "Pago confirmado" : "Confirmed payment",
    reviewTitle: locale === "es" ? "Revisión final" : "Final review",
    fullName: locale === "es" ? "Nombre completo" : "Full name",
    email: "Email",
    country: locale === "es" ? "País" : "Country",
    city: locale === "es" ? "Ciudad" : "City",
    street: locale === "es" ? "Calle" : "Street",
    streetNumber: locale === "es" ? "Número" : "Street number",
    apartment: locale === "es" ? "Dpto / Suite (opcional)" : "Apt / Suite (optional)",
    reference: locale === "es" ? "Referencia de entrega" : "Delivery reference",
    postalCode: locale === "es" ? "Código postal" : "Postal code",
    chooseCountry: locale === "es" ? "Selecciona un país" : "Select a country",
    chooseCity: locale === "es" ? "Selecciona una ciudad" : "Select a city",
    shippingStandard: locale === "es" ? "Envío estándar" : "Standard shipping",
    shippingPremium: locale === "es" ? "Envío premium" : "Premium shipping",
    shippingStandardEta: locale === "es" ? "Llega en 5 días" : "Arrives in 5 days",
    shippingPremiumEta: locale === "es" ? "Llega al día siguiente" : "Arrives next day",
    orderMerchandise: locale === "es" ? "Productos" : "Merchandise",
    shippingFee: locale === "es" ? "Costo de envío" : "Shipping",
    orderTotal: locale === "es" ? "Total" : "Total",
    payAndContinue: locale === "es" ? "Pagar y continuar" : "Pay and continue",
    completeOrder: locale === "es" ? "Completar pedido" : "Complete order",
    billingToggle:
      locale === "es" ? "La facturación es diferente al envío" : "Billing address is different",
    billingName: locale === "es" ? "Nombre de facturación" : "Billing full name",
    billingAddress: locale === "es" ? "Dirección de facturación" : "Billing address",
    billingCity: locale === "es" ? "Ciudad de facturación" : "Billing city",
    billingPostalCode: locale === "es" ? "Código postal de facturación" : "Billing postal code",
    shippingIntro:
      locale === "es"
        ? "Confirma envío y contacto antes de crear el PaymentIntent."
        : "Confirm shipping and contact details before creating the PaymentIntent.",
    paymentIntro:
      locale === "es"
        ? "El formulario real de pago vive aquí y usa Stripe Payment Intents con PaymentElement."
        : "The real payment form lives here and uses Stripe Payment Intents with PaymentElement.",
    reviewIntro:
      locale === "es"
        ? "El pago ya fue confirmado. Revisa el resumen final antes de cerrar el flujo."
        : "Payment has already been confirmed. Review the final summary before closing the flow.",
    completeIntro:
      locale === "es"
        ? "La orden quedó confirmada y el flujo está listo para escalar con webhooks después."
        : "The order is confirmed and the flow is ready to scale with webhooks later.",
    shippingRequired:
      locale === "es" ? "El nombre completo es obligatorio." : "Full name is required.",
    emailRequired: locale === "es" ? "Ingresa un correo válido." : "A valid email is required.",
    countryRequired: locale === "es" ? "Selecciona un país válido." : "Select a supported country.",
    cityRequired: locale === "es" ? "Selecciona una ciudad válida." : "Select a valid city.",
    streetRequired: locale === "es" ? "La calle es obligatoria." : "Street is required.",
    streetNumberRequired:
      locale === "es" ? "El número es obligatorio." : "Street number is required.",
    apartmentInvalid:
      locale === "es" ? "El dpto o suite es demasiado corto." : "Apartment or suite is too short.",
    referenceRequired:
      locale === "es" ? "Agrega una referencia de entrega." : "Add a delivery reference.",
    postalRequired:
      locale === "es"
        ? "El código postal no coincide con el país seleccionado."
        : "Postal code is invalid for the selected country.",
    shippingMethodRequired:
      locale === "es" ? "Selecciona un tipo de envío." : "Select a shipping method.",
    paymentMethodRequired:
      locale === "es" ? "Selecciona un método de pago." : "Select a payment method.",
    billingNameRequired:
      locale === "es"
        ? "El nombre de facturación es obligatorio."
        : "Billing full name is required.",
    billingAddressRequired:
      locale === "es"
        ? "La dirección de facturación es obligatoria."
        : "Billing address is required.",
    billingCityRequired:
      locale === "es" ? "La ciudad de facturación es obligatoria." : "Billing city is required.",
    billingPostalRequired:
      locale === "es"
        ? "El código postal de facturación es obligatorio."
        : "Billing postal code is required.",
    finalizationError:
      locale === "es"
        ? "No pudimos cerrar el pedido en este intento."
        : "We could not complete the order in this attempt.",
    statusReady:
      locale === "es"
        ? "El checkout ya separa creación del intent, confirmación y finalización."
        : "Checkout already separates intent creation, confirmation and final completion.",
    returnToStore: locale === "es" ? "Volver a la colección" : "Return to the collection",
  } as const;
  const primaryActionButtonClassName =
    "h-14 rounded-none bg-amber-700 px-8 text-sm font-semibold uppercase tracking-[0.2em] text-amber-50 hover:bg-amber-600 disabled:opacity-70 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200";
  const secondaryActionButtonClassName =
    "h-14 rounded-none border-border bg-transparent px-8 text-sm font-semibold uppercase tracking-[0.2em] hover:bg-accent dark:border-amber-500/20 dark:hover:bg-amber-500/10";
  const cityOptions = getCityOptions(state.shipping.country);
  const postalCodeHint = getPostalCodeHint(state.shipping.country);

  useEffect(() => {
    if (!hasHydrated || hasRestoredCheckoutRef.current || typeof window === "undefined") {
      return;
    }

    const restoredState = parsePersistedCheckoutState(
      window.sessionStorage.getItem(CHECKOUT_STORAGE_KEY),
    );

    if (restoredState) {
      dispatch({ type: "RESTORE_STATE", snapshot: restoredState });
    }

    hasRestoredCheckoutRef.current = true;
  }, [hasHydrated]);

  useEffect(() => {
    if (!hasHydrated || !hasRestoredCheckoutRef.current || typeof window === "undefined") {
      return;
    }

    if (state.submitSucceeded || state.step === "complete") {
      window.sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      return;
    }

    if (state.step === "shipping" && !items.length) {
      window.sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      return;
    }

    const snapshot: PersistedCheckoutState = {
      step: state.step,
      shipping: state.shipping,
      payment: state.payment,
      paymentIntentId: state.paymentIntentId,
      paymentIntentStatus: state.paymentIntentStatus,
      paymentError: state.paymentError,
      orderSnapshot: state.orderSnapshot,
    };

    window.sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(snapshot));
  }, [
    hasHydrated,
    items.length,
    state.orderSnapshot,
    state.payment,
    state.paymentError,
    state.paymentIntentId,
    state.paymentIntentStatus,
    state.shipping,
    state.step,
    state.submitSucceeded,
  ]);

  useEffect(() => {
    const requestedStep = searchParams.get("step");
    const paymentIntentId = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");

    if (
      !hasHydrated ||
      requestedStep !== "complete" ||
      !paymentIntentId ||
      state.submitSucceeded ||
      state.step === "complete"
    ) {
      return;
    }

    if (isFailedRedirectStatus(redirectStatus)) {
      dispatch({
        type: "PAYMENT_FAILED",
        message:
          locale === "es"
            ? "Stripe devolvió el pago como fallido. Revisa el método e inténtalo otra vez."
            : "Stripe returned the payment as failed. Review the method and try again.",
      });
      dispatch({ type: "GO_TO_STEP", step: "payment", allowed: true });
      return;
    }

    const snapshot = createOrderSnapshot(items, subtotal);

    dispatch({
      type: "PAYMENT_CONFIRMED",
      paymentIntentId,
      paymentIntentStatus: redirectStatus ?? "succeeded",
      snapshot,
    });
    dispatch({ type: "SUBMIT_SUCCESS" });
    clearCart();
  }, [
    clearCart,
    hasHydrated,
    items,
    locale,
    searchParams,
    state.step,
    state.submitSucceeded,
    subtotal,
  ]);

  function registerInputRef(field: CheckoutField) {
    return (node: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) => {
      inputRefs.current[field] = node;
    };
  }

  function focusFirstInvalidField(errors: CheckoutErrors, step: EditableCheckoutStep) {
    const firstInvalidField = stepFieldOrder[step].find((field) => errors[field]);

    if (!firstInvalidField || firstInvalidField === "payment.method") {
      return;
    }

    requestAnimationFrame(() => {
      inputRefs.current[firstInvalidField]?.focus();
    });
  }

  function localizeErrors(errors: CheckoutErrors): CheckoutErrors {
    const localized: CheckoutErrors = {};

    for (const field of Object.keys(errors) as CheckoutField[]) {
      switch (field) {
        case "shipping.fullName":
          localized[field] = labels.shippingRequired;
          break;
        case "shipping.email":
          localized[field] = labels.emailRequired;
          break;
        case "shipping.country":
          localized[field] = labels.countryRequired;
          break;
        case "shipping.city":
          localized[field] = labels.cityRequired;
          break;
        case "shipping.street":
          localized[field] = labels.streetRequired;
          break;
        case "shipping.streetNumber":
          localized[field] = labels.streetNumberRequired;
          break;
        case "shipping.apartment":
          localized[field] = labels.apartmentInvalid;
          break;
        case "shipping.reference":
          localized[field] = labels.referenceRequired;
          break;
        case "shipping.postalCode":
          localized[field] = labels.postalRequired;
          break;
        case "shipping.shippingMethod":
          localized[field] = labels.shippingMethodRequired;
          break;
        case "payment.method":
          localized[field] = labels.paymentMethodRequired;
          break;
        case "payment.billingFullName":
          localized[field] = labels.billingNameRequired;
          break;
        case "payment.billingAddress":
          localized[field] = labels.billingAddressRequired;
          break;
        case "payment.billingCity":
          localized[field] = labels.billingCityRequired;
          break;
        case "payment.billingPostalCode":
          localized[field] = labels.billingPostalRequired;
          break;
        default:
          localized[field] = errors[field];
      }
    }

    return localized;
  }

  function validateAndCommit(step: EditableCheckoutStep) {
    const errors = localizeErrors(validateCheckoutStep(state, step));
    dispatch({ type: "VALIDATE_STEP", step, errors });

    if (Object.keys(errors).length) {
      focusFirstInvalidField(errors, step);
      return false;
    }

    return true;
  }

  function handleGoToStep(target: CheckoutStep) {
    if (target === "complete" || state.step === "complete") {
      return;
    }

    const targetIndex = steps.indexOf(target);
    const currentIndex = steps.indexOf(state.step);

    if (target === "review" && !state.paymentIntentStatus) {
      return;
    }

    if (targetIndex <= currentIndex) {
      dispatch({ type: "GO_TO_STEP", step: target, allowed: true });
      return;
    }

    for (const step of editableSteps.slice(0, targetIndex)) {
      if (step === "payment" && !state.paymentIntentStatus) {
        return;
      }

      if (step !== "payment" && !validateAndCommit(step)) {
        dispatch({ type: "GO_TO_STEP", step, allowed: true });
        return;
      }
    }

    dispatch({ type: "GO_TO_STEP", step: target, allowed: true });
  }

  function handleShippingContinue() {
    const canProceed = validateAndCommit("shipping");
    dispatch({ type: "NEXT_STEP", canProceed });
  }

  async function handleCompleteOrder() {
    dispatch({ type: "SUBMIT_START" });

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      dispatch({ type: "SUBMIT_SUCCESS" });
      clearCart();
    } catch {
      dispatch({ type: "SUBMIT_ERROR", message: labels.finalizationError });
    }
  }

  function handlePaymentConfirmed(payload: {
    paymentIntentId: string;
    paymentIntentStatus: string;
  }) {
    if (!isSuccessfulPaymentStatus(payload.paymentIntentStatus)) {
      dispatch({
        type: "PAYMENT_FAILED",
        message:
          locale === "es"
            ? "El pago todavía no quedó confirmado. Inténtalo otra vez."
            : "The payment is not confirmed yet. Please try again.",
      });
      return;
    }

    dispatch({
      type: "PAYMENT_CONFIRMED",
      paymentIntentId: payload.paymentIntentId,
      paymentIntentStatus: payload.paymentIntentStatus,
      snapshot: createOrderSnapshot(items, subtotal),
    });
    dispatch({ type: "NEXT_STEP", canProceed: true });
  }

  const summaryItems = state.orderSnapshot?.items ?? items;
  const merchandiseSubtotal = state.orderSnapshot?.subtotal ?? subtotal;
  const shippingFeeCents = getShippingFeeCents(state.shipping.shippingMethod);
  const orderTotalCents = merchandiseSubtotal + shippingFeeCents;
  const paymentReference = (state.paymentIntentId ?? "pi_pending").toUpperCase();
  const paymentStatusTone =
    state.paymentIntentStatus === "succeeded" || state.paymentIntentStatus === "processing";

  if (!hasHydrated) {
    return (
      <div className="rounded-[2rem] border border-border bg-card/80 px-6 py-16 text-center dark:border-amber-500/10 dark:bg-card/70">
        <h1 className="text-5xl font-semibold">{copy.checkoutTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          {copy.checkoutLoading}
        </p>
      </div>
    );
  }

  if (!summaryItems.length && !state.submitSucceeded) {
    return (
      <div className="rounded-[2rem] border border-dashed border-border bg-card/80 px-6 py-16 text-center dark:border-amber-500/20 dark:bg-card/70">
        <h1 className="text-5xl font-semibold">{copy.checkoutTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          {copy.checkoutEmpty}
        </p>
        <Button asChild variant="outline" className={`mt-8 ${secondaryActionButtonClassName}`}>
          <Link href="/">{labels.returnToStore}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr]">
      <section className="space-y-6 rounded-[2rem] border border-border bg-card/80 p-6 dark:border-amber-500/10 dark:bg-card/75 sm:p-8 xl:px-9">
        <div className="space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-200">
            {copy.checkoutStateMachine}
          </p>
          <h1 className="text-5xl font-semibold">{copy.checkoutTitle}</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            {state.step === "shipping" && labels.shippingIntro}
            {state.step === "payment" && labels.paymentIntro}
            {state.step === "review" && labels.reviewIntro}
            {state.step === "complete" && labels.completeIntro}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <StepMarker
              key={step}
              current={state.step}
              target={step}
              label={labels[step]}
              onSelect={handleGoToStep}
            />
          ))}
        </div>

        {state.step === "shipping" ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="shipping-full-name" className="text-sm font-medium">
                  {labels.fullName}
                </label>
                <Input
                  id="shipping-full-name"
                  ref={registerInputRef("shipping.fullName")}
                  value={state.shipping.fullName}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "shipping.fullName",
                      value: event.target.value,
                    })
                  }
                  placeholder={labels.fullName}
                  aria-invalid={state.errors["shipping.fullName"] ? "true" : "false"}
                  aria-describedby={
                    state.errors["shipping.fullName"] ? "shipping-full-name-error" : undefined
                  }
                />
                {state.errors["shipping.fullName"] ? (
                  <p id="shipping-full-name-error" className="text-sm text-destructive">
                    {state.errors["shipping.fullName"]}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="shipping-email" className="text-sm font-medium">
                  {labels.email}
                </label>
                <Input
                  id="shipping-email"
                  ref={registerInputRef("shipping.email")}
                  type="email"
                  value={state.shipping.email}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "shipping.email",
                      value: event.target.value,
                    })
                  }
                  placeholder={labels.email}
                  aria-invalid={state.errors["shipping.email"] ? "true" : "false"}
                  aria-describedby={
                    state.errors["shipping.email"] ? "shipping-email-error" : undefined
                  }
                />
                {state.errors["shipping.email"] ? (
                  <p id="shipping-email-error" className="text-sm text-destructive">
                    {state.errors["shipping.email"]}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="shipping-country" className="text-sm font-medium">
                  {labels.country}
                </label>
                <select
                  id="shipping-country"
                  ref={registerInputRef("shipping.country")}
                  value={state.shipping.country}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "shipping.country",
                      value: event.target.value,
                    })
                  }
                  aria-invalid={state.errors["shipping.country"] ? "true" : "false"}
                  aria-describedby={
                    state.errors["shipping.country"] ? "shipping-country-error" : undefined
                  }
                  className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                  <option value="" disabled>
                    {labels.chooseCountry}
                  </option>
                  {SHIPPING_COUNTRIES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {state.errors["shipping.country"] ? (
                  <p id="shipping-country-error" className="text-sm text-destructive">
                    {state.errors["shipping.country"]}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="shipping-city" className="text-sm font-medium">
                  {labels.city}
                </label>
                <select
                  id="shipping-city"
                  ref={registerInputRef("shipping.city")}
                  value={state.shipping.city}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "shipping.city",
                      value: event.target.value,
                    })
                  }
                  aria-invalid={state.errors["shipping.city"] ? "true" : "false"}
                  aria-describedby={
                    state.errors["shipping.city"] ? "shipping-city-error" : undefined
                  }
                  className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                >
                  <option value="" disabled>
                    {labels.chooseCity}
                  </option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {state.errors["shipping.city"] ? (
                  <p id="shipping-city-error" className="text-sm text-destructive">
                    {state.errors["shipping.city"]}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="shipping-street" className="text-sm font-medium">
                  {labels.street}
                </label>
                <Input
                  id="shipping-street"
                  ref={registerInputRef("shipping.street")}
                  value={state.shipping.street}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "shipping.street",
                      value: event.target.value,
                    })
                  }
                  placeholder={labels.street}
                  aria-invalid={state.errors["shipping.street"] ? "true" : "false"}
                  aria-describedby={
                    state.errors["shipping.street"] ? "shipping-street-error" : undefined
                  }
                />
                {state.errors["shipping.street"] ? (
                  <p id="shipping-street-error" className="text-sm text-destructive">
                    {state.errors["shipping.street"]}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="shipping-street-number" className="text-sm font-medium">
                  {labels.streetNumber}
                </label>
                <Input
                  id="shipping-street-number"
                  ref={registerInputRef("shipping.streetNumber")}
                  value={state.shipping.streetNumber}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "shipping.streetNumber",
                      value: event.target.value,
                    })
                  }
                  placeholder={labels.streetNumber}
                  aria-invalid={state.errors["shipping.streetNumber"] ? "true" : "false"}
                  aria-describedby={
                    state.errors["shipping.streetNumber"]
                      ? "shipping-street-number-error"
                      : undefined
                  }
                />
                {state.errors["shipping.streetNumber"] ? (
                  <p id="shipping-street-number-error" className="text-sm text-destructive">
                    {state.errors["shipping.streetNumber"]}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="shipping-apartment" className="text-sm font-medium">
                  {labels.apartment}
                </label>
                <Input
                  id="shipping-apartment"
                  ref={registerInputRef("shipping.apartment")}
                  value={state.shipping.apartment}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "shipping.apartment",
                      value: event.target.value,
                    })
                  }
                  placeholder={labels.apartment}
                  aria-invalid={state.errors["shipping.apartment"] ? "true" : "false"}
                  aria-describedby={
                    state.errors["shipping.apartment"] ? "shipping-apartment-error" : undefined
                  }
                />
                {state.errors["shipping.apartment"] ? (
                  <p id="shipping-apartment-error" className="text-sm text-destructive">
                    {state.errors["shipping.apartment"]}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor="shipping-postal-code" className="text-sm font-medium">
                  {labels.postalCode}
                </label>
                <Input
                  id="shipping-postal-code"
                  ref={registerInputRef("shipping.postalCode")}
                  value={state.shipping.postalCode}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "shipping.postalCode",
                      value: event.target.value,
                    })
                  }
                  placeholder={postalCodeHint}
                  inputMode="text"
                  aria-invalid={state.errors["shipping.postalCode"] ? "true" : "false"}
                  aria-describedby={
                    state.errors["shipping.postalCode"] ? "shipping-postal-code-error" : undefined
                  }
                />
                {state.errors["shipping.postalCode"] ? (
                  <p id="shipping-postal-code-error" className="text-sm text-destructive">
                    {state.errors["shipping.postalCode"]}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="shipping-reference" className="text-sm font-medium">
                  {labels.reference}
                </label>
                <textarea
                  id="shipping-reference"
                  ref={registerInputRef("shipping.reference")}
                  value={state.shipping.reference}
                  onChange={(event) =>
                    dispatch({
                      type: "SET_FIELD",
                      field: "shipping.reference",
                      value: event.target.value,
                    })
                  }
                  placeholder={labels.reference}
                  rows={3}
                  aria-invalid={state.errors["shipping.reference"] ? "true" : "false"}
                  aria-describedby={
                    state.errors["shipping.reference"] ? "shipping-reference-error" : undefined
                  }
                  className="dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                />
                {state.errors["shipping.reference"] ? (
                  <p id="shipping-reference-error" className="text-sm text-destructive">
                    {state.errors["shipping.reference"]}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{labels.shippingMethodTitle}</p>
                <p className="text-sm text-muted-foreground">
                  {locale === "es"
                    ? "Selecciona la velocidad de entrega para cerrar el total."
                    : "Choose the delivery speed to finalize the total."}
                </p>
              </div>

              <div
                className="grid gap-3 md:grid-cols-2"
                role="radiogroup"
                aria-label={labels.shippingMethodTitle}
              >
                {SHIPPING_METHODS.map((method) => {
                  const selected = state.shipping.shippingMethod === method.code;
                  const title =
                    method.code === "standard" ? labels.shippingStandard : labels.shippingPremium;
                  const eta =
                    method.code === "standard"
                      ? labels.shippingStandardEta
                      : labels.shippingPremiumEta;

                  return (
                    <button
                      key={method.code}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "shipping.shippingMethod",
                          value: method.code,
                        })
                      }
                      className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                        selected
                          ? "border-amber-700 bg-amber-700/8 dark:border-amber-300 dark:bg-amber-300/10"
                          : "border-border bg-background/60 hover:bg-accent dark:border-amber-500/10 dark:bg-background/30 dark:hover:bg-amber-500/8"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">{title}</p>
                          <p className="text-sm text-muted-foreground">{eta}</p>
                        </div>
                        <Price
                          amountCents={method.priceCents}
                          className="text-base font-semibold text-foreground"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {state.errors["shipping.shippingMethod"] ? (
                <p className="text-sm text-destructive">
                  {state.errors["shipping.shippingMethod"]}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {state.step === "payment" ? (
          <CheckoutPaymentStep
            items={items.map((item) => ({
              id: item.productId,
              name: item.name,
              price: item.priceCents,
              quantity: item.quantity,
              size: item.size,
            }))}
            shipping={state.shipping}
            clientSecret={state.clientSecret}
            paymentIntentStatus={state.paymentIntentStatus}
            paymentError={state.paymentError}
            onPaymentIntentCreated={(clientSecret) =>
              dispatch({ type: "PAYMENT_INTENT_CREATED", clientSecret })
            }
            onPaymentConfirmed={handlePaymentConfirmed}
            onPaymentFailed={(message) => dispatch({ type: "PAYMENT_FAILED", message })}
            payLabel={labels.payAndContinue}
            locale={locale}
          />
        ) : null}

        {state.step === "review" ? (
          <div className="space-y-5 rounded-3xl border border-border bg-background/60 p-5 dark:border-amber-500/10 dark:bg-background/40">
            <p className="text-sm font-medium">{labels.reviewTitle}</p>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="h-full rounded-2xl border border-border bg-card/80 p-5 dark:border-amber-500/10 dark:bg-card/70">
                <p className="text-sm font-medium">{labels.shippingTitle}</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {state.shipping.fullName}
                  <br />
                  {state.shipping.email}
                  <br />
                  {formatShippingAddress(state.shipping).map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                  <br />
                  {state.shipping.city}, {state.shipping.postalCode}
                  <br />
                  {
                    SHIPPING_COUNTRIES.find((country) => country.code === state.shipping.country)
                      ?.name
                  }
                  <br />
                  {state.shipping.shippingMethod === "standard"
                    ? labels.shippingStandard
                    : labels.shippingPremium}
                </p>
              </div>

              <div className="h-full rounded-2xl border border-border bg-card/80 p-5 dark:border-amber-500/10 dark:bg-card/70">
                <p className="text-sm font-medium">{labels.paymentTitle}</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-amber-700/20 bg-amber-700/8 px-4 py-3 dark:border-amber-300/20 dark:bg-amber-300/10">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-200">
                      {locale === "es" ? "Código de compra" : "Purchase code"}
                    </p>
                    <p className="mt-2 break-all font-mono text-sm font-medium text-foreground">
                      {paymentReference}
                    </p>
                  </div>

                  <div
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                      paymentStatusTone
                        ? "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300"
                        : "bg-amber-700/10 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200"
                    }`}
                  >
                    {paymentStatusTone
                      ? locale === "es"
                        ? "Pagado"
                        : "Paid"
                      : (state.paymentIntentStatus ?? "Pending")}
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {locale === "es"
                      ? "El pago fue autorizado y este código identifica la compra para seguimiento y soporte."
                      : "Payment was authorized and this code identifies the purchase for support and tracking."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card/80 p-5 dark:border-amber-500/10 dark:bg-card/70">
              <p className="text-sm font-medium">{copy.checkoutOrderSummary}</p>
              <div className="mt-4 space-y-3">
                {summaryItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                    <div className="space-y-1">
                      <p>{item.name}</p>
                      <p className="text-muted-foreground">
                        {item.quantity} x size {item.size}
                      </p>
                    </div>
                    <Price amountCents={item.priceCents * item.quantity} className="font-medium" />
                  </div>
                ))}
                <div className="flex items-center justify-between gap-4 border-t border-border pt-3 text-sm dark:border-amber-500/10">
                  <span className="text-muted-foreground">{labels.shippingFee}</span>
                  <Price amountCents={shippingFeeCents} className="font-medium" />
                </div>
                <div className="flex items-center justify-between gap-4 text-sm font-medium">
                  <span>{labels.orderTotal}</span>
                  <Price amountCents={orderTotalCents} />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {state.step === "complete" ? (
          <div className="rounded-3xl border border-border bg-card/80 p-6 dark:border-amber-500/10 dark:bg-amber-500/8">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-200">
              {labels.complete}
            </p>
            <div className="mt-5 inline-flex size-14 items-center justify-center rounded-full border border-amber-700/20 bg-amber-700/8 text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-200">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="mt-5 font-[family-name:var(--font-display)] text-4xl font-semibold">
              {copy.checkoutOrderConfirmed}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{labels.completeIntro}</p>
            <p className="mt-3 text-sm leading-7 text-foreground/85 dark:text-foreground/80">
              {state.shipping.email
                ? locale === "es"
                  ? `Te enviamos el recibo a ${state.shipping.email}.`
                  : `We sent the receipt to ${state.shipping.email}.`
                : locale === "es"
                  ? "Pago confirmado. Puedes ver tu recibo en tu banco."
                  : "Payment confirmed. You can view your receipt in your bank."}
            </p>
            <div className="mt-6 space-y-4 rounded-2xl border border-border bg-background/60 p-4 dark:border-amber-500/10 dark:bg-background/30">
              <div className="rounded-2xl border border-amber-700/20 bg-amber-700/8 px-4 py-3 dark:border-amber-300/20 dark:bg-amber-300/10">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-200">
                  {locale === "es" ? "Código de compra" : "Purchase code"}
                </p>
                <p className="mt-2 break-all font-mono text-sm font-medium text-foreground">
                  {paymentReference}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300">
                  {locale === "es" ? "Pago exitoso" : "Payment successful"}
                </div>
                <span className="text-sm text-muted-foreground">
                  {locale === "es"
                    ? "Tu pago fue autorizado y la compra ya quedó confirmada."
                    : "Your payment was authorized and the purchase is now confirmed."}
                </span>
              </div>
            </div>
            <Button asChild className={`mt-6 w-full ${primaryActionButtonClassName}`}>
              <Link href="/">
                {copy.cartReturn}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        ) : null}

        <div
          className={state.step === "review" ? "grid gap-3 sm:grid-cols-2" : "flex flex-wrap gap-3"}
        >
          {state.step !== "shipping" && state.step !== "complete" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: "PREV_STEP" })}
              className={
                state.step === "review"
                  ? `w-full ${secondaryActionButtonClassName}`
                  : secondaryActionButtonClassName
              }
            >
              {copy.checkoutBack}
            </Button>
          ) : null}

          {state.step === "shipping" ? (
            <Button
              type="button"
              data-testid="checkout-next"
              onClick={handleShippingContinue}
              className={`w-full ${primaryActionButtonClassName}`}
            >
              <ArrowRight className="size-4" />
              {copy.checkoutContinue}
            </Button>
          ) : null}

          {state.step === "review" ? (
            <Button
              type="button"
              data-testid="checkout-submit"
              onClick={() => void handleCompleteOrder()}
              disabled={state.isSubmitting}
              className={`w-full ${primaryActionButtonClassName}`}
            >
              {state.isSubmitting ? (
                <ArrowRight className="size-4 animate-pulse" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {labels.completeOrder}
            </Button>
          ) : null}
        </div>

        {state.submitError ? <p className="text-sm text-destructive">{state.submitError}</p> : null}
      </section>

      <aside className="h-fit rounded-[2rem] border border-border bg-card/80 p-6 dark:border-amber-500/10 dark:bg-card/75 sm:p-8 lg:sticky lg:top-28">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-amber-700 dark:text-amber-200">
          {copy.checkoutOrderSummary}
        </p>

        <div className="mt-4 rounded-3xl border border-border bg-background/60 px-4 py-4 dark:border-amber-500/10 dark:bg-background/30">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="size-4" />
            {labels[state.step]}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{labels.statusReady}</p>
        </div>

        <div className="mt-6 space-y-4">
          {summaryItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
              <div className="space-y-1">
                <p>{item.name}</p>
                <p className="text-muted-foreground">
                  {item.quantity} x size {item.size}
                </p>
              </div>
              <Price amountCents={item.priceCents * item.quantity} className="font-medium" />
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-border pt-6 dark:border-amber-500/10">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{labels.orderMerchandise}</span>
            <Price amountCents={merchandiseSubtotal} className="font-medium" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{labels.shippingFee}</span>
            <Price amountCents={shippingFeeCents} className="font-medium" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-foreground">{labels.orderTotal}</span>
            <Price amountCents={orderTotalCents} className="text-2xl font-semibold" />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-background/60 px-4 py-4 text-sm text-muted-foreground dark:border-amber-500/10 dark:bg-background/30">
          <p className="inline-flex items-center gap-2 font-medium text-foreground">
            <ShieldCheck className="size-4" />
            Stripe-ready
          </p>
          <p className="mt-2 leading-6">
            {locale === "es"
              ? "El flujo ya separa creación del PaymentIntent, confirmación del pago y cierre del pedido para poder añadir webhooks y reconciliación sin rehacer el reducer."
              : "The flow already separates PaymentIntent creation, payment confirmation and order finalization so webhooks and reconciliation can be added without rewriting the reducer."}
          </p>
        </div>
      </aside>
    </div>
  );
}
