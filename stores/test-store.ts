import {
  attachmentQuestions,
  AttachmentScorer,
} from "@/lib/scorerer/attachment";
import { big5Questions, Big5Scorer } from "@/lib/scorerer/big-5";
import { discQuestions, DiscScorer } from "@/lib/scorerer/disc";
import { enneagramQuestions, EnneagramScorer } from "@/lib/scorerer/enneagram";
import { Test } from "@/lib/types";
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
  answerToQuestion: ({
    id,
    index,
    answer,
  }: {
    id: string;
    index: number;
    answer: number;
  }) => void;
  clearAnswers: ({ id }: { id: string }) => void;
  goPrev: ({ id }: { id: string }) => void;
  goNext: ({ id }: { id: string }) => void;
  takeReTest: ({ id }: { id: string }) => void;
}

export const useTestStore = create<TestStore>((set) => ({
  tests: [
    {
      id: "big-5",
      name: "BIG 5",
      color: "#5AAEFF",
      description:
        "BIG 5는 인간의 성격을 개방성·성실성·외향성·친화성·신경성의 다섯 축으로 비춥니다. 점수가 옳고 그름을 말하지는 않아요. 다만, 당신이 어떻게 세상을 보고 반응하는지에 대한 명확한 지도를 건네줍니다.",
      questions: big5Questions,
      currentQuestionIndex: 0,
      progressIndex: 0,
      // result: sampleResult,
    },
    {
      id: "enneagram",
      name: "에니어그램",
      color: "#26B066",
      description:
        "에니어그램은 인간의 성격을 9가지 유형으로 나누어 설명합니다. 겉으로 드러난 모습이 아니라, 나를 움직이는 핵심 욕구와 두려움을 비춰주는 심리학적 거울입니다. 스스로를 더 깊이 이해하고 관계 속에서 진짜 나를 발견할 수 있습니다.",
      questions: enneagramQuestions,
      currentQuestionIndex: 0,
      progressIndex: 0,
      // result: enneaSampleResult,
    },
    {
      id: "disc",
      name: "DISC",
      color: "#F58476",
      description:
        "DISC는 인간의 행동을 지배(D), 사교(I), 안정(S), 신중(C) 네 가지 유형으로 나눕니다. 당신이 세상과 어울리고 선택하는 방식 속에는 고유한 패턴이 숨어 있습니다. 이 테스트는 그 패턴을 비추어, 관계와 협업에서의 당신의 강점을 알려줍니다.",
      questions: discQuestions,
      currentQuestionIndex: 0,
      progressIndex: 0,
      // result: discSampleResult,
    },
    {
      id: "attachment",
      name: "애착유형",
      color: "#ffd54f",
      description:
        "애착 이론은 우리가 사랑하고 관계 맺는 방식을 설명합니다. 안정형, 불안형, 회피형, 혼란형 네 가지 유형 속에서 당신의 관계 패턴을 발견하고 더 건강한 친밀감을 만들어가세요.",
      questions: attachmentQuestions,
      currentQuestionIndex: 0,
      progressIndex: 0,
      // result: attachmentSampleResult,
    },
  ],
  setCurrentQuestionIndex: ({ id, index }: { id: string; index: number }) => {
    set((state) => ({
      tests: state.tests.map((test) =>
        test.id === id ? { ...test, currentQuestionIndex: index } : test
      ),
    }));
  },
  answerToQuestion: ({
    id,
    index,
    answer,
  }: {
    id: string;
    index: number;
    answer: number;
  }) => {
    set((state) => {
      const test = state.tests.find((t) => t.id === id);
      if (!test) return state;
      const questions = test.questions;
      const question = questions[index];
      if (!question) return state;
      const newQuestions = questions.map((question, i) =>
        i === index ? { ...question, answer } : question
      );
      const newProgressIndex = index + 1;
      const newCurrentQuestionIndex = newProgressIndex;

      let newResult = test.result;

      if (newProgressIndex === questions.length) {
        if (test.id === "big-5") {
          const scorer = new Big5Scorer();
          newResult = scorer.score(newQuestions);
        } else if (test.id === "enneagram") {
          const scorer = new EnneagramScorer();
          newResult = scorer.score(newQuestions);
        } else if (test.id === "disc") {
          const scorer = new DiscScorer();
          newResult = scorer.score(newQuestions);
        } else if (test.id === "attachment") {
          const scorer = new AttachmentScorer();
          newResult = scorer.score(newQuestions);
        }
      }

      return {
        tests: state.tests.map((test) =>
          test.id === id
            ? {
                ...test,
                questions: newQuestions,
                progressIndex: newProgressIndex,
                currentQuestionIndex: newCurrentQuestionIndex,
                result: newResult,
              }
            : test
        ),
      };
    });
  },
  clearAnswers: ({ id }: { id: string }) => {
    set((state) => ({
      tests: state.tests.map((test) =>
        test.id === id
          ? {
              ...test,
              questions: test.questions.map((question) => ({
                ...question,
                answer: undefined,
              })),
              currentQuestionIndex: 0,
              progressIndex: 0,
            }
          : test
      ),
    }));
  },
  goPrev: ({ id }: { id: string }) => {
    set((state) => {
      const test = state.tests.find((t) => t.id === id);
      if (!test) return state;
      if (test.currentQuestionIndex <= 0) return state;
      return {
        tests: state.tests.map((test) =>
          test.id === id
            ? { ...test, currentQuestionIndex: test.currentQuestionIndex - 1 }
            : test
        ),
      };
    });
  },
  goNext: ({ id }: { id: string }) => {
    set((state) => {
      const test = state.tests.find((t) => t.id === id);
      if (!test) return state;
      if (test.currentQuestionIndex > test.progressIndex) return state;
      return {
        tests: state.tests.map((test) =>
          test.id === id
            ? { ...test, currentQuestionIndex: test.currentQuestionIndex + 1 }
            : test
        ),
      };
    });
  },
  scoreTest: ({ id }: { id: string }) => {
    set((state) => {
      const test = state.tests.find((t) => t.id === id);
      if (!test) return state;
      if (test.id === "big-5") {
        const scorer = new Big5Scorer();
        const result = scorer.score(test.questions);
        return {
          tests: state.tests.map((test) =>
            test.id === id ? { ...test, result } : test
          ),
        };
      }
      return state;
    });
  },
  takeReTest: ({ id }: { id: string }) => {
    set((state) => {
      const test = state.tests.find((t) => t.id === id);
      if (!test) return state;
      return {
        tests: state.tests.map((test) =>
          test.id === id
            ? { ...test, currentQuestionIndex: 0, progressIndex: 0 }
            : test
        ),
      };
    });
  },
}));
