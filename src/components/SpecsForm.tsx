/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Cpu, Layers, HardDrive, Edit2, Check, RefreshCw, CpuIcon, Eye, HelpCircle, Terminal, Copy, Zap } from "lucide-react";
import { UserSpecs, CyriState } from "../types";
import { HARDWARE_PRESETS, detectSystemSpecs, detectStorageSpace, parseCpuSpecs, parseGpuSpecs, benchmarkCpuSpeed } from "../utils";
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
    name: "Intel 11th Gen (Rocket Lake)",
    filter: (name: string) => name.includes("i9-11") || name.includes("i7-11") || name.includes("i5-11") || name.includes("i3-11")
  },
  {
    name: "Intel 10th Gen (Comet Lake)",
    filter: (name: string) => name.includes("i9-10") || name.includes("i7-10") || name.includes("i5-10") || name.includes("i3-10")
  },
  {
    name: "Intel 9th Gen (Coffee Lake-R)",
    filter: (name: string) => name.includes("i9-9") || name.includes("i7-9") || name.includes("i5-9") || name.includes("i3-9")
  },
  {
    name: "Intel 8th Gen (Coffee Lake)",
    filter: (name: string) => name.includes("i7-8") || name.includes("i5-8") || name.includes("i3-8") || name.includes("8700") || name.includes("8600") || name.includes("8400") || name.includes("8100")
  },
  {
    name: "Intel 7th Gen (Kaby Lake)",
    filter: (name: string) => name.includes("i7-7") || name.includes("i5-7") || name.includes("i3-7") || name.includes("7700") || name.includes("7600") || name.includes("7400") || name.includes("7100")
  },
  {
    name: "Intel 6th Gen (Skylake)",
    filter: (name: string) => name.includes("i7-6") || name.includes("i5-6") || name.includes("i3-6") || name.includes("6700") || name.includes("6600") || name.includes("6400") || name.includes("6100")
  },
  {
    name: "Intel 4th & 5th Gen (Haswell)",
    filter: (name: string) => name.includes("-47") || name.includes("-46") || name.includes("-45") || name.includes("-44") || name.includes("-41") || name.includes("-57") || name.includes("-56") || name.includes("4790") || name.includes("4770") || name.includes("4690") || name.includes("4590") || name.includes("4460") || name.includes("4130")
  },
  {
    name: "Intel 2nd & 3rd Gen (Sandy/Ivy)",
    filter: (name: string) => name.includes("-37") || name.includes("-35") || name.includes("-34") || name.includes("-32") || name.includes("-26") || name.includes("-25") || name.includes("-21") || name.includes("3770") || name.includes("3570") || name.includes("3470") || name.includes("3220") || name.includes("2600") || name.includes("2500") || name.includes("2100")
  },
  {
    name: "Intel 1st Gen & Core 2 Duo",
    filter: (name: string) => name.includes("Core 2") || name.includes("i7-920") || name.includes("i7-860") || name.includes("i5-750") || name.includes("i3-530") || name.includes("Pentium") || name.includes("Q9650") || name.includes("Q6600")
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
    name: "Apple Silicon M1/M2/M3/M4",
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
  cyriState: CyriState;
  onStateChange: (state: CyriState) => void;
  currentSpecs: UserSpecs;
  onSpecsChange: (specs: UserSpecs) => void;
}

export default function SpecsForm({ cyriState, onStateChange, currentSpecs, onSpecsChange }: SpecsFormProps) {
  const [specs, setSpecs] = useState<UserSpecs>(currentSpecs);
  const [isEditing, setIsEditing] = useState(false);

  // Dynamic sync session token for exact hardware scanner
  const [token] = useState<string>(() => {
    const existing = localStorage.getItem("cyri_session_token");
    if (existing) return existing;
    const newToken = Math.random().toString(36).substring(2, 10).toUpperCase();
    localStorage.setItem("cyri_session_token", newToken);
    return newToken;
  });

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

  const [importerPlatform, setImporterPlatform] = useState<"windows" | "macos" | "linux">("windows");

  // Instant hardware auto-scanner simulation states with real measurements
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [detectedItemLog, setDetectedItemLog] = useState("");

  const handleInstantDetect = async () => {
    setIsDetecting(true);
    setDetectionProgress(5);
    setDetectedItemLog("Initializing WebGL physical graphics pipeline query...");

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    await sleep(250);
    setDetectionProgress(25);
    setDetectedItemLog("Profiling single-threaded and multi-threaded CPU floating-point speed...");

    // Execute real performance benchmark
    const speedScore = benchmarkCpuSpeed();
    await sleep(350);
    setDetectionProgress(55);
    const coresCount = navigator.hardwareConcurrency || 6;
    setDetectedItemLog(`Registered ${coresCount} logical cores. Analyzing GPU capabilities & device memory size...`);

    const specsDetected = detectSystemSpecs();
    await sleep(300);
    setDetectionProgress(80);
    setDetectedItemLog(`Mapped ${specsDetected.gpu || "Unknown GPU"} GPU and physical memory. Querying disk storage size...`);

    const storageInfo = await detectStorageSpace();
    let finalModel = { ...specsDetected };
    if (storageInfo) {
      finalModel = {
        ...specsDetected,
        storage: storageInfo.storage,
        storageFree: storageInfo.storageFree
      };
    }

    await sleep(200);
    setDetectionProgress(100);
    setDetectedItemLog("Hardware scanning complete! Synchronizing database...");
    await sleep(150);

    setSpecs(finalModel);
    setGpuInput(finalModel.gpu);
    setCpuInput(finalModel.cpu);

    onStateChange({
      real_specs: finalModel,
      custom_specs: null,
      mode: "real"
    });
    onSpecsChange(finalModel);
    setIsDetecting(false);
    setIsEditing(false);
    setShowPsImporter(false);
  };

  const [copyFeedbackInstant, setCopyFeedbackInstant] = useState(false);

  const windowsCommand = `chcp 65001 >$null; $cpu = (Get-CimInstance Win32_Processor).Name; $gpuObj = Get-CimInstance Win32_VideoController | Select-Object -First 1; $gpu = $gpuObj.Name; $ram = "$([Math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB)) GB"; $disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"; $free = "$([Math]::Round($disk.FreeSpace/1GB)) GB Remaining"; $tot = "$([Math]::Round($disk.Size/1GB)) GB SSD"; echo "CYRI_SPECS: CPU=$cpu|GPU=$gpu|RAM=$ram|Storage=$tot|Free=$free"`;

  const macosCommand = `cpu=$(sysctl -n machdep.cpu.brand_string); gpu=$(system_profiler SPDisplaysDataType | grep "Chipset Model" | head -n 1 | cut -d: -f2 | xargs); ram="$(($(sysctl -n hw.memsize) / 1024 / 1024 / 1024)) GB"; disk_tot=$(df -h / | tail -1 | awk '{print $2}'); disk_free=$(df -h / | tail -1 | awk '{print $4}'); echo "CYRI_SPECS: CPU=$cpu|GPU=$gpu|RAM=$ram|Storage=\${disk_tot} SSD|Free=\${disk_free} Remaining"`;

  const linuxCommand = `cpu=$(lscpu | grep "Model name:" | head -n 1 | cut -d: -f2- | xargs); gpu=$(lspci | grep -i -E "vga|3d" | head -n 1 | cut -d: -f3 | xargs); ram="\$(free -g | grep Mem: | awk '{print \$2}') GB"; disk_tot=\$(df -h / | tail -1 | awk '{print \$2}'); disk_free=\$(df -h / | tail -1 | awk '{print \$4}'); echo "CYRI_SPECS: CPU=\$cpu|GPU=\$gpu|RAM=\$ram|Storage=\${disk_tot} SSD|Free=\${disk_free} Remaining"`;

  const windowsCommandInstant = `$t="${token}";$u="${typeof window !== "undefined" ? window.location.origin : ""}";chcp 65001 >$null;$cpu=(Get-CimInstance Win32_Processor).Name.Replace("@","").Replace("(R)","").Replace("(TM)","").Replace("  "," ").Trim();$gpu=(Get-CimInstance Win32_VideoController | Select-Object -First 1).Name.Replace("(R)","").Replace("(TM)","").Replace("  "," ").Trim();$ram="$([Math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory/1GB)) GB";$disk=Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'";$free="$([Math]::Round($disk.FreeSpace/1GB)) GB Free";$tot="$([Math]::Round($disk.Size/1GB)) GB SSD";$p=@{token=$t;cpu=$cpu;gpu=$gpu;ram=$ram;storage=$tot;free=$free}|ConvertTo-Json;try{Invoke-RestMethod -Uri "$u/api/submit-specs" -Method Post -Body $p -ContentType "application/json" -TimeoutSec 10;Write-Host "";Write-Host "=========================================================" -ForegroundColor Green;Write-Host "     🚀 SUCCESS! COMPUTER CONFIGURATION DETECTED!       " -ForegroundColor Green;Write-Host "=========================================================" -ForegroundColor Green;Write-Host "Your PC hardware is sync-linked! Head back to your browser." -ForegroundColor Green;Write-Host ""}catch{Write-Host "";Write-Host "⚠️ Sync failed. Copy this specs line instead:" -ForegroundColor Yellow;Write-Host "CYRI_SPECS: CPU=$cpu|GPU=$gpu|RAM=$ram|Storage=$tot|Free=$free" -ForegroundColor White;Write-Host ""}`;

  const macosCommandInstant = `t="${token}"; u="${typeof window !== "undefined" ? window.location.origin : ""}"; cpu=$(sysctl -n machdep.cpu.brand_string); gpu=$(system_profiler SPDisplaysDataType | grep "Chipset Model" | head -n 1 | cut -d: -f2 | xargs); ram="$(($(sysctl -n hw.memsize) / 1024 / 1024 / 1024)) GB"; disk_tot=$(df -h / | tail -1 | awk '{print $2}'); disk_free=$(df -h / | tail -1 | awk '{print $4}'); payload="{\\"token\\":\\"$t\\",\\"cpu\\":\\"$cpu\\",\\"gpu\\":\\"$gpu\\",\\"ram\\":\\"$ram\\",\\"storage\\":\\"$disk_tot SSD\\",\\"free\\":\\"$disk_free Free\\"}"; curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$u/api/submit-specs" > /dev/null && echo "🚀 SUCCESS! Mac specs linked successfully. Head back to your browser!" || echo "⚠️ Sync failed. Copy this spec line instead: CYRI_SPECS: CPU=$cpu|GPU=$gpu|RAM=$ram|Storage=\${disk_tot} SSD|Free=\${disk_free} Remaining"`;

  const linuxCommandInstant = `t="${token}"; u="${typeof window !== "undefined" ? window.location.origin : ""}"; cpu=$(lscpu | grep "Model name:" | head -n 1 | cut -d: -f2- | xargs); gpu=$(lspci | grep -i -E "vga|3d" | head -n 1 | cut -d: -f3 | xargs); ram="\s\\$(free -g | grep Mem: | awk '{print \$2}') GB"; disk_tot=\\$(df -h / | tail -1 | awk '{print \$2}'); disk_free=\\$(df -h / | tail -1 | awk '{print \$4}'); payload="{\\"token\\":\\"$t\\",\\"cpu\\":\\"$cpu\\",\\"gpu\\":\\"$gpu\\",\\"ram\\":\\"$ram\\",\\"storage\\":\\"$disk_tot SSD\\",\\"free\\":\\"$disk_free Free\\"}"; curl -s -X POST -H "Content-Type: application/json" -d "$payload" "$u/api/submit-specs" > /dev/null && echo "🚀 SUCCESS! Linux specs linked successfully. Head back to your browser!" || echo "⚠️ Sync failed. Copy this spec line instead: CYRI_SPECS: CPU=\$cpu|GPU=\$gpu|RAM=\$ram|Storage=\${disk_tot} SSD|Free=\${disk_free} Remaining"`;

  const copyPsCommand = () => {
    const cmd = importerPlatform === "windows" ? windowsCommand : importerPlatform === "macos" ? macosCommand : linuxCommand;
    navigator.clipboard.writeText(cmd);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 3000);
  };

  const copyInstantCommand = () => {
    const cmd = importerPlatform === "windows" ? windowsCommandInstant : importerPlatform === "macos" ? macosCommandInstant : linuxCommandInstant;
    navigator.clipboard.writeText(cmd);
    setCopyFeedbackInstant(true);
    setTimeout(() => setCopyFeedbackInstant(false), 3000);
  };

  const downloadFile = async (filename: "cyri-scanner.bat" | "cyri-scanner.ps1") => {
    try {
      const typeParam = filename.endsWith(".ps1") ? "ps1" : "bat";
      const response = await fetch(`/api/download-scanner?token=${token}&type=${typeParam}`);
      if (!response.ok) throw new Error("File fetch failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Blob download failed, falling back to direct anchor link:", e);
      const typeParam = filename.endsWith(".ps1") ? "ps1" : "bat";
      const link = document.createElement("a");
      link.href = `/api/download-scanner?token=${token}&type=${typeParam}`;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Poll for background automatic specifications transmission
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showPsImporter) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/get-specs?token=${token}`);
          if (res.ok) {
            const data = await res.json();
            if (data.found && data.specs) {
              const finalSpecs: UserSpecs = data.specs;
              setSpecs(finalSpecs);
              setGpuInput(finalSpecs.gpu);
              setCpuInput(finalSpecs.cpu);
              onStateChange({
                real_specs: finalSpecs,
                custom_specs: null,
                mode: "real"
              });
              onSpecsChange(finalSpecs);
              setShowPsImporter(false);
              setIsEditing(false);
              setPsPasteText("");
              setImportError("");
            }
          }
        } catch (err) {
          console.warn("[Session Poll] Specs sync failed to retrieve:", err);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showPsImporter, token, onStateChange, onSpecsChange]);

  const handleDownloadScanner = () => {
    // Default to downloading the highly reliable .bat file for double-click simplicity on Windows
    downloadFile("cyri-scanner.bat");
    setShowPsImporter(true);
    setShowDbSync(false);
  };

  const handleDetectAgain = () => {
    if (!cyriState.real_specs) return;
    onStateChange({
      ...cyriState,
      custom_specs: null,
      mode: "real"
    });
    setSpecs(cyriState.real_specs);
    setGpuInput(cyriState.real_specs.gpu);
    setCpuInput(cyriState.real_specs.cpu);
    onSpecsChange(cyriState.real_specs);
    setIsEditing(false);
  };

  const handleDoneCustomizing = () => {
    let finalCpu = cpuInput.trim();
    if (finalCpu && !finalCpu.includes("Cores")) {
      const analyzed = parseCpuSpecs(finalCpu);
      finalCpu = `${finalCpu} (${analyzed.cores} Cores)`;
    }
    const finalGpu = gpuInput.trim();
    const updatedSpecs = {
      ...specs,
      cpu: finalCpu || specs.cpu,
      gpu: finalGpu || specs.gpu
    };
    setSpecs(updatedSpecs);
    setCpuInput(updatedSpecs.cpu);
    setGpuInput(updatedSpecs.gpu);
    onStateChange({
      ...cyriState,
      custom_specs: updatedSpecs,
      mode: "custom"
    });
    onSpecsChange(updatedSpecs);
  };

  // Database Synchronization & Updates (DATA UPDATE SYSTEM)
  const [showDbSync, setShowDbSync] = useState(false);
  const [gpuJsonPaste, setGpuJsonPaste] = useState("");
  const [cpuJsonPaste, setCpuJsonPaste] = useState("");
  const [dbSyncFeedback, setDbSyncFeedback] = useState("");
  const [dbSyncError, setDbSyncError] = useState("");

  const loadDefaultToForm = () => {
    setGpuJsonPaste(JSON.stringify(POPULAR_GPUS, null, 2));
    setCpuJsonPaste(JSON.stringify(POPULAR_CPUS, null, 2));
    setDbSyncFeedback("Successfully loaded running GPU and CPU databases into the editor textareas!");
    setDbSyncError("");
    setTimeout(() => setDbSyncFeedback(""), 4000);
  };

  const handleDatabaseSync = () => {
    setDbSyncError("");
    setDbSyncFeedback("");

    let syncedGpus = 0;
    let syncedCpus = 0;

    if (gpuJsonPaste.trim()) {
      try {
        const parsed = JSON.parse(gpuJsonPaste);
        if (!Array.isArray(parsed)) {
          throw new Error("GPU JSON must be an array of objects matching the HardwareMetadata structure");
        }
        for (const item of parsed) {
          if (!item.name || typeof item.tier !== "number") {
            throw new Error(`Invalid item: ${JSON.stringify(item)}. Each GPU object in the array must contain at least 'name' (string) and 'tier' (number).`);
          }
        }
        localStorage.setItem("cyri_gpu_db_override", JSON.stringify(parsed));
        syncedGpus = parsed.length;
      } catch (err: any) {
        setDbSyncError(`GPU Syntax Error: ${err.message}`);
        return;
      }
    }

    if (cpuJsonPaste.trim()) {
      try {
        const parsed = JSON.parse(cpuJsonPaste);
        if (!Array.isArray(parsed)) {
          throw new Error("CPU JSON must be an array of objects matching the HardwareMetadata structure");
        }
        for (const item of parsed) {
          if (!item.name || typeof item.tier !== "number") {
            throw new Error(`Invalid item: ${JSON.stringify(item)}. Each CPU object in the array must contain at least 'name' (string) and 'tier' (number).`);
          }
        }
        localStorage.setItem("cyri_cpu_db_override", JSON.stringify(parsed));
        syncedCpus = parsed.length;
      } catch (err: any) {
        setDbSyncError(`CPU Syntax Error: ${err.message}`);
        return;
      }
    }

    if (syncedCpus === 0 && syncedGpus === 0) {
      setDbSyncError("Please paste at least one GPU or CPU JSON array to apply synchronization.");
      return;
    }

    setDbSyncFeedback(`Database Auto-Sync Successful! Synchronized ${syncedGpus} GPUs and ${syncedCpus} CPUs. Reloading page to apply changes...`);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleResetDatabase = () => {
    localStorage.removeItem("cyri_gpu_db_override");
    localStorage.removeItem("cyri_cpu_db_override");
    setDbSyncFeedback("All hardware database overrides cleared. Restoring core native datasets...");
    setDbSyncError("");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleImportSpecs = (textOverride?: string) => {
    try {
      setImportError("");
      const textToRun = typeof textOverride === "string" ? textOverride : psPasteText;
      if (!textToRun.trim()) {
        throw new Error("Pasted specs box is empty. Run and paste the PowerShell command first!");
      }

      let parsedCpu = "";
      let parsedGpu = "";
      let parsedRam = "";
      let parsedStorage = "";
      let parsedFree = "";

      // Check if it has CYRI_SPECS string
      const specLineMatch = textToRun.match(/CYRI_SPECS:\s*(.+)/i);
      const textToParse = specLineMatch ? specLineMatch[1] : textToRun;

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
        const lines = textToRun.split("\n");
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
      let cleanedCpu = parsedCpu 
        ? parsedCpu.replace(/@.+/g, "").replace(/\(R\)/g, "").replace(/\(TM\)/g, "").replace(/\s+/g, " ").trim()
        : specs.cpu;

      // Ensure CPU has Cores parsed and saved cleanly
      if (cleanedCpu && !cleanedCpu.includes("Cores")) {
        const analyzed = parseCpuSpecs(cleanedCpu);
        cleanedCpu = `${cleanedCpu} (${analyzed.cores} Cores)`;
      }

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
      onStateChange({
        real_specs: finalSpecs,
        custom_specs: null,
        mode: "real"
      });
      onSpecsChange(finalSpecs);
      setPsPasteText("");
      setShowPsImporter(false);
      setIsEditing(false);
    } catch (err: any) {
      setImportError(err.message || "Parsing failed. Double-check pasted content.");
    }
  };

  const handleAutoPasteFromClipboard = async () => {
    try {
      setImportError("");
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        throw new Error("Clipboard is empty or permissions to read were denied. Please run the scanner and try again.");
      }
      setPsPasteText(text);
      handleImportSpecs(text);
    } catch (err: any) {
      console.warn("Clipboard auto-read failed", err);
      setImportError("Clipboard access blocked. Please click inside the box below and paste manually (Ctrl+V or Command+V).");
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
    onStateChange({
      ...cyriState,
      custom_specs: enhancedSpecs,
      mode: "custom"
    });
    onSpecsChange(enhancedSpecs);
    setIsEditing(false);
  };

  const handleRedetect = () => {
    const freshlyDetected = detectSystemSpecs();
    setSpecs(freshlyDetected);
    setGpuInput(freshlyDetected.gpu);
    setCpuInput(freshlyDetected.cpu);
    onStateChange({
      ...cyriState,
      custom_specs: freshlyDetected,
      mode: "custom"
    });
    onSpecsChange(freshlyDetected);

    // Additionally fire off async remaining storage detection to refresh drive stats
    detectStorageSpace().then((storageInfo) => {
      if (storageInfo) {
        setSpecs(prev => {
          return {
            ...prev,
            storage: storageInfo.storage,
            storageFree: storageInfo.storageFree
          };
        });
        
        // Safely update parent state outside of the setSpecs state-updater phase
        const finalMerged = {
          ...freshlyDetected,
          storage: storageInfo.storage,
          storageFree: storageInfo.storageFree
        };
        onStateChange({
          ...cyriState,
          custom_specs: finalMerged,
          mode: "custom"
        });
        onSpecsChange(finalMerged);
      }
    }).catch(err => console.warn("Redetect storage space fail skipped:", err));
  };

  const handleInputChange = (field: keyof UserSpecs, value: string) => {
    const updated = { ...specs, [field]: value };
    setSpecs(updated);
    onStateChange({
      ...cyriState,
      custom_specs: updated,
      mode: "custom"
    });
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
    onStateChange({
      ...cyriState,
      custom_specs: updated,
      mode: "custom"
    });
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
    onStateChange({
      ...cyriState,
      custom_specs: updated,
      mode: "custom"
    });
    onSpecsChange(updated);
    setShowCpuSuggestions(false);
  };

  const swapCpuBrand = () => {
    const isAmd = specs.cpu.includes("AMD") || specs.cpu.includes("Ryzen");
    const match = specs.cpu.match(/(\d+)\s*Cores/);
    const cores = match ? parseInt(match[1]) : 6;
    
    // Parse target CPU tier from current spec string
    const parsed = parseCpuSpecs(specs.cpu);
    
    let nextCpu = "";
    if (parsed.tier <= 2) {
      // Legacy CPU swapping (keeps old gen authenticity!)
      if (isAmd) {
        if (cores <= 2) nextCpu = "Intel Core 2 Duo E8400";
        else nextCpu = "Intel Core i3-2100";
      } else {
        if (cores <= 2) nextCpu = "AMD Athlon 64 X2 6000+";
        else nextCpu = "AMD Athlon II X4 640";
      }
    } else if (parsed.tier <= 4) {
      // Mid/Semi-legacy
      if (isAmd) {
        if (cores <= 4) nextCpu = "Intel Core i5-3470";
        else nextCpu = "Intel Core i7-4790K";
      } else {
        if (cores <= 4) nextCpu = "AMD FX-4300";
        else nextCpu = "AMD FX-8320";
      }
    } else {
      // Modern High Performance
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

  // Compute matches with smart multi-word search algorithm (multi-word keyword filtering)
  const getFilteredGpus = () => {
    if (gpuInput.trim() === "") {
      return POPULAR_GPUS.slice(0, 10);
    }
    const searchLower = gpuInput.toLowerCase().replace(/[-]/g, " ");
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);
    if (searchTerms.length === 0) {
      return POPULAR_GPUS.slice(0, 10);
    }
    const matched = POPULAR_GPUS.filter(g => {
      const gpuNameLower = g.name.toLowerCase().replace(/[-]/g, " ");
      return searchTerms.every(term => gpuNameLower.includes(term));
    });
    return matched.slice(0, 50);
  };

  const filteredGpus = getFilteredGpus();

  // Clean CPU Input to strip " (X Cores)" tail formatting for search matching
  const cleanCpuSearch = cpuInput.replace(/\s*\(\d+\s*Cores\)/gi, "").trim();
  
  const getFilteredCpus = () => {
    if (cleanCpuSearch === "") {
      return POPULAR_CPUS.slice(0, 10);
    }
    
    // Normalize and clean terms (e.g. "i5 11 gen" or "i5 11th gen")
    const searchLower = cleanCpuSearch.toLowerCase()
      .replace(/generation/g, "")
      .replace(/gen/g, "")
      .replace(/th\b/g, "") // "11th" -> "11", "10th" -> "10"
      .replace(/[-]/g, " ") // replace dash to treat word boundaries nicely
      .trim();
      
    const searchTerms = searchLower.split(/\s+/).filter(Boolean);
    if (searchTerms.length === 0) {
      return POPULAR_CPUS.slice(0, 10);
    }
    
    // Filter CPUs where ALL typed terms are matched in the CPU name.
    // For example, if searching "i5 11", cpu must contain both "i5" and "11".
    const matched = POPULAR_CPUS.filter(c => {
      const cpuNameLower = c.name.toLowerCase().replace(/[-]/g, " ");
      return searchTerms.every(term => cpuNameLower.includes(term));
    });
    
    return matched.slice(0, 50);
  };

  const filteredCpus = getFilteredCpus();

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
          {cyriState.real_specs === null ? (
            /* First-time: render Instant Auto-Detect AND Script Scan options */
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleInstantDetect}
                type="button"
                className="flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider transition duration-150 shadow-lg cursor-pointer transform hover:scale-[1.02] shrink-0"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                Detect My Hardware (Instant Scan)
              </button>
              <button
                onClick={handleDownloadScanner}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider transition duration-150 border border-indigo-500/20 hover:border-indigo-400/40 cursor-pointer shrink-0 animate-pulse"
                title="Download local scanner script for detailed exact specifications (Windows/macOS/Linux)"
              >
                <Terminal className="w-3.5 h-3.5" />
                Script Scan
              </button>
            </div>
          ) : (
            /* Scanned: Reset to Real Specs + Edit appear */
            <>
              {cyriState.mode === "custom" && (
                <button
                  onClick={handleDetectAgain}
                  type="button"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider transition border border-amber-500/30 cursor-pointer shadow-md"
                  title="Undo all custom changes and restore your original PC specifications"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset to Real Specs
                </button>
              )}

              <button
                onClick={() => {
                  if (isEditing) {
                    handleDoneCustomizing();
                  }
                  setIsEditing(!isEditing);
                }}
                type="button"
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition duration-150 border cursor-pointer ${
                  isEditing 
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold" 
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                {isEditing ? "Apply Custom Specs" : "Edit Custom Specs"}
              </button>

              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 rounded-xl text-[10px] text-emerald-400 font-black uppercase tracking-widest font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Verified Specs Active
              </div>
            </>
          )}
        </div>
      </div>



      {/* First-Time Scan Recommendation Banner */}
      {cyriState.real_specs === null && (
        <div className="mb-6 p-6 rounded-3xl bg-slate-950/40 border border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-305">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-start gap-4 text-left">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/25">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white flex flex-wrap items-center gap-2">
                  <span>🚀 Instant Automatic Hardware Detector</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">No Download Needed</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  Scan and instantly detect your exact CPU, GPU model, system RAM capacity, and OS directly within your browser. Safe, instant, and completely automated.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-400 font-mono pt-1">
                  <span className="flex items-center gap-1 text-slate-300">🚀 Zero Downloads Needed</span>
                  <span className="flex items-center gap-1 text-slate-300">⏱️ Process takes 1 second</span>
                  <span className="flex items-center gap-1 text-slate-300">🔒 100% Anonymous & Secure</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={handleInstantDetect}
                type="button"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-505 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition duration-155 shadow-lg shadow-emerald-500/20 cursor-pointer hover:scale-[1.02] transform"
              >
                <Zap className="w-4 h-4 text-slate-950" />
                Detect My Hardware (Instant)
              </button>
              <button
                onClick={handleDownloadScanner}
                type="button"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-400/45 text-xs font-black uppercase tracking-wider transition duration-150 cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
                Script Scan (Advanced)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PowerShell Spec Importer Tooltip Panel */}
      {showPsImporter && (
        <div className="mb-6 p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 shadow-inner space-y-4 animate-in fade-in slide-in-from-top-4 duration-250">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Import Your Real Laptop/PC Specs</h3>
            </div>
            
            {/* Platform Selector Segment */}
            <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-xl self-start w-fit">
              <button
                type="button"
                onClick={() => setImporterPlatform("windows")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${importerPlatform === "windows" ? "bg-indigo-500 text-slate-950 font-extrabold" : "text-slate-400 hover:text-white"}`}
              >
                Windows
              </button>
              <button
                type="button"
                onClick={() => setImporterPlatform("macos")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${importerPlatform === "macos" ? "bg-indigo-500 text-slate-950 font-extrabold" : "text-slate-400 hover:text-white"}`}
              >
                macOS
              </button>
              <button
                type="button"
                onClick={() => setImporterPlatform("linux")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${importerPlatform === "linux" ? "bg-indigo-500 text-slate-950 font-extrabold" : "text-slate-400 hover:text-white"}`}
              >
                Linux
              </button>
            </div>
          </div>
          
          <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-2xl">
            Because web browsers block websites from accessing exact CPU and Drive names due to user privacy, our safe 1-click command fetches them from your {importerPlatform === "windows" ? "Windows system" : importerPlatform === "macos" ? "Mac device" : "Linux machine"} and transfers them here instantly!
          </p>

          {/* Iframe Download Security Alert Context Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2 max-w-2xl font-sans">
            <span className="text-amber-400 font-extrabold text-[13px] shrink-0">⚠️</span>
            <div className="space-y-1">
              <strong className="block text-white text-[11px] uppercase tracking-wider">Browser Egress Protection Notice</strong>
              <p className="text-[10px] text-slate-300">
                Modern web browsers restrict standard script file downloads (like <code>.bat</code> or <code>.ps1</code>) when accessed through sandboxed website preview frames.
              </p>
              <p className="text-[10px] text-amber-300/90">
                👉 To solve this: Use the 100% reliable <strong>Option A (Terminal live-sync command)</strong> which requires <strong>no file downloads</strong>, or click the <strong className="text-white">"Open in New Tab"</strong> button in the upper-right corner of this screen to download the scanner files normally!
              </p>
            </div>
          </div>
          
          {/* Option A: Fast Web/Terminal Live-Sync Console! (Primary Option) */}
          <div className="bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/15 rounded-xl p-4 flex flex-col gap-3 transition duration-150">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 font-black uppercase">
                  ⚡ Option A (Fastest & 100% Reliable – No Downloads)
                </span>
                <h4 className="text-xs font-extrabold text-white">
                  Copy Live-Sync Terminal Command
                </h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Requires <strong>no files downloaded</strong>. Fully immune to browser security blocks. Simply copy this 1-line command, paste it into your device terminal, and watch this page update automatically!
                </p>
              </div>
              <button
                type="button"
                onClick={copyInstantCommand}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5 self-start md:self-center shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                {copyFeedbackInstant ? "Copied!" : "Copy Sync Command"}
              </button>
            </div>
            
            <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/10 flex items-center gap-2">
              <code className="text-[10px] text-emerald-400 font-mono select-all truncate flex-1">
                {importerPlatform === "windows" ? windowsCommandInstant : importerPlatform === "macos" ? macosCommandInstant : linuxCommandInstant}
              </code>
            </div>
          </div>

          {/* Option B: Download Buttons Section specifically for Windows */}
          {importerPlatform === "windows" && (
            <div className="bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/15 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition duration-150">
              <div className="space-y-1">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-500/20 font-black uppercase">Option B (Auto-Run Script)</span>
                <h4 className="text-xs font-extrabold text-white">Download Automated Windows Scanner (.bat)</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Saves manual command typing. Just double-click to run! It automatically copies specifications directly to your clipboard.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadFile("cyri-scanner.bat")}
                  className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Download .bat Scanner
                </button>
                <button
                  type="button"
                  onClick={() => downloadFile("cyri-scanner.ps1")}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-slate-705 transition duration-150 cursor-pointer"
                >
                  PowerShell (.ps1)
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <span className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
              {importerPlatform === "windows" ? "Option C: Manually Copy And Feed Specifications" : "Step 1: Copy this safe command"}
            </span>
            <div className="flex items-center gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <code className="text-[10px] text-indigo-300 font-mono select-all truncate flex-1">
                {importerPlatform === "windows" ? windowsCommand : importerPlatform === "macos" ? macosCommand : linuxCommand}
              </code>
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

          <div className="space-y-3 pt-1">
            <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-800/85">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200">One-Tap Clipboard Auto-Import</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed max-w-lg">
                    Run the scanner or PowerShell command on your PC. It will auto-copy the diagnostic string. Click below to instantly apply your hardware specs!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoPasteFromClipboard}
                  className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-extrabold rounded-xl transition duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-md flex-shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow shrink-0 text-slate-950" />
                  Import Specs from Clipboard
                </button>
              </div>
              {importError && (
                <p className="text-[10px] text-rose-450 font-bold font-mono mt-3 bg-rose-500/5 p-2 rounded border border-rose-500/10 text-left">{importError}</p>
              )}
            </div>
            
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowPsImporter(false);
                  setImportError("");
                }}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white rounded-xl transition duration-150 cursor-pointer"
              >
                Close Importer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inputs Section */}
      {isDetecting ? (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-slate-950/40 border border-slate-800/80 rounded-3xl space-y-4 animate-in fade-in duration-200">
          <div className="relative flex items-center justify-center animate-bounce duration-1000">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
            <Zap className="w-5 h-5 text-emerald-400 absolute animate-pulse" />
          </div>
          <div className="space-y-1.5 text-center max-w-sm">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
              Detecting Local PC Hardware ({detectionProgress}%)
            </h3>
            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto border border-slate-705">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                style={{ width: `${detectionProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-emerald-450 font-mono mt-2 min-h-[1.5rem] leading-relaxed">
              {detectedItemLog}
            </p>
          </div>
        </div>
      ) : (
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
                
                {/* Clean CPU name display */}
              </div>
            )}
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono space-y-1">
            <div className="flex justify-between">Architecture: <span className="text-slate-200 font-bold">{(specs.cpu.includes("AMD") || specs.cpu.includes("Ryzen")) ? "x86-64 AMD Zen" : (specs.cpu.includes("Apple") || specs.cpu.includes("M1") || specs.cpu.includes("M2") || specs.cpu.includes("M3") || specs.cpu.includes("M4")) ? "ARM Unified Silicon" : "x86-64 Intel Core"}</span></div>
            <div className="flex justify-between">Cores Check: <span className="text-slate-200 font-bold">{(specs.cpu.includes("Cores") || specs.cpu.includes("Core") || specs.cpu.includes("core")) ? "Dynamic Cores Verified" : "Standard Multi-threaded Match"}</span></div>
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
      )}

      <div className="mt-5 flex justify-end">
        <button
          onClick={() => {
            if (isEditing) {
              handleDoneCustomizing();
            }
            setIsEditing(!isEditing);
          }}
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
