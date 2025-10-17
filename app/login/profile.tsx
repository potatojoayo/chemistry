import AnimatedPageWrapper from "@/components/common/animated-page-wrapper";
import { supabase } from "@/lib/supabase";
import { FontAwesome6 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

export default function Profile() {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarType, setAvatarType] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<TextInput>(null);

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
      setAvatarUri(asset.uri);

      // MIME 타입에서 확장자 추출
      const mimeType = asset.mimeType || asset.type || "image/png";
      console.log("mimeType", mimeType);
      let fileExt = "png"; // 기본값

      if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
        fileExt = "jpg";
      } else if (mimeType.includes("png")) {
        fileExt = "png";
      } else if (mimeType.includes("webp")) {
        fileExt = "webp";
      }

      setAvatarType(fileExt);
      console.log("Selected image mimeType:", mimeType);
      console.log("Extracted file extension:", fileExt);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName = `avatar.${avatarType || "png"}`;
      const filePath = `profiles/${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from("images")
        .upload(filePath, blob, {
          upsert: true,
        });

      if (error) {
        console.error("Avatar upload error:", error);
        return;
      }

      return filePath;
    } catch (error) {
      console.error("Avatar upload error:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (loading || nickname.length < 2) return;
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      let avatarPath = null;
      console.log("avatarUri", avatarUri);
      if (avatarUri) {
        avatarPath = await uploadAvatar(avatarUri);
      }

      const { error } = await supabase.from("profiles").insert({
        user_id: user.id,
        nickname,
        avatar_url: avatarPath,
      });

      if (error) {
        console.error("Profile creation error:", error);
        return;
      }

      router.replace("/(app)");
    } catch (error) {
      console.error("Profile creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPageWrapper>
      <View className="flex-1">
        <TouchableWithoutFeedback>
          <View className="flex-1 flex-col">
            <View className="flex flex-row justify-between h-12">
              <Pressable
                onPress={() => router.replace("/login")}
                className="p-3 w-fit"
              >
                <FontAwesome6 name="chevron-left" size={20} color="#ECEEDF" />
              </Pressable>

              <Pressable
                className="p-3 w-fit"
                disabled={nickname.length < 2 || loading}
                onPress={handleComplete}
              >
                {loading ? (
                  <ActivityIndicator color="#5AAEFF" size={22} />
                ) : (
                  <Text
                    className={`font-medium text-lg ${
                      nickname.length >= 2
                        ? "text-blue-500"
                        : "text-blue-500/50"
                    }`}
                  >
                    완료
                  </Text>
                )}
              </Pressable>
            </View>
            <View className="flex flex-col p-3 pt-0 flex-1">
              <Text className="text-foreground  text-2xl font-semibold">
                프로필을 설정해주세요
              </Text>
              <Text className="mt-1 text-pastel-gray font-medium ">
                언제든 바꿀 수 있어요
              </Text>

              {/* Avatar */}
              <View className="items-center mt-10">
                <Pressable
                  onPress={pickImage}
                  disabled={uploading}
                  className="relative"
                >
                  <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-pastel-gray">
                    {avatarUri ? (
                      <Image
                        source={{ uri: avatarUri }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={require("@/assets/images/default-avatar.png")}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  {uploading && (
                    <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                      <ActivityIndicator color="#ECEEDF" size="small" />
                    </View>
                  )}
                  <View className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full items-center justify-center border-2 border-background">
                    <FontAwesome6 name="camera" size={12} color="#ECEEDF" />
                  </View>
                </Pressable>
              </View>

              <View className="mt-10">
                <TextInput
                  ref={inputRef}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="닉네임"
                  style={{
                    fontSize: 32,
                    color: "#ECEEDF",
                    fontWeight: "bold",
                    textAlign: "left",
                    width: "100%",
                    outline: "none",
                  }}
                  autoFocus
                  onBlur={() => {
                    // focus가 해제되면 즉시 다시 focus
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 0);
                  }}
                  placeholderTextColor="#666"
                  maxLength={10}
                  selectionColor="#ECEEDF"
                  underlineColorAndroid="transparent"
                />
              </View>
              <Animated.View
                style={[
                  {
                    marginTop: "auto",
                    paddingHorizontal: 16,
                    marginBottom: 16,
                  },
                ]}
              >
                {/* <TouchableOpacity
                  className={`bg-foreground rounded-full h-14 items-center justify-center ${phoneNumber.length !== 13 ? "opacity-50" : "opacity-100"} ${loading ? "opacity-50" : "opacity-100"}`}
                  disabled={phoneNumber.length !== 13 ? true || loading : false}
                  activeOpacity={0.7}
                  onPress={handleSendVerificationCode}
                >
                  {loading ? (
                    <ActivityIndicator color="#222" />
                  ) : (
                    <Text className="text-background text-base font-bold text-center">
                      인증번호 받기
                    </Text>
                  )}
                </TouchableOpacity> */}
              </Animated.View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
      {/* <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
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
      </Snackbar> */}
    </AnimatedPageWrapper>
  );
}
