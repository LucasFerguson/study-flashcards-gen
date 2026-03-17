import Head from "next/head";
import { toPng } from "html-to-image";

import Flashcard from "~/components/Flashcard";
import cards from "./cards.json";
import {
  CARD_HEIGHT_PX,
  CARD_WIDTH_PX,
  PAGE_HEIGHT_PX,
  PAGE_WIDTH_PX,
  type Flashcard as FlashcardType,
} from "~/lib/flashcards";

export default function PrintPage() {
  const baseCards = JSON.parse(JSON.stringify(cards)) as FlashcardType[];
  const pages = Math.ceil(baseCards.length / 8);

  return (
    <>
      <Head>
        <title>Print Layouts</title>
        <meta name="description" content="Export printable flashcard layouts" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#e0f7ff] to-[#ffffff] px-6 py-12">
        <div className="w-full max-w-6xl">
          <h1 className="text-3xl font-bold mb-3">Print Layouts</h1>
          <p className="text-sm text-gray-700 mb-8">
            Download 8-card sheets sized for 8.5 × 11 paper.
          </p>

          {Array.from({ length: pages }).map((_, pageIndex) => (
            <div key={`page-container-${pageIndex}`} className="mb-12">
              <button
                onClick={() => {
                  const printLayout = document.querySelector(`#page-${pageIndex}`);
                  console.log("Download Page click", {
                    pageIndex,
                    selector: `#page-${pageIndex}`,
                    elementFound: Boolean(printLayout),
                  });
                  if (printLayout) {
                    toPng(printLayout as HTMLElement)
                      .then((dataUrl) => {
                        console.log("Download Page success", {
                          pageIndex,
                          dataUrlLength: dataUrl.length,
                        });
                        const link = document.createElement("a");
                        link.download = `flashcards-page-${pageIndex + 1}.png`;
                        link.href = dataUrl;
                        link.click();
                      })
                      .catch((err) => console.error("Error creating layout image:", err));
                  } else {
                    console.warn("Print layout not found for page", pageIndex);
                  }
                }}
                className="mb-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 print:hidden"
              >
                Download Page {pageIndex + 1}
              </button>

              <div className="print:block print:p-4">
                <div
                  id={`page-${pageIndex}`}
                  className="w-[11in] min-h-[8.5in] bg-white p-4 grid grid-cols-4 gap-4 auto-rows-max mb-8 print:mb-0"
                  style={{
                    display: "grid",
                    width: `${PAGE_WIDTH_PX}px`,
                    height: `${PAGE_HEIGHT_PX}px`,
                    gridTemplateColumns: `repeat(4, ${CARD_WIDTH_PX}px)`,
                    gridTemplateRows: `repeat(2, ${CARD_HEIGHT_PX}px)`,
                    gap: "0.1in",
                    padding: "0.3in",
                  }}
                >
                  {baseCards
                    .slice(pageIndex * 8, (pageIndex + 1) * 8)
                    .map((card, index) => (
                      <Flashcard key={`print-${pageIndex}-${index}`} {...card} />
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
