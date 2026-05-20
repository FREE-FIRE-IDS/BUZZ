/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Cpu, Layers, HardDrive, Edit2, Check, RefreshCw, CpuIcon, Eye, HelpCircle, Terminal, Copy } from "lucide-react";
import { UserSpecs } from "../types";
import { HARDWARE_PRESETS, detectSystemSpecs, detectStorageSpace } from "../utils";
import { POPULAR_GPUS, POPULAR_CPUS, VRAM_OPTIONS, DDR_OPTIONS, DIRECTX_OPTIONS } from "../hardwareData";

// Categorized processor generations grouping for older and newer series matching 1st to 14th Gen, Ryzen, M-series Silicon
const CPU_GENERATIONS = [
  {
    name: "Intel Core Ultra (Gen 15)",
    filter: (name: string) => name.toLowerCase().includes("ultra")
  },
  {
    name: "Intel 14th Gen (Raptor Lake-R)",
    filter: (name: string) => name.includes("i9-14") || name.includes("i7-14") || name.includes("i5-14") || name.includes("i3-14")
  },
  {
    name: "Intel 13th Gen (Raptor Lake)",
    filter: (name: string) => name.includes("i9-13") || name.includes("i7-13") || name.includes("i5-13") || name.includes("i3-13")
  },
  {
    name: "Intel 12th Gen (Alder Lake)",
    filter: (name: string) => name.includes("i9-12") || name.includes("i7-12") || name.includes("i5-12") || name.includes("i3-12")
  },
  {
    name: "AMD Ryzen Modern (7000/8050/9000)",
    filter: (name: string) => name.startsWith("AMD") && (name.includes("9950") || name.includes("9900") || name.includes("9700") || name.includes("9600") || name.includes("8700G") || name.includes("8600G") || name.includes("8500G") || name.includes("7950") || name.includes("7900") || name.includes("7800") || name.includes("7700") || name.includes("7600") || name.includes("7500"))
  },
  {
    name: "AMD Ryzen Classic (1000 to 5000)",
    filter: (name: string) => name.startsWith("AMD") && (name.includes("5950") || name.includes("5900") || name.includes("5800") || name.includes("5700") || name.includes("5600") || name.includes("5500") || name.includes("3950") || name.includes("3900") || name.includes("3800") || name.includes("3700") || name.includes("3600") || name.includes("3500") || name.includes("3300") || name.includes("3100") || name.includes("2700") || name.includes("2600") || name.includes("1600") || name.includes("1500") || name.includes("Ryzen"))
  },
  {
    name: "AMD Legacy (FX / Athlon / Phenom)",
    filter: (name: string) => name.startsWith("AMD") && !name.includes("Ryzen") && (name.includes("FX-") || name.includes("Athlon") || name.includes("Phenom"))
  },
  {
    name: "Apple Silicon M1/M2/M3",
    filter: (name: string) => name.includes("Apple M")
  }
];

const GPU_GENERATIONS = [
  {
    name: "NVIDIA RTX 50 & 40 Series",
    filter: (name: string) => name.includes("RTX 50") || name.includes("RTX 40")
  },
  {
    name: "NVIDIA RTX 30 Series",
    filter: (name: string) => name.includes("RTX 30")
  },
  {
    name: "NVIDIA RTX 20 Series",
    filter: (name: string) => name.includes("RTX 20")
  },
  {
    name: "NVIDIA GTX 16 Series",
    filter: (name: string) => name.includes("GTX 16")
  },
  {
    name: "NVIDIA GTX 10 Series",
    filter: (name: string) => name.includes("GTX 10")
  },
  {
    name: "NVIDIA GTX 900/700/600 Legacy",
    filter: (name: string) => name.includes("GTX 9") || name.includes("GTX 7") || name.includes("GTX 6") || name.includes("GTX 5")
  },
  {
    name: "NVIDIA GT Budget Lineup",
    filter: (name: string) => name.includes("GeForce GT ") || name.includes("9800 GT") || name.includes("8800 GT")
  },
  {
    name: "AMD RX 7000 Series",
    filter: (name: string) => name.includes("RX 79") || name.includes("RX 78") || name.includes("RX 77") || name.includes("RX 76")
  },
  {
    name: "AMD RX 6000 Series",
    filter: (name: string) => name.includes("RX 69") || name.includes("RX 68") || name.includes("RX 67") || name.includes("RX 66") || name.includes("RX 65") || name.includes("RX 64")
  },
  {
    name: "AMD RX 5000 & Vega/Polaris",
    filter: (name: string) => name.includes("RX 5700") || name.includes("RX 5600") || name.includes("RX 5500") || name.includes("Vega") || name.includes("RX 590") || name.includes("RX 580") || name.includes("RX 570") || name.includes("RX 480") || name.includes("RX 470") || name.includes("RX 560") || name.includes("RX 550") || name.includes("RX 460")
  },
  {
    name: "AMD Legacy R9 / R7 / HD",
    filter: (name: string) => name.includes("R9") || name.includes("R7") || name.includes("HD ") || name.includes("R9 Fury")
  },
  {
    name: "Intel Integrated & Iris Xe",
    filter: (name: string) => name.includes("Intel UHD") || name.includes("Intel HD") || name.includes("Iris") || name.includes("Intel Iris")
  }
];

interface SpecsFormProps {
  currentSpecs: UserSpecs;
  onSpecsChange: (specs: UserSpecs) => void;
}

export default function SpecsForm({ currentSpecs, onSpecsChange }: SpecsFormProps) {
  const [specs, setSpecs] = useState<UserSpecs>(currentSpecs);
  const [isEditing, setIsEditing] = useState(false);

  // PowerShell Specs Import Panel states
  const [showPsImporter, setShowPsImporter] = useState(false);
  const [psPasteText, setPsPasteText] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [importError, setImportError] = useState("");

  // Expanded generation collapsible tabs
  const [expandedCpuGen, setExpandedCpuGen] = useState<string | null>(null);
  const [expandedGpuGen, setExpandedGpuGen] = useState<string | null>(null);

  // Search filter and selection states for autocomplete dropdown predictive lists
  const [gpuInput, setGpuInput] = useState("");
  const [cpuInput, setCpuInput] = useState("");
  const [showGpuSuggestions, setShowGpuSuggestions] = useState(false);
  const [showCpuSuggestions, setShowCpuSuggestions] = useState(false);

  const gpuSuggestRef = useRef<HTMLDivElement>(null);
  const cpuSuggestRef = useRef<HTMLDivElement>(null);

  const psCommand = `chcp 65001 >$null; $cpu = (Get-CimInstance Win32_Processor).Name; $gpuObj = Get-CimInstance Win32_VideoController | Select-Object -First 1; $gpu = $gpuObj.Name; $ram = "$([Math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB)) GB"; $free = "$([Math]::Round((Get-CimInstance Win32_LogicalDisk -Filter \\"DeviceID='C:'\\").FreeSpace/1GB)) GB Remaining"; $tot = "$([Math]::Round((Get-CimInstance Win32_LogicalDisk -Filter \\"DeviceID='C:'\\").Size/1GB)) GB SSD"; echo \\"CYRI_SPECS: CPU=$cpu|GPU=$gpu|RAM=$ram|Storage=$tot|Free=$free\\"`;

  const copyPsCommand = () => {
    navigator.clipboard.writeText(psCommand);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  };

  const handleImportSpecs = () => {
    try {
      setImportError("");
      if (!psPasteText.trim()) {
        throw new Error("Pasted specs box is empty. Run and paste the PowerShell command first!");
      }

      let parsedCpu = "";
      let parsedGpu = "";
      let parsedRam = "";
      let parsedStorage = "";
      let parsedFree = "";

      // Check if it has CYRI_SPECS string
      const specLineMatch = psPasteText.match(/CYRI_SPECS:\s*(.+)/i);
      const textToParse = specLineMatch ? specLineMatch[1] : psPasteText;

      if (textToParse.includes("|") && textToParse.includes("=")) {
        const keyValues = textToParse.split("|");
        keyValues.forEach((item) => {
          const parts = item.split("=");
          if (parts.length >= 2) {
            const k = parts[0].trim().toLowerCase();
            const v = parts.slice(1).join("=").trim();
            if (k === "cpu") parsedCpu = v;
            else if (k === "gpu") parsedGpu = v;
            else if (k === "ram") parsedRam = v;
            else if (k === "storage") parsedStorage = v;
            else if (k === "free") parsedFree = v;
          }
        });
      } else {
        // Fallback line by line parsing
        const lines = psPasteText.split("\n");
        lines.forEach(line => {
          const cleanLine = line.trim();
          if (cleanLine.toLowerCase().includes("cpu") || cleanLine.toLowerCase().includes("processor")) {
            const matched = cleanLine.split(":")[1] || cleanLine.split("=")[1];
            if (matched) parsedCpu = matched.trim();
          }
          if (cleanLine.toLowerCase().includes("gpu") || cleanLine.toLowerCase().includes("graphics") || cleanLine.toLowerCase().includes("video")) {
            const matched = cleanLine.split(":")[1] || cleanLine.split("=")[1];
            if (matched) parsedGpu = matched.trim();
          }
          if (cleanLine.toLowerCase().includes("ram") || cleanLine.toLowerCase().includes("memory")) {
            const matched = cleanLine.split(":")[1] || cleanLine.split("=")[1];
            if (matched) parsedRam = matched.trim();
          }
        });
      }

      if (!parsedCpu && !parsedGpu) {
        throw new Error("Could not detect any CPU or GPU in your pasted text. Make sure you copy/pasted the entire response output!");
      }

      // Beautify strings
      const cleanedCpu = parsedCpu 
        ? parsedCpu.replace(/@.+/g, "").replace(/\(R\)/g, "").replace(/\(TM\)/g, "").replace(/\s+/g, " ").trim()
        : specs.cpu;

      const cleanedGpu = parsedGpu 
        ? parsedGpu.replace(/\(R\)/g, "").replace(/\(TM\)/g, "").replace(/\s+/g, " ").trim()
        : specs.gpu;

      const finalRam = parsedRam ? (parsedRam.toLowerCase().includes("gb") ? parsedRam : `${parsedRam} GB`) : specs.ram;
      const finalStorage = parsedStorage || specs.storage;
      const finalFree = parsedFree || specs.storageFree;

      // Classify GPU
      const lowerG = cleanedGpu.toLowerCase();
      const isIntelG = lowerG.includes("intel") || lowerG.includes("uhd") || lowerG.includes("hd graphics") || lowerG.includes("iris");

      const finalSpecs: UserSpecs = {
        ...specs,
        cpu: cleanedCpu,
        gpu: cleanedGpu,
        ram: finalRam,
        storage: finalStorage,
        storageFree: finalFree,
        gpuType: isIntelG ? "Integrated" : "Dedicated",
        directx: lowerG.includes("rtx") || lowerG.includes("rx 50") || lowerG.includes("rx 6") || lowerG.includes("rx 7") ? "DirectX 12 (Ultimate)" : "DirectX 12"
      };

      setSpecs(finalSpecs);
      setGpuInput(finalSpecs.gpu);
      setCpuInput(finalSpecs.cpu);
      onSpecsChange(finalSpecs);
      setPsPasteText("");
      setShowPsImporter(false);
      setIsEditing(false);
    } catch (err: any) {
      setImportError(err.message || "Parsing failed. Double-check pasted content.");
    }
  };

  // Sync inputs with state changes
  useEffect(() => {
    setSpecs(currentSpecs);
    setGpuInput(currentSpecs.gpu);
    setCpuInput(currentSpecs.cpu);
  }, [currentSpecs]);

  // Click outside listener to dismiss prediction dropdown boxes
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (gpuSuggestRef.current && !gpuSuggestRef.current.contains(event.target as Node)) {
        setShowGpuSuggestions(false);
      }
      if (cpuSuggestRef.current && !cpuSuggestRef.current.contains(event.target as Node)) {
        setShowCpuSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApplyPreset = (presetSpecs: UserSpecs) => {
    // Fill in default DDR/VRAM/DX parameters for presets if missing
    const enhancedSpecs: UserSpecs = {
      ...presetSpecs,
      ramDdr: presetSpecs.ramDdr || (presetSpecs.ram.includes("64") || presetSpecs.ram.includes("32") ? "DDR5 RAM" : "DDR4 RAM"),
      vram: presetSpecs.vram || (presetSpecs.gpu.includes("4090") ? "24 GB" : presetSpecs.gpu.includes("4070") ? "12 GB" : "8 GB"),
      directx: presetSpecs.directx || (presetSpecs.gpu.includes("RTX") ? "DirectX 12 (Ultimate)" : "DirectX 12 Feature Level 11_1")
    };
    setSpecs(enhancedSpecs);
    setGpuInput(enhancedSpecs.gpu);
    setCpuInput(enhancedSpecs.cpu);
    onSpecsChange(enhancedSpecs);
    setIsEditing(false);
  };

  const handleRedetect = () => {
    const freshlyDetected = detectSystemSpecs();
    setSpecs(freshlyDetected);
    setGpuInput(freshlyDetected.gpu);
    setCpuInput(freshlyDetected.cpu);
    onSpecsChange(freshlyDetected);

    // Additionally fire off async remaining storage detection to refresh drive stats
    detectStorageSpace().then((storageInfo) => {
      if (storageInfo) {
        setSpecs(prev => {
          const merged = {
            ...prev,
            storage: storageInfo.storage,
            storageFree: storageInfo.storageFree
          };
          onSpecsChange(merged);
          return merged;
        });
      }
    }).catch(err => console.warn("Redetect storage space fail skipped:", err));
  };

  const handleInputChange = (field: keyof UserSpecs, value: string) => {
    const updated = { ...specs, [field]: value };
    setSpecs(updated);
    onSpecsChange(updated);
  };

  // GPU Suggestion Click
  const selectGpu = (gpuName: string) => {
    const matched = POPULAR_GPUS.find(g => g.name === gpuName);
    
    // Determine gpuType dynamically
    const lowerGpu = gpuName.toLowerCase();
    const isIntegrated = 
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
      matched?.isIntegrated === true;

    const updated = {
      ...specs,
      gpu: gpuName,
      vram: matched?.vram || specs.vram || "8 GB",
      directx: matched?.directx || specs.directx || "DirectX 12 (Ultimate)",
      gpuType: (isIntegrated ? "Integrated" : "Dedicated") as "Integrated" | "Dedicated"
    };
    setSpecs(updated);
    setGpuInput(gpuName);
    onSpecsChange(updated);
    setShowGpuSuggestions(false);
  };

  // CPU Suggestion Click
  const selectCpu = (cpuName: string) => {
    const matched = POPULAR_CPUS.find(c => c.name === cpuName);
    const updated = {
      ...specs,
      cpu: matched ? `${cpuName} (${matched.cores} Cores)` : cpuName
    };
    setSpecs(updated);
    setCpuInput(updated.cpu);
    onSpecsChange(updated);
    setShowCpuSuggestions(false);
  };

  const swapCpuBrand = () => {
    const isAmd = specs.cpu.includes("AMD") || specs.cpu.includes("Ryzen");
    const match = specs.cpu.match(/(\d+)\s*Cores/);
    const cores = match ? parseInt(match[1]) : 6;
    
    let nextCpu = "";
    if (isAmd) {
      if (cores >= 24) nextCpu = "Intel Core i9-14900K";
      else if (cores >= 16) nextCpu = "Intel Core Ultra 9 185H";
      else if (cores >= 12) nextCpu = "Intel Core i7-12700K";
      else if (cores >= 8) nextCpu = "Intel Core i5-13400";
      else if (cores >= 6) nextCpu = "Intel Core i5-12400";
      else nextCpu = "Intel Core i3-12100F";
    } else {
      if (cores >= 24) nextCpu = "AMD Ryzen 9 7950X";
      else if (cores >= 16) nextCpu = "AMD Ryzen 7 7800X3D";
      else if (cores >= 12) nextCpu = "AMD Ryzen 9 5900X";
      else if (cores >= 8) nextCpu = "AMD Ryzen 7 5800X";
      else if (cores >= 6) nextCpu = "AMD Ryzen 5 5600X";
      else nextCpu = "AMD Ryzen 3 3300X";
    }
    
    const formattedCpu = `${nextCpu} (${cores} Cores)`;
    const updated = {
      ...specs,
      cpu: formattedCpu
    };
    setSpecs(updated);
    setCpuInput(formattedCpu);
    onSpecsChange(updated);
  };

  // Compute matches
  const filteredGpus = gpuInput.trim() === ""
    ? POPULAR_GPUS.slice(0, 10)
    : POPULAR_GPUS.filter(g => g.name.toLowerCase().includes(gpuInput.toLowerCase())).slice(0, 10);

  // Clean CPU Input to strip " (X Cores)" tail formatting for search matching
  const cleanCpuSearch = cpuInput.replace(/\s*\(\d+\s*Cores\)/gi, "").trim();
  const filteredCpus = cleanCpuSearch === ""
    ? POPULAR_CPUS.slice(0, 10)
    : POPULAR_CPUS.filter(c => c.name.toLowerCase().includes(cleanCpuSearch.toLowerCase())).slice(0, 10);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl" id="specs-panel">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            <Cpu className="text-emerald-400 w-5 h-5 animate-pulse" />
            My PC Hardware Specifications
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Specify your system details or load a predefined gaming configuration. Autocomplete assists you with matching authentic cards.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowPsImporter(!showPsImporter)}
            type="button"
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono transition duration-150 border cursor-pointer ${
              showPsImporter 
                ? "bg-indigo-500 text-slate-950 border-indigo-400 font-extrabold" 
                : "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            1-Click PC Spec Importer
          </button>

          <button
            onClick={handleRedetect}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-bold font-mono transition text-slate-300 hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Auto-Detect Specs
          </button>
        </div>
      </div>

      {/* PowerShell Spec Importer Tooltip Panel */}
      {showPsImporter && (
        <div className="mb-6 p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 shadow-inner space-y-4 animate-in fade-in slide-in-from-top-4 duration-250">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Import Your Real Laptop/PC Specs via PowerShell</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-2xl">
            Because web browsers block websites from accessing exact CPU and Drive names due to user privacy, our safe 1-click command fetches them from Windows and transfers them here instantly!
          </p>
          <div className="space-y-2">
            <span className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase">Step 1: Copy this safe PowerShell command</span>
            <div className="flex items-center gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <code className="text-[10px] text-indigo-300 font-mono select-all truncate flex-1">{psCommand}</code>
              <button
                type="button"
                onClick={copyPsCommand}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded-lg hover:text-white transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Copy className="w-3 h-3" />
                {copyFeedback ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <span className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase">Step 2: Open PowerShell, paste the command, press Enter, then paste the output here</span>
            <textarea
              className="w-full h-24 bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl p-3 text-[10px] text-indigo-200 font-mono focus:outline-none placeholder-slate-600 shadow-inner"
              placeholder="Right-click in PowerShell to paste, press Enter, copy the 'CYRI_SPECS: ...' line or paste the complete output here..."
              value={psPasteText}
              onChange={(e) => {
                setPsPasteText(e.target.value);
                setImportError("");
              }}
            />
            {importError && (
              <p className="text-[10px] text-rose-400 font-semibold font-mono">{importError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPsPasteText("");
                  setShowPsImporter(false);
                }}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportSpecs}
                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-xs font-bold text-slate-950 rounded-xl transition duration-150 shadow-md shadow-indigo-500/10 cursor-pointer"
              >
                Analyze & Apply Hardware Specs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preset Selectors */}
      <div className="mb-6 bg-slate-950/20 p-4 border border-slate-800/40 rounded-2xl">
        <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Quick Hardware Benchmarks presets
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {HARDWARE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset.specs)}
              type="button"
              className="px-3 py-2 text-left rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs transition duration-200 group cursor-pointer"
            >
              <div className="font-extrabold text-slate-200 group-hover:text-emerald-400 transition truncate">
                {preset.name.split(" (")[0]}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate uppercase">
                {preset.specs.ram} • {preset.specs.gpu.split("GeForce ")[1] || preset.specs.gpu.split("Radeon ")[1] || "IGPU"}
              </div>
            </button>
          ))}
        </div>
      </div>      {/* Inputs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* GPU */}
        <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl flex flex-col justify-between relative" ref={gpuSuggestRef}>
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                GPU / Graphics
              </span>
            </div>
            
            {isEditing ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type GPU model..."
                  className="w-full bg-slate-850 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  value={gpuInput}
                  onFocus={() => {
                    setShowGpuSuggestions(true);
                    setShowCpuSuggestions(false);
                  }}
                  onChange={(e) => {
                    setGpuInput(e.target.value);
                    handleInputChange("gpu", e.target.value);
                  }}
                />
                
                {/* Autocomplete Predictions Panel */}
                {showGpuSuggestions && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 shrink-0 scrollbar-thin">
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest px-2 py-1 bg-slate-900/40 rounded-lg mb-1">
                      GPU Search Results
                    </div>
                    {/* List actual search results first (if typing) */}
                    {gpuInput.trim() !== "" && filteredGpus.length > 0 && (
                      <div className="space-y-0.5 mb-2 border-b border-slate-700 pb-2">
                        {filteredGpus.map((gpu) => (
                          <button
                            key={gpu.name}
                            type="button; button"
                            onClick={() => selectGpu(gpu.name)}
                            className="w-full text-left px-2 py-1 hover:bg-sky-500/20 hover:text-sky-300 rounded text-[11px] font-mono transition truncate block cursor-pointer"
                          >
                            {gpu.name}
                            <span className="text-[8px] text-slate-400 block">{gpu.vram} VRAM | {gpu.directx}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Collapsible Gen Selector */}
                    <div className="text-[9px] text-emerald-400 font-black uppercase tracking-widest px-2 py-1 bg-slate-900/40 rounded-lg mb-1.5 flex items-center justify-between">
                      <span>Browse GPU Database (1-Click)</span>
                    </div>
                    <div className="space-y-1">
                      {GPU_GENERATIONS.map((gen) => {
                        const isExpanded = expandedGpuGen === gen.name;
                        const matchingGpus = POPULAR_GPUS.filter(g => gen.filter(g.name));
                        if (matchingGpus.length === 0) return null;
                        return (
                          <div key={gen.name} className="border border-slate-750 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedGpuGen(isExpanded ? null : gen.name)}
                              className="w-full text-left px-2 py-1 bg-slate-900/30 hover:bg-slate-900/60 text-[10px] text-slate-300 font-bold font-mono flex justify-between items-center transition cursor-pointer"
                            >
                              <span className="truncate pr-1">{gen.name}</span>
                              <span className="text-[8px] text-slate-500 shrink-0">({matchingGpus.length}) {isExpanded ? "▲" : "▼"}</span>
                            </button>
                            {isExpanded && (
                              <div className="bg-slate-900/40 p-1 max-h-40 overflow-y-auto space-y-0.5 border-t border-slate-750 scrollbar-thin">
                                {matchingGpus.map((gpu) => (
                                  <button
                                    key={gpu.name}
                                    type="button"
                                    onClick={() => selectGpu(gpu.name)}
                                    className="w-full text-left px-1.5 py-1 hover:bg-sky-500/20 hover:text-sky-300 rounded text-[10px] font-mono transition truncate block cursor-pointer"
                                  >
                                    {gpu.name}
                                    <span className="text-[8px] text-slate-400 block">{gpu.vram} • {gpu.directx}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-200 font-mono break-words">{specs.gpu}</p>
            )}
          </div>

          {/* VRAM / DX Spec Sub-details displayed beautifully inside cards */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono space-y-1">
            {isEditing ? (
              <div className="space-y-1.5">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">VRAM Size</label>
                  <select
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-sky-500"
                    value={specs.vram || "8 GB"}
                    onChange={(e) => handleInputChange("vram", e.target.value)}
                  >
                    {VRAM_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">GPU Type</label>
                  <select
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-sky-500"
                    value={specs.gpuType || "Dedicated"}
                    onChange={(e) => handleInputChange("gpuType", e.target.value as any)}
                  >
                    <option value="Dedicated">Dedicated Graphics</option>
                    <option value="Integrated">Integrated Graphics</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">DX Capable</label>
                  <select
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-sky-500"
                    value={specs.directx || "DirectX 12"}
                    onChange={(e) => handleInputChange("directx", e.target.value)}
                  >
                    {DIRECTX_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between">VRAM: <span className="text-slate-200 font-bold">{specs.vram || "8 GB"}</span></div>
                <div className="flex justify-between">Type: <span className={`font-bold uppercase tracking-tight ${specs.gpuType === "Integrated" ? "text-amber-400" : "text-emerald-400"}`}>{specs.gpuType || "Dedicated"}</span></div>
                <div className="flex justify-between">DirectX: <span className="text-slate-200 font-bold">{specs.directx || "DirectX 12"}</span></div>
              </>
            )}
          </div>
        </div>

        {/* CPU */}
        <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl flex flex-col justify-between relative" ref={cpuSuggestRef}>
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <CpuIcon className="w-3.5 h-3.5 text-emerald-400" />
                CPU / Processor
              </span>
              <div className="group relative">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-400 cursor-pointer" />
                <span className="absolute bottom-full right-0 mb-1 w-48 p-2 bg-slate-950 border border-slate-800 rounded-lg text-[9px] text-slate-300 normal-case hidden group-hover:block z-50 shadow-xl leading-relaxed">
                  Web browsers restrict precise CPU model names to block tracking. Folders below help you click-select your exact CPU generation!
                </span>
              </div>
            </div>
            
            {isEditing ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type processor model..."
                  className="w-full bg-slate-850 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  value={cpuInput}
                  onFocus={() => {
                    setShowCpuSuggestions(true);
                    setShowGpuSuggestions(false);
                  }}
                  onChange={(e) => {
                    setCpuInput(e.target.value);
                    handleInputChange("cpu", e.target.value);
                  }}
                />
                
                {/* Autocomplete Predictions Panel */}
                {showCpuSuggestions && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 shrink-0 scrollbar-thin">
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest px-2 py-1 bg-slate-900/40 rounded-lg mb-1">
                      CPU Search Results
                    </div>
                    {/* List actual search results first (if typing) */}
                    {cleanCpuSearch !== "" && filteredCpus.length > 0 && (
                      <div className="space-y-0.5 mb-2 border-b border-slate-700 pb-2">
                        {filteredCpus.map((cpu) => (
                          <button
                            key={cpu.name}
                            type="button"
                            onClick={() => selectCpu(cpu.name)}
                            className="w-full text-left px-2 py-1 hover:bg-emerald-500/20 hover:text-emerald-300 rounded text-[11px] font-mono transition truncate block cursor-pointer"
                          >
                            {cpu.name}
                            <span className="text-[8px] text-slate-400 block">{cpu.cores} Cores</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Collapsible Gen Selector */}
                    <div className="text-[9px] text-emerald-400 font-black uppercase tracking-widest px-2 py-1 bg-slate-900/40 rounded-lg mb-1.5 flex items-center justify-between">
                      <span>Browse Generation Folders</span>
                    </div>
                    <div className="space-y-1">
                      {CPU_GENERATIONS.map((gen) => {
                        const isExpanded = expandedCpuGen === gen.name;
                        const matchingCpus = POPULAR_CPUS.filter(c => gen.filter(c.name));
                        if (matchingCpus.length === 0) return null;
                        return (
                          <div key={gen.name} className="border border-slate-750 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setExpandedCpuGen(isExpanded ? null : gen.name)}
                              className="w-full text-left px-2 py-1 bg-slate-900/30 hover:bg-slate-900/60 text-[10px] text-slate-300 font-bold font-mono flex justify-between items-center transition cursor-pointer"
                            >
                              <span className="truncate pr-1">{gen.name}</span>
                              <span className="text-[8px] text-slate-500 shrink-0">({matchingCpus.length}) {isExpanded ? "▲" : "▼"}</span>
                            </button>
                            {isExpanded && (
                              <div className="bg-slate-900/40 p-1 max-h-40 overflow-y-auto space-y-0.5 border-t border-slate-750 scrollbar-thin">
                                {matchingCpus.map((cpu) => (
                                  <button
                                    key={cpu.name}
                                    type="button"
                                    onClick={() => selectCpu(cpu.name)}
                                    className="w-full text-left px-1.5 py-1 hover:bg-emerald-500/20 hover:text-emerald-300 rounded text-[10px] font-mono transition truncate block cursor-pointer"
                                  >
                                    {cpu.name}
                                    <span className="text-[8px] text-slate-400 block">{cpu.cores} Cores</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-slate-200 font-mono break-words">{specs.cpu}</p>
                <button
                  type="button"
                  onClick={swapCpuBrand}
                  className="mt-1.5 text-[9px] text-sky-400 hover:text-sky-300 font-bold font-mono tracking-tight uppercase flex items-center gap-1.5 transition-all hover:brightness-110 cursor-pointer"
                >
                  <RefreshCw className="w-2.5 h-2.5 " />
                  Swap to {specs.cpu.includes("AMD") || specs.cpu.includes("Ryzen") ? "Intel Equivalent" : "Ryzen Equivalent"}
                </button>
              </div>
            )}
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono space-y-1">
            <div className="flex justify-between">Architecture: <span className="text-slate-200 font-bold">{specs.cpu.includes("AMD") ? "x86-64 AMD Zen" : specs.cpu.includes("Apple") ? "ARM Unified Silicon" : "x86-64 Intel Core"}</span></div>
            <div className="flex justify-between">Cores Check: <span className="text-slate-200 font-bold">{specs.cpu.includes("Core") ? "Hyperthreaded Pass" : "Multi-threaded Match"}</span></div>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              RAM / Memory
            </div>
            {isEditing ? (
              <select
                className="w-full bg-slate-850 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500 cursor-pointer"
                value={specs.ram}
                onChange={(e) => handleInputChange("ram", e.target.value)}
              >
                <option value="4 GB">4 GB</option>
                <option value="8 GB">8 GB</option>
                <option value="12 GB">12 GB</option>
                <option value="16 GB">16 GB</option>
                <option value="24 GB">24 GB</option>
                <option value="32 GB">32 GB</option>
                <option value="48 GB">48 GB</option>
                <option value="64 GB">64 GB</option>
                <option value="128 GB">128 GB</option>
              </select>
            ) : (
              <p className="text-sm font-semibold text-slate-200 font-mono">{specs.ram}</p>
            )}
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono space-y-1">
            {isEditing ? (
              <div>
                <label className="text-[9px] text-slate-500 uppercase font-bold block mb-0.5">RAM Generation</label>
                <select
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-amber-550"
                  value={specs.ramDdr || "DDR4 RAM"}
                  onChange={(e) => handleInputChange("ramDdr", e.target.value)}
                >
                  {DDR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            ) : (
              <>
                <div className="flex justify-between">Type: <span className="text-slate-200 font-bold">{specs.ramDdr || "DDR4 RAM"}</span></div>
                <div className="flex justify-between">Dual-Channel: <span className="text-slate-250 text-emerald-400 font-bold font-mono">ENABLED</span></div>
              </>
            )}
          </div>
        </div>

        {/* Storage */}
        <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
              Remaining Storage
            </div>
            {isEditing ? (
              <div className="space-y-1.5">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-black block mb-0.5">Free Remaining Space</label>
                  <input
                    type="text"
                    className="w-full bg-slate-850 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                    placeholder="e.g. 245.8 GB Remaining"
                    value={specs.storageFree || ""}
                    onChange={(e) => handleInputChange("storageFree", e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 uppercase font-black block mb-0.5">Total Disk Capacity</label>
                  <select
                    className="w-full bg-slate-850 border border-slate-700 rounded-lg px-2 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                    value={specs.storage}
                    onChange={(e) => handleInputChange("storage", e.target.value)}
                  >
                    <option value="256 GB SSD">256 GB SSD</option>
                    <option value="512 GB SSD">512 GB SSD</option>
                    <option value="1 TB SSD">1 TB SSD</option>
                    <option value="2 TB SSD">2 TB SSD</option>
                    <option value="4 TB SSD">4 TB SSD</option>
                    <option value="2 TB NVMe SSD">2 TB NVMe SSD</option>
                    <option value="4 TB NVMe SSD">4 TB NVMe SSD</option>
                    <option value="500 GB HDD">500 GB HDD</option>
                    <option value="1 TB HDD">1 TB HDD</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-emerald-400 font-mono tracking-tight leading-none">
                  {specs.storageFree || "245.8 GB Remaining"}
                </p>
                <p className="text-[9px] text-slate-400 font-mono mt-1">
                  of {specs.storage || "512 GB SSD"} Core Drive
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-slate-400 text-[9px] uppercase font-bold tracking-tight leading-none">
                    Real-time available
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono space-y-1">
            <div className="flex justify-between">Free space: <span className="text-emerald-400 font-bold">{specs.storageFree || "245.8 GB"}</span></div>
            <div className="flex justify-between">Drive Speed: <span className="text-slate-200 font-bold">SSD (Solid State Ready)</span></div>
          </div>
        </div>

        {/* Operating System */}
        <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Cpu className="w-3.5 h-3.5 text-rose-400" />
              Operating System
            </div>
            {isEditing ? (
              <input
                type="text"
                className="w-full bg-slate-850 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                value={specs.os}
                onChange={(e) => handleInputChange("os", e.target.value)}
              />
            ) : (
              <p className="text-sm font-semibold text-slate-200 font-mono truncate">{specs.os}</p>
            )}
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono space-y-1">
            <div className="flex justify-between">Platform Mode: <span className="text-slate-200 font-bold">64-bit Native</span></div>
            <div className="flex justify-between">Admin Privileges: <span className="text-emerald-400 font-bold">GRANTED</span></div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          onClick={() => setIsEditing(!isEditing)}
          type="button"
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold tracking-tight transition duration-150 shadow-lg cursor-pointer ${
            isEditing
              ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/10"
              : "bg-slate-800 hover:bg-slate-700/80 text-white"
          }`}
        >
          {isEditing ? (
            <>
              <Check className="w-4 h-4" />
              Done Customizing & Apply Specs
            </>
          ) : (
            <>
              <Edit2 className="w-3.5 h-3.5" />
              Edit Custom Specs
            </>
          )}
        </button>
      </div>
    </div>
  );
}
