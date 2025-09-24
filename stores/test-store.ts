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
}

export interface Test {
  id: string;
  name: string;
  description: string;
  color: string;
  questions: {
    content: string;
    answer?: number;
  }[];
  progressIndex: number;
  currentQuestionIndex: number;
}

export const useTestStore = create<TestStore>((set) => ({
  tests: [
    {
      id: "big-5",
      name: "BIG 5",
      color: "#5AAEFF",
      description:
        "BIG 5는 인간의 성격을 개방성·성실성·외향성·친화성·신경성의 다섯 축으로 비춥니다. 점수가 옳고 그름을 말하지는 않아요. 다만, 당신이 어떻게 세상을 보고 반응하는지에 대한 명확한 지도를 건네줍니다.",
      questions: [
        // Openness (개방성) - 6개 질문
        {
          content: "나는 새로운 아이디어에 열려 있다",
          answer: undefined,
        },
        {
          content: "예술과 음악에 관심이 많다",
          answer: undefined,
        },
        {
          content: "상상력이 풍부한 편이다",
          answer: undefined,
        },
        {
          content: "다양한 문화에 대해 배우는 것을 좋아한다",
          answer: undefined,
        },
        {
          content: "철학적인 주제에 대해 생각하는 것을 즐긴다",
          answer: undefined,
        },
        {
          content: "전통보다는 새로운 것을 선호한다",
          answer: undefined,
        },
        {
          content: "창의적인 활동을 즐긴다",
          answer: undefined,
        },
        // Conscientiousness (성실성) - 6개 질문
        {
          content: "계획을 잘 세우는 편이다",
          answer: undefined,
        },
        {
          content: "정리 정돈을 잘한다",
          answer: undefined,
        },
        {
          content: "충동적으로 행동하지 않는다",
          answer: undefined,
        },
        {
          content: "실수를 줄이려고 노력한다",
          answer: undefined,
        },
        {
          content: "집중력이 좋은 편이다",
          answer: undefined,
        },
        {
          content: "목표를 향해 꾸준히 나아간다",
          answer: undefined,
        },
        // Extraversion (외향성) - 6개 질문
        {
          content: "새로운 사람을 만나는 것을 좋아한다",
          answer: undefined,
        },
        {
          content: "말이 많은 편이다",
          answer: undefined,
        },
        {
          content: "활력이 넘치는 편이다",
          answer: undefined,
        },
        {
          content: "주목받는 것을 좋아한다",
          answer: undefined,
        },
        {
          content: "혼자보다는 함께 있는 것을 선호한다",
          answer: undefined,
        },
        {
          content: "주변 사람들을 웃기는 것을 좋아한다",
          answer: undefined,
        },
        {
          content: "쉽게 열정적이 된다",
          answer: undefined,
        },
        // Agreeableness (친화성) - 6개 질문
        {
          content: "다정하고 따뜻한 편이다",
          answer: undefined,
        },
        {
          content: "잘 용서하는 편이다",
          answer: undefined,
        },
        {
          content: "갈등을 피하려고 한다",
          answer: undefined,
        },
        {
          content: "다른 사람을 돕는 것을 좋아한다",
          answer: undefined,
        },
        {
          content: "다른 사람을 믿는 편이다",
          answer: undefined,
        },
        {
          content: "타인의 감정을 잘 이해한다",
          answer: undefined,
        },
        // Neuroticism (신경성) - 6개 질문
        {
          content: "비판에 민감한 편이다",
          answer: undefined,
        },
        {
          content: "걱정을 자주 한다",
          answer: undefined,
        },
        {
          content: "자신에 대해 불안해하는 편이다",
          answer: undefined,
        },
        {
          content: "긴장을 자주 한다",
          answer: undefined,
        },
        {
          content: "사소한 일에 스트레스를 받는다",
          answer: undefined,
        },
        {
          content: "자주 스트레스를 받는다",
          answer: undefined,
        },
        {
          content: "감정 기복이 심한 편이다",
          answer: undefined,
        },
      ],
      currentQuestionIndex: 0,
      progressIndex: 0,
    },
    {
      id: "enneagram",
      name: "에니어그램",
      color: "#26B066",
      description:
        "에니어그램은 인간의 성격을 9가지 유형으로 나누어 설명합니다. 겉으로 드러난 모습이 아니라, 나를 움직이는 핵심 욕구와 두려움을 비춰주는 심리학적 거울입니다. 스스로를 더 깊이 이해하고 관계 속에서 진짜 나를 발견할 수 있습니다.",
      questions: [],
      currentQuestionIndex: 0,
      progressIndex: 0,
    },
    {
      id: "disc",
      name: "DISC",
      color: "#F58476",
      description:
        "DISC는 인간의 행동을 지배(D), 사교(I), 안정(S), 신중(C) 네 가지 유형으로 나눕니다. 당신이 세상과 어울리고 선택하는 방식 속에는 고유한 패턴이 숨어 있습니다. 이 테스트는 그 패턴을 비추어, 관계와 협업에서의 당신의 강점을 알려줍니다.",
      questions: [],
      currentQuestionIndex: 0,
      progressIndex: 0,
    },
    {
      id: "attachment",
      name: "애착유형",
      color: "#ffd54f",
      description:
        "애착 이론은 우리가 사랑하고 관계 맺는 방식을 설명합니다. 안정형, 불안형, 회피형, 혼란형 네 가지 유형 속에서 당신의 관계 패턴을 발견하고 더 건강한 친밀감을 만들어가세요.",
      questions: [],
      currentQuestionIndex: 0,
      progressIndex: 0,
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
    set((state) => ({
      tests: state.tests.map((test) =>
        test.id === id
          ? {
              ...test,
              questions: test.questions.map((question, i) =>
                i === index ? { ...question, answer } : question
              ),
              progressIndex: index + 1,
              currentQuestionIndex: index + 1,
            }
          : test
      ),
    }));
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
}));
