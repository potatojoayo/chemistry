import TestPageContent from "@/components/test/test-page-content";

const questions = [
  "I like to be ready for worst-case scenarios.",
  "I prefer planning over spontaneity.",
  "I get energy from social interactions.",
  "I stay calm under pressure.",
];

export default function Big5() {
  return <TestPageContent questions={questions} />;
}
