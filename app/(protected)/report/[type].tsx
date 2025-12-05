import ReportCard from "@/components/test/report-card";
import { useSnackbar } from "@/context/snackbar-context";
import { ReportAAS, ReportFlexibility } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function ReportPage() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [aasReport, setAasReport] = useState<ReportAAS | null>(null);
  const [flexibilityReport, setFlexibilityReport] =
    useState<ReportFlexibility | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    async function fetchResult() {
      try {
        if (!profile) {
          setError("User not found");
          setLoading(false);
          return;
        }

        if (type === "aas") {
          if (
            !profile.emotional_flexibility_level ||
            !profile.attachment_type
          ) {
            setError("Incomplete test results");
            setLoading(false);
            return;
          }

          const { data, error } = await supabase
            .from("report_aas")
            .select("*")
            .eq(
              "emotional_flexibility_level",
              profile.emotional_flexibility_level
            )
            .eq("type", profile.attachment_type)
            .limit(1)
            .maybeSingle();

          if (error) {
            console.error("Error fetching AAS report:", error);
            setError("Failed to load AAS report");
          } else if (!data) {
            setError("No report found");
          } else {
            setAasReport(data as ReportAAS);
          }
        } else if (type === "flexibility") {
          if (!profile.flexibility_level) {
            setError("Incomplete test results");
            setLoading(false);
            return;
          }

          const { data, error } = await supabase
            .from("report_flexibility")
            .select("*")
            .eq("flexibility_level", profile.flexibility_level)
            .limit(1)
            .maybeSingle();

          if (error) {
            console.error("Error fetching flexibility report:", error);
            setError("Failed to load flexibility report");
          } else if (!data) {
            setError("No report found");
          } else {
            setFlexibilityReport(data as ReportFlexibility);
          }
        } else {
          setError("Invalid report type");
        }
      } catch (e) {
        console.error("Unexpected error:", e);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchResult();
  }, [profile, type]);

  const { showSnackbar } = useSnackbar();
  const [modalVisible, setModalVisible] = useState(false);
  const overlayOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(1000);

  const openModal = () => {
    setModalVisible(true);
    setTimeout(() => {
      overlayOpacity.value = withTiming(1, { duration: 300 });
      contentTranslateY.value = withTiming(0, { duration: 300 });
    }, 0);
  };

  const closeModal = () => {
    overlayOpacity.value = withTiming(0, { duration: 300 });
    contentTranslateY.value = withTiming(
      1000,
      { duration: 300 },
      (finished) => {
        if (finished) {
          runOnJS(setModalVisible)(false);
        }
      }
    );
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const shareLink = `${Platform.OS === "web" ? window.location.origin : process.env.EXPO_PUBLIC_APP_URL}/report/${type}/${profile?.id}`;

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(shareLink);
      showSnackbar({
        message: "링크가 클립보드에 복사되었어요!",
        bottom: 0,
      });
      closeModal();
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      closeModal();
    }
  };

  const gesture = Gesture.Pan()
    .onChange((event) => {
      if (event.translationY > 0) {
        contentTranslateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 150 || event.velocityY > 1000) {
        runOnJS(closeModal)();
      } else {
        contentTranslateY.value = withTiming(0, { duration: 300 });
      }
    });

  if (loading) {
    return (
      <View className="flex-1 bg-background flex-col">
        <View className="flex flex-row items-center justify-between px-4 h-14 border-b border-pastel-gray/10 w-full">
          <Pressable onPress={() => router.back()} className="p-2">
            <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
          </Pressable>
          <Text className="text-foreground font-semibold text-lg">
            {type === "aas" ? "성인 애착 유형" : "정서적 유연성"}
          </Text>
          <View className="w-9" />
        </View>
      </View>
    );
  }

  if (error || (!aasReport && !flexibilityReport)) {
    return (
      <View className="flex-1 bg-background flex-col">
        <View className="flex flex-row items-center justify-between px-4 h-14 border-b border-pastel-gray/10 w-full">
          <Pressable onPress={() => router.back()} className="p-2">
            <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
          </Pressable>
          <Text className="text-foreground font-semibold text-lg">
            {type === "aas" ? "성인 애착 유형" : "정서적 유연성"}
          </Text>
          <View className="w-9" />
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-foreground mb-4">
            {error || "No report found"}
          </Text>
          <TouchableOpacity
            className="bg-foreground px-6 py-3 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-background font-semibold">돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 flex-col bg-background">
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-4 h-14 border-b border-pastel-gray/10">
        <Pressable onPress={() => router.back()} className="p-2">
          <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
        </Pressable>
        <Text className="text-foreground font-semibold text-lg">
          {type === "aas" ? "성인 애착 유형" : "정서적 유연성"}
        </Text>
        <Pressable onPress={openModal} className="p-2">
          <FontAwesome6 name="share-nodes" size={20} color="#ECEEDF" />
        </Pressable>
      </View>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          className="flex-1"
        >
          {type === "aas" && aasReport && (
            <ReportCard
              test="성인 애착 유형"
              title={aasReport.title}
              badges={[
                "유형: " + aasReport.type_text,
                "마음 평온도: " + aasReport.emotional_flexibility_text,
              ]}
              overallEvaluation={aasReport.overall_evaluation}
              detailEvaluations={aasReport.detail_evaluations}
              counselingText={aasReport.counseling_text}
            />
          )}

          {type === "flexibility" && flexibilityReport && (
            <ReportCard
              test="정서적 유연성"
              title={flexibilityReport.title}
              badges={[
                "유연성: " + profile?.flexibility_percentage?.toFixed(1) + "%",
              ]}
              overallEvaluation={flexibilityReport.overall_evaluation}
              detailEvaluations={flexibilityReport.detail_evaluation}
              counselingText={flexibilityReport.counseling_text}
            />
          )}

          <View className="gap-3">
            <TouchableOpacity
              className="bg-foreground rounded-full h-14 items-center justify-center"
              activeOpacity={0.8}
              onPress={openModal}
            >
              <Text className="text-background font-semibold text-base">
                결과 공유하기
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-foreground rounded-full h-14 items-center justify-center"
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Text className="text-foreground font-semibold text-base">
                돌아가기
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-end">
          {/* Overlay */}
          <Animated.View
            style={overlayStyle}
            className="absolute inset-0 bg-black/50"
          >
            <TouchableWithoutFeedback onPress={closeModal}>
              <View className="flex-1" />
            </TouchableWithoutFeedback>
          </Animated.View>

          {/* Modal Content */}
          <GestureDetector gesture={gesture}>
            <Animated.View
              style={contentStyle}
              className="bg-background rounded-t-3xl overflow-hidden h-[85%]"
            >
              <View className="flex flex-row justify-between items-center p-4 border-b border-pastel-gray/20">
                <View style={{ width: 40 }} />
                <Text className="text-foreground font-semibold text-lg">
                  결과 공유하기
                </Text>
                <TouchableOpacity
                  onPress={closeModal}
                  className="w-10 flex flex-row justify-end pr-2"
                >
                  <FontAwesome6 name="xmark" size={20} color="#ECEEDF" />
                </TouchableOpacity>
              </View>

              <View className="flex-1 px-6 mt-32">
                <FontAwesome6
                  name="envelope"
                  solid
                  size={40}
                  color="#ECEEDF"
                  style={{ marginHorizontal: "auto" }}
                />
                <Text className="text-foreground font-medium text-lg  text-center mt-4">
                  나의 성향 분석 결과를 공유하고
                  <br />
                  서로에 대해 더 깊이 알아가보세요!
                </Text>

                <TouchableOpacity
                  className="bg-foreground rounded-full px-6 py-4 mb-4 mt-10"
                  activeOpacity={0.7}
                  onPress={handleCopyLink}
                >
                  <Text className="text-background font-semibold text-center">
                    링크 복사하기
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="border border-foreground rounded-full px-6 py-4"
                  activeOpacity={0.7}
                  onPress={() => {
                    if (Platform.OS !== "web") return;
                    const Kakao = (window as any).Kakao;
                    if (!Kakao) {
                      alert("Kakao SDK not loaded yet!");
                      return;
                    }

                    Kakao.Share.sendDefault({
                      objectType: "feed",
                      content: {
                        title: `${profile?.nickname}님의 분석 결과`,
                        description: "나의 성향 분석 결과를 확인해보세요!",
                        imageUrl: "https://example.com/thumbnail.png",
                        link: {
                          webUrl: shareLink,
                          mobileWebUrl: shareLink,
                        },
                      },
                    });
                    closeModal();
                  }}
                >
                  <Text className="text-foreground font-semibold text-center">
                    카카오톡으로 공유하기
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </Modal>
    </View>
  );
}
