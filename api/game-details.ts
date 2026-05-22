import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FALLBACK_GAMES } from "./fallback-data";

const RAWG_API_KEY = process.env.RAWG_API_KEY || "2abdb2d418004ecc9d0b6da28496b286";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    if (!id) {
      res.status(400).json({ error: "Missing required parameter 'id'" });
      return;
    }

    const numericId = parseInt(id.toString());
    
    // First try the live API
    try {
      const url = `https://api.rawg.io/api/games/${id.toString()}?key=${RAWG_API_KEY}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
        res.status(200).json(data);
        return;
      }
    } catch (e) {
      console.warn("Direct RAWG fetch failed, checking local database...", e);
    }

    // Fallback to local high-fidelity database
    const localGame = FALLBACK_GAMES.find((g) => g.id === numericId);
    if (localGame) {
      res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
      res.status(200).json(localGame);
      return;
    }

    throw new Error(`Game not found with ID ${id}`);
  } catch (error: any) {
    console.error("Error in serverless /api/game-details:", error);
    res.status(500).json({ error: error.message || "Failed to fetch game details" });
  }
}

