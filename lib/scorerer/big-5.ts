import {
  Big5Key,
  Big5Norms,
  Big5Result,
  Big5ScorerOptions,
  Big5Weights,
  Question,
  TraitResult,
} from "@/lib/types";

export class Big5Scorer {
  private norms: Big5Norms;
  private weights: Big5Weights;
  private zScaleMin: number;
  private zScaleMax: number;
  private reverseSet: Set<string>;

  constructor(opts: Big5ScorerOptions = {}) {
    // 기본 규준 (사용자 제공 표 기반)
    this.norms = opts.norms ?? {
      O: { mean: 2.66, sd: 0.4 },
      C: { mean: 3.91, sd: 0.32 },
      E: { mean: 3.14, sd: 0.38 },
      A: { mean: 3.91, sd: 0.32 },
      N: { mean: 2.35, sd: 0.47 },
    };

    // 통합 Z 가중치 (관계 친밀/호감 조합)
    this.weights = opts.weights ?? {
      O: 0.02,
      C: 0.25,
      E: 0.08,
      A: 0.31,
      N: -0.35, // N은 음수 가중치(방향 반전 내포)
    };

    this.zScaleMin = opts.zScaleMin ?? -3;
    this.zScaleMax = opts.zScaleMax ?? +3;
    this.reverseSet = new Set(opts.reverseCodes ?? []);
  }

  // ===== Public API =====
  score(questions: Question[]): Big5Result {
    if (questions.length !== 42) {
      throw new Error("BIG 5 질문은 42개여야 합니다.");
    }

    if (questions.some((q) => q.answer === undefined)) {
      throw new Error("모든 질문에 답변을 해주세요.");
    }

    const grouped: Record<Big5Key, number[]> = {
      O: [],
      C: [],
      E: [],
      A: [],
      N: [],
    };
    for (const q of questions) {
      const dom = this.asKey(q.domain);
      if (!dom) continue;
      const val = this.normalizeAnswer(q);
      if (val !== null) grouped[dom].push(val);
    }

    const means: Record<Big5Key, number> = {
      O: this.mean(grouped.O),
      C: this.mean(grouped.C),
      E: this.mean(grouped.E),
      A: this.mean(grouped.A),
      N: this.mean(grouped.N),
    };

    const z: Record<Big5Key, number> = {
      O: this.zFromMean(means.O, "O"),
      C: this.zFromMean(means.C, "C"),
      E: this.zFromMean(means.E, "E"),
      A: this.zFromMean(means.A, "A"),
      N: this.zFromMean(means.N, "N"),
    };

    const byTrait: Record<Big5Key, TraitResult> = {
      O: this.traitResult(means.O, z.O),
      C: this.traitResult(means.C, z.C),
      E: this.traitResult(means.E, z.E),
      A: this.traitResult(means.A, z.A),
      N: this.traitResult(means.N, z.N),
    };

    // ---- (1) Z 기반 통합점수 (기존 그대로) ----
    const compositeZ =
      this.weights.O * z.O +
      this.weights.C * z.C +
      this.weights.E * z.E +
      this.weights.A * z.A +
      this.weights.N * z.N;

    // ---- (2) 1~5 스케일의 '해석 가능한 종합 평균' ----
    // N은 방향 반전 평균으로 사용 (규준평균 대칭): meanN_adj
    const meanN_adj = Number.isFinite(means.N)
      ? 2 * this.norms.N.mean - means.N
      : NaN;

    // 각 특성 평균을 (N만 반전 적용) 모아서 가중평균
    const meanAdj: Record<Big5Key, number> = {
      O: means.O,
      C: means.C,
      E: means.E,
      A: means.A,
      N: meanN_adj,
    };

    // 절대 가중치 정규화(부호는 이미 평균 반전에 반영됨)
    const absSum =
      Math.abs(this.weights.O) +
      Math.abs(this.weights.C) +
      Math.abs(this.weights.E) +
      Math.abs(this.weights.A) +
      Math.abs(this.weights.N);

    // NaN 전파 방지용: 유효한 평균만 포함
    const parts: { w: number; m: number }[] = (
      ["O", "C", "E", "A", "N"] as Big5Key[]
    )
      .filter((k) => Number.isFinite(meanAdj[k]))
      .map((k) => ({
        w: Math.abs(this.weights[k]) / absSum,
        m: meanAdj[k]!,
      }));

    const compositeMean =
      parts.length > 0 ? parts.reduce((s, p) => s + p.w * p.m, 0) : NaN;

    return {
      byTrait,
      composite: {
        // 이제 mean 포함!
        mean: compositeMean, // ✅ 1..5 스케일의 방향-정렬 평균
        z: compositeZ,
        percentile: this.normalCDF(compositeZ) * 100,
        scaled0to100: this.zToScaled100(compositeZ),
      },
    };
  }

  // ===== Helpers =====
  private asKey(domain: string): Big5Key | null {
    const d = domain?.trim().toUpperCase();
    return d === "O" || d === "C" || d === "E" || d === "A" || d === "N"
      ? (d as Big5Key)
      : null;
  }

  private normalizeAnswer(q: Question): number | null {
    if (typeof q.answer !== "number" || q.answer < 1 || q.answer > 5)
      return null;
    // 역채점: 1..5 Likert → 6 - x
    if (this.reverseSet.has(q.code)) return 6 - q.answer;
    return q.answer;
  }

  private mean(arr: number[]): number {
    if (!arr.length) return NaN;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private zFromMean(meanVal: number, key: Big5Key): number {
    const { mean, sd } = this.norms[key];
    if (!Number.isFinite(meanVal)) return NaN;
    return (meanVal - mean) / sd;
  }

  private clamp(x: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, x));
  }

  private zToScaled100(z: number) {
    const zc = this.clamp(z, this.zScaleMin, this.zScaleMax);
    return ((zc - this.zScaleMin) / (this.zScaleMax - this.zScaleMin)) * 100;
  }

  // 표준정규 CDF 근사 (Abramowitz–Stegun)
  private normalCDF(z: number): number {
    if (!Number.isFinite(z)) return NaN;
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp((-z * z) / 2);
    let p =
      1 -
      d *
        (1.330274429 * t -
          1.821255978 * Math.pow(t, 2) +
          1.781477937 * Math.pow(t, 3) -
          0.356563782 * Math.pow(t, 4) +
          0.31938153 * Math.pow(t, 5));
    if (z < 0) p = 1 - p;
    return p;
  }

  private traitResult(meanVal: number, z: number): TraitResult {
    return {
      mean: meanVal,
      z,
      percentile: this.normalCDF(z) * 100,
      scaled0to100: this.zToScaled100(z),
    };
  }
}

export const big5Questions = [
  {
    domain: "Openness",
    code: "OPE_01",
    content: "나는 새로운 아이디어에 열려 있다.",
    answer: undefined,
  },
  // {
  //   domain: "Openness",
  //   code: "OPE_02",
  //   content: "예술과 음악에 관심이 많다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Openness",
  //   code: "OPE_03",
  //   content: "상상력이 풍부한 편이다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Openness",
  //   code: "OPE_04",
  //   content: "다양한 문화에 대해 배우는 것을 좋아한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Openness",
  //   code: "OPE_05",
  //   content: "철학적인 주제에 대해 생각하는 것을 즐긴다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Openness",
  //   code: "OPE_06",
  //   content: "전통보다는 새로운 것을 선호한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Openness",
  //   code: "OPE_07",
  //   content: "창의적인 활동을 즐긴다.",
  //   answer: undefined,
  // },
  // // Conscientiousness (성실성) - 6개 질문
  // {
  //   domain: "Conscientiousness",
  //   code: "CON_01",
  //   content: "계획을 잘 세우는 편이다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Conscientiousness",
  //   code: "CON_02",
  //   content: "정리 정돈을 잘한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Conscientiousness",
  //   code: "CON_03",
  //   content: "충동적으로 행동하지 않는다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Conscientiousness",
  //   code: "CON_04",
  //   content: "실수를 줄이려고 노력한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Conscientiousness",
  //   code: "CON_05",
  //   content: "집중력이 좋은 편이다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Conscientiousness",
  //   code: "CON_06",
  //   content: "목표를 향해 꾸준히 나아간다.",
  //   answer: undefined,
  // },
  // // Extraversion (외향성) - 6개 질문
  // {
  //   domain: "Extraversion",
  //   code: "EXT_01",
  //   content: "새로운 사람을 만나는 것을 좋아한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Extraversion",
  //   code: "EXT_02",
  //   content: "말이 많은 편이다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Extraversion",
  //   code: "EXT_03",
  //   content: "활력이 넘치는 편이다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Extraversion",
  //   code: "EXT_04",
  //   content: "주목받는 것을 좋아한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Extraversion",
  //   code: "EXT_05",
  //   content: "혼자보다는 함께 있는 것을 선호한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Extraversion",
  //   code: "EXT_06",
  //   content: "주변 사람들을 웃기는 것을 좋아한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Extraversion",
  //   code: "EXT_07",
  //   content: "쉽게 열정적이 된다.",
  //   answer: undefined,
  // },
  // // Agreeableness (친화성) - 6개 질문
  // {
  //   domain: "Agreeableness",
  //   code: "AGR_01",
  //   content: "다정하고 따뜻한 편이다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Agreeableness",
  //   code: "AGR_02",
  //   content: "잘 용서하는 편이다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Agreeableness",
  //   code: "AGR_03",
  //   content: "갈등을 피하려고 한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Agreeableness",
  //   code: "AGR_04",
  //   content: "다른 사람을 돕는 것을 좋아한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Agreeableness",
  //   code: "AGR_05",
  //   content: "다른 사람을 믿는 편이다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Agreeableness",
  //   code: "AGR_06",
  //   content: "타인의 감정을 잘 이해한다.",
  //   answer: undefined,
  // },
  // // Neuroticism (신경성) - 6개 질문
  // {
  //   domain: "Neuroticism",
  //   code: "NEU_01",
  //   content: "비판에 민감한 편이다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Neuroticism",
  //   code: "NEU_02",
  //   content: "걱정을 자주 한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Neuroticism",
  //   code: "NEU_03",
  //   content: "자신에 대해 불안해하는 편이다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Neuroticism",
  //   code: "NEU_04",
  //   content: "긴장을 자주 한다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Neuroticism",
  //   code: "NEU_05",
  //   content: "사소한 일에 스트레스를 받는다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Neuroticism",
  //   code: "NEU_06",
  //   content: "자주 스트레스를 받는다.",
  //   answer: undefined,
  // },
  // {
  //   domain: "Neuroticism",
  //   code: "NEU_07",
  //   content: "감정 기복이 심한 편이다.",
  //   answer: undefined,
  // },
];
