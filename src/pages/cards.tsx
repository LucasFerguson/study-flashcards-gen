import Head from "next/head";
import { useRouter } from "next/router";
import { useRef } from "react";
import { toPng } from "html-to-image";

import Flashcard from "~/components/Flashcard";
import cards from "./cards.json";
import { type Flashcard as FlashcardType } from "~/lib/flashcards";

export default function CardsPage() {
  const router = useRouter();
  const baseCards = JSON.parse(JSON.stringify(cards)) as FlashcardType[];

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleExportAll = () => {
    cardRefs.current.forEach((cardRef, index) => {
      if (cardRef) {
        toPng(cardRef)
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = `${baseCards[index]?.title || `card-${index}`}.png`;
            link.href = dataUrl;
            link.click();
          })
          .catch((err) => console.error("Error exporting card:", err));
      }
    });
  };

  return (
    <>
      <Head>
        <title>Cards Library</title>
        <meta name="description" content="Browse and edit flashcards" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#e0f7ff] to-[#ffffff] px-6 py-12">
        <div className="w-full max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Cards Library</h1>
              <p className="text-sm text-gray-700">
                Click Edit on any card to open it in the editor.
              </p>
            </div>
            <button
              onClick={handleExportAll}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Export All Cards as PNGs
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {baseCards.map((card, index) => (
              <Flashcard
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                onEdit={() => router.push(`/editor?index=${index}`)}
                {...card}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
