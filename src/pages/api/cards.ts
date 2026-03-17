import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";

interface Flashcard {
	id?: string;
	subject: string;
	subjectColor?: string;
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
	if (req.method === "PUT") {
		return handlePUT(req, res);
	} else if (req.method === "POST") {
		return handlePOST(req, res);
	} else {
		res.setHeader("Allow", ["PUT", "POST"]);
		return res.status(405).json({ success: false, error: "Method Not Allowed" });
	}
}

async function handlePUT(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
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
			...existingCards[index]!,
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

async function handlePOST(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	const { card } = req.body as { card?: Partial<Flashcard> };

	if (!card || typeof card !== "object") {
		return res.status(400).json({ success: false, error: "Invalid card payload" });
	}

	if (!card.subject || !card.title || !card.description) {
		return res.status(400).json({ success: false, error: "Missing required fields: subject, title, description" });
	}

	try {
		const fileContent = await fs.readFile(cardsFilePath, "utf8");
		const existingCards: Flashcard[] = JSON.parse(fileContent);

		const newCard: Flashcard = {
			id: card.id || "",
			subject: card.subject,
			subjectColor: card.subjectColor,
			title: card.title,
			description: card.description,
			formula: card.formula || "",
			example: card.example || "",
			footer: card.footer || "",
		};

		const updatedCards = [...existingCards, newCard];

		await fs.writeFile(cardsFilePath, JSON.stringify(updatedCards, null, 2), "utf8");

		return res.status(201).json({ success: true, card: newCard, cards: updatedCards });
	} catch (error) {
		console.error("Error creating card in cards.json", error);
		return res.status(500).json({ success: false, error: "Failed to create card" });
	}
}
