@echo off
title Can You Run It (CYRI) Hardware Scanner
echo =========================================================
echo       CAN YOU RUN IT (CYRI) COMPUTER HARDWARE SCANNER
echo =========================================================
echo.
echo Running diagnostic hardware query... please wait...
echo.

if exist "%~dp0cyri-scanner.ps1" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0cyri-scanner.ps1"
    goto end
)

set TEMP_PS1=%TEMP%\cyri_scanner_temp.ps1

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
echo Write-Output ">>> PLUG AND PLAY SPECS RESULT STRING (AUTO-COPIED!):" >> "%TEMP_PS1%"
echo Write-Output "---------------------------------------------------------" >> "%TEMP_PS1%"
echo $specString = "CYRI_SPECS: CPU=$cpu^|GPU=$gpu^|RAM=$ram^|Storage=$storage^|Free=$free" >> "%TEMP_PS1%"
echo Write-Output $specString >> "%TEMP_PS1%"
echo Write-Output "---------------------------------------------------------" >> "%TEMP_PS1%"
echo Write-Output "" >> "%TEMP_PS1%"
echo try { >> "%TEMP_PS1%"
echo     $specString ^| clip >> "%TEMP_PS1%"
echo     Write-Output "🚀 SUCCESS! Your spec string has been automatically copied" >> "%TEMP_PS1%"
echo     Write-Output "   to your clipboard. Just switch back to your browser!" >> "%TEMP_PS1%"
echo } catch { >> "%TEMP_PS1%"
echo     Write-Output "Simply highlight the CYRI_SPECS line above, copy it (Ctrl+C), and paste" >> "%TEMP_PS1%"
echo     Write-Output "it into the dashboard importer text box to instantly evaluate your specs!" >> "%TEMP_PS1%"
echo } >> "%TEMP_PS1%"
echo Write-Output "" >> "%TEMP_PS1%"
echo Read-Host "Press ENTER to complete evaluation and exit..." >> "%TEMP_PS1%"

powershell -NoProfile -ExecutionPolicy Bypass -File "%TEMP_PS1%"

if exist "%TEMP_PS1%" del "%TEMP_PS1%"

:end
echo.
echo =========================================================
echo Script complete! If auto-copy succeeded, your specs are in your clipboard.
echo In your browser, click 'Auto-Import' or press Ctrl+V to paste the spec string.
echo =========================================================
echo.
echo Press any key to close this window...
pause >nul
