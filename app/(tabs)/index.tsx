import ListHeading from "@/components/listHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubCard from "@/components/UpcomingSubCard";
import {
  HOME_BALANCE,
  HOME_SUBSCRIPTIONS,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import SignOutButton from "@/components/SignOutButton";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as ModSAV } from "react-native-safe-area-context";

const SafeAreaView = styled(ModSAV);

export default function App() {
  const { user } = useUser();
  const router = useRouter();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);

  const userName = user?.firstName || HOME_USER.name;
  const userAvatar = user?.imageUrl ? { uri: user.imageUrl } : images.avatar;

  return (
    <SafeAreaView className="flex-1 p-5 bg-background  ">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <TouchableOpacity
                className="home-user"
                onPress={() => router.push("/(tabs)/settings")}
                activeOpacity={0.8}
              >
                <Image source={userAvatar} className="home-avatar" />
                <View>
                  <Text className="home-user-name">{userName}</Text>
                </View>
              </TouchableOpacity>
              <View className="flex-row items-center gap-2.5">
                <SignOutButton variant="icon" />
                <Image source={icons.add} className="home-add-icon" />
              </View>
            </View>
            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>
            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubCard data={item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No Upcoming Subscription
                  </Text>
                }
              />
            </View>
            <ListHeading title="All Subscription" />
          </>
        )}
        data={HOME_SUBSCRIPTIONS}
        keyExtractor={(item) => item.id}
        extraData={expandedSubscriptionId}
        contentContainerClassName="pb-30"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() => {
              setExpandedSubscriptionId((prev) => {
                if (prev === item.id) return null;
                else return item.id;
              });
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}
