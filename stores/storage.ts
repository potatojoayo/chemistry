import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { StateStorage } from "zustand/middleware";

export const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return typeof window !== "undefined"
        ? window.localStorage.getItem(name)
        : null;
    }
    return (await AsyncStorage.getItem(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(name, value);
      }
      return;
    }
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(name);
      }
      return;
    }
    await AsyncStorage.removeItem(name);
  },
};
