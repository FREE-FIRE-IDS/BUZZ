import type { VercelRequest, VercelResponse } from "@vercel/node";

// Store specs in a global variable so it persists across serverless function warm runs
const globalRef = global as any;
globalRef._specsStore = globalRef._specsStore || new Map<string, any>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration for easy scripting access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const { token, cpu, gpu, ram, storage, free } = req.body;
    if (!token) {
      res.status(400).json({ error: "Missing session token" });
      return;
    }

    const gpuStr = gpu || "Unknown GPU";
    const lowerG = gpuStr.toLowerCase();
    const isIntelG = lowerG.includes("intel") || lowerG.includes("uhd") || lowerG.includes("hd graphics") || lowerG.includes("iris");

    // Pre-calculate and clean up specs so it fits perfectly
    let cleanedCpu = cpu || "Unknown CPU";
    cleanedCpu = cleanedCpu.replace(/@.+/g, "").replace(/\(R\)/g, "").replace(/\(TM\)/g, "").replace(/\s+/g, " ").trim();
    if (cleanedCpu && !cleanedCpu.includes("Cores")) {
      // Basic cores count matching
      let cores = 6;
      if (cleanedCpu.includes("i3") || cleanedCpu.includes("Ryzen 3")) cores = 4;
      else if (cleanedCpu.includes("i7") || cleanedCpu.includes("Ryzen 7") || cleanedCpu.includes("Ultra 7")) cores = 8;
      else if (cleanedCpu.includes("i9") || cleanedCpu.includes("Ryzen 9") || cleanedCpu.includes("Ultra 9")) cores = 12;
      cleanedCpu = `${cleanedCpu} (${cores} Cores)`;
    }

    const formattedSpecs = {
      cpu: cleanedCpu,
      gpu: gpuStr.replace(/\(R\)/g, "").replace(/\(TM\)/g, "").replace(/\s+/g, " ").trim(),
      ram: ram ? (ram.toLowerCase().includes("gb") ? ram : `${ram} GB`) : "16 GB",
      storage: storage || "512 GB SSD",
      storageFree: free || "150 GB Free",
      os: "Windows 10/11 64-bit",
      gpuType: isIntelG ? "Integrated" : "Dedicated",
      directx: lowerG.includes("rtx") || lowerG.includes("rx 50") || lowerG.includes("rx 6") || lowerG.includes("rx 7") ? "DirectX 12 (Ultimate)" : "DirectX 12"
    };

    globalRef._specsStore.set(token.toString(), formattedSpecs);
    console.log(`[Serverless DB] Specs saved for token: ${token}`, formattedSpecs);

    res.status(200).json({ success: true, message: "Specifications synchronized successfully!" });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to process specifications" });
  }
}
