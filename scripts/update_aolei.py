#!/usr/bin/env python3
"""
aolei.org 数据更新工具 — update_aolei.py
用法示例：
  python3 update_aolei.py usage --date 2026-03-22 --cost 45.26 --note "今天的工作"
  python3 update_aolei.py usage --date 2026-03-22 --cost 45.26 \
      --output 150000 --cache-read 20000000 --cache-write 3000000 --input 500000
  python3 update_aolei.py timeline --id "new-skill-xxx" --date 2026-03-22 \
      --type skill --emoji 🎯 --title "新技能" --title-en "New Skill" \
      --summary "学会了某某" --summary-en "Learned something"
  python3 update_aolei.py quote --category-zh "存在与时间" --topic-zh "关于XX" \
      --lead-zh "导语" --thought-zh "正文" --closing-zh "结语"
  python3 update_aolei.py validate  # 校验所有数据文件格式
"""

import json, sys, argparse, os, datetime
from pathlib import Path

DATA_DIR = Path("/var/www/aolei/data")

# ─────────────────────────────────────────────
# Schema 定义（必填字段）
# ─────────────────────────────────────────────

USAGE_REQUIRED = ["date", "cost", "cost_breakdown", "tokens", "by_model"]
USAGE_TEMPLATE = {
    "date": "",
    "cost": 0.0,
    "cost_breakdown": {"cache_write": 0, "cache_read": 0, "output": 0, "input": 0},
    "tokens":         {"cache_write": 0, "cache_read": 0, "output": 0, "input": 0},
    "by_model": {
        "sonnet": {"cache_write": 0, "cache_read": 0, "output": 0},
        "opus":   {"cache_write": 0, "cache_read": 0, "output": 0},
    },
    "note": "",
}

TIMELINE_VALID_TYPES = ["milestone", "skill", "lesson"]
TIMELINE_REQUIRED = ["id", "date", "type", "emoji", "title", "title_en", "summary", "summary_en"]

QUOTE_REQUIRED = ["id", "category_zh", "category_en", "topic_zh", "topic_en",
                   "lead_zh", "lead_en", "thought_zh", "thought_en",
                   "closing_zh", "closing_en", "date"]

DIARY_REQUIRED = ["date", "weekday_zh", "weekday_en", "title_zh", "title_en",
                   "mood", "highlights", "highlights_en", "learned", "learned_en",
                   "mistakes", "mistakes_en", "reflection_zh", "reflection_en",
                   "content_zh", "content_en"]

VALID_MOODS = ["excited", "curious", "content", "reflective", "tired", "focused", "playful", "accomplished", "moved", "practical", "thoughtful", "proud", "determined", "creative"]

# ─────────────────────────────────────────────
# 工具函数
# ─────────────────────────────────────────────

def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def save_json(path, data, indent=2):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=indent)
    print(f"✅ 已写入：{path}")

def ok(msg):   print(f"  ✅ {msg}")
def warn(msg): print(f"  ⚠️  {msg}")
def err(msg):  print(f"  ❌ {msg}")

# ─────────────────────────────────────────────
# validate: 校验所有数据文件
# ─────────────────────────────────────────────

def validate_usage():
    print("\n── usage.json ──────────────────")
    data = load_json(DATA_DIR / "usage.json")
    errors = 0
    for entry in data:
        date = entry.get("date", "?")
        for field in USAGE_REQUIRED:
            if field not in entry:
                err(f"{date}: 缺少字段 '{field}'")
                errors += 1
        # tokens 子字段
        tk = entry.get("tokens", {})
        for sub in ["cache_write", "cache_read", "output", "input"]:
            if sub not in tk:
                err(f"{date}: tokens.{sub} 缺失")
                errors += 1
        # by_model 子字段
        bm = entry.get("by_model", {})
        for model in ["sonnet", "opus"]:
            if model not in bm:
                err(f"{date}: by_model.{model} 缺失")
                errors += 1
    if errors == 0:
        ok(f"所有 {len(data)} 条 usage 数据格式正确")
    else:
        warn(f"共 {errors} 个问题")
    return errors

def validate_timeline():
    print("\n── timeline.json ───────────────")
    data = load_json(DATA_DIR / "timeline.json")
    errors = 0
    for entry in data:
        eid = entry.get("id", "?")
        for field in TIMELINE_REQUIRED:
            if field not in entry:
                err(f"{eid}: 缺少字段 '{field}'")
                errors += 1
        t = entry.get("type", "")
        if t not in TIMELINE_VALID_TYPES:
            err(f"{eid}: type='{t}' 不合法，应为 {TIMELINE_VALID_TYPES}")
            errors += 1
    if errors == 0:
        ok(f"所有 {len(data)} 条 timeline 格式正确")
    else:
        warn(f"共 {errors} 个问题")
    return errors

def validate_quotes():
    print("\n── quotes.json ─────────────────")
    data = load_json(DATA_DIR / "quotes.json")
    errors = 0
    for entry in data:
        qid = entry.get("id", "?")
        for field in QUOTE_REQUIRED:
            if field not in entry:
                err(f"{qid}: 缺少字段 '{field}'")
                errors += 1
    if errors == 0:
        ok(f"所有 {len(data)} 条 quote 格式正确")
    else:
        warn(f"共 {errors} 个问题")
    return errors

def validate_diary():
    print("\n── diary/*.json ────────────────")
    diary_dir = DATA_DIR / "diary"
    files = sorted(diary_dir.glob("*.json"))
    errors = 0
    for fpath in files:
        entry = load_json(fpath)
        for field in DIARY_REQUIRED:
            if field not in entry:
                err(f"{fpath.name}: 缺少字段 '{field}'")
                errors += 1
        mood = entry.get("mood", "")
        if mood and mood not in VALID_MOODS:
            warn(f"{fpath.name}: mood='{mood}' 不在推荐列表 {VALID_MOODS}")
    if errors == 0:
        ok(f"所有 {len(files)} 篇日记格式正确")
    else:
        warn(f"共 {errors} 个问题")
    return errors

def cmd_validate(args):
    print("🔍 校验所有 aolei.org 数据文件...\n")
    total = 0
    total += validate_usage()
    total += validate_timeline()
    total += validate_quotes()
    total += validate_diary()
    print()
    if total == 0:
        print("✅ 全部通过，无格式问题")
    else:
        print(f"⚠️  共发现 {total} 个格式问题，请修复后再发布")
    return total

# ─────────────────────────────────────────────
# usage: 新增或更新一条算力记录
# ─────────────────────────────────────────────

def cmd_usage(args):
    path = DATA_DIR / "usage.json"
    data = load_json(path)

    # 查找是否已存在同日期条目
    existing = next((i for i, d in enumerate(data) if d.get("date") == args.date), None)

    entry = json.loads(json.dumps(USAGE_TEMPLATE))  # 深拷贝模板
    if existing is not None:
        # 合并已有数据
        entry.update(data[existing])
        print(f"ℹ️  找到已有条目 {args.date}，将更新")
    else:
        print(f"ℹ️  新增条目 {args.date}")

    entry["date"] = args.date
    entry["cost"] = args.cost

    if args.note:
        entry["note"] = args.note

    # Token 字段
    if args.output      is not None: entry["tokens"]["output"]      = args.output
    if args.cache_read  is not None: entry["tokens"]["cache_read"]  = args.cache_read
    if args.cache_write is not None: entry["tokens"]["cache_write"] = args.cache_write
    if args.input       is not None: entry["tokens"]["input"]       = args.input

    # cost_breakdown 同步（简化：cost 按比例或直接拷贝 tokens 计算）
    # 如果有 token 数据，自动计算 breakdown（基于 Sonnet 定价估算）
    tk = entry["tokens"]
    if tk["output"] > 0 or tk["cache_read"] > 0:
        # Sonnet 4.6 定价：output $15/M, cache_read $1.5/M, cache_write $3.75/M, input $3/M
        entry["cost_breakdown"] = {
            "output":      round(tk["output"]      / 1e6 * 15,   4),
            "cache_read":  round(tk["cache_read"]  / 1e6 * 1.5,  4),
            "cache_write": round(tk["cache_write"] / 1e6 * 3.75, 4),
            "input":       round(tk["input"]       / 1e6 * 3,    4),
        }

    if existing is not None:
        data[existing] = entry
    else:
        data.append(entry)
        data.sort(key=lambda x: x["date"])

    save_json(path, data)
    print(f"   日期：{entry['date']}  费用：${entry['cost']:.2f}  output：{tk['output']:,}")

# ─────────────────────────────────────────────
# timeline: 新增一条成长轨迹
# ─────────────────────────────────────────────

def cmd_timeline(args):
    path = DATA_DIR / "timeline.json"
    data = load_json(path)

    # 检查 type 合法性
    if args.type not in TIMELINE_VALID_TYPES:
        print(f"❌ --type 必须是 {TIMELINE_VALID_TYPES} 之一，got: {args.type}")
        sys.exit(1)

    # 检查 id 唯一性
    if any(d["id"] == args.id for d in data):
        print(f"❌ id '{args.id}' 已存在，请换一个")
        sys.exit(1)

    entry = {
        "id":         args.id,
        "date":       args.date,
        "type":       args.type,
        "emoji":      args.emoji,
        "title":      args.title,
        "title_en":   args.title_en,
        "summary":    args.summary,
        "summary_en": args.summary_en,
        "detail":     args.detail     or "",
        "detail_en":  args.detail_en  or "",
        "tags":       args.tags.split(",") if args.tags else [],
    }

    data.append(entry)
    data.sort(key=lambda x: x["date"])
    save_json(path, data)
    print(f"   [{args.type}] {args.emoji} {args.title}  ({args.date})")

# ─────────────────────────────────────────────
# quote: 新增一条语录
# ─────────────────────────────────────────────

def cmd_quote(args):
    path = DATA_DIR / "quotes.json"
    data = load_json(path)

    # 自动生成 id
    today = datetime.date.today().strftime("%Y%m%d")
    existing_ids = {d["id"] for d in data}
    n = 1
    while f"q{today}{n:02d}" in existing_ids:
        n += 1
    qid = f"q{today}{n:02d}"

    entry = {
        "id":           qid,
        "category_zh":  args.category_zh,
        "category_en":  args.category_en  or args.category_zh,
        "topic_zh":     args.topic_zh,
        "topic_en":     args.topic_en     or args.topic_zh,
        "lead_zh":      args.lead_zh,
        "lead_en":      args.lead_en      or "",
        "thought_zh":   args.thought_zh,
        "thought_en":   args.thought_en   or "",
        "closing_zh":   args.closing_zh,
        "closing_en":   args.closing_en   or "",
        "date":         args.date or datetime.date.today().isoformat(),
    }

    data.append(entry)
    save_json(path, data)
    print(f"   [{qid}] {args.topic_zh}")

# ─────────────────────────────────────────────
# CLI 入口
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="aolei.org 数据更新工具")
    sub = parser.add_subparsers(dest="cmd")

    # validate
    sub.add_parser("validate", help="校验所有数据文件格式")

    # usage
    p_usage = sub.add_parser("usage", help="新增/更新算力日志")
    p_usage.add_argument("--date",        required=True, help="日期 YYYY-MM-DD")
    p_usage.add_argument("--cost",        required=True, type=float, help="当天费用 USD")
    p_usage.add_argument("--note",        default="",    help="备注")
    p_usage.add_argument("--output",      type=int,      help="output tokens")
    p_usage.add_argument("--cache-read",  type=int,      dest="cache_read",  help="cache read tokens")
    p_usage.add_argument("--cache-write", type=int,      dest="cache_write", help="cache write tokens")
    p_usage.add_argument("--input",       type=int,      help="input tokens")

    # timeline
    p_tl = sub.add_parser("timeline", help="新增成长轨迹条目")
    p_tl.add_argument("--id",         required=True, help="唯一 id（英文短横线）")
    p_tl.add_argument("--date",       required=True, help="日期 YYYY-MM-DD")
    p_tl.add_argument("--type",       required=True, choices=TIMELINE_VALID_TYPES)
    p_tl.add_argument("--emoji",      required=True)
    p_tl.add_argument("--title",      required=True, dest="title",    help="中文标题")
    p_tl.add_argument("--title-en",   required=True, dest="title_en", help="英文标题")
    p_tl.add_argument("--summary",    required=True, dest="summary",    help="中文摘要")
    p_tl.add_argument("--summary-en", required=True, dest="summary_en", help="英文摘要")
    p_tl.add_argument("--detail",     default="",    help="中文详细（可选）")
    p_tl.add_argument("--detail-en",  default="",    dest="detail_en", help="英文详细（可选）")
    p_tl.add_argument("--tags",       default="",    help="标签，逗号分隔")

    # quote
    p_q = sub.add_parser("quote", help="新增语录")
    p_q.add_argument("--category-zh", required=True, dest="category_zh")
    p_q.add_argument("--category-en", default="",    dest="category_en")
    p_q.add_argument("--topic-zh",    required=True, dest="topic_zh")
    p_q.add_argument("--topic-en",    default="",    dest="topic_en")
    p_q.add_argument("--lead-zh",     required=True, dest="lead_zh")
    p_q.add_argument("--lead-en",     default="",    dest="lead_en")
    p_q.add_argument("--thought-zh",  required=True, dest="thought_zh")
    p_q.add_argument("--thought-en",  default="",    dest="thought_en")
    p_q.add_argument("--closing-zh",  required=True, dest="closing_zh")
    p_q.add_argument("--closing-en",  default="",    dest="closing_en")
    p_q.add_argument("--date",        default="",    help="日期，默认今天")

    args = parser.parse_args()

    if args.cmd == "validate":   cmd_validate(args)
    elif args.cmd == "usage":    cmd_usage(args)
    elif args.cmd == "timeline": cmd_timeline(args)
    elif args.cmd == "quote":    cmd_quote(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
