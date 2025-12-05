import { Profile, Relationship } from "@/db/schema";
import { Image } from "expo-image";
import { Text, TouchableOpacity, View } from "react-native";

interface RelationshipListItemProps {
  relationship: Relationship;
  partner: Profile;
  onPress: () => void;
}

export default function RelationshipListItem({
  relationship,
  partner,
  onPress,
}: RelationshipListItemProps) {
  const score = relationship.chemistry_index;

  // Determine color based on score (optional, can be static)
  const getScoreColor = (s: number) => {
    if (s >= 80) return "#FF6B6B"; // Red/Hot
    if (s >= 60) return "#FFD93D"; // Yellow/Warm
    if (s >= 40) return "#6BCB77"; // Green/Mild
    return "#4D96FF"; // Blue/Cool
  };

  const scoreColor = getScoreColor(score);

  return (
    <TouchableOpacity
      className="flex flex-row items-center gap-4 py-3"
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Avatar */}
      <Image
        source={{ uri: partner.avatar_url }}
        style={{ width: 40, height: 40, borderRadius: 24 }}
        contentFit="cover"
      />

      {/* Info & Thermometer */}
      <View className="flex-1 flex-col gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-foreground font-semibold text-sm">
            {partner.nickname}
          </Text>
          <Text className="text-pastel-gray text-xs font-medium">
            {score.toFixed(1)}°C
          </Text>
        </View>

        {/* Horizontal Thermometer Track */}
        <View className="w-full h-[6px] bg-foreground/10 rounded-full overflow-hidden relative">
          {/* Fill */}
          <View
            style={{
              width: `${Math.min(Math.max(score, 0), 100)}%`,
              height: "100%",
              backgroundColor: scoreColor,
              borderRadius: 999,
            }}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
