import TestPageContent from "@/components/test/test-page-content";
import { useTestStore } from "@/stores/test-store";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TestPage() {
  const { tests } = useTestStore();
  const test = tests.find((test) => test.id === "big-5");
  const { top } = useSafeAreaInsets();
  if (!test) {
    return null;
  }
  return <TestPageContent test={test} paddingTop={top + 64} />;
}
