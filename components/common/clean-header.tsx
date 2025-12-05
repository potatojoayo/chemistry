import { View } from "react-native";

export default function CleanHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View className="absolute left-0 right-0 h-14 z-50 flex flex-row items-center bg-background border-b border-pastel-gray/10 px-3">
      {children}
    </View>
  );
}
