import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const url = typeof req.query.url === "string" ? req.query.url : "";
  if (!url) {
    return res.status(400).json({ error: "Missing url" });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch image" });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const arrayBuffer = await response.arrayBuffer();

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");

    return res.status(200).send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Image proxy failed", error);
    return res.status(500).json({ error: "Image proxy failed" });
  }
}
