import {
  DEFAULT_COUNTRY,
  DEFAULT_SHIPPING_METHOD,
  isShippingMethodCode,
  isSupportedCountryCode,
  isValidCityForCountry,
  isValidPostalCode,
  normalizePostalCode,
  type ShippingMethodCode,
  type SupportedCountryCode,
} from "@/lib/checkout/shipping";
import { isRequiredText, isValidEmail } from "@/lib/checkout/validators";
import type { CartItem } from "@/types/catalog";

export type CheckoutStep = "shipping" | "payment" | "review" | "complete";
export type EditableCheckoutStep = Exclude<CheckoutStep, "complete">;
export type PaymentMethod = "card" | "link" | "bank_transfer";
export type CheckoutField =
  | "shipping.fullName"
  | "shipping.email"
  | "shipping.country"
  | "shipping.city"
  | "shipping.street"
  | "shipping.streetNumber"
  | "shipping.apartment"
  | "shipping.reference"
  | "shipping.postalCode"
  | "shipping.shippingMethod"
  | "payment.method"
  | "payment.billingSameAsShipping"
  | "payment.billingFullName"
  | "payment.billingAddress"
  | "payment.billingCity"
  | "payment.billingPostalCode";
export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

export interface ShippingForm {
  fullName: string;
  email: string;
  country: SupportedCountryCode;
  city: string;
  street: string;
  streetNumber: string;
  apartment: string;
  reference: string;
  postalCode: string;
  shippingMethod: ShippingMethodCode;
}

export interface PaymentForm {
  method: PaymentMethod | "";
  billingSameAsShipping: boolean;
  billingFullName: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
}

export interface OrderSnapshot {
  items: CartItem[];
  subtotal: number;
}

export interface PersistedCheckoutState {
  step: EditableCheckoutStep;
  shipping: ShippingForm;
  payment: PaymentForm;
  paymentIntentId: string | null;
  paymentIntentStatus: string | null;
  paymentError: string | null;
  orderSnapshot: OrderSnapshot | null;
}

export interface CheckoutState {
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

export type CheckoutAction =
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
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "RESET" };

export const steps: CheckoutStep[] = ["shipping", "payment", "review", "complete"];
export const editableSteps: EditableCheckoutStep[] = ["shipping", "payment", "review"];
export const CHECKOUT_STORAGE_KEY = "veloura-checkout";
export const stepFieldOrder: Record<EditableCheckoutStep, CheckoutField[]> = {
  shipping: [
    "shipping.fullName",
    "shipping.email",
    "shipping.country",
    "shipping.city",
    "shipping.street",
    "shipping.streetNumber",
    "shipping.reference",
    "shipping.postalCode",
    "shipping.shippingMethod",
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

const SUCCESSFUL_PAYMENT_STATUSES = new Set(["succeeded", "processing", "requires_capture"]);
const FAILED_REDIRECT_STATUSES = new Set(["failed", "canceled"]);

export function createInitialCheckoutState(): CheckoutState {
  return {
    step: "shipping",
    shipping: {
      fullName: "",
      email: "",
      country: DEFAULT_COUNTRY,
      city: "",
      street: "",
      streetNumber: "",
      apartment: "",
      reference: "",
      postalCode: "",
      shippingMethod: DEFAULT_SHIPPING_METHOD,
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
}

function assertNever(value: never): never {
  throw new Error(`Unhandled checkout action: ${JSON.stringify(value)}`);
}

function nextStep(current: CheckoutStep): CheckoutStep {
  return steps[Math.min(steps.indexOf(current) + 1, steps.length - 1)];
}

function previousStep(current: CheckoutStep): CheckoutStep {
  return steps[Math.max(steps.indexOf(current) - 1, 0)];
}

export function createOrderSnapshot(items: CartItem[], subtotal: number): OrderSnapshot {
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

export function formatShippingAddress(shipping: ShippingForm) {
  const lineTwo = [shipping.streetNumber, shipping.street].filter(Boolean).join(" ");
  const lineThree = [shipping.apartment.trim(), shipping.reference.trim()]
    .filter(Boolean)
    .join(" • ");

  return [lineTwo, lineThree].filter(Boolean);
}

export function parsePersistedCheckoutState(raw: string | null): PersistedCheckoutState | null {
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

    const restoredCountry = isSupportedCountryCode(shipping.country)
      ? shipping.country
      : DEFAULT_COUNTRY;
    const restoredCityCandidate = asString(shipping.city) ?? "";
    const restoredCity = isValidCityForCountry(restoredCountry, restoredCityCandidate)
      ? restoredCityCandidate
      : "";
    const restoredShipping: ShippingForm = {
      fullName: asString(shipping.fullName) ?? "",
      email: asString(shipping.email) ?? "",
      country: restoredCountry,
      city: restoredCity,
      street: asString(shipping.street) ?? asString(shipping.address) ?? "",
      streetNumber: asString(shipping.streetNumber) ?? "",
      apartment: asString(shipping.apartment) ?? "",
      reference: asString(shipping.reference) ?? "",
      postalCode: asString(shipping.postalCode) ?? "",
      shippingMethod: isShippingMethodCode(shipping.shippingMethod)
        ? shipping.shippingMethod
        : DEFAULT_SHIPPING_METHOD,
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

export function isSuccessfulPaymentStatus(status: string | null) {
  return typeof status === "string" && SUCCESSFUL_PAYMENT_STATUSES.has(status);
}

export function isFailedRedirectStatus(status: string | null) {
  return typeof status === "string" && FAILED_REDIRECT_STATUSES.has(status);
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

export function validateCheckoutStep(
  state: CheckoutState,
  step: EditableCheckoutStep,
): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (step === "shipping") {
    if (!isRequiredText(state.shipping.fullName)) {
      errors["shipping.fullName"] = "Full name is required.";
    }
    if (!isValidEmail(state.shipping.email)) {
      errors["shipping.email"] = "A valid email is required.";
    }
    if (!isSupportedCountryCode(state.shipping.country)) {
      errors["shipping.country"] = "Select a supported country.";
    }
    if (!isValidCityForCountry(state.shipping.country, state.shipping.city)) {
      errors["shipping.city"] = "Select a valid city.";
    }
    if (!isRequiredText(state.shipping.street, 3)) {
      errors["shipping.street"] = "Street is required.";
    }
    if (!isRequiredText(state.shipping.streetNumber)) {
      errors["shipping.streetNumber"] = "Street number is required.";
    }
    if (state.shipping.apartment.trim() && !isRequiredText(state.shipping.apartment, 2)) {
      errors["shipping.apartment"] = "Apartment or suite is too short.";
    }
    if (!isRequiredText(state.shipping.reference, 6)) {
      errors["shipping.reference"] = "Delivery reference is required.";
    }
    if (!isValidPostalCode(state.shipping.country, state.shipping.postalCode)) {
      errors["shipping.postalCode"] = "Postal code is invalid for the selected country.";
    }
    if (!isShippingMethodCode(state.shipping.shippingMethod)) {
      errors["shipping.shippingMethod"] = "Select a shipping method.";
    }

    return errors;
  }

  if (!state.payment.method) {
    errors["payment.method"] = "Select a payment method.";
  }

  if (!state.payment.billingSameAsShipping) {
    if (!isRequiredText(state.payment.billingFullName)) {
      errors["payment.billingFullName"] = "Billing full name is required.";
    }
    if (!isRequiredText(state.payment.billingAddress)) {
      errors["payment.billingAddress"] = "Billing address is required.";
    }
    if (!isRequiredText(state.payment.billingCity)) {
      errors["payment.billingCity"] = "Billing city is required.";
    }
    if (!isRequiredText(state.payment.billingPostalCode)) {
      errors["payment.billingPostalCode"] = "Billing postal code is required.";
    }
  }

  return errors;
}

export function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
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
        case "shipping.country": {
          const nextCountry = isSupportedCountryCode(action.value)
            ? action.value
            : DEFAULT_COUNTRY;
          const nextCity = isValidCityForCountry(nextCountry, state.shipping.city)
            ? state.shipping.city
            : "";

          delete nextErrors["shipping.city"];

          return {
            ...state,
            ...resetPaymentIntentState,
            shipping: {
              ...state.shipping,
              country: nextCountry,
              city: nextCity,
              postalCode: "",
            },
            errors: nextErrors,
            submitError: null,
          };
        }
        case "shipping.street":
          return {
            ...state,
            ...resetPaymentIntentState,
            shipping: { ...state.shipping, street: String(action.value) },
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
            shipping: {
              ...state.shipping,
              postalCode: normalizePostalCode(String(action.value)),
            },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.streetNumber":
          return {
            ...state,
            ...resetPaymentIntentState,
            shipping: { ...state.shipping, streetNumber: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.apartment":
          return {
            ...state,
            ...resetPaymentIntentState,
            shipping: { ...state.shipping, apartment: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.reference":
          return {
            ...state,
            ...resetPaymentIntentState,
            shipping: { ...state.shipping, reference: String(action.value) },
            errors: nextErrors,
            submitError: null,
          };
        case "shipping.shippingMethod":
          return {
            ...state,
            ...resetPaymentIntentState,
            shipping: {
              ...state.shipping,
              shippingMethod: isShippingMethodCode(action.value)
                ? action.value
                : DEFAULT_SHIPPING_METHOD,
            },
            errors: nextErrors,
            submitError: null,
          };
        case "payment.method": {
          delete nextErrors["payment.billingFullName"];
          delete nextErrors["payment.billingAddress"];
          delete nextErrors["payment.billingCity"];
          delete nextErrors["payment.billingPostalCode"];

          return {
            ...state,
            payment: {
              ...state.payment,
              method:
                action.value === "card" ||
                action.value === "link" ||
                action.value === "bank_transfer"
                  ? action.value
                  : "",
              billingSameAsShipping: true,
              billingFullName: "",
              billingAddress: "",
              billingCity: "",
              billingPostalCode: "",
            },
            errors: nextErrors,
            paymentError: null,
          };
        }
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
    case "RESET":
      return createInitialCheckoutState();
    default:
      return assertNever(action);
  }
}
