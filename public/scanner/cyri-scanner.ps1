# Can You Run It (CYRI) Hardware Scanner Script
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
Write-Output ">>> PLUG AND PLAY SPECS RESULT STRING (AUTO-COPIED!):"
Write-Output "---------------------------------------------------------"
$specString = "CYRI_SPECS: CPU=$cpu|GPU=$gpu|RAM=$ram|Storage=$storage|Free=$free"
Write-Output $specString
Write-Output "---------------------------------------------------------"
Write-Output ""
try {
    $specString | clip
    Write-Output "🚀 SUCCESS! Your spec string has been automatically copied"
    Write-Output "   to your clipboard. Just switch back to your browser!"
} catch {
    Write-Output "Simply highlight the CYRI_SPECS line above, copy it (Ctrl+C), and paste"
    Write-Output "it into the dashboard importer text box to instantly evaluate your specs!"
}
Write-Output ""
Read-Host "Press ENTER to complete evaluation and exit..."
