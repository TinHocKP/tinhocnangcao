# -*- coding: utf-8 -*-
import json
import os
import re

files = [
    (1, "Phần 1: Word Nâng Cao (Câu 1 - 50)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\24\content.md"),
    (2, "Phần 1: Word Nâng Cao (Câu 51 - 100)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\28\content.md"),
    (3, "Phần 2: Excel Nâng Cao (Câu 1 - 50)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\30\content.md"),
    (4, "Phần 2: Excel Nâng Cao (Câu 51 - 100)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\32\content.md"),
    (5, "Phần 3: PowerPoint Nâng Cao (Câu 1 - 50)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\34\content.md"),
    (6, "Phần 3: PowerPoint Nâng Cao (Câu 51 - 100)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\36\content.md"),
]

def extract_fb_data(html):
    idx = html.find('FB_PUBLIC_LOAD_DATA_')
    if idx == -1:
        return None
    start = html.find('[', idx)
    if start == -1:
        return None
    
    depth = 0
    in_str = False
    escape = False
    for i in range(start, len(html)):
        c = html[i]
        if escape:
            escape = False
            continue
        if c == '\\':
            escape = True
            continue
        if c == '"':
            in_str = not in_str
            continue
        if not in_str:
            if c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(html[start:i+1])
                    except Exception as e:
                        print(f"JSON load error: {e}")
                        return None
    return None

results = {}

for form_id, title, fpath in files:
    if not os.path.exists(fpath):
        print(f"File not found: {fpath}")
        continue
    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    data = extract_fb_data(content)
    if not data:
        print(f"Failed to extract FB_PUBLIC_LOAD_DATA_ for {title}")
        continue
    
    items = data[1][1]
    form_questions = []
    
    for it in items:
        # it[1] is question text
        # it[4] has choices
        if len(it) > 4 and it[4] and len(it[4]) > 0 and it[4][0] and len(it[4][0]) > 1 and it[4][0][1]:
            q_text = (it[1] or "").strip()
            # Check for image in question: it[6] or in question structure
            img_info = None
            if len(it) > 6 and it[6]:
                # image info could be in it[6]
                img_info = it[6]
            
            opts = []
            for opt in it[4][0][1]:
                if opt and len(opt) > 0 and opt[0]:
                    opts.append(opt[0].strip())
            
            # Check if correct answer or point exists in data
            correct_idx = None
            # In some forms, correct answer is at it[4][0][2] or within opt
            for idx_opt, opt in enumerate(it[4][0][1]):
                if len(opt) > 2 and opt[2] == 1:
                    correct_idx = idx_opt
            
            form_questions.append({
                "id": it[0],
                "question": q_text,
                "options": opts,
                "correct": correct_idx,
                "raw_item": it
            })
    
    print(f"{title}: {len(form_questions)} câu hỏi")
    results[form_id] = {
        "title": title,
        "questions": form_questions
    }

# Save summary
summary_data = {}
for fid, fobj in results.items():
    summary_data[fid] = {
        "title": fobj["title"],
        "count": len(fobj["questions"]),
        "questions": [{
            "id": q["id"],
            "question": q["question"],
            "options": q["options"],
            "correct": q["correct"]
        } for q in fobj["questions"]]
    }

os.makedirs("tools", exist_ok=True)
with open("tools/extracted_summary.json", "w", encoding="utf-8") as out:
    json.dump(summary_data, out, ensure_ascii=False, indent=2)

print("Saved tools/extracted_summary.json")
