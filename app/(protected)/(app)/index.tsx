import TabPageWrapper from "@/components/common/tab-page-wrapper";
import { useKakao } from "@/lib/kakao-web";
import { supabase } from "@/lib/supabase";
import { Relation } from "@/models/relation";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Snackbar } from "react-native-paper";

export default function Home() {
  const { profile } = useAuthStore();
  useKakao();

  const [relations, setRelations] = useState<Relation[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleInvite = () => {
    setShowInviteModal(true);
  };

    const inviteLink = `${Platform.OS === "web" ? window.location.origin : process.env.EXPO_PUBLIC_APP_URL}/invite/${profile?.id}`;

  const handleCopyLink = async () => {
    if(!profile){
      return;
    }

    try {
      await Clipboard.setStringAsync(inviteLink);
      setSnackbarVisible(true);
      setShowInviteModal(false);
    } catch (error) {
      console.error("클립보드 복사 실패:", error);
      // 모든 방법 실패 시 사용자에게 알림
      setShowInviteModal(false);
    }
  };

  useEffect(() => {
    if (!profile?.id) return;
    setLoading(true);
    supabase
      .from("relations")
      .select("*")
      .or(`requester_id.eq.${profile.id},target_id.eq.${profile.id}`)
      .then((response) => {
        setRelations(response.data ?? []);
        setLoading(false);
      });
  }, [profile?.id]);

  if (!profile) return null;

  return (
    <TabPageWrapper>
      <ScrollView className="flex flex-col">
        <View className="flex flex-col p-3 pt-1">
          <TouchableOpacity
            className="flex flex-row items-center gap-3 h-12"
            activeOpacity={0.7}
            onPress={handleInvite}
          >
            <Image
              source={{ uri: profile.avatar_url }}
              style={{ width: 36, height: 36, borderRadius: 40 }}
              contentFit="cover"
            />
            <View className="flex flex-col">
              <Text className="text-foreground font-semibold">
                {profile.nickname}
              </Text>
            </View>
          </TouchableOpacity>
          <View className="my-3 border-t border-pastel-gray/20"></View>
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex flex-row items-center gap-3"
            onPress={handleInvite}
          >
            <View className="rounded-xl w-9 h-9 bg-foreground flex items-center justify-center">
              <FontAwesome6 name="plus" size={16} color="#222" />
            </View>
            <View className="flex flex-col">
              <Text className="text-foreground font-medium">
                케미스트리 초대하기
              </Text>
              <Text className="text-pastel-gray  text-xs">
                썸·연인에게 초대 링크를 보내고 함께 케미를 확인해보세요!
              </Text>
            </View>
          </TouchableOpacity>
          <View className="my-3 border-t border-pastel-gray/20"></View>
          {relations.length === 0 && !loading ? (
            <View className="mt-6 flex flex-col items-center">
              <Image
                source={require("../../../assets/images/empty.png")}
                style={{
                  width: 200,
                  height: 200,
                  margin: "auto",
                }}
                contentFit="contain"
              />
              <Text className="text-pastel-gray  text-[0.9rem] font-medium mt-6">
                아직 등록된 케미스트리가 없어요
              </Text>
              <TouchableOpacity
                className="bg-foreground rounded-full px-16 py-4 mt-6"
                activeOpacity={0.7}
                onPress={handleInvite}
              >
                <Text className="text-background font-semibold text-base">
                  썸·연인 초대하기
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View></View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View className="flex-1 bg-background">
          <View className="flex flex-row justify-between items-center p-4 border-b border-pastel-gray/20">
            <TouchableOpacity
              onPress={() => setShowInviteModal(false)}
              className="w-10"
            >
              <FontAwesome6 name="xmark" size={20} color="#ECEEDF" />
            </TouchableOpacity>
            <Text className="text-foreground font-semibold text-lg">
              케미스트리 초대하기
            </Text>
            <View style={{ width: 40 }} />
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
              썸·연인에게 초대 링크를 보내고
              <br />
              함께 서로의 케미를 확인해보세요!
            </Text>

            <TouchableOpacity
              className="bg-foreground rounded-full px-6 py-4 mb-4 mt-10"
              activeOpacity={0.7}
              onPress={handleCopyLink}
            >
              <Text className="text-background font-semibold text-center">
                초대 링크 복사하기
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
                    title: "케미스트리 초대하기 💞",
                    description: "우리의 케미를 확인해보세요!",
                    imageUrl: "https://example.com/thumbnail.png",
                    link: {
                      webUrl: inviteLink,
                      mobileWebUrl: inviteLink,
                    },
                  },
                });
                setShowInviteModal(false);
              }}
            >
              <Text className="text-foreground font-semibold text-center">
                카카오톡 공유하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        wrapperStyle={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
        }}
        style={{
          backgroundColor: "#222",
        }}
      >
        <View className="flex flex-row items-center justify-between">
          <Text className="text-foreground text-sm font-medium">
            초대 링크가 클립보드에 복사되었어요!
          </Text>
          <Pressable
            onPress={() => setSnackbarVisible(false)}
            className="bg-foreground rounded-full px-4 py-2"
          >
            <Text className="text-background text-xs font-semibold">확인</Text>
          </Pressable>
        </View>
      </Snackbar>
    </TabPageWrapper>
  );
}
