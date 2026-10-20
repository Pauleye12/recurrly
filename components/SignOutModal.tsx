import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface SignOutModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function SignOutModal({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
  error = null,
  title = "Sign Out",
  description = "Are you sure you want to sign out of Recurrly? You will need to enter your credentials to access your subscriptions again.",
  confirmLabel = "Sign Out",
  cancelLabel = "Cancel",
}: SignOutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isLoading ? undefined : onClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/60 px-6"
        onPress={isLoading ? undefined : onClose}
      >
        <Pressable
          className="w-full max-w-sm rounded-[28px] border border-[#ebddb7] bg-[#fff8e7] p-6 shadow-2xl"
          onPress={(e) => e.stopPropagation()}
        >
          {/* Destructive Icon Badge */}
          <View className="mb-4 size-16 items-center justify-center self-center rounded-3xl bg-destructive/15">
            <Ionicons name="log-out-outline" size={30} color="#dc2626" />
          </View>

          {/* Heading */}
          <Text className="text-center text-2xl font-sans-bold text-primary">
            {title}
          </Text>

          {/* Description */}
          <Text className="mt-2 text-center text-sm font-sans-medium leading-relaxed text-muted-foreground">
            {description}
          </Text>

          {/* Error Message if any */}
          {error ? (
            <View className="mt-4 flex-row items-center gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5">
              <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
              <Text className="flex-1 text-xs font-sans-medium leading-4 text-destructive">
                {error}
              </Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View className="mt-6 gap-3">
            <TouchableOpacity
              className="h-[52px] flex-row items-center justify-center gap-2 rounded-2xl bg-destructive"
              onPress={onConfirm}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={20} color="#ffffff" />
                  <Text className="text-base font-sans-bold text-white">
                    {confirmLabel}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="h-12 items-center justify-center rounded-2xl border border-border bg-background"
              onPress={onClose}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text className="text-base font-sans-semibold text-primary">
                {cancelLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
