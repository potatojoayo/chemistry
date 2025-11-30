#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
AAS 보고서(.docx) → report_aas INSERT SQL 생성 스크립트 (TEXT 버전)

최종 스키마:

create table public.report_aas (
  id uuid not null default gen_random_uuid (),
  type text not null,
  type_text text not null,
  emotional_stability_level smallint not null,
  overall_evaluation text not null,
  detail_evaluations text not null,
  counseling_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  emotional_stability_text text not null,
  title text not null,
  sequence smallint not null,
  primary key (id)
);
"""

import mammoth
import re
import sys
from pathlib import Path
from dataclasses import dataclass

# --------------------------------------
# 설정
# --------------------------------------

INPUT_DOCX = Path(__file__).parent / "../data/aas_reports.docx"

TYPE_CODE_MAP = {
    "안정형": "secure",
    "불안형": "anxious",
    "회피형": "avoidant",
    "혼란형": "disorganized",
}

EMO_LEVEL_MAP = {
    "매우 불편함": 1,
    "불편함": 2,
    "보통": 3,
    "편안함": 4,
    "매우 편안함": 5,
}


# --------------------------------------
# 유틸리티
# --------------------------------------

def sql_literal(v: str | None) -> str:
    """SQL safe literal"""
    if v is None:
        return "NULL"
    return "'" + v.replace("'", "''") + "'"


def load_docx_text(path: Path) -> str:
    """DOCX 파일에서 raw text 추출"""
    with path.open("rb") as f:
        result = mammoth.extract_raw_text(f)
    text = (result.value or "").replace("\r\n", "\n").replace("\r", "\n")
    return text.strip()


def split_blocks(full_text: str) -> list[str]:
    """1/20. ~ 20/20. 블록 구분"""
    header_re = re.compile(r"(?m)^\s*(\d{1,2})/20\.")
    matches = list(header_re.finditer(full_text))

    blocks = []
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        blocks.append(full_text[start:end].strip())

    if len(blocks) != 20:
        print(f"[경고] 블록 개수 20아님 → {len(blocks)}개", file=sys.stderr)

    return blocks


# --------------------------------------
# 데이터 구조
# --------------------------------------

@dataclass
class ReportSection:
    sequence: int
    title: str
    type: str
    type_text: str
    emotional_stability_level: int
    emotional_stability_text: str
    overall_evaluation: str
    detail_evaluations: str
    counseling_text: str


# --------------------------------------
# 파싱 로직
# --------------------------------------

HEADER_RE = re.compile(
    r"""
    ^\s*
    (?P<seq>\d{1,2})/20\.\s*
    (?P<title>.+?)\s*
    \(유형:\s*
        (?P<type_text>[^&]+?)\s*&\s*마음평온도:\s*
        (?P<emo_text>.+?)
    \)\s*$
    """,
    re.VERBOSE,
)


def parse_header(line: str) -> dict:
    """헤더 한 줄 파싱"""
    m = HEADER_RE.match(line.strip())
    if not m:
        raise ValueError(f"헤더 파싱 실패: {line}")

    seq = int(m.group("seq"))
    title = m.group("title").strip()
    type_text = m.group("type_text").strip()
    emo_text = m.group("emo_text").strip()

    if type_text not in TYPE_CODE_MAP:
        raise ValueError(f"알 수 없는 유형: {type_text}")
    type_code = TYPE_CODE_MAP[type_text]

    if emo_text not in EMO_LEVEL_MAP:
        raise ValueError(f"알 수 없는 정서안정: {emo_text}")
    emo_level = EMO_LEVEL_MAP[emo_text]

    return dict(
        sequence=seq,
        title=title,
        type_code=type_code,
        type_text=type_text,
        emotional_stability_level=emo_level,
        emotional_stability_text=emo_text,
    )


def extract_section(block: str) -> ReportSection:
    lines = [ln.rstrip() for ln in block.splitlines()]
    non_empty = [ln for ln in lines if ln.strip()]

    header_line = non_empty[0]
    header = parse_header(header_line)

    # 레이블 위치 찾기
    label_pos = {}
    for idx, line in enumerate(lines):
        t = line.strip()
        if t in ("종합평가", "세부평가", "상담 조언", "향후 발전방향"):
            label_pos[t] = idx

    # 필요 레이블 검증
    for need in ("종합평가", "세부평가", "상담 조언"):
        if need not in label_pos:
            raise ValueError(f"{header['sequence']}번 블록: '{need}' 누락됨")

    idx_sum = label_pos["종합평가"]
    idx_detail = label_pos["세부평가"]
    idx_counsel = label_pos["상담 조언"]
    idx_growth = label_pos.get("향후 발전방향")

    def get_text(start, end=None):
        if end is None:
            end = len(lines)
        return "\n".join(lines[start:end]).strip()

    # 추출
    overall = get_text(idx_sum + 1, idx_detail)
    detail_text = get_text(idx_detail + 1, idx_counsel)
    counseling = (
        get_text(idx_counsel + 1, idx_growth)
        if idx_growth is not None
        else get_text(idx_counsel + 1)
    )

    # 세부평가는 줄바꿈 기준 그대로 하나의 text로 저장
    return ReportSection(
        sequence=header["sequence"],
        title=header["title"],
        type=header["type_code"],
        type_text=header["type_text"],
        emotional_stability_level=header["emotional_stability_level"],
        emotional_stability_text=header["emotional_stability_text"],
        overall_evaluation=overall,
        detail_evaluations=detail_text,
        counseling_text=counseling,
    )


# --------------------------------------
# SQL 생성
# --------------------------------------

def to_insert_sql(s: ReportSection) -> str:
    return f"""
INSERT INTO report_aas (
    type,
    type_text,
    emotional_stability_level,
    overall_evaluation,
    detail_evaluations,
    counseling_text,
    emotional_stability_text,
    title,
    sequence
) VALUES (
    {sql_literal(s.type)},
    {sql_literal(s.type_text)},
    {s.emotional_stability_level},
    {sql_literal(s.overall_evaluation)},
    {sql_literal(s.detail_evaluations)},
    {sql_literal(s.counseling_text)},
    {sql_literal(s.emotional_stability_text)},
    {sql_literal(s.title)},
    {s.sequence}
);
""".strip()


# --------------------------------------
# MAIN
# --------------------------------------

def main():
    text = load_docx_text(INPUT_DOCX)
    blocks = split_blocks(text)

    sections = [extract_section(block) for block in blocks]
    sections.sort(key=lambda x: x.sequence)

    print("-- Generated SQL for report_aas")
    print("BEGIN;")

    for s in sections:
        print(to_insert_sql(s))
        print()

    print("COMMIT;")


if __name__ == "__main__":
    main()