export type AttachmentKey = "Anxiety" | "Avoidance";

export interface AttachmentQuestion {
  id: number;
  text: string;
  domain: AttachmentKey; // Anxiety 또는 Avoidance
  answer: number | null; // 1~7 Likert
}

export interface AttachmentResult {
  anxiety: {
    average: number; // 불안 평균
    z: number; // 불안 Z점수
  };
  avoidance: {
    average: number; // 회피 평균
    z: number; // 회피 Z점수
  };
  integrated: {
    z: number; // 통합 Z점수
    percentile: number; // 0~100
  };
  completion: {
    answered: number;
    totalItems: number;
    ratio: number;
  };
}
