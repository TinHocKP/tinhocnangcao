# -*- coding: utf-8 -*-
import json

with open("tools/extracted_summary.json", "r", encoding="utf-8") as f:
    summary_data = json.load(f)

for fid in range(1, 7):
    fdata = summary_data[str(fid)]
    with open(f"tools/form_{fid}.txt", "w", encoding="utf-8") as out:
        out.write(f"=== {fdata['title']} ===\n\n")
        for i, q in enumerate(fdata["questions"]):
            out.write(f"Câu {i+1}: {q['question']}\n")
            for j, opt in enumerate(q["options"]):
                out.write(f"  {chr(65+j)}. {opt}\n")
            out.write("\n")

print("Exported tools/form_1.txt to tools/form_6.txt")
