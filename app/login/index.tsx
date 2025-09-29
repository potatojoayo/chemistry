import { useAudioPlayer } from "expo-audio";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Login() {
  const fadeAnim = useState(new Animated.Value(0))[0];
  const imageFadeAnim = useState(new Animated.Value(0))[0];
  const imageTranslateY = useState(new Animated.Value(16))[0]; // 오른쪽에서 시작
  const imageScale = useState(new Animated.Value(0.8))[0]; // 작게 시작
  const buttonFadeAnim = useState(new Animated.Value(0))[0];
  const { bottom } = useSafeAreaInsets();

  const audioPlayer = useAudioPlayer(require("../../assets/audio/space.mp3"));
  const player = useVideoPlayer(
    require("../../assets/videos/star4.mp4"),
    (player) => {
      player.loop = false;
      player.muted = true; // 음소거로 자동재생 보장
      player.playbackRate = 0.5; // 재생속도 조절 (1.0 = 정상속도, 0.5 = 절반속도, 2.0 = 2배속)
      // iOS Safari 설정
      if (Platform.OS === "web") {
        (player as any).allowsExternalPlayback = false;
        (player as any).allowsPictureInPicturePlayback = false;
      }
    }
  );

  useEffect(() => {
    audioPlayer.loop = true;
    audioPlayer.play();
    return () => {
      if (Platform.OS === "web") {
        audioPlayer.pause();
      }
    };
  }, [audioPlayer]);

  useEffect(() => {
    // 비디오가 준비되면 자동 재생

    const statusSubscription = player.addListener("statusChange", (event) => {
      if (event.status === "readyToPlay") {
        player.play();

        // 비디오 Fade-in 애니메이션 시작
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000, // 1초 동안 fade-in
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }).start();
        // 이미지 애니메이션 시작 (처음에만) - fade, slide, scale 동시 실행
        Animated.parallel([
          Animated.timing(imageFadeAnim, {
            toValue: 1,
            duration: 1000,
            delay: 500,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }),

          Animated.timing(imageTranslateY, {
            toValue: 0, // 제자리로 이동
            delay: 500,
            duration: 2000,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(imageScale, {
            toValue: 1, // 원래 크기로
            delay: 500,
            duration: 2000,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(buttonFadeAnim, {
            toValue: 1,
            duration: 1000,
            delay: 2000,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }),
        ]).start();
      }
    });

    // 15초마다 fade-out 후 replay
    const timer = setInterval(() => {
      // Fade-out 애니메이션
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500, // 0.5초 동안 fade-out
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start(() => {
        // fade-out 완료 후 1초 대기
        setTimeout(() => {
          // 비디오를 처음으로 되돌리고 재생
          (player as any).replay();
          // 비디오만 Fade-in 애니메이션 (이미지는 그대로 유지)
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500, // 0.5초 동안 fade-in
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease),
          }).start();
        }, 200); // 0.2초 대기
      });
    }, 15500); // 15초마다 실행

    return () => {
      statusSubscription?.remove();
      clearInterval(timer);
    };
  }, [
    player,
    fadeAnim,
    imageFadeAnim,
    imageTranslateY,
    imageScale,
    buttonFadeAnim,
    audioPlayer,
  ]);

  return (
    <View className="flex-1 bg-black">
      <View className="flex-1 relative bg-black max-w-5xl mx-auto w-full text-foreground">
        {/* 비디오 배경 */}
        <TouchableWithoutFeedback>
          <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
            <VideoView
              player={player}
              nativeControls={false}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
              playsInline
              style={{
                width: "100%",
                height: "100%",
                pointerEvents: "none", // 터치 이벤트 차단
              }}
              contentFit="cover"
            />
          </Animated.View>
        </TouchableWithoutFeedback>

        {/* 이미지 오버레이 */}
        <View className="absolute inset-0 flex flex-col items-center mt-40 ">
          <Animated.View
            className="flex flex-col items-center justify-center px-4"
            style={{
              opacity: imageFadeAnim,
              transform: [
                { translateY: imageTranslateY },
                { scale: imageScale },
              ],
            }}
          >
            <Image
              source={require("../../assets/images/logo-foreground.png")}
              resizeMode="contain"
              className="mx-auto"
              style={{ width: 320, height: 48 }}
            />
            <Text
              className={`text-foreground text-center mt-12 leading-snug max-w-lg w-full font-bold ${Platform.OS === "web" ? "text-2xl" : "text-3xl"}`}
            >
              “자신을 아는 것이{"\n"}
              모든 지혜의 시작이다”
            </Text>
            <Text
              className={`text-foreground mt-1 text-center font-regular ${Platform.OS === "web" ? "text-base" : "text-xl"}`}
            >
              - 아리스토텔레스
            </Text>
          </Animated.View>
          <View
            className="mt-auto"
            style={{
              paddingBottom: bottom + 40,
              maxWidth: 400,
              paddingHorizontal: 20,
              width: "100%",
              marginHorizontal: "auto",
            }}
          >
            <Animated.View style={{ opacity: buttonFadeAnim }}>
              <View className="w-full px-4">
                <TouchableOpacity className="w-full bg-foreground py-4 px-16 rounded-full">
                  <Text
                    className={`text-center text-background font-bold ${Platform.OS === "web" ? "text-base" : "text-xl"}`}
                  >
                    카카오로 시작하기
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                className={`text-center font-regular text-foreground text-lg  mt-8 px-10 ${Platform.OS === "web" ? "text-sm" : "text-lg"}`}
              >
                회원가입 시{" "}
                <Text
                  className="underline text-foreground"
                  onPress={() => Linking.openURL("https://google.com")}
                >
                  서비스 이용약관
                </Text>
                에 동의하신 것으로 간주합니다. 회원 데이터를 어떻게 활용하는지{" "}
                <Text
                  className="underline text-foreground"
                  onPress={() => Linking.openURL("https://google.com")}
                >
                  개인정보 처리방침
                </Text>
                에서 확인해보세요.
              </Text>
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
}
