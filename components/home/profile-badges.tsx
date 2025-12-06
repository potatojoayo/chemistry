import { Profile } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function ProfileBadges({ profile }: { profile: Profile }) {
  const [aasType, setAasType] = useState<string | null>(null);
  const [flexibilityTitle, setFlexibilityTitle] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTitles() {
      if (!profile) return;

      // Fetch AAS Title
      if (profile.attachment_type && profile.emotional_flexibility_level) {
        const { data } = await supabase
          .from("report_aas")
          .select("type_text")
          .eq("type", profile.attachment_type)
          .eq(
            "emotional_flexibility_level",
            profile.emotional_flexibility_level
          )
          .limit(1)
          .maybeSingle();
        if (data) setAasType(data.type_text);
      }

      // Fetch Flexibility Title
      if (profile.flexibility_level) {
        const { data } = await supabase
          .from("report_flexibility")
          .select("title")
          .eq("flexibility_level", profile.flexibility_level)
          .limit(1)
          .maybeSingle();
        if (data) setFlexibilityTitle(data.title);
      }
    }

    fetchTitles();
  }, [profile]);

  if (!aasType && !flexibilityTitle) return null;

  return (
    <View className="flex flex-row flex-wrap gap-1.5 mt-0.5 w-full">
      {aasType && (
        <View className="bg-foreground/10 px-2 py-1 rounded-full">
          <Text className="text-foreground text-[10px] font-medium">
            {aasType}
          </Text>
        </View>
      )}
      {flexibilityTitle && (
        <View className="bg-foreground/10 px-2 py-1 rounded-full">
          <Text className="text-foreground text-[10px] font-medium">
            {flexibilityTitle}
          </Text>
        </View>
      )}
    </View>
  );
}
