import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

import { toPng } from "html-to-image";
import { useRef, useEffect, forwardRef } from "react";


export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });


  // JSON object array containing card data
  const flashcardsData = [
    {
      subject: "Math",
      subjectColor: "#4CAF50",
      title: "Pythagorean Theorem",
      description: "In a right triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.",
      formula: "a² + b² = c²",
      example: "If a = 3 and b = 4, then c = 5",
      footer: "Source: Geometry Basics",
    },
    {
      subject: "Science",
      subjectColor: "#2196F3",
      title: "Newton's Second Law",
      description: "Force equals mass times acceleration.",
      formula: "F = ma",
      example: "If m = 2kg and a = 3m/s², then F = 6N",
      footer: "Source: Physics Fundamentals",
    },
    {
      subject: "History",
      subjectColor: "#FF5722",
      title: "The American Revolution",
      description: "A political upheaval during which the Thirteen Colonies broke free from British rule.",
      formula: "",
      example: "Occurred between 1765 and 1783.",
      footer: "Source: History Textbook",
    },
    {
      subject: "Math",
      subjectColor: "#4CAF50",
      title: "Quadratic Formula",
      description: "The solution to a quadratic equation ax² + bx + c = 0.",
      formula: "x = (-b ± √(b² - 4ac)) / 2a",
      example: "For x² - 5x + 6 = 0, x = 2 or x = 3",
      footer: "Source: Algebra Essentials",
    },
  ];


  // Combine all card data
  const allCards = flashcardsData;

  // Create refs for all cards
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Ensure refs array matches card count
  useEffect(() => {
    console.log("useEffect - All cards:", allCards);
    console.log("Populated cardRefs:", cardRefs.current); // Logs after rendering
  }, [allCards]);

  const handleExportAll = () => {
    console.log("Exporting all cards as PNGs...");
    console.log(`Total cards to export: ${allCards.length}`);
    console.log("Card titles:", allCards.map(card => card.title).join(", "));

    cardRefs.current.forEach((cardRef, index) => {
      console.log("Card Ref", cardRef);
      if (cardRef) {
        console.log("Exporting card", index);
        toPng(cardRef)
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = `${allCards[index]?.title || `card-${index}`}.png`;
            link.href = dataUrl;
            console.log("Link", link);
            link.click();
          })
          .catch((err) => console.error("Error exporting card:", err));
      }
    });
  };

  return (
    <>
      <Head>
        <title>Educational Flashcards</title>
        <meta name="description" content="Educational flashcards for various topics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="flex flex-col items-center p-4">
          <h1 className="text-2xl font-bold mb-6">Educational Flashcards</h1>

          {/* Export All Button */}
          <button
            onClick={handleExportAll}
            className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Export All Cards as PNGs
          </button>

          {/* Flashcards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCards.map((card, index) => (
              <Flashcard
                key={index}
                ref={(el) => (cardRefs.current[index] = el)} // Assign refs dynamically
                {...card}
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}



interface FlashcardProps {
  subject: string;
  subjectColor: string;
  title: string;
  description: string;
  formula?: string;
  example?: string;
  footer?: string;
}

const Flashcard = forwardRef<HTMLDivElement, FlashcardProps>(({
  subject,
  subjectColor,
  title,
  description,
  formula,
  example,
  footer,
}, ref) => {

  return (
    <div
      ref={ref}
      className="w-[240px] h-[336px] border rounded-lg shadow-lg flex flex-col overflow-hidden"
      style={{ borderColor: subjectColor, backgroundColor: subjectColor }} // Apply hex color as border
    >
      {/* Subject Banner */}
      <div
        className="text-white text-center py-1"
        style={{ backgroundColor: subjectColor }} // Apply hex color as background
      >
        <span className="font-bold uppercase">{subject}</span>
      </div>

      {/* Card Content */}
      <div className="flex-grow p-2 bg-white flex flex-col justify-between rounded-md mx-2 mb-1 shadow-sm">
        <div>
          <h2 className="text-lg font-normal mb-1">{title}</h2>
          <p className="text-sm text-gray-700 mb-1">{description}</p>
          {formula && (
            <p className="text-sm text-gray-900 font-light">
              <strong>Formula:</strong> {formula}
            </p>
          )}
          {example && (
            <p className="text-sm text-gray-900 mt-1 font-light">
              <strong>Example:</strong> {example}
            </p>
          )}
        </div>
        {/* Footer */}
        {footer && (
          <div className="text-xs text-gray-500 mt-auto pt-1 border-t border-gray-200">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
});
