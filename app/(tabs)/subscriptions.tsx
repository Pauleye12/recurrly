import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/context/SubscriptionsContext";
import { posthog, posthogLog } from "@/lib/posthog";
import { formatCurrency } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { styled } from "nativewind";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView as ModSAV } from "react-native-safe-area-context";

const SafeAreaView = styled(ModSAV);

const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "cancelled", label: "Cancelled" },
  { id: "design", label: "Design" },
  { id: "ai-tools", label: "AI Tools" },
  { id: "productivity", label: "Productivity" },
  { id: "dev-tools", label: "Developer Tools" },
];

export default function SubscriptionsScreen() {
  const { subscriptions } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  // Filter subscriptions by search query and category/status pill
  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return subscriptions.filter((sub) => {
      // 1. Category/Status pill filter
      if (selectedFilter !== "all") {
        const statusMatch =
          sub.status?.toLowerCase() === selectedFilter.toLowerCase();
        const categoryMatch =
          sub.category?.toLowerCase() === selectedFilter.toLowerCase() ||
          (selectedFilter === "ai-tools" &&
            sub.category?.toLowerCase() === "ai tools") ||
          (selectedFilter === "dev-tools" &&
            sub.category?.toLowerCase() === "developer tools");

        if (!statusMatch && !categoryMatch) {
          return false;
        }
      }

      // 2. Search query filter
      if (!query) return true;

      const nameMatch = sub.name.toLowerCase().includes(query);
      const categoryMatch = sub.category?.toLowerCase().includes(query);
      const planMatch = sub.plan?.toLowerCase().includes(query);
      const billingMatch = sub.billing.toLowerCase().includes(query);
      const paymentMatch = sub.paymentMethod?.toLowerCase().includes(query);

      return (
        nameMatch || categoryMatch || planMatch || billingMatch || paymentMatch
      );
    });
  }, [searchQuery, selectedFilter, subscriptions]);

  // Aggregate monthly spend calculation for visible items
  const totalMonthlySpend = useMemo(() => {
    return filteredSubscriptions.reduce((sum, item) => {
      if (item.status === "cancelled") return sum;
      if (item.billing.toLowerCase() === "yearly") {
        return sum + item.price / 12;
      }
      return sum + item.price;
    }, 0);
  }, [filteredSubscriptions]);

  const activeCount = useMemo(() => {
    return filteredSubscriptions.filter((s) => s.status === "active").length;
  }, [filteredSubscriptions]);

  const handleClearFilters = () => {
    Keyboard.dismiss();
    setSearchQuery("");
    setSelectedFilter("all");
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["top"]}
      style={{ flex: 1, backgroundColor: "#fff9e3" }}
    >
      {/* Pinned Top Section: Title, Search Bar & Filter Chips (Never unmounted on keystroke) */}
      <View className="px-5 pt-3 pb-2 bg-background">
        {/* Screen Title */}
        <View className="mb-3">
          <Text className="text-3xl font-sans-bold text-primary">
            Subscriptions
          </Text>
          <Text className="mt-0.5 text-xs font-sans-medium text-muted-foreground">
            Track, search, and manage all your recurring services
          </Text>
        </View>

        {/* Search Input Bar (stays permanently mounted to prevent keyboard dismissal) */}
        <View className="relative flex-row items-center rounded-2xl border border-border bg-card px-4 py-3">
          <Ionicons
            name="search-outline"
            size={20}
            color="rgba(8, 17, 38, 0.45)"
          />
          <TextInput
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.length === 3) {
                posthog?.capture("subscriptions_searched", {
                  query: text,
                });
              }
            }}
            placeholder="Search subscriptions, plans, categories..."
            placeholderTextColor="rgba(8, 17, 38, 0.4)"
            className="ml-3 flex-1 text-base font-sans-medium text-primary"
            returnKeyType="search"
            clearButtonMode="never"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color="rgba(8, 17, 38, 0.45)"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Category / Status Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 pt-3 pb-1"
          keyboardShouldPersistTaps="handled"
        >
          {FILTER_OPTIONS.map((filter) => {
            const isSelected = selectedFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                onPress={() => {
                  setSelectedFilter(filter.id);
                  posthog?.capture("subscription_filter_selected", {
                    filter: filter.id,
                  });
                }}
                activeOpacity={0.8}
                className={`rounded-full px-4 py-2 ${
                  isSelected
                    ? "bg-accent border border-accent shadow-sm"
                    : "bg-card border border-border"
                }`}
              >
                <Text
                  className={`text-sm ${
                    isSelected
                      ? "font-sans-bold text-white"
                      : "font-sans-medium text-primary"
                  }`}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Scrollable Subscriptions List with native keyboard inset adjustment */}
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        extraData={expandedSubscriptionId}
        contentContainerClassName="px-5 pb-36 pt-2"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={true}
        style={{ flex: 1 }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListHeaderComponent={
          <View className="mb-4">
            {/* Spend & Summary Overview Card */}
            <View className="my-2 flex-row items-center justify-between rounded-3xl border border-border bg-card p-5">
              <View>
                <Text className="text-xs font-sans-semibold uppercase tracking-[0.8px] text-muted-foreground">
                  Monthly Run Rate
                </Text>
                <Text className="mt-1 text-2xl font-sans-extrabold text-primary">
                  {formatCurrency(totalMonthlySpend)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs font-sans-semibold uppercase tracking-[0.8px] text-muted-foreground">
                  Active Services
                </Text>
                <View className="mt-1 flex-row items-center gap-1.5">
                  <View className="size-2 rounded-full bg-success" />
                  <Text className="text-lg font-sans-bold text-primary">
                    {activeCount} of {filteredSubscriptions.length}
                  </Text>
                </View>
              </View>
            </View>

            {/* Results Count Banner */}
            <View className="mt-2 flex-row items-center justify-between px-1">
              <Text className="text-xs font-sans-semibold uppercase tracking-[0.5px] text-muted-foreground">
                {filteredSubscriptions.length === 1
                  ? "1 Subscription Found"
                  : `${filteredSubscriptions.length} Subscriptions Found`}
              </Text>
              {(searchQuery.length > 0 || selectedFilter !== "all") && (
                <TouchableOpacity onPress={handleClearFilters}>
                  <Text className="text-xs font-sans-bold text-accent">
                    Reset Filters
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              const isOpening = expandedSubscriptionId !== item.id;
              if (isOpening) {
                posthog?.capture("subscription_card_expanded", {
                  subscription_id: item.id,
                  subscription_category: item.category ?? null,
                  billing_interval: item.billing,
                  subscription_status: item.status ?? null,
                });
                posthogLog.info("subscription card expanded", {
                  surface: "subscriptions_screen",
                });
              }
              setExpandedSubscriptionId((prev) =>
                prev === item.id ? null : item.id,
              );
            }}
          />
        )}
        ListEmptyComponent={() => (
          <View className="items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 my-6">
            <View className="size-16 items-center justify-center rounded-full bg-accent/15 mb-3">
              <Ionicons name="search" size={28} color="#ea7a53" />
            </View>
            <Text className="text-lg font-sans-bold text-primary">
              No Subscriptions Found
            </Text>
            <Text className="mt-1 text-center text-sm font-sans-medium text-muted-foreground max-w-[260px]">
              {searchQuery
                ? `We couldn't find any subscription matching "${searchQuery}".`
                : "No subscriptions match the selected filter."}
            </Text>
            <TouchableOpacity
              onPress={handleClearFilters}
              activeOpacity={0.8}
              className="mt-4 rounded-xl bg-accent px-5 py-2.5"
            >
              <Text className="text-sm font-sans-bold text-white">
                Clear Filters
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
