import { AttachmentResult, Question } from "../types";
// // 문헌 참고치 (예: ECR-R18, 국제 평균)
// const ANXIETY_MEAN = 3.5;
// const ANXIETY_SD = 1.1;

// const AVOIDANCE_MEAN = 3.1;
// const AVOIDANCE_SD = 0.9;

// // Z-score 통합 계산용 가중치
// const W_ANXIETY = -0.57; // 부호 주의! (안정 애착은 불안이 낮을수록 +)
// const W_AVOIDANCE = -0.15;

// 5점 척도용 국제평균 & 표준편차
const ANXIETY_MEAN = 2.67;
const ANXIETY_SD = 0.73;
const AVOIDANCE_MEAN = 2.4;
const AVOIDANCE_SD = 0.6;

// 통합 Z 점수 계산 가중치
const WEIGHT_ANXIETY = 0.57;
const WEIGHT_AVOIDANCE = 0.15;

// 문서에서 제공된 최소/최대 Z 범위 (5점으로 변환 시에도 표준화 값은 유지)
const Z_MIN = -2.35; // 문서에 나온 최소값 범위 참고
const Z_MAX = 3.75;

export class AttachmentScorer {
  score(questions: Question[]): AttachmentResult {
    const anxietyAnswers = questions
      .filter(
        (q) =>
          q.domain.toLowerCase() === "anxiety" && typeof q.answer === "number"
      )
      .map((q) => q.answer as number);
    const avoidanceAnswers = questions
      .filter(
        (q) =>
          q.domain.toLowerCase() === "avoidance" && typeof q.answer === "number"
      )
      .map((q) => q.answer as number);

    const anxietyAvg = anxietyAnswers.length
      ? anxietyAnswers.reduce((a, b) => a + b, 0) / anxietyAnswers.length
      : 0;
    const avoidanceAvg = avoidanceAnswers.length
      ? avoidanceAnswers.reduce((a, b) => a + b, 0) / avoidanceAnswers.length
      : 0;

    // Z-score 계산
    const zAnxiety = (anxietyAvg - ANXIETY_MEAN) / ANXIETY_SD;
    const zAvoidance = (avoidanceAvg - AVOIDANCE_MEAN) / AVOIDANCE_SD;

    // 통합 Z-score
    const zIntegrated = -(
      WEIGHT_ANXIETY * zAnxiety +
      WEIGHT_AVOIDANCE * zAvoidance
    );

    // 백분위 (0~100)
    const percentile = ((zIntegrated - Z_MIN) / (Z_MAX - Z_MIN)) * 100;

    return {
      anxiety: { average: anxietyAvg, z: zAnxiety },
      avoidance: { average: avoidanceAvg, z: zAvoidance },
      integrated: { z: zIntegrated, percentile },
      completion: {
        answered: anxietyAnswers.length + avoidanceAnswers.length,
        totalItems: questions.length,
        ratio: questions.length
          ? (anxietyAnswers.length + avoidanceAnswers.length) / questions.length
          : 0,
      },
    };
  }
}

export const attachmentQuestions: Question[] = [
  {
    domain: "Anxiety",
    code: "Q1",
    content: "나는 상대방이 나를 정말로 사랑하지 않을까 걱정한다.",
  },
  {
    domain: "Anxiety",
    code: "Q2",
    content: "나는 상대방이 나를 떠날까 봐 자주 불안해한다.",
  },
  {
    domain: "Anxiety",
    code: "Q3",
    content: "나는 상대방이 나에게 충분히 가까이 오지 않는다고 느낀다.",
  },
  {
    domain: "Anxiety",
    code: "Q4",
    content: "나는 상대방이 나보다 나를 덜 사랑할까 봐 걱정된다.",
  },
  {
    domain: "Anxiety",
    code: "Q5",
    content: "나는 상대방이 나를 덜 중요하게 여길까 걱정된다.",
  },
  {
    domain: "Anxiety",
    code: "Q6",
    content: "나는 상대방이 나에 대해 충분히 애정을 표현하지 않는다고 느낀다.",
  },
  {
    domain: "Anxiety",
    code: "Q7",
    content: "나는 상대방이 내 곁을 떠날까 봐 자주 걱정한다.",
  },
  {
    domain: "Anxiety",
    code: "Q8",
    content: "나는 상대방이 나보다 다른 사람에게 더 관심이 있을까 봐 걱정한다.",
  },
  {
    domain: "Anxiety",
    code: "Q9",
    content: "나는 상대방이 나를 거절할까 봐 두렵다.",
  },

  {
    domain: "Avoidance",
    code: "Q10",
    content: "나는 상대방에게 내 속마음을 털어놓는 것이 불편하다.",
  },
  {
    domain: "Avoidance",
    code: "Q11",
    content: "나는 누군가에게 의지하는 것이 어렵다.",
  },
  {
    domain: "Avoidance",
    code: "Q12",
    content: "나는 상대방에게 내 감정을 보이는 것이 두렵다.",
  },
  {
    domain: "Avoidance",
    code: "Q13",
    content: "나는 상대방과 감정적으로 가까워지는 것을 꺼린다.",
  },
  {
    domain: "Avoidance",
    code: "Q14",
    content: "나는 감정적인 친밀함보다 독립적인 것이 더 편하다.",
  },
  {
    domain: "Avoidance",
    code: "Q15",
    content: "나는 개인적인 어려움을 혼자 해결하려는 경향이 있다.",
  },
  {
    domain: "Avoidance",
    code: "Q16",
    content: "나는 누군가와 너무 가까워지는 것이 부담스럽다.",
  },
  {
    domain: "Avoidance",
    code: "Q17",
    content: "나는 감정적으로 고립되는 것이 더 안전하다고 느낀다.",
  },
  {
    domain: "Avoidance",
    code: "Q18",
    content: "나는 상대방이 내 감정에 너무 깊이 관여하는 것이 불편하다.",
  },
];
