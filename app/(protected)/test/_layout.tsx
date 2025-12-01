import { Stack } from "expo-router";

export default function TestLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="intro" />
      <Stack.Screen name="index" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
