import { useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";
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
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(card, null, 2));
  const [jsonError, setJsonError] = useState<string>("");
  const [isEditingJson, setIsEditingJson] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "uploaded" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    if (isEditingJson) return;
    setJsonText(JSON.stringify(card, null, 2));
  }, [card, isEditingJson]);

  useEffect(() => {
    const loadUploads = async () => {
      try {
        const response = await fetch("/api/uploads");
        if (!response.ok) return;
        const data = (await response.json()) as { success: boolean; files?: string[] };
        if (data.success && data.files) {
          setUploadedImages(data.files);
        }
      } catch (err) {
        console.error("Failed to load uploads", err);
      }
    };
    void loadUploads();
  }, []);

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

  const handleImageUpload = async (file: File) => {
    try {
      setUploadStatus("uploading");
      setUploadError("");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Upload failed");
      }

      const data = (await response.json()) as { success: boolean; url?: string };
      if (data.success && data.url) {
        setCard((prev) => ({ ...prev, headerImageUrl: data.url || "" }));
        setUploadedImages((prev) =>
          data.url && !prev.includes(data.url) ? [data.url, ...prev] : prev
        );
      }

      setUploadStatus("uploaded");
      setTimeout(() => setUploadStatus("idle"), 1500);
    } catch (err) {
      console.error("Upload failed", err);
      setUploadStatus("error");
      setUploadError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleImageUpload(file);
  };

  const applyJsonToCard = (rawJson: string) => {
    try {
      const parsed = JSON.parse(rawJson) as Partial<FlashcardType>;
      if (!parsed || typeof parsed !== "object") {
        throw new Error("JSON must be an object");
      }
      setCard((prev) => ({
        ...prev,
        ...parsed,
      }));
      setJsonError("");
      return true;
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON");
      return false;
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setIsEditingJson(true);
    setJsonText(value);
    applyJsonToCard(value);
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
            Header Image URL <span className="text-gray-500 font-normal">(optional)</span>
            <input
              type="text"
              name="headerImageUrl"
              value={card.headerImageUrl || ""}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg or /uploads/your-file.png"
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block text-sm text-gray-600"
              />
            </label>
            {uploadStatus === "uploading" && (
              <span className="text-sm text-amber-600">Uploading…</span>
            )}
            {uploadStatus === "uploaded" && (
              <span className="text-sm text-green-600">Uploaded</span>
            )}
            {uploadStatus === "error" && (
              <span className="text-sm text-red-600">Error: {uploadError}</span>
            )}
          </div>
          {uploadedImages.length > 0 && (
            <div className="mt-3">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                Uploaded Images
              </div>
              <div className="flex flex-wrap gap-2">
                {uploadedImages.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setCard((prev) => ({ ...prev, headerImageUrl: url }))}
                    className={`h-16 w-16 overflow-hidden rounded border ${
                      card.headerImageUrl === url ? "border-blue-500" : "border-gray-200"
                    }`}
                  >
                    <img src={url} alt="Uploaded option" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
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

        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">JSON Editor</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditingJson(false);
                  setJsonText(JSON.stringify(card, null, 2));
                  setJsonError("");
                }}
                className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
              >
                Sync From Form
              </button>
              <button
                type="button"
                onClick={() => applyJsonToCard(jsonText)}
                className="text-xs px-3 py-1 rounded border border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                Apply JSON
              </button>
            </div>
          </div>
          <textarea
            value={jsonText}
            onChange={handleJsonChange}
            onBlur={() => setIsEditingJson(false)}
            rows={10}
            className="w-full border rounded px-3 py-2 font-mono text-xs"
          />
          {jsonError && (
            <div className="mt-2 text-sm text-red-600">
              JSON Error: {jsonError}
            </div>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Changes here will update the form when valid JSON is detected.
          </p>
        </div>
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
