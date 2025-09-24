import {
  Big5Key,
  Big5Result,
  Big5ScorerOptions,
  Question,
  TraitResult,
} from "@/lib/types";

export class Big5Scorer {
  private norms: Record<Big5Key, { mean: number; sd: number }>;
  private weights: Record<Big5Key, number>;
  private zScaleMin: number;
  private zScaleMax: number;
  private reverseSet: Set<string>;

  constructor(opts: Big5ScorerOptions = {}) {
    this.norms = opts.norms ?? {
      O: { mean: 2.66, sd: 0.4 },
      C: { mean: 3.91, sd: 0.32 },
      E: { mean: 3.14, sd: 0.38 },
      A: { mean: 3.91, sd: 0.32 },
      N: { mean: 2.35, sd: 0.47 },
    };
    // Z 합성 가중치 (N은 음수)
    this.weights = opts.weights ?? {
      O: 0.02,
      C: 0.25,
      E: 0.08,
      A: 0.31,
      N: -0.35,
    };
    this.zScaleMin = opts.zScaleMin ?? -3;
    this.zScaleMax = opts.zScaleMax ?? +3;
    this.reverseSet = new Set(opts.reverseCodes ?? []);
  }

  score(questions: Question[]): Big5Result {
    // 1) 영역별 수집
    const grouped: Record<Big5Key, number[]> = {
      O: [],
      C: [],
      E: [],
      A: [],
      N: [],
    };

    for (const q of questions) {
      const key = this.inferDomain(q);
      if (!key) continue;
      const val = this.normalizeAnswer(q);
      if (val == null) continue; // 미응답/범위 밖 → 스킵
      grouped[key].push(val);
    }

    // 2) 평균 (비어 있으면 NaN)
    const means: Record<Big5Key, number> = {
      O: this.mean(grouped.O),
      C: this.mean(grouped.C),
      E: this.mean(grouped.E),
      A: this.mean(grouped.A),
      N: this.mean(grouped.N),
    };

    // 3) Z
    const z: Record<Big5Key, number> = {
      O: this.zFromMean(means.O, "O"),
      C: this.zFromMean(means.C, "C"),
      E: this.zFromMean(means.E, "E"),
      A: this.zFromMean(means.A, "A"),
      N: this.zFromMean(means.N, "N"),
    };

    // 4) 특성별 결과
    const byTrait: Record<Big5Key, TraitResult> = {
      O: this.traitResult(means.O, z.O),
      C: this.traitResult(means.C, z.C),
      E: this.traitResult(means.E, z.E),
      A: this.traitResult(means.A, z.A),
      N: this.traitResult(means.N, z.N),
    };

    // 5) 합성 Z (가중합)
    const compositeZ =
      this.weights.O * z.O +
      this.weights.C * z.C +
      this.weights.E * z.E +
      this.weights.A * z.A +
      this.weights.N * z.N;

    // 6) 해석 가능한 1~5 스케일 평균 (N 방향 반전 반영)
    //    meanN_adj = 2*norms.N.mean - meanN (규준평균 대칭 이동)
    const meanAdj: Record<Big5Key, number> = {
      O: means.O,
      C: means.C,
      E: means.E,
      A: means.A,
      N: Number.isFinite(means.N) ? 2 * this.norms.N.mean - means.N : NaN,
    };

    // 절대가중치 정규화
    const absSum = (["O", "C", "E", "A", "N"] as Big5Key[]).reduce(
      (s, k) => s + Math.abs(this.weights[k]),
      0
    );

    const parts = (["O", "C", "E", "A", "N"] as Big5Key[])
      .filter((k) => Number.isFinite(meanAdj[k]))
      .map((k) => ({
        w: Math.abs(this.weights[k]) / absSum,
        m: meanAdj[k],
      }));

    const compositeMean = parts.length
      ? parts.reduce((s, p) => s + p.w * p.m, 0)
      : NaN;

    return {
      byTrait,
      composite: {
        mean: compositeMean,
        z: compositeZ,
        percentile: this.normalCDF(compositeZ) * 100,
        scaled0to100: this.zToScaled100(compositeZ),
      },
    };
  }

  // ===== 도메인 추론: 풀네임/코드 프리픽스 모두 지원 =====
  private inferDomain(q: Question): Big5Key | null {
    const d = (q.domain || "").trim().toLowerCase();
    if (d.startsWith("open")) return "O";
    if (d.startsWith("consc")) return "C";
    if (d.startsWith("extra")) return "E";
    if (d.startsWith("agree")) return "A";
    if (d.startsWith("neuro")) return "N";

    // 보조: code 프리픽스
    const c = (q.code || "").toUpperCase();
    if (c.startsWith("OPE_")) return "O";
    if (c.startsWith("CON_")) return "C";
    if (c.startsWith("EXT_")) return "E";
    if (c.startsWith("AGR_")) return "A";
    if (c.startsWith("NEU_")) return "N";

    return null;
  }

  // ===== 응답 정규화 (역채점 포함) =====
  private normalizeAnswer(q: Question): number | null {
    const a = q.answer;
    if (typeof a !== "number" || a < 1 || a > 5) return null;
    if (this.reverseSet.has(q.code)) return 6 - a; // 1..5 → 역채점
    return a;
  }

  // ===== 유틸 =====
  private mean(arr: number[]): number {
    return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : NaN;
  }

  private zFromMean(meanVal: number, key: Big5Key): number {
    const { mean, sd } = this.norms[key];
    return Number.isFinite(meanVal) ? (meanVal - mean) / sd : NaN;
  }

  private clamp(x: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, x));
  }

  private zToScaled100(z: number) {
    if (!Number.isFinite(z)) return NaN;
    const zc = this.clamp(z, this.zScaleMin, this.zScaleMax);
    return ((zc - this.zScaleMin) / (this.zScaleMax - this.zScaleMin)) * 100;
  }
  private traitResult(meanVal: number, z: number): TraitResult {
    return {
      mean: meanVal,
      z,
      percentile: this.normalCDF(z) * 100,
      scaled0to100: this.zToScaled100(z),
    };
  }

  // 표준정규 CDF 근사
  private normalCDF(z: number): number {
    if (!Number.isFinite(z)) return NaN;
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    let p =
      1 -
      d *
        (1.330274429 * t -
          1.821255978 * t * t +
          1.781477937 * t * t * t -
          0.356563782 * t * t * t * t +
          0.31938153 * t * t * t * t * t);
    if (z < 0) p = 1 - p;
    return p;
  }
}

export const big5Questions = [
  {
    domain: "Openness",
    code: "OPE_01",
    content: "나는 새로운 아이디어에 열려 있다.",
    answer: undefined,
  },
  {
    domain: "Openness",
    code: "OPE_02",
    content: "예술과 음악에 관심이 많다.",
    answer: undefined,
  },
  {
    domain: "Openness",
    code: "OPE_03",
    content: "상상력이 풍부한 편이다.",
    answer: undefined,
  },
  {
    domain: "Openness",
    code: "OPE_04",
    content: "다양한 문화에 대해 배우는 것을 좋아한다.",
    answer: undefined,
  },
  {
    domain: "Openness",
    code: "OPE_05",
    content: "철학적인 주제에 대해 생각하는 것을 즐긴다.",
    answer: undefined,
  },
  {
    domain: "Openness",
    code: "OPE_06",
    content: "전통보다는 새로운 것을 선호한다.",
    answer: undefined,
  },
  {
    domain: "Openness",
    code: "OPE_07",
    content: "창의적인 활동을 즐긴다.",
    answer: undefined,
  },
  // Conscientiousness (성실성) - 6개 질문
  {
    domain: "Conscientiousness",
    code: "CON_01",
    content: "계획을 잘 세우는 편이다.",
    answer: undefined,
  },
  {
    domain: "Conscientiousness",
    code: "CON_02",
    content: "정리 정돈을 잘한다.",
    answer: undefined,
  },
  {
    domain: "Conscientiousness",
    code: "CON_03",
    content: "충동적으로 행동하지 않는다.",
    answer: undefined,
  },
  {
    domain: "Conscientiousness",
    code: "CON_04",
    content: "실수를 줄이려고 노력한다.",
    answer: undefined,
  },
  {
    domain: "Conscientiousness",
    code: "CON_05",
    content: "집중력이 좋은 편이다.",
    answer: undefined,
  },
  {
    domain: "Conscientiousness",
    code: "CON_06",
    content: "목표를 향해 꾸준히 나아간다.",
    answer: undefined,
  },
  // Extraversion (외향성) - 6개 질문
  {
    domain: "Extraversion",
    code: "EXT_01",
    content: "새로운 사람을 만나는 것을 좋아한다.",
    answer: undefined,
  },
  {
    domain: "Extraversion",
    code: "EXT_02",
    content: "말이 많은 편이다.",
    answer: undefined,
  },
  {
    domain: "Extraversion",
    code: "EXT_03",
    content: "활력이 넘치는 편이다.",
    answer: undefined,
  },
  {
    domain: "Extraversion",
    code: "EXT_04",
    content: "주목받는 것을 좋아한다.",
    answer: undefined,
  },
  {
    domain: "Extraversion",
    code: "EXT_05",
    content: "혼자보다는 함께 있는 것을 선호한다.",
    answer: undefined,
  },
  {
    domain: "Extraversion",
    code: "EXT_06",
    content: "주변 사람들을 웃기는 것을 좋아한다.",
    answer: undefined,
  },
  {
    domain: "Extraversion",
    code: "EXT_07",
    content: "쉽게 열정적이 된다.",
    answer: undefined,
  },
  // Agreeableness (친화성) - 6개 질문
  {
    domain: "Agreeableness",
    code: "AGR_01",
    content: "다정하고 따뜻한 편이다.",
    answer: undefined,
  },
  {
    domain: "Agreeableness",
    code: "AGR_02",
    content: "잘 용서하는 편이다.",
    answer: undefined,
  },
  {
    domain: "Agreeableness",
    code: "AGR_03",
    content: "갈등을 피하려고 한다.",
    answer: undefined,
  },
  {
    domain: "Agreeableness",
    code: "AGR_04",
    content: "다른 사람을 돕는 것을 좋아한다.",
    answer: undefined,
  },
  {
    domain: "Agreeableness",
    code: "AGR_05",
    content: "다른 사람을 믿는 편이다.",
    answer: undefined,
  },
  {
    domain: "Agreeableness",
    code: "AGR_06",
    content: "타인의 감정을 잘 이해한다.",
    answer: undefined,
  },
  // Neuroticism (신경성) - 6개 질문
  {
    domain: "Neuroticism",
    code: "NEU_01",
    content: "비판에 민감한 편이다.",
    answer: undefined,
  },
  {
    domain: "Neuroticism",
    code: "NEU_02",
    content: "걱정을 자주 한다.",
    answer: undefined,
  },
  {
    domain: "Neuroticism",
    code: "NEU_03",
    content: "자신에 대해 불안해하는 편이다.",
    answer: undefined,
  },
  {
    domain: "Neuroticism",
    code: "NEU_04",
    content: "긴장을 자주 한다.",
    answer: undefined,
  },
  {
    domain: "Neuroticism",
    code: "NEU_05",
    content: "사소한 일에 스트레스를 받는다.",
    answer: undefined,
  },
  {
    domain: "Neuroticism",
    code: "NEU_06",
    content: "자주 스트레스를 받는다.",
    answer: undefined,
  },
  {
    domain: "Neuroticism",
    code: "NEU_07",
    content: "감정 기복이 심한 편이다.",
    answer: undefined,
  },
];
