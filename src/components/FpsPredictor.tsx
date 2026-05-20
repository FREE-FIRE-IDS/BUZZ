/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Gauge, CheckCircle2, AlertTriangle, Flame, Shield, PlayCircle, Zap } from "lucide-react";
import { Game, UserSpecs } from "../types";
import { checkGameCompatibility, GameCompatibility } from "../utils";
import { POPULAR_GPUS } from "../hardwareData";

interface FpsPredictorProps {
  game: Game;
  userSpecs: UserSpecs;
}

export default function FpsPredictor({ game, userSpecs }: FpsPredictorProps) {
  const [resolution, setResolution] = useState<"1080p" | "1440p" | "4K">("1080p");
  const [upscaling, setUpscaling] = useState<"native" | "balanced" | "performance" | "frame_gen">("native");

  // Get release year of target game to realistically adjust performance overheads
  const getReleaseYear = () => {
    if (!game.released) return 2021;
    const match = game.released.match(/^(\d{4})/);
    return match ? parseInt(match[1]) : 2021;
  };

  const getHardwareTierScore = () => {
    const gpuName = (userSpecs.gpu || "").toLowerCase();
    const cpuName = (userSpecs.cpu || "").toLowerCase();
    
    // 1. Search DB to grab its premium tier rank (1-10)
    let gpuTier = 5; // default fallback
    const matchedGpu = POPULAR_GPUS.find(g => gpuName.includes(g.name.toLowerCase()) || g.name.toLowerCase().includes(gpuName));
    if (matchedGpu) {
      gpuTier = matchedGpu.tier;
    } else {
      // Model matching
      if (gpuName.includes("4090") || gpuName.includes("5090")) gpuTier = 10;
      else if (gpuName.includes("4080") || gpuName.includes("7900") || gpuName.includes("7950")) gpuTier = 9;
      else if (gpuName.includes("4070") || gpuName.includes("3090") || gpuName.includes("3085") || gpuName.includes("3080") || gpuName.includes("7800")) gpuTier = 8;
      else if (gpuName.includes("3070") || gpuName.includes("4060") || gpuName.includes("6800") || gpuName.includes("6700") || gpuName.includes("7700")) gpuTier = 7;
      else if (gpuName.includes("3060") || gpuName.includes("2080") || gpuName.includes("6600") || gpuName.includes("6650") || gpuName.includes("a770")) gpuTier = 6;
      else if (gpuName.includes("2060") || gpuName.includes("3050") || gpuName.includes("1080") || gpuName.includes("5700") || gpuName.includes("a580")) gpuTier = 5;
      else if (gpuName.includes("1660") || gpuName.includes("1070") || gpuName.includes("5600") || gpuName.includes("590") || gpuName.includes("580") || gpuName.includes("a380")) gpuTier = 4;
      else if (gpuName.includes("1060") || gpuName.includes("1650") || gpuName.includes("5500") || gpuName.includes("570") || gpuName.includes("480")) gpuTier = 3;
      else if (gpuName.includes("1050") || gpuName.includes("560") || gpuName.includes("460") || gpuName.includes("960") || gpuName.includes("950") || gpuName.includes("750")) gpuTier = 2;
      else if (gpuName.includes("intel") || gpuName.includes("uhd") || gpuName.includes("hd ") || gpuName.includes("iris") || gpuName.includes("gt 710")) gpuTier = 1;
    }

    // Convert tier to rating base points (10-100)
    let score = gpuTier * 10;

    // CPU power multiplier score
    if (cpuName.includes("14900") || cpuName.includes("7950") || cpuName.includes("7800x3d") || cpuName.includes("9950")) {
      score += 8;
    } else if (cpuName.includes("i9") || cpuName.includes("ryzen 9")) {
      score += 5;
    } else if (cpuName.includes("i7") || cpuName.includes("ryzen 7")) {
      score += 2;
    } else if (cpuName.includes("i3") || cpuName.includes("dual-core") || cpuName.includes("4 cores") || cpuName.includes("core 2") || cpuName.includes("athlon") || cpuName.includes("pentium")) {
      score -= 10;
    }

    // System Memory modifier
    const ramVal = parseInt(userSpecs.ram) || 16;
    if (ramVal >= 32) score += 3;
    if (ramVal <= 8) score -= 14;

    return Math.max(5, Math.min(100, score));
  };

  const calculateFps = (setting: "low" | "medium" | "high" | "ultra") => {
    const rawHardwareScore = getHardwareTierScore();
    const releaseYear = getReleaseYear();
    const comp = checkGameCompatibility(game.name, userSpecs);

    // Release tax scaling
    let gameTax = 1.0;
    if (releaseYear >= 2024) gameTax = 0.55;     // AW2, Hellblade 2, high demand modern titles
    else if (releaseYear >= 2022) gameTax = 0.70;  // Very heavy titles
    else if (releaseYear >= 2019) gameTax = 0.90;  // Mid legacy titles
    else gameTax = 1.35;                           // Old lightweight titles

    // Base targets for presets
    let settingBase = 60;
    switch (setting) {
      case "low": settingBase = 120; break;
      case "medium": settingBase = 85; break;
      case "high": settingBase = 60; break;
      case "ultra": settingBase = 42; break;
    }

    // Benchmark rating multiplier score
    const scaleFactor = rawHardwareScore / 55; // 55 is baseline rating score
    let predictedAvg = settingBase * scaleFactor * gameTax;

    // Scale with compatibility limits
    predictedAvg *= comp.fpsMultiplier;

    // Enforce strict upper physical limits for incompatible or unplayable states
    if (!comp.compatible || comp.status === "incompatible") {
      predictedAvg = Math.min(5, predictedAvg);
    } else if (comp.status === "unplayable") {
      predictedAvg = Math.min(18, predictedAvg);
    }

    // Resolution Scaling Tax
    if (resolution === "1440p") {
      predictedAvg *= 0.68;
    } else if (resolution === "4K") {
      predictedAvg *= 0.40;
    }

    // Tech Upscaling boosts
    if (setting !== "low" || upscaling === "frame_gen") {
      if (upscaling === "balanced") {
        predictedAvg *= 1.25;
      } else if (upscaling === "performance") {
        predictedAvg *= 1.40;
      } else if (upscaling === "frame_gen") {
        const supportsFrameGen = userSpecs.gpu.toLowerCase().includes("rtx 40") || userSpecs.gpu.toLowerCase().includes("rtx 35") || userSpecs.gpu.toLowerCase().includes("rtx 30") || userSpecs.gpu.toLowerCase().includes("rx 7") || userSpecs.gpu.toLowerCase().includes("rx 6");
        if (supportsFrameGen && comp.compatible && comp.status !== "unplayable") {
          predictedAvg *= 1.70;
        } else {
          predictedAvg *= 1.15;
        }
      }
    }

    // Force strict low bounds for warnings
    if (!comp.compatible || comp.status === "incompatible") {
      predictedAvg = Math.max(1, Math.min(5, predictedAvg));
    }

    // Bound realistic min/max ranges
    const finalAvg = Math.max(comp.compatible ? 5 : 2, Math.round(predictedAvg));
    const final1PercentLow = Math.max(comp.compatible ? 3 : 1, Math.round(finalAvg * 0.72));

    return { avg: finalAvg, low: final1PercentLow, compatibility: comp };
  };

  const getPlayabilityImpact = (avgFps: number, compatibility: GameCompatibility) => {
    if (!compatibility.compatible) {
      return {
        label: "NOT INTERNALLY COMPATIBLE",
        color: "text-rose-500 bg-rose-500/10 border-rose-550/40",
        description: compatibility.reason,
        icon: <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse animate-flash shrink-0" />
      };
    }

    if (compatibility.status === "unplayable" || avgFps < 25) {
      return {
        label: "UNPLAYABLE LAG SHIELD",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/35",
        description: compatibility.status === "unplayable" ? compatibility.reason : "Extremely heavy performance choke. Frame times will feel incredibly choppy.",
        icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
      };
    }

    if (avgFps >= 120) {
      return {
        label: "Competitive Fluidity",
        color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        description: "Absolute smooth gameplay suitable for esports high refresh rate monitors.",
        icon: <Flame className="w-5 h-5 text-amber-450 animate-bounce shrink-0" />
      };
    }
    if (avgFps >= 60) {
      return {
        label: "Perfectly Smooth",
        color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        description: "Optimal console-exceeding target PC performance with absolute stability.",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      };
    }
    if (avgFps >= 30) {
      return {
        label: "Console Playable",
        color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        description: "Fully playable. Micro stutters may occur occasionally in intense fights.",
        icon: <Shield className="w-5 h-5 text-blue-400 shrink-0" />
      };
    }
    return {
      label: "Heavily Lagging",
      color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
      description: "Severe frame drops. We advise lowering your output resolution or enabling upscaling.",
      icon: <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse shrink-0" />
    };
  };

  // Estimate virtual VRAM requirement loads for different levels
  const getEncounteredVramUsage = (setting: string) => {
    let base = 3.5; // low base GB loads
    if (setting === "medium") base = 5.2;
    else if (setting === "high") base = 7.4;
    else if (setting === "ultra") base = 11.2;

    if (resolution === "1440p") base += 1.2;
    if (resolution === "4K") base += 3.5;

    return parseFloat(base.toFixed(1));
  };

  const userVramGB = parseInt(userSpecs.vram || "8") || 8;
  const showVramWarning = (setting: string) => {
    const requiredVram = getEncounteredVramUsage(setting);
    return userVramGB < requiredVram;
  };

  return (
    <div className="space-y-6" id="fps-predictor-view">
      {/* Parameter Control Bar */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 leading-normal">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            Performance Simulator Options
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            Adjust virtual resolution output and technology upscalers to observe responsive frame rates calculations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Resolution Options */}
          <div className="space-y-1">
            <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">Output Resolution</div>
            <div className="bg-slate-900 border border-slate-800 p-0.5 rounded-xl flex">
              {(["1080p", "1440p", "4K"] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    resolution === res 
                      ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>

          {/* Upscalers (DLSS / FSR Selection) */}
          <div className="space-y-1">
            <div className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">Scaling & Frame Gen</div>
            <div className="bg-slate-900 border border-slate-800 p-0.5 rounded-xl flex">
              {[
                { id: "native", label: "Native" },
                { id: "balanced", label: "FSR Balanced" },
                { id: "performance", label: "DLSS Perf" },
                { id: "frame_gen", label: "Frame Gen AI" }
              ].map((scaler) => (
                <button
                  key={scaler.id}
                  onClick={() => setUpscaling(scaler.id as any)}
                  className={`text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    upscaling === scaler.id 
                      ? "bg-emerald-500 text-slate-950 shadow-md font-extrabold" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {scaler.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Levels Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(["low", "medium", "high", "ultra"] as const).map((setting) => {
          const fps = calculateFps(setting);
          const playability = getPlayabilityImpact(fps.avg, fps.compatibility);
          const vramLoad = getEncounteredVramUsage(setting);
          const vramStutter = showVramWarning(setting);

          return (
            <div 
              key={setting}
              className={`rounded-2xl border p-5 bg-gradient-to-b relative overflow-hidden transition duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                setting === "high" 
                  ? "border-emerald-500/40 from-slate-900 via-slate-900 to-emerald-950/10 shadow-lg shadow-emerald-500/5" 
                  : "border-slate-800 from-slate-900 to-slate-900/60"
              }`}
            >
              {/* Feature highlight corner badge */}
              {setting === "high" && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[8px] font-black uppercase px-2.5 py-0.5 rounded-bl tracking-widest">
                  Standard Sweet-Spot
                </div>
              )}

              {/* Setting Name */}
              <div className="mb-4">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Preset Tier</span>
                <h4 className="text-base font-black text-white uppercase tracking-tight leading-none mt-0.5">
                  {setting} Presets
                </h4>
              </div>

              {/* Framerates Performance Display */}
              <div className="mb-5 flex items-baseline gap-2 bg-slate-950/30 p-4 border border-slate-850/60 rounded-xl shadow-inner text-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-extrabold tracking-tight text-white font-mono block">
                    {fps.avg}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Avg FPS
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-slate-800 mx-1 self-center"></div>
                <div className="text-center">
                  <span className="text-xl font-bold tracking-tight text-slate-400 font-mono block">
                    {fps.low}
                  </span>
                  <span className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest font-mono">
                    1% Low
                  </span>
                </div>
              </div>

              {/* Playability Status Text */}
              <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${playability.color} mb-3.5`}>
                <div className="shrink-0 mt-0.5">{playability.icon}</div>
                <div>
                  <div className="font-extrabold font-mono text-[10px] uppercase leading-none">{playability.label}</div>
                  <p className="text-[10px] text-slate-300 mt-1 leading-relaxed leading-normal">{playability.description}</p>
                </div>
              </div>

              {/* Resource specifications loads */}
              <div className="space-y-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Req. Video RAM:</span>
                  <span className={vramStutter ? "text-rose-450 font-bold" : "text-slate-300"}>
                    {vramLoad} GB
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>GPU Core load:</span>
                  <span className="text-emerald-400 font-bold">Stable</span>
                </div>

                {vramStutter ? (
                  <div className="mt-2.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[9px] text-rose-400 leading-snug flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>VRAM limit hit! Texture stutters expected</span>
                  </div>
                ) : (
                  <div className="mt-2.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 leading-snug flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Memory bandwidth safe</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
