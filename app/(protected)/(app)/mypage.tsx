import RadarChart from "@/components/chart/radar-chart";
import SummaryCard from "@/components/chart/summary-card";
import TabPageWrapper from "@/components/common/tab-page-wrapper";
import { useSnackbar } from "@/context/snackbar-context";
import { ReportAAS, ReportFlexibility } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function MyPage() {
  const { profile, fetchProfile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [aasReport, setAasReport] = useState<ReportAAS | null>(null);
  const [flexibilityReport, setFlexibilityReport] =
    useState<ReportFlexibility | null>(null);
  const { showSnackbar } = useSnackbar();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    if (!loading) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [loading]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("갤러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      await uploadAvatar(asset);
    }
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!profile) return;
    setUploading(true);
    try {
      const mimeType = asset.mimeType || asset.type || "image/png";
      let fileExt = "png";
      if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
        fileExt = "jpg";
      } else if (mimeType.includes("png")) {
        fileExt = "png";
      } else if (mimeType.includes("webp")) {
        fileExt = "webp";
      }

      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();

      const fileName = `avatar_${Date.now()}.${fileExt}`;
      const filePath = `profiles/${profile.user_id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, arrayBuffer, {
          upsert: true,
          contentType: mimeType,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      await fetchProfile();
      showSnackbar({ message: "프로필 이미지가 변경되었어요." });
    } catch (error) {
      console.error("Avatar upload error:", error);
      showSnackbar({ message: "이미지 업로드 중 오류가 발생했습니다." });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    async function fetchReports() {
      if (
        !profile?.emotional_flexibility_level ||
        !profile?.attachment_type ||
        !profile?.flexibility_level
      ) {
        setLoading(false);
        return;
      }

      try {
        const [aasResult, flexibilityResult] = await Promise.all([
          supabase
            .from("report_aas")
            .select("*")
            .eq(
              "emotional_flexibility_level",
              profile.emotional_flexibility_level
            )
            .eq("type", profile.attachment_type)
            .single(),
          supabase
            .from("report_flexibility")
            .select("*")
            .eq("flexibility_level", profile.flexibility_level)
            .single(),
        ]);

        if (aasResult.data) setAasReport(aasResult.data as ReportAAS);
        if (flexibilityResult.data)
          setFlexibilityReport(flexibilityResult.data as ReportFlexibility);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        console.log("yes");
        setLoading(false);
      }
    }

    fetchReports();
  }, [profile]);

  if (!profile) return null;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#ECEEDF" />
      </View>
    );
  }

  const big5Data = [
    {
      label: "개방성",
      value: Math.round(((profile.openness ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "성실성",
      value: Math.round(((profile.conscientiousness ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "외향성",
      value: Math.round(((profile.extraversion ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "친밀성",
      value: Math.round(((profile.agreeableness ?? 0) / 5) * 100),
      color: "#222",
    },
    {
      label: "신경성",
      value: Math.round(((profile.neuroticism ?? 0) / 5) * 100),
      color: "#222",
    },
  ];

  return (
    <TabPageWrapper>
      <ScrollView className="flex flex-col">
        <Animated.View style={animatedStyle} className="p-3 pt-6">
          <View className="flex flex-col items-center justify-center mb-6 mt-2">
            <Pressable
              onPress={pickImage}
              disabled={uploading}
              className="relative"
            >
              <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-pastel-gray">
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
                {uploading && (
                  <View className="absolute inset-0 bg-black/50 items-center justify-center">
                    <ActivityIndicator color="#ECEEDF" size="small" />
                  </View>
                )}
              </View>
              <View className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full items-center justify-center border-2 border-background">
                <FontAwesome6 name="camera" size={12} color="#ECEEDF" />
              </View>
            </Pressable>
            <Pressable
              className="flex flex-row items-center gap-2 mt-4"
              onPress={() => router.push("/settings/nickname")}
            >
              <FontAwesome6
                name={profile.gender === "male" ? "mars" : "venus"}
                size={18}
                color={profile.gender === "male" ? "#3b82f6" : "#ef4444"}
              />
              <Text className="text-foreground font-bold text-xl">
                {profile.nickname}
              </Text>
              <MaterialIcons name="edit" size={16} color="#666" />
            </Pressable>
          </View>
          <View className="border-t border-foreground/10 my-2"></View>
          <Text className="mb-3 text-foreground font-semibold text-xl">
            내 차트
          </Text>
          <View className="flex flex-row gap-3">
            <View className="flex flex-col p-5 rounded-2xl bg-foreground flex-1 shadow">
              <View className="w-full border-t"></View>
              <Text className="text-xs">BIG 5</Text>
              <View className="flex items-center justify-center mt-4">
                <RadarChart data={big5Data} size={220} />
              </View>
            </View>
          </View>
          <View className="flex flex-row gap-3 mt-3">
            {aasReport && (
              <SummaryCard
                label="성인 애착 유형"
                value={aasReport.type_text}
                subValue={"마음평온도: " + aasReport.emotional_flexibility_text}
                colorClass="bg-foreground/5"
                onPress={() => router.push("/report/aas")}
              />
            )}
            {flexibilityReport && (
              <SummaryCard
                label="정서적 유연성"
                value={flexibilityReport.flexibility_label}
                subValue={
                  "유연성: " + profile.flexibility_percentage?.toFixed(1) + "%"
                }
                colorClass="bg-foreground/5"
                onPress={() => router.push("/report/flexibility")}
              />
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </TabPageWrapper>
  );
}
