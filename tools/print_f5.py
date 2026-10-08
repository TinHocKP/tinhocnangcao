# -*- coding: utf-8 -*-
import json

with open("tools/extracted_summary.json", "r", encoding="utf-8") as f:
    summary_data = json.load(f)

f5_ans = []
for i, q in enumerate(summary_data["5"]["questions"]):
    correct = None
    for j, opt in enumerate(q["options"]):
        if "" in opt:
            correct = j
            break
    f5_ans.append(correct)

print("Form 5 (index 0 to 49):", f5_ans)
