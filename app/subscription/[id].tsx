import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>SubscriptionDetails: {id}</Text>
      <Link href={"/"}>Go Back</Link>
    </View>
  );
};

export default SubscriptionDetails;
