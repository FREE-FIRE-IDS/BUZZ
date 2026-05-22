import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

// Lazy-loaded Gemini AI client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        }
      }
    });
  }
  return aiInstance;
}

// Basic heuristic parser for fallback evaluations when GEMINI_API_KEY is missing
function fallbackHeuristicComparison(requirements: { minimum?: string; recommended?: string }, userSpecs: any) {
  const getSpecsHeuristics = (reqText: string | undefined, isRecommended: boolean) => {
    let text = reqText || "";
    if (!text || text.trim() === "Not specified" || text.toLowerCase().includes("evaluate system")) {
      if (isRecommended) {
        text = "Processor (CPU): Intel Core i7-8700K / AMD Ryzen 5 3600 (6 Cores)\nGraphics (GPU): NVIDIA GeForce GTX 1080 / AMD Radeon RX 5700 XT (8 GB VRAM)\nMemory (RAM): 16 GB RAM\nStorage: 80 GB available space (SSD Recommended)\nOperating System: Windows 10 64-bit";
      } else {
        text = "Processor (CPU): Intel Core i5-6600K / AMD Ryzen 5 1600 (4 Cores)\nGraphics (GPU): NVIDIA GeForce GTX 1060 / AMD Radeon RX 580 (6 GB VRAM)\nMemory (RAM): 8 GB RAM\nStorage: 60 GB available space\nOperating System: Windows 10 64-bit";
      }
    }

    const lowerReq = text.toLowerCase();
    
    // Parse RAM
    let requiredRam = isRecommended ? "16 GB" : "8 GB";
    const ramMatch = lowerReq.match(/(\d+)\s*(gb|mb)\s*ram/);
    if (ramMatch) {
      requiredRam = ramMatch[1] + " " + ramMatch[2].toUpperCase();
    }
    const userRamVal = parseInt(userSpecs.ram) || 8;
    const reqRamVal = parseInt(requiredRam) || 8;
    const ramPass = userRamVal >= reqRamVal;

    // Parse OS
    const osPass = !userSpecs.os.toLowerCase().includes("mac") || lowerReq.includes("mac");
    let requiredOS = isRecommended ? "Windows 10/11 64-bit" : "Windows 10 64-bit";
    if (lowerReq.includes("windows 11")) requiredOS = "Windows 11 64-bit";
    else if (lowerReq.includes("windows 10")) requiredOS = "Windows 10 64-bit";
    else if (lowerReq.includes("windows 7")) requiredOS = "Windows 7 64-bit";

    // Guess CPU and GPU
    let requiredCpu = isRecommended ? "Intel i7 / Ryzen 5 (6 Cores)" : "Intel i5 / Ryzen 3 (4 Cores)";
    const cpuMatch = text.match(/(processor|cpu):\s*([^,\.\n\r]+)/i);
    if (cpuMatch) requiredCpu = cpuMatch[2].trim();

    let reqCpuCores = isRecommended ? 6 : 4;
    if (lowerReq.includes("8 core") || lowerReq.includes("octa-core") || lowerReq.includes("8-core")) reqCpuCores = 8;
    else if (lowerReq.includes("6 core") || lowerReq.includes("hexa-core") || lowerReq.includes("6-core")) reqCpuCores = 6;
    else if (lowerReq.includes("4 core") || lowerReq.includes("quad-core") || lowerReq.includes("4-core")) reqCpuCores = 4;

    const userCpuCores = parseInt(userSpecs.cpu.match(/(\d+)\s*Cores/i)?.[1] || "4");
    const cpuPass = userCpuCores >= reqCpuCores;

    let requiredGpu = isRecommended ? "NVIDIA RTX 3060 / AMD RX 6600 (6-8 GB VRAM)" : "NVIDIA GTX 1050 Ti / AMD RX 570 (4 GB VRAM)";
    const gpuMatch = text.match(/(graphics|gpu|video card):\s*([^,\.\n\r]+)/i);
    if (gpuMatch) requiredGpu = gpuMatch[2].trim();

    let reqGpuVram = isRecommended ? 6 : 4;
    if (lowerReq.includes("8 gb vram") || lowerReq.includes("8gb vram") || lowerReq.includes("8 gb dedicated")) reqGpuVram = 8;
    else if (lowerReq.includes("6 gb vram") || lowerReq.includes("6gb") || lowerReq.includes("6 gb dedicated")) reqGpuVram = 6;
    else if (lowerReq.includes("4 gb vram") || lowerReq.includes("4gb") || lowerReq.includes("4 gb dedicated")) reqGpuVram = 4;

    const userGpuVramVal = parseInt(userSpecs.vram) || 4;
    const gpuPass = userGpuVramVal >= reqGpuVram;
    
    // Storage
    let requiredStorage = "50 GB";
    const storageMatch = lowerReq.match(/(\d+)\s*(gb|mb)\s*(available|storage|space|disk)/);
    if (storageMatch) {
      requiredStorage = storageMatch[1] + " GB";
    }
    const userStorageVal = parseInt(userSpecs.storageFree || userSpecs.storage) || 245;
    const reqStorageVal = parseInt(requiredStorage) || 50;
    const storagePass = userStorageVal >= reqStorageVal;

    return {
      pass: ramPass && storagePass && cpuPass && gpuPass,
      specs: {
        cpu: {
          required: requiredCpu,
          user: userSpecs.cpu,
          pass: cpuPass,
          reason: cpuPass 
            ? `Your CPU has ${userCpuCores} Cores which meets or exceeds the required ${reqCpuCores} logical cores.`
            : `Your CPU has ${userCpuCores} Cores which is below the recommended ${reqCpuCores} Cores.`
        },
        gpu: {
          required: requiredGpu,
          user: `${userSpecs.gpu} (${userSpecs.vram || "4 GB"} VRAM, ${userSpecs.directx || "DirectX 12"})`,
          pass: gpuPass,
          reason: gpuPass 
            ? `Your graphics card VRAM (${userGpuVramVal} GB) is compatible with required shaders parameters.`
            : `Your VRAM (${userGpuVramVal} GB) is below game requirements of ${reqGpuVram} GB VRAM.`
        },
        ram: {
          required: requiredRam,
          user: userSpecs.ram,
          pass: ramPass,
          reason: ramPass 
            ? `Your ${userSpecs.ram} meets or exceeds the required ${requiredRam}.`
            : `Your ${userSpecs.ram} is insufficient for the required ${requiredRam}.`
        },
        os: {
          required: requiredOS,
          user: userSpecs.os,
          pass: osPass,
          reason: osPass 
            ? `Your OS (${userSpecs.os}) is fully compatible.`
            : `Mac OS/Linux is not natively supported by standard DirectX builds.`
        },
        storage: {
          required: requiredStorage,
          user: userSpecs.storageFree || userSpecs.storage,
          pass: storagePass,
          reason: storagePass
            ? `Remaining storage space (${userSpecs.storageFree || userSpecs.storage}) meets the required ${requiredStorage}.`
            : `Insufficient remaining storage space. You need at least ${requiredStorage} available.`
        }
      }
    };
  };

  const minimumResult = getSpecsHeuristics(requirements.minimum, false);
  const recommendedResult = getSpecsHeuristics(requirements.recommended, true);

  let overallVerdict = "Failed Minimum";
  if (minimumResult?.pass) {
    overallVerdict = recommendedResult?.pass ? "Fully Compatible" : "Minimum Pass, Recommended Fail";
  }

  return {
    minimum: minimumResult,
    recommended: recommendedResult,
    overallVerdict,
    summary: `[HEURISTIC MODE] Evaluated utilizing built-in offline parser. ${overallVerdict === "Fully Compatible" ? "Your PC easily has the capacity to run this game at high performance." : "Your PC meets the base parameters, but we suggest lowering settings to protect frame-time stability."}`
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { requirements, userSpecs } = req.body;
    if (!requirements || !userSpecs) {
      res.status(400).json({ error: "Missing required properties 'requirements' or 'userSpecs'" });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      const fallbackResult = fallbackHeuristicComparison(requirements, userSpecs);
      res.status(200).json(fallbackResult);
      return;
    }

    const systemInstruction = `You are an expert PC Hardware and Gaming System Requirements Analyzer. Your job is to parse unstructured PC game requirements and compare them to the user's PC specifications.

You must analyze and decide whether each component (CPU, GPU, RAM, OS, Storage) meets or exceeds the game's Minimum and Recommended requirements.

Evaluation logic details:
- CPU: Ryzen 5 3600 > Core i5-6600K / Ryzen 5 1600. Ryzen 5 5600X > Ryzen 5 3600. Core i3-12100F is newer and faster than Core i7-4770. Evaluate based on relative hardware generations and performance.
- GPU: Nvidia RTX series (e.g. RTX 3060) is newer and supports higher directX feature level vs GTX series. GTX 1080 > GTX 1660 / GTX 1060. Graphics memories should match or exceed requirements.
- RAM: Strictly compare numbers. 16 GB > 8 GB, etc.
- OS: Windows 11 and Windows 10 are compatible with Windows 7/8/10. MacOS does not run Windows games easily unless specifies.
- Storage: Ensure user has sufficient storage remaining. Check SSD requirements where applicable.

Provide detailed and clear explanation 'reason' for each spec. If requirements for recommended or minimum are missing from the input text, mark that category as null in your response schema on those respective fields. Always format in clean, precise JSON.`;

    const prompt = `
Please compare the following Game Requirements against the User PC Specs.

--- Game Requirements ---
Minimum Requirements:
${requirements.minimum || "Not specified"}

Recommended Requirements:
${requirements.recommended || "Not specified"}

--- User PC Specs ---
Operating System: ${userSpecs.os}
Processor (CPU): ${userSpecs.cpu}
Graphics Card (GPU): ${userSpecs.gpu}
Memory (RAM): ${userSpecs.ram}
Dedicated/Integrated: ${userSpecs.gpuType || "Dedicated"}
Storage Remaining: ${userSpecs.storageFree || userSpecs.storage}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            minimum: {
              type: Type.OBJECT,
              properties: {
                pass: { type: Type.BOOLEAN },
                specs: {
                  type: Type.OBJECT,
                  properties: {
                    cpu: {
                      type: Type.OBJECT,
                      properties: {
                        required: { type: Type.STRING },
                        user: { type: Type.STRING },
                        pass: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                      },
                      required: ["required", "user", "pass", "reason"]
                    },
                    gpu: {
                      type: Type.OBJECT,
                      properties: {
                        required: { type: Type.STRING },
                        user: { type: Type.STRING },
                        pass: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                      },
                      required: ["required", "user", "pass", "reason"]
                    },
                    ram: {
                      type: Type.OBJECT,
                      properties: {
                        required: { type: Type.STRING },
                        user: { type: Type.STRING },
                        pass: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                      },
                      required: ["required", "user", "pass", "reason"]
                    },
                    os: {
                      type: Type.OBJECT,
                      properties: {
                        required: { type: Type.STRING },
                        user: { type: Type.STRING },
                        pass: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                      },
                      required: ["required", "user", "pass", "reason"]
                    },
                    storage: {
                      type: Type.OBJECT,
                      properties: {
                        required: { type: Type.STRING },
                        user: { type: Type.STRING },
                        pass: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                      },
                      required: ["required", "user", "pass", "reason"]
                    }
                  },
                  required: ["cpu", "gpu", "ram", "os", "storage"]
                }
              },
              required: ["pass", "specs"]
            },
            recommended: {
              type: Type.OBJECT,
              properties: {
                pass: { type: Type.BOOLEAN },
                specs: {
                  type: Type.OBJECT,
                  properties: {
                    cpu: {
                      type: Type.OBJECT,
                      properties: {
                        required: { type: Type.STRING },
                        user: { type: Type.STRING },
                        pass: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                      },
                      required: ["required", "user", "pass", "reason"]
                    },
                    gpu: {
                      type: Type.OBJECT,
                      properties: {
                        required: { type: Type.STRING },
                        user: { type: Type.STRING },
                        pass: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                      },
                      required: ["required", "user", "pass", "reason"]
                    },
                    ram: {
                      type: Type.OBJECT,
                      properties: {
                        required: { type: Type.STRING },
                        user: { type: Type.STRING },
                        pass: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                      },
                      required: ["required", "user", "pass", "reason"]
                    },
                    os: {
                      type: Type.OBJECT,
                      properties: {
                        required: { type: Type.STRING },
                        user: { type: Type.STRING },
                        pass: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                      },
                      required: ["required", "user", "pass", "reason"]
                    },
                    storage: {
                      type: Type.OBJECT,
                      properties: {
                        required: { type: Type.STRING },
                        user: { type: Type.STRING },
                        pass: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING }
                      },
                      required: ["required", "user", "pass", "reason"]
                    }
                  },
                  required: ["cpu", "gpu", "ram", "os", "storage"]
                }
              },
              required: ["pass", "specs"]
            },
            overallVerdict: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: ["overallVerdict", "summary"]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("No response output text returned by Gemini");
    }

    res.status(200).json(JSON.parse(outputText.trim()));
  } catch (geminiError: any) {
    console.error("Gemini serverless requirements check failed. Falling back to heuristic:", geminiError);
    try {
      const { requirements, userSpecs } = req.body;
      const fallbackResult = fallbackHeuristicComparison(requirements, userSpecs);
      res.status(200).json(fallbackResult);
    } catch (criticalErr: any) {
      res.status(500).json({ error: "Failed to parse requirements comparison models" });
    }
  }
}
