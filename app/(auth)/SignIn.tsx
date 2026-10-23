import { formatAuthError, validateEmail } from "@/lib/auth-helpers";
import { posthog, posthogLog } from "@/lib/posthog";
import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
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

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useSignIn();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password Sub-flow
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);

  // Sign In Handler
  const handleSignIn = async () => {
    Keyboard.dismiss();
    setErrorMsg(null);

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setErrorMsg(emailVal.error || "Please enter a valid email address");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn.password({
        identifier: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrorMsg(formatAuthError(error));
        setIsLoading(false);
        return;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setErrorMsg(formatAuthError(finalizeError));
          setIsLoading(false);
          return;
        }
        posthog?.capture("user_signed_in", { auth_method: "password" });
        posthogLog.info("password sign-in completed", {
          authentication_method: "password",
        });
        router.replace("/(tabs)");
      } else {
        setErrorMsg("Please check your email to complete verification.");
      }
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password - Step 1: Send Code
  const handleSendResetCode = async () => {
    Keyboard.dismiss();
    setErrorMsg(null);
    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      setErrorMsg(emailVal.error || "Please enter a valid email address");
      return;
    }

    setIsResetLoading(true);

    try {
      await signIn.create({
        identifier: email.trim().toLowerCase(),
      });

      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        setErrorMsg(formatAuthError(error));
        setIsResetLoading(false);
        return;
      }
      setResetStep(2);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsResetLoading(false);
    }
  };

  // Forgot Password - Step 2: Verify & Submit New Password
  const handleResetSubmit = async () => {
    Keyboard.dismiss();
    setErrorMsg(null);

    if (!resetCode.trim()) {
      setErrorMsg("Please enter the 6-digit verification code");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long");
      return;
    }

    setIsResetLoading(true);

    try {
      const { error: verifyErr } = await signIn.resetPasswordEmailCode.verifyCode({
        code: resetCode.trim(),
      });
      if (verifyErr) {
        setErrorMsg(formatAuthError(verifyErr));
        setIsResetLoading(false);
        return;
      }

      const { error: submitErr } =
        await signIn.resetPasswordEmailCode.submitPassword({
          password: newPassword,
        });
      if (submitErr) {
        setErrorMsg(formatAuthError(submitErr));
        setIsResetLoading(false);
        return;
      }

      const { error: finalizeErr } = await signIn.finalize();
      if (finalizeErr) {
        setErrorMsg(formatAuthError(finalizeErr));
        setIsResetLoading(false);
        return;
      }

      posthog?.capture("password_reset_completed");
      router.replace("/(tabs)");
    } catch (err: any) {
      setErrorMsg(formatAuthError(err));
    } finally {
      setIsResetLoading(false);
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
                {isResetMode ? "Reset password" : "Welcome back"}
              </Text>
              <Text className="mt-2 text-center text-base font-sans-medium text-[#4A5568]">
                {isResetMode
                  ? resetStep === 1
                    ? "Enter your email to receive a password reset code"
                    : `Enter the code sent to ${email} and your new password`
                  : "Sign in to continue managing your subscriptions"}
              </Text>
            </View>

            {/* Card Container strictly following the design */}
            <View className="mt-8 rounded-[28px] border border-[#ebddb7] bg-[#fff6db] p-6">
              {/* Optional Error Alert */}
              {errorMsg ? (
                <View className="mb-4 flex-row items-center gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5">
                  <Ionicons name="alert-circle" size={18} color="#dc2626" />
                  <Text className="flex-1 text-xs font-sans-medium text-destructive">
                    {errorMsg}
                  </Text>
                </View>
              ) : null}

              {isResetMode ? (
                /* Reset Password Mode */
                <View>
                  {resetStep === 1 ? (
                    <>
                      <View className="mb-5">
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
                          editable={!isResetLoading}
                        />
                      </View>

                      <TouchableOpacity
                        className={`h-[52px] items-center justify-center rounded-2xl bg-accent ${
                          isResetLoading ? "opacity-60" : ""
                        }`}
                        onPress={handleSendResetCode}
                        disabled={isResetLoading}
                        activeOpacity={0.85}
                      >
                        {isResetLoading ? (
                          <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                          <Text className="text-base font-sans-bold text-white">
                            Send reset code
                          </Text>
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <View className="mb-4">
                        <Text className="mb-2 text-sm font-sans-bold text-primary">
                          6-Digit Code
                        </Text>
                        <TextInput
                          className="h-[52px] rounded-2xl border border-[#d8caa6] bg-[#fffdf6] px-4 text-center text-xl font-sans-bold tracking-[8px] text-primary"
                          placeholder="123456"
                          placeholderTextColor="#4B5874"
                          value={resetCode}
                          onChangeText={(t) => {
                            setResetCode(t);
                            if (errorMsg) setErrorMsg(null);
                          }}
                          keyboardType="number-pad"
                          maxLength={6}
                          editable={!isResetLoading}
                        />
                      </View>

                      <View className="mb-5">
                        <Text className="mb-2 text-sm font-sans-bold text-primary">
                          New Password
                        </Text>
                        <View className="relative justify-center">
                          <TextInput
                            className="h-[52px] rounded-2xl border border-[#d8caa6] bg-[#fffdf6] pl-4 pr-12 text-base font-sans-medium text-primary"
                            placeholder="Enter new password (min. 8 chars)"
                            placeholderTextColor="#4B5874"
                            value={newPassword}
                            onChangeText={(t) => {
                              setNewPassword(t);
                              if (errorMsg) setErrorMsg(null);
                            }}
                            secureTextEntry={!showNewPassword}
                            autoCapitalize="none"
                            editable={!isResetLoading}
                          />
                          <TouchableOpacity
                            className="absolute right-4 p-1"
                            onPress={() => setShowNewPassword((prev) => !prev)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          >
                            <Ionicons
                              name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                              size={20}
                              color="#4A5568"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <TouchableOpacity
                        className={`h-[52px] items-center justify-center rounded-2xl bg-accent ${
                          isResetLoading ? "opacity-60" : ""
                        }`}
                        onPress={handleResetSubmit}
                        disabled={isResetLoading}
                        activeOpacity={0.85}
                      >
                        {isResetLoading ? (
                          <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                          <Text className="text-base font-sans-bold text-white">
                            Reset & Sign In
                          </Text>
                        )}
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity
                    className="mt-5 items-center py-1"
                    onPress={() => {
                      setIsResetMode(false);
                      setResetStep(1);
                      setErrorMsg(null);
                    }}
                  >
                    <Text className="text-sm font-sans-bold text-accent">
                      Back to Sign in
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Standard Sign In Form */
                <View>
                  {/* Email Field */}
                  <View className="mb-5">
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

                  {/* Password Field */}
                  <View className="mb-6">
                    <View className="mb-2 flex-row items-center justify-between">
                      <Text className="text-sm font-sans-bold text-primary">
                        Password
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setErrorMsg(null);
                          setIsResetMode(true);
                          setResetStep(1);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text className="text-xs font-sans-semibold text-[#4A5568]">
                          Forgot?
                        </Text>
                      </TouchableOpacity>
                    </View>

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
                        onSubmitEditing={handleSignIn}
                        returnKeyType="done"
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

                  {/* Sign In Button */}
                  <TouchableOpacity
                    className={`h-[52px] items-center justify-center rounded-2xl bg-accent ${
                      isLoading ? "opacity-60" : ""
                    }`}
                    onPress={handleSignIn}
                    disabled={isLoading}
                    activeOpacity={0.85}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text className="text-base font-sans-bold text-white">
                        Sign in
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Bottom link inside the card */}
                  <View className="mt-6 flex-row items-center justify-center gap-1">
                    <Text className="text-sm font-sans-medium text-[#4A5568]">
                      New to Recurly?
                    </Text>
                    <Link href="/(auth)/SignUp" asChild>
                      <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text className="text-sm font-sans-bold text-accent">
                          Create an account
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
