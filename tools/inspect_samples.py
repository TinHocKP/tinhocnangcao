# -*- coding: utf-8 -*-
import json

with open("tools/extracted_summary.json", "r", encoding="utf-8") as f:
    summary_data = json.load(f)

with open("tools/exact_question_images.json", "r", encoding="utf-8") as f:
    img_map = json.load(f)

for fid in range(1, 7):
    fdata = summary_data[str(fid)]
    print(f"=== {fdata['title']} (50 câu) ===")
    for i in range(min(5, len(fdata["questions"]))):
        q = fdata["questions"][i]
        has_img = f"{fid}_{i}" in img_map
        img_info = f" [IMAGE: {img_map[f'{fid}_{i}']['image']}]" if has_img else ""
        print(f"  Câu {i+1}: {q['question'][:70]}...{img_info}")
        for j, opt in enumerate(q["options"]):
            print(f"     {chr(65+j)}. {opt[:60]}")
    print()
