import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 전역 스크롤 위치 저장소
const scrollPositions = new Map<string, number>();

export default function TabPageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const segments = useSegments();
  const scrollViewRef = useRef<ScrollView>(null);
  const currentPath = segments.join("/");
  const [isVisible, setIsVisible] = useState(false);

  // 페이지 변경 시 스크롤 위치 복원
  useEffect(() => {
    if (Platform.OS === "web") {
      const savedPosition = scrollPositions.get(currentPath);

      if (savedPosition !== undefined && scrollViewRef.current) {
        // 먼저 invisible 상태로 만들고
        setIsVisible(false);

        // 스크롤 위치 설정 후 visible로 변경
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: savedPosition,
            animated: false,
          });
          setIsVisible(true);
        }, 0);
      } else {
        // 저장된 위치가 없으면 바로 visible
        setIsVisible(true);
      }
    } else {
      // 네이티브에서는 항상 visible
      setIsVisible(true);
    }
  }, [currentPath]);

  // 스크롤 위치 저장
  const handleScroll = (event: any) => {
    if (Platform.OS === "web") {
      const scrollY = event.nativeEvent.contentOffset.y;
      scrollPositions.set(currentPath, scrollY);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        ref={scrollViewRef}
        className="bg-background flex-1"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        onScroll={handleScroll}
        scrollEventThrottle={100}
        style={{
          opacity: isVisible ? 1 : 0,
          ...(Platform.OS === "web" && {
            // @ts-ignore - 웹 전용 속성
            scrollBehavior: "auto", // smooth 대신 auto로 변경
          }),
        }}
      >
        <View
          className="max-w-xl w-full mx-auto h-full"
          style={{
            paddingTop: insets.top + 52, // status bar + 헤더 높이 + 여백
            paddingBottom: tabBarHeight + 16,
          }}
        >
          {children}
        </View>
      </ScrollView>
    </View>
  );
}
