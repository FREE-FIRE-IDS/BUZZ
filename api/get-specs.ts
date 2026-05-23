import type { VercelRequest, VercelResponse } from "@vercel/node";

const globalRef = global as any;
globalRef._specsStore = globalRef._specsStore || new Map<string, any>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { token } = req.query;
  if (!token) {
    res.status(400).json({ error: "Missing session token" });
    return;
  }

  const specs = globalRef._specsStore.get(token.toString());
  if (specs) {
    res.status(200).json({ found: true, specs });
  } else {
    res.status(200).json({ found: false });
  }
}
