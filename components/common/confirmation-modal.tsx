import { FontAwesome6 } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "확인",
  cancelText = "취소",
  isDestructive = false,
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-background/50">
        <BlurView intensity={20} className="absolute inset-0" />
        <View className="bg-background w-[85%] rounded-3xl p-6 items-center shadow-lg border border-white/10">
          <View className="mb-4 bg-white/5 p-4 rounded-full">
            <FontAwesome6
              name={isDestructive ? "triangle-exclamation" : "circle-info"}
              size={32}
              color={isDestructive ? "#ef4444" : "#ECEEDF"}
            />
          </View>
          <Text className="text-white text-lg font-bold mb-2 text-center">
            {title}
          </Text>
          <Text className="text-white/60 text-center mb-8 leading-5">
            {message}
          </Text>

          <View className="flex-row gap-3 w-full">
            <TouchableOpacity
              className="flex-1 py-3.5 rounded-xl bg-white/10"
              onPress={onClose}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text
                className={`text-white font-semibold text-center ${isLoading ? "opacity-50" : ""}`}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3.5 rounded-xl ${
                isDestructive ? "bg-red-500" : "bg-primary"
              } flex-row justify-center items-center gap-2`}
              onPress={() => {
                onConfirm();
                // onClose(); // Let the parent handle closing to allow for async operations
              }}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-semibold text-center">
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
