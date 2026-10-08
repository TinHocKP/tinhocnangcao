# -*- coding: utf-8 -*-
import json

with open("tools/extracted_summary.json", "r", encoding="utf-8") as f:
    summary_data = json.load(f)

f5 = summary_data["5"]["questions"]
for i, q in enumerate(f5):
    has_check = any("" in opt for opt in q["options"])
    if not has_check:
        print(f"Form 5 Câu {i+1} KHÔNG CÓ TICK:")
        print(f"  {q['question']}")
        for j, opt in enumerate(q["options"]):
            print(f"    {chr(65+j)}. {opt}")
        print()
