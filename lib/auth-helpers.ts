/**
 * Recurrly Authentication Helpers & Validation Utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: "Email address is required" };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }
  if (password.length < 15) {
    return { isValid: false, error: "Password must be at least 15 characters" };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      error: "Include at least one letter and one number",
    };
  }
  return { isValid: true };
};

export const validateName = (name: string): ValidationResult => {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, error: "Full name is required" };
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters" };
  }
  return { isValid: true };
};

export const getPasswordStrength = (
  password: string,
): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: "", color: "#e5e7eb" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[0-9]/.test(password)) score++;
  if (
    /[^A-Za-z0-9]/.test(password) ||
    (/[a-z]/.test(password) && /[A-Z]/.test(password))
  ) {
    score++;
  }

  if (score <= 1) return { score: 1, label: "Weak", color: "#dc2626" };
  if (score === 2) return { score: 2, label: "Fair", color: "#ea7a53" };
  if (score === 3) return { score: 3, label: "Good", color: "#eab308" };
  return { score: 4, label: "Strong", color: "#16a34a" };
};

/**
 * Format Clerk authentication errors into clean, brand-aligned, human-readable text
 * without exposing technical terminology or internal engine names.
 */
export const formatAuthError = (err: any): string => {
  if (!err) return "An unexpected error occurred. Please try again.";

  // Handle Clerk API Error arrays
  const clerkError =
    err?.errors?.[0] || (Array.isArray(err) ? err[0] : null) || err;

  const code = clerkError?.code || "";
  const rawMessage =
    clerkError?.longMessage || clerkError?.message || err?.message || "";

  switch (code) {
    case "form_identifier_not_found":
      return "No Recurrly account found with this email. Please check your spelling or create an account.";
    case "form_password_incorrect":
      return "The password you entered is incorrect. Please try again or tap 'Forgot password'.";
    case "form_password_pwned":
      return "This password has appeared in a known data breach. For your security, please choose a stronger password.";
    case "form_password_length_too_short":
      return "Password must be at least 8 characters long.";
    case "form_identifier_exists":
      return "An account with this email address already exists. Please sign in instead.";
    case "form_code_incorrect":
      return "The 6-digit verification code is incorrect. Please double check and try again.";
    case "verification_expired":
      return "This verification code has expired. Please tap 'Resend code' to get a new one.";
    case "session_not_found":
    case "resource_not_found":
      return "Your session has expired. Please sign in again.";
    case "session_exists":
      return "You are already signed in on this device.";
    case "strategy_for_user_invalid":
      return "This sign-in method is not enabled for your account. Please use password or Google sign in.";
    case "too_many_attempts":
      return "Too many attempts. For your security, please wait a minute before trying again.";
    default:
      if (rawMessage && !rawMessage.toLowerCase().includes("clerk")) {
        return rawMessage;
      }
      return "Unable to complete request. Please verify your details and try again.";
  }
};

/**
 * Returns formatted confirmation text for signing out
 */
export const formatSignOutConfirmation = (
  userName?: string | null,
): { title: string; message: string } => {
  const name = userName ? `, ${userName}` : "";
  return {
    title: "Sign Out",
    message: `Are you sure you want to sign out${name}? You will need your login credentials to access your subscriptions again.`,
  };
};
