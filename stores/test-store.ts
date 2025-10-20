import { supabase } from "@/lib/supabase";
import { Answer } from "@/models/answer";
import { Question } from "@/models/question";
import { create } from "zustand";

interface TestStore {
  currentIndex: number;
  questions: Question[];
  answers: Answer[];
  setCurrentQuestionIndex: ({ index }: { index: number }) => void;
  setQuestions: (questions: Question[]) => void;
  setAnswers: (answers: Answer[]) => void;
  goPrev: () => void;
  goNext: () => void;
  answerToQuestion: ({
    question_id,
    answer,
    profile_id,
  }: {
    question_id: string;
    answer: number;
    profile_id: string;
  }) => Promise<void>;
}

export const useTestStore = create<TestStore>((set, get) => ({
  currentIndex: 0,
  questions: [],
  answers: [],
  setQuestions: (questions: Question[]) => {
    set((state) => ({
      ...state,
      questions,
    }));
  },
  setAnswers: (answers: Answer[]) => {
    set((state) => ({
      ...state,
      answers,
    }));
  },
  setCurrentQuestionIndex: ({ index }: { index: number }) => {
    set(() => ({
      currentIndex: index,
    }));
  },
  goPrev: () => {
    set((state) => {
      return {
        ...state,
        currentIndex: state.currentIndex - 1,
      };
    });
  },
  goNext: () => {
    set((state) => {
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
      };
    });
  },
  answerToQuestion: async ({
    question_id,
    answer,
    profile_id,
  }: {
    question_id: string;
    answer: number;
    profile_id: string;
  }) => {
    const { data: newAnswer, error } = await supabase
      .from("answers")
      .upsert(
        {
          question_id,
          answer,
          profile_id,
        },
        { onConflict: "profile_id,question_id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving answer:", error);
      throw error;
    }

    await supabase
      .from("profiles")
      .update({
        test_index: get().currentIndex + 1,
      })
      .eq("id", profile_id);

    set((state) => {
      // 기존 답변을 찾아서 업데이트하거나 새로 추가
      const existingAnswerIndex = state.answers.findIndex(
        (answer) => answer.question_id === question_id
      );

      let updatedAnswers;
      if (existingAnswerIndex >= 0) {
        // 기존 답변 업데이트
        updatedAnswers = [...state.answers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
      } else {
        // 새 답변 추가
        updatedAnswers = [...state.answers, newAnswer];
      }

      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        answers: updatedAnswers,
      };
    });
  },
}));
