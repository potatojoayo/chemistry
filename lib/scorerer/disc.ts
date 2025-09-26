import { DiscKey, DiscResult, DiscStyleScore, Question } from "../types";
export class DiscScorer {
  private allowPartial: boolean;

  constructor(opts: { allowPartial?: boolean } = {}) {
    this.allowPartial = opts.allowPartial ?? true;
  }

  score(
    questions: {
      domain: string;
      code: string;
      content: string;
      answer?: number;
    }[]
  ): DiscResult {
    // 1) 수집
    const buckets: Record<DiscKey, number[]> = { D: [], I: [], S: [], C: [] };
    let answeredAll = 0;

    for (const q of questions) {
      const k = this.inferKey(q.domain);
      if (!k) continue;
      const a = this.normalize(q.answer);
      if (a == null) continue;
      buckets[k].push(a);
      answeredAll++;
    }

    if (!this.allowPartial) {
      (["D", "I", "S", "C"] as DiscKey[]).forEach((k) => {
        if (buckets[k].length === 0) {
          throw new Error(
            `No answers for ${k}. Set allowPartial=true to score partial responses.`
          );
        }
      });
    }

    // 2) 점수화
    const byStyle = {} as Record<DiscKey, DiscStyleScore>;
    (["D", "I", "S", "C"] as DiscKey[]).forEach((k) => {
      const arr = buckets[k];
      const total = arr.reduce((s, v) => s + v, 0);
      const answeredCount = arr.length;
      const average = answeredCount ? total / answeredCount : 0;
      const maxPossible = answeredCount * 5;

      // 0~100 환산: 응답 개수에 맞춰 동적 최소/최대(최소=answeredCount*1, 최대=answeredCount*5)
      const minT = answeredCount * 1;
      const maxT = answeredCount * 5;
      const scaled0to100 =
        answeredCount > 0
          ? ((total - minT) / Math.max(1, maxT - minT)) * 100
          : 0;

      byStyle[k] = {
        style: k,
        total,
        average,
        answeredCount,
        maxPossible,
        scaled0to100,
      };
    });

    // 3) 랭킹 + primary/secondary
    const ranking = (["D", "I", "S", "C"] as DiscKey[])
      .map((k) => byStyle[k])
      .sort(
        (a, b) =>
          b.total - a.total ||
          b.answeredCount - a.answeredCount ||
          a.style.localeCompare(b.style) // D < I < S < C
      );

    const primary = ranking[0];
    const secondary = ranking[1];

    // 4) 완성도
    const completion = {
      answered: answeredAll,
      totalItems: questions.length,
      ratio: questions.length ? answeredAll / questions.length : 0,
    };

    return { byStyle, ranking, primary, secondary, completion };
  }

  // ===== helpers =====
  private inferKey(d: string): DiscKey | null {
    const k = (d || "").trim().toUpperCase();
    if (k === "D" || k === "I" || k === "S" || k === "C") return k;
    return null;
  }

  private normalize(a?: number): number | null {
    if (typeof a !== "number") return null;
    if (a < 1 || a > 5) return null;
    return a;
    // 역채점 문항이 필요하면 여기서 6 - a 적용
  }
}

export const discQuestions: Question[] = [
  // D (주도형) 1~5
  {
    domain: "D",
    code: "D_01",
    content: "나는 목표를 달성하는 것이 과정보다 더 중요하다고 생각한다.",
    answer: undefined,
  },
  {
    domain: "D",
    code: "D_02",
    content: "나는 그룹을 이끌고 상황을 주도하는 역할을 선호한다.",
    answer: undefined,
  },
  {
    domain: "D",
    code: "D_03",
    content: "나는 결정을 내릴 때 빠르고 단호하게 행동하는 편이다.",
    answer: undefined,
  },
  {
    domain: "D",
    code: "D_04",
    content: "나는 경쟁적인 환경에서 승부욕을 느끼며 동기부여를 받는다.",
    answer: undefined,
  },
  {
    domain: "D",
    code: "D_05",
    content: "나는 의견을 말할 때 솔직하고 직설적으로 표현한다.",
    answer: undefined,
  },

  // I (사교형) 6~10
  {
    domain: "I",
    code: "I_01",
    content: "나는 새로운 사람들을 만나고 어울리는 것을 즐긴다.",
    answer: undefined,
  },
  {
    domain: "I",
    code: "I_02",
    content:
      "나는 다른 사람들에게 내 생각이나 아이디어를 이야기하고 설득하는 것을 좋아한다.",
    answer: undefined,
  },
  {
    domain: "I",
    code: "I_03",
    content: "나는 대체로 긍정적이고 낙관적인 태도를 유지한다.",
    answer: undefined,
  },
  {
    domain: "I",
    code: "I_04",
    content: "나는 다른 사람들로부터 칭찬이나 인정을 받을 때 큰 힘을 얻는다.",
    answer: undefined,
  },
  {
    domain: "I",
    code: "I_05",
    content: "나는 내 감정이나 느낌을 숨기지 않고 잘 표현하는 편이다.",
    answer: undefined,
  },

  // S (안정형) 11~15
  {
    domain: "S",
    code: "S_01",
    content:
      "나는 급작스러운 변화보다는 안정적이고 예측 가능한 환경을 선호한다.",
    answer: undefined,
  },
  {
    domain: "S",
    code: "S_02",
    content:
      "나는 다른 사람의 이야기를 잘 들어주는 좋은 청취자라는 말을 자주 듣는다.",
    answer: undefined,
  },
  {
    domain: "S",
    code: "S_03",
    content: "나는 경쟁하기보다는 팀원들과 협력하여 일하는 것을 더 좋아한다.",
    answer: undefined,
  },
  {
    domain: "S",
    code: "S_04",
    content: "나는 맡은 일을 꾸준하고 참을성 있게 끝까지 해내는 편이다.",
    answer: undefined,
  },
  {
    domain: "S",
    code: "S_05",
    content: "나는 갈등이 생기는 것을 피하고, 그룹의 화합을 중요하게 생각한다.",
    answer: undefined,
  },

  // C (신중형) 16~20
  {
    domain: "C",
    code: "C_01",
    content:
      "나는 일을 할 때 사소한 실수도 용납하지 않으려 하며, 꼼꼼하게 확인한다.",
    answer: undefined,
  },
  {
    domain: "C",
    code: "C_02",
    content:
      "나는 어떤 일을 시작하기 전에 정보를 철저히 분석하고 계획을 세우는 것이 중요하다.",
    answer: undefined,
  },
  {
    domain: "C",
    code: "C_03",
    content: "나는 규칙과 절차를 따르는 것이 효율적이고 안전하다고 믿는다.",
    answer: undefined,
  },
  {
    domain: "C",
    code: "C_04",
    content: "나는 일의 속도보다는 품질과 정확성을 더 중요하게 생각한다.",
    answer: undefined,
  },
  {
    domain: "C",
    code: "C_05",
    content:
      "나는 감정적인 판단보다는 논리적이고 객관적인 근거에 따라 결정한다.",
    answer: undefined,
  },
];

export const discSampleResult: DiscResult = {
  byStyle: {
    C: {
      answeredCount: 5,
      average: 3.4,
      maxPossible: 25,
      scaled0to100: 60,
      style: "C",
      total: 17,
    },
    D: {
      answeredCount: 5,
      average: 3.2,
      maxPossible: 25,
      scaled0to100: 55.00000000000001,
      style: "D",
      total: 16,
    },
    I: {
      answeredCount: 5,
      average: 3.2,
      maxPossible: 25,
      scaled0to100: 55.00000000000001,
      style: "I",
      total: 16,
    },
    S: {
      answeredCount: 5,
      average: 3.6,
      maxPossible: 25,
      scaled0to100: 65,
      style: "S",
      total: 18,
    },
  },
  completion: { answered: 20, ratio: 1, totalItems: 20 },
  primary: {
    answeredCount: 5,
    average: 3.6,
    maxPossible: 25,
    scaled0to100: 65,
    style: "S",
    total: 18,
  },
  ranking: [
    {
      answeredCount: 5,
      average: 3.6,
      maxPossible: 25,
      scaled0to100: 65,
      style: "S",
      total: 18,
    },
    {
      answeredCount: 5,
      average: 3.4,
      maxPossible: 25,
      scaled0to100: 60,
      style: "C",
      total: 17,
    },
    {
      answeredCount: 5,
      average: 3.2,
      maxPossible: 25,
      scaled0to100: 55.00000000000001,
      style: "D",
      total: 16,
    },
    {
      answeredCount: 5,
      average: 3.2,
      maxPossible: 25,
      scaled0to100: 55.00000000000001,
      style: "I",
      total: 16,
    },
  ],
  secondary: {
    answeredCount: 5,
    average: 3.4,
    maxPossible: 25,
    scaled0to100: 60,
    style: "C",
    total: 17,
  },
};
