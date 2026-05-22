import type { VercelRequest, VercelResponse } from "@vercel/node";

const RAWG_API_KEY = process.env.RAWG_API_KEY || "2abdb2d418004ecc9d0b6da28496b286";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { search, page, page_size, genres, ordering } = req.query;
    let url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}`;
    
    if (search) url += `&search=${encodeURIComponent(search.toString())}`;
    if (page) url += `&page=${page.toString()}`;
    if (page_size) url += `&page_size=${page_size.toString()}`;
    if (genres) url += `&genres=${genres.toString()}`;
    if (ordering) url += `&ordering=${ordering.toString()}`;
    else if (!search) url += `&ordering=-added`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Set caching header to maximize speed and stay lightweight
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    res.status(200).json(data);
  } catch (error: any) {
    console.error("Error in serverless /api/games-list:", error);
    res.status(500).json({ error: error.message || "Failed to search games listings" });
  }
}
