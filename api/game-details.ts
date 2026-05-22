import type { VercelRequest, VercelResponse } from "@vercel/node";
import { FALLBACK_GAMES } from "./fallback-data";

// Helper to perform RAWG API fetch with robust key self-healing (re-try with correct API key on 401)
async function fetchRawg(urlPath: string, queryParams: Record<string, any> = {}) {
  const envKey = (process.env.RAWG_API_KEY || "").trim().replace(/^["']|["']$/g, '');
  const freshHardcodedKey = "fb59a0fcb2c242ebad3b12ca1fc549ef";
  
  let keyToUse = envKey && envKey !== "2abdb2d418004ecc9d0b6da28496b286" ? envKey : freshHardcodedKey;
  
  const buildUrl = (key: string) => {
    let urlString = `https://api.rawg.io/api/${urlPath}?key=${key}`;
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        urlString += `&${k}=${encodeURIComponent(v.toString())}`;
      }
    });
    return urlString;
  };

  let response = await fetch(buildUrl(keyToUse));
  
  if (response.status === 401 && keyToUse !== freshHardcodedKey) {
    console.warn(`[RAWG API] Primary key failed with 401. Retrying with fresh working key.`);
    keyToUse = freshHardcodedKey;
    response = await fetch(buildUrl(keyToUse));
  }
  
  return response;
}

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
      const response = await fetchRawg(`games/${id.toString()}`);
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

