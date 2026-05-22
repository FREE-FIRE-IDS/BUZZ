/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSpecs } from "./types";
import { POPULAR_GPUS, POPULAR_CPUS, VRAM_OPTIONS, DDR_OPTIONS, DIRECTX_OPTIONS } from "./hardwareData";

// Detect system specifications via browser APIs (dynamic and profiled benchmark mapping)
export function benchmarkCpuSpeed(): { speedScore: number; era: "modern" | "mid" | "legacy" } {
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  let x = 0.0001;
  // Execution loop to profile modern vs legacy single-core architectures
  for (let i = 0; i < 1500000; i++) {
    x += Math.sqrt(i) * Math.sin(i);
  }
  const duration = (typeof performance !== "undefined" ? performance.now() : Date.now()) - start;
  
  // Real-time hardware performance classification
  let era: "modern" | "mid" | "legacy" = "modern";
  if (duration > 15) {
    era = "legacy"; // Legacy Core 2 / Sandy Bridge / Haswell (takes > 15ms)
  } else if (duration > 6) {
    era = "mid";    // Mid-gen coffee lake / Ryzen Zen 2 (takes 6-15ms)
  }
  return { speedScore: duration, era };
}

export interface ParsedCpu {
  name: string;
  cores: number;
  tier: number;
  brand: "Intel" | "AMD" | "Apple" | "Generic";
  generation: string;
}

export function parseCpuSpecs(rawName: string): ParsedCpu {
  let name = (rawName || "").replace(/@.+/gi, "").replace(/\(R\)/gi, "").replace(/\(TM\)/gi, "").replace(/\s+/g, " ").trim();
  let lower = name.toLowerCase();
  
  // Clean empty or generic cases or if it's missing
  const isGeneric = !name || lower === "processor" || lower === "cpu" || lower === "generic" || lower === "unknown" || lower.includes("generic cpu") || lower.includes("intel processor") || lower.includes("amd processor");
  
  if (isGeneric) {
    const coresCount = navigator.hardwareConcurrency || 4;
    if (coresCount <= 4) {
      name = `Estimated: Low-tier CPU (like i3 / old Ryzen 3) (${coresCount} Cores)`;
    } else if (coresCount === 5 || coresCount === 6) {
      name = `Estimated: Mid-range CPU (like i5 / Ryzen 5) (${coresCount} Cores)`;
    } else {
      name = `Estimated: High-tier CPU (like i7 / Ryzen 7 / Ryzen 9) (${coresCount} Cores)`;
    }
    lower = name.toLowerCase();
  }

  let brand: "Intel" | "AMD" | "Apple" | "Generic" = "Generic";
  if (lower.includes("intel")) brand = "Intel";
  else if (lower.includes("amd") || lower.includes("ryzen")) brand = "AMD";
  else if (lower.includes("apple") || lower.includes("m1") || lower.includes("m2") || lower.includes("m3") || lower.includes("m4")) brand = "Apple";

  let cores = 4;
  const coreMatch = name.match(/(\d+)\s*Cores/i);
  if (coreMatch) {
    cores = parseInt(coreMatch[1]);
  } else {
    if (lower.includes("dual-core") || lower.includes("dual core") || lower.includes("duo") || lower.includes(" 2 cores")) cores = 2;
    else if (lower.includes("quad-core") || lower.includes("quad core") || lower.includes("quad") || lower.includes(" 4 cores")) cores = 4;
    else if (lower.includes("6-core") || lower.includes("6 core") || lower.includes("hexa") || lower.includes(" 6 cores")) cores = 6;
    else if (lower.includes("8-core") || lower.includes("8 core") || lower.includes("octa") || lower.includes(" 8 cores")) cores = 8;
    else if (lower.includes("12-core") || lower.includes("12 core") || lower.includes(" 12 cores")) cores = 12;
    else if (lower.includes("16-core") || lower.includes("16 core") || lower.includes(" 16 cores")) cores = 16;
    else if (lower.includes("24-core") || lower.includes("24 core") || lower.includes(" 24 cores")) cores = 24;
    else {
      if (lower.includes("9950") || lower.includes("7950") || lower.includes("5950") || lower.includes("3950")) cores = 16;
      else if (lower.includes("9900x") || lower.includes("7900x") || lower.includes("5900x") || lower.includes("3900x")) cores = 12;
      else if (lower.includes("14900") || lower.includes("13900") || lower.includes("285k")) cores = 24;
      else if (lower.includes("14700") || lower.includes("265k")) cores = 20;
      else if (lower.includes("13700") || lower.includes("12900")) cores = 16;
      else if (lower.includes("12700") || lower.includes("13600") || lower.includes("14600") || lower.includes("245k")) cores = 12;
      else if (lower.includes("12600") || lower.includes("12400") || lower.includes("13400") || lower.includes("11400") || lower.includes("10400")) cores = 6;
      else if (lower.includes("ryzen 9")) cores = 12;
      else if (lower.includes("ryzen 7") || lower.includes("7800x3d") || lower.includes("5800")) cores = 8;
      else if (lower.includes("ryzen 5") || lower.includes("5600") || lower.includes("3600")) cores = 6;
      else if (lower.includes("ryzen 3") || lower.includes("3100") || lower.includes("3300")) cores = 4;
      else if (lower.includes("i9")) cores = 10;
      else if (lower.includes("i7")) cores = 8;
      else if (lower.includes("i5")) cores = 6;
      else if (lower.includes("i3")) cores = 4;
      else if (lower.includes("pentium") || lower.includes("celeron") || lower.includes("core 2") || lower.includes("e8400") || lower.includes("e6600")) cores = 2;
    }
  }

  let tier = 5;
  if (lower.includes("ultra-tier") || lower.includes("ultra tier")) {
    tier = 10;
  } else if (lower.includes("high-tier") || lower.includes("high-end") || (lower.includes("estimated") && (lower.includes("i9") || lower.includes("i7") || lower.includes("ryzen 7") || lower.includes("ryzen 9")))) {
    tier = cores >= 12 ? 9 : 8;
  } else if (lower.includes("mid-range") || lower.includes("mid-tier") || (lower.includes("estimated") && (lower.includes("i5") || lower.includes("ryzen 5")))) {
    tier = 7;
  } else if (lower.includes("low-tier") || lower.includes("low-range") || lower.includes("entry-level") || (lower.includes("estimated") && (lower.includes("i3") || lower.includes("ryzen 3")))) {
    tier = 4;
  } else if (brand === "Apple") {
    if (lower.includes("ultra")) tier = 10;
    else if (lower.includes("max")) tier = 9;
    else if (lower.includes("pro")) tier = 8;
    else tier = 6;
  } else if (brand === "AMD") {
    if (lower.includes("9950") || lower.includes("9900") || lower.includes("7950") || lower.includes("7800x3d")) {
      tier = 10;
    } else if (lower.includes("9700") || lower.includes("7900") || lower.includes("5950") || lower.includes("5900") || lower.includes("5800x3d")) {
      tier = 9;
    } else if (lower.includes("7700") || lower.includes("9600") || lower.includes("5800") || lower.includes("5700x3d") || lower.includes("8700g")) {
      tier = 8;
    } else if (lower.includes("7600") || lower.includes("5700") || lower.includes("5600x") || lower.includes("3900")) {
      tier = 7;
    } else if (lower.includes("5600") || lower.includes("3800") || lower.includes("3700") || lower.includes("4500")) {
      tier = 6;
    } else if (lower.includes("3600") || lower.includes("2700") || lower.includes("1700") || lower.includes("2600") || lower.includes("1600")) {
      tier = 5;
    } else if (lower.includes("1500") || lower.includes("1400") || lower.includes("1300") || lower.includes("1200")) {
      tier = 4;
    } else if (lower.includes("fx-8") || lower.includes("fx-9") || lower.includes("fx-6")) {
      tier = 3;
    } else if (lower.includes("fx-4") || lower.includes("phenom")) {
      tier = 2;
    } else {
      tier = 1;
    }
  } else if (brand === "Intel") {
    const isUltra = lower.includes("ultra");
    if (isUltra) {
      if (lower.includes("285") || lower.includes("265")) tier = 10;
      else tier = 8;
    } else {
      const matchGen = lower.match(/(?:i3|i5|i7|i9)[-\s]+(\d+)/);
      if (matchGen) {
        const rawModel = matchGen[1];
        let genNum = parseInt(rawModel, 10);
        if (rawModel.length === 5) {
          genNum = Math.floor(genNum / 1000);
        } else if (rawModel.length === 4) {
          if (rawModel.startsWith("11") || rawModel.startsWith("10")) {
            genNum = Math.floor(genNum / 100);
          } else {
            genNum = Math.floor(genNum / 1000);
          }
        } else if (rawModel.length === 3) {
          genNum = 1;
        }

        if (genNum >= 200) {
          tier = genNum >= 260 ? 10 : 8;
        } else if (genNum >= 14) {
          tier = lower.includes("i9") ? 10 : lower.includes("i7") ? 9 : lower.includes("i5") ? 8 : 6;
        } else if (genNum === 13) {
          tier = lower.includes("i9") ? 10 : lower.includes("i7") ? 9 : lower.includes("i5") ? 8 : 6;
        } else if (genNum === 12) {
          tier = lower.includes("i9") ? 9 : lower.includes("i7") ? 8 : lower.includes("i5") ? 7 : 5;
        } else if (genNum === 11) {
          tier = lower.includes("i9") ? 8 : lower.includes("i7") ? 7 : lower.includes("i5") ? 6 : 4;
        } else if (genNum === 10) {
          tier = lower.includes("i9") ? 8 : lower.includes("i7") ? 7 : lower.includes("i5") ? 5 : 4;
        } else if (genNum === 9) {
          tier = lower.includes("i9") ? 7 : lower.includes("i7") ? 6 : lower.includes("i5") ? 5 : 3;
        } else if (genNum === 8) {
          tier = lower.includes("i7") ? 6 : lower.includes("i5") ? 4 : 3;
        } else if (genNum === 7) {
          tier = lower.includes("i7") ? 4 : lower.includes("i5") ? 3 : 2;
        } else if (genNum === 6) {
          tier = lower.includes("i7") ? 4 : lower.includes("i5") ? 3 : 2;
        } else if (genNum === 4 || genNum === 5) {
          tier = lower.includes("i7") ? 3 : lower.includes("i5") ? 2 : 1;
        } else if (genNum === 3) {
          tier = lower.includes("i7") ? 2 : lower.includes("i5") ? 2 : 1;
        } else if (genNum === 2) {
          tier = lower.includes("i7") ? 2 : lower.includes("i5") ? 2 : 1; // i3 2nd gen is tier 1!
        } else {
          tier = 1;
        }
      } else {
        if (lower.includes("14900") || lower.includes("13900") || lower.includes("14700")) tier = 10;
        else if (lower.includes("12900") || lower.includes("13700") || lower.includes("12700")) tier = 9;
        else if (lower.includes("12600") || lower.includes("13600") || lower.includes("14600") || lower.includes("13500")) tier = 8;
        else if (lower.includes("12400") || lower.includes("13400") || lower.includes("14400") || lower.includes("11900") || lower.includes("10900")) tier = 7;
        else if (lower.includes("11700") || lower.includes("10700") || lower.includes("11600") || lower.includes("1065") || lower.includes("10600")) tier = 6;
        else if (lower.includes("9900") || lower.includes("9700") || lower.includes("8700") || lower.includes("12100")) tier = 5;
        else if (lower.includes("9400") || lower.includes("8400") || lower.includes("10400") || lower.includes("11400") || lower.includes("10100")) tier = 4;
        else if (lower.includes("7700") || lower.includes("6750") || lower.includes("6700") || lower.includes("4790") || lower.includes("4770")) tier = 3;
        else if (lower.includes("3770") || lower.includes("2600") || lower.includes("2500") || lower.includes("4590") || lower.includes("4460") || lower.includes("6600") || lower.includes("7600")) tier = 2;
        else if (lower.includes("2100") || lower.includes("3220") || lower.includes("pentium") || lower.includes("celeron") || lower.includes("core 2")) tier = 1;
        else {
          tier = 1;
        }
      }
    }
  }

  // Generation string helper
  let generation = "Legacy Core Series";
  if (lower.includes("estimated") || lower.includes("est-")) {
    if (lower.includes("high-tier") || lower.includes("high-end")) {
      generation = "Estimated High-End Generation";
    } else if (lower.includes("mid-range") || lower.includes("mid-tier")) {
      generation = "Estimated Mid-Range Generation";
    } else {
      generation = "Estimated Low-Tier Generation";
    }
  } else if (brand === "Intel") {
    if (lower.includes("ultra")) generation = "Intel Core Ultra (Gen 15)";
    else {
      const gMatch = lower.match(/(?:i3|i5|i7|i9)[-\s]+(\d+)/);
      if (gMatch) {
        const rawVal = gMatch[1];
        let val = parseInt(rawVal, 10);
        if (rawVal.length === 5) {
          val = Math.floor(val / 1000);
        } else if (rawVal.length === 4) {
          if (rawVal.startsWith("11") || rawVal.startsWith("10")) {
            val = Math.floor(val / 100);
          } else {
            val = Math.floor(val / 1000);
          }
        } else if (rawVal.length === 3) {
          val = 1;
        }

        if (val >= 14000 || val === 14) generation = "Intel 14th Gen (Raptor Lake-R)";
        else if (val >= 13000 || val === 13) generation = "Intel 13th Gen (Raptor Lake)";
        else if (val >= 12000 || val === 12) generation = "Intel 12th Gen (Alder Lake)";
        else if (val >= 11000 || val === 11) generation = "Intel 11th Gen (Rocket Lake)";
        else if (val >= 10000 || val === 10) generation = "Intel 10th Gen (Comet Lake)";
        else if (val >= 9000 || val === 9) generation = "Intel 9th Gen (Coffee Lake-R)";
        else if (val >= 8000 || val === 8) generation = "Intel 8th Gen (Coffee Lake)";
        else if (val >= 7000 || val === 7) generation = "Intel 7th Gen (Kaby Lake)";
        else if (val >= 6000 || val === 6) generation = "Intel 6th Gen (Skylake)";
        else if (val >= 4000 || val === 4) generation = "Intel 4th & 5th Gen (Haswell)";
        else if (val >= 3000 || val === 3) generation = "Intel 2nd & 3rd Gen (Sandy/Ivy)";
        else if (val >= 2000 || val === 2) generation = "Intel 2nd & 3rd Gen (Sandy/Ivy)";
      } else {
        if (lower.includes("core 2") || lower.includes("duo")) generation = "Intel 1st Gen & Core 2 Duo";
        else if (lower.includes("3770") || lower.includes("2600") || lower.includes("2100") || lower.includes("3220")) generation = "Intel 2nd & 3rd Gen (Sandy/Ivy)";
        else if (lower.includes("4790") || lower.includes("4770") || lower.includes("4690")) generation = "Intel 4th & 5th Gen (Haswell)";
        else if (lower.includes("6700") || lower.includes("6600") || lower.includes("6100")) generation = "Intel 6th Gen (Skylake)";
        else if (lower.includes("7700") || lower.includes("7600")) generation = "Intel 7th Gen (Kaby Lake)";
        else if (lower.includes("8700") || lower.includes("8400")) generation = "Intel 8th Gen (Coffee Lake)";
      }
    }
  } else if (brand === "AMD") {
    if (lower.includes("ryzen")) {
      if (lower.includes("9950") || lower.includes("9900") || lower.includes("9800") || lower.includes("9700") || lower.includes("9600") || lower.includes("8500") || lower.includes("8600") || lower.includes("8700") || lower.includes("7950") || lower.includes("7900") || lower.includes("7800") || lower.includes("7700") || lower.includes("7600")) {
        generation = "AMD Ryzen Modern (7000/8050/9000)";
      } else {
        generation = "AMD Ryzen Classic (1000 to 5000)";
      }
    } else {
      generation = "AMD Legacy (FX / Athlon / Phenom)";
    }
  } else if (brand === "Apple") {
    generation = "Apple Silicon M1/M2/M3/M4";
  }

  return { name, cores, tier, brand, generation };
}

export interface ParsedGpu {
  name: string;
  vram: string;
  directx: string;
  tier: number;
  brand: "NVIDIA" | "AMD" | "Intel" | "Apple" | "Generic";
  isIntegrated: boolean;
}

export function parseGpuSpecs(rawName: string): ParsedGpu {
  const name = rawName.replace(/\(R\)/gi, "").replace(/\(TM\)/gi, "").replace(/\s+/g, " ").trim();
  const lower = name.toLowerCase();

  let brand: "NVIDIA" | "AMD" | "Intel" | "Apple" | "Generic" = "Generic";
  if (lower.includes("nvidia") || lower.includes("geforce") || lower.includes("rtx") || lower.includes("gtx") || lower.includes("titan")) brand = "NVIDIA";
  else if (lower.includes("amd") || lower.includes("radeon") || lower.includes("rx")) brand = "AMD";
  else if (lower.includes("intel") || lower.includes("arc") || lower.includes("uhd") || lower.includes("iris")) brand = "Intel";
  else if (lower.includes("apple") || lower.includes("metal")) brand = "Apple";

  let isIntegrated = lower.includes("intel") || lower.includes("uhd") || lower.includes("hd graphics") || lower.includes("iris") || lower.includes("vega 3") || lower.includes("vega 8") || lower.includes("vega 11") || lower.includes("radeon(tm)") || lower.includes("apple") || lower.includes("gt 710") || lower.includes("gt 730") || lower.includes("gt 1030");

  let vram = "8 GB";
  const vramMatch = lower.match(/(\d+)\s*gb/);
  if (vramMatch) {
    vram = `${vramMatch[1]} GB`;
  } else {
    if (lower.includes("4090") || lower.includes("3095") || lower.includes("5090")) vram = "24 GB";
    else if (lower.includes("4080") || lower.includes("7900") || lower.includes("5080")) vram = "16 GB";
    else if (lower.includes("4070") || lower.includes("3080") || lower.includes("7800")) vram = "12 GB";
    else if (lower.includes("3070") || lower.includes("3065") || lower.includes("4060") || lower.includes("6800") || lower.includes("6700") || lower.includes("7700") || lower.includes("580") || lower.includes("590") || lower.includes("5700")) vram = "8 GB";
    else if (lower.includes("1060") || lower.includes("1660") || lower.includes("2060") || lower.includes("980") || lower.includes("970")) vram = "6 GB";
    else if (lower.includes("1050") || lower.includes("1650") || lower.includes("5500") || lower.includes("470") || lower.includes("570") || lower.includes("960")) vram = "4 GB";
    else if (lower.includes("gt 1030") || lower.includes("gt 730") || lower.includes("750 ti")) vram = "2 GB";
    else if (isIntegrated) vram = "Shared Video Memory";
  }

  let directx = "DirectX 12";
  if (lower.includes("rtx") || lower.includes("rx 5") || lower.includes("rx 6") || lower.includes("rx 7") || lower.includes("arc")) {
    directx = "DirectX 12 (Ultimate)";
  } else if (lower.includes("gtx 10") || lower.includes("gtx 9") || lower.includes("rx 4") || lower.includes("rx 500")) {
    directx = "DirectX 12 Features";
  } else if (lower.includes("gtx 7") || lower.includes("hd 7000")) {
    directx = "DirectX 11 (Standard)";
  }

  let tier = 5;
  if (lower.includes("4090") || lower.includes("3095") || lower.includes("5090")) tier = 10;
  else if (lower.includes("4080") || lower.includes("7900") || lower.includes("5080")) tier = 9;
  else if (lower.includes("4070") || lower.includes("3090") || lower.includes("3080") || lower.includes("7800")) tier = 8;
  else if (lower.includes("3070") || lower.includes("4060") || lower.includes("6800") || lower.includes("6700") || lower.includes("7700")) tier = 7;
  else if (lower.includes("3060") || lower.includes("2080") || lower.includes("6600") || lower.includes("6650") || lower.includes("a770")) tier = 6;
  else if (lower.includes("2060") || lower.includes("3050") || lower.includes("1080") || lower.includes("5700") || lower.includes("a580")) tier = 5;
  else if (lower.includes("1660") || lower.includes("1070") || lower.includes("5600") || lower.includes("590") || lower.includes("580") || lower.includes("a380")) tier = 4;
  else if (lower.includes("1060") || lower.includes("1650") || lower.includes("5500") || lower.includes("570") || lower.includes("480")) tier = 3;
  else if (lower.includes("1050") || lower.includes("560") || lower.includes("460") || lower.includes("960") || lower.includes("950") || lower.includes("750")) tier = 2;
  else if (isIntegrated) tier = 1;

  return { name, vram, directx, tier, brand, isIntegrated };
}

// Detect system specifications via browser APIs (synchronous baseline)
export function detectSystemSpecs(): UserSpecs {
  // Synchronous checks for storage support placeholder
  const hasStorageAPI = typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate;
  
  const specs: UserSpecs = {
    os: "Windows 10 64-bit",
    gpu: "Unknown GPU",
    cpu: "Estimated: Mid-range CPU (like i5 / Ryzen 5) (6 Cores)",
    ram: "16 GB",
    storage: hasStorageAPI ? "512 GB SSD" : "Storage detection not supported in browser",
    storageFree: hasStorageAPI ? "Calculating..." : "N/A",
    ramDdr: "DDR4 RAM",
    vram: "N/A",
    directx: "DirectX 12",
    gpuType: "Dedicated"
  };

  try {
    // 1. OS Detection via userAgent
    const ua = navigator.userAgent;
    if (ua.indexOf("Win") !== -1) {
      if (ua.indexOf("Windows NT 10.0") !== -1) specs.os = "Windows 11 64-bit";
      else specs.os = "Windows 10 64-bit";
    } else if (ua.indexOf("Mac") !== -1) {
      specs.os = "macOS Sequoia";
      specs.ramDdr = "Unified Memory";
      specs.vram = "Unified Apple Memory";
      specs.directx = "Metal/DirectX 12";
    } else if (ua.indexOf("Linux") !== -1) {
      specs.os = "Linux OS 64-bit";
    }

    // 2. RAM estimation via deviceMemory
    const ramGB = (navigator as any).deviceMemory;
    if (ramGB) {
      specs.ram = `${ramGB} GB`;
    }

    let detectedBrand: "Intel" | "AMD" | "Apple" | "Generic" = "Generic";

    // 3. GPU Detection via WebGL Debug Renderer Info
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as any);
    
    // Set default DirectX level based on WebGL/WebGL2
    if (gl) {
      const isWebGL2 = gl.getContextAttributes() !== null && gl instanceof WebGL2RenderingContext;
      specs.directx = isWebGL2 ? "DirectX 12 (Ultimate)" : "DirectX 12 Feature Level 11_1";
      
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if (renderer) {
          const lowerRenderer = renderer.toLowerCase();

          if (lowerRenderer.includes("intel")) {
            detectedBrand = "Intel";
          } else if (lowerRenderer.includes("amd") || lowerRenderer.includes("radeon")) {
            detectedBrand = "AMD";
          } else if (lowerRenderer.includes("apple") || lowerRenderer.includes("metal")) {
            detectedBrand = "Apple";
          }
          
          // Match standard GPUs dynamically from our database!
          let matched = false;
          for (const gpu of POPULAR_GPUS) {
            // Check if renderer mentions the GPU name parts
            const gpuWords = gpu.name.toLowerCase().replace("nvidia ", "").replace("amd ", "").replace("geforce ", "").replace("radeon ", "").split(" ");
            const matchesAll = gpuWords.every(word => lowerRenderer.includes(word));
            if (matchesAll) {
              specs.gpu = gpu.name;
              specs.vram = gpu.vram || "8 GB";
              specs.directx = gpu.directx || (isWebGL2 ? "DirectX 12 (Ultimate)" : "DirectX 12");
              matched = true;
              break;
            }
          }

          if (!matched) {
            // If fallback heuristic
            if (lowerRenderer.includes("rtx 40")) {
              specs.gpu = "NVIDIA GeForce RTX 4060";
              specs.vram = "8 GB";
              specs.directx = "DirectX 12 (Ultimate)";
            } else if (lowerRenderer.includes("rtx 30")) {
              specs.gpu = "NVIDIA GeForce RTX 3060";
              specs.vram = "12 GB";
              specs.directx = "DirectX 12 (Ultimate)";
            } else if (lowerRenderer.includes("gtx 10")) {
              specs.gpu = "NVIDIA GeForce GTX 1060";
              specs.vram = "6 GB";
              specs.directx = "DirectX 12";
            } else if (lowerRenderer.includes("radeon") || lowerRenderer.includes("amd")) {
              specs.gpu = "AMD Radeon RX 6605 XT";
              specs.vram = "8 GB";
              specs.directx = "DirectX 12 (Ultimate)";
            } else if (lowerRenderer.includes("apple") || lowerRenderer.includes("metal")) {
              specs.gpu = "Apple Integrated M-Series GPU";
              specs.vram = "Unified Apple Memory";
            } else {
              // Extract a clean string if possible
              const match = renderer.match(/(NVIDIA|AMD|Intel|Apple)[^,]+/i);
              specs.gpu = match ? match[0].trim() : "Intel Iris Xe Graphics";
              specs.vram = "4 GB";
            }
          }
        }
      }
    }

    // Adjust RAM generation based on OS and GPU
    if (specs.os.includes("macOS")) {
      specs.ramDdr = "Unified Memory";
    } else {
      const ramVal = parseInt(specs.ram) || 8;
      if (ramVal >= 32 || specs.gpu.includes("4070") || specs.gpu.includes("4080") || specs.gpu.includes("4090")) {
        specs.ramDdr = "DDR5 RAM";
      } else {
        specs.ramDdr = "DDR4 RAM";
      }
    }

    // 4. CPU Core detection combined with Speed Profiler
    const cores = navigator.hardwareConcurrency || 4;
    const speedInfo = benchmarkCpuSpeed();
    
    // Determine the estimated Brand based on useragent and OS
    let brandEst = detectedBrand;
    if (brandEst === "Generic") {
      if (specs.os.toLowerCase().includes("mac")) {
        brandEst = "Apple";
      } else {
        // Hybrid CPU Core indicator - Intel 12/13/14 Gen is typical for 10, 14, 20, 24, 28 cores
        if ([10, 14, 20, 24, 28].includes(cores)) {
          brandEst = "Intel";
        } else {
          brandEst = "Intel"; // Standard PC fallback
        }
      }
    }

    let estimatedCpu = "";
    if (brandEst === "Apple") {
      if (speedInfo.era === "modern") {
        estimatedCpu = cores >= 14 ? "Apple M4 Max" : "Apple M4";
      } else if (speedInfo.era === "mid") {
        estimatedCpu = cores >= 12 ? "Apple M2 Pro" : "Apple M2";
      } else {
        estimatedCpu = cores >= 10 ? "Apple M1 Pro" : "Apple M1";
      }
    } else if (brandEst === "AMD") {
      if (speedInfo.era === "modern") {
        if (cores >= 16) estimatedCpu = "AMD Ryzen 9 9950X";
        else if (cores >= 12) estimatedCpu = "AMD Ryzen 9 9900X";
        else if (cores >= 8) estimatedCpu = "AMD Ryzen 7 7800X3D";
        else estimatedCpu = "AMD Ryzen 5 7600X";
      } else if (speedInfo.era === "mid") {
        if (cores >= 12) estimatedCpu = "AMD Ryzen 9 3900X";
        else if (cores >= 8) estimatedCpu = "AMD Ryzen 7 3700X";
        else if (cores >= 6) estimatedCpu = "AMD Ryzen 5 3600";
        else estimatedCpu = "AMD Ryzen 3 3100";
      } else {
        if (cores >= 8) estimatedCpu = "AMD FX-8350";
        else if (cores >= 6) estimatedCpu = "AMD FX-6300";
        else estimatedCpu = "AMD FX-4300";
      }
    } else {
      // Default to Intel Core series
      if (speedInfo.era === "modern") {
        if (cores >= 24) estimatedCpu = "Intel Core i9-14900K";
        else if (cores >= 20) estimatedCpu = "Intel Core i7-14700K";
        else if (cores >= 14) estimatedCpu = "Intel Core i5-14600K";
        else if (cores >= 10) estimatedCpu = "Intel Core i5-13400F";
        else if (cores >= 6) estimatedCpu = "Intel Core i5-12400F";
        else estimatedCpu = "Intel Core i3-12100F";
      } else if (speedInfo.era === "mid") {
        if (cores >= 10) estimatedCpu = "Intel Core i9-10900K";
        else if (cores >= 8) estimatedCpu = "Intel Core i7-10700K";
        else if (cores >= 6) estimatedCpu = "Intel Core i5-10400F";
        else estimatedCpu = "Intel Core i3-10100";
      } else {
        if (cores >= 8) estimatedCpu = "Intel Core i7-4790K";
        else if (cores >= 4) estimatedCpu = "Intel Core i5-4590";
        else estimatedCpu = "Intel Core i3-2100";
      }
    }

    specs.cpu = `${estimatedCpu} (${cores} Cores)`;

    // 5. Detect dedicated vs integrated graphics (safe option fallback)
    const lowerGpu = specs.gpu.toLowerCase();
    const isIntegrated = 
      lowerGpu.includes("unknown") ||
      lowerGpu.includes("intel") || 
      lowerGpu.includes("uhd") || 
      lowerGpu.includes("hd graphics") || 
      lowerGpu.includes("iris") || 
      lowerGpu.includes("vega 3") || 
      lowerGpu.includes("vega 8") || 
      lowerGpu.includes("vega 11") || 
      lowerGpu.includes("radeon(tm)") || 
      lowerGpu.includes("apple") || 
      lowerGpu.includes("gt 710") || 
      lowerGpu.includes("gt 730") || 
      lowerGpu.includes("gt 1030") ||
      POPULAR_GPUS.find(g => g.name === specs.gpu)?.isIntegrated === true;
      
    specs.gpuType = isIntegrated ? "Integrated" : "Dedicated";

  } catch (e) {
    console.warn("Failed to detect system specs securely:", e);
  }

  return specs;
}

// Asynchronous storage API caller to fetch real remaining drive space percentage
export async function detectStorageSpace(): Promise<{ storage: string; storageFree: string } | null> {
  if (typeof navigator !== "undefined" && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota !== undefined && estimate.usage !== undefined) {
        const quotaBytes = estimate.quota;
        const usageBytes = estimate.usage || 0;
        const quotaGB = quotaBytes / (1024 * 1024 * 1024);
        
        let driveGB = 512;
        // Project sandbox quota onto standard manufacturing drive configurations
        if (quotaGB > 350) {
          driveGB = 1024; // 1 TB SSD
        } else if (quotaGB > 150) {
          driveGB = 512;  // 512 GB SSD
        } else if (quotaGB > 70) {
          driveGB = 256;  // 256 GB SSD
        } else {
          driveGB = 128;  // 128 GB SSD
        }
        
        const remainingPercentage = (quotaBytes - usageBytes) / quotaBytes;
        const freeRatio = Math.max(0.1, Math.min(0.99, remainingPercentage));
        const freeGB = (driveGB * freeRatio).toFixed(1);
        const usagePercent = Math.round((usageBytes / quotaBytes) * 100);
        
        return {
          storage: `${driveGB} GB SSD`,
          storageFree: `${freeGB} GB Available (${usagePercent}% Used)`
        };
      }
    } catch (e) {
      console.warn("Storage API calculation omitted:", e);
    }
  }
  return {
    storage: "Storage detection not supported in browser",
    storageFree: "N/A"
  };
}

export const HARDWARE_PRESETS = [
  {
    name: "Entry-Level / Budget PC",
    specs: {
      os: "Windows 10 64-bit",
      cpu: "Intel Core i3-10100F / AMD Ryzen 3 3100",
      gpu: "NVIDIA GeForce GTX 1050 Ti / AMD RX 570",
      ram: "8 GB",
      storage: "240 GB SSD"
    }
  },
  {
    name: "Standard Gaming PC (Mid-Range)",
    specs: {
      os: "Windows 11 64-bit",
      cpu: "Intel Core i5-12400F / AMD Ryzen 5 5600",
      gpu: "NVIDIA GeForce RTX 3060 / AMD RX 6600",
      ram: "16 GB",
      storage: "1 TB SSD"
    }
  },
  {
    name: "High-End Enthusiast Rig",
    specs: {
      os: "Windows 11 64-bit",
      cpu: "Intel Core i7-13700K / AMD Ryzen 7 7800X3D",
      gpu: "NVIDIA GeForce RTX 4070 Ti / AMD RX 7800 XT",
      ram: "32 GB",
      storage: "2 TB NVMe SSD"
    }
  },
  {
    name: "Ultimate Ultra Rig",
    specs: {
      os: "Windows 11 64-bit",
      cpu: "Intel Core i9-14900K / AMD Ryzen 9 7950X",
      gpu: "NVIDIA GeForce RTX 4090",
      ram: "64 GB",
      storage: "4 TB PCIe 4.0 SSD"
    }
  },
  {
    name: "Apple MacBook Pro (M2)",
    specs: {
      os: "macOS Ventura",
      cpu: "Apple M2 Unified Processor",
      gpu: "Apple Integrated 10-core GPU",
      ram: "16 GB",
      storage: "512 GB SSD"
    }
  }
];

// Helper to strip HTML tags if RAWG returns description with HTML tags
export function stripHtml(htmlStr?: string): string {
  if (!htmlStr) return "";
  return htmlStr.replace(/<\/?[^>]+(>|$)/g, "").trim();
}

export interface GameCompatibility {
  compatible: boolean;
  status: "perfect" | "playable" | "unplayable" | "incompatible";
  reason: string;
  fpsMultiplier: number;
}

export function checkGameCompatibility(gameName: string, specs: UserSpecs): GameCompatibility {
  const normGame = gameName.toLowerCase();
  const normGpu = (specs.gpu || "").toLowerCase();
  const normCpu = (specs.cpu || "").toLowerCase();
  const ramValue = parseInt(specs.ram) || 8;
  
  // Extract number from vram (e.g. "8 GB", "Unified Apple Memory")
  let vramValue = 4;
  if (specs.vram?.toLowerCase().includes("unified")) {
    vramValue = ramValue; // Apple unified memory matches system RAM capability
  } else {
    const vramMatch = specs.vram?.match(/(\d+)/);
    if (vramMatch) {
      vramValue = parseInt(vramMatch[1]);
    }
  }

  // List of ultra demanding high-end games
  const isMeshShaderHeavy = 
    normGame.includes("alan wake 2") || 
    normGame.includes("alan wake ii") || 
    normGame.includes("senua's saga") || 
    normGame.includes("hellblade 2") ||
    normGame.includes("black myth") || 
    normGame.includes("avatar: frontiers") ||
    normGame.includes("dragons dogma 2") ||
    normGame.includes("dragon's dogma 2") ||
    normGame.includes("cities: skylines 2") ||
    normGame.includes("cities: skylines ii");

  const isVeryHeavy = 
    isMeshShaderHeavy ||
    normGame.includes("cyberpunk") ||
    normGame.includes("starfield") ||
    normGame.includes("hogwarts") ||
    normGame.includes("the last of us") ||
    normGame.includes("red dead redemption 2") ||
    normGame.includes("plague tale: requiem") ||
    normGame.includes("forspoken") ||
    normGame.includes("returnal");

  // Mesh Shaders (DirectX 12 Ultimate Support Checked)
  // Non-compliant architectures: NVIDIA GTX 10-series/900/older, AMD Polaris/Vega/RDNA1/older (RX 5000 has DX12 FL12_1 but doesn't handle mesh shaders well/runs AW2 extremely poorly)
  if (isMeshShaderHeavy) {
    const isLegacyNvidia = normGpu.includes("gtx") && !normGpu.includes("1660") && !normGpu.includes("1650") && !normGpu.includes("1630");
    const isPolarisVega = normGpu.includes("rx 590") || normGpu.includes("rx 580") || normGpu.includes("rx 570") || normGpu.includes("rx 480") || normGpu.includes("rx 470") || normGpu.includes("vega") || normGpu.includes("r9") || normGpu.includes("hd ");
    const isIntelIntegrated = normGpu.includes("intel") || normGpu.includes("uhd") || normGpu.includes("hd ") || normGpu.includes("iris");

    if (isLegacyNvidia || isPolarisVega || isIntelIntegrated) {
      return {
        compatible: false,
        status: "incompatible",
        reason: `Incompatible: Lacks hardware Mesh Shading support. Your legacy GPU (${specs.gpu}) cannot boot this game properly. Expected speed under 10 FPS.`,
        fpsMultiplier: 0.1
      };
    }
  }

  // Integrated Graphics Check
  const isIntegratedGpu = normGpu.includes("intel") || normGpu.includes("uhd") || normGpu.includes("hd ") || normGpu.includes("iris") || normGpu.includes("gt 710") || normGpu.includes("gt 730");
  if (isVeryHeavy && isIntegratedGpu) {
    return {
      compatible: false,
      status: "incompatible",
      reason: `Incompatible: Modern demanding games cannot run on low-powered Integrated/Budget hardware (${specs.gpu}). Dedicated GPU required.`,
      fpsMultiplier: 0.08
    };
  }

  // High end game requirement: Low VRAM check
  if (isVeryHeavy) {
    if (vramValue <= 2) {
      return {
        compatible: false,
        status: "incompatible",
        reason: `Incompatible: Game requires at least 4-6 GB Dedicated VRAM. Your card has only ${specs.vram || "2 GB"}, which causes crash-on-launch or extreme texture overflow.`,
        fpsMultiplier: 0.12
      };
    }
    if (vramValue <= 4) {
      return {
        compatible: true,
        status: "unplayable",
        reason: `Warning: Insufficient Dedicated VRAM (${specs.vram || "4 GB"}). Game will lag extremely with severe blurry textures even on Low settings.`,
        fpsMultiplier: 0.35
      };
    }
  }

  // Extreme RAM / System Memory assessment
  if (isVeryHeavy && ramValue < 12) {
    return {
      compatible: true,
      status: "unplayable",
      reason: `System Memory Alert: ${specs.ram} is below the optimal 16 GB requirement for next-gen performance. High risk of micro-stuttering and asset loading pauses.`,
      fpsMultiplier: 0.55
    };
  }

  // Low CPU/Cores assessments
  const isLowCpu = normCpu.includes("core 2") || normCpu.includes("duo") || normCpu.includes("quad") || normCpu.includes("pentium") || normCpu.includes("athlon") || normCpu.includes("fx-4") || normCpu.includes("2 cores") || (normCpu.includes("i3") && !normCpu.includes("12") && !normCpu.includes("13") && !normCpu.includes("14"));
  if (isVeryHeavy && isLowCpu) {
    return {
      compatible: true,
      status: "unplayable",
      reason: `Processor Warning: Your legacy CPU (${specs.cpu}) lacks the multi-threaded throughput demanded by modern next-gen physics/logic threads. Expect massive Bottlenecks.`,
      fpsMultiplier: 0.45
    };
  }

  return {
    compatible: true,
    status: "perfect",
    reason: "Fully Compatible",
    fpsMultiplier: 1.0
  };
}
