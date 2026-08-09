# French Textbook

This repository contains the reviewed French grammar/textbook material and the beginnings of a teacher-facing classroom system.

## Teacher Dashboard

Open the **[Teacher Dashboard](teacher/index.html)** on the published GitHub Pages site, or open `teacher/index.html` locally.

The dashboard is intentionally simple. It is a teacher-facing layer over the GitHub repository, not a replacement for the textbook.

### The basic model

```text
Textbook (Markdown)
        ↓
Teacher Dashboard (HTML)
        ↓
AI agent generates instruction
        ↓
Classroom evidence
        ↓
AI agent adapts the next lesson
```

Three things should remain distinct:

- **Curriculum:** the human-authored textbook and curriculum data.
- **Instruction:** generated lesson materials and weekly plans.
- **Evidence:** quiz results, Kahoot results, exit work, and teacher observations.

The textbook is the source of truth. Generated lessons may adapt pacing and activities, but should not silently rewrite the curriculum.

## Teacher workflow

### Before class

1. Open the Teacher Dashboard.
2. Set the current unit/section and today's focus.
3. Record whether the class is doing well, mixed, or struggling.
4. Use **Ask agent to generate lesson** when agent automation is available.
5. Open/print the generated materials.

A normal 50-minute lesson follows this pattern:

1. **Opening** — date, weather, greetings, warmup/retrieval question.
2. **Short-answer quiz** — previous topic, normally no more than 15 minutes. Question count can vary with class pace.
3. **Review game** — normally Kahoot or another retrieval game for the current topic.
4. **New topic** — PowerPoint/presentation, matching OneNote notes, graphic organizer, and listening comprehension.
5. **Activity** — charades, information gap, hangman, Pictionary/OneNote collaboration, word search, classroom interview, Jacques a dit, or another appropriate activity.
6. **Exit assignment** — a small piece of evidence for the next lesson.

### Five-day weeks

A fifth day can be used for:

- culture reading/video/listening comprehension;
- discussion;
- exit assignment; or
- a test day.

A test day is a dedicated 50-minute assessment.

## After class

Record what actually happened. Useful evidence is concrete:

- students recognized a form but could not produce it;
- vocabulary was strong but listening was weak;
- students finished the quiz quickly;
- an activity worked particularly well;
- a prerequisite concept caused difficulty.

The point is not to create a complicated gradebook. The point is to give the next lesson generator enough evidence to make a better choice.

## GitHub for a non-programmer teacher

You do not need to edit code to use the intended workflow.

### Issues = requests to the agent

Create an issue when you want the agent to do something, for example:

- “Generate tomorrow's lesson for C'est vs. Il est.”
- “Students are struggling with listening in Unit 4; plan targeted review.”
- “Create three information-gap activities for this section.”
- “Plan next week around the next three textbook concepts.”

The eventual workflow should have the agent respond with a proposed change or generated materials in a pull request for review.

### Pull requests = reviewable changes

A pull request is the agent saying: **“I made these changes; please look at them before they become part of the course.”**

For generated teaching materials, the teacher should be able to inspect and approve them just like any other curriculum change.

### Actions = automatic chores

GitHub Actions should handle predictable operations such as rebuilding the published site, validating textbook data, and eventually generating scheduled planning artifacts. Actions should not make opaque pedagogical decisions.

### HTML = the teacher interface

The dashboard is deliberately HTML/JavaScript so that the teacher can use it from GitHub Pages without learning a programming environment. Buttons and forms can later become hooks into Issues, Actions, agent workflows, and external classroom services.

## Planned architecture

```text
                         GitHub
                           │
          ┌────────────────┼────────────────┐
          │                │                │
       Markdown          Issues          Actions
       textbook        teacher tasks     automation
          │                │                │
          └────────────────┼────────────────┘
                           ↓
                       AI agent
                           │
             ┌─────────────┼─────────────┐
             ↓             ↓             ↓
          daily lesson   weekly plan   materials
             │             │             │
             └─────────────┼─────────────┘
                           ↓
                        classroom
                           ↓
                    evidence / results
                           ↓
                       next lesson
```

## Repository layout

The current repository already separates important concerns:

```text
sections/       human-facing textbook sections
 data/          indexed/reviewed textbook data
assets/         site assets
scripts/        processing/build scripts
index.html      textbook reader
teacher/        teacher-facing dashboard
.github/        GitHub automation
```

As the system grows, generated lessons and classroom evidence should be added as clearly separated directories rather than mixed into the source textbook.

## Design rules for future agents

1. **Read the textbook before generating material.** Do not invent a parallel curriculum.
2. **Preserve source material.** Do not rewrite reviewed textbook content merely to make a lesson easier to generate.
3. **Use existing concepts and vocabulary whenever possible.** New material should be explicitly marked as supplemental.
4. **Adapt instruction, not the canonical curriculum.** Class performance can change review, activity choice, pacing, and question selection.
5. **Prefer small reviewable changes.** Generated materials should be committed in understandable groups.
6. **Do not fabricate classroom data.** Missing results are missing results.
7. **Teacher observations are evidence, not commands to rewrite the textbook.**
8. **When uncertain, open an issue or make a proposed change rather than silently changing course structure.**
9. **Keep generated artifacts reproducible.** Record the textbook section and evidence used to generate them.
10. **Make the teacher's path simple.** If a feature requires the teacher to understand Git internals, add an HTML hook or a documented button instead.

## Roadmap

The detailed build plan lives in the repository's GitHub Issues. The intended sequence is:

1. Establish the teacher dashboard and HTML hooks.
2. Define lightweight curriculum/concept metadata.
3. Add an agent workflow for daily lesson generation.
4. Add weekly planning and pacing adaptation.
5. Add quiz/Kahoot/exit-ticket evidence capture.
6. Use evidence to drive targeted review and activity selection.
7. Generate synchronized PowerPoint/OneNote/printable materials.
8. Add scheduled GitHub Actions for safe, predictable automation.

The system should become more automated without becoming more complicated for the teacher.
