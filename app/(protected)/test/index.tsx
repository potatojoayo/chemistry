import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { supabase } from "@/lib/supabase";
import { Answer } from "@/models/answer";
import { Question } from "@/models/question";
import { useAuthStore } from "@/stores/auth-store";
import { FontAwesome6 } from "@expo/vector-icons";
import { Image } from "expo-image";
// import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function TestPage() {
  const { profile } = useAuthStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (profile?.test_index) {
      setCurrentIndex(profile.test_index);
    }
  }, [profile?.test_index]);

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
    const pct =
      questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;
    progress.value = withTiming(pct, { duration: 300 });
  }, [currentIndex, questions.length, progress]);
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
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

  const handleBack = async () => {
    if (currentIndex <= 0) return;
    await animateOut();
    setCurrentIndex((i) => Math.max(0, i - 1));
    await animateIn();
  };

  const handleSelect = async (value: number) => {
    if (!profile?.id) return;
    setPendingValue(value);
    const q = questions[currentIndex];
    const { data: newAnswer, error } = await supabase
      .from("answers")
      .upsert(
        {
          question_id: q.id,
          answer: value,
          profile_id: profile.id,
        },
        { onConflict: "profile_id,question_id" }
      )
      .select()
      .single();
    if (!error && newAnswer) {
      setAnswers((prev) => {
        const idx = prev.findIndex((a) => a.question_id === q.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = newAnswer;
          return copy;
        }
        return [...prev, newAnswer];
      });
      await Promise.all([
        supabase
          .from("profiles")
          .update({ test_index: currentIndex + 1 })
          .eq("id", profile.id),
        blink(2),
      ]);
      await animateOut();
      setCurrentIndex((i) => i + 1);
      await animateIn();
      blinkOpacity.setValue(1);
      setPendingValue(null);
    }
  };

  if (loading || !profile) {
    return <View></View>;
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
              name="chevron-left"
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
          <Text className="text-foreground my-auto p-3 text-sm font-semibold w-20 text-end">
            {currentIndex + 1} / {questions.length}
          </Text>
        </View>
        {/* 퍼센트 텍스트와 진행률 바 */}
        <View className="h-1.5 bg-foreground overflow-hidden w-full flex">
          <Reanimated.View
            className="h-full rounded-r-full bg-green-600"
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
          <Text className="text-foreground font-semibold text-xl mt-6 text-center p-3">
            {questions[currentIndex].content}
          </Text>
          <View className="flex flex-col items-stretch justify-center px-3 mt-6 gap-3">
            {(() => {
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
                      className={`w-full rounded-lg border p-3 ${
                        isSelected
                          ? "bg-foreground border-foreground"
                          : "border-foreground/30"
                      }`}
                      onPress={() => handleSelect(value)}
                    >
                      <Text
                        className={`text-base ${
                          isSelected
                            ? "text-background font-medium"
                            : "text-foreground font-medium"
                        }`}
                      >
                        {label}
                      </Text>
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
