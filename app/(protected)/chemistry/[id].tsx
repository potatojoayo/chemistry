import ChemistryResultView from "@/components/chemistry/chemistry-result-view";
import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { useSnackbar } from "@/context/snackbar-context";
import {
  Profile,
  Relationship,
  ReportChemistry,
  ReportPassion,
  ReportTikitaka,
} from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function ChemistryDetailPage() {
  const { id } = useLocalSearchParams();
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [chemistryReport, setChemistryReport] =
    useState<ReportChemistry | null>(null);
  const [passionReport, setPassionReport] = useState<ReportPassion | null>(
    null
  );
  const [tikitakaReport, setTikitakaReport] = useState<ReportTikitaka | null>(
    null
  );

  const [modalVisible, setModalVisible] = useState(false);
  const { showSnackbar } = useSnackbar();
  const overlayOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(1000);

  useEffect(() => {
    async function fetchData() {
      if (!profile || !id) return;

      try {
        // Fetch specific relationship
        const { data: relData, error: relError } = await supabase
          .from("relationships")
          .select("*")
          .eq("id", id)
          .single();

        if (relError) {
          console.error("Error fetching relationship:", relError);
          setLoading(false);
          return;
        }

        setRelationship(relData);

        // Fetch partner profile
        const partnerId =
          relData.inviter_profile_id === profile.id
            ? relData.invitee_profile_id
            : relData.inviter_profile_id;

        const { data: partnerData, error: partnerError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", partnerId)
          .single();

        if (partnerError) {
          console.error("Error fetching partner:", partnerError);
        } else {
          setPartner(partnerData);
        }

        // Fetch Reports
        const [chemRes, passionRes, tikitakaRes] = await Promise.all([
          supabase
            .from("report_chemistry")
            .select("*")
            .eq("aas_level", relData.aas_level)
            .eq("big_5_level", relData.big_5_level)
            .eq("flexibility_level", relData.flexibility_level)
            .single(),
          supabase
            .from("report_passion")
            .select("*")
            .eq("type_number", relData.passion_type_number)
            .single(),
          supabase
            .from("report_tikitaka")
            .select("*")
            .lte("min_index", Math.round(relData.tikitaka_index))
            .gte("max_index", Math.round(relData.tikitaka_index))
            .order("min_index", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (chemRes.data) setChemistryReport(chemRes.data);
        if (passionRes.data) setPassionReport(passionRes.data);
        if (tikitakaRes.data) setTikitakaReport(tikitakaRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Unexpected error:", error);
        setLoading(false);
      }
    }

    fetchData();
  }, [profile, id]);

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

  const shareLink = `${Platform.OS === "web" ? window.location.origin : process.env.EXPO_PUBLIC_APP_URL}/share/chemistry/${id}`;

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
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" color="#ECEEDF" />
      </View>
    );
  }

  if (!relationship || !partner) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-foreground">데이터를 찾을 수 없습니다.</Text>
        <TouchableOpacity
          className="mt-4 bg-foreground px-6 py-3 rounded-full"
          onPress={() => router.replace("/")}
        >
          <Text className="text-background font-semibold">돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AnimatedPageWrapper>
      {/* Header */}
      <View className="flex flex-row items-center justify-between px-2 h-14 border-b border-pastel-gray/10">
        <Pressable onPress={() => router.back()} className="p-2">
          <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
        </Pressable>
        <Text className="text-foreground font-semibold text-lg">
          케미스트리
        </Text>
        <Pressable onPress={openModal} className="p-2">
          <FontAwesome6 name="share-nodes" size={20} color="#ECEEDF" />
        </Pressable>
      </View>

      <ChemistryResultView
        relationship={relationship}
        partner={partner}
        myProfile={profile}
        chemistryReport={chemistryReport}
        passionReport={passionReport}
        tikitakaReport={tikitakaReport}
      >
        <View className="mt-6 gap-3 w-full">
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
            onPress={() => router.replace("/")}
          >
            <Text className="text-foreground font-semibold text-base">
              돌아가기
            </Text>
          </TouchableOpacity>
        </View>
      </ChemistryResultView>

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
          <GestureHandlerRootView
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
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
                    우리의 케미스트리 결과를 공유하고
                    <br />
                    지인들에게 우리의 케미를 자랑해보세요!
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
                          title: "케미스트리 결과 공유 💌",
                          description: `${profile?.nickname}님과 ${partner?.nickname}님의 케미 점수는?`,
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
          </GestureHandlerRootView>
        </View>
      </Modal>
    </AnimatedPageWrapper>
  );
}
