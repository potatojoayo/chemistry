import React, { createContext, ReactNode, useContext, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Snackbar } from "react-native-paper";

interface SnackbarOptions {
  message: string;
  bottom?: number;
  top?: number;
}

interface SnackbarContextType {
  showSnackbar: (options: SnackbarOptions) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [queue, setQueue] = useState<SnackbarOptions[]>([]);
  const [current, setCurrent] = useState<SnackbarOptions>({
    message: "",
    bottom: 24,
  });

  const showSnackbar = (options: SnackbarOptions) => {
    setQueue((prev) => [...prev, options]);
  };

  const hideSnackbar = () => {
    setVisible(false);
  };

  React.useEffect(() => {
    if (!visible && queue.length > 0) {
      const next = queue[0];
      setCurrent(next);
      setQueue((prev) => prev.slice(1));

      // 약간의 딜레이를 주어 자연스럽게 연결되도록 함
      setTimeout(() => {
        setVisible(true);
      }, 300);
    }
  }, [visible, queue]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={3000}
        wrapperStyle={{
          position: "absolute",
          bottom: current.top ? undefined : (current.bottom ?? 8),
          top: current.top,
          left: 0,
          right: 0,
        }}
        style={{
          backgroundColor: "#222",
        }}
      >
        <View className="flex flex-row items-center justify-between">
          <Text className="text-foreground text-sm font-medium">
            {current.message}
          </Text>
          <Pressable
            onPress={hideSnackbar}
            className="bg-foreground rounded-full px-4 py-2"
          >
            <Text className="text-background text-xs font-semibold">확인</Text>
          </Pressable>
        </View>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
