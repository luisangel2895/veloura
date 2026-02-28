interface MockStripePaymentIntent {
  id: string;
  status: string;
}

interface MockStripeConfirmPaymentResult {
  paymentIntent?: MockStripePaymentIntent;
}

interface MockStripeElement {
  mount: (target: string | HTMLElement) => void;
  unmount: () => void;
  destroy: () => void;
}

interface MockStripeElements {
  create: (type: "payment") => MockStripeElement;
}

interface MockStripeInstance {
  elements: () => MockStripeElements;
  confirmPayment: () => Promise<MockStripeConfirmPaymentResult>;
}

interface Window {
  Stripe?: () => MockStripeInstance;
}
