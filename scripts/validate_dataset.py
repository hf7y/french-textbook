#!/usr/bin/env python3
"""Validate the reviewed textbook Markdown dataset without external packages."""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "data" / "sections"
INDEX = DATASET / "index.json"
FRONT_MATTER = re.compile(r"\A---\n(?P<fields>(?:[a-z]+: .+\n)+)---\n\n", re.DOTALL)


def fail(message: str) -> None:
    print(f"error: {message}", file=sys.stderr)
    raise SystemExit(1)


def parse_front_matter(path: Path) -> dict[str, str]:
    match = FRONT_MATTER.match(path.read_text(encoding="utf-8"))
    if not match:
        fail(f"{path.relative_to(ROOT)} must begin with YAML front matter")
    fields = {}
    for line in match.group("fields").splitlines():
        key, value = line.split(": ", 1)
        fields[key] = value
    required = {"id", "title", "source"}
    if set(fields) != required:
        fail(f"{path.relative_to(ROOT)} front matter must contain only {sorted(required)}")
    return fields


def main() -> None:
    try:
        records = json.loads(INDEX.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        fail(f"invalid {INDEX.relative_to(ROOT)}: {error}")

    if not isinstance(records, list):
        fail("data/sections/index.json must be a JSON array")

    ids = []
    indexed_files = set()
    for record in records:
        if not isinstance(record, dict) or set(record) != {"id", "title", "path", "source"}:
            fail("each index record must contain only id, title, path, and source")
        lesson_id = record["id"]
        path = record["path"]
        source = record["source"]
        if not all(isinstance(value, str) and value for value in record.values()):
            fail(f"index record {record!r} has an empty or non-string value")
        if not re.fullmatch(r"\d{2}-[a-z0-9-]+", lesson_id):
            fail(f"invalid lesson id: {lesson_id}")
        if path != f"data/sections/{lesson_id}.md":
            fail(f"{lesson_id} must use path data/sections/{lesson_id}.md")
        if source != f"sections/{lesson_id}.md" or not (ROOT / source).is_file():
            fail(f"{lesson_id} must reference an existing immutable OCR source")

        lesson = ROOT / path
        if not lesson.is_file():
            fail(f"{lesson_id} is indexed but its lesson file is missing")
        fields = parse_front_matter(lesson)
        if fields != {"id": lesson_id, "title": record["title"], "source": source}:
            fail(f"{lesson_id} front matter does not match its index record")
        titles = re.findall(r"^# (.+)$", lesson.read_text(encoding="utf-8"), re.MULTILINE)
        if titles != [record["title"]]:
            fail(f"{lesson_id} must contain one matching level-one title")
        ids.append(lesson_id)
        indexed_files.add(lesson.resolve())

    if ids != sorted(ids) or len(ids) != len(set(ids)):
        fail("index records must have unique, ascending ids")

    lesson_files = {path.resolve() for path in DATASET.glob("*.md")}
    if lesson_files != indexed_files:
        fail("every data/sections Markdown file must have one index record")


if __name__ == "__main__":
    main()
