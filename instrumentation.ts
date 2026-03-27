export async function register() {
  try {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("./sentry.server.config");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      await import("./sentry.edge.config");
    }
  } catch {
    // Sentry config may fail to load in Turbopack dev mode — safe to skip
  }
}

export const onRequestError = async (
  ...args: Parameters<NonNullable<typeof import("@sentry/nextjs").captureRequestError>>
) => {
  try {
    const { captureRequestError } = await import("@sentry/nextjs");
    captureRequestError(...args);
  } catch {
    // Sentry may not be available in dev
  }
};
