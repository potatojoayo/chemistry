import { useTestStore } from "@/stores/test-store";
import { Text, View } from "react-native";

export default function Big5Result() {
  const { tests } = useTestStore();
  const test = tests.find((test) => test.id === "big-5");
  if (!test) {
    return null;
  }
  return (
    <View>
      <Text>BIG 5 Result</Text>
      <Text>{test.result?.byTrait.A.percentile}</Text>
    </View>
  );
}
