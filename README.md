# ⚡ VerbMeister

A self-contained, single-file web application for vocabulary and verb conjugation practice. Built for German language learners but designed to be **universally usable with any CSV/Excel word list**. No build step, no server, no dependencies — open `verb-trainer.html` in any modern browser and it works.

---

## Features

### 🎯 Practice Mode
- One column is shown as a prompt; the student fills in all other columns from memory
- **Random column mode** (default): each word gets a different column as the prompt, training recall in all directions
- Immediate per-field feedback with correct answer shown on error
- Enter key to check / advance; Skip and Show Solution buttons
- Configurable session size, active lists, and visible columns

### 📊 Scoring & Progress
- Live correct/wrong counters in the header
- Streak counter (🔥), accuracy percentage, session progress bar
- Full answer history for the current session (last 100 entries)

### 📋 Word Lists View
- Searchable, filterable table of all loaded words
- List management cards: rename any list, delete custom lists
- Built-in lists (Verbliste, Zwei Präteritumsformen) are protected from deletion

### 📄 Print / PDF Worksheets
- Configurable print dialog: choose lists, columns, given column, row count
- **Seed-based shuffle**: every worksheet is randomly ordered, but a numeric seed is printed on the sheet so the exact same worksheet can be reproduced at any time
- Seed can be a number (`42317`) or a word (`Klasse3B`) — text seeds are hashed to a consistent number
- Opens a pre-formatted print window → use browser's "Save as PDF" for a PDF file

### 👩‍🏫 Teacher Link Generator
- Teacher configures: which lists, how many words, which columns, which column is given, a verification symbol (emoji)
- Generates a shareable URL with the config encoded as a URL parameter
- Student opens the link → assignment banner appears with the verification symbol
- Teacher sees the same symbol on their screen → visual confirmation without any backend or login
- Unicode-safe encoding (handles German Umlauts in column names)

### 📁 File Upload
- Drag-and-drop or click to upload CSV or TSV files
- Auto-detects separator (comma, semicolon, tab)
- Preview before adding; custom list name input
- Any column structure is supported — the app adapts automatically

---

## File Structure

The entire application is a **single HTML file** (`verb-trainer.html`). There are no external files, no npm packages, no build system.

```
verb-trainer.html   ← everything: HTML, CSS, JS, and built-in data
README.md           ← this file
```

The two built-in word lists are embedded directly in the JavaScript as plain arrays of objects at the top of the `<script>` block (`VERBLIST` and `PRAETLIST`).

---

## Built-in Word Lists

| List | ID | Entries | Columns |
|---|---|---|---|
| Verbliste | `verbliste` | 97 | Infinitiv, Präteritum, Perfekt, du-Form |
| Zwei Präteritumsformen | `praet` | 6 | Infinitiv, Präteritum, Perfekt, du-Form, Beispiel |

---

## How to Use

1. Open `verb-trainer.html` in any modern browser (Chrome, Firefox, Safari, Edge)
2. Practice immediately — both lists are loaded by default
3. To add your own list: go to **📁 Hochladen**, drag in a CSV file, give it a name, click **Hinzufügen**
4. To create a teacher assignment link: go to **👩‍🏫 Lehrkraft**, configure and click **🔗 Link generieren**
5. To print a worksheet: go to **📋 Wortlisten** → **PDF exportieren**, configure options, click **🖨️ Drucken**

### CSV Format

```
Infinitiv,Präteritum,Perfekt,du-Form
gehen,ich ging,ich bin gegangen,du gehst
kommen,ich kam,ich bin gekommen,du kommst
```

- First row = column headers
- Any number of columns, any names
- UTF-8 encoding recommended (Umlauts work correctly)
- Separators: `,` `;` or `\t` — detected automatically

---

## Instructions for Coding Agents

### Core Design Goal

This app is a **universal flashcard/fill-in-the-blank trainer** that works from any tabular data source. The key insight is that it is **column-agnostic**: it does not assume anything about what the columns mean. Any column can be the "given" prompt; all other columns become fill-in fields. This makes it useful far beyond German verbs — vocabulary in any language, irregular forms, geography, dates, chemical symbols, etc.

**Do not hard-code assumptions about column names** unless adding a feature specific to a built-in list. Prefer checking `Object.keys(row)` and working with whatever the data contains.

### Architecture Notes

- **`lists` array**: The central data store. Each entry is `{ id, name, data[], color }`. `data` is an array of plain objects where keys are column names. Always mutate through the provided helper functions (`deleteList`, `addUploadedList`, etc.) so that UI rebuilds are triggered consistently.
- **`activeLists` / `activeCols` / `givenCol`**: Practice session config. `givenCol === '__random__'` means pick a different column per word. Resolved per-word into `word._resolvedGiven` inside `nextWord()`.
- **`buildUI()`**: Rebuilds list toggles, column toggles, and given-column dropdown. Call after any change to `lists`, `activeLists`, or `activeCols`.
- **`rebuildCols()`**: Recomputes `allCols` from all active list data. Call before `buildUI()` when lists change.
- **`buildSession()`**: Shuffles and slices active words into `sessionWords`. Does not advance to the next word — call `nextWord()` after.
- **Seed system**: `seededRNG(seed)` returns a mulberry32 PRNG function. `seededShuffle(arr, rng)` uses it. Always pass a fresh `seededRNG(seed)` call for each independent operation (shuffle vs. random-column assignment) to avoid correlated sequences.
- **Teacher link encoding**: `safeEncode(obj)` → `btoa(encodeURIComponent(JSON.stringify(obj)))`. Decoded by `safeDecode(str)`. This two-step encoding handles Unicode correctly. The encoded config contains: `lists`, `cols`, `givenCol`, `count`, `symbol`, `ts`.
- **Print workflow**: `openPrintModal()` sets up `printActiveLists` / `printActiveCols` → `updatePrintPreview()` renders a live preview using the seed → `doPrint()` generates a full HTML document and opens it in a new window, which auto-triggers `window.print()`.

### Adding a New Section / Tab

1. Add a `<button class="nav-tab">` to the `.nav-tabs` bar with `onclick="showSection('myname')"`
2. Add `<div id="sec-myname" class="section">` inside `<div class="main">`
3. In `showSection()`, add a case `if (name === 'myname') { /* init logic */ }`

### Adding a New Built-in List

Add a new constant array above the `lists` declaration, then add an entry to the `lists` array:
```js
const MYLIST = [
  { Column1: 'value', Column2: 'value', ... },
  ...
];

let lists = [
  { id: 'verbliste', name: 'Verbliste (97)', data: VERBLIST, color: '#7c6ff7' },
  { id: 'praet',     name: 'Zwei Präteritumsformen (6)', data: PRAETLIST, color: '#34d399' },
  { id: 'mylist',    name: 'My List (n)', data: MYLIST, color: '#f59e0b' }, // ← add here
];
```

Built-in list IDs should be added to the `BUILT_IN` constant inside `renderListManagement()` so they are protected from deletion.

### Key Invariants to Preserve

- The app must remain a **single self-contained HTML file** with no external dependencies beyond the browser
- All list data must remain in-memory (no localStorage, no server)
- The teacher link must remain tamper-evident and reproducible without a backend — do not add a server-side component to the verification flow
- The seed printed on worksheets must be the **exact** seed used to generate that sheet — never approximate or omit it
- Column names must always be treated as arbitrary strings. Never assume `Infinitiv` or any specific name exists unless operating explicitly on the German verb lists

---

## Suggested Improvements

### High Priority / Most Useful

- **XLSX support**: Integrate SheetJS (`https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`) to parse `.xlsx` files directly. The `parseXLSX()` stub already exists — it just needs implementation.
- **Persistent storage**: Use `localStorage` to save uploaded lists and session statistics across page reloads. Currently everything resets on refresh. Key risk: storage quota on very large lists.
- **Answer leniency options**: Let the teacher or user configure case-sensitivity, punctuation tolerance (e.g. ignoring leading `ich `), and accent/umlaut equivalence (e.g. `ae` = `ä`). This would significantly reduce frustration from near-misses.
- **Multiple correct answers**: Some cells contain `/`-separated alternatives (e.g. `ich bin/habe gelegen`). Add logic to split on ` / ` and accept any of the alternatives as correct.
- **Mistake repetition**: Words answered incorrectly should re-enter the session queue so they come up again before the session ends. This is the single most effective flashcard technique (spaced repetition lite).

### Teacher & Classroom

- **Answer key generation**: A second print mode that shows all answers filled in, for the teacher's reference copy. Could be triggered by an optional password in the URL or a separate button in the teacher panel.
- **QR code for teacher links**: Generate a QR code image alongside the teacher link URL so it can be displayed on a projector and scanned by students.
- **Class statistics view**: If students submit their seed + score via a simple form, the teacher could see aggregate results. Would require a minimal backend or a Google Forms / Airtable integration.
- **Assignment expiry**: Add an optional `expires` timestamp to the teacher link config so old assignment links stop showing the banner after a set date.

### Practice & Learning

- **Spaced repetition algorithm (SRS)**: Track per-word performance in `localStorage` and surface difficult words more frequently using an SM-2-style algorithm. This would transform the app from a simple drill into a proper memorization tool.
- **Typing hints**: An option to show a ghost hint (first letter, or number of characters) after a wrong answer or on demand.
- **Multiple choice mode**: Instead of free-text input, present 4 options (1 correct + 3 distractors drawn from the same list). Especially useful on mobile where typing is slow.
- **Audio support**: If a column named `Audio` contains a URL or base64 audio, play it as the prompt. Useful for pronunciation practice.
- **Keyboard shortcut overlay**: A `?` key to show all keyboard shortcuts in a modal.

### Polish & UX

- **Mobile keyboard handling**: On mobile, the keyboard pushes the layout. The given-value and input fields should scroll into view when the keyboard opens.
- **Dark/light mode toggle**: The app is currently dark-only. A light mode would be better for printing previews and for users who prefer it.
- **CSV export of history**: A button to download the session history as a CSV for the teacher or student to keep.
- **Animated streak milestones**: At streaks of 5, 10, 25, trigger a more elaborate celebration animation.
- **Onboarding tooltip**: A first-run overlay explaining the interface to new users, dismissible and never shown again (via `localStorage`).
