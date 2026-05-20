/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, AlertCircle, HelpCircle, Cpu, Loader2, Sparkles, Layers, HardDrive, Monitor, Check } from "lucide-react";
import { Game, UserSpecs, RequirementsAnalysisResult, SpecCompareResult } from "../types";
import FpsPredictor from "./FpsPredictor";

interface AnalyzerModalProps {
  game: Game;
  userSpecs: UserSpecs;
  onClose: () => void;
}

export default function AnalyzerModal({ game, userSpecs, onClose }: AnalyzerModalProps) {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<RequirementsAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"minimum" | "recommended" | "fps">("minimum");

  // Format and grab PC platform system requirements from RAWG source platforms
  const getRawRequirements = () => {
    const pcPlat = game.platforms?.find(p => p.platform.slug === "pc");
    return {
      minimum: pcPlat?.requirements_en?.minimum || pcPlat?.requirements_ru?.minimum || "",
      recommended: pcPlat?.requirements_en?.recommended || pcPlat?.requirements_ru?.recommended || ""
    };
  };

  // Client-side fallback heuristic parser for when appraisal server fails or experiences connection limits
  const clientFallbackHeuristicComparison = (requirements: { minimum?: string; recommended?: string }, specs: UserSpecs) => {
    const releaseYear = game.released ? parseInt(game.released.split("-")[0]) : 2021;

    const getSpecsHeuristics = (reqText: string | undefined, isRecommended: boolean) => {
      let text = reqText || "";
      if (!text || text.trim() === "Not specified" || text.toLowerCase().includes("evaluate system")) {
        // Generate beautiful synthetic baseline hardware details matching the game's release era
        if (releaseYear >= 2023) {
          if (isRecommended) {
            text = "Processor (CPU): Intel Core i7-12700K / AMD Ryzen 7 5800X (8 Cores)\nGraphics (GPU): NVIDIA GeForce RTX 3070 / AMD Radeon RX 6700 XT (8 GB VRAM)\nMemory (RAM): 16 GB RAM\nStorage: 100 GB available space (SSD Recommended)\nOperating System: Windows 10/11 64-bit";
          } else {
            text = "Processor (CPU): Intel Core i5-10400 / AMD Ryzen 5 3600 (6 Cores)\nGraphics (GPU): NVIDIA GeForce GTX 1070 / AMD Radeon RX 5600 XT (6 GB VRAM)\nMemory (RAM): 12 GB RAM\nStorage: 80 GB available space\nOperating System: Windows 10 64-bit";
          }
        } else if (releaseYear >= 2018) {
          if (isRecommended) {
            text = "Processor (CPU): Intel Core i7-8700K / AMD Ryzen 5 3600 (6 Cores)\nGraphics (GPU): NVIDIA GeForce GTX 1080 / AMD Radeon RX 5700 XT (8 GB VRAM)\nMemory (RAM): 16 GB RAM\nStorage: 80 GB available space (SSD Recommended)\nOperating System: Windows 10 64-bit";
          } else {
            text = "Processor (CPU): Intel Core i5-6600K / AMD Ryzen 5 1600 (4 Cores)\nGraphics (GPU): NVIDIA GeForce GTX 1060 / AMD Radeon RX 580 (6 GB VRAM)\nMemory (RAM): 8 GB RAM\nStorage: 60 GB available space\nOperating System: Windows 10 64-bit";
          }
        } else {
          if (isRecommended) {
            text = "Processor (CPU): Intel Core i5-4690K / AMD Ryzen 3 1200 (4 Cores)\nGraphics (GPU): NVIDIA GeForce GTX 1050 Ti / AMD Radeon RX 560 (4 GB VRAM)\nMemory (RAM): 8 GB RAM\nStorage: 50 GB available space\nOperating System: Windows 7/8/10 64-bit";
          } else {
            text = "Processor (CPU): Intel Core i3-4130 / AMD FX-6300 (2 Cores)\nGraphics (GPU): NVIDIA GeForce GTX 750 Ti / AMD Radeon R9 270X (2 GB VRAM)\nMemory (RAM): 8 GB RAM\nStorage: 40 GB available space\nOperating System: Windows 7 64-bit";
          }
        }
      }

      const lowerReq = text.toLowerCase();
      
      // 1. Analyze Core Memory
      let requiredRam = isRecommended ? "16 GB" : "8 GB";
      const ramMatch = lowerReq.match(/(\d+)\s*(gb|mb)\s*ram/);
      if (ramMatch) {
         requiredRam = ramMatch[1] + " " + ramMatch[2].toUpperCase();
      }
      const userRamVal = parseInt(specs.ram) || 8;
      const reqRamVal = parseInt(requiredRam) || 8;
      const ramPass = userRamVal >= reqRamVal;

      // 2. Analyze Host OS
      const osPass = !specs.os.toLowerCase().includes("mac") || lowerReq.includes("mac");
      let requiredOS = isRecommended ? "Windows 10/11 64-bit" : "Windows 10 64-bit";
      if (lowerReq.includes("windows 11")) requiredOS = "Windows 11 64-bit";
      else if (lowerReq.includes("windows 10")) requiredOS = "Windows 10 64-bit";
      else if (lowerReq.includes("windows 7")) requiredOS = "Windows 7 64-bit";

      // 3. Analyze Storage Disk capacity
      let requiredStorage = "50 GB";
      const storageMatch = lowerReq.match(/(\d+)\s*(gb|mb)\s*(available|storage|space|disk)/);
      if (storageMatch) {
         requiredStorage = storageMatch[1] + " GB";
      }
      
      const userStorageVal = parseInt(specs.storageFree || specs.storage) || 245;
      const reqStorageVal = parseInt(requiredStorage) || 50;
      const storagePass = userStorageVal >= reqStorageVal;

      // 4. Extract and analyze CPU Core count
      let requiredCpu = isRecommended ? "Intel i7 / Ryzen 5 (6 Cores)" : "Intel i5 / Ryzen 3 (4 Cores)";
      const cpuMatch = text.match(/(processor|cpu):\s*([^,\.\n\r]+)/i);
      if (cpuMatch) requiredCpu = cpuMatch[2].trim();

      let reqCpuCores = isRecommended ? (releaseYear >= 2023 ? 8 : 6) : (releaseYear >= 2023 ? 6 : 4);
      if (lowerReq.includes("8 core") || lowerReq.includes("octa-core") || lowerReq.includes("8-core")) reqCpuCores = 8;
      else if (lowerReq.includes("6 core") || lowerReq.includes("hexa-core") || lowerReq.includes("6-core")) reqCpuCores = 6;
      else if (lowerReq.includes("4 core") || lowerReq.includes("quad-core") || lowerReq.includes("4-core")) reqCpuCores = 4;

      const userCpuCores = parseInt(specs.cpu.match(/(\d+)\s*Cores/i)?.[1] || "4");
      const cpuPass = userCpuCores >= reqCpuCores;

      // 5. Extract and analyze GPU VRAM specs and tier
      let requiredGpu = isRecommended ? "NVIDIA RTX 3060 / AMD RX 6600 (6-8 GB VRAM)" : "NVIDIA GTX 1050 Ti / AMD RX 570 (4 GB VRAM)";
      const gpuMatch = text.match(/(graphics|gpu|video card):\s*([^,\.\n\r]+)/i);
      if (gpuMatch) requiredGpu = gpuMatch[2].trim();

      let reqGpuVram = isRecommended ? (releaseYear >= 2023 ? 8 : 6) : (releaseYear >= 2023 ? 6 : 4);
      if (lowerReq.includes("8 gb vram") || lowerReq.includes("8gb vram") || lowerReq.includes("8 gb dedicated")) reqGpuVram = 8;
      else if (lowerReq.includes("6 gb vram") || lowerReq.includes("6gb") || lowerReq.includes("6 gb dedicated")) reqGpuVram = 6;
      else if (lowerReq.includes("4 gb vram") || lowerReq.includes("4gb") || lowerReq.includes("4 gb dedicated")) reqGpuVram = 4;
      else if (lowerReq.includes("2 gb vram") || lowerReq.includes("2gb") || lowerReq.includes("2 gb dedicated")) reqGpuVram = 2;

      const userGpuVramVal = parseInt(specs.vram) || 4;
      const gpuPass = userGpuVramVal >= reqGpuVram;

      return {
        pass: ramPass && storagePass && cpuPass && gpuPass,
        specs: {
          cpu: {
            required: requiredCpu,
            user: specs.cpu,
            pass: cpuPass,
            reason: cpuPass 
              ? `Your CPU has ${userCpuCores} Cores which meets or exceeds the required ${reqCpuCores} logical cores.`
              : `Your CPU has ${userCpuCores} Cores which is below the recommended ${reqCpuCores} Cores.`
          },
          gpu: {
            required: requiredGpu,
            user: `${specs.gpu} (${specs.vram} VRAM, ${specs.directx || "DirectX 12"})`,
            pass: gpuPass,
            reason: gpuPass 
              ? `Your graphics card VRAM (${userGpuVramVal} GB) is compatible with required shaders parameters.`
              : `Your VRAM (${userGpuVramVal} GB) is below game requirements of ${reqGpuVram} GB VRAM.`
          },
          ram: {
            required: requiredRam,
            user: specs.ram,
            pass: ramPass,
            reason: ramPass 
              ? `Your ${specs.ram} meets or exceeds the required ${requiredRam}.`
              : `Your ${specs.ram} is below requirements (${requiredRam}).`
          },
          os: {
            required: requiredOS,
            user: specs.os,
            pass: osPass,
            reason: osPass 
              ? `Your OS (${specs.os}) is fully compatible.`
              : `Mac OS/Linux is not natively supported by standard DirectX builds.`
          },
          storage: {
            required: requiredStorage,
            user: specs.storageFree || specs.storage,
            pass: storagePass,
            reason: storagePass
              ? `Remaining storage space (${specs.storageFree || specs.storage}) meets the required ${requiredStorage}.`
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
      summary: `[LOCAL DIAGNOSTIC MODE] Checked against release year (${releaseYear}) baseline specifications. ${overallVerdict === "Fully Compatible" ? "Your laptop/PC is fully prepared to run this title smoothly." : "Your PC meets the base rules, but we suggest lowering settings to protect frame-time stability."}`
    };
  };

  useEffect(() => {
    let active = true;
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const reqs = getRawRequirements();
        let fetchedData;

        try {
          const response = await fetch("/api/check-requirements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              requirements: {
                minimum: reqs.minimum || `Evaluate system requirements for running ${game.name} on PC at basic / 1080p 30fps settings.`,
                recommended: reqs.recommended || `Evaluate high level system requirements for running ${game.name} on PC at recommended / 1080p 60fps high settings.`
              },
              userSpecs: userSpecs
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          fetchedData = await response.json();
        } catch (fetchErr) {
          console.warn("Server appraisal failed. Engaging backup client-side diagnostic evaluator:", fetchErr);
          fetchedData = clientFallbackHeuristicComparison(
            {
              minimum: reqs.minimum || undefined,
              recommended: reqs.recommended || undefined
            },
            userSpecs
          );
        }

        if (active) {
          setAnalysis(fetchedData);
          if (fetchedData.recommended && !fetchedData.minimum) {
            setActiveTab("recommended");
          }
        }
      } catch (err: any) {
        console.error("Critical analysis retrieval failed:", err);
        if (active) {
          setError(err.message || "An error occurred while evaluating specifications.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchAnalysis();
    return () => {
      active = false;
    };
  }, [game, userSpecs]);

  // Determine overall status colors and headers
  const getVerdictStyles = (verdict: string) => {
    const lower = verdict.toLowerCase();
    if (lower.includes("fully compatible") || (lower.includes("pass") && !lower.includes("fail"))) {
      return {
        bg: "bg-emerald-500/10 border-emerald-500/30",
        text: "text-emerald-400",
        message: "Your PC easily runs this game!",
        badge: "bg-emerald-500 text-slate-950",
        icon: <CheckCircle className="w-12 h-12 text-emerald-400" />
      };
    }
    if (lower.includes("minimum pass")) {
      return {
        bg: "bg-amber-500/10 border-amber-500/30",
        text: "text-amber-400",
        message: "Compatible on Minimum Settings",
        badge: "bg-amber-500 text-slate-950",
        icon: <AlertCircle className="w-12 h-12 text-amber-500" />
      };
    }
    return {
      bg: "bg-rose-500/10 border-rose-500/30",
      text: "text-rose-400",
      message: "PC Spec Bottleneck Identified",
      badge: "bg-rose-500 text-white",
      icon: <XCircle className="w-12 h-12 text-rose-500" />
    };
  };

  const getHardwareRowIcon = (key: string) => {
    switch (key) {
      case "cpu": return <Cpu className="w-4 h-4 text-emerald-400" />;
      case "gpu": return <Layers className="w-4 h-4 text-sky-400" />;
      case "ram": return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case "os": return <Monitor className="w-4 h-4 text-rose-400" />;
      case "storage": return <HardDrive className="w-4 h-4 text-purple-400" />;
      default: return <Sparkles className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      {/* Container Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-white animate-in fade-in zoom-in duration-200" id="analyzer-modal">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <img
              src={game.background_image}
              alt={game.name}
              referrerPolicy="no-referrer"
              className="w-16 h-12 object-cover rounded-lg border border-slate-850"
            />
            <div>
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none mb-1">
                Diagnostic Analysis
              </div>
              <h2 className="text-lg font-black tracking-tight">{game.name}</h2>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-850 transition text-slate-400 hover:text-white"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
              <div className="text-center">
                <p className="text-sm font-extrabold tracking-wide text-slate-200">Evaluating PC Specifications...</p>
                <p className="text-xs text-slate-500 font-mono mt-1">Comparing Hardware architecture models via Smart AI Analyzer</p>
              </div>
            </div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 max-w-md mx-auto">
              <AlertCircle className="w-12 h-12 text-rose-500" />
              <p className="text-sm font-bold text-rose-400">Analysis Processing Issue</p>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-bold font-mono transition"
              >
                Close Window
              </button>
            </div>
          ) : (
            <>
              {/* Verdict Summary Header */}
              {analysis && (
                <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center gap-4 ${getVerdictStyles(analysis.overallVerdict).bg} transition`}>
                  {getVerdictStyles(analysis.overallVerdict).icon}
                  <div className="flex-1">
                    <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2 ${getVerdictStyles(analysis.overallVerdict).badge}`}>
                      {analysis.overallVerdict}
                    </span>
                    <h3 className="text-base font-black tracking-tight text-white">
                      {getVerdictStyles(analysis.overallVerdict).message}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1 font-medium italic opacity-90">
                      &ldquo;{analysis.summary}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Requirement Tabs */}
              <div className="flex border-b border-slate-800/85">
                {analysis?.minimum && (
                  <button
                    onClick={() => setActiveTab("minimum")}
                    className={`flex-1 pb-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
                      activeTab === "minimum"
                        ? "border-emerald-500 text-emerald-400 font-bold"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Minimum Requirements {analysis.minimum.pass ? "✅" : "❌"}
                  </button>
                )}
                {analysis?.recommended && (
                  <button
                    onClick={() => setActiveTab("recommended")}
                    className={`flex-1 pb-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
                      activeTab === "recommended"
                        ? "border-sky-500 text-sky-400 font-bold"
                        : "border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Recommended Requirements {analysis.recommended.pass ? "✅" : "❌"}
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("fps")}
                  className={`flex-1 pb-3 text-center text-xs font-black uppercase tracking-wider border-b-2 transition cursor-pointer ${
                    activeTab === "fps"
                      ? "border-amber-500 text-amber-400 font-bold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ⚡ Check FPS on All Settings
                </button>
              </div>

              {/* Requirements & FPS Content Area */}
              {activeTab === "fps" ? (
                <FpsPredictor game={game} userSpecs={userSpecs} />
              ) : (
                <div className="bg-slate-950/40 border border-slate-800/85 rounded-2xl overflow-hidden shadow-inner">
                  {analysis && analysis[activeTab as "minimum" | "recommended"] ? (
                    <div className="divide-y divide-slate-800/80">
                      {/* Render Hardware comparative rows */}
                      {Object.entries((analysis[activeTab as "minimum" | "recommended"] as any).specs).map(([key, specObj]: [string, any]) => (
                        <div key={key} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 group/row hover:bg-slate-900/20 transition duration-150">
                          {/* Hardware field header */}
                          <div className="flex items-center gap-3.5 min-w-[200px]">
                            <div className="p-2 rounded-xl bg-slate-850/80 border border-slate-800">
                              {getHardwareRowIcon(key)}
                            </div>
                            <div>
                              <div className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-slate-200 leading-none mb-1">
                                {key === "cpu" ? "Processor (CPU)" : key === "gpu" ? "Graphics (GPU)" : key === "ram" ? "Memory (RAM)" : key === "os" ? "Operating System" : "Internal Storage"}
                              </div>
                              <span className={`inline-block text-[9px] font-semibold font-mono px-2 py-0.5 rounded uppercase leading-none ${
                                specObj.pass 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}>
                                {specObj.pass ? "Comply" : "Upgrade Recommended"}
                              </span>
                            </div>
                          </div>

                          {/* Specs Comparison Details */}
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2.5 md:pb-0">
                            {/* Required */}
                            <div className="bg-slate-850/40 border border-slate-800/60 rounded-xl p-3">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Game Requirement</div>
                              <p className="text-xs font-semibold text-slate-300 font-mono truncate">{specObj.required || "Not listed"}</p>
                            </div>
                            
                            {/* User Equipped */}
                            <div className="bg-slate-850/40 border border-slate-800/60 rounded-xl p-3">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Equipped Hardware</div>
                              <p className="text-xs font-semibold text-slate-100 font-mono truncate">{specObj.user || "Not configured"}</p>
                            </div>
                          </div>

                          {/* Status diagnostic text */}
                          <div className="md:w-[220px] md:text-right text-xs leading-relaxed font-medium text-slate-400 border-l-2 md:border-l-0 border-slate-850 pl-3 md:pl-0">
                            {specObj.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center text-slate-400 text-xs font-mono">
                      No specific specifications available for this requirements classification.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky bottom-0 z-10">
          <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 leading-none">
            <Sparkles className="w-3 text-emerald-400" />
            Analysis evaluated live. Comparative data acts as guidance.
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold transition"
            type="button"
          >
            Finished Report
          </button>
        </div>

      </div>
    </div>
  );
}
