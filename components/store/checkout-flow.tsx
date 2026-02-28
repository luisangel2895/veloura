"use client";

import { useReducer } from "react";
import Link from "next/link";

import { Price } from "@/components/store/price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";

type CheckoutStep = "shipping" | "payment" | "review" | "complete";

interface CheckoutState {
  step: CheckoutStep;
  shipping: {
    fullName: string;
    email: string;
    address: string;
    city: string;
  };
  payment: {
    cardName: string;
    cardNumber: string;
    expiry: string;
  };
}

type CheckoutAction =
  | { type: "UPDATE_SHIPPING"; field: keyof CheckoutState["shipping"]; value: string }
  | { type: "UPDATE_PAYMENT"; field: keyof CheckoutState["payment"]; value: string }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "COMPLETE" };

const order: CheckoutStep[] = ["shipping", "payment", "review", "complete"];

const initialState: CheckoutState = {
  step: "shipping",
  shipping: {
    fullName: "",
    email: "",
    address: "",
    city: "",
  },
  payment: {
    cardName: "",
    cardNumber: "",
    expiry: "",
  },
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case "UPDATE_SHIPPING":
      return {
        ...state,
        shipping: {
          ...state.shipping,
          [action.field]: action.value,
        },
      };
    case "UPDATE_PAYMENT":
      return {
        ...state,
        payment: {
          ...state.payment,
          [action.field]: action.value,
        },
      };
    case "NEXT": {
      const nextIndex = Math.min(order.indexOf(state.step) + 1, order.length - 1);
      return {
        ...state,
        step: order[nextIndex],
      };
    }
    case "BACK": {
      const prevIndex = Math.max(order.indexOf(state.step) - 1, 0);
      return {
        ...state,
        step: order[prevIndex],
      };
    }
    case "COMPLETE":
      return {
        ...state,
        step: "complete",
      };
    default:
      return state;
  }
}

function StepMarker({ current, target }: { current: CheckoutStep; target: CheckoutStep }) {
  const active = order.indexOf(current) >= order.indexOf(target);

  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold ${
          active
            ? "border-amber-300 bg-amber-300 text-zinc-950"
            : "border-amber-500/20 text-muted-foreground"
        }`}
      >
        {order.indexOf(target) + 1}
      </span>
      <span className={active ? "text-foreground" : "text-muted-foreground"}>{target}</span>
    </div>
  );
}

export function CheckoutFlow() {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  const hasHydrated = useCart((cart) => cart.hasHydrated);
  const { items, subtotal, clearCart } = useCart((cart) => ({
    items: cart.items,
    subtotal: cart.subtotal,
    clearCart: cart.clearCart,
  }));

  if (!hasHydrated) {
    return (
      <div className="rounded-[2rem] border border-amber-500/10 bg-card/70 px-6 py-16 text-center">
        <h1 className="text-5xl font-semibold">Checkout</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          Loading the latest cart snapshot before entering checkout.
        </p>
      </div>
    );
  }

  if (!items.length && state.step !== "complete") {
    return (
      <div className="rounded-[2rem] border border-dashed border-amber-500/20 bg-card/70 px-6 py-16 text-center">
        <h1 className="text-5xl font-semibold">Checkout</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          Add at least one item before entering the reducer-driven checkout flow.
        </p>
        <Button asChild className="mt-8 rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200">
          <Link href="/">Browse products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6 rounded-[2rem] border border-amber-500/10 bg-card/75 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-amber-200">
            Reducer state machine
          </p>
          <h1 className="text-5xl font-semibold">Checkout</h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {order.map((step) => (
            <StepMarker key={step} current={state.step} target={step} />
          ))}
        </div>

        {state.step === "shipping" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Full name"
              value={state.shipping.fullName}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_SHIPPING",
                  field: "fullName",
                  value: event.target.value,
                })
              }
            />
            <Input
              placeholder="Email"
              value={state.shipping.email}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_SHIPPING",
                  field: "email",
                  value: event.target.value,
                })
              }
            />
            <Input
              placeholder="Address"
              value={state.shipping.address}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_SHIPPING",
                  field: "address",
                  value: event.target.value,
                })
              }
              className="sm:col-span-2"
            />
            <Input
              placeholder="City"
              value={state.shipping.city}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_SHIPPING",
                  field: "city",
                  value: event.target.value,
                })
              }
            />
          </div>
        ) : null}

        {state.step === "payment" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              placeholder="Cardholder"
              value={state.payment.cardName}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_PAYMENT",
                  field: "cardName",
                  value: event.target.value,
                })
              }
              className="sm:col-span-2"
            />
            <Input
              placeholder="Card number"
              value={state.payment.cardNumber}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_PAYMENT",
                  field: "cardNumber",
                  value: event.target.value,
                })
              }
              className="sm:col-span-2"
            />
            <Input
              placeholder="Expiry"
              value={state.payment.expiry}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_PAYMENT",
                  field: "expiry",
                  value: event.target.value,
                })
              }
            />
          </div>
        ) : null}

        {state.step === "review" ? (
          <div className="space-y-4 rounded-3xl border border-amber-500/10 bg-background/40 p-5">
            <div>
              <p className="text-sm font-medium">Shipping</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {state.shipping.fullName || "Guest"} • {state.shipping.email || "email pending"}
                <br />
                {state.shipping.address || "address pending"} • {state.shipping.city || "city pending"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Payment</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {state.payment.cardName || "Cardholder pending"} ••••{" "}
                {state.payment.cardNumber.slice(-4) || "0000"} • {state.payment.expiry || "MM/YY"}
              </p>
            </div>
          </div>
        ) : null}

        {state.step === "complete" ? (
          <div className="rounded-3xl border border-amber-500/10 bg-amber-500/8 p-6">
            <p className="font-[family-name:var(--font-display)] text-4xl font-semibold">
              Order confirmed.
            </p>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              The flow is complete and the reducer has transitioned to the terminal state. Cart
              data was cleared separately via Zustand to keep concerns isolated.
            </p>
            <Button asChild className="mt-6 rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200">
              <Link href="/">Return to the atelier</Link>
            </Button>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {state.step !== "shipping" && state.step !== "complete" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: "BACK" })}
              className="border-amber-500/20 bg-transparent hover:bg-amber-500/10"
            >
              Back
            </Button>
          ) : null}

          {state.step === "review" ? (
            <Button
              type="button"
              onClick={() => {
                clearCart();
                dispatch({ type: "COMPLETE" });
              }}
              className="rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200"
            >
              Confirm order
            </Button>
          ) : null}

          {state.step !== "review" && state.step !== "complete" ? (
            <Button
              type="button"
              onClick={() => dispatch({ type: "NEXT" })}
              className="rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200"
            >
              Continue
            </Button>
          ) : null}
        </div>
      </section>

      <aside className="h-fit rounded-[2rem] border border-amber-500/10 bg-card/75 p-6 sm:p-8">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-amber-200">
          Order summary
        </p>
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
              <div>
                <p>{item.name}</p>
                <p className="text-muted-foreground">
                  {item.quantity} x size {item.size}
                </p>
              </div>
              <Price amountCents={item.priceCents * item.quantity} className="font-medium" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-amber-500/10 pt-6">
          <span className="text-muted-foreground">Subtotal</span>
          <Price amountCents={subtotal} className="text-2xl font-semibold" />
        </div>
      </aside>
    </div>
  );
}
