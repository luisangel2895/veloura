import { describe, expect, it } from "vitest";

import {
  checkoutReducer,
  createInitialCheckoutState,
  validateCheckoutStep,
  type CheckoutAction,
  type CheckoutState,
} from "@/lib/checkout/checkout-machine";

function dispatchSequence(
  initialState: CheckoutState,
  actions: CheckoutAction[],
) {
  return actions.reduce(checkoutReducer, initialState);
}

function buildValidShippingState() {
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
        snapshot: {
          items: [],
          subtotal: 0,
        },
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
