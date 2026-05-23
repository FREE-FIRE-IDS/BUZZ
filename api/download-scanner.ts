import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { token, type } = req.query;
  if (!token) {
    res.status(400).send("Session token is required");
    return;
  }

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host;
  const appUrl = `${protocol}://${host}`;

  if (type === "ps1") {
    const psScript = `# Can You Run It (CYRI) Hardware Scanner Script
# Run this on your Windows PC to fetch exact specs.

$cpuObj = Get-CimInstance Win32_Processor
$rawCpu = $cpuObj.Name
$cpu = $rawCpu.Replace("@", "").Replace("(R)", "").Replace("(TM)", "").Replace("  ", " ").Trim()

$gpuObj = Get-CimInstance Win32_VideoController | Select-Object -First 1
$rawGpu = $gpuObj.Name
$gpu = $rawGpu.Replace("(R)", "").Replace("(TM)", "").Replace("  ", " ").Trim()

$ramBytes = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory
$ramGB = [Math]::Round($ramBytes / 1GB)
$ram = "$ramGB GB"

$disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
$diskFreeGB = [Math]::Round($disk.FreeSpace / 1GB)
$diskSizeGB = [Math]::Round($disk.Size / 1GB)
$storage = "$diskSizeGB GB SSD"
$free = "$diskFreeGB GB Free"

Clear-Host
Write-Output "========================================================="
Write-Output "       CAN YOU RUN IT (CYRI) COMPUTER HARDWARE SCANNER   "
Write-Output "========================================================="
Write-Output ""
Write-Output "Operating System: Windows"
Write-Output "Processor (CPU):  $cpu"
Write-Output "Graphics (GPU):   $gpu"
Write-Output "Memory (RAM):     $ram"
Write-Output "System Drive (C): $storage ($free remaining)"
Write-Output ""
Write-Output "---------------------------------------------------------"
Write-Output ">>> CONNECTING AND TRANSMITTING SPECS DYNAMICALLY..."
Write-Output "---------------------------------------------------------"

$specString = "CYRI_SPECS: CPU=$cpu|GPU=$gpu|RAM=$ram|Storage=$storage|Free=$free"

$payload = @{
    token = "${token}"
    cpu = $cpu
    gpu = $gpu
    ram = $ram
    storage = $storage
    free = $free
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "${appUrl}/api/submit-specs" -Method Post -Body $payload -ContentType "application/json" -TimeoutSec 10
    Write-Output "🚀 SUCCESS! Your exact PC specifications have been sent back."
    Write-Output "   Go back to your browser tab immediately; your hardware is detected!"
} catch {
    Write-Output "⚠️ Online sync failed. Falling back to clipboard copy..."
    try {
        $specString | clip
        Write-Output "🚀 Your specs have been automatically copied to your clipboard!"
        Write-Output "   Switch back to your browser, click 'Import from Clipboard' or paste (Ctrl+V)!"
    } catch {
        Write-Output "Please highlight the spec line below and copy it manually:"
        Write-Output $specString
    }
}

Write-Output ""
Read-Host "Press ENTER to complete evaluation and exit..."
`;
    res.setHeader("Content-Disposition", "attachment; filename=cyri-scanner.ps1");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(psScript);
  } else {
    // Generate .bat script that compiles the temporary ps1
    const batScript = `@echo off
title Can You Run It (CYRI) Hardware Scanner
echo =========================================================
echo       CAN YOU RUN IT (CYRI) COMPUTER HARDWARE SCANNER
echo =========================================================
echo.
echo Running diagnostic hardware query... please wait...
echo.

set TEMP_PS1=%TEMP%\\cyri_scanner_temp.ps1

echo # Temporarily generated diagnostic script > "%TEMP_PS1%"
echo $cpuObj = Get-CimInstance Win32_Processor >> "%TEMP_PS1%"
echo $rawCpu = $cpuObj.Name >> "%TEMP_PS1%"
echo $cpu = $rawCpu.Replace("@", "").Replace("(R)", "").Replace("(TM)", "").Replace("  ", " ").Trim() >> "%TEMP_PS1%"
echo $gpuObj = Get-CimInstance Win32_VideoController ^| Select-Object -First 1 >> "%TEMP_PS1%"
echo $rawGpu = $gpuObj.Name >> "%TEMP_PS1%"
echo $gpu = $rawGpu.Replace("(R)", "").Replace("(TM)", "").Replace("  ", " ").Trim() >> "%TEMP_PS1%"
echo $ramBytes = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory >> "%TEMP_PS1%"
echo $ramGB = [Math]::Round($ramBytes / 1GB) >> "%TEMP_PS1%"
echo $ram = "$ramGB GB" >> "%TEMP_PS1%"
echo $disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'" >> "%TEMP_PS1%"
echo $diskFreeGB = [Math]::Round($disk.FreeSpace / 1GB) >> "%TEMP_PS1%"
echo $diskSizeGB = [Math]::Round($disk.Size / 1GB) >> "%TEMP_PS1%"
echo $storage = "$diskSizeGB GB SSD" >> "%TEMP_PS1%"
echo $free = "$diskFreeGB GB Free" >> "%TEMP_PS1%"
echo Clear-Host >> "%TEMP_PS1%"
echo Write-Output "=========================================================" >> "%TEMP_PS1%"
echo Write-Output "       CAN YOU RUN IT (CYRI) COMPUTER HARDWARE SCANNER   " >> "%TEMP_PS1%"
echo Write-Output "=========================================================" >> "%TEMP_PS1%"
echo Write-Output "" >> "%TEMP_PS1%"
echo Write-Output "Operating System: Windows" >> "%TEMP_PS1%"
echo Write-Output "Processor (CPU):  $cpu" >> "%TEMP_PS1%"
echo Write-Output "Graphics (GPU):   $gpu" >> "%TEMP_PS1%"
echo Write-Output "Memory (RAM):     $ram" >> "%TEMP_PS1%"
echo Write-Output "System Drive (C): $storage ($free remaining)" >> "%TEMP_PS1%"
echo Write-Output "" >> "%TEMP_PS1%"
echo Write-Output "---------------------------------------------------------" >> "%TEMP_PS1%"
echo Write-Output ">>> CONNECTING AND TRANSMITTING SPECS DYNAMICALLY..." >> "%TEMP_PS1%"
echo Write-Output "---------------------------------------------------------" >> "%TEMP_PS1%"
echo $specString = "CYRI_SPECS: CPU=$cpu^|GPU=$gpu^|RAM=$ram^|Storage=$storage^|Free=$free" >> "%TEMP_PS1%"
echo $payload = @{ >> "%TEMP_PS1%"
echo     token = "${token}" >> "%TEMP_PS1%"
echo     cpu = $cpu >> "%TEMP_PS1%"
echo     gpu = $gpu >> "%TEMP_PS1%"
echo     ram = $ram >> "%TEMP_PS1%"
echo     storage = $storage >> "%TEMP_PS1%"
echo     free = $free >> "%TEMP_PS1%"
echo } ^| ConvertTo-Json >> "%TEMP_PS1%"
echo try { >> "%TEMP_PS1%"
echo     Invoke-RestMethod -Uri "${appUrl}/api/submit-specs" -Method Post -Body $payload -ContentType "application/json" -TimeoutSec 10 >> "%TEMP_PS1%"
echo     Write-Output "🚀 SUCCESS! Your exact PC specifications have been sent back." >> "%TEMP_PS1%"
echo     Write-Output "   Go back to your browser tab immediately; your hardware is detected!" >> "%TEMP_PS1%"
echo } catch { >> "%TEMP_PS1%"
echo     Write-Output "⚠️ Online sync failed. Falling back to clipboard copy..." >> "%TEMP_PS1%"
echo     try { >> "%TEMP_PS1%"
echo         $specString ^| clip >> "%TEMP_PS1%"
echo         Write-Output "🚀 Your specs have been automatically copied to your clipboard!" >> "%TEMP_PS1%"
echo         Write-Output "   Switch back to your browser, click 'Import from Clipboard' or paste (Ctrl+V)!" >> "%TEMP_PS1%"
echo     } catch { >> "%TEMP_PS1%"
echo         Write-Output "Please highlight the spec line below and copy it manually:" >> "%TEMP_PS1%"
echo         Write-Output $specString >> "%TEMP_PS1%"
echo     } >> "%TEMP_PS1%"
echo } >> "%TEMP_PS1%"
echo Write-Output "" >> "%TEMP_PS1%"
echo Read-Host "Press ENTER to complete evaluation and exit..." >> "%TEMP_PS1%"

powershell -NoProfile -ExecutionPolicy Bypass -File "%TEMP_PS1%"

if exist "%TEMP_PS1%" del "%TEMP_PS1%"

echo.
echo =========================================================
echo Evaluation completed! Go back to your browser window now.
echo =========================================================
echo.
pause
`;
    res.setHeader("Content-Disposition", "attachment; filename=cyri-scanner.bat");
    res.setHeader("Content-Type", "application/x-bat; charset=utf-8");
    res.status(200).send(batScript);
  }
}
