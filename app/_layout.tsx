import "@/global.css";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import {
  SplashScreen,
  Stack,
  usePathname,
  useRouter,
  useSegments,
} from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { PostHogProvider, usePostHog } from "posthog-react-native";
import { useEffect, useRef } from "react";

import { SubscriptionsProvider } from "@/context/SubscriptionsContext";
import { posthog } from "@/lib/posthog";

// Enable browser session completion for OAuth/SSO
WebBrowser.maybeCompleteAuthSession();

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file");
}

function PostHogIdentity() {
  const { user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      identifiedUserId.current = null;
      return;
    }

    if (!posthog || identifiedUserId.current === user.id) return;

    const email = user.primaryEmailAddress?.emailAddress;
    const name = user.fullName;

    posthog.identify(user.id, {
      ...(email ? { email } : {}),
      ...(name ? { name } : {}),
    });
    identifiedUserId.current = user.id;
  }, [user]);

  return null;
}

function PostHogScreenTracking() {
  const posthog = usePostHog(); // ← gets the client from context
  const pathname = usePathname();

  useEffect(() => {
    posthog?.screen(pathname);
  }, [pathname, posthog]);

  return null;
}

function InitialLayout({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !fontsLoaded) return;

    const segmentList = segments as string[];
    const inAuthGroup =
      segmentList.includes("(auth)") ||
      segmentList.includes("SignIn") ||
      segmentList.includes("SignUp") ||
      segmentList[0] === "onboarding";

    if (!isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/SignIn");
    } else if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [isSignedIn, isLoaded, fontsLoaded, segments, router]);

  useEffect(() => {
    if (fontsLoaded && isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoaded]);

  if (!fontsLoaded || !isLoaded) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#fff9e3" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="subscription/[id]" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  const app = (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <SubscriptionsProvider>
        <PostHogScreenTracking />
        <PostHogIdentity />
        <InitialLayout fontsLoaded={fontsLoaded} />
      </SubscriptionsProvider>
    </ClerkProvider>
  );

  return posthog ? (
    <PostHogProvider client={posthog} autocapture={true} debug={__DEV__}>
      {app}
    </PostHogProvider>
  ) : (
    app
  );
}
