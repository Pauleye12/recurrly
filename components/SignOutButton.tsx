import SignOutModal from "@/components/SignOutModal";
import { useSignOut } from "@/hooks/useSignOut";
import { Ionicons } from "@expo/vector-icons";
import { clsx } from "clsx";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export type SignOutButtonVariant =
  | "full"
  | "outline"
  | "icon"
  | "menu-item"
  | "ghost";

export interface SignOutButtonProps {
  /**
   * Style variant for the button:
   * - "full": Prominent, full-width destructive card button (ideal for Settings)
   * - "outline": Bordered button with icon and text
   * - "icon": Compact square/circular icon button (ideal for headers)
   * - "menu-item": List row item with leading icon, label, and trailing chevron
   * - "ghost": Lightweight text button with icon
   */
  variant?: SignOutButtonVariant;
  /**
   * Whether to display the styled confirmation dialog before signing out.
   * Default: true
   */
  showConfirmation?: boolean;
  /**
   * Custom button label. Default: "Sign Out"
   */
  label?: string;
  /**
   * Additional NativeWind or Tailwind class names.
   */
  className?: string;
  /**
   * Custom title for confirmation modal.
   */
  modalTitle?: string;
  /**
   * Custom description for confirmation modal.
   */
  modalDescription?: string;
  /**
   * Callback on successful sign out.
   */
  onSuccess?: () => void;
  /**
   * Callback on sign out error.
   */
  onError?: (error: any) => void;
}

export default function SignOutButton({
  variant = "full",
  showConfirmation = true,
  label = "Sign Out",
  className,
  modalTitle = "Sign Out",
  modalDescription = "Are you sure you want to sign out of Recurrly? You will need to enter your credentials to access your subscriptions again.",
  onSuccess,
  onError,
}: SignOutButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const { signOut, isSigningOut, error, clearError } = useSignOut({
    onSuccess: () => {
      setModalVisible(false);
      onSuccess?.();
    },
    onError,
  });

  const handlePress = () => {
    if (showConfirmation) {
      clearError();
      setModalVisible(true);
    } else {
      signOut();
    }
  };

  const handleConfirmSignOut = async () => {
    await signOut();
  };

  const handleCloseModal = () => {
    if (!isSigningOut) {
      clearError();
      setModalVisible(false);
    }
  };

  const renderButtonContent = () => {
    switch (variant) {
      case "icon":
        return (
          <TouchableOpacity
            className={clsx(
              "size-12 items-center justify-center rounded-2xl border border-border bg-card active:opacity-75",
              className
            )}
            onPress={handlePress}
            disabled={isSigningOut}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            {isSigningOut ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <Ionicons name="log-out-outline" size={22} color="#dc2626" />
            )}
          </TouchableOpacity>
        );

      case "outline":
        return (
          <TouchableOpacity
            className={clsx(
              "flex-row items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-transparent px-4 py-3 active:opacity-75",
              className
            )}
            onPress={handlePress}
            disabled={isSigningOut}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            {isSigningOut ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={18} color="#dc2626" />
                <Text className="text-sm font-sans-bold text-destructive">
                  {label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );

      case "menu-item":
        return (
          <TouchableOpacity
            className={clsx(
              "flex-row items-center justify-between p-4 active:opacity-75",
              className
            )}
            onPress={handlePress}
            disabled={isSigningOut}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <View className="flex-row items-center gap-3">
              <View className="size-10 items-center justify-center rounded-2xl bg-destructive/10">
                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              </View>
              <View>
                <Text className="text-base font-sans-semibold text-destructive">
                  {label}
                </Text>
                <Text className="text-xs font-sans-medium text-muted-foreground">
                  Sign out of this device
                </Text>
              </View>
            </View>
            {isSigningOut ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <Ionicons name="chevron-forward" size={18} color="#dc2626" />
            )}
          </TouchableOpacity>
        );

      case "ghost":
        return (
          <TouchableOpacity
            className={clsx(
              "flex-row items-center gap-1.5 p-2 active:opacity-75",
              className
            )}
            onPress={handlePress}
            disabled={isSigningOut}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            {isSigningOut ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={18} color="#dc2626" />
                <Text className="text-sm font-sans-semibold text-destructive">
                  {label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );

      case "full":
      default:
        return (
          <TouchableOpacity
            className={clsx(
              "flex-row items-center justify-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 py-4 active:opacity-85",
              className
            )}
            onPress={handlePress}
            disabled={isSigningOut}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            {isSigningOut ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#dc2626" />
                <Text className="text-base font-sans-bold text-destructive">
                  {label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
    }
  };

  return (
    <>
      {renderButtonContent()}

      {showConfirmation ? (
        <SignOutModal
          visible={modalVisible}
          onClose={handleCloseModal}
          onConfirm={handleConfirmSignOut}
          isLoading={isSigningOut}
          error={error}
          title={modalTitle}
          description={modalDescription}
        />
      ) : null}
    </>
  );
}
