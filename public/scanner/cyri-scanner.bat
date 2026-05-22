@echo off
title Can You Run It (CYRI) Hardware Scanner
echo =========================================================
echo       CAN YOU RUN IT (CYRI) COMPUTER HARDWARE SCANNER
echo =========================================================
echo.
echo Running diagnostic hardware query... please wait...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$cpuObj = Get-CimInstance Win32_Processor; $rawCpu = $cpuObj.Name; $cpu = $rawCpu.Replace('@', '').Replace('(R)', '').Replace('(TM)', '').Replace('  ', ' ').Trim(); $gpuObj = Get-CimInstance Win32_VideoController | Select-Object -First 1; $rawGpu = $gpuObj.Name; $gpu = $rawGpu.Replace('(R)', '').Replace('(TM)', '').Replace('  ', ' ').Trim(); $ramBytes = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory; $ramGB = [Math]::Round($ramBytes / 1GB); $ram = \"$ramGB GB\"; $disk = Get-CimInstance Win32_LogicalDisk -Filter \"DeviceID='C:'\"; $diskFreeGB = [Math]::Round($disk.FreeSpace / 1GB); $diskSizeGB = [Math]::Round($disk.Size / 1GB); $storage = \"$diskSizeGB GB SSD\"; $free = \"$diskFreeGB GB Free\"; Write-Output '========================================================='; Write-Output '            DETECTION RESULTS ^& SPECIFICATIONS'; Write-Output '========================================================='; Write-Output \"Operating System: Windows\"; Write-Output \"Processor (CPU):  $cpu\"; Write-Output \"Graphics (GPU):   $gpu\"; Write-Output \"Memory (RAM):     $ram\"; Write-Output \"System Drive (C): $storage ($free remaining)\"; Write-Output '---------------------------------------------------------'; Write-Output '>>> PLUG AND PLAY SPECS RESULT STRING (AUTO-COPIED!):'; Write-Output '---------------------------------------------------------'; $resultStr = \"CYRI_SPECS: CPU=$cpu|GPU=$gpu|RAM=$ram|Storage=$storage|Free=$free\"; Write-Output $resultStr; Write-Output '---------------------------------------------------------'; try { $resultStr | clip; Write-Output '🚀 SUCCESS! Your spec string has been automatically copied'; Write-Output '   to your clipboard. Just switch back to your browser!'; } catch { Write-Output '   Please highlight the CYRI_SPECS line above and copy it (Ctrl+C).'; } Write-Output '=========================================================';"

echo.
echo Press any key to return to your browser and paste...
pause >nul
