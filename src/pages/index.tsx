import Head from "next/head";
import Link from "next/link";

import { api } from "~/utils/api";

import { toPng } from "html-to-image";
import { useRef, useState, useEffect, forwardRef } from "react";

import cards from "./cards.json"
import ReactMarkdown from "react-markdown";
import remarkBreaks from 'remark-breaks';
import remarkGfm from "remark-gfm";

// DPI setting
const DPI = 150;  // Standard screen DPI (old val 96)

// Standard sizes in pixels (calculated from inches * DPI)
const CARD_WIDTH_PX = 2.5 * DPI;   // 2.5in
const CARD_HEIGHT_PX = 3.5 * DPI;  // 3.5in
const PAGE_WIDTH_PX = 11 * DPI;    // 11in
const PAGE_HEIGHT_PX = 8.5 * DPI;  // 8.5in

export default function Home() {
  // const hello = api.post.hello.useQuery({ text: "from tRPC" });

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
      subject: "System",
      subjectColor: "#5e40f2",
      title: "Morning Routine",
      description: "Wake Up 9:00 am\n - Alexa + Phone + Watch Alarms ⏰ \n\n HABIT 1  \n - 💧 Drink Water for energy ⚡ \n\n HABIT 2\n - 🚿 Take Shower \n\n HABIT 3 \n - 👕 Get Dressed \n\n HABIT 4 \n - ✂ Shave face\n\n HABIT 5\n - 🚶 Start Walking to Class \n\n HABIT 6 \n - 📃 Check TODOs and Calendar 📆",
      formula: "",
      example: "",
      footer: "Created 2025-03-25 by Lucas"
    }
  ];


  // Combine all card data
  const allCards = flashcardsData.concat(JSON.parse(JSON.stringify(cards)));

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

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#e0f7ff] to-[#ffffff]">

        <div className="flex flex-col items-center p-4">
          <h1 className="text-2xl font-bold mb-6">Educational Flashcards Generator App</h1>

          {/* json formatting instructions */}
          <p className="text-sm text-gray-700 mb-6">
            <strong>Instructions:</strong> Edit the card data in the Card Editor below. Click "Save Card as Image" to generate a PNG image of the card. Click "Export All Cards as PNGs" to download all cards as PNG images. Print the cards for offline use.
          </p>
          <div className="text-sm text-gray-500 mb-6">
            Example JSON format:
            {`{
              "subject": "Math",
              "subjectColor": "#4CAF50",
              "title": "Pythagorean Theorem",
              "description": "In a right triangle...",
              "formula": "a² + b² = c²",
              "example": "If a = 3 and b = 4, then c = 5",
              "footer": "Source: Geometry Basics"
            }`}
            <p>Note: Recommended max description size is 730 chars</p>
          </div>


          {/* add card editor */}
          <CardEditor />

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

        {/* Display the cards in a nice 8.5in by 11in sheet of paper for easy printing */}
        {/* Download Print Layout Image Button */}
        {/* Split cards into groups of 6 for multiple pages */}
        {Array.from({ length: Math.ceil(allCards.length / 6) }).map((_, pageIndex) => (
          <div key={`page-container-${pageIndex}`}>
            <button
              onClick={() => {
                const printLayout = document.querySelector(`#page-${pageIndex}`);
                if (printLayout) {
                  toPng(printLayout as HTMLElement)
                    .then((dataUrl) => {
                      const link = document.createElement('a');
                      link.download = `flashcards-page-${pageIndex + 1}.png`;
                      link.href = dataUrl;
                      link.click();
                    })
                    .catch((err) => console.error('Error creating layout image:', err));
                }
              }}
              className="mb-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 print:hidden"
            >
              Download Page {pageIndex + 1}
            </button>

            <div className="print:block print:p-4">
              <div
                id={`page-${pageIndex}`}
                className="w-[11in] min-h-[8.5in] bg-white p-4 grid grid-cols-3 gap-4 auto-rows-max mb-8 print:mb-0"
                style={{
                  display: 'grid',
                  width: `${PAGE_WIDTH_PX}px`,
                  height: `${PAGE_HEIGHT_PX}px`,
                  gridTemplateColumns: `repeat(4, ${CARD_WIDTH_PX}px)`,
                  gridTemplateRows: `repeat(2, ${CARD_HEIGHT_PX}px)`,
                  gap: '0.1in',
                  padding: '0.3in'
                }}
              >
                {allCards.slice(pageIndex * 8, (pageIndex + 1) * 8).map((card, index) => (
                  <Flashcard
                    key={`print-${pageIndex}-${index}`}
                    {...card}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}

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
      className="border rounded-lg shadow-lg flex flex-col overflow-hidden"
      style={{
        borderColor: subjectColor,
        backgroundColor: subjectColor,
        width: `${CARD_WIDTH_PX}px`,
        height: `${CARD_HEIGHT_PX}px`
      }}
    >
      {/* Subject Banner */}
      <div
        className="text-white text-center py-1"
        style={{ backgroundColor: subjectColor }}
      >
        <span className="font-bold uppercase text-lg">{subject}</span>
      </div>

      {/* Card Content */}
      <div className="flex-grow p-2 bg-white flex flex-col justify-between rounded-md mx-2 mb-1 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <div className="">
            {/* <p className="text-base text-gray-700 mb-2 whitespace-pre-wrap">{description}</p> */}

            {/* className="whitespace-pre-wrap" */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                a: ({ node, ...props }) => (
                  <a {...props} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" />
                ),
                ul: ({ node, ...props }) => (
                  <ul {...props} className="list-disc list-inside pl-4 space-y-1" />
                ),
                ol: ({ node, ...props }) => (
                  <ol {...props} className="list-decimal list-inside pl-4 space-y-1" />
                ),
                li: ({ node, ...props }) => (
                  <li {...props} className="text-gray-700" />
                )
              }}
            >
              {description}
            </ReactMarkdown>
          </div>
          {formula && (
            <p className="text-base text-gray-900 font-light">
              <strong>Formula:</strong> {formula}
            </p>
          )}
          {example && (
            <p className="text-base text-gray-900 mt-1 font-light">
              <strong>Example:</strong> {example}
            </p>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className="text-sm text-gray-500 mt-auto pt-1 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});


const CardEditor: React.FC = () => {
  const [card, setCard] = useState<FlashcardProps>({
    subject: "",
    subjectColor: "#4CAF50",
    title: "",
    description: "",
    formula: "",
    example: "",
    footer: ""
  });

  const previewRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCard(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (previewRef.current) {
      try {
        const dataUrl = await toPng(previewRef.current);
        const link = document.createElement('a');
        link.download = `${card.title || 'flashcard'}.png`;
        link.href = dataUrl;
        link.click();

        // // Reset form
        // setCard({
        //   subject: "",
        //   subjectColor: "#4CAF50",
        //   title: "",
        //   description: "",
        //   formula: "",
        //   example: "",
        //   footer: ""
        // });
      } catch (err) {
        console.error('Error saving card:', err);
      }
    }
  };

  return (
    <div className="flex gap-8 items-start w-full max-w-4xl">
      <form onSubmit={handleSubmit} className="flex-1 bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-wrap mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6">
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
          <div className="w-full md:w-1/2 px-3 mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Subject Color
              <input
                type="color"
                name="subjectColor"
                value={card.subjectColor}
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
              rows={3}
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Formula
            <input
              type="text"
              name="formula"
              value={card.formula}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Example
            <input
              type="text"
              name="example"
              value={card.example}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mt-1"
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

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Card as Image
        </button>
      </form>

      {/* Live Preview */}
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
