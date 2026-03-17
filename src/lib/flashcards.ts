export interface Flashcard {
  id?: string;
  subject: string;
  subjectColor?: string;
  title: string;
  description: string;
  headerImageUrl?: string;
  qrCodeURL?: string;
  formula?: string;
  example?: string;
  footer?: string;
}

export const emptyCard: Flashcard = {
  id: "",
  subject: "",
  subjectColor: "#9E9E9E",
  title: "",
  description: "",
  headerImageUrl: "",
  formula: "",
  example: "",
  footer: "",
};

export const DEFAULT_SUBJECT_COLORS: Record<string, string> = {
  "Programming Language": "#9E9E9E",
  Math: "#4CAF50",
  Science: "#2196F3",
  History: "#FF5722",
  Biology: "#4CAF50",
  Chemistry: "#FF9800",
  Legend: "#607D8B",
  System: "#5e40f2",
};

export const getSubjectColor = (subject: string, customColor?: string): string => {
  if (customColor) return customColor;
  return DEFAULT_SUBJECT_COLORS[subject] || "#9E9E9E";
};

export const DPI = 150;
export const CARD_WIDTH_PX = 2.5 * DPI;
export const CARD_HEIGHT_PX = 3.5 * DPI;
export const PAGE_WIDTH_PX = 11 * DPI;
export const PAGE_HEIGHT_PX = 8.5 * DPI;
export const HEADER_IMAGE_HEIGHT_PX = Math.round(CARD_HEIGHT_PX * 0.33);

export const getImageSrc = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
};
