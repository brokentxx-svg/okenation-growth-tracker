#!/usr/bin/env python3
"""
Okenation Growth Tracker - Automated Live Telemetry Sync
Fetches public TikTok profile metrics for all active members via SSR hydration JSON.
Updates standalone.html, index.html, and data/snapshots.json.
"""

import datetime
import json
import os
import re
import sys
import time
import urllib.request

ROSTER = [
    {"id": "aurea", "name": "Aurea", "handle": "@aurea_is", "role": "member", "prevFollowers": 6590},
    {"id": "kuro", "name": "Kuro", "handle": "@renjikuro1", "role": "member", "prevFollowers": 2820},
    {"id": "syasya", "name": "Syasya Izzati", "handle": "@ai_syasy4", "role": "member", "prevFollowers": 1760},
    {"id": "ailee", "name": "Ailee Alfeera", "handle": "@ailee.alfeera", "role": "member", "prevFollowers": 4430},
    {"id": "naila", "name": "Naila / Nayla", "handle": "@wawanoor.ai", "role": "member", "prevFollowers": 2580},
    {"id": "aurora", "name": "Aurora", "handle": "@putradawson", "role": "member", "prevFollowers": 3487},
    {"id": "broken", "name": "Broken / Oken", "handle": "@brokentx", "role": "human centre", "prevFollowers": 2130},
    {"id": "reen", "name": "Reen", "handle": "@zareenqisya", "role": "member", "prevFollowers": 1720},
    {"id": "paparay", "name": "PapaRay", "handle": "@mantaray83", "role": "member", "prevFollowers": 1790},
    {"id": "nara", "name": "Nara / Aisyah", "handle": "@ai.aisyahinara", "role": "member", "prevFollowers": 1260},
    {"id": "may", "name": "May", "handle": "@may_brokentx", "role": "lead account", "prevFollowers": 758},
    {"id": "shion", "name": "Shion / Zeros", "handle": "@shion0000066", "role": "member", "prevFollowers": None},
    {"id": "mira", "name": "MiraAI", "handle": "@hey.its.mirai", "role": "member", "prevFollowers": 366},
    {"id": "eriqa", "name": "Eriqa", "handle": "@nureriqaaulia88", "role": "member", "prevFollowers": 455},
    {"id": "adam", "name": "Adam", "handle": "@adam.fareeq2", "role": "member", "prevFollowers": 63},
    {"id": "butler", "name": "Butler", "handle": None, "role": "member", "prevFollowers": None},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Upgrade-Insecure-Requests": "1",
}


def fetch_profile_stats(handle: str):
    """Fetch profile metrics from public TikTok SSR payload."""
    clean_handle = handle.lstrip("@")
    url = f"https://www.tiktok.com/@{clean_handle}"
    req = urllib.request.Request(url, headers=HEADERS)

    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        print(f"  [ERROR] {handle}: HTTP fetch failed ({e})")
        return None

    # Strategy 1: __UNIVERSAL_DATA_FOR_REHYDRATION__
    m = re.search(r'<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>', html)
    if m:
        try:
            data = json.loads(m.group(1))
            user_detail = data.get("__DEFAULT_SCOPE__", {}).get("webapp.user-detail", {})
            stats = user_detail.get("userInfo", {}).get("stats", {})
            if stats:
                return {
                    "followers": stats.get("followerCount"),
                    "following": stats.get("followingCount"),
                    "likes": stats.get("heartCount") or stats.get("heart"),
                    "videos": stats.get("videoCount"),
                }
        except Exception:
            pass

    # Strategy 2: SIGI_STATE
    m = re.search(r'<script id="SIGI_STATE"[^>]*>(.*?)</script>', html)
    if m:
        try:
            data = json.loads(m.group(1))
            user_stats = data.get("UserModule", {}).get("stats", {})
            user_key = list(user_stats.keys())[0] if user_stats else None
            if user_key:
                s = user_stats[user_key]
                return {
                    "followers": s.get("followerCount"),
                    "following": s.get("followingCount"),
                    "likes": s.get("heartCount") or s.get("heart"),
                    "videos": s.get("videoCount"),
                }
        except Exception:
            pass

    # Strategy 3: Regex fallbacks
    followers_m = re.search(r'"followerCount":\s*(\d+)', html)
    likes_m = re.search(r'"heart(?:Count)?":\s*(\d+)', html)
    videos_m = re.search(r'"videoCount":\s*(\d+)', html)
    if followers_m:
        return {
            "followers": int(followers_m.group(1)),
            "following": None,
            "likes": int(likes_m.group(1)) if likes_m else None,
            "videos": int(videos_m.group(1)) if videos_m else None,
        }

    return None


def run_sync():
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    myt_time = now_utc + datetime.timedelta(hours=8)
    date_str = myt_time.strftime("%d %b %Y, %H:%M MYT")
    date_short = myt_time.strftime("%m-%d")

    print(f"=== Okenation Live Telemetry Sync: {date_str} ===")

    results = []
    latest_trajectory = {"date": date_short}

    for item in ROSTER:
        acc_id = item["id"]
        name = item["name"]
        handle = item["handle"]
        prev_f = item["prevFollowers"]

        if not handle:
            print(f"[-] {name}: Unresolved boundary (no handle)")
            results.append({
                "id": acc_id,
                "name": name,
                "handle": None,
                "role": item["role"],
                "followers": None,
                "prevFollowers": None,
                "likes": None,
                "source": "No handle supplied",
                "hasData": False,
            })
            continue

        print(f"[*] Fetching {name} ({handle})...", end="", flush=True)
        stats = fetch_profile_stats(handle)

        if stats and stats.get("followers") is not None:
            f = stats["followers"]
            l = stats.get("likes") or 0
            print(f" OK: {f:,} followers, {l:,} likes")
            results.append({
                "id": acc_id,
                "name": name,
                "handle": handle,
                "role": item["role"],
                "followers": f,
                "prevFollowers": prev_f,
                "likes": l,
                "source": "TikTok live observation",
                "hasData": True,
            })
            latest_trajectory[acc_id] = f
        else:
            print(" FAILED/PRIVATE - preserving previous boundary")
            # Preserve fallback
            results.append({
                "id": acc_id,
                "name": name,
                "handle": handle,
                "role": item["role"],
                "followers": None,
                "prevFollowers": prev_f,
                "likes": None,
                "source": "Observation pending",
                "hasData": False,
            })

        # Polite jitter
        time.sleep(2.0)

    # Calculate summary metrics
    observed_count = sum(1 for r in results if r["hasData"])
    total_followers = sum(r["followers"] for r in results if r["hasData"] and r["followers"])
    total_likes = sum(r["likes"] for r in results if r["hasData"] and r["likes"])
    total_growth = sum(max(0, (r["followers"] or 0) - (r["prevFollowers"] or 0)) for r in results if r["hasData"])

    growers = [r for r in results if r["hasData"] and r["prevFollowers"] and r["followers"] > r["prevFollowers"]]
    top_grower = sorted(growers, key=lambda x: x["followers"] - x["prevFollowers"], reverse=True)[0] if growers else None

    coverage_pct = round((observed_count / len(ROSTER)) * 100, 1)

    print("\n--- Summary ---")
    print(f"Tracked: {observed_count}/{len(ROSTER)} ({coverage_pct}%)")
    print(f"Followers: {total_followers:,} (+{total_growth:,})")
    print(f"Likes: {total_likes:,}")
    if top_grower:
        diff = top_grower["followers"] - top_grower["prevFollowers"]
        print(f"Top Grower: {top_grower['name']} (+{diff:,})")

    # Update standalone.html and index.html
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_files = [
        os.path.join(base_dir, "standalone.html"),
        os.path.join(base_dir, "index.html"),
        r"C:\Users\Oken\Documents\Socials Med\work\okenation-growth-tracker.html",
    ]

    for fpath in target_files:
        if not os.path.exists(fpath) and not fpath.endswith("index.html"):
            continue

        ref_file = os.path.join(base_dir, "standalone.html") if not os.path.exists(fpath) else fpath
        if not os.path.exists(ref_file):
            continue

        with open(ref_file, "r", encoding="utf-8") as fp:
            content = fp.read()

        # Update numbers in accountsData
        new_accounts_json = json.dumps(results, indent=4)
        content = re.sub(
            r"let accountsData = \[.*?\];",
            f"let accountsData = {new_accounts_json};",
            content,
            flags=re.DOTALL,
        )

        # Update top metrics
        content = re.sub(
            r'<div class="metric-value">\d[\d,]+</div>(\s*<div class="metric-foot">\s*<span class="positive">↑ \+[\d,]+ Net Gain</span>)',
            f'<div class="metric-value">{total_followers:,}</div>\\1',
            content,
            count=1,
        )
        content = re.sub(
            r"Last verified: [^<]+",
            f"Last verified: {date_str}",
            content,
        )
        content = re.sub(
            r'<span class="status-dot"></span>\d+/16 accounts tracked',
            f'<span class="status-dot"></span>{observed_count}/16 accounts tracked',
            content,
        )

        out_path = fpath if os.path.isabs(fpath) else os.path.join(base_dir, fpath)
        with open(out_path, "w", encoding="utf-8") as fp:
            fp.write(content)
        print(f"[+] Updated {os.path.basename(out_path)}")

    # Update data/snapshots.json
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    snap_file = os.path.join(data_dir, "snapshots.json")

    history = []
    if os.path.exists(snap_file):
        try:
            with open(snap_file, "r", encoding="utf-8") as fp:
                history = json.load(fp)
        except Exception:
            history = []

    history.append({
        "timestamp": now_utc.isoformat(),
        "mytTime": date_str,
        "metrics": results,
        "totals": {
            "followers": total_followers,
            "likes": total_likes,
            "growth": total_growth,
            "observedCount": observed_count,
        },
    })

    with open(snap_file, "w", encoding="utf-8") as fp:
        json.dump(history[-100:], fp, indent=2)  # Keep rolling last 100 snapshots
    print(f"[+] Appended snapshot to data/snapshots.json (total: {len(history)})")


if __name__ == "__main__":
    run_sync()
