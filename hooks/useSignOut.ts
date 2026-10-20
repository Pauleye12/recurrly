import { formatAuthError } from "@/lib/auth-helpers";
import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";

export interface UseSignOutOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  redirectTo?: string;
}

export function useSignOut(options: UseSignOutOptions = {}) {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSignOut = useCallback(async () => {
    try {
      setIsSigningOut(true);
      setError(null);
      await signOut();
      options.onSuccess?.();
      const destination = options.redirectTo ?? "/(auth)/SignIn";
      router.replace(destination as any);
      return { success: true };
    } catch (err: any) {
      console.error("[useSignOut] Error signing out:", err);
      const friendlyMessage = formatAuthError(err);
      setError(friendlyMessage);
      options.onError?.(err);
      return { success: false, error: friendlyMessage };
    } finally {
      setIsSigningOut(false);
    }
  }, [signOut, router, options]);

  return {
    signOut: executeSignOut,
    isSigningOut,
    error,
    clearError: () => setError(null),
  };
}
