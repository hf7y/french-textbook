# French Textbook OCR normalization

This repository preserves the OCR transcription in `sections/` and publishes
reviewed lessons from `data/sections/`. Treat every source file as immutable:
never edit, rename, or delete files in `sections/`.

## One issue, one lesson

Each OCR-normalization issue must produce exactly one reviewable lesson.

1. Read the issue's source file and use its filename as the lesson ID.
2. Create `data/sections/<lesson-id>.md` with the required front matter.
3. Add or update the corresponding entry in `data/sections/index.json`.
4. Preserve the source's meaning, examples, French accents, and uncertainty.
   Correct obvious OCR errors, but do not invent missing text. Mark unresolved
   passages with `<!-- OCR uncertainty: ... -->`.
5. Use semantic Markdown: one `#` title, `##` for sections, tables for
   paradigms and comparisons, lists for sequences, and blank lines between
   blocks. Keep French examples and their English glosses together.
6. Run `python3 scripts/validate_dataset.py` before opening the pull request.

## Required lesson format

```markdown
---
id: 01-adjectives
title: Adjectives
source: sections/01-adjectives.md
---

# Adjectives
```

`id`, `title`, and `source` must exactly match the lesson's index record.
The index is sorted by `id` and is the only list used by the HTML reader.

## Scope and review

Do not change the reader, workflows, validation script, or unrelated lessons
while normalizing a lesson. In the pull request description, name the source
file and list every `OCR uncertainty` marker left for human review.
