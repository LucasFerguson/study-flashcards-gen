import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";

interface Flashcard {
	subject: string;
	subjectColor: string;
	title: string;
	description: string;
	qrCodeURL?: string;
	formula?: string;
	example?: string;
	footer?: string;
}

const cardsFilePath = path.join(process.cwd(), "src", "pages", "cards.json");

type Data =
	| { success: true; card: Flashcard; cards: Flashcard[] }
	| { success: false; error: string };

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method !== "PUT") {
		res.setHeader("Allow", ["PUT"]);
		return res.status(405).json({ success: false, error: "Method Not Allowed" });
	}

	const { index, card } = req.body as { index?: number; card?: Partial<Flashcard> };

	if (typeof index !== "number" || index < 0) {
		return res.status(400).json({ success: false, error: "Invalid index" });
	}

	if (!card || typeof card !== "object") {
		return res.status(400).json({ success: false, error: "Invalid card payload" });
	}

	try {
		const fileContent = await fs.readFile(cardsFilePath, "utf8");
		const existingCards: Flashcard[] = JSON.parse(fileContent);

		if (index >= existingCards.length) {
			return res
				.status(400)
				.json({ success: false, error: "Index out of bounds" });
		}

		const updatedCard: Flashcard = {
			...existingCards[index],
			...card,
		};

		const updatedCards = [...existingCards];
		updatedCards[index] = updatedCard;

		await fs.writeFile(cardsFilePath, JSON.stringify(updatedCards, null, 2), "utf8");

		return res.status(200).json({ success: true, card: updatedCard, cards: updatedCards });
	} catch (error) {
		console.error("Error updating cards.json", error);
		return res.status(500).json({ success: false, error: "Failed to save card" });
	}
}
