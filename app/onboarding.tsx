import { icons } from "@/constants/icons";
import { posthog, posthogLog } from "@/lib/posthog";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Onboarding() {
  const router = useRouter();

  const features = [
    {
      icon: "calendar-outline" as const,
      title: "Predictable Renewals",
      desc: "Get notified days before your card is charged for any subscription.",
    },
    {
      icon: "trending-down-outline" as const,
      title: "Cut Forgotten Costs",
      desc: "Identify unused trials and save an average of ₦45,000 monthly.",
    },
    {
      icon: "shield-checkmark-outline" as const,
      title: "Bank-Grade Privacy",
      desc: "Your subscription details and credentials remain encrypted and safe.",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1 justify-between px-6 pb-8 pt-8">
        {/* Brand Header */}
        <View className="items-center">
          <View className="mb-4 flex-row items-center gap-3">
            <Image
              source={icons.logo}
              className="size-14 rounded-2xl"
              resizeMode="contain"
            />
            <View>
              <Text className="text-3xl font-sans-extrabold text-primary">Recurrly</Text>
              <Text className="-mt-1 text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
                Smart Subscription Tracker
              </Text>
            </View>
          </View>

          <Text className="mt-4 text-center text-3xl font-sans-extrabold leading-tight text-primary">
            Master your recurring bills & free trials
          </Text>
          <Text className="mt-2 text-center text-base font-sans-medium text-muted-foreground">
            All your streaming, SaaS, utilities, and memberships organized in one beautiful place.
          </Text>
        </View>

        {/* Feature Cards */}
        <View className="my-6 gap-3.5">
          {features.map((feature, idx) => (
            <View
              key={idx}
              className="flex-row items-center gap-4 rounded-3xl border border-border bg-card p-4"
            >
              <View className="size-12 items-center justify-center rounded-2xl bg-accent/15">
                <Ionicons name={feature.icon} size={22} color="#ea7a53" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-sans-bold text-primary">
                  {feature.title}
                </Text>
                <Text className="mt-0.5 text-xs font-sans-medium text-muted-foreground">
                  {feature.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <TouchableOpacity
            className="auth-button"
            onPress={() => {
              posthog?.capture("onboarding_started");
              posthogLog.info("onboarding sign-up started", {
                flow: "onboarding",
              });
              router.push("/(auth)/SignUp");
            }}
            activeOpacity={0.85}
          >
            <Text className="auth-button-text">Get Started Free</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center rounded-2xl border border-border bg-background py-3.5"
            onPress={() => router.push("/(auth)/SignIn")}
            activeOpacity={0.8}
          >
            <Text className="text-base font-sans-bold text-primary">
              I already have an account
            </Text>
          </TouchableOpacity>

          <Text className="mt-1 text-center text-[11px] font-sans-medium text-muted-foreground">
            By proceeding, you agree to our Terms of Service & Privacy Policy.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
