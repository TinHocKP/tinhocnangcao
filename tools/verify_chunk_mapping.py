# -*- coding: utf-8 -*-
import json
import re
import os
import urllib.request

files = [
    (1, "Phần 1: Word NC (1-50)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\24\content.md"),
    (2, "Phần 1: Word NC (51-100)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\28\content.md"),
    (3, "Phần 2: Excel NC (1-50)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\30\content.md"),
    (4, "Phần 2: Excel NC (51-100)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\32\content.md"),
    (5, "Phần 3: PowerPoint NC (1-50)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\34\content.md"),
    (6, "Phần 3: PowerPoint NC (51-100)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\36\content.md"),
]

with open("tools/extracted_summary.json", "r", encoding="utf-8") as f:
    summary_data = json.load(f)

# Structure: exact_question_images = { (fid, q_index_0_based): local_path }
exact_question_images = {}

for fid, ftitle, fpath in files:
    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    
    chunks = html.split('role="listitem"')
    # chunks[1] to chunks[len(chunks)-1]
    # Check each question
    print(f"\n--- Checking Form {fid} ---")
    for q_idx in range(len(summary_data[str(fid)]["questions"])):
        chunk_idx = q_idx + 1
        if chunk_idx < len(chunks):
            chunk = chunks[chunk_idx]
            q_text = summary_data[str(fid)]["questions"][q_idx]["question"]
            
            # Find if this chunk has an image
            img_match = re.search(r'https://docs\.google\.com/forms-images-rt/[^\s"\'<>]+', chunk)
            if img_match:
                img_url = img_match.group(0)
                fname = f"m{fid}_q{q_idx+1}.jpg"
                fpath_img = os.path.join("assets", "images", fname)
                rel_path = f"assets/images/{fname}"
                
                # Check if need download
                if not os.path.exists(fpath_img) or os.path.getsize(fpath_img) == 0:
                    for retry in range(3):
                        try:
                            req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                            with urllib.request.urlopen(req, timeout=15) as resp:
                                b = resp.read()
                            with open(fpath_img, "wb") as fo:
                                fo.write(b)
                            print(f"  [Q{q_idx+1}] Downloaded {len(b)} bytes -> {fname}")
                            break
                        except Exception as e:
                            print(f"  [Q{q_idx+1}] Retry {retry+1} error: {e}")
                else:
                    print(f"  [Q{q_idx+1}] Already exists ({os.path.getsize(fpath_img)} bytes) -> {fname}")
                
                exact_question_images[f"{fid}_{q_idx}"] = {
                    "form_id": fid,
                    "q_idx": q_idx,
                    "q_number": q_idx + 1,
                    "q_text": q_text[:50],
                    "image": rel_path
                }

with open("tools/exact_question_images.json", "w", encoding="utf-8") as out:
    json.dump(exact_question_images, out, ensure_ascii=False, indent=2)

print(f"\nTotal mapped question images: {len(exact_question_images)}")
