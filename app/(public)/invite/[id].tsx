import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { createRelationship } from "@/lib/create-relationship";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/models/profile";
import { useAuthStore } from "@/stores/auth-store";
import { useInvitationStore } from "@/stores/invitation-store";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Snackbar } from "react-native-paper";
import Animated from "react-native-reanimated";

export default function Test() {
  const { id } = useLocalSearchParams();
  const [requesterProfile, setRequesterProfile] = useState<Profile | null>(
    null
  );
  const { setRedirectPath } = useInvitationStore();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { profile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .then(({ data, error }) => {
          if (error) {
            setSnackbarMessage("프로필을 불러오는데 실패했습니다.");
            setSnackbarVisible(true);
            return;
          }
          setRequesterProfile(data?.[0] ?? null);
        });
    }
  }, [id]);

  const [existingRelationship, setExistingRelationship] = useState(false);

  useEffect(() => {
    if (profile && requesterProfile) {
      supabase
        .from("relationships")
        .select("*")
        .or(
          `and(inviting_profile_id.eq.${profile.id},invited_profile_id.eq.${requesterProfile.id}),and(inviting_profile_id.eq.${requesterProfile.id},invited_profile_id.eq.${profile.id})`
        )
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setExistingRelationship(true);
          }
        });
    }
  }, [profile, requesterProfile]);

  const { setInviterProfileId, clearInvitation } = useInvitationStore();

  const handleStartTest = async () => {
    if (existingRelationship) {
      setRedirectPath(null);
      router.push("/");
      return;
    }
    if (loading) return;
    if (!requesterProfile) {
      setSnackbarMessage("초대자 정보를 찾을 수 없습니다.");
      setSnackbarVisible(true);
      return;
    }

    if (!profile) {
      router.push("/login");
      return;
    }

    if (profile.test_completed) {
      setLoading(true);

      let male = requesterProfile;
      let female = profile;

      if (requesterProfile.gender === "female" && profile.gender === "male") {
        male = profile;
        female = requesterProfile;
      } else if (
        requesterProfile.gender === "male" &&
        profile.gender === "female"
      ) {
        male = requesterProfile;
        female = profile;
      } else {
        setSnackbarMessage("현재 케미스트리 분석은 이성 커플만 지원해요.");
        setSnackbarVisible(true);
        setLoading(false);
        return;
      }

      await createRelationship({
        male,
        female,
      });
      clearInvitation();
      setRedirectPath(null);
      router.push(`/`);
      return;
    }

    setInviterProfileId(id as string);
    router.push(`/test/intro`);
  };

  if (!requesterProfile) return null;

  return (
    <AnimatedPageWrapper>
      <View className="flex-1">
        <TouchableWithoutFeedback>
          <View className="flex-1 flex-col">
            <View className="flex flex-row justify-center h-12">
              <View className="p-3">
                <Image
                  source={require("../../../assets/images/logo-foreground.png")}
                  style={{ height: 36, width: 120 }}
                  resizeMode="contain"
                />
              </View>
              {/* <Pressable
                onPress={() => router.replace("/login")}
                className="p-3 w-fit"
              >
                <FontAwesome6
                  name="arrow-right-from-bracket"
                  size={20}
                  color="#ECEEDF"
                />
              </Pressable> */}
            </View>
            <View className="flex flex-col p-3  flex-1">
              <Image
                source={{ uri: requesterProfile.avatar_url }}
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 100,
                  marginHorizontal: "auto",
                  marginTop: "auto",
                }}
              />
              <Text className="text-foreground text-2xl font-semibold mt-6 text-center">
                {existingRelationship
                  ? `이미 ${requesterProfile.nickname} 님과의\n케미를 알아봤어요️`
                  : `${requesterProfile.nickname} 님이 당신과의 케미를\n알고 싶어해요 ❤️`}
              </Text>
              <Text className="mt-3 text-foreground/50 font-medium leading-5 text-center text-[13px]">
                {existingRelationship ? (
                  <>
                    두 분의 소중한 결과가 기다리고 있어요.
                    <br />
                    다시 결과를 확인하러 가볼까요?
                  </>
                ) : (
                  <>
                    두 사람 사이에 어떤 끌림이 숨겨져 있을까요?
                    <br />
                    그동안 잘 몰랐던 서로의 마음을 가까이 느낄 수 있을 거예요.
                  </>
                )}
              </Text>

              <Animated.View
                style={[
                  {
                    marginTop: "auto",
                    paddingHorizontal: 12,
                    marginBottom: 12,
                  },
                ]}
              >
                <TouchableOpacity
                  className={`bg-foreground rounded-full h-14 items-center justify-center`}
                  activeOpacity={0.7}
                  onPress={
                    existingRelationship
                      ? () => router.push("/")
                      : handleStartTest
                  }
                >
                  {loading ? (
                    <ActivityIndicator color="#222" />
                  ) : (
                    <Text className="text-background text-base font-semibold text-center">
                      케미 확인하기
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        wrapperStyle={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 16,
        }}
        style={{
          backgroundColor: "#222",
        }}
      >
        <View className="flex flex-row items-center justify-between">
          <Text className="text-foreground text-sm font-medium">
            {snackbarMessage}
          </Text>
          <Pressable
            onPress={() => setSnackbarVisible(false)}
            className="bg-foreground rounded-full px-4 py-2"
          >
            <Text className="text-background text-xs font-semibold">확인</Text>
          </Pressable>
        </View>
      </Snackbar>
    </AnimatedPageWrapper>
  );
}
