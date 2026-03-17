import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { promises as fs } from "fs";
import formidable, { type File } from "formidable";

const uploadsDir = path.join(process.cwd(), "public", "uploads");

export const config = {
	api: {
		bodyParser: false,
	},
};

type Data =
	| { success: true; files: string[] }
	| { success: true; url: string }
	| { success: false; error: string };

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	if (req.method === "GET") {
		return handleGet(req, res);
	}
	if (req.method === "POST") {
		return handlePost(req, res);
	}

	res.setHeader("Allow", ["GET", "POST"]);
	return res.status(405).json({ success: false, error: "Method Not Allowed" });
}

async function handleGet(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	try {
		await fs.mkdir(uploadsDir, { recursive: true });
		const files = await fs.readdir(uploadsDir);
		const urls = files
			.filter((name) => !name.startsWith("."))
			.map((name) => `/uploads/${name}`);
		return res.status(200).json({ success: true, files: urls });
	} catch (error) {
		console.error("Error reading uploads directory", error);
		return res.status(500).json({ success: false, error: "Failed to list uploads" });
	}
}

async function handlePost(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) {
	try {
		await fs.mkdir(uploadsDir, { recursive: true });

		const form = formidable({
			multiples: false,
			uploadDir: uploadsDir,
			keepExtensions: true,
			maxFileSize: 8 * 1024 * 1024,
			filename: (_name, _ext, part) => {
				const safeBase = (part.originalFilename || "upload")
					.replace(/[^a-zA-Z0-9_.-]/g, "-")
					.replace(/-+/g, "-");
				const stamp = Date.now();
				return `${stamp}-${safeBase}`;
			},
		});

		const file = await new Promise<File>((resolve, reject) => {
			form.parse(req, (err, _fields, files) => {
				if (err) return reject(err);
				const upload = Array.isArray(files.file) ? files.file[0] : files.file;
				if (!upload) return reject(new Error("No file uploaded"));
				return resolve(upload as File);
			});
		});

		if (!file.mimetype?.startsWith("image/")) {
			return res.status(400).json({ success: false, error: "Only image files are allowed" });
		}

		const savedName = path.basename(file.filepath);
		return res.status(200).json({ success: true, url: `/uploads/${savedName}` });
	} catch (error) {
		console.error("Upload failed", error);
		return res.status(500).json({ success: false, error: "Upload failed" });
	}
}
