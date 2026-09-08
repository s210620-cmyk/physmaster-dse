# PhysMaster DSE — HKDSE Physics Study App

A responsive study web app for HKDSE Physics. Works on **iPad, tablet, PC and phone** in any modern browser.

## Run it

- **Online (GitHub Pages):** enable Pages once — Settings → Pages → Source: Deploy from a branch → Branch `main` / (root) → Save — then open
  `https://s210620-cmyk.github.io/physmaster-dse/`
- **Offline:** open the single-file build `physmaster-dse.html` by itself — all code and charts are inlined (only Past Papers need internet, as they stream from Google Drive).

## Features

1. **Dashboard** – progress, accuracy, weakest topic at a glance
2. **Answer Checker** – numeric (tolerance + unit reminder) and written key-point checking
3. **Physics Q&A** – built-in offline concept tutor
4. **Study Notes** – printable, exam-style notes for 7 topics (formulas, worked examples, key points, common mistakes)
5. **Flashcards** – flip cards per topic, mark what you know
6. **Past Papers 2012–2026** – embedded Google Drive folder + per-year structure, pitfalls and FAQ
7. **Practice** – HKDSE-style MCQ generator (mechanics & electromagnetism focused; no induction calculations)
8. **Analytics** – instant bar + radar charts of topic mastery
9. **Exam Tips** – time management, MCQ/structured technique, common traps

Progress is saved per device/browser in `localStorage` (no account, no backend).

## Structure

```
index.html          # page shell (loads ECharts from CDN online)
css/style.css       # theme, responsive drawer, print styles
js/data.js          # all study content: topics, notes, cards, questions, papers, tips
js/engine.js        # store, answer checker, question generator, QA engine
js/app.js           # router + page renderers
lib/echarts-lite.js # trimmed chart library used by the offline build
```

## Tech

Vanilla HTML/CSS/JS, event-delegation (CSP-safe), ECharts for charts, localStorage for persistence.
