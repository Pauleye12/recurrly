import images from "@/constants/images";
import { useClerk, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of Recurrly?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            setIsSigningOut(true);
            await signOut();
            router.replace("/(auth)/SignIn");
          } catch (err) {
            console.error("Sign out error", err);
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Recurrly Member";
  const displayEmail =
    user?.primaryEmailAddress?.emailAddress || "user@recurrly.app";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerClassName="pb-36 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Title */}
        <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
        <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
          Manage your account, preferences, and subscriptions
        </Text>

        {/* Profile Card */}
        <View className="mt-6 flex-row items-center gap-4 rounded-3xl border border-border bg-card p-5">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="size-16 rounded-full border border-border"
            />
          ) : (
            <Image
              source={images.avatar}
              className="size-16 rounded-full border border-border"
            />
          )}

          <View className="flex-1">
            <Text className="text-xl font-sans-bold text-primary" numberOfLines={1}>
              {displayName}
            </Text>
            <Text
              className="text-xs font-sans-medium text-muted-foreground"
              numberOfLines={1}
            >
              {displayEmail}
            </Text>
            <View className="mt-1.5 self-start rounded-full bg-subscription/30 px-2.5 py-0.5">
              <Text className="text-[10px] font-sans-bold uppercase tracking-[0.5px] text-primary">
                Active Member
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mt-7">
          <Text className="text-sm font-sans-bold uppercase tracking-[1px] text-muted-foreground">
            Preferences
          </Text>

          <View className="mt-3 overflow-hidden rounded-3xl border border-border bg-card">
            <View className="flex-row items-center justify-between border-b border-border/60 p-4">
              <View className="flex-row items-center gap-3">
                <View className="size-10 items-center justify-center rounded-2xl bg-muted">
                  <Ionicons name="cash-outline" size={20} color="#081126" />
                </View>
                <Text className="text-base font-sans-semibold text-primary">
                  Default Currency
                </Text>
              </View>
              <Text className="text-sm font-sans-bold text-accent">NGN (₦)</Text>
            </View>

            <View className="flex-row items-center justify-between border-b border-border/60 p-4">
              <View className="flex-row items-center gap-3">
                <View className="size-10 items-center justify-center rounded-2xl bg-muted">
                  <Ionicons name="notifications-outline" size={20} color="#081126" />
                </View>
                <Text className="text-base font-sans-semibold text-primary">
                  Renewal Alerts
                </Text>
              </View>
              <Text className="text-sm font-sans-medium text-muted-foreground">
                2 days before
              </Text>
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center gap-3">
                <View className="size-10 items-center justify-center rounded-2xl bg-muted">
                  <Ionicons name="lock-closed-outline" size={20} color="#081126" />
                </View>
                <Text className="text-base font-sans-semibold text-primary">
                  Security & Auth
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(0,0,0,0.4)" />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View className="mt-7">
          <Text className="text-sm font-sans-bold uppercase tracking-[1px] text-muted-foreground">
            Support & About
          </Text>

          <View className="mt-3 overflow-hidden rounded-3xl border border-border bg-card">
            <TouchableOpacity
              className="flex-row items-center justify-between border-b border-border/60 p-4"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <View className="size-10 items-center justify-center rounded-2xl bg-muted">
                  <Ionicons name="help-circle-outline" size={20} color="#081126" />
                </View>
                <Text className="text-base font-sans-semibold text-primary">
                  Help Center
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(0,0,0,0.4)" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-3">
                <View className="size-10 items-center justify-center rounded-2xl bg-muted">
                  <Ionicons name="shield-outline" size={20} color="#081126" />
                </View>
                <Text className="text-base font-sans-semibold text-primary">
                  Privacy Policy
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(0,0,0,0.4)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <View className="mt-8">
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 py-4"
            onPress={handleSignOut}
            disabled={isSigningOut}
            activeOpacity={0.8}
          >
            {isSigningOut ? (
              <ActivityIndicator color="#dc2626" size="small" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                <Text className="text-base font-sans-bold text-destructive">
                  Sign Out
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Version Note */}
        <Text className="mt-6 text-center text-xs font-sans-medium text-muted-foreground">
          Recurrly v1.0.0 • Secure Authentication
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
