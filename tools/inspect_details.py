# -*- coding: utf-8 -*-
import json
import re
import os

with open("tools/extracted_summary.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Check if any correct answer was captured
correct_count = 0
total_q = 0
for fid, fobj in data.items():
    for q in fobj["questions"]:
        total_q += 1
        if q["correct"] is not None:
            correct_count += 1

print(f"Total questions: {total_q}, with correct index already set: {correct_count}")

# Check for images in HTML files
files = [
    (1, r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\24\content.md"),
    (2, r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\28\content.md"),
    (3, r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\30\content.md"),
    (4, r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\32\content.md"),
    (5, r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\34\content.md"),
    (6, r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\36\content.md"),
]

total_imgs = 0
img_details = []

for fid, fpath in files:
    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    
    # Check for forms-images-rt or lh3.googleusercontent or similar
    matches = re.findall(r'https://docs\.google\.com/forms-images-rt/[^\s"\'<>]+', html)
    matches_lh = re.findall(r'https://lh\d+\.googleusercontent\.com/[^\s"\'<>]+', html)
    print(f"Form {fid}: {len(matches)} forms-images-rt images, {len(matches_lh)} googleusercontent images")
    if matches:
        img_details.append((fid, matches))

