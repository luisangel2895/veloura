import { describe, expect, it } from "vitest";

import {
  checkoutReducer,
  createInitialCheckoutState,
  createOrderSnapshot,
  formatShippingAddress,
  isFailedRedirectStatus,
  isSuccessfulPaymentStatus,
  parsePersistedCheckoutState,
  validateCheckoutStep,
  type CheckoutAction,
  type CheckoutState,
  type PersistedCheckoutState,
} from "@/lib/checkout/checkout-machine";

function dispatchSequence(initialState: CheckoutState, actions: CheckoutAction[]): CheckoutState {
  return actions.reduce(checkoutReducer, initialState);
}

function buildValidShippingState(): CheckoutState {
  return dispatchSequence(createInitialCheckoutState(), [
    { type: "SET_FIELD", field: "shipping.fullName", value: "Angel Doe" },
    { type: "SET_FIELD", field: "shipping.email", value: "angel@example.com" },
    { type: "SET_FIELD", field: "shipping.city", value: "New York" },
    { type: "SET_FIELD", field: "shipping.street", value: "Fifth Avenue" },
    { type: "SET_FIELD", field: "shipping.streetNumber", value: "350" },
    { type: "SET_FIELD", field: "shipping.reference", value: "Front desk lobby" },
    { type: "SET_FIELD", field: "shipping.postalCode", value: "10001" },
  ]);
}

function buildValidPaymentState(): CheckoutState {
  return dispatchSequence(buildValidShippingState(), [
    { type: "NEXT_STEP", canProceed: true },
    { type: "SET_FIELD", field: "payment.method", value: "card" },
  ]);
}

const validCartItem = {
  id: "item-1",
  productId: "prod-1",
  name: "Silk Balconette",
  slug: "silk-balconette",
  size: "M" as const,
  imageUrl: "/images/silk-balconette.jpg",
  palette: ["#fff", "#000"] as [string, string],
  priceCents: 8900,
  quantity: 1,
};

// ---------------------------------------------------------------------------
// createInitialCheckoutState
// ---------------------------------------------------------------------------

describe("createInitialCheckoutState", () => {
  it("returns the correct default state", () => {
    const state = createInitialCheckoutState();

    expect(state.step).toBe("shipping");
    expect(state.shipping.country).toBe("US");
    expect(state.shipping.shippingMethod).toBe("standard");
    expect(state.payment.method).toBe("");
    expect(state.payment.billingSameAsShipping).toBe(true);
    expect(state.errors).toEqual({});
    expect(state.isSubmitting).toBe(false);
    expect(state.submitError).toBeNull();
    expect(state.submitSucceeded).toBe(false);
    expect(state.clientSecret).toBeNull();
    expect(state.paymentIntentId).toBeNull();
    expect(state.paymentIntentStatus).toBeNull();
    expect(state.paymentError).toBeNull();
    expect(state.orderSnapshot).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// checkoutReducer — happy path
// ---------------------------------------------------------------------------

describe("checkoutReducer", () => {
  it("moves from shipping to payment to review to complete on the happy path", () => {
    const shippingState = buildValidShippingState();
    const shippingErrors = validateCheckoutStep(shippingState, "shipping");

    expect(shippingErrors).toEqual({});

    const completedState = dispatchSequence(shippingState, [
      { type: "VALIDATE_STEP", step: "shipping", errors: shippingErrors },
      { type: "NEXT_STEP", canProceed: true },
      {
        type: "PAYMENT_CONFIRMED",
        paymentIntentId: "pi_test_123",
        paymentIntentStatus: "succeeded",
        snapshot: { items: [], subtotal: 0 },
      },
      { type: "NEXT_STEP", canProceed: true },
      { type: "SUBMIT_SUCCESS" },
    ]);

    expect(completedState.step).toBe("complete");
    expect(completedState.paymentIntentId).toBe("pi_test_123");
    expect(completedState.submitSucceeded).toBe(true);
  });

  it("does not advance when shipping is invalid", () => {
    const initialState = createInitialCheckoutState();
    const errors = validateCheckoutStep(initialState, "shipping");
    const nextState = dispatchSequence(initialState, [
      { type: "VALIDATE_STEP", step: "shipping", errors },
      { type: "NEXT_STEP", canProceed: false },
    ]);

    expect(nextState.step).toBe("shipping");
    expect(nextState.errors["shipping.fullName"]).toBe("Full name is required.");
    expect(nextState.errors["shipping.email"]).toBe("A valid email is required.");
    expect(nextState.errors["shipping.street"]).toBe("Street is required.");
  });

  it("clears non-applicable billing fields when the payment method changes", () => {
    const stateWithBilling = dispatchSequence(buildValidShippingState(), [
      { type: "NEXT_STEP", canProceed: true },
      { type: "SET_FIELD", field: "payment.billingSameAsShipping", value: false },
      { type: "SET_FIELD", field: "payment.billingFullName", value: "Angel Doe" },
      { type: "SET_FIELD", field: "payment.billingAddress", value: "500 Madison Ave" },
      { type: "SET_FIELD", field: "payment.billingCity", value: "New York" },
      { type: "SET_FIELD", field: "payment.billingPostalCode", value: "10022" },
      { type: "SET_FIELD", field: "payment.method", value: "bank_transfer" },
    ]);

    expect(stateWithBilling.payment.method).toBe("bank_transfer");
    expect(stateWithBilling.payment.billingSameAsShipping).toBe(true);
    expect(stateWithBilling.payment.billingFullName).toBe("");
    expect(stateWithBilling.payment.billingAddress).toBe("");
    expect(stateWithBilling.payment.billingCity).toBe("");
    expect(stateWithBilling.payment.billingPostalCode).toBe("");
  });

  it("resets back to the initial state", () => {
    const dirtyState = dispatchSequence(buildValidShippingState(), [
      { type: "NEXT_STEP", canProceed: true },
      { type: "SUBMIT_START" },
    ]);

    const resetState = checkoutReducer(dirtyState, { type: "RESET" });

    expect(resetState).toEqual(createInitialCheckoutState());
  });
});

// ---------------------------------------------------------------------------
// checkoutReducer — SET_FIELD shipping fields
// ---------------------------------------------------------------------------

describe("checkoutReducer SET_FIELD shipping", () => {
  it("sets shipping.fullName and clears its error", () => {
    let state = createInitialCheckoutState();
    state = { ...state, errors: { "shipping.fullName": "required" } };
    const next = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "shipping.fullName",
      value: "Jane",
    });
    expect(next.shipping.fullName).toBe("Jane");
    expect(next.errors["shipping.fullName"]).toBeUndefined();
    expect(next.submitError).toBeNull();
  });

  it("sets shipping.email", () => {
    const next = checkoutReducer(createInitialCheckoutState(), {
      type: "SET_FIELD",
      field: "shipping.email",
      value: "test@mail.com",
    });
    expect(next.shipping.email).toBe("test@mail.com");
  });

  it("sets shipping.street", () => {
    const next = checkoutReducer(createInitialCheckoutState(), {
      type: "SET_FIELD",
      field: "shipping.street",
      value: "Broadway",
    });
    expect(next.shipping.street).toBe("Broadway");
  });

  it("sets shipping.streetNumber", () => {
    const next = checkoutReducer(createInitialCheckoutState(), {
      type: "SET_FIELD",
      field: "shipping.streetNumber",
      value: "42",
    });
    expect(next.shipping.streetNumber).toBe("42");
  });

  it("sets shipping.apartment", () => {
    const next = checkoutReducer(createInitialCheckoutState(), {
      type: "SET_FIELD",
      field: "shipping.apartment",
      value: "4B",
    });
    expect(next.shipping.apartment).toBe("4B");
  });

  it("sets shipping.reference", () => {
    const next = checkoutReducer(createInitialCheckoutState(), {
      type: "SET_FIELD",
      field: "shipping.reference",
      value: "Ring bell twice",
    });
    expect(next.shipping.reference).toBe("Ring bell twice");
  });

  it("sets shipping.city", () => {
    const next = checkoutReducer(createInitialCheckoutState(), {
      type: "SET_FIELD",
      field: "shipping.city",
      value: "Los Angeles",
    });
    expect(next.shipping.city).toBe("Los Angeles");
  });

  it("normalizes postalCode to uppercase and trimmed", () => {
    const next = checkoutReducer(createInitialCheckoutState(), {
      type: "SET_FIELD",
      field: "shipping.postalCode",
      value: " 10001 ",
    });
    expect(next.shipping.postalCode).toBe("10001");
  });

  it("sets shipping.country and resets city and postalCode when country changes", () => {
    let state = createInitialCheckoutState();
    state = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "shipping.city",
      value: "New York",
    });
    state = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "shipping.postalCode",
      value: "10001",
    });

    const next = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "shipping.country",
      value: "MX",
    });

    expect(next.shipping.country).toBe("MX");
    expect(next.shipping.city).toBe("");
    expect(next.shipping.postalCode).toBe("");
  });

  it("falls back to DEFAULT_COUNTRY for an unsupported country code", () => {
    const next = checkoutReducer(createInitialCheckoutState(), {
      type: "SET_FIELD",
      field: "shipping.country",
      value: "ZZ",
    });
    expect(next.shipping.country).toBe("US");
  });

  it("keeps city if it is valid for the new country", () => {
    let state = createInitialCheckoutState();
    state = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "shipping.country",
      value: "CA",
    });
    state = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "shipping.city",
      value: "Toronto",
    });

    // Change country to CA again — city should persist
    const next = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "shipping.country",
      value: "CA",
    });
    expect(next.shipping.city).toBe("Toronto");
  });

  it("sets shipping.shippingMethod with valid code", () => {
    const next = checkoutReducer(createInitialCheckoutState(), {
      type: "SET_FIELD",
      field: "shipping.shippingMethod",
      value: "premium",
    });
    expect(next.shipping.shippingMethod).toBe("premium");
  });

  it("falls back to default shipping method for invalid code", () => {
    const next = checkoutReducer(createInitialCheckoutState(), {
      type: "SET_FIELD",
      field: "shipping.shippingMethod",
      value: "teleportation",
    });
    expect(next.shipping.shippingMethod).toBe("standard");
  });

  it("resets payment intent state when any shipping field changes", () => {
    let state = buildValidPaymentState();
    state = checkoutReducer(state, {
      type: "PAYMENT_INTENT_CREATED",
      clientSecret: "cs_test",
    });
    state = checkoutReducer(state, {
      type: "PAYMENT_CONFIRMED",
      paymentIntentId: "pi_test",
      paymentIntentStatus: "succeeded",
      snapshot: { items: [validCartItem], subtotal: 8900 },
    });

    // Now go back and change a shipping field
    state = checkoutReducer(state, { type: "PREV_STEP" });
    const next = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "shipping.fullName",
      value: "New Name",
    });

    expect(next.clientSecret).toBeNull();
    expect(next.paymentIntentId).toBeNull();
    expect(next.paymentIntentStatus).toBeNull();
    expect(next.paymentError).toBeNull();
    expect(next.orderSnapshot).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// checkoutReducer — SET_FIELD payment fields
// ---------------------------------------------------------------------------

describe("checkoutReducer SET_FIELD payment", () => {
  it("sets payment.method to card", () => {
    const state = buildValidPaymentState();
    expect(state.payment.method).toBe("card");
  });

  it("sets payment.method to link", () => {
    const next = checkoutReducer(buildValidPaymentState(), {
      type: "SET_FIELD",
      field: "payment.method",
      value: "link",
    });
    expect(next.payment.method).toBe("link");
  });

  it("resets payment.method to empty for invalid value", () => {
    const next = checkoutReducer(buildValidPaymentState(), {
      type: "SET_FIELD",
      field: "payment.method",
      value: "crypto",
    });
    expect(next.payment.method).toBe("");
  });

  it("sets billingSameAsShipping to false", () => {
    const next = checkoutReducer(buildValidPaymentState(), {
      type: "SET_FIELD",
      field: "payment.billingSameAsShipping",
      value: false,
    });
    expect(next.payment.billingSameAsShipping).toBe(false);
  });

  it("clears billing errors when billingSameAsShipping is set back to true", () => {
    let state = buildValidPaymentState();
    state = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "payment.billingSameAsShipping",
      value: false,
    });
    state = {
      ...state,
      errors: {
        "payment.billingFullName": "required",
        "payment.billingAddress": "required",
        "payment.billingCity": "required",
        "payment.billingPostalCode": "required",
      },
    };
    const next = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "payment.billingSameAsShipping",
      value: true,
    });
    expect(next.errors["payment.billingFullName"]).toBeUndefined();
    expect(next.errors["payment.billingAddress"]).toBeUndefined();
    expect(next.errors["payment.billingCity"]).toBeUndefined();
    expect(next.errors["payment.billingPostalCode"]).toBeUndefined();
  });

  it("sets payment.billingFullName", () => {
    const next = checkoutReducer(buildValidPaymentState(), {
      type: "SET_FIELD",
      field: "payment.billingFullName",
      value: "Jane Smith",
    });
    expect(next.payment.billingFullName).toBe("Jane Smith");
    expect(next.paymentError).toBeNull();
  });

  it("sets payment.billingAddress", () => {
    const next = checkoutReducer(buildValidPaymentState(), {
      type: "SET_FIELD",
      field: "payment.billingAddress",
      value: "123 Billing St",
    });
    expect(next.payment.billingAddress).toBe("123 Billing St");
  });

  it("sets payment.billingCity", () => {
    const next = checkoutReducer(buildValidPaymentState(), {
      type: "SET_FIELD",
      field: "payment.billingCity",
      value: "Miami",
    });
    expect(next.payment.billingCity).toBe("Miami");
  });

  it("sets payment.billingPostalCode", () => {
    const next = checkoutReducer(buildValidPaymentState(), {
      type: "SET_FIELD",
      field: "payment.billingPostalCode",
      value: "33101",
    });
    expect(next.payment.billingPostalCode).toBe("33101");
  });
});

// ---------------------------------------------------------------------------
// checkoutReducer — navigation actions
// ---------------------------------------------------------------------------

describe("checkoutReducer navigation", () => {
  it("NEXT_STEP does not advance from complete", () => {
    const state: CheckoutState = {
      ...createInitialCheckoutState(),
      step: "complete",
    };
    const next = checkoutReducer(state, { type: "NEXT_STEP", canProceed: true });
    expect(next.step).toBe("complete");
  });

  it("PREV_STEP does not go back from shipping", () => {
    const state = createInitialCheckoutState();
    const next = checkoutReducer(state, { type: "PREV_STEP" });
    expect(next.step).toBe("shipping");
  });

  it("PREV_STEP does not go back from complete", () => {
    const state: CheckoutState = {
      ...createInitialCheckoutState(),
      step: "complete",
    };
    const next = checkoutReducer(state, { type: "PREV_STEP" });
    expect(next.step).toBe("complete");
  });

  it("PREV_STEP moves from review to payment", () => {
    const state: CheckoutState = {
      ...createInitialCheckoutState(),
      step: "review",
    };
    const next = checkoutReducer(state, { type: "PREV_STEP" });
    expect(next.step).toBe("payment");
    expect(next.submitError).toBeNull();
  });

  it("PREV_STEP moves from payment to shipping", () => {
    const state: CheckoutState = {
      ...createInitialCheckoutState(),
      step: "payment",
    };
    const next = checkoutReducer(state, { type: "PREV_STEP" });
    expect(next.step).toBe("shipping");
  });

  it("GO_TO_STEP navigates when allowed", () => {
    const state: CheckoutState = {
      ...createInitialCheckoutState(),
      step: "review",
    };
    const next = checkoutReducer(state, {
      type: "GO_TO_STEP",
      step: "shipping",
      allowed: true,
    });
    expect(next.step).toBe("shipping");
  });

  it("GO_TO_STEP does nothing when not allowed", () => {
    const state = createInitialCheckoutState();
    const next = checkoutReducer(state, {
      type: "GO_TO_STEP",
      step: "review",
      allowed: false,
    });
    expect(next.step).toBe("shipping");
  });

  it("GO_TO_STEP does nothing from complete", () => {
    const state: CheckoutState = {
      ...createInitialCheckoutState(),
      step: "complete",
    };
    const next = checkoutReducer(state, {
      type: "GO_TO_STEP",
      step: "shipping",
      allowed: true,
    });
    expect(next.step).toBe("complete");
  });
});

// ---------------------------------------------------------------------------
// checkoutReducer — payment intent actions
// ---------------------------------------------------------------------------

describe("checkoutReducer payment intent actions", () => {
  it("PAYMENT_INTENT_CREATED stores clientSecret and clears paymentError", () => {
    let state = buildValidPaymentState();
    state = { ...state, paymentError: "old error" };
    const next = checkoutReducer(state, {
      type: "PAYMENT_INTENT_CREATED",
      clientSecret: "cs_test_secret",
    });
    expect(next.clientSecret).toBe("cs_test_secret");
    expect(next.paymentError).toBeNull();
  });

  it("PAYMENT_CONFIRMED stores payment details and snapshot", () => {
    const snapshot = { items: [validCartItem], subtotal: 8900 };
    const next = checkoutReducer(buildValidPaymentState(), {
      type: "PAYMENT_CONFIRMED",
      paymentIntentId: "pi_abc",
      paymentIntentStatus: "succeeded",
      snapshot,
    });
    expect(next.paymentIntentId).toBe("pi_abc");
    expect(next.paymentIntentStatus).toBe("succeeded");
    expect(next.paymentError).toBeNull();
    expect(next.orderSnapshot).toEqual(snapshot);
  });

  it("PAYMENT_FAILED stores error message", () => {
    const next = checkoutReducer(buildValidPaymentState(), {
      type: "PAYMENT_FAILED",
      message: "Card declined",
    });
    expect(next.paymentError).toBe("Card declined");
  });
});

// ---------------------------------------------------------------------------
// checkoutReducer — submit actions
// ---------------------------------------------------------------------------

describe("checkoutReducer submit actions", () => {
  it("SUBMIT_START sets isSubmitting and clears submitError", () => {
    let state = createInitialCheckoutState();
    state = { ...state, submitError: "old" };
    const next = checkoutReducer(state, { type: "SUBMIT_START" });
    expect(next.isSubmitting).toBe(true);
    expect(next.submitError).toBeNull();
  });

  it("SUBMIT_SUCCESS moves to complete", () => {
    const state: CheckoutState = {
      ...createInitialCheckoutState(),
      step: "review",
      isSubmitting: true,
    };
    const next = checkoutReducer(state, { type: "SUBMIT_SUCCESS" });
    expect(next.step).toBe("complete");
    expect(next.isSubmitting).toBe(false);
    expect(next.submitSucceeded).toBe(true);
    expect(next.submitError).toBeNull();
  });

  it("SUBMIT_ERROR stores the error and stops submitting", () => {
    const state: CheckoutState = {
      ...createInitialCheckoutState(),
      isSubmitting: true,
    };
    const next = checkoutReducer(state, {
      type: "SUBMIT_ERROR",
      message: "Network failure",
    });
    expect(next.isSubmitting).toBe(false);
    expect(next.submitError).toBe("Network failure");
  });
});

// ---------------------------------------------------------------------------
// checkoutReducer — RESTORE_STATE
// ---------------------------------------------------------------------------

describe("checkoutReducer RESTORE_STATE", () => {
  it("restores a persisted snapshot into the current state", () => {
    const snapshot: PersistedCheckoutState = {
      step: "payment",
      shipping: {
        ...createInitialCheckoutState().shipping,
        fullName: "Restored User",
        email: "restored@mail.com",
      },
      payment: {
        method: "link",
        billingSameAsShipping: true,
        billingFullName: "",
        billingAddress: "",
        billingCity: "",
        billingPostalCode: "",
      },
      paymentIntentId: "pi_restored",
      paymentIntentStatus: "succeeded",
      paymentError: null,
      orderSnapshot: { items: [validCartItem], subtotal: 8900 },
    };

    const next = checkoutReducer(createInitialCheckoutState(), {
      type: "RESTORE_STATE",
      snapshot,
    });

    expect(next.step).toBe("payment");
    expect(next.shipping.fullName).toBe("Restored User");
    expect(next.payment.method).toBe("link");
    expect(next.paymentIntentId).toBe("pi_restored");
    expect(next.orderSnapshot?.subtotal).toBe(8900);
  });
});

// ---------------------------------------------------------------------------
// checkoutReducer — VALIDATE_STEP
// ---------------------------------------------------------------------------

describe("checkoutReducer VALIDATE_STEP", () => {
  it("merges step-specific errors, replacing old errors for the same step", () => {
    let state = createInitialCheckoutState();
    state = {
      ...state,
      errors: {
        "shipping.fullName": "old error",
        "payment.method": "kept across steps",
      },
    };
    const next = checkoutReducer(state, {
      type: "VALIDATE_STEP",
      step: "shipping",
      errors: { "shipping.email": "bad email" },
    });
    expect(next.errors["shipping.fullName"]).toBeUndefined();
    expect(next.errors["shipping.email"]).toBe("bad email");
    expect(next.errors["payment.method"]).toBe("kept across steps");
  });
});

// ---------------------------------------------------------------------------
// validateCheckoutStep
// ---------------------------------------------------------------------------

describe("validateCheckoutStep", () => {
  it("returns all shipping errors for an empty form", () => {
    const errors = validateCheckoutStep(createInitialCheckoutState(), "shipping");
    expect(errors["shipping.fullName"]).toBeDefined();
    expect(errors["shipping.email"]).toBeDefined();
    expect(errors["shipping.city"]).toBeDefined();
    expect(errors["shipping.street"]).toBeDefined();
    expect(errors["shipping.streetNumber"]).toBeDefined();
    expect(errors["shipping.reference"]).toBeDefined();
    expect(errors["shipping.postalCode"]).toBeDefined();
  });

  it("returns no shipping errors for a fully valid form", () => {
    const errors = validateCheckoutStep(buildValidShippingState(), "shipping");
    expect(errors).toEqual({});
  });

  it("validates apartment only if non-empty and too short", () => {
    let state = buildValidShippingState();
    state = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "shipping.apartment",
      value: "A",
    });
    const errors = validateCheckoutStep(state, "shipping");
    expect(errors["shipping.apartment"]).toBe("Apartment or suite is too short.");
  });

  it("does not error on apartment when it is empty", () => {
    const errors = validateCheckoutStep(buildValidShippingState(), "shipping");
    expect(errors["shipping.apartment"]).toBeUndefined();
  });

  it("returns payment method error when method is empty", () => {
    const state: CheckoutState = {
      ...buildValidShippingState(),
      step: "payment",
    };
    const errors = validateCheckoutStep(state, "payment");
    expect(errors["payment.method"]).toBe("Select a payment method.");
  });

  it("returns billing errors when billingSameAsShipping is false and fields are empty", () => {
    let state = buildValidPaymentState();
    state = checkoutReducer(state, {
      type: "SET_FIELD",
      field: "payment.billingSameAsShipping",
      value: false,
    });
    const errors = validateCheckoutStep(state, "payment");
    expect(errors["payment.billingFullName"]).toBeDefined();
    expect(errors["payment.billingAddress"]).toBeDefined();
    expect(errors["payment.billingCity"]).toBeDefined();
    expect(errors["payment.billingPostalCode"]).toBeDefined();
  });

  it("returns no billing errors when billingSameAsShipping is true", () => {
    const state = buildValidPaymentState();
    const errors = validateCheckoutStep(state, "payment");
    expect(errors["payment.billingFullName"]).toBeUndefined();
    expect(errors["payment.billingAddress"]).toBeUndefined();
    expect(errors["payment.billingCity"]).toBeUndefined();
    expect(errors["payment.billingPostalCode"]).toBeUndefined();
  });

  it("validates payment fields even for the review step", () => {
    const state: CheckoutState = {
      ...buildValidPaymentState(),
      step: "review",
    };
    const errors = validateCheckoutStep(state, "review");
    expect(errors).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// parsePersistedCheckoutState
// ---------------------------------------------------------------------------

describe("parsePersistedCheckoutState", () => {
  it("returns null for null input", () => {
    expect(parsePersistedCheckoutState(null)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parsePersistedCheckoutState("")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parsePersistedCheckoutState("{not valid json")).toBeNull();
  });

  it("returns null for a non-object JSON", () => {
    expect(parsePersistedCheckoutState('"just a string"')).toBeNull();
  });

  it("returns null when step is not editable", () => {
    expect(
      parsePersistedCheckoutState(JSON.stringify({ step: "complete", shipping: {}, payment: {} })),
    ).toBeNull();
  });

  it("returns null when shipping is missing", () => {
    expect(
      parsePersistedCheckoutState(JSON.stringify({ step: "shipping", payment: {} })),
    ).toBeNull();
  });

  it("returns null when payment is missing", () => {
    expect(
      parsePersistedCheckoutState(JSON.stringify({ step: "shipping", shipping: {} })),
    ).toBeNull();
  });

  it("parses a valid persisted state", () => {
    const persisted = {
      step: "shipping",
      shipping: {
        fullName: "Jane",
        email: "jane@example.com",
        country: "US",
        city: "New York",
        street: "Broadway",
        streetNumber: "10",
        apartment: "",
        reference: "Lobby",
        postalCode: "10001",
        shippingMethod: "premium",
      },
      payment: {
        method: "card",
        billingSameAsShipping: true,
        billingFullName: "",
        billingAddress: "",
        billingCity: "",
        billingPostalCode: "",
      },
      paymentIntentId: null,
      paymentIntentStatus: null,
      paymentError: null,
      orderSnapshot: null,
    };

    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result).not.toBeNull();
    expect(result!.step).toBe("shipping");
    expect(result!.shipping.fullName).toBe("Jane");
    expect(result!.shipping.shippingMethod).toBe("premium");
    expect(result!.payment.method).toBe("card");
  });

  it("falls back to DEFAULT_COUNTRY for unsupported country", () => {
    const persisted = {
      step: "shipping",
      shipping: { country: "ZZ", city: "Unknown" },
      payment: {},
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.shipping.country).toBe("US");
    expect(result!.shipping.city).toBe("");
  });

  it("falls back to DEFAULT_SHIPPING_METHOD for invalid shipping method", () => {
    const persisted = {
      step: "shipping",
      shipping: { shippingMethod: "teleport" },
      payment: {},
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.shipping.shippingMethod).toBe("standard");
  });

  it("resets payment method to empty for invalid value", () => {
    const persisted = {
      step: "payment",
      shipping: {},
      payment: { method: "bitcoin" },
      paymentIntentStatus: "succeeded",
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.payment.method).toBe("");
  });

  it("defaults billingSameAsShipping to true when not a boolean", () => {
    const persisted = {
      step: "payment",
      shipping: {},
      payment: { billingSameAsShipping: "yes" },
      paymentIntentStatus: "succeeded",
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.payment.billingSameAsShipping).toBe(true);
  });

  it("downgrades review step to payment when paymentIntentStatus is missing", () => {
    const persisted = {
      step: "review",
      shipping: {},
      payment: {},
      paymentIntentStatus: null,
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.step).toBe("payment");
  });

  it("keeps review step when paymentIntentStatus is present", () => {
    const persisted = {
      step: "review",
      shipping: {},
      payment: {},
      paymentIntentStatus: "succeeded",
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.step).toBe("review");
  });

  it("falls back to address field when street is missing", () => {
    const persisted = {
      step: "shipping",
      shipping: { address: "Legacy Address Field" },
      payment: {},
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.shipping.street).toBe("Legacy Address Field");
  });

  it("parses a valid order snapshot with cart items", () => {
    const persisted = {
      step: "payment",
      shipping: {},
      payment: {},
      paymentIntentStatus: "succeeded",
      orderSnapshot: {
        items: [
          {
            id: "item-1",
            productId: "prod-1",
            name: "Silk Piece",
            slug: "silk-piece",
            size: "S",
            imageUrl: "/img.jpg",
            palette: ["#fff", "#000"],
            priceCents: 5000,
            quantity: 2,
          },
        ],
        subtotal: 10000,
      },
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.orderSnapshot).not.toBeNull();
    expect(result!.orderSnapshot!.items).toHaveLength(1);
    expect(result!.orderSnapshot!.subtotal).toBe(10000);
  });

  it("filters out invalid items from order snapshot", () => {
    const persisted = {
      step: "payment",
      shipping: {},
      payment: {},
      paymentIntentStatus: "succeeded",
      orderSnapshot: {
        items: [
          {
            id: "good",
            productId: "p1",
            name: "A",
            slug: "a",
            size: "M",
            imageUrl: "/a.jpg",
            palette: ["#a", "#b"],
            priceCents: 100,
            quantity: 1,
          },
          { id: null, productId: "p2" },
          "not an object",
        ],
        subtotal: 100,
      },
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.orderSnapshot!.items).toHaveLength(1);
  });

  it("returns null snapshot when all items are invalid", () => {
    const persisted = {
      step: "payment",
      shipping: {},
      payment: {},
      paymentIntentStatus: "succeeded",
      orderSnapshot: {
        items: [{ broken: true }],
        subtotal: 0,
      },
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.orderSnapshot).toBeNull();
  });

  it("defaults subtotal to 0 when not a number", () => {
    const persisted = {
      step: "payment",
      shipping: {},
      payment: {},
      paymentIntentStatus: "succeeded",
      orderSnapshot: {
        items: [
          {
            id: "i1",
            productId: "p1",
            name: "A",
            slug: "a",
            size: "L",
            imageUrl: "/a.jpg",
            palette: ["#a", "#b"],
            priceCents: 100,
            quantity: 1,
          },
        ],
        subtotal: "not-a-number",
      },
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.orderSnapshot!.subtotal).toBe(0);
  });

  it("handles item with invalid palette (wrong length)", () => {
    const persisted = {
      step: "payment",
      shipping: {},
      payment: {},
      paymentIntentStatus: "succeeded",
      orderSnapshot: {
        items: [
          {
            id: "i1",
            productId: "p1",
            name: "A",
            slug: "a",
            size: "M",
            imageUrl: "/a.jpg",
            palette: ["#a"],
            priceCents: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
      },
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.orderSnapshot).toBeNull();
  });

  it("handles item with invalid size", () => {
    const persisted = {
      step: "payment",
      shipping: {},
      payment: {},
      paymentIntentStatus: "succeeded",
      orderSnapshot: {
        items: [
          {
            id: "i1",
            productId: "p1",
            name: "A",
            slug: "a",
            size: "XXL",
            imageUrl: "/a.jpg",
            palette: ["#a", "#b"],
            priceCents: 100,
            quantity: 1,
          },
        ],
        subtotal: 100,
      },
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.orderSnapshot).toBeNull();
  });

  it("handles non-array orderSnapshot.items", () => {
    const persisted = {
      step: "shipping",
      shipping: {},
      payment: {},
      orderSnapshot: { items: "not-an-array", subtotal: 0 },
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.orderSnapshot).toBeNull();
  });

  it("handles orderSnapshot that is not a record", () => {
    const persisted = {
      step: "shipping",
      shipping: {},
      payment: {},
      orderSnapshot: "string",
    };
    const result = parsePersistedCheckoutState(JSON.stringify(persisted));
    expect(result!.orderSnapshot).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

describe("isSuccessfulPaymentStatus", () => {
  it("returns true for succeeded", () => {
    expect(isSuccessfulPaymentStatus("succeeded")).toBe(true);
  });

  it("returns true for processing", () => {
    expect(isSuccessfulPaymentStatus("processing")).toBe(true);
  });

  it("returns true for requires_capture", () => {
    expect(isSuccessfulPaymentStatus("requires_capture")).toBe(true);
  });

  it("returns false for failed", () => {
    expect(isSuccessfulPaymentStatus("failed")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isSuccessfulPaymentStatus(null)).toBe(false);
  });
});

describe("isFailedRedirectStatus", () => {
  it("returns true for failed", () => {
    expect(isFailedRedirectStatus("failed")).toBe(true);
  });

  it("returns true for canceled", () => {
    expect(isFailedRedirectStatus("canceled")).toBe(true);
  });

  it("returns false for succeeded", () => {
    expect(isFailedRedirectStatus("succeeded")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isFailedRedirectStatus(null)).toBe(false);
  });
});

describe("formatShippingAddress", () => {
  it("formats a full address with apartment and reference", () => {
    const lines = formatShippingAddress({
      ...createInitialCheckoutState().shipping,
      streetNumber: "350",
      street: "Fifth Avenue",
      apartment: "4B",
      reference: "Front desk lobby",
    });
    expect(lines[0]).toBe("350 Fifth Avenue");
    expect(lines[1]).toBe("4B • Front desk lobby");
  });

  it("omits the second line when apartment and reference are empty", () => {
    const lines = formatShippingAddress({
      ...createInitialCheckoutState().shipping,
      streetNumber: "10",
      street: "Broadway",
      apartment: "",
      reference: "",
    });
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe("10 Broadway");
  });

  it("shows only reference when apartment is empty", () => {
    const lines = formatShippingAddress({
      ...createInitialCheckoutState().shipping,
      streetNumber: "42",
      street: "Main St",
      apartment: "",
      reference: "By the park",
    });
    expect(lines).toHaveLength(2);
    expect(lines[1]).toBe("By the park");
  });
});

describe("createOrderSnapshot", () => {
  it("creates a snapshot with shallow copies of items", () => {
    const items = [validCartItem];
    const snapshot = createOrderSnapshot(items, 8900);
    expect(snapshot.items).toHaveLength(1);
    expect(snapshot.subtotal).toBe(8900);
    expect(snapshot.items[0]).not.toBe(items[0]);
    expect(snapshot.items[0]).toEqual(items[0]);
  });

  it("returns empty items for an empty cart", () => {
    const snapshot = createOrderSnapshot([], 0);
    expect(snapshot.items).toHaveLength(0);
    expect(snapshot.subtotal).toBe(0);
  });
});
