import { useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import { toPng } from "html-to-image";

import Flashcard from "~/components/Flashcard";
import { emptyCard, type Flashcard as FlashcardType } from "~/lib/flashcards";

interface CardEditorProps {
  card: FlashcardType;
  setCard: Dispatch<SetStateAction<FlashcardType>>;
  editorRef?: RefObject<HTMLDivElement>;
  saveStatus?: "idle" | "saving" | "saved" | "error";
  saveError?: string;
  isEditingBaseCard?: boolean;
}

const CardEditor: React.FC<CardEditorProps> = ({
  card,
  setCard,
  editorRef,
  saveStatus = "idle",
  saveError = "",
  isEditingBaseCard = false,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [createStatus, setCreateStatus] = useState<
    "idle" | "creating" | "created" | "error"
  >("idle");
  const [createError, setCreateError] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCard((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!previewRef.current) return;

    try {
      const dataUrl = await toPng(previewRef.current);
      const link = document.createElement("a");
      link.download = `${card.title || "flashcard"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error saving card:", err);
    }
  };

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!card.subject || !card.title || !card.description) {
      setCreateError("Subject, Title, and Description are required");
      setCreateStatus("error");
      return;
    }

    try {
      setCreateStatus("creating");
      setCreateError("");
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to create card");
      }

      setCreateStatus("created");
      setCard(emptyCard);
      setTimeout(() => setCreateStatus("idle"), 2000);
    } catch (err) {
      console.error("Create card failed", err);
      setCreateStatus("error");
      setCreateError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div ref={editorRef} className="flex gap-8 items-start w-full max-w-4xl">
      <form onSubmit={handleSubmit} className="flex-1 bg-white p-6 rounded-lg shadow-lg">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Card Editor</h2>
            {card.title && (
              <span className="text-sm text-gray-500">
                {isEditingBaseCard ? "Editing existing card" : "New card"}: {card.title}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-3">
            {isEditingBaseCard && (
              <span className="text-blue-600">Auto-save on change</span>
            )}
            {saveStatus === "saving" && <span className="text-amber-600">Saving…</span>}
            {saveStatus === "saved" && <span className="text-green-600">Saved</span>}
            {saveStatus === "error" && <span className="text-red-600">Error: {saveError}</span>}
          </div>
        </div>
        <div className="flex flex-wrap mb-6">
          <div className="w-full md:w-1/3 px-3 mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              ID <span className="text-gray-500 font-normal">(optional, auto-save key)</span>
              <input
                type="text"
                name="id"
                value={card.id || ""}
                onChange={handleChange}
                placeholder="e.g., java, python, js"
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </label>
          </div>
          <div className="w-full md:w-1/3 px-3 mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Subject
              <input
                type="text"
                name="subject"
                value={card.subject}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </label>
          </div>
          <div className="w-full md:w-1/3 px-3 mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Subject Color <span className="text-gray-500 font-normal">(optional)</span>
              <input
                type="color"
                name="subjectColor"
                value={card.subjectColor || "#9E9E9E"}
                onChange={handleChange}
                className="w-full h-10 border rounded px-3 py-2 mt-1"
              />
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Title
            <input
              type="text"
              name="title"
              value={card.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
            <textarea
              name="description"
              value={card.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
              rows={15}
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Formula <span className="text-gray-500 font-normal">(optional - renders nothing if empty)</span>
            <input
              type="text"
              name="formula"
              value={card.formula || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Example <span className="text-gray-500 font-normal">(optional - renders nothing if empty)</span>
            <textarea
              name="example"
              value={card.example || ""}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
              rows={3}
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Footer
            <input
              type="text"
              name="footer"
              value={card.footer}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            type="submit"
            className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Save Card as Image
          </button>
          <button
            type="button"
            onClick={handleCreateCard}
            disabled={createStatus === "creating"}
            className="flex-1 bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {createStatus === "creating" ? "Creating..." : "Create Card"}
          </button>
        </div>

        {createStatus === "created" && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            ✓ Card created successfully!
          </div>
        )}
        {createStatus === "error" && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {createError}
          </div>
        )}
      </form>

      <div className="flex-1 flex flex-col items-end">
        <div className="sticky top-4">
          <h3 className="text-center mb-4">Live Preview</h3>
          <div ref={previewRef}>
            <Flashcard {...card} />
          </div>
          <div className="mt-4 bg-gray-800 p-4 rounded-lg">
            <pre className="text-white text-xs whitespace-pre-wrap break-words">
              {JSON.stringify(card, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardEditor;
