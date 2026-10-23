import { formatAuthError, validateEmail, validatePassword } from "@/lib/auth-helpers";
import { posthog } from "@/lib/posthog";
import { useSignUp } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useSignUp();

  // Registration Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verification Step State
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Resend Countdown Timer
  useEffect(() => {
    if (!isVerifying || resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isVerifying, resendCountdown]);

  // Handle Account Creation
  const handleSignUp = async () => {
    Keyboard.dismiss();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name");
      return;
    }
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setErrorMsg(emailVal.error || "Please enter a valid email address");
      return;
    }
    const passVal = validatePassword(password);
    if (!passVal.isValid) {
      setErrorMsg(passVal.error || "Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const parts = fullName.trim().split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ") || undefined;

      const { error } = await signUp.password({
        emailAddress: email.trim().toLowerCase(),
        password,
        firstName,
        lastName,
      });

      if (error) {
        setErrorMsg(formatAuthError(error));
        setIsLoading(false);
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setErrorMsg(formatAuthError(sendError));
        setIsLoading(false);
        return;
      }

      setIsVerifying(true);
      setResendCountdown(60);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Code Verification
  const handleVerify = async () => {
    Keyboard.dismiss();
    setErrorMsg(null);

    if (code.trim().length < 6) {
      setErrorMsg("Please enter the complete 6-digit code");
      return;
    }

    setIsVerifyLoading(true);

    try {
      const { error: verifyErr } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (verifyErr) {
        setErrorMsg(formatAuthError(verifyErr));
        setIsVerifyLoading(false);
        return;
      }

      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setErrorMsg(formatAuthError(finalizeError));
        setIsVerifyLoading(false);
        return;
      }

      posthog?.capture("user_signed_up", { auth_method: "password" });
      router.replace("/(tabs)");
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsVerifyLoading(false);
    }
  };

  // Handle Resend Code
  const handleResendCode = async () => {
    if (resendCountdown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg(null);

    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) {
        setErrorMsg(formatAuthError(error));
      } else {
        setResendCountdown(60);
      }
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff9e3" }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingVertical: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header: Logo squircle + Wordmark */}
            <View className="items-center">
              <View className="flex-row items-center gap-3">
                <View className="size-14 items-center justify-center rounded-2xl bg-accent shadow-sm">
                  <Text className="text-3xl font-sans-extrabold text-white">R</Text>
                </View>
                <View>
                  <Text className="text-2xl font-sans-extrabold tracking-tight text-primary">
                    Recurly
                  </Text>
                  <Text className="-mt-0.5 text-[11px] font-sans-bold uppercase tracking-[1.5px] text-[#4A5568]">
                    SMART BILLING
                  </Text>
                </View>
              </View>

              {/* Title & Subtitle */}
              <Text className="mt-9 text-center text-3xl font-sans-bold text-primary">
                {isVerifying ? "Verify your email" : "Create an account"}
              </Text>
              <Text className="mt-2 text-center text-base font-sans-medium text-[#4A5568]">
                {isVerifying
                  ? `Enter the 6-digit code sent to ${email}`
                  : "Sign up to continue managing your subscriptions"}
              </Text>
            </View>

            {/* Card Container */}
            <View className="mt-8 rounded-[28px] border border-[#ebddb7] bg-[#fff6db] p-6">
              {/* Error Alert */}
              {errorMsg ? (
                <View className="mb-4 flex-row items-center gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5">
                  <Ionicons name="alert-circle" size={18} color="#dc2626" />
                  <Text className="flex-1 text-xs font-sans-medium text-destructive">
                    {errorMsg}
                  </Text>
                </View>
              ) : null}

              {isVerifying ? (
                /* Verification View */
                <View>
                  <View className="mb-6">
                    <Text className="mb-2 text-sm font-sans-bold text-primary">
                      Verification code
                    </Text>
                    <TextInput
                      className="h-[52px] rounded-2xl border border-[#d8caa6] bg-[#fffdf6] px-4 text-center text-xl font-sans-bold tracking-[8px] text-primary"
                      placeholder="123456"
                      placeholderTextColor="#4B5874"
                      value={code}
                      onChangeText={(t) => {
                        const numeric = t.replace(/[^0-9]/g, "").slice(0, 6);
                        setCode(numeric);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                      editable={!isVerifyLoading}
                    />
                  </View>

                  <TouchableOpacity
                    className={`h-[52px] items-center justify-center rounded-2xl bg-accent ${
                      isVerifyLoading || code.length < 6 ? "opacity-60" : ""
                    }`}
                    onPress={handleVerify}
                    disabled={isVerifyLoading || code.length < 6}
                    activeOpacity={0.85}
                  >
                    {isVerifyLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text className="text-base font-sans-bold text-white">
                        Verify code
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Resend & Change email */}
                  <View className="mt-5 items-center gap-2">
                    {resendCountdown > 0 ? (
                      <Text className="text-xs font-sans-medium text-[#4A5568]">
                        Resend code in{" "}
                        <Text className="font-sans-bold text-primary">
                          {resendCountdown}s
                        </Text>
                      </Text>
                    ) : (
                      <TouchableOpacity
                        onPress={handleResendCode}
                        disabled={isResending}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        {isResending ? (
                          <ActivityIndicator size="small" color="#ea7a53" />
                        ) : (
                          <Text className="text-sm font-sans-bold text-accent">
                            Resend code
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => {
                        setIsVerifying(false);
                        setCode("");
                        setErrorMsg(null);
                      }}
                      className="py-1"
                    >
                      <Text className="text-xs font-sans-semibold text-[#4A5568]">
                        Change email address
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* Registration Form */
                <View>
                  {/* Full Name */}
                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-sans-bold text-primary">
                      Full name
                    </Text>
                    <TextInput
                      className="h-[52px] rounded-2xl border border-[#d8caa6] bg-[#fffdf6] px-4 text-base font-sans-medium text-primary"
                      placeholder="Enter your full name"
                      placeholderTextColor="#4B5874"
                      value={fullName}
                      onChangeText={(t) => {
                        setFullName(t);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      autoCapitalize="words"
                      editable={!isLoading}
                    />
                  </View>

                  {/* Email */}
                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-sans-bold text-primary">
                      Email
                    </Text>
                    <TextInput
                      className="h-[52px] rounded-2xl border border-[#d8caa6] bg-[#fffdf6] px-4 text-base font-sans-medium text-primary"
                      placeholder="Enter your email"
                      placeholderTextColor="#4B5874"
                      value={email}
                      onChangeText={(t) => {
                        setEmail(t);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>

                  {/* Password */}
                  <View className="mb-4">
                    <Text className="mb-2 text-sm font-sans-bold text-primary">
                      Password
                    </Text>
                    <View className="relative justify-center">
                      <TextInput
                        className="h-[52px] rounded-2xl border border-[#d8caa6] bg-[#fffdf6] pl-4 pr-12 text-base font-sans-medium text-primary"
                        placeholder="Enter your password"
                        placeholderTextColor="#4B5874"
                        value={password}
                        onChangeText={(t) => {
                          setPassword(t);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        className="absolute right-4 p-1"
                        onPress={() => setShowPassword((prev) => !prev)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color="#4A5568"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View className="mb-6">
                    <Text className="mb-2 text-sm font-sans-bold text-primary">
                      Confirm password
                    </Text>
                    <View className="relative justify-center">
                      <TextInput
                        className="h-[52px] rounded-2xl border border-[#d8caa6] bg-[#fffdf6] pl-4 pr-12 text-base font-sans-medium text-primary"
                        placeholder="Confirm your password"
                        placeholderTextColor="#4B5874"
                        value={confirmPassword}
                        onChangeText={(t) => {
                          setConfirmPassword(t);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                      <TouchableOpacity
                        className="absolute right-4 p-1"
                        onPress={() => setShowConfirmPassword((prev) => !prev)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                          size={20}
                          color="#4A5568"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Create Account Button */}
                  <TouchableOpacity
                    className={`h-[52px] items-center justify-center rounded-2xl bg-accent ${
                      isLoading ? "opacity-60" : ""
                    }`}
                    onPress={handleSignUp}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text className="text-base font-sans-bold text-white">
                        Create an account
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Bottom link inside the card */}
                  <View className="mt-6 flex-row items-center justify-center gap-1">
                    <Text className="text-sm font-sans-medium text-[#4A5568]">
                      Already have an account?
                    </Text>
                    <Link href="/(auth)/SignIn" asChild>
                      <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text className="text-sm font-sans-bold text-accent">
                          Sign in
                        </Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
