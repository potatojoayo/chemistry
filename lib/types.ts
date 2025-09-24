export interface Test {
  id: string;
  name: string;
  description: string;
  color: string;
  questions: Question[];
  progressIndex: number;
  currentQuestionIndex: number;
  result?: Big5Result | null;
}

export interface Question {
  domain: string;
  code: string;
  content: string;
  answer?: number;
}

// BIG 5
export type Big5Key = "O" | "C" | "E" | "A" | "N";
export type TraitResult = {
  mean: number;
  z: number;
  percentile: number;
  scaled0to100: number;
};
export type Big5Result = {
  byTrait: Record<Big5Key, TraitResult>;
  composite: TraitResult;
};
export type Big5Norms = Record<Big5Key, { mean: number; sd: number }>;
export type Big5Weights = Record<Big5Key, number>;
export type Big5ScorerOptions = {
  norms?: Big5Norms;
  weights?: Big5Weights; // 통합 점수 가중치
  zScaleMin?: number; // 0..100 선형 스케일 변환 시 Z 하한 (기본 -3)
  zScaleMax?: number; // 0..100 선형 스케일 변환 시 Z 상한 (기본 +3)
  // 역채점 문항 코드 배열 (예: ["CON_03", "EXT_02"])
  reverseCodes?: string[];
};
