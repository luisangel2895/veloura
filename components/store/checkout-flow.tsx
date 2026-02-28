"use client";

import { useReducer, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  MapPin,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { useLanguage } from "@/components/providers/language-provider";
import { Price } from "@/components/store/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";

type CheckoutStep = "shipping" | "payment" | "review" | "complete";
type EditableCheckoutStep = Exclude<CheckoutStep, "complete">;
type PaymentMethod = "card" | "link" | "bank_transfer";
type CheckoutField =
  | "shipping.fullName"
  | "shipping.email"
  | "shipping.address"
  | "shipping.city"
  | "shipping.postalCode"
  | "payment.method"
  | "payment.billingSameAsShipping"
  | "payment.billingFullName"
  | "payment.billingAddress"
  | "payment.billingCity"
  | "payment.billingPostalCode";
type CheckoutErrors = Partial<Record<CheckoutField, string>>;

interface ShippingForm {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

interface PaymentForm {
  method: PaymentMethod | "";
  billingSameAsShipping: boolean;
  billingFullName: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
}

interface CheckoutState {
  step: CheckoutStep;
  shipping: ShippingForm;
  payment: PaymentForm;
  errors: CheckoutErrors;
  isSubmitting: boolean;
  submitError: string | null;
  submitSucceeded: boolean;
}

type CheckoutAction =
  | { type: "SET_FIELD"; field: CheckoutField; value: string | boolean }
  | { type: "NEXT_STEP"; canProceed: boolean }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; step: CheckoutStep; allowed: boolean }
  | { type: "VALIDATE_STEP"; step: EditableCheckoutStep; errors: CheckoutErrors }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; message: string };

const steps: CheckoutStep[] = ["shipping", "payment", "review", "complete"];
const editableSteps: EditableCheckoutStep[] = ["shipping", "payment", "review"];
const stepFieldOrder: Record<EditableCheckoutStep, CheckoutField[]> = {
  shipping: [
    "shipping.fullName",
    "shipping.email",
    "shipping.address",
    "shipping.city",
    "shipping.postalCode",
  ],
  payment: [
    "payment.method",
    "payment.billingFullName",
    "payment.billingAddress",
    "payment.billingCity",
    "payment.billingPostalCode",
  ],
  review: [],
};

const initialState: CheckoutState = {
  step: "shipping",
  shipping: {
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  },
  payment: {
    method: "",
    billingSameAsShipping: true,
    billingFullName: "",
    billingAddress: "",
    billingCity: "",
    billingPostalCode: "",
  },
  errors: {},
  isSubmitting: false,
  submitError: null,
  submitSucceeded: false,
};

function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);
}

function nextStep(current: CheckoutStep): CheckoutStep {
  return steps[Math.min(steps.indexOf(current) + 1, steps.length - 1)];
}

function previousStep(current: CheckoutStep): CheckoutStep {
  return steps[Math.max(steps.indexOf(current) - 1, 0)];
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Clears only the errors that belong to the validated step before applying new ones.
 */
function mergeStepErrors(
  existingErrors: CheckoutErrors,
  step: EditableCheckoutStep,
  nextStepErrors: CheckoutErrors,
) {
  const merged: CheckoutErrors = { ...existingErrors };

  for (const field of stepFieldOrder[step]) {
    delete merged[field];
  }

  return {
    ...merged,
    ...nextStepErrors,
  };
}

/**
 * Validates the active step only, so transitions remain deterministic and focusable.
 */
function validateCurrentStep(state: CheckoutState, step: EditableCheckoutStep): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (step === "shipping") {
    if (!state.shipping.fullName.trim()) {
      errors["shipping.fullName"] = "Full name is required.";
    }
    if (!validateEmail(state.shipping.email)) {
      errors["shipping.email"] = "A valid email is required.";
    }
    if (!state.shipping.address.trim()) {
      errors["shipping.address"] = "Address is required.";
    }
    if (!state.shipping.city.trim()) {
      errors["shipping.city"] = "City is required.";
    }
    if (!state.shipping.postalCode.trim()) {
      errors["shipping.postalCode"] = "Postal code is required.";
    }

    return errors;
  }

  if (!state.payment.method) {
    errors["payment.method"] = "Select a payment method.";
  }

  if (!state.payment.billingSameAsShipping) {
    if (!state.payment.billingFullName.trim()) {
      errors["payment.billingFullName"] = "Billing full name is required.";
    }
    if (!state.payment.billingAddress.trim()) {
      errors["payment.billingAddress"] = "Billing address is required.";
    }
    if (!state.payment.billingCity.trim()) {
      errors["payment.billingCity"] = "Billing city is required.";
    }
    if (!state.payment.billingPostalCode.trim()) {
      errors["payment.billingPostalCode"] = "Billing postal code is required.";
    }
  }

  return errors;
}

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case "SET_FIELD": {
      const nextErrors = { ...state.errors };
      delete nextErrors[action.field];

      switch (action.field) {
        case "shipping.fullName":
          return {
            ...state,
            shipping: { ...state.shipping, fullName: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.email":
          return {
            ...state,
            shipping: { ...state.shipping, email: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.address":
          return {
            ...state,
            shipping: { ...state.shipping, address: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.city":
          return {
            ...state,
            shipping: { ...state.shipping, city: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.postalCode":
          return {
            ...state,
            shipping: { ...state.shipping, postalCode: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "payment.method":
          return {
            ...state,
            payment: { ...state.payment, method: action.value as PaymentMethod },
            errors: nextErrors,
            submitError: null,
          };
        case "payment.billingSameAsShipping":
          if (Boolean(action.value)) {
            delete nextErrors["payment.billingFullName"];
            delete nextErrors["payment.billingAddress"];
            delete nextErrors["payment.billingCity"];
            delete nextErrors["payment.billingPostalCode"];
          }

          return {
            ...state,
            payment: {
              ...state.payment,
              billingSameAsShipping: Boolean(action.value),
            },
            errors: nextErrors,
            submitError: null,
          };
        case "payment.billingFullName":
          return {
            ...state,
            payment: { ...state.payment, billingFullName: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "payment.billingAddress":
          return {
            ...state,
            payment: { ...state.payment, billingAddress: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "payment.billingCity":
          return {
            ...state,
            payment: { ...state.payment, billingCity: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "payment.billingPostalCode":
          return {
            ...state,
            payment: { ...state.payment, billingPostalCode: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        default:
          return assertNever(action.field);
      }
    }
    case "VALIDATE_STEP":
      return {
        ...state,
        errors: mergeStepErrors(state.errors, action.step, action.errors),
      };
    case "NEXT_STEP":
      if (!action.canProceed || state.step === "complete") {
        return state;
      }

      return {
        ...state,
        step: nextStep(state.step),
      };
    case "PREV_STEP":
      if (state.step === "shipping" || state.step === "complete") {
        return state;
      }

      return {
        ...state,
        step: previousStep(state.step),
        submitError: null,
      };
    case "GO_TO_STEP":
      if (!action.allowed || state.step === "complete") {
        return state;
      }

      return {
        ...state,
        step: action.step,
        submitError: null,
      };
    case "SUBMIT_START":
      return {
        ...state,
        isSubmitting: true,
        submitError: null,
      };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        step: "complete",
        isSubmitting: false,
        submitError: null,
        submitSucceeded: true,
      };
    case "SUBMIT_ERROR":
      return {
        ...state,
        isSubmitting: false,
        submitError: action.message,
      };
    default:
      return assertNever(action);
  }
}

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
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors disabled:cursor-default disabled:opacity-100 ${
        isCurrent
          ? "border-amber-700 bg-amber-700/8 dark:border-amber-300 dark:bg-amber-300/10"
          : "border-border bg-background/60 hover:bg-accent dark:border-amber-500/10 dark:bg-background/30 dark:hover:bg-amber-500/8"
      }`}
    >
      <span
        className={`inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold ${
          active
            ? "border-amber-700 bg-amber-700 text-amber-50 dark:border-amber-300 dark:bg-amber-300 dark:text-zinc-950"
            : "border-border text-muted-foreground dark:border-amber-500/20"
        }`}
      >
        {targetIndex + 1}
      </span>
      <span className={`text-sm ${active ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </button>
  );
}

export function CheckoutFlow() {
  const { copy, locale } = useLanguage();
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const hasHydrated = useCart((cart) => cart.hasHydrated);
  const { items, subtotal, clearCart } = useCart((cart) => ({
    items: cart.items,
    subtotal: cart.subtotal,
    clearCart: cart.clearCart,
  }));
  const inputRefs = useRef<Partial<Record<CheckoutField, HTMLInputElement | null>>>({});
  const paymentMethodRefs = useRef<Partial<Record<PaymentMethod, HTMLButtonElement | null>>>({});

  const labels = {
    shipping: locale === "es" ? "Envío" : "Shipping",
    payment: locale === "es" ? "Pago" : "Payment",
    review: locale === "es" ? "Revisión" : "Review",
    complete: locale === "es" ? "Completo" : "Complete",
    shippingTitle: locale === "es" ? "Entrega y contacto" : "Shipping and contact",
    paymentTitle: locale === "es" ? "Método de pago" : "Payment method",
    reviewTitle: locale === "es" ? "Revisión final" : "Final review",
    fullName: locale === "es" ? "Nombre completo" : "Full name",
    email: "Email",
    address: locale === "es" ? "Dirección" : "Address",
    city: locale === "es" ? "Ciudad" : "City",
    postalCode: locale === "es" ? "Código postal" : "Postal code",
    billingToggle:
      locale === "es" ? "La facturación es diferente al envío" : "Billing address is different",
    billingName: locale === "es" ? "Nombre de facturación" : "Billing full name",
    billingAddress: locale === "es" ? "Dirección de facturación" : "Billing address",
    billingCity: locale === "es" ? "Ciudad de facturación" : "Billing city",
    billingPostalCode:
      locale === "es" ? "Código postal de facturación" : "Billing postal code",
    paymentSelect: locale === "es" ? "Selecciona un método" : "Select a payment method",
    shippingIntro:
      locale === "es"
        ? "Confirma envío y contacto antes de pasar al método de pago."
        : "Confirm shipping and contact details before moving to payment.",
    paymentIntro:
      locale === "es"
        ? "El método elegido queda desacoplado del SDK final para conectar Stripe después sin rehacer el flujo."
        : "The selected method stays decoupled from the final SDK so Stripe can be connected later without rewriting the flow.",
    reviewIntro:
      locale === "es"
        ? "Verifica el resumen completo antes de enviar la autorización simulada."
        : "Review the full summary before sending the simulated authorization.",
    completeIntro:
      locale === "es"
        ? "La orden recorrió cada estado del reducer y quedó lista para integrar confirmación real."
        : "The order moved through every reducer state and is now ready for a real payment confirmation integration.",
    secureNote:
      locale === "es"
        ? "Los campos finales de tarjeta se conectarán al SDK de Stripe en la integración real."
        : "Final card fields will connect to the Stripe SDK in the real integration.",
    sameAsShipping: locale === "es" ? "Usar mismos datos de envío" : "Use shipping details",
    separateBilling: locale === "es" ? "Facturación separada" : "Separate billing address",
    primaryError:
      locale === "es"
        ? "No pudimos completar la autorización simulada."
        : "We could not complete the simulated authorization.",
    shippingRequired:
      locale === "es" ? "El nombre completo es obligatorio." : "Full name is required.",
    emailRequired:
      locale === "es" ? "Ingresa un correo válido." : "A valid email is required.",
    addressRequired:
      locale === "es" ? "La dirección es obligatoria." : "Address is required.",
    cityRequired: locale === "es" ? "La ciudad es obligatoria." : "City is required.",
    postalRequired:
      locale === "es" ? "El código postal es obligatorio." : "Postal code is required.",
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
      locale === "es"
        ? "La ciudad de facturación es obligatoria."
        : "Billing city is required.",
    billingPostalRequired:
      locale === "es"
        ? "El código postal de facturación es obligatorio."
        : "Billing postal code is required.",
  } as const;

  function registerInputRef(field: CheckoutField) {
    return (node: HTMLInputElement | null) => {
      inputRefs.current[field] = node;
    };
  }

  function focusFirstInvalidField(errors: CheckoutErrors, step: EditableCheckoutStep) {
    const firstInvalidField = stepFieldOrder[step].find((field) => errors[field]);

    if (!firstInvalidField) {
      return;
    }

    if (firstInvalidField === "payment.method") {
      requestAnimationFrame(() => {
        paymentMethodRefs.current.card?.focus();
      });
      return;
    }

    requestAnimationFrame(() => {
      inputRefs.current[firstInvalidField]?.focus();
    });
  }

  function localizedStepErrors(step: EditableCheckoutStep): CheckoutErrors {
    const errors = validateCurrentStep(state, step);

    if (!Object.keys(errors).length) {
      return errors;
    }

    const localized: CheckoutErrors = {};

    for (const [field, message] of Object.entries(errors) as Array<[CheckoutField, string]>) {
      switch (field) {
        case "shipping.fullName":
          localized[field] = labels.shippingRequired;
          break;
        case "shipping.email":
          localized[field] = labels.emailRequired;
          break;
        case "shipping.address":
          localized[field] = labels.addressRequired;
          break;
        case "shipping.city":
          localized[field] = labels.cityRequired;
          break;
        case "shipping.postalCode":
          localized[field] = labels.postalRequired;
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
          localized[field] = message;
      }
    }

    return localized;
  }

  function validateAndCommit(step: EditableCheckoutStep) {
    const errors = localizedStepErrors(step);
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

    const currentIndex = steps.indexOf(state.step);
    const targetIndex = steps.indexOf(target);

    if (targetIndex <= currentIndex) {
      dispatch({ type: "GO_TO_STEP", step: target, allowed: true });
      return;
    }

    for (const step of editableSteps.slice(0, targetIndex)) {
      if (!validateAndCommit(step)) {
        dispatch({ type: "GO_TO_STEP", step, allowed: true });
        return;
      }
    }

    dispatch({ type: "GO_TO_STEP", step: target, allowed: true });
  }

  function handleNextStep() {
    if (state.step === "complete") {
      return;
    }

    if (state.step === "review") {
      void handleSubmit();
      return;
    }

    const canProceed = validateAndCommit(state.step);
    dispatch({ type: "NEXT_STEP", canProceed });
  }

  async function handleSubmit() {
    const shippingValid = validateAndCommit("shipping");
    const paymentValid = validateAndCommit("payment");

    if (!shippingValid) {
      dispatch({ type: "GO_TO_STEP", step: "shipping", allowed: true });
      return;
    }

    if (!paymentValid) {
      dispatch({ type: "GO_TO_STEP", step: "payment", allowed: true });
      return;
    }

    dispatch({ type: "SUBMIT_START" });

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      dispatch({ type: "SUBMIT_SUCCESS" });
      clearCart();
    } catch {
      dispatch({ type: "SUBMIT_ERROR", message: labels.primaryError });
    }
  }

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

  if (!items.length && !state.submitSucceeded) {
    return (
      <div className="rounded-[2rem] border border-dashed border-border bg-card/80 px-6 py-16 text-center dark:border-amber-500/20 dark:bg-card/70">
        <h1 className="text-5xl font-semibold">{copy.checkoutTitle}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          {copy.checkoutEmpty}
        </p>
        <Button
          asChild
          className="mt-8 rounded-full bg-amber-700 text-amber-50 hover:bg-amber-600 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
        >
          <Link href="/">{copy.checkoutBrowse}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6 rounded-[2rem] border border-border bg-card/80 p-6 dark:border-amber-500/10 dark:bg-card/75 sm:p-8">
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
          <StepMarker
            current={state.step}
            target="shipping"
            label={labels.shipping}
            onSelect={handleGoToStep}
          />
          <StepMarker
            current={state.step}
            target="payment"
            label={labels.payment}
            onSelect={handleGoToStep}
          />
          <StepMarker
            current={state.step}
            target="review"
            label={labels.review}
            onSelect={handleGoToStep}
          />
          <StepMarker
            current={state.step}
            target="complete"
            label={labels.complete}
            onSelect={handleGoToStep}
          />
        </div>

        {state.step === "shipping" ? (
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

            <div className="space-y-2 sm:col-span-2">
              <label htmlFor="shipping-address" className="text-sm font-medium">
                {labels.address}
              </label>
              <Input
                id="shipping-address"
                ref={registerInputRef("shipping.address")}
                value={state.shipping.address}
                onChange={(event) =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "shipping.address",
                    value: event.target.value,
                  })
                }
                placeholder={labels.address}
                aria-invalid={state.errors["shipping.address"] ? "true" : "false"}
                aria-describedby={
                  state.errors["shipping.address"] ? "shipping-address-error" : undefined
                }
              />
              {state.errors["shipping.address"] ? (
                <p id="shipping-address-error" className="text-sm text-destructive">
                  {state.errors["shipping.address"]}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="shipping-city" className="text-sm font-medium">
                {labels.city}
              </label>
              <Input
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
                placeholder={labels.city}
                aria-invalid={state.errors["shipping.city"] ? "true" : "false"}
                aria-describedby={
                  state.errors["shipping.city"] ? "shipping-city-error" : undefined
                }
              />
              {state.errors["shipping.city"] ? (
                <p id="shipping-city-error" className="text-sm text-destructive">
                  {state.errors["shipping.city"]}
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
                placeholder={labels.postalCode}
                inputMode="numeric"
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
          </div>
        ) : null}

        {state.step === "payment" ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium">{labels.paymentSelect}</p>
              <div
                className="grid gap-3 sm:grid-cols-3"
                role="group"
                aria-describedby={state.errors["payment.method"] ? "payment-method-error" : undefined}
              >
                {[
                  { id: "card" as PaymentMethod, label: "Card", icon: CreditCard },
                  { id: "link" as PaymentMethod, label: "Link", icon: Wallet },
                  { id: "bank_transfer" as PaymentMethod, label: "Bank transfer", icon: Landmark },
                ].map((method) => {
                  const active = state.payment.method === method.id;
                  const Icon = method.icon;

                  return (
                    <button
                      key={method.id}
                      ref={(node) => {
                        paymentMethodRefs.current[method.id] = node;
                      }}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "payment.method",
                          value: method.id,
                        })
                      }
                      className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors ${
                        active
                          ? "border-amber-700 bg-amber-700/8 dark:border-amber-300 dark:bg-amber-300/10"
                          : "border-border bg-background/60 hover:bg-accent dark:border-amber-500/10 dark:bg-background/30 dark:hover:bg-amber-500/8"
                      }`}
                    >
                      <span className="inline-flex items-center gap-3">
                        <Icon className="size-4" />
                        <span className="text-sm font-medium">{method.label}</span>
                      </span>
                      <span
                        className={`size-2.5 rounded-full ${
                          active ? "bg-amber-700 dark:bg-amber-300" : "bg-border"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              {state.errors["payment.method"] ? (
                <p id="payment-method-error" className="text-sm text-destructive">
                  {state.errors["payment.method"]}
                </p>
              ) : null}
              <p className="text-sm leading-7 text-muted-foreground">{labels.secureNote}</p>
            </div>

            <div className="rounded-3xl border border-border bg-background/60 p-5 dark:border-amber-500/10 dark:bg-background/30">
              <button
                type="button"
                role="switch"
                aria-checked={!state.payment.billingSameAsShipping}
                onClick={() =>
                  dispatch({
                    type: "SET_FIELD",
                    field: "payment.billingSameAsShipping",
                    value: !state.payment.billingSameAsShipping,
                  })
                }
                className="flex w-full items-center justify-between gap-4 text-left"
              >
                <span className="text-sm font-medium">{labels.billingToggle}</span>
                <span
                  className={`inline-flex h-7 w-12 items-center rounded-full border p-1 transition-colors ${
                    state.payment.billingSameAsShipping
                      ? "border-border bg-background dark:border-amber-500/10 dark:bg-background/30"
                      : "border-amber-700 bg-amber-700/10 dark:border-amber-300 dark:bg-amber-300/10"
                  }`}
                >
                  <span
                    className={`size-5 rounded-full transition-transform ${
                      state.payment.billingSameAsShipping
                        ? "translate-x-0 bg-muted-foreground"
                        : "translate-x-5 bg-amber-700 dark:bg-amber-300"
                    }`}
                  />
                </span>
              </button>

              {!state.payment.billingSameAsShipping ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="billing-full-name" className="text-sm font-medium">
                      {labels.billingName}
                    </label>
                    <Input
                      id="billing-full-name"
                      ref={registerInputRef("payment.billingFullName")}
                      value={state.payment.billingFullName}
                      onChange={(event) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "payment.billingFullName",
                          value: event.target.value,
                        })
                      }
                      placeholder={labels.billingName}
                      aria-invalid={state.errors["payment.billingFullName"] ? "true" : "false"}
                      aria-describedby={
                        state.errors["payment.billingFullName"]
                          ? "billing-full-name-error"
                          : undefined
                      }
                    />
                    {state.errors["payment.billingFullName"] ? (
                      <p id="billing-full-name-error" className="text-sm text-destructive">
                        {state.errors["payment.billingFullName"]}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor="billing-address" className="text-sm font-medium">
                      {labels.billingAddress}
                    </label>
                    <Input
                      id="billing-address"
                      ref={registerInputRef("payment.billingAddress")}
                      value={state.payment.billingAddress}
                      onChange={(event) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "payment.billingAddress",
                          value: event.target.value,
                        })
                      }
                      placeholder={labels.billingAddress}
                      aria-invalid={state.errors["payment.billingAddress"] ? "true" : "false"}
                      aria-describedby={
                        state.errors["payment.billingAddress"]
                          ? "billing-address-error"
                          : undefined
                      }
                    />
                    {state.errors["payment.billingAddress"] ? (
                      <p id="billing-address-error" className="text-sm text-destructive">
                        {state.errors["payment.billingAddress"]}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="billing-city" className="text-sm font-medium">
                      {labels.billingCity}
                    </label>
                    <Input
                      id="billing-city"
                      ref={registerInputRef("payment.billingCity")}
                      value={state.payment.billingCity}
                      onChange={(event) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "payment.billingCity",
                          value: event.target.value,
                        })
                      }
                      placeholder={labels.billingCity}
                      aria-invalid={state.errors["payment.billingCity"] ? "true" : "false"}
                      aria-describedby={
                        state.errors["payment.billingCity"] ? "billing-city-error" : undefined
                      }
                    />
                    {state.errors["payment.billingCity"] ? (
                      <p id="billing-city-error" className="text-sm text-destructive">
                        {state.errors["payment.billingCity"]}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="billing-postal-code" className="text-sm font-medium">
                      {labels.billingPostalCode}
                    </label>
                    <Input
                      id="billing-postal-code"
                      ref={registerInputRef("payment.billingPostalCode")}
                      value={state.payment.billingPostalCode}
                      onChange={(event) =>
                        dispatch({
                          type: "SET_FIELD",
                          field: "payment.billingPostalCode",
                          value: event.target.value,
                        })
                      }
                      placeholder={labels.billingPostalCode}
                      inputMode="numeric"
                      aria-invalid={state.errors["payment.billingPostalCode"] ? "true" : "false"}
                      aria-describedby={
                        state.errors["payment.billingPostalCode"]
                          ? "billing-postal-code-error"
                          : undefined
                      }
                    />
                    {state.errors["payment.billingPostalCode"] ? (
                      <p id="billing-postal-code-error" className="text-sm text-destructive">
                        {state.errors["payment.billingPostalCode"]}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{labels.sameAsShipping}</p>
              )}
            </div>
          </div>
        ) : null}

        {state.step === "review" ? (
          <div className="space-y-5 rounded-3xl border border-border bg-background/60 p-5 dark:border-amber-500/10 dark:bg-background/40">
            <p className="text-sm font-medium">{labels.reviewTitle}</p>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card/80 p-5 dark:border-amber-500/10 dark:bg-card/70">
                <p className="text-sm font-medium">{labels.shippingTitle}</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {state.shipping.fullName}
                  <br />
                  {state.shipping.email}
                  <br />
                  {state.shipping.address}
                  <br />
                  {state.shipping.city}, {state.shipping.postalCode}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/80 p-5 dark:border-amber-500/10 dark:bg-card/70">
                <p className="text-sm font-medium">{labels.paymentTitle}</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {state.payment.method === "card" && "Card"}
                  {state.payment.method === "link" && "Link"}
                  {state.payment.method === "bank_transfer" && "Bank transfer"}
                  <br />
                  {state.payment.billingSameAsShipping
                    ? labels.sameAsShipping
                    : labels.separateBilling}
                </p>
                {!state.payment.billingSameAsShipping ? (
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {state.payment.billingFullName}
                    <br />
                    {state.payment.billingAddress}
                    <br />
                    {state.payment.billingCity}, {state.payment.billingPostalCode}
                  </p>
                ) : null}
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
            <Button
              asChild
              className="mt-6 rounded-full bg-amber-700 text-amber-50 hover:bg-amber-600 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
            >
              <Link href="/">{copy.cartReturn}</Link>
            </Button>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {state.step !== "shipping" && state.step !== "complete" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: "PREV_STEP" })}
              className="border-border bg-transparent hover:bg-accent dark:border-amber-500/20 dark:hover:bg-amber-500/10"
            >
              {copy.checkoutBack}
            </Button>
          ) : null}

          {state.step !== "complete" ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={state.isSubmitting}
              className="rounded-full bg-amber-700 text-amber-50 hover:bg-amber-600 disabled:opacity-70 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
            >
              {state.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {state.step === "review" ? copy.checkoutConfirm : copy.checkoutContinue}
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
            {state.step === "shipping" && labels.shipping}
            {state.step === "payment" && labels.payment}
            {state.step === "review" && labels.review}
            {state.step === "complete" && labels.complete}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {state.step === "shipping" &&
              (locale === "es"
                ? "Recopilamos los datos mínimos para crear un intento de envío válido."
                : "We collect the minimum data required for a valid shipping attempt.")}
            {state.step === "payment" &&
              (locale === "es"
                ? "El método elegido queda listo para conectarse a un intent de pago."
                : "The selected method is ready to connect to a payment intent.")}
            {state.step === "review" &&
              (locale === "es"
                ? "Todo está preparado para disparar la confirmación simulada."
                : "Everything is ready to trigger the simulated confirmation.")}
            {state.step === "complete" &&
              (locale === "es"
                ? "La orden terminó el flujo y el carrito se vació por separado."
                : "The order finished the flow and the cart was cleared independently.")}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {items.map((item) => (
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

        <div className="mt-6 flex items-center justify-between border-t border-border pt-6 dark:border-amber-500/10">
          <span className="text-muted-foreground">{copy.cartSubtotal}</span>
          <Price amountCents={subtotal} className="text-2xl font-semibold" />
        </div>

        <div className="mt-6 rounded-3xl border border-border bg-background/60 px-4 py-4 text-sm text-muted-foreground dark:border-amber-500/10 dark:bg-background/30">
          <p className="inline-flex items-center gap-2 font-medium text-foreground">
            <ShieldCheck className="size-4" />
            {locale === "es" ? "Stripe-ready" : "Stripe-ready"}
          </p>
          <p className="mt-2 leading-6">
            {locale === "es"
              ? "Este flujo ya separa envío, selección de método, validación y confirmación para integrar Payment Intents o Elements sin rehacer la máquina de estados."
              : "This flow already separates shipping, method selection, validation and confirmation so Payment Intents or Elements can be integrated without rewriting the state machine."}
          </p>
        </div>
      </aside>
    </div>
  );
}
