import { create } from "zustand";

interface TestStore {
  tests: Test[];
  setCurrentQuestionIndex: ({
    id,
    index,
  }: {
    id: string;
    index: number;
  }) => void;
  setAnswer: ({
    id,
    index,
    answer,
  }: {
    id: string;
    index: number;
    answer: number;
  }) => void;
}

export interface Test {
  id: string;
  name: string;
  description: string;
  questions: {
    content: string;
    answer?: number;
  }[];
  currentQuestionIndex: number;
}

export const useTestStore = create<TestStore>((set) => ({
  tests: [
    {
      id: "big-5",
      name: "BIG 5",
      description:
        "BIG 5는 인간의 성격을 개방성·성실성·외향성·친화성·신경성의 다섯 축으로 비춥니다. 점수가 옳고 그름을 말하지는 않아요. 다만, 당신이 어떻게 세상을 보고 반응하는지에 대한 명확한 지도를 건네줍니다.",
      questions: [
        {
          content: "I like to be ready for worst-case scenarios.",
          answer: undefined,
        },
        {
          content: "I prefer planning over spontaneity.",
          answer: undefined,
        },
        {
          content: "I get energy from social interactions.",
          answer: undefined,
        },
        {
          content: "I stay calm under pressure.",
          answer: undefined,
        },
      ],
      currentQuestionIndex: 0,
    },
  ],
  setCurrentQuestionIndex: ({ id, index }: { id: string; index: number }) => {
    set((state) => ({
      tests: state.tests.map((test) =>
        test.id === id ? { ...test, currentQuestionIndex: index } : test
      ),
    }));
  },
  setAnswer: ({
    id,
    index,
    answer,
  }: {
    id: string;
    index: number;
    answer: number;
  }) => {
    set((state) => ({
      tests: state.tests.map((test) =>
        test.id === id
          ? {
              ...test,
              questions: test.questions.map((question, i) =>
                i === index ? { ...question, answer } : question
              ),
            }
          : test
      ),
    }));
  },
}));
