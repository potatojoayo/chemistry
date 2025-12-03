import csv
import os

INPUT_FILE = "./data/chemistry.csv"
OUTPUT_FILE = "./scripts/insert_chemistry.sql"

os.makedirs("./scripts", exist_ok=True)

def clean_title(raw_title: str) -> str:
    """
    title 형식: "🔥 내용 😎"
    → 마지막 공백 + emoji 제거: "🔥 내용"
    """
    raw_title = raw_title.strip()
    parts = raw_title.rsplit(" ", 1)
    if len(parts) == 2:
        return parts[0]
    return raw_title


def csv_to_sql():
    with open("./data/chemistry.csv", "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        rows = list(reader)

    # 헤더 제거
    rows = rows[1:]

    sql_lines = []
    sql_lines.append("BEGIN;")

    for row in rows:
        if not row or len(row) < 8:
            print("⚠️ 스킵됨: 컬럼 부족" )
            print(len(row))
            continue

        # 순서: aas, big_5, flex, overall, detail, counsel, emotional_text, title, seq
        sequence = row[0].strip()
        aas_level = row[1].strip()
        big5_level = row[2].strip()
        flexibility = row[3].strip()

        title_raw = row[4].strip()
        overall = row[5].replace("'", "''")
        detail = row[6].replace("'", "''")
        counseling = row[7].replace("'", "''")

        title_clean = clean_title(title_raw).replace("'", "''")


        sql = f"""
INSERT INTO report_chemistry (
    aas_level,
    big_5_level,
    flexibility_level,
    overall_evaluation,
    detail_evaluations,
    counseling_text,
    title,
    sequence
) VALUES (
    {aas_level},
    {big5_level},
    {flexibility},
    '{overall}',
    '{detail}',
    '{counseling}',
    '{title_clean}',
    {sequence}
);
""".strip()

        sql_lines.append(sql)

    sql_lines.append("COMMIT;")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n\n".join(sql_lines))

    print(f"✅ SQL 생성 완료 → {OUTPUT_FILE}")


if __name__ == "__main__":
    csv_to_sql()