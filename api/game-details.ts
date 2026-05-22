import type { VercelRequest, VercelResponse } from "@vercel/node";

const RAWG_API_KEY = process.env.RAWG_API_KEY || "2abdb2d418004ecc9d0b6da28496b286";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: "Missing required parameter 'id'" });
      return;
    }

    const url = `https://api.rawg.io/api/games/${id.toString()}?key=${RAWG_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.statusText}`);
    }
    const data = await response.json();

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error in serverless /api/game-details:", error);
    res.status(500).json({ error: error.message || "Failed to fetch game details details" });
  }
}
