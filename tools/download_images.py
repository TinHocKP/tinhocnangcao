# -*- coding: utf-8 -*-
import json
import re
import os
import urllib.request

os.makedirs("assets/images", exist_ok=True)

files = [
    (1, "Phần 1: Word NC (1-50)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\24\content.md"),
    (2, "Phần 1: Word NC (51-100)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\28\content.md"),
    (3, "Phần 2: Excel NC (1-50)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\30\content.md"),
    (4, "Phần 2: Excel NC (51-100)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\32\content.md"),
    (5, "Phần 3: PowerPoint NC (1-50)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\34\content.md"),
    (6, "Phần 3: PowerPoint NC (51-100)", r"C:\Users\Home\.gemini\antigravity\brain\4f0cd52c-aa53-4e00-9eeb-253c4cb27e8b\.system_generated\steps\36\content.md"),
]

# Load summary questions to match
with open("tools/extracted_summary.json", "r", encoding="utf-8") as f:
    summary_data = json.load(f)

image_mapping = {}

for fid, ftitle, fpath in files:
    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
        html = f.read()
    
    chunks = html.split('role="listitem"')
    if len(chunks) <= 1:
        chunks = html.split('jscontroller="sWGJ4b"')
    
    print(f"\nForm {fid}: {ftitle} - Chunks: {len(chunks)}")
    img_idx = 0
    for chunk in chunks:
        img_match = re.search(r'https://docs\.google\.com/forms-images-rt/[^\s"\'<>]+', chunk)
        if img_match:
            img_url = img_match.group(0)
            
            # Find question title
            q_title = None
            q_match = re.search(r'role="heading"[^>]*>([^<]+)<', chunk)
            if q_match:
                q_title = q_match.group(1).strip()
            else:
                q_match = re.search(r'class="M4DNQ"[^>]*>([^<]+)<', chunk)
                if q_match:
                    q_title = q_match.group(1).strip()
            
            img_idx += 1
            filename = f"form{fid}_img{img_idx}.jpg"
            filepath = os.path.join("assets", "images", filename)
            rel_path = f"assets/images/{filename}"
            
            print(f"  Img {img_idx}: url={img_url[:60]}... -> Q: {q_title}")
            
            # Download image
            try:
                req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as resp:
                    img_data = resp.read()
                with open(filepath, "wb") as f_out:
                    f_out.write(img_data)
                print(f"    Downloaded {len(img_data)} bytes -> {rel_path}")
                
                # Match to question in summary_data[str(fid)]
                matched_qid = None
                matched_qidx = None
                if q_title:
                    for idx_q, q in enumerate(summary_data[str(fid)]["questions"]):
                        if q_title in q["question"] or q["question"] in q_title or q["question"][:30] in q_title:
                            matched_qid = q["id"]
                            matched_qidx = idx_q
                            break
                
                image_mapping[f"{fid}_{img_idx}"] = {
                    "form_id": fid,
                    "img_index": img_idx,
                    "img_url": img_url,
                    "local_path": rel_path,
                    "q_title": q_title,
                    "matched_qidx": matched_qidx,
                    "matched_qid": matched_qid
                }
            except Exception as e:
                print(f"    Download error: {e}")

with open("tools/image_mapping.json", "w", encoding="utf-8") as out:
    json.dump(image_mapping, out, ensure_ascii=False, indent=2)

print("\nSaved tools/image_mapping.json")
