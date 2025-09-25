import TestPageContent from "@/components/test/test-page-content";
import { useTestStore } from "@/stores/test-store";

export default function TestPage() {
  const { tests } = useTestStore();
  const test = tests.find((test) => test.id === "enneagram");
  if (!test) {
    return null;
  }
  return <TestPageContent test={test} />;
}
