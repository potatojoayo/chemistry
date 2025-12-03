import csv
import uuid
import os

INPUT_PATH = "./data/tikitaka.csv"
OUTPUT_PATH = "./scripts/insert_tikitaka.sql"

def escape_sql(value: str) -> str:
    """SQL용 문자열 이스케이프"""
    if value is None:
        return ""
    return value.replace("'", "''")

def main():
    if not os.path.exists(INPUT_PATH):
        print(f"❌ CSV 파일 없음: {INPUT_PATH}")
        return

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    with open(INPUT_PATH, "r", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        rows = list(reader)

    # 첫 줄이 헤더라면 제거
    header = rows[0]
    if not rows:
        print("❌ CSV가 비어 있음")
        return

    # 헤더 자동 감지
    if rows and not rows[0][0].isdigit():
        rows = rows[1:]

    sql_lines = []

    for idx, row in enumerate(rows, start=1):
        if len(row) < 6:
            print(f"⚠️ 컬럼 부족 → 스킵: {row}")
            continue

        type_number = int(row[0].strip())
        
        # Parse range "96 ~ 100"
        range_str = row[1].strip()
        if "~" in range_str:
            min_str, max_str = range_str.split("~")
            min_index = int(min_str.strip())
            max_index = int(max_str.strip())
        else:
            # Fallback or error handling
            print(f"⚠️ 잘못된 범위 형식: {range_str}")
            continue

        title = escape_sql(row[2])
        overall = escape_sql(row[3])
        detail = escape_sql(row[4])
        counseling = escape_sql(row[5])


        sql = f"""
INSERT INTO report_tikitaka (
    min_index, max_index, title, overall_evaluation,
    detail_evaluations, counseling_text, sequence
) VALUES (
     {min_index}, {max_index}, '{title}',
    '{overall}', '{detail}', '{counseling}', {type_number}
);
"""
        sql_lines.append(sql)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as out:
        out.write("\n".join(sql_lines))

    print(f"✅ SQL 생성 완료 → {OUTPUT_PATH}")


if __name__ == "__main__":
    main()