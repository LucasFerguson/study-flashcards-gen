# Study Flashcards Generator
Created with Create T3 App  

## Description
This is a study flashcards generator app that allows users to create sheets of flashcards for easy printing on 8 1/2in by 11in sheets of paper.

Uses
- Next.js, Tailwind CSS

Created 2025-04-17 by Lucas Ferguson


## Editing existing cards
- Cards shipped in `src/pages/cards.json` now show an **Edit** button on each card.
- Clicking **Edit** loads that card into the top **Card Editor** form so you can adjust the fields with live preview.
- Changes to these base cards auto-save (debounced) back to `src/pages/cards.json` via `/api/cards` while you type. (Requires a writable server, e.g., local dev.)
- Cards defined inline in code (e.g., sample/demo cards) are view-only and do not auto-save.

## Cards JSON Format

All flashcards are stored in `src/pages/cards.json` as a JSON array. Each card object contains structured fields that support rich, detailed content suitable for studying **any subject**—whether it's programming languages, classes, concepts, or other topics you want to learn.

### Card Object Structure

Each card is a JSON object with the following fields:

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| `subject` | string | The category or subject area of the card | Used for filtering and grouping cards (e.g., "Programming Language", "Calculus", "Biology", "History") |
| `subjectColor` | string | Hex color code for visual identification | Format: `#RRGGBB` (e.g., `#F7DF1E`) |
| `title` | string | The main heading of the card | Can include emojis for quick visual tagging |
| `description` | string | The primary learning content | Supports **Markdown formatting** (bold, lists, headers, etc.) |
| `example` | string | Practical example, code snippet, or illustration | Can contain **Markdown code blocks** with language syntax highlighting; leave empty for non-technical subjects |
| `footer` | string | Citation or source attribution | e.g., "Source: Textbook Name" or "Source: MDN Web Docs" |
| `formula` | string | Mathematical formula, equation, or technical reference | Optional; can be empty or use LaTeX notation; useful for STEM subjects |

### Example Card (Complete)

```json
{
  "subject": "Programming Language",
  "subjectColor": "#F7DF1E",
  "title": "JavaScript 🌊 🧠 🌐",
  "description": "JavaScript is a dynamically typed, garbage-collected language built around an **event-driven, single-threaded execution model**.\n\n## Runtime Model\n- Browser engines (V8, SpiderMonkey)\n- Node.js, Deno, Bun\n- Async I/O via event loop\n\n## Major Libraries and Tooling\n- **Frontend**: React, Vue, Svelte\n- **Meta-frameworks**: Next.js, Nuxt\n- **Backend**: Express, Fastify, Hono\n- **Build/Tooling**: Vite, Webpack, ESLint, Jest",
  "example": "```js\nconsole.log('Hello, World!');\n```",
  "footer": "Source: MDN Web Docs",
  "formula": ""
}
```

### Content Guidelines for Rich Details

**Description Field:**
- Use Markdown headers (`##`, `###`) to organize subsections
- Use bullet points (`-`) for lists of concepts, features, or key points
- Use **bold text** for emphasis on key terms or categories
- Use newline sequences (`\n\n`) to create visual separation between sections
- Include contextual information such as:
  - Core concepts and definitions
  - Applications and real-world uses
  - Major subtopics or related areas
  - Personal experience or class notes

**Example Field (for Programming Languages):**
- For **programming language cards**, wrap code in triple backticks with language identifier: `` ```js ``, `` ```python ``, `` ```java ``, etc.
- Keep code examples simple and illustrative (typically 1-5 lines)
- Show practical usage, not entire programs
- Escaping: Use double backslashes for special characters in JSON
- For **non-technical subjects** (history, biology, etc.), use this field for diagrams, illustrations, or descriptive examples instead of code

**Example Field (for Other Subjects):**
- For **STEM subjects** (calculus, chemistry), use this for worked examples or formulas
- For **humanities** (history, literature), use for quotes, citations, or relevant snippets
- For **other classes**, use for case studies, diagrams, or concrete illustrations
- Leave empty if not applicable

**Title Field:**
- Keep concise (typically 3-5 words)
- For **programming language cards**, include emojis at the end to indicate:
  - **Type System**: 🧱 (static), 🌊 (dynamic)
  - **Execution**: ⚙️ (compiled), 🧠 (interpreted/JIT)
  - **Domain**: 🌐 (web), 🚀 (performance/systems), 🤖 (robotics/embedded)
- For **other subjects**, use emojis creatively to aid memory and visual scanning

**Footer Field:**
- Always include attribution (e.g., "Source: Course Notes", "Source: Textbook Name", "Source: Lecture 5")
- Keep brief but informative

**Formula Field:**
- Use for mathematical equations, chemical formulas, or technical notation
- Leave empty for cards where it doesn't apply
- Can use LaTeX notation if needed

### Minimal Example Card (Non-Programming Subject)

```json
{
  "subject": "Biology 101",
  "subjectColor": "#4CAF50",
  "title": "Photosynthesis 🌿",
  "description": "The process by which plants convert light energy into chemical energy.\n\n## Key Stages\n- **Light-dependent reactions**: Occur in thylakoid membranes; produce ATP and NADPH\n- **Light-independent reactions (Calvin Cycle)**: Occur in stroma; produce glucose\n\n## Overall Equation\n6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
  "example": "",
  "footer": "Source: Biology 101 Lecture Notes",
  "formula": "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂"
}
```

### Programming Language Card Example

```json
{
  "subject": "Programming Language",
  "subjectColor": "#A8B9CC",
  "title": "C++ 🧱 ⚙️ 🚀",
  "description": "A statically typed, compiled systems language offering **explicit control over memory and performance**.\n\n## Execution Model\n- Ahead-of-time compilation\n- RAII-based memory management\n- Zero-cost abstractions\n\n## Major Libraries and Tooling\n- **Core**: STL, Boost\n- **Build**: CMake, Meson\n- **Engines**: Unreal Engine\n- **Vision**: OpenCV",
  "example": "```cpp\nstd::cout << \"Hello, World!\" << std::endl;\n```",
  "footer": "Source: ISO C++ Standard",
  "formula": ""
}
```

### Using This Format for AI-Generated Cards

When prompting an AI to generate new cards for **any subject** (classes, concepts, programming languages, STEM topics, humanities, etc.):

1. **Provide a subject and color** for visual consistency (e.g., "Biology 101", "Calculus II", "World History")
2. **Request structured descriptions** with markdown headers, lists, and emphasis
3. **Include relevant examples or illustrations**:
   - For **programming languages**: Code blocks with syntax highlighting
   - For **STEM subjects**: Formulas, worked examples, or equations
   - For **humanities/other topics**: Quotes, case studies, or descriptive examples
4. **Ask for authoritative sources** in the footer (textbooks, lecture notes, official documentation)
5. **Specify emoji tagging** for titles to aid visual recognition and scanning
6. **Use the formula field** for mathematical or technical notation when relevant

This structured format ensures generated cards are **readable, scannable, and rich in detail** for effective learning and printing—regardless of subject matter.


