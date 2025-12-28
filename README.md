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

| Field | Type | Required | Description | Notes |
|-------|------|----------|-------------|-------|
| `id` | string | Optional | Unique identifier for the card | Used as a stable key for auto-save operations. For programming language cards, use slugs like `js`, `python`, `java`, etc. If omitted, the card uses title-based identification. |
| `subject` | string | **Yes** | The category or subject area of the card | Used for filtering and grouping cards (e.g., "Programming Language", "Calculus", "Biology", "History") |
| `subjectColor` | string | Optional | Hex color code for visual identification | Format: `#RRGGBB` (e.g., `#F7DF1E`). If omitted, defaults to a subject-based color or neutral gray (`#9E9E9E`). See **Color Defaults** section below. |
| `title` | string | **Yes** | The main heading of the card | Can include emojis for quick visual tagging |
| `description` | string | **Yes** | The primary learning content | Supports **Markdown formatting** (bold, lists, headers, etc.) |
| `example` | string | Optional | Practical example, code snippet, or illustration | Can contain **Markdown code blocks** with language syntax highlighting. If omitted or empty, renders nothing. For non-technical subjects, can be illustrations or descriptive examples. |
| `footer` | string | Optional | Citation or source attribution | e.g., "Source: Textbook Name" or "Source: MDN Web Docs". If omitted, renders nothing. |
| `formula` | string | Optional | Mathematical formula, equation, or technical reference | Can use LaTeX notation. Useful for STEM subjects. If omitted or empty, renders nothing. |

### Optional Field Behavior

The following fields are truly optional and follow these rules:

- **`example`**: If missing or empty string (`""`), the example section **renders nothing**. Use this for subjects where examples aren't applicable (e.g., historical events, abstract concepts).
- **`formula`**: If missing or empty string (`""`), the formula section **renders nothing**. Use this for subjects without mathematical notation.
- **`subjectColor`**: If missing, the component automatically selects a default color based on the `subject` field. See **Color Defaults** section.

### Color Defaults

If `subjectColor` is omitted, the system automatically assigns a color based on the `subject` value:

```
"Programming Language"  → #9E9E9E (Neutral Gray)
"Math"                  → #4CAF50 (Green)
"Science"               → #2196F3 (Blue)
"History"               → #FF5722 (Deep Orange)
"Biology"               → #4CAF50 (Green)
"Chemistry"             → #FF9800 (Orange)
"Legend"                → #607D8B (Blue Gray)
"System"                → #5e40f2 (Purple)
[any other subject]     → #9E9E9E (Neutral Gray fallback)
```

To override the default for a subject, explicitly provide `subjectColor` in the card object.

### Example Card (Complete, with all optional fields)

```json
{
  "id": "js",
  "subject": "Programming Language",
  "subjectColor": "#F7DF1E",
  "title": "JavaScript 🌊 🧠 🌐",
  "description": "JavaScript is a dynamically typed, garbage-collected language built around an **event-driven, single-threaded execution model**.\n\n## Runtime Model\n- Browser engines (V8, SpiderMonkey)\n- Node.js, Deno, Bun\n- Async I/O via event loop\n\n## Major Libraries and Tooling\n- **Frontend**: React, Vue, Svelte\n- **Meta-frameworks**: Next.js, Nuxt\n- **Backend**: Express, Fastify, Hono\n- **Build/Tooling**: Vite, Webpack, ESLint, Jest",
  "example": "```js\nconsole.log('Hello, World!');\n```",
  "footer": "Source: MDN Web Docs",
  "formula": ""
}
```

### Example Card (Minimal, relying on defaults)

```json
{
  "id": "my-concept",
  "subject": "Math",
  "title": "Pythagorean Theorem",
  "description": "In a right triangle, the square of the hypotenuse equals the sum of the squares of the other two sides.\n\n**Key Formula**: a² + b² = c²"
}
```

In this minimal example:
- `subjectColor` is omitted → defaults to `#4CAF50` (green) based on "Math" subject
- `example` is omitted → example section renders nothing
- `formula` is omitted → formula section renders nothing
- `footer` is omitted → footer section renders nothing



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
- Include attribution when available (e.g., "Source: Course Notes", "Source: Textbook Name", "Source: Lecture 5")
- Optional; leave empty or omit if not applicable

**Formula Field:**
- Use for mathematical equations, chemical formulas, or technical notation
- Optional; leave empty or omit if not applicable
- Can use LaTeX notation if needed

**ID Field:**
- Optional; used as a stable identifier for auto-save operations
- For **programming language cards**, use short slugs like `js`, `python`, `java`, `cpp`, `ts`, `html`, `css`, `ruby`
- For other cards, use kebab-case slugs (e.g., `pythagorean-theorem`, `newtons-second-law`)
- Must be unique within your card set
- If omitted, the system uses the card title as a fallback identifier


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


