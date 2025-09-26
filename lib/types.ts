export interface Test {
  id: string;
  name: string;
  description: string;
  color: string;
  questions: Question[];
  progressIndex: number;
  currentQuestionIndex: number;
  result?: Big5Result | EnneaResult | DiscResult | null;
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
export type EnneaWingKey =
  | "Wing1"
  | "Wing2"
  | "Wing3"
  | "Wing4"
  | "Wing5"
  | "Wing6"
  | "Wing7"
  | "Wing8"
  | "Wing9";

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
  primary: EnneaTypeScore; // ✅ 단일 값
  wing: EnneaTypeScore; // ✅ 단일 값 (주유형의 양옆 중 선택)
  completion: {
    answered: number; // 전체 응답한 문항 수
    totalItems: number; // 전체 문항 수
    ratio: number; // 0~1
  };
};

export type EnneagramScorerOptions = {
  allowPartial?: boolean; // 일부 미응답 허용(기본 true). false면 누락 시 에러
  reverseCodes?: string[]; // 역채점 문항 코드 (예: ["T3_02"])
};
export type WingText = {
  label: string; // 예: "1번 날개: 완벽주의자"
  oneLine: string; // 한 줄 요약
  description: string; // 본문
  advice: string; // 성장 조언/핵심 팁
};

// DISC
export type DiscKey = "D" | "I" | "S" | "C";

export type DiscStyleScore = {
  style: DiscKey;
  total: number; // 합계 (최대 25)
  average: number; // 평균
  answeredCount: number; // 응답 수 (최대 5)
  maxPossible: number; // answeredCount * 5
  scaled0to100: number; // (total-5)/(25-5) * 100  (응답 수 부족 시 동적으로 환산)
};

export type DiscResult = {
  byStyle: Record<DiscKey, DiscStyleScore>;
  ranking: DiscStyleScore[]; // 점수 내림차순 정렬
  primary: DiscStyleScore; // 1위
  secondary: DiscStyleScore; // 2위
  completion: { answered: number; totalItems: number; ratio: number };
};

export type DiscDescription = {
  title: string; // 예: "하늘의 제왕, 독수리 (주도형)"
  animals: string[]; // 예: ["독수리", "사자", "호랑이"]
  tagline: string; // 한 줄 캐치프레이즈
  description: string; // 본문
  advice: string; // 성장 조언
};
