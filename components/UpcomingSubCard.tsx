import { formatCurrency } from "@/lib/utils";
import { Image, Text, View } from "react-native";

const UpcomingSubCard = ({ data }: { data: UpcomingSubscription }) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image className="upcoming-icon" source={data.icon} />
        <View>
          <Text className="upcoming-price">{formatCurrency(data.price)}</Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {data.daysLeft > 1 ? `${data.daysLeft} days left` : "Last day"}
          </Text>
        </View>
      </View>
      <Text className="upcoming-name" numberOfLines={1}>
        {data.name}
      </Text>
    </View>
  );
};

export default UpcomingSubCard;
