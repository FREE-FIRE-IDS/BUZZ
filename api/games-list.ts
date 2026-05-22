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
    const { search, page, page_size, genres, ordering } = req.query;
    
    const queryParams: Record<string, any> = {};
    if (search) queryParams.search = search.toString();
    if (page) queryParams.page = page.toString();
    if (page_size) queryParams.page_size = page_size.toString();
    if (genres) queryParams.genres = genres.toString();
    if (ordering) queryParams.ordering = ordering.toString();
    else if (!search) queryParams.ordering = "-added";

    const response = await fetchRawg("games", queryParams);
    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.statusText} (${response.status})`);
    }
    const data = await response.json();
    
    // Set caching header to maximize speed and stay lightweight
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    res.status(200).json(data);
  } catch (error: any) {
    console.warn("RAWG API connection / response error. Resolving locally from high-fidelity standby database of popular PC games:", error);
    
    // Client-safe fallback resolution
    const { search, genres } = req.query;
    let filteredList = [...FALLBACK_GAMES];

    if (search) {
      const q = search.toString().toLowerCase();
      filteredList = filteredList.filter(
        (g) => g.name.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q)
      );
    }

    if (genres) {
      const gen = genres.toString().toLowerCase();
      filteredList = filteredList.filter((g) =>
        g.genres?.some(
          (genre) =>
            genre.slug.toLowerCase().includes(gen) ||
            genre.name.toLowerCase().includes(gen)
        )
      );
    }

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    res.status(200).json({
      results: filteredList,
      count: filteredList.length,
      note: "Recovered from high-fidelity fallback database"
    });
  }
}

