"use client";

import { useEffect, useReducer, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck } from "lucide-react";

import { CheckoutPaymentStep } from "@/components/checkout/CheckoutPaymentStep";
import { useLanguage } from "@/components/providers/language-provider";
import { Price } from "@/components/store/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import type { CartItem } from "@/types/catalog";

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
  country?: string;
}

interface PaymentForm {
  method: PaymentMethod | "";
  billingSameAsShipping: boolean;
  billingFullName: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
}

interface OrderSnapshot {
  items: CartItem[];
  subtotal: number;
}

interface PersistedCheckoutState {
  step: EditableCheckoutStep;
  shipping: ShippingForm;
  payment: PaymentForm;
  paymentIntentId: string | null;
  paymentIntentStatus: string | null;
  paymentError: string | null;
  orderSnapshot: OrderSnapshot | null;
}

interface CheckoutState {
  step: CheckoutStep;
  shipping: ShippingForm;
  payment: PaymentForm;
  errors: CheckoutErrors;
  isSubmitting: boolean;
  submitError: string | null;
  submitSucceeded: boolean;
  clientSecret: string | null;
  paymentIntentId: string | null;
  paymentIntentStatus: string | null;
  paymentError: string | null;
  orderSnapshot: OrderSnapshot | null;
}

type CheckoutAction =
  | { type: "SET_FIELD"; field: CheckoutField; value: string | boolean }
  | { type: "RESTORE_STATE"; snapshot: PersistedCheckoutState }
  | { type: "NEXT_STEP"; canProceed: boolean }
  | { type: "PREV_STEP" }
  | { type: "GO_TO_STEP"; step: CheckoutStep; allowed: boolean }
  | { type: "VALIDATE_STEP"; step: EditableCheckoutStep; errors: CheckoutErrors }
  | { type: "PAYMENT_INTENT_CREATED"; clientSecret: string }
  | {
      type: "PAYMENT_CONFIRMED";
      paymentIntentId: string;
      paymentIntentStatus: string;
      snapshot: OrderSnapshot;
    }
  | { type: "PAYMENT_FAILED"; message: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_ERROR"; message: string };

const steps: CheckoutStep[] = ["shipping", "payment", "review", "complete"];
const editableSteps: EditableCheckoutStep[] = ["shipping", "payment", "review"];
const CHECKOUT_STORAGE_KEY = "veloura-checkout";
const SUCCESSFUL_PAYMENT_STATUSES = new Set(["succeeded", "processing", "requires_capture"]);
const FAILED_REDIRECT_STATUSES = new Set(["failed", "canceled"]);
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
    country: "US",
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
  clientSecret: null,
  paymentIntentId: null,
  paymentIntentStatus: null,
  paymentError: null,
  orderSnapshot: null,
};

function assertNever(value: never): never {
  throw new Error(`Unhandled checkout action: ${JSON.stringify(value)}`);
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

function cloneOrderSnapshot(items: CartItem[], subtotal: number): OrderSnapshot {
  return {
    items: items.map((item) => ({ ...item })),
    subtotal,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEditableStep(value: unknown): value is EditableCheckoutStep {
  return value === "shipping" || value === "payment" || value === "review";
}

function isSize(value: unknown): value is CartItem["size"] {
  return value === "XS" || value === "S" || value === "M" || value === "L" || value === "XL";
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parsePersistedCheckoutState(raw: string | null): PersistedCheckoutState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed)) {
      return null;
    }

    const step = parsed.step;
    const shipping = parsed.shipping;
    const payment = parsed.payment;
    const orderSnapshot = parsed.orderSnapshot;

    if (!isEditableStep(step) || !isRecord(shipping) || !isRecord(payment)) {
      return null;
    }

    const restoredShipping: ShippingForm = {
      fullName: asString(shipping.fullName) ?? "",
      email: asString(shipping.email) ?? "",
      address: asString(shipping.address) ?? "",
      city: asString(shipping.city) ?? "",
      postalCode: asString(shipping.postalCode) ?? "",
      country: asOptionalString(shipping.country) ?? "US",
    };

    const restoredPayment: PaymentForm = {
      method:
        payment.method === "card" ||
        payment.method === "link" ||
        payment.method === "bank_transfer"
          ? payment.method
          : "",
      billingSameAsShipping:
        typeof payment.billingSameAsShipping === "boolean"
          ? payment.billingSameAsShipping
          : true,
      billingFullName: asString(payment.billingFullName) ?? "",
      billingAddress: asString(payment.billingAddress) ?? "",
      billingCity: asString(payment.billingCity) ?? "",
      billingPostalCode: asString(payment.billingPostalCode) ?? "",
    };

    let restoredSnapshot: OrderSnapshot | null = null;

    if (isRecord(orderSnapshot) && Array.isArray(orderSnapshot.items)) {
      const items = orderSnapshot.items
        .map((item): CartItem | null => {
          if (!isRecord(item)) {
            return null;
          }

          const id = asString(item.id);
          const productId = asString(item.productId);
          const name = asString(item.name);
          const slug = asString(item.slug);
          const size = item.size;
          const imageUrl = asString(item.imageUrl);
          const priceCents = typeof item.priceCents === "number" ? item.priceCents : null;
          const quantity = typeof item.quantity === "number" ? item.quantity : null;
          const palette =
            Array.isArray(item.palette) &&
            item.palette.length === 2 &&
            typeof item.palette[0] === "string" &&
            typeof item.palette[1] === "string"
              ? ([item.palette[0], item.palette[1]] as [string, string])
              : null;

          if (
            !id ||
            !productId ||
            !name ||
            !slug ||
            !imageUrl ||
            !isSize(size) ||
            !palette ||
            priceCents === null ||
            quantity === null
          ) {
            return null;
          }

          return {
            id,
            productId,
            name,
            slug,
            size,
            imageUrl,
            palette,
            priceCents,
            quantity,
          };
        })
        .filter((item): item is CartItem => item !== null);

      const subtotal = typeof orderSnapshot.subtotal === "number" ? orderSnapshot.subtotal : 0;

      if (items.length) {
        restoredSnapshot = {
          items,
          subtotal,
        };
      }
    }

    const restoredPaymentIntentStatus = asString(parsed.paymentIntentStatus);
    const resolvedStep =
      step === "review" && !restoredPaymentIntentStatus ? "payment" : step;

    return {
      step: resolvedStep,
      shipping: restoredShipping,
      payment: restoredPayment,
      paymentIntentId: asString(parsed.paymentIntentId),
      paymentIntentStatus: restoredPaymentIntentStatus,
      paymentError: asString(parsed.paymentError),
      orderSnapshot: restoredSnapshot,
    };
  } catch {
    return null;
  }
}

function isSuccessfulPaymentStatus(status: string | null) {
  return typeof status === "string" && SUCCESSFUL_PAYMENT_STATUSES.has(status);
}

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
    case "RESTORE_STATE":
      return {
        ...state,
        step: action.snapshot.step,
        shipping: action.snapshot.shipping,
        payment: action.snapshot.payment,
        paymentIntentId: action.snapshot.paymentIntentId,
        paymentIntentStatus: action.snapshot.paymentIntentStatus,
        paymentError: action.snapshot.paymentError,
        orderSnapshot: action.snapshot.orderSnapshot,
      };
    case "SET_FIELD": {
      const nextErrors = { ...state.errors };
      delete nextErrors[action.field];

      const resetPaymentIntentState = action.field.startsWith("shipping.")
        ? {
            clientSecret: null,
            paymentIntentId: null,
            paymentIntentStatus: null,
            paymentError: null,
            orderSnapshot: null,
          }
        : {};

      switch (action.field) {
        case "shipping.fullName":
          return {
            ...state,
            ...resetPaymentIntentState,
            shipping: { ...state.shipping, fullName: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.email":
          return {
            ...state,
            ...resetPaymentIntentState,
            shipping: { ...state.shipping, email: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.address":
          return {
            ...state,
            ...resetPaymentIntentState,
            shipping: { ...state.shipping, address: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.city":
          return {
            ...state,
            ...resetPaymentIntentState,
            shipping: { ...state.shipping, city: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.postalCode":
          return {
            ...state,
            ...resetPaymentIntentState,
            shipping: { ...state.shipping, postalCode: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "payment.method":
          return {
            ...state,
            payment: { ...state.payment, method: action.value as PaymentMethod },
            errors: nextErrors,
            paymentError: null,
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
            paymentError: null,
          };
        case "payment.billingFullName":
          return {
            ...state,
            payment: { ...state.payment, billingFullName: String(action.value) },
            errors: nextErrors,
            paymentError: null,
          };
        case "payment.billingAddress":
          return {
            ...state,
            payment: { ...state.payment, billingAddress: String(action.value) },
            errors: nextErrors,
            paymentError: null,
          };
        case "payment.billingCity":
          return {
            ...state,
            payment: { ...state.payment, billingCity: String(action.value) },
            errors: nextErrors,
            paymentError: null,
          };
        case "payment.billingPostalCode":
          return {
            ...state,
            payment: { ...state.payment, billingPostalCode: String(action.value) },
            errors: nextErrors,
            paymentError: null,
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
      };
    case "PAYMENT_INTENT_CREATED":
      return {
        ...state,
        clientSecret: action.clientSecret,
        paymentError: null,
      };
    case "PAYMENT_CONFIRMED":
      return {
        ...state,
        paymentIntentId: action.paymentIntentId,
        paymentIntentStatus: action.paymentIntentStatus,
        paymentError: null,
        orderSnapshot: action.snapshot,
      };
    case "PAYMENT_FAILED":
      return {
        ...state,
        paymentError: action.message,
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
        isSubmitting: false,
        submitError: null,
        submitSucceeded: true,
        step: "complete",
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
  const hasRestoredCheckoutRef = useRef(false);
  const searchParams = useSearchParams();
  const hasHydrated = useCart((cart) => cart.hasHydrated);
  const { items, subtotal, clearCart } = useCart((cart) => ({
    items: cart.items,
    subtotal: cart.subtotal,
    clearCart: cart.clearCart,
  }));
  const inputRefs = useRef<Partial<Record<CheckoutField, HTMLInputElement | null>>>({});

  const labels = {
    shipping: locale === "es" ? "Envío" : "Shipping",
    payment: locale === "es" ? "Pago" : "Payment",
    review: locale === "es" ? "Revisión" : "Review",
    complete: locale === "es" ? "Completo" : "Complete",
    shippingTitle: locale === "es" ? "Entrega y contacto" : "Shipping and contact",
    paymentTitle: locale === "es" ? "Pago confirmado" : "Confirmed payment",
    reviewTitle: locale === "es" ? "Revisión final" : "Final review",
    fullName: locale === "es" ? "Nombre completo" : "Full name",
    email: "Email",
    address: locale === "es" ? "Dirección" : "Address",
    city: locale === "es" ? "Ciudad" : "City",
    postalCode: locale === "es" ? "Código postal" : "Postal code",
    payAndContinue:
      locale === "es" ? "Pagar y continuar" : "Pay and continue",
    completeOrder:
      locale === "es" ? "Completar pedido" : "Complete order",
    billingToggle:
      locale === "es" ? "La facturación es diferente al envío" : "Billing address is different",
    billingName: locale === "es" ? "Nombre de facturación" : "Billing full name",
    billingAddress: locale === "es" ? "Dirección de facturación" : "Billing address",
    billingCity: locale === "es" ? "Ciudad de facturación" : "Billing city",
    billingPostalCode:
      locale === "es" ? "Código postal de facturación" : "Billing postal code",
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
    finalizationError:
      locale === "es"
        ? "No pudimos cerrar el pedido en este intento."
        : "We could not complete the order in this attempt.",
    statusReady:
      locale === "es"
        ? "El checkout ya separa creación del intent, confirmación y finalización."
        : "Checkout already separates intent creation, confirmation and final completion.",
    returnToStore:
      locale === "es" ? "Volver a la colección" : "Return to the collection",
  } as const;

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

    if (redirectStatus && FAILED_REDIRECT_STATUSES.has(redirectStatus)) {
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

    const snapshot = cloneOrderSnapshot(items, subtotal);

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
    return (node: HTMLInputElement | null) => {
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
          localized[field] = errors[field];
      }
    }

    return localized;
  }

  function validateAndCommit(step: EditableCheckoutStep) {
    const errors = localizeErrors(validateCurrentStep(state, step));
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
      snapshot: cloneOrderSnapshot(items, subtotal),
    });
    dispatch({ type: "NEXT_STEP", canProceed: true });
  }

  const summaryItems = state.orderSnapshot?.items ?? items;
  const summarySubtotal = state.orderSnapshot?.subtotal ?? subtotal;

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
        <Button
          asChild
          className="mt-8 rounded-full bg-amber-700 text-amber-50 hover:bg-amber-600 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
        >
          <Link href="/">{labels.returnToStore}</Link>
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
                  state.errors["shipping.postalCode"]
                    ? "shipping-postal-code-error"
                    : undefined
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
                  {state.paymentIntentId ?? "PaymentIntent"}
                  <br />
                  {state.paymentIntentStatus ?? "succeeded"}
                </p>
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
            <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4 dark:border-amber-500/10 dark:bg-background/30">
              <p className="text-sm font-medium text-foreground">
                {locale === "es" ? "PaymentIntent" : "PaymentIntent"}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {state.paymentIntentId ?? "n/a"}
                <br />
                {state.paymentIntentStatus ?? "succeeded"}
              </p>
            </div>
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

          {state.step === "shipping" ? (
            <Button
              type="button"
              onClick={handleShippingContinue}
              className="rounded-full bg-amber-700 text-amber-50 hover:bg-amber-600 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
            >
              <ArrowRight className="size-4" />
              {copy.checkoutContinue}
            </Button>
          ) : null}

          {state.step === "review" ? (
            <Button
              type="button"
              onClick={() => void handleCompleteOrder()}
              disabled={state.isSubmitting}
              className="rounded-full bg-amber-700 text-amber-50 hover:bg-amber-600 disabled:opacity-70 dark:bg-amber-300 dark:text-zinc-950 dark:hover:bg-amber-200"
            >
              {state.isSubmitting ? <ArrowRight className="size-4 animate-pulse" /> : <CheckCircle2 className="size-4" />}
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

        <div className="mt-6 flex items-center justify-between border-t border-border pt-6 dark:border-amber-500/10">
          <span className="text-muted-foreground">{copy.cartSubtotal}</span>
          <Price amountCents={summarySubtotal} className="text-2xl font-semibold" />
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
