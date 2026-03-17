import { forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import QRCode from "react-qr-code";

import {
  CARD_HEIGHT_PX,
  CARD_WIDTH_PX,
  HEADER_IMAGE_HEIGHT_PX,
  getSubjectColor,
  type Flashcard as FlashcardType,
} from "~/lib/flashcards";

const markdownComponents = {
  a: ({ node, ...props }: any) => (
    <a
      {...props}
      className="text-blue-600 hover:text-blue-800 underline"
      target="_blank"
      rel="noopener noreferrer"
    />
  ),
  pre: ({ node, ...props }: any) => (
    <pre
      {...props}
      className="code-block bg-gray-900 text-gray-100 text-[11px] leading-tight p-2 rounded-md overflow-auto whitespace-pre-wrap break-words my-1"
    />
  ),
  code: ({ node, inline, className, ...props }: any) => {
    if (inline) {
      return (
        <code
          className="bg-gray-100 text-gray-800 px-1 py-[1px] rounded text-[12px]"
          {...props}
        />
      );
    }
    return (
      <code
        className={`code-inline-block ${className || ""} text-[11px] leading-tight`}
        {...props}
      />
    );
  },
  ul: ({ node, ...props }: any) => (
    <ul {...props} className="list-disc list-inside pl-4 space-y-1" />
  ),
  ol: ({ node, ...props }: any) => (
    <ol {...props} className="list-decimal list-inside pl-4 space-y-1" />
  ),
  li: ({ node, ...props }: any) => (
    <li {...props} className="text-gray-700" />
  ),
};

interface FlashcardProps extends FlashcardType {
  onEdit?: () => void;
}

const Flashcard = forwardRef<HTMLDivElement, FlashcardProps>(
  (
    {
      subject,
      subjectColor,
      title,
      description,
      headerImageUrl,
      qrCodeURL,
      formula,
      example,
      footer,
      onEdit,
    },
    ref
  ) => {
    const effectiveColor = getSubjectColor(subject, subjectColor);

    return (
      <div
        ref={ref}
        className="border rounded-lg shadow-lg flex flex-col overflow-hidden relative"
        style={{
          borderColor: effectiveColor,
          backgroundColor: effectiveColor,
          width: `${CARD_WIDTH_PX}px`,
          height: `${CARD_HEIGHT_PX}px`,
        }}
      >
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="print:hidden absolute top-2 right-2 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded shadow hover:bg-gray-100"
          >
            Edit
          </button>
        )}
        <div
          className="text-white text-center py-1"
          style={{ backgroundColor: effectiveColor }}
        >
          <span className="font-bold uppercase text-lg">{subject}</span>
        </div>

        {headerImageUrl && (
          <div
            className="w-full overflow-hidden bg-white"
            style={{ height: `${HEADER_IMAGE_HEIGHT_PX}px` }}
          >
            <img
              src={headerImageUrl}
              alt={`${title} header`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-grow p-2 bg-white flex flex-col justify-between rounded-md mx-2 mb-1 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <div className="text-sm text-gray-700 leading-snug">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeHighlight]}
                components={markdownComponents}
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
              <div className="text-sm text-gray-900 mt-1 font-light space-y-1">
                <strong>Example:</strong>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {example}
                </ReactMarkdown>
              </div>
            )}
          </div>
          {qrCodeURL && (
            <div className="mt-auto flex justify-center">
              <QRCode
                value={qrCodeURL}
                size={240}
                bgColor="#ffffff"
                fgColor="#000000"
                level="L"
              />
            </div>
          )}

          {footer && (
            <div className="text-sm text-gray-500 mt-auto pt-1 border-t border-gray-200">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Flashcard.displayName = "Flashcard";

export default Flashcard;
