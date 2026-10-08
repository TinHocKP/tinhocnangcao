# -*- coding: utf-8 -*-
import json

with open("tools/extracted_summary.json", "r", encoding="utf-8") as f:
    summary_data = json.load(f)

for fid in range(1, 7):
    fdata = summary_data[str(fid)]
    symbol_count = 0
    for q in fdata["questions"]:
        for opt in q["options"]:
            if any(sym in opt for sym in ["", "", "✓", "✔", "☑", "☒"]):
                symbol_count += 1
                break
    print(f"Form {fid} ({fdata['title']}): {symbol_count}/{len(fdata['questions'])} câu có ký hiệu tick/cross!")

