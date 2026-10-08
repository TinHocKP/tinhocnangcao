# -*- coding: utf-8 -*-
import json

with open("tools/extracted_summary.json", "r", encoding="utf-8") as f:
    summary_data = json.load(f)

with open("tools/exact_question_images.json", "r", encoding="utf-8") as f:
    img_map = json.load(f)

# Let's inspect Form 5 tick answers
print("=== FORM 5 TICKED ANSWERS ===")
f5_ans = {}
for i, q in enumerate(summary_data["5"]["questions"]):
    correct = None
    for j, opt in enumerate(q["options"]):
        if "" in opt:
            correct = j
            break
    f5_ans[i] = correct
print(f"Form 5 ticked: {sum(1 for v in f5_ans.values() if v is not None)}/50")

# Let's inspect Form 6 tick answers
print("=== FORM 6 TICKED ANSWERS ===")
f6_ans = {}
for i, q in enumerate(summary_data["6"]["questions"]):
    correct = None
    for j, opt in enumerate(q["options"]):
        if "" in opt:
            correct = j
            break
    f6_ans[i] = correct
print(f"Form 6 ticked: {sum(1 for v in f6_ans.values() if v is not None)}/50")
print("Form 6 answers:", [f6_ans[i] for i in range(50)])
