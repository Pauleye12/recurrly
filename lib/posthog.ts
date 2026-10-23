import PostHog from "posthog-react-native";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;
const isPostHogConfigured = Boolean(projectToken && host);

if (!isPostHogConfigured && __DEV__) {
  const missingVariable = projectToken
    ? "EXPO_PUBLIC_POSTHOG_HOST"
    : "EXPO_PUBLIC_POSTHOG_KEY";

  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

export const posthog =
  projectToken && host
    ? new PostHog(projectToken, {
        host,
        flushAt: __DEV__ ? 1 : 20,
        flushInterval: __DEV__ ? 1000 : 30000,
        enableSessionReplay: true,
        captureAppLifecycleEvents: true,
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
            console: [],
          },
        },
        logs: {
          serviceName: "recurrly-mobile",
          serviceVersion: "1.0.0",
          environment: __DEV__ ? "development" : "production",
        },
      })
    : undefined;

export const posthogLog = {
  info(message: string, attributes?: Record<string, string>) {
    posthog?.logger.info(message, attributes);
  },
};
