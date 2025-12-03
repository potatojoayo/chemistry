import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { NewAnswer, Profile, Question } from "@/db/schema";
import { createRelationship } from "@/lib/create-relationship";
import { computeAndSaveProfileScores } from "@/lib/scorerer";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { useInvitationStore } from "@/stores/invitation-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
// import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Simple UUID generator for React Native
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function TestPage() {
  const { profile } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(profile?.test_index ?? 0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<NewAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const { fetchProfile } = useAuthStore();

  // AnimatedPageWrapper와 동일한 애니메이션
  const fadeAnim = useRef(new Animated.Value(0.5)).current;
  const translateAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Promise.all([
      supabase.from("questions").select("*"),
      supabase
        .from("answers")
        .select("*")
        .eq("profile_id", profile?.id ?? ""),
    ]).then(([questions, answers]) => {
      setQuestions(questions.data ?? []);
      setAnswers(answers.data ?? []);

      setLoading(false);
    });
  }, [profile?.id, setQuestions, setAnswers, setLoading]);

  // 로딩이 끝나면 애니메이션 시작
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [loading, fadeAnim, translateAnim]);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (questions.length === 0) return;
    const pct =
      questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;
    progress.value = withTiming(pct, { duration: 300 });
  }, [currentIndex, questions.length, progress]);
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
      borderBottomRightRadius: progress.value >= 100 ? 0 : 4,
      borderTopRightRadius: progress.value >= 100 ? 0 : 4,
    };
  });

  // Per-question transition animation
  const questionFade = useRef(new Animated.Value(1)).current;
  const questionTranslate = useRef(new Animated.Value(0)).current;
  const [pendingValue, setPendingValue] = useState<number | null>(null);
  const blinkOpacity = useRef(new Animated.Value(1)).current;

  const animateOut = () =>
    new Promise<void>((resolve) => {
      Animated.parallel([
        Animated.timing(questionFade, {
          toValue: 0,
          duration: 120,
          useNativeDriver: false,
        }),
        Animated.timing(questionTranslate, {
          toValue: -8,
          duration: 120,
          useNativeDriver: false,
        }),
      ]).start(() => resolve());
    });

  const animateIn = () =>
    new Promise<void>((resolve) => {
      questionTranslate.setValue(8);
      questionFade.setValue(0);
      Animated.parallel([
        Animated.timing(questionFade, {
          toValue: 1,
          duration: 160,
          useNativeDriver: false,
        }),
        Animated.timing(questionTranslate, {
          toValue: 0,
          duration: 160,
          useNativeDriver: false,
        }),
      ]).start(() => resolve());
    });

  const blink = (times: number = 3) =>
    new Promise<void>((resolve) => {
      const steps: Animated.CompositeAnimation[] = [];
      for (let i = 0; i < times; i++) {
        steps.push(
          Animated.timing(blinkOpacity, {
            toValue: 0.5,
            duration: 120,
            useNativeDriver: false,
          })
        );
        steps.push(
          Animated.timing(blinkOpacity, {
            toValue: 1,
            duration: 120,
            useNativeDriver: false,
          })
        );
      }
      Animated.sequence(steps).start(() => resolve());
    });

  const saveAnswer = async (
    profileId: string,
    questionId: string,
    value: number,
    nextIndex: number
  ) => {
    const { data: newAnswer, error } = await supabase
      .from("answers")
      .upsert(
        {
          question_id: questionId,
          answer: value,
          profile_id: profileId,
        },
        { onConflict: "profile_id,question_id" }
      )
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("profiles")
      .update({ test_index: nextIndex })
      .eq("id", profileId)
      .lt("test_index", nextIndex);

    return newAnswer;
  };

  const handleBack = async () => {
    if (currentIndex <= 0) {
      router.back();
      return;
    }
    await animateOut();
    setCurrentIndex((i) => Math.max(0, i - 1));
    await animateIn();
  };

  const handleSelect = async (value: number) => {
    if (!profile?.id || !questions[currentIndex]) return;
    const q = questions[currentIndex];
    setPendingValue(value);
    setAnswers((prev) => {
      const idx = prev.findIndex((a) => a.question_id === q.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          id: prev[idx].id,
          profile_id: prev[idx].profile_id,
          question_id: prev[idx].question_id,
          answer: value,
        };
        return copy;
      }
      return [
        ...prev,
        {
          id: generateUUID(),
          profile_id: profile.id,
          question_id: q.id,
          answer: value,
        },
      ];
    });

    saveAnswer(profile.id, q.id, value, currentIndex + 1).then((saved) => {
      setAnswers((prev) => {
        const idx = prev.findIndex((a) => a.question_id === q.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = saved;
          return copy;
        }
        return [...prev, saved];
      });
    });
    // UI transitions proceed independently
    await blink(2);
    await animateOut();
    setCurrentIndex((i) => i + 1);
    await animateIn();
    blinkOpacity.setValue(1);
    setPendingValue(null);
  };

  const { inviterProfileId } = useInvitationStore();
  const [, setInviterProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (inviterProfileId) {
      supabase
        .from("profiles")
        .select("*")
        .eq("id", inviterProfileId)
        .single()
        .then(({ data }) => {
          if (data) {
            setInviterProfile(data);
          }
        });
    }
  }, [inviterProfileId]);

  const handleCompleteTest = async () => {
    if (loading) return;
    if (!profile?.id) return;
    setLoading(true);
    try {
      await computeAndSaveProfileScores(profile.id);
      await fetchProfile();

      const updatedProfile = useAuthStore.getState().profile;
      if (!updatedProfile) return; // Keep this check

      if (inviterProfileId) {
        const { data: inviter } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", inviterProfileId)
          .single();

        if (inviter) {
          let male = inviter;
          let female = updatedProfile;

          if (inviter.gender === "female" && updatedProfile.gender === "male") {
            male = updatedProfile;
            female = inviter;
          } else if (
            inviter.gender === "male" &&
            updatedProfile.gender === "female"
          ) {
            male = inviter;
            female = updatedProfile;
          } else {
            // Same gender or invalid, skip relationship creation but still show result
            // or maybe show error? User didn't specify.
            // For now, just proceed to result.
          }

          // Only create if we have a valid male/female pair (or if we decided to support same-gender in future, but current logic is strict)
          if (male.gender !== female.gender) {
            await createRelationship({ male, female });
          }
        }
      }

      router.replace("/test/result");
    } catch (error) {
      console.error("Error computing and saving profile scores:", error);
      setLoading(false);
    }
  };

  if (loading || !profile || questions.length === 0) {
    return <View className="flex-1 bg-background"></View>;
  }

  return (
    <AnimatedPageWrapper>
      <View className="flex flex-col flex-1">
        <View className="flex flex-row justify-between h-12">
          <Pressable
            onPress={handleBack}
            className="p-3 flex flex-row items-center gap-2 w-20"
          >
            <FontAwesome6
              name="arrow-left-long"
              size={20}
              color="#ECEEDF"
              style={{ outerWidth: 20, outerHeight: 20 }}
            />
            {/* <Text className="text-foreground font-semibold text-lg">
              테스트
            </Text> */}
          </Pressable>
          <Image
            source={require("../../../assets/images/logo-foreground.png")}
            style={{ height: "100%", width: 100 }}
            contentFit="contain"
          />
          {currentIndex < questions.length ? (
            <Text className="text-foreground my-auto p-3 text-xs font-semibold w-20 text-end">
              {currentIndex + 1} / {questions.length}
            </Text>
          ) : (
            <View className="w-20"></View>
          )}
        </View>
        {/* 퍼센트 텍스트와 진행률 바 */}
        <View className="h-1.5 bg-foreground overflow-hidden w-full flex">
          <Reanimated.View
            className="h-full bg-green-600"
            style={progressStyle}
          />
        </View>
        <Animated.View
          style={{
            opacity: questionFade,
            transform: [{ translateY: questionTranslate }],
          }}
          className="flex flex-col"
        >
          <Text
            className="text-foreground font-medium text-xl text-center p-6"
            style={{
              marginTop: currentIndex >= questions.length ? 0 : 24,
              paddingTop: currentIndex >= questions.length ? 0 : 24,
            }}
          >
            {(questions[currentIndex]?.content ?? "").replace(/\.$/, "")}
          </Text>
          <View
            className="flex flex-col items-stretch justify-center px-3 gap-3"
            style={{
              marginTop: currentIndex >= questions.length ? 0 : 24,
            }}
          >
            {(() => {
              if (currentIndex >= questions.length) {
                return (
                  <View className="flex flex-col flex-1">
                    <Text className="text-foreground text-2xl font-semibold">
                      테스트 완료!
                    </Text>
                    <Text className="mt-3 text-pastel-gray font-medium leading-5">
                      성격, 애착, 안정성 데이터를 바탕으로 당신의 연애 패턴을
                      분석했어요. 지금 결과를 확인하고, 상대에게 공유해 두
                      사람의 케미스트리를 확인해보세요.
                    </Text>
                    <Image
                      source={require("../../../assets/images/test-done.png")}
                      style={{
                        width: 280,
                        height: 280,
                        marginTop: 64,
                        marginHorizontal: "auto",
                      }}
                      contentFit="contain"
                    />
                    <TouchableOpacity
                      className="w-full bg-foreground px-16 rounded-full mt-16 h-14 items-center justify-center"
                      onPress={handleCompleteTest}
                      activeOpacity={0.8}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#222" />
                      ) : (
                        <Text
                          className={`text-center text-background font-semibold text-base`}
                        >
                          결과 확인하기
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }
              const q = questions[currentIndex];
              const selectedAnswer = answers.find(
                (a) => a.question_id === q.id
              )?.answer;
              const labels =
                q.test_id === "big-5"
                  ? [
                      "전혀 그렇지 않다",
                      "비교적 그렇지 않다",
                      "중간 정도이다",
                      "비교적그렇다",
                      "매우그렇다",
                    ]
                  : [
                      "전혀 그렇지 않다",
                      "그렇지 않은 편이다",
                      "조금 그렇지 않다",
                      "보통이다",
                      "조금 그렇다",
                      "그렇다",
                      "매우 그렇다",
                    ];
              return labels.map((label, idx) => {
                const value = idx + 1;
                const isSelected = selectedAnswer === value;
                return (
                  <Animated.View
                    key={`${q.id}-${value}`}
                    style={
                      pendingValue === value
                        ? { opacity: blinkOpacity }
                        : undefined
                    }
                  >
                    <Pressable
                      className={`w-full rounded-lg border p-3 flex justify-between flex-row items-center  ${
                        isSelected
                          ? " border-foreground bg-foreground/10"
                          : "border-foreground/30"
                      }`}
                      onPress={() =>
                        pendingValue ? null : handleSelect(value)
                      }
                      disabled={!!pendingValue}
                    >
                      <Text
                        className={`text-base text-foreground font-medium" }`}
                      >
                        {label}
                      </Text>
                      {isSelected && (
                        <FontAwesome6
                          name="check"
                          size={16}
                          color="#ECEEDF"
                          style={{ marginLeft: "auto" }}
                        />
                      )}
                    </Pressable>
                  </Animated.View>
                );
              });
            })()}
          </View>
        </Animated.View>
      </View>
    </AnimatedPageWrapper>
  );
}
