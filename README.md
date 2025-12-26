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


