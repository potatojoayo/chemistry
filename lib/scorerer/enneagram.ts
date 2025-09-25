import {
  EnneagramScorerOptions,
  EnneaKey,
  EnneaResult,
  EnneaTypeScore,
  Question,
} from "../types";

const ENNEA_ORDER: EnneaKey[] = [
  "Type1",
  "Type2",
  "Type3",
  "Type4",
  "Type5",
  "Type6",
  "Type7",
  "Type8",
  "Type9",
];

// ---- 내부 헬퍼(최소 추가) ----
const typeToNum = (k: EnneaKey) => Number(k.replace("Type", ""));
const numToKey = (n: number) => `Type${n}` as EnneaKey;
const neighbors = (n: number): [number, number] => {
  const left = n === 1 ? 9 : n - 1;
  const right = n === 9 ? 1 : n + 1;
  return [left, right];
};
// 동점 시 결정 규칙: total ↓, answeredCount ↓, 번호 오름차순
const cmpScore = (a: EnneaTypeScore, b: EnneaTypeScore) =>
  b.total - a.total ||
  b.answeredCount - a.answeredCount ||
  typeToNum(a.type) - typeToNum(b.type);

export class EnneagramScorer {
  private allowPartial: boolean;
  private reverseSet: Set<string>;

  constructor(opts: EnneagramScorerOptions = {}) {
    this.allowPartial = opts.allowPartial ?? true;
    this.reverseSet = new Set(opts.reverseCodes ?? []);
  }

  score(questions: Question[]): EnneaResult {
    // 1) 유형별 응답 수집
    const buckets: Record<EnneaKey, number[]> = {
      Type1: [],
      Type2: [],
      Type3: [],
      Type4: [],
      Type5: [],
      Type6: [],
      Type7: [],
      Type8: [],
      Type9: [],
    };

    let answeredAll = 0;
    for (const q of questions) {
      const key = this.inferType(q);
      if (!key) continue;
      const a = this.normalizeAnswer(q);
      if (a == null) continue;
      buckets[key].push(a);
      answeredAll++;
    }

    if (!this.allowPartial) {
      for (const k of ENNEA_ORDER) {
        if (buckets[k].length === 0) {
          throw new Error(
            `No answers for ${k}. Set allowPartial=true to score partial responses.`
          );
        }
      }
    }

    // 2) 유형별 점수 산출
    const byType: Record<EnneaKey, EnneaTypeScore> = {} as any;
    for (const k of ENNEA_ORDER) {
      const arr = buckets[k];
      const total = arr.reduce((s, v) => s + v, 0);
      const answeredCount = arr.length;
      const average = answeredCount ? total / answeredCount : 0;
      byType[k] = {
        type: k,
        total,
        average,
        answeredCount,
        maxPossible: answeredCount * 5,
      };
    }

    // 3) 랭킹(내림차순) & 주유형 단일 선택
    const ranking = [...ENNEA_ORDER].map((k) => byType[k]).sort(cmpScore);

    const primary = ranking[0]; // ✅ 단일 값

    // 4) 날개 단일 선택: 주유형의 양옆만 비교
    const [leftN, rightN] = neighbors(typeToNum(primary.type));
    const left = byType[numToKey(leftN)];
    const right = byType[numToKey(rightN)];
    const wing = [left, right].sort(cmpScore)[0]; // ✅ 단일 값

    // 5) 완성도
    const completion = {
      answered: answeredAll,
      totalItems: questions.length,
      ratio: questions.length ? answeredAll / questions.length : 0,
    };

    return { byType, ranking, primary, wing, completion };
  }

  // ===== Helpers =====
  private normalizeAnswer(q: Question): number | null {
    const a = q.answer;
    if (typeof a !== "number" || a < 1 || a > 5) return null;
    if (this.reverseSet.has(q.code)) return 6 - a; // 역채점
    return a;
  }

  // "Type1"~"Type9" 을 기준으로, 느슨한 문자열도 수용
  private inferType(q: Question): EnneaKey | null {
    const dRaw = (q.domain || "").trim().toLowerCase();
    for (let i = 1; i <= 9; i++) {
      if (dRaw === `type${i}`) return `Type${i}` as EnneaKey;
    }

    // 보조: code 프리픽스 T1_/T2_...
    const c = (q.code || "").toUpperCase();
    const m = c.match(/^T([1-9])_/);
    if (m) return `Type${Number(m[1])}` as EnneaKey;

    return null; // 알 수 없으면 스킵
  }
}

export const enneagramQuestions: Question[] = [
  // 1번 문항
  {
    domain: "Type1",
    code: "T1_01",
    content: "나는 완벽한 결과를 위해 노력한다",
    answer: undefined,
  },
  // 2번 문항
  {
    domain: "Type2",
    code: "T2_01",
    content: "나는 다른 사람들을 도우는 것을 좋아한다",
    answer: undefined,
  },
  // 3번 문항
  {
    domain: "Type3",
    code: "T3_01",
    content: "나는 성공하고 인정받는 것을 중요하게 생각한다",
    answer: undefined,
  },
  // 4번 문항
  {
    domain: "Type4",
    code: "T4_01",
    content: "나는 내 감정과 내면의 세계에 깊이 관심이 있다",
    answer: undefined,
  },
  // 5번 문항
  {
    domain: "Type5",
    code: "T5_01",
    content: "나는 혼자 있는 시간을 소중히 여긴다",
    answer: undefined,
  },
  // 6번 문항
  {
    domain: "Type6",
    code: "T6_01",
    content: "나는 안전하고 확실한 것을 선호한다",
    answer: undefined,
  },
  // 7번 문항
  {
    domain: "Type7",
    code: "T7_01",
    content: "나는 새로운 경험과 모험을 추구한다",
    answer: undefined,
  },
  // 8번 문항
  {
    domain: "Type8",
    code: "T8_01",
    content: "나는 강하고 독립적인 사람이 되고 싶다",
    answer: undefined,
  },
  // 9번 문항
  {
    domain: "Type9",
    code: "T9_01",
    content: "나는 갈등을 피하고 조화를 추구한다",
    answer: undefined,
  },
  // 10번 문항
  {
    domain: "Type1",
    code: "T1_02",
    content: "나는 실수나 부정확함을 용납하기 어렵다",
    answer: undefined,
  },
  // 11번 문항
  {
    domain: "Type2",
    code: "T2_02",
    content: "나는 다른 사람들의 필요를 내 필요보다 우선시한다",
    answer: undefined,
  },
  // 12번 문항
  {
    domain: "Type3",
    code: "T3_02",
    content: "나는 목표를 달성하기 위해 열심히 노력한다",
    answer: undefined,
  },
  // 13번 문항
  {
    domain: "Type4",
    code: "T4_02",
    content: "나는 독특하고 개성적인 사람이 되고 싶다",
    answer: undefined,
  },
  // 14번 문항
  {
    domain: "Type5",
    code: "T5_02",
    content: "나는 지식과 정보를 수집하는 것을 좋아한다",
    answer: undefined,
  },
  // 15번 문항
  {
    domain: "Type6",
    code: "T6_02",
    content: "나는 신뢰할 수 있는 사람들과의 관계를 중요하게 생각한다",
    answer: undefined,
  },
  // 16번 문항
  {
    domain: "Type7",
    code: "T7_02",
    content: "나는 즐겁고 긍정적인 것을 좋아한다",
    answer: undefined,
  },
  // 17번 문항
  {
    domain: "Type8",
    code: "T8_02",
    content: "나는 불의에 맞서 싸우는 것을 중요하게 생각한다",
    answer: undefined,
  },
  // 18번 문항
  {
    domain: "Type9",
    code: "T9_02",
    content: "나는 다른 사람들의 의견을 듣고 이해하려고 한다",
    answer: undefined,
  },
  // 19번 문항
  {
    domain: "Type1",
    code: "T1_03",
    content: "나는 항상 올바른 일을 해야 한다고 생각한다",
    answer: undefined,
  },
  // 20번 문항
  {
    domain: "Type2",
    code: "T2_03",
    content: "나는 다른 사람들이 나를 필요로 할 때 기분이 좋다",
    answer: undefined,
  },
  // 21번 문항
  {
    domain: "Type3",
    code: "T3_03",
    content: "나는 효율적이고 생산적인 사람이 되려고 한다",
    answer: undefined,
  },
  // 22번 문항
  {
    domain: "Type4",
    code: "T4_03",
    content: "나는 아름다운 것들과 예술에 감동받는다",
    answer: undefined,
  },
  // 23번 문항
  {
    domain: "Type5",
    code: "T5_03",
    content: "나는 복잡한 문제를 분석하고 이해하는 것을 즐긴다",
    answer: undefined,
  },
  // 24번 문항
  {
    domain: "Type6",
    code: "T6_03",
    content: "나는 위험을 미리 예측하고 대비하려고 한다",
    answer: undefined,
  },
  // 25번 문항
  {
    domain: "Type7",
    code: "T7_03",
    content: "나는 다양한 선택지와 가능성을 열어두려고 한다",
    answer: undefined,
  },
  // 26번 문항
  {
    domain: "Type8",
    code: "T8_03",
    content: "나는 내 의견을 솔직하게 표현한다",
    answer: undefined,
  },
  // 27번 문항
  {
    domain: "Type9",
    code: "T9_03",
    content: "나는 평화로운 환경에서 일하는 것을 선호한다",
    answer: undefined,
  },
  // 28번 문항
  {
    domain: "Type1",
    code: "T1_04",
    content: "나는 내 기준에 맞지 않는 것들을 비판하는 경향이 있다",
    answer: undefined,
  },
  // 29번 문항
  {
    domain: "Type2",
    code: "T2_04",
    content: "나는 다른 사람들을 돌보는 것을 통해 자신의 가치를 느낀다",
    answer: undefined,
  },
  // 30번 문항
  {
    domain: "Type3",
    code: "T3_04",
    content: "나는 다른 사람들보다 더 잘하고 싶어한다",
    answer: undefined,
  },
  // 31번 문항
  {
    domain: "Type4",
    code: "T4_04",
    content: "나는 내 감정의 깊이를 이해해주는 사람을 찾는다",
    answer: undefined,
  },
  // 32번 문항
  {
    domain: "Type5",
    code: "T5_04",
    content: "나는 내 에너지를 보존하기 위해 신중하게 행동한다",
    answer: undefined,
  },
  // 33번 문항
  {
    domain: "Type6",
    code: "T6_04",
    content: "나는 내가 속한 그룹이나 조직에 충성한다",
    answer: undefined,
  },
  // 34번 문항
  {
    domain: "Type7",
    code: "T7_04",
    content: "나는 지루함이나 제약을 피하려고 한다",
    answer: undefined,
  },
  // 35번 문항
  {
    domain: "Type8",
    code: "T8_04",
    content: "나는 약한 사람들을 보호하려고 한다",
    answer: undefined,
  },
  // 36번 문항
  {
    domain: "Type9",
    code: "T9_04",
    content: "나는 모든 사람이 만족할 수 있는 해결책을 찾으려고 한다",
    answer: undefined,
  },
];

export const sampleResult: EnneaResult = {
  byType: {
    Type1: {
      answeredCount: 4,
      average: 4.5,
      maxPossible: 20,
      total: 18,
      type: "Type1",
    },
    Type2: {
      answeredCount: 4,
      average: 2.5,
      maxPossible: 20,
      total: 10,
      type: "Type2",
    },
    Type3: {
      answeredCount: 4,
      average: 5,
      maxPossible: 20,
      total: 20,
      type: "Type3",
    },
    Type4: {
      answeredCount: 4,
      average: 1.25,
      maxPossible: 20,
      total: 5,
      type: "Type4",
    },
    Type5: {
      answeredCount: 4,
      average: 3,
      maxPossible: 20,
      total: 12,
      type: "Type5",
    },
    Type6: {
      answeredCount: 4,
      average: 4.5,
      maxPossible: 20,
      total: 18,
      type: "Type6",
    },
    Type7: {
      answeredCount: 4,
      average: 4.75,
      maxPossible: 20,
      total: 19,
      type: "Type7",
    },
    Type8: {
      answeredCount: 4,
      average: 1.5,
      maxPossible: 20,
      total: 6,
      type: "Type8",
    },
    Type9: {
      answeredCount: 4,
      average: 3.5,
      maxPossible: 20,
      total: 14,
      type: "Type9",
    },
  },
  completion: { answered: 36, ratio: 1, totalItems: 36 },
  primary: {
    answeredCount: 4,
    average: 5,
    maxPossible: 20,
    total: 20,
    type: "Type3",
  },

  ranking: [
    { answeredCount: 4, average: 5, maxPossible: 20, total: 20, type: "Type3" },
    {
      answeredCount: 4,
      average: 4.75,
      maxPossible: 20,
      total: 19,
      type: "Type7",
    },
    {
      answeredCount: 4,
      average: 4.5,
      maxPossible: 20,
      total: 18,
      type: "Type1",
    },
    {
      answeredCount: 4,
      average: 4.5,
      maxPossible: 20,
      total: 18,
      type: "Type6",
    },
    {
      answeredCount: 4,
      average: 3.5,
      maxPossible: 20,
      total: 14,
      type: "Type9",
    },
    { answeredCount: 4, average: 3, maxPossible: 20, total: 12, type: "Type5" },
    {
      answeredCount: 4,
      average: 2.5,
      maxPossible: 20,
      total: 10,
      type: "Type2",
    },
    {
      answeredCount: 4,
      average: 1.5,
      maxPossible: 20,
      total: 6,
      type: "Type8",
    },
    {
      answeredCount: 4,
      average: 1.25,
      maxPossible: 20,
      total: 5,
      type: "Type4",
    },
  ],
  wing: {
    answeredCount: 4,
    average: 4.75,
    maxPossible: 20,
    total: 19,
    type: "Type7",
  },
};
