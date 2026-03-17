import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import CardEditor from "~/components/CardEditor";
import cards from "./cards.json";
import { emptyCard, type Flashcard as FlashcardType } from "~/lib/flashcards";

export default function EditorPage() {
  const router = useRouter();
  const baseCards = JSON.parse(JSON.stringify(cards)) as FlashcardType[];

  const [editorCard, setEditorCard] = useState<FlashcardType>(emptyCard);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string>("");

  const editorSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const indexParam = router.query.index;
    if (indexParam === undefined) return;

    const rawIndex = Array.isArray(indexParam) ? indexParam[0] : indexParam;
    const parsedIndex = Number(rawIndex);

    if (!Number.isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < baseCards.length) {
      setEditorCard({ ...emptyCard, ...baseCards[parsedIndex] });
      setEditingIndex(parsedIndex);
      if (editorSectionRef.current) {
        editorSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [router.isReady, router.query.index, baseCards.length]);

  useEffect(() => {
    if (editingIndex === null) return;

    const timeout = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        setSaveError("");
        const response = await fetch("/api/cards", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index: editingIndex, card: editorCard }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || "Failed to save card");
        }

        setSaveStatus("saved");
      } catch (err) {
        console.error("Auto-save failed", err);
        setSaveStatus("error");
        setSaveError(err instanceof Error ? err.message : "Unknown error");
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [editorCard, editingIndex]);

  return (
    <>
      <Head>
        <title>Card Editor</title>
        <meta name="description" content="Create and edit flashcards" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#e0f7ff] to-[#ffffff] px-6 py-12">
        <div className="w-full max-w-5xl">
          <h1 className="text-3xl font-bold mb-3">Card Editor</h1>
          <p className="text-sm text-gray-700 mb-6">
            Edit a card by visiting from the Cards page, or create a new one here.
            Use Markdown in descriptions for richer formatting.
          </p>

          <CardEditor
            card={editorCard}
            setCard={setEditorCard}
            editorRef={editorSectionRef}
            saveStatus={saveStatus}
            saveError={saveError}
            isEditingBaseCard={editingIndex !== null}
          />
        </div>
      </main>
    </>
  );
}
