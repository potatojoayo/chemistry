export interface Test {
  id: string;
  name: string;
  description: string;
  color: string;
  questions: Question[];
  progressIndex: number;
  currentQuestionIndex: number;
  result?: Big5Result | EnneaResult | null;
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

// ENNEAGRAM
export type EnneaKey =
  | "Type1"
  | "Type2"
  | "Type3"
  | "Type4"
  | "Type5"
  | "Type6"
  | "Type7"
  | "Type8"
  | "Type9";

export type EnneaTypeScore = {
  type: EnneaKey;
  total: number; // 해당 유형 총점(응답 합)
  average: number; // 응답 평균(= total / answeredCount)
  answeredCount: number; // 응답한 문항 수
  maxPossible: number; // answeredCount * 5
};

export type EnneaResult = {
  byType: Record<EnneaKey, EnneaTypeScore>;
  ranking: EnneaTypeScore[]; // 점수 내림차순 정렬
  primary: EnneaTypeScore[]; // 최고점 동점 시 여러 개
  wing: EnneaTypeScore[]; // 2위 동점 시 여러 개
  completion: {
    answered: number; // 전체 응답한 문항 수
    totalItems: number; // 전체 문항 수
    ratio: number; // 0~1
  };
};

export type EnneagramScorerOptions = {
  allowPartial?: boolean; // 일부 미응답 허용(기본 true). false면 누락 시 에러
  // 특정 문항 역채점이 필요하다면 여기 코드 추가 (예: ["T3_02"])
  reverseCodes?: string[];
};
