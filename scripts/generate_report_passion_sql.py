import csv

input_csv = "./data/passion.csv"
output_sql = "./scripts/insert_passion.sql"

with open(input_csv, "r", encoding="utf-8-sig", newline="") as f:
    reader = csv.reader(f)
    rows = list(reader)

# 헤더 제거
rows = rows[1:]

sql_lines = []

for i, row in enumerate(rows):
    # row: [유형번호, 유형1단계, 유형2단계, 유형1명칭, 유형2명칭,
    #       제목, 종합의견, 세부분석, 상담조언]

    if len(row) < 9:
        print("⚠️ 열이 부족한 row:", row)
        continue

    type_number = row[0].strip()
    male_level = row[1].strip()
    female_level = row[2].strip()
    male_type = row[3].strip()
    female_type = row[4].strip()
    title = row[5].strip()
    overall = row[6].strip()
    detail = row[7].strip()
    counsel = row[8].strip()

    # SQL용 escape
    def esc(s):
        return s.replace("'", "''")

    sql = f"""
INSERT INTO report_passion 
(type_number, male_passion_level, female_passion_level, 
 male_passion_type, female_passion_type, title, 
 overall_evaluation, detail_evaluations, counseling_text, sequence)
VALUES
({type_number}, {male_level}, {female_level},
 '{esc(male_type)}', '{esc(female_type)}', '{esc(title)}',
 '{esc(overall)}', '{esc(detail)}', '{esc(counsel)}',
 {i+1}
);
""".strip()

    sql_lines.append(sql)

with open(output_sql, "w", encoding="utf-8") as f:
    f.write("\n\n".join(sql_lines))

print("✅ SQL 생성 완료:", output_sql)