import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Study Flashcards</title>
        <meta
          name="description"
          content="Custom study tools for building, printing, and learning from flashcards."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#e0f7ff] to-[#ffffff] px-6 py-12">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Study Flashcards Generator
          </h1>
          <p className="text-lg text-gray-700 mb-10">
            A personal toolkit for more freedom in learning — create, edit, print,
            and remember your knowledge your way.
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/editor"
              className="rounded-xl border border-blue-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Editor</h2>
              <p className="text-sm text-gray-600">
                Build new cards, preview them live, and export single images.
              </p>
            </Link>
            <Link
              href="/cards"
              className="rounded-xl border border-blue-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Cards</h2>
              <p className="text-sm text-gray-600">
                Browse your full library and jump into edits fast.
              </p>
            </Link>
            <Link
              href="/print"
              className="rounded-xl border border-blue-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Print</h2>
              <p className="text-sm text-gray-600">
                Export clean 8.5 × 11 layouts for paper study sessions.
              </p>
            </Link>
          </div>

          <div className="mt-10 text-sm text-gray-500">
            Tip: Edit cards in the Editor, then export pages in Print for easy
            offline review.
          </div>
        </div>
      </main>
    </>
  );
}
