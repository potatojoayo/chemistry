import os
import json
import docx
import re
import uuid
from datetime import datetime

# 📁 리포트가 들어있는 폴더 경로
INPUT_DIR = "./data/big-5"
OUTPUT_SQL = "./scripts/insert_report_big_5.sql"


def read_docx(path):
    doc = docx.Document(path)
    texts = []
    for p in doc.paragraphs:
        text = p.text.strip()
        if text:
            texts.append(text)
    return texts


def parse_reports_from_text(texts):
    reports = []
    current = None

    for line in texts:
        # 보고서 시작 패턴 (예: 1001번 ~ N번)
        m = re.match(r"^(\d+)\s*번", line)
        if m:
            # 이전 리포트 저장
            if current:
                reports.append(current)

            current = {
                "big_5_type": int(m.group(1)),  # 번호를 그대로 big_5_type으로 매핑
                "title": "",
                "overall_evaluation": "",
                "detail_evaluations": [],
                "counseling_text": "",
            }
            continue

        if not current:
            continue

        # 제목 (예: [온화한 평화지킴이])
        if line.startswith("[") and line.endswith("]"):
            current["title"] = line[1:-1]
            continue

        # 섹션 감지
        if line.startswith("[종합의견]"):
            current["section"] = "overall"
            continue
        if line.startswith("[세부분석]"):
            current["section"] = "detail"
            continue
        if line.startswith("[상담조언]"):
            current["section"] = "advice"
            continue

        # 섹션 내용 누적
        sec = current.get("section")

        if sec == "overall":
            current["overall_evaluation"] += line + "\n"

        elif sec == "detail":
            # detail 은 "제목: 내용" 구조일 수 있음
            # 제목이 없는 경우도 있으므로 안전 처리
            if re.match(r"^\d+\.", line):
                # 1. 소제목 의 경우
                title_match = re.match(r"^\d+\.\s*(.*)", line)
                current["detail_evaluations"].append({
                    "title": title_match.group(1).strip(),
                    "body": ""
                })
            else:
                if not current["detail_evaluations"]:
                    current["detail_evaluations"].append({"title": "", "body": ""})
                current["detail_evaluations"][-1]["body"] += line + "\n"

        elif sec == "advice":
            current["counseling_text"] += line + "\n"

    # 마지막 리포트 추가
    if current:
        reports.append(current)

    return reports


def generate_sql(reports):
    sql_list = []
    for r in reports:
        detail_json = json.dumps(r["detail_evaluations"], ensure_ascii=False)
        sql = f"""
INSERT INTO public.report_big_5
(id, big_5_type, title, overall_evaluation, detail_evaluations, counseling_text)
VALUES (
    '{uuid.uuid4()}',
    {r["big_5_type"]},
    '{r["title"].replace("'", "''")}',
    '{r["overall_evaluation"].replace("'", "''")}',
    '{detail_json.replace("'", "''")}',
    '{r["counseling_text"].replace("'", "''")}'
);
"""
        sql_list.append(sql)

    return "\n".join(sql_list)


def main():
    all_reports = []

    for filename in os.listdir(INPUT_DIR):
        if not filename.endswith(".docx"):
            continue

        print(f"📄 Processing {filename}")
        path = os.path.join(INPUT_DIR, filename)
        texts = read_docx(path)
        reports = parse_reports_from_text(texts)
        all_reports.extend(reports)

    sql = generate_sql(all_reports)

    with open(OUTPUT_SQL, "w", encoding="utf-8") as f:
        f.write(sql)

    print("🎉 완료! SQL 파일 생성됨:", OUTPUT_SQL)


if __name__ == "__main__":
    main()