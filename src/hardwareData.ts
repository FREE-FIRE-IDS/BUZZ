/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HardwareMetadata {
  name: string;
  vram?: string;      // Exclusively for GPUs
  directx?: string;   // Exclusively for GPUs
  cores?: number;     // Exclusively for CPUs
  tier: number;       // Compatibility rank (1-10, higher is better)
  isIntegrated?: boolean; // For GPUs: indicates if integrated graphics
}

export const POPULAR_GPUS: HardwareMetadata[] = [
  // NVIDIA Ultra High-End & Next-Gen
  { name: "NVIDIA GeForce RTX 5090", vram: "32 GB", directx: "DirectX 12 (Ultimate)", tier: 10 },
  { name: "NVIDIA GeForce RTX 5080", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 10 },
  { name: "NVIDIA GeForce RTX 5070 Ti", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 10 },
  { name: "NVIDIA GeForce RTX 5075", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 9 },
  { name: "NVIDIA GeForce RTX 5070", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 9 },
  { name: "NVIDIA GeForce RTX 5060", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 8 },

  // NVIDIA RTX 40 Series
  { name: "NVIDIA GeForce RTX 4095", vram: "24 GB", directx: "DirectX 12 (Ultimate)", tier: 10 },
  { name: "NVIDIA GeForce RTX 4090", vram: "24 GB", directx: "DirectX 12 (Ultimate)", tier: 10 },
  { name: "NVIDIA GeForce RTX 4080 Super", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 10 },
  { name: "NVIDIA GeForce RTX 4080", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 9 },
  { name: "NVIDIA GeForce RTX 4070 Ti Super", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 9 },
  { name: "NVIDIA GeForce RTX 4070 Ti", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 9 },
  { name: "NVIDIA GeForce RTX 4070 Super", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 8 },
  { name: "NVIDIA GeForce RTX 4070", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 8 },
  { name: "NVIDIA GeForce RTX 4065", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "NVIDIA GeForce RTX 4060 Ti", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "NVIDIA GeForce RTX 4060", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "NVIDIA GeForce RTX 4050", vram: "6 GB", directx: "DirectX 12 (Ultimate)", tier: 5 },

  // NVIDIA RTX 30 Series
  { name: "NVIDIA GeForce RTX 3090 Ti", vram: "24 GB", directx: "DirectX 12 (Ultimate)", tier: 9 },
  { name: "NVIDIA GeForce RTX 3090", vram: "24 GB", directx: "DirectX 12 (Ultimate)", tier: 9 },
  { name: "NVIDIA GeForce RTX 3080 Ti", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 8 },
  { name: "NVIDIA GeForce RTX 3080 12GB", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 8 },
  { name: "NVIDIA GeForce RTX 3080", vram: "10 GB", directx: "DirectX 12 (Ultimate)", tier: 8 },
  { name: "NVIDIA GeForce RTX 3075", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "NVIDIA GeForce RTX 3070 Ti", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "NVIDIA GeForce RTX 3070", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "NVIDIA GeForce RTX 3060 Ti", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "NVIDIA GeForce RTX 3060 12GB", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "NVIDIA GeForce RTX 3060 8GB", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 5 },
  { name: "NVIDIA GeForce RTX 3050 8GB", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 5 },
  { name: "NVIDIA GeForce RTX 3050 6GB", vram: "6 GB", directx: "DirectX 12 (Ultimate)", tier: 4 },

  // NVIDIA RTX 20 Series
  { name: "NVIDIA GeForce RTX 2085 Ti", vram: "11 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "NVIDIA GeForce RTX 2080 Ti", vram: "11 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "NVIDIA GeForce RTX 2080 Super", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "NVIDIA GeForce RTX 2080", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "NVIDIA GeForce RTX 2075", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "NVIDIA GeForce RTX 2070 Super", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "NVIDIA GeForce RTX 2070", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "NVIDIA GeForce RTX 2060 Super", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "NVIDIA GeForce RTX 2060 12GB", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 5 },
  { name: "NVIDIA GeForce RTX 2060", vram: "6 GB", directx: "DirectX 12 (Ultimate)", tier: 5 },

  // NVIDIA GTX 16 Series
  { name: "NVIDIA GeForce GTX 1660 Ti", vram: "6 GB", directx: "DirectX 12", tier: 5 },
  { name: "NVIDIA GeForce GTX 1660 Super", vram: "6 GB", directx: "DirectX 12", tier: 5 },
  { name: "NVIDIA GeForce GTX 1660", vram: "6 GB", directx: "DirectX 12", tier: 4 },
  { name: "NVIDIA GeForce GTX 1650 Super", vram: "4 GB", directx: "DirectX 12", tier: 4 },
  { name: "NVIDIA GeForce GTX 1650 GDDR6", vram: "4 GB", directx: "DirectX 12", tier: 3 },
  { name: "NVIDIA GeForce GTX 1650", vram: "4 GB", directx: "DirectX 12", tier: 3 },
  { name: "NVIDIA GeForce GTX 1630", vram: "4 GB", directx: "DirectX 12", tier: 2 },

  // NVIDIA GTX 10 Series
  { name: "NVIDIA GeForce GTX 1080 Ti", vram: "11 GB", directx: "DirectX 12", tier: 6 },
  { name: "NVIDIA GeForce GTX 1080", vram: "8 GB", directx: "DirectX 12", tier: 5 },
  { name: "NVIDIA GeForce GTX 1070 Ti", vram: "8 GB", directx: "DirectX 12", tier: 5 },
  { name: "NVIDIA GeForce GTX 1070", vram: "8 GB", directx: "DirectX 12", tier: 4 },
  { name: "NVIDIA GeForce GTX 1060 6GB", vram: "6 GB", directx: "DirectX 12", tier: 4 },
  { name: "NVIDIA GeForce GTX 1060 3GB", vram: "3 GB", directx: "DirectX 12", tier: 3 },
  { name: "NVIDIA GeForce GTX 1050 Ti", vram: "4 GB", directx: "DirectX 12", tier: 3 },
  { name: "NVIDIA GeForce GTX 1050 3GB", vram: "3 GB", directx: "DirectX 12", tier: 2 },
  { name: "NVIDIA GeForce GTX 1050", vram: "2 GB", directx: "DirectX 12", tier: 2 },

  // NVIDIA GTX 900 / 700 / Legacy Series
  { name: "NVIDIA GeForce GTX Titan X", vram: "12 GB", directx: "DirectX 12", tier: 4 },
  { name: "NVIDIA GeForce GTX 980 Ti", vram: "6 GB", directx: "DirectX 12", tier: 4 },
  { name: "NVIDIA GeForce GTX 980", vram: "4 GB", directx: "DirectX 12 Feature Level 12_1", tier: 4 },
  { name: "NVIDIA GeForce GTX 970", vram: "4 GB", directx: "DirectX 12", tier: 3 },
  { name: "NVIDIA GeForce GTX 960", vram: "2 GB", directx: "DirectX 12 Feature Level 12_1", tier: 3 },
  { name: "NVIDIA GeForce GTX 950", vram: "2 GB", directx: "DirectX 12 Feature Level 12_1", tier: 2 },
  { name: "NVIDIA GeForce GTX 780 Ti", vram: "3 GB", directx: "DirectX 11 (Standard)", tier: 3 },
  { name: "NVIDIA GeForce GTX 780", vram: "3 GB", directx: "DirectX 11 (Standard)", tier: 2 },
  { name: "NVIDIA GeForce GTX 770", vram: "2 GB", directx: "DirectX 11 (Standard)", tier: 3 },
  { name: "NVIDIA GeForce GTX 760", vram: "2 GB", directx: "DirectX 11 (Standard)", tier: 2 },
  { name: "NVIDIA GeForce GTX 750 Ti", vram: "2 GB", directx: "DirectX 12 Feature Level 11_0", tier: 2 },
  { name: "NVIDIA GeForce GTX 750", vram: "1 GB", directx: "DirectX 11 (Standard)", tier: 2 },
  { name: "NVIDIA GeForce GTX 680", vram: "2 GB", directx: "DirectX 11 (Standard)", tier: 2 },
  { name: "NVIDIA GeForce GTX 660 Ti", vram: "2 GB", directx: "DirectX 11 (Standard)", tier: 2 },
  { name: "NVIDIA GeForce GTX 660", vram: "2 GB", directx: "DirectX 11 (Standard)", tier: 1 },
  { name: "NVIDIA GeForce GTX 580", vram: "1.5 GB", directx: "DirectX 11 (Standard)", tier: 1 },

  // NVIDIA Entry-Level GT Lineup
  { name: "NVIDIA GeForce GT 1030", vram: "2 GB", directx: "DirectX 12 Feature Level 12_1", tier: 2 },
  { name: "NVIDIA GeForce GT 740", vram: "2 GB", directx: "DirectX 11 (Standard)", tier: 1 },
  { name: "NVIDIA GeForce GT 730", vram: "2 GB", directx: "DirectX 12 Feature Level 11_0", tier: 1 },
  { name: "NVIDIA GeForce GT 710", vram: "1 GB", directx: "DirectX 12 Feature Level 11_0", tier: 1 },
  { name: "NVIDIA GeForce GT 610", vram: "1 GB", directx: "DirectX 11 (Legacy)", tier: 1 },
  { name: "NVIDIA GeForce GT 210", vram: "512 MB", directx: "DirectX 10 or older", tier: 1 },
  { name: "NVIDIA GeForce 9800 GT", vram: "512 MB", directx: "DirectX 10 or older", tier: 1 },
  { name: "NVIDIA GeForce 8800 GT", vram: "512 MB", directx: "DirectX 10 or older", tier: 1 },

  // AMD Radeon RX 7000 Series (RDNA 3)
  { name: "AMD Radeon RX 7950 XTX", vram: "24 GB", directx: "DirectX 12 (Ultimate)", tier: 10 },
  { name: "AMD Radeon RX 7900 XTX", vram: "24 GB", directx: "DirectX 12 (Ultimate)", tier: 10 },
  { name: "AMD Radeon RX 7900 XT", vram: "20 GB", directx: "DirectX 12 (Ultimate)", tier: 9 },
  { name: "AMD Radeon RX 7900 GRE", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 9 },
  { name: "AMD Radeon RX 7800 XT", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 8 },
  { name: "AMD Radeon RX 7700 XT", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 8 },
  { name: "AMD Radeon RX 7600 XT", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "AMD Radeon RX 7600", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },

  // AMD Radeon RX 6000 Series (RDNA 2)
  { name: "AMD Radeon RX 6950 XT", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 9 },
  { name: "AMD Radeon RX 6900 XT", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 9 },
  { name: "AMD Radeon RX 6800 XT", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 8 },
  { name: "AMD Radeon RX 6800", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 8 },
  { name: "AMD Radeon RX 6750 XT", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "AMD Radeon RX 6700 XT", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "AMD Radeon RX 6700", vram: "10 GB", directx: "DirectX 12 (Ultimate)", tier: 7 },
  { name: "AMD Radeon RX 6650 XT", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "AMD Radeon RX 6605 XT", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "AMD Radeon RX 6600 XT", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "AMD Radeon RX 6600", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "AMD Radeon RX 6500 XT", vram: "4 GB", directx: "DirectX 12 (Ultimate)", tier: 3 },
  { name: "AMD Radeon RX 6400", vram: "4 GB", directx: "DirectX 12 (Ultimate)", tier: 2 },

  // AMD Radeon RX 5000 Series (RDNA 1)
  { name: "AMD Radeon RX 5700 XT", vram: "8 GB", directx: "DirectX 12", tier: 5 },
  { name: "AMD Radeon RX 5700", vram: "8 GB", directx: "DirectX 12", tier: 5 },
  { name: "AMD Radeon RX 5600 XT", vram: "6 GB", directx: "DirectX 12", tier: 5 },
  { name: "AMD Radeon RX 5500 XT", vram: "8 GB", directx: "DirectX 12", tier: 4 },

  // AMD Radeon Polaris / Vega Series
  { name: "AMD Radeon VII", vram: "16 GB", directx: "DirectX 12", tier: 6 },
  { name: "AMD Radeon RX Vega 64", vram: "8 GB", directx: "DirectX 12", tier: 5 },
  { name: "AMD Radeon RX Vega 56", vram: "8 GB", directx: "DirectX 12", tier: 5 },
  { name: "AMD Radeon RX 590", vram: "8 GB", directx: "DirectX 12", tier: 4 },
  { name: "AMD Radeon RX 580", vram: "8 GB", directx: "DirectX 12", tier: 3 },
  { name: "AMD Radeon RX 570", vram: "4 GB", directx: "DirectX 12", tier: 3 },
  { name: "AMD Radeon RX 480", vram: "8 GB", directx: "DirectX 12", tier: 3 },
  { name: "AMD Radeon RX 470", vram: "4 GB", directx: "DirectX 12", tier: 3 },
  { name: "AMD Radeon RX 560", vram: "4 GB", directx: "DirectX 12", tier: 2 },
  { name: "AMD Radeon RX 550", vram: "2 GB", directx: "DirectX 12", tier: 2 },
  { name: "AMD Radeon RX 460", vram: "2 GB", directx: "DirectX 12", tier: 2 },

  // AMD Legacy R9 / R7 / HD Series
  { name: "AMD Radeon R9 Fury X", vram: "4 GB", directx: "DirectX 12 Feature Level 12_0", tier: 4 },
  { name: "AMD Radeon R9 Fury", vram: "4 GB", directx: "DirectX 12 Feature Level 12_0", tier: 4 },
  { name: "AMD Radeon R9 Nano", vram: "4 GB", directx: "DirectX 12 Feature Level 12_0", tier: 4 },
  { name: "AMD Radeon R9 295X2", vram: "8 GB", directx: "DirectX 11 (Standard)", tier: 4 },
  { name: "AMD Radeon R9 390X", vram: "8 GB", directx: "DirectX 12 Feature Level 12_0", tier: 4 },
  { name: "AMD Radeon R9 390", vram: "8 GB", directx: "DirectX 12 Feature Level 12_0", tier: 4 },
  { name: "AMD Radeon R9 385X", vram: "4 GB", directx: "DirectX 12 Feature Level 12_0", tier: 3 },
  { name: "AMD Radeon R9 380X", vram: "4 GB", directx: "DirectX 12 Feature Level 12_0", tier: 3 },
  { name: "AMD Radeon R9 380", vram: "4 GB", directx: "DirectX 12 Feature Level 12_0", tier: 3 },
  { name: "AMD Radeon R9 290X", vram: "4 GB", directx: "DirectX 12 Feature Level 12_0", tier: 4 },
  { name: "AMD Radeon R9 290", vram: "4 GB", directx: "DirectX 12 Feature Level 12_0", tier: 3 },
  { name: "AMD Radeon R9 285", vram: "2 GB", directx: "DirectX 12 Feature Level 12_0", tier: 3 },
  { name: "AMD Radeon R9 280X", vram: "3 GB", directx: "DirectX 11 (Standard)", tier: 3 },
  { name: "AMD Radeon R9 280", vram: "3 GB", directx: "DirectX 11 (Standard)", tier: 3 },
  { name: "AMD Radeon R9 270X", vram: "2 GB", directx: "DirectX 11 (Standard)", tier: 2 },
  { name: "AMD Radeon R9 270", vram: "2 GB", directx: "DirectX 11 (Standard)", tier: 2 },
  { name: "AMD Radeon HD 7990", vram: "6 GB", directx: "DirectX 11 (Legacy)", tier: 3 },
  { name: "AMD Radeon HD 7970 GHz Edition", vram: "3 GB", directx: "DirectX 11 (Legacy)", tier: 3 },
  { name: "AMD Radeon HD 7970", vram: "3 GB", directx: "DirectX 11 (Legacy)", tier: 3 },
  { name: "AMD Radeon HD 7950", vram: "3 GB", directx: "DirectX 11 (Legacy)", tier: 3 },
  { name: "AMD Radeon HD 7870", vram: "2 GB", directx: "DirectX 11 (Legacy)", tier: 2 },
  { name: "AMD Radeon HD 7850", vram: "2 GB", directx: "DirectX 11 (Legacy)", tier: 2 },
  { name: "AMD Radeon HD 6970", vram: "2 GB", directx: "DirectX 11 (Legacy)", tier: 1 },
  { name: "AMD Radeon HD 6870", vram: "1 GB", directx: "DirectX 11 (Legacy)", tier: 1 },
  { name: "AMD Radeon HD 5870", vram: "1 GB", directx: "DirectX 11 (Legacy)", tier: 1 },
  { name: "AMD Radeon HD 4870", vram: "512 MB", directx: "DirectX 10 or older", tier: 1 },

  // Intel Dedicated GPU Series
  { name: "Intel Arc B580", vram: "12 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "Intel Arc A770", vram: "16 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "Intel Arc A750", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 6 },
  { name: "Intel Arc A580", vram: "8 GB", directx: "DirectX 12 (Ultimate)", tier: 5 },
  { name: "Intel Arc A380", vram: "6 GB", directx: "DirectX 12 (Ultimate)", tier: 3 },

  // Intel Integrated GPU Series (isIntegrated: true)
  { name: "Intel Iris Xe Graphics", vram: "4 GB", directx: "DirectX 12", tier: 2, isIntegrated: true },
  { name: "Intel Iris Pro Graphics 5200", vram: "1.5 GB", directx: "DirectX 11 (Standard)", tier: 1, isIntegrated: true },
  { name: "Intel UHD Graphics 770", vram: "2 GB", directx: "DirectX 12", tier: 1, isIntegrated: true },
  { name: "Intel UHD Graphics 750", vram: "2 GB", directx: "DirectX 12", tier: 1, isIntegrated: true },
  { name: "Intel UHD Graphics 730", vram: "2 GB", directx: "DirectX 12", tier: 1, isIntegrated: true },
  { name: "Intel UHD Graphics 630", vram: "1.5 GB", directx: "DirectX 12", tier: 1, isIntegrated: true },
  { name: "Intel UHD Graphics 620", vram: "1 GB", directx: "DirectX 12", tier: 1, isIntegrated: true },
  { name: "Intel HD Graphics 630", vram: "1 GB", directx: "DirectX 12", tier: 1, isIntegrated: true },
  { name: "Intel HD Graphics 620", vram: "1 GB", directx: "DirectX 12", tier: 1, isIntegrated: true },
  { name: "Intel HD Graphics 530", vram: "1 GB", directx: "DirectX 12", tier: 1, isIntegrated: true },
  { name: "Intel HD Graphics 4600", vram: "1 GB", directx: "DirectX 11 (Legacy)", tier: 1, isIntegrated: true },
  { name: "Intel HD Graphics 4400", vram: "1 GB", directx: "DirectX 11 (Legacy)", tier: 1, isIntegrated: true },
  { name: "Intel HD Graphics 4000", vram: "512 MB", directx: "DirectX 11 (Legacy)", tier: 1, isIntegrated: true },
  { name: "Intel HD Graphics 3000", vram: "512 MB", directx: "DirectX 10 or older", tier: 1, isIntegrated: true },
  { name: "Intel HD Graphics 2000", vram: "512 MB", directx: "DirectX 10 or older", tier: 1, isIntegrated: true },

  // Apple Mac Integrated (M-Series unified silicon)
  { name: "Apple M3 Max GPU", vram: "48 GB", directx: "Metal/DirectX 12", tier: 9, isIntegrated: true },
  { name: "Apple M3 Pro GPU", vram: "18 GB", directx: "Metal/DirectX 12", tier: 6, isIntegrated: true },
  { name: "Apple M3 GPU", vram: "16 GB", directx: "Metal/DirectX 12", tier: 5, isIntegrated: true },
  { name: "Apple M2 Max GPU", vram: "32 GB", directx: "Metal/DirectX 12", tier: 8, isIntegrated: true },
  { name: "Apple M2 Pro GPU", vram: "16 GB", directx: "Metal/DirectX 12", tier: 5, isIntegrated: true },
  { name: "Apple M2 GPU", vram: "16 GB", directx: "Metal/DirectX 12", tier: 4, isIntegrated: true },
  { name: "Apple M1 Ultra GPU", vram: "64 GB", directx: "Metal/DirectX 12", tier: 9, isIntegrated: true },
  { name: "Apple M1 Max GPU", vram: "32 GB", directx: "Metal/DirectX 12", tier: 7, isIntegrated: true },
  { name: "Apple M1 Pro GPU", vram: "16 GB", directx: "Metal/DirectX 12", tier: 4, isIntegrated: true },
  { name: "Apple M1 GPU", vram: "8 GB", directx: "Metal/DirectX 12", tier: 3, isIntegrated: true }
];

export const POPULAR_CPUS: HardwareMetadata[] = [
  // Intel Core Ultra (Next-Gen Series 2 & 1)
  { name: "Intel Core Ultra 9 285K", cores: 24, tier: 10 },
  { name: "Intel Core Ultra 7 265K", cores: 20, tier: 9 },
  { name: "Intel Core Ultra 5 245K", cores: 14, tier: 8 },
  { name: "Intel Core Ultra 9 185H", cores: 16, tier: 8 },
  { name: "Intel Core Ultra 7 155H", cores: 16, tier: 8 },
  { name: "Intel Core Ultra 5 125H", cores: 14, tier: 7 },

  // Intel Core Gen 14 (Raptor Lake Refresh)
  { name: "Intel Core i9-14900KS", cores: 24, tier: 10 },
  { name: "Intel Core i9-14900K", cores: 24, tier: 10 },
  { name: "Intel Core i9-14900F", cores: 24, tier: 10 },
  { name: "Intel Core i7-14700K", cores: 20, tier: 9 },
  { name: "Intel Core i7-14700F", cores: 20, tier: 9 },
  { name: "Intel Core i5-14600K", cores: 14, tier: 8 },
  { name: "Intel Core i5-14400F", cores: 10, tier: 7 },
  { name: "Intel Core i5-14400", cores: 10, tier: 7 },
  { name: "Intel Core i3-14100F", cores: 4, tier: 5 },
  { name: "Intel Core i3-14100", cores: 4, tier: 5 },

  // Intel Core Gen 13 (Raptor Lake)
  { name: "Intel Core i9-13905KS", cores: 24, tier: 10 },
  { name: "Intel Core i9-13900KS", cores: 24, tier: 10 },
  { name: "Intel Core i9-13900K", cores: 24, tier: 10 },
  { name: "Intel Core i9-13900F", cores: 24, tier: 10 },
  { name: "Intel Core i7-13700K", cores: 16, tier: 9 },
  { name: "Intel Core i7-13700F", cores: 16, tier: 9 },
  { name: "Intel Core i5-13600K", cores: 14, tier: 8 },
  { name: "Intel Core i5-13500", cores: 14, tier: 7 },
  { name: "Intel Core i5-13400F", cores: 10, tier: 7 },
  { name: "Intel Core i5-13400", cores: 10, tier: 7 },
  { name: "Intel Core i3-13100F", cores: 4, tier: 5 },
  { name: "Intel Core i3-13100", cores: 4, tier: 5 },

  // Intel Core Gen 12 (Alder Lake)
  { name: "Intel Core i9-12900KS", cores: 16, tier: 9 },
  { name: "Intel Core i9-12900K", cores: 16, tier: 9 },
  { name: "Intel Core i9-12900F", cores: 16, tier: 9 },
  { name: "Intel Core i7-12750K", cores: 12, tier: 8 },
  { name: "Intel Core i7-12700K", cores: 12, tier: 8 },
  { name: "Intel Core i7-12700F", cores: 12, tier: 8 },
  { name: "Intel Core i5-12600K", cores: 10, tier: 7 },
  { name: "Intel Core i5-12500", cores: 6, tier: 6 },
  { name: "Intel Core i5-12400F", cores: 6, tier: 6 },
  { name: "Intel Core i5-12400", cores: 6, tier: 6 },
  { name: "Intel Core i3-12100F", cores: 4, tier: 5 },
  { name: "Intel Core i3-12100", cores: 4, tier: 5 },

  // AMD Ryzen 9000 Series (Zen 5)
  { name: "AMD Ryzen 9 9950X", cores: 16, tier: 10 },
  { name: "AMD Ryzen 9 9900X", cores: 12, tier: 10 },
  { name: "AMD Ryzen 7 9700X", cores: 8, tier: 9 },
  { name: "AMD Ryzen 5 9605X", cores: 6, tier: 8 },
  { name: "AMD Ryzen 5 9600X", cores: 6, tier: 8 },

  // AMD Ryzen 8000 Series (Zen 4 APUs)
  { name: "AMD Ryzen 7 8700G", cores: 8, tier: 8 },
  { name: "AMD Ryzen 5 8600G", cores: 6, tier: 7 },
  { name: "AMD Ryzen 5 8500G", cores: 6, tier: 7 },

  // AMD Ryzen 7000 Series (Zen 4)
  { name: "AMD Ryzen 9 7950X3D", cores: 16, tier: 10 },
  { name: "AMD Ryzen 9 7950X", cores: 16, tier: 10 },
  { name: "AMD Ryzen 9 7900X3D", cores: 12, tier: 9 },
  { name: "AMD Ryzen 9 7900X", cores: 12, tier: 9 },
  { name: "AMD Ryzen 7 7800X3D", cores: 8, tier: 10 },
  { name: "AMD Ryzen 7 7700X", cores: 8, tier: 8 },
  { name: "AMD Ryzen 7 7700", cores: 8, tier: 8 },
  { name: "AMD Ryzen 5 7600X", cores: 6, tier: 7 },
  { name: "AMD Ryzen 5 7600", cores: 6, tier: 7 },
  { name: "AMD Ryzen 5 7500F", cores: 6, tier: 7 },

  // AMD Ryzen 5000 Series (Zen 3)
  { name: "AMD Ryzen 9 5950X", cores: 16, tier: 9 },
  { name: "AMD Ryzen 9 5900X", cores: 12, tier: 9 },
  { name: "AMD Ryzen 7 5800X3D", cores: 8, tier: 9 },
  { name: "AMD Ryzen 7 5800X", cores: 8, tier: 8 },
  { name: "AMD Ryzen 7 5700X", cores: 8, tier: 8 },
  { name: "AMD Ryzen 7 5700G", cores: 8, tier: 7 },
  { name: "AMD Ryzen 5 5600X", cores: 6, tier: 7 },
  { name: "AMD Ryzen 5 5605", cores: 6, tier: 6 },
  { name: "AMD Ryzen 5 5600", cores: 6, tier: 6 },
  { name: "AMD Ryzen 5 5600G", cores: 6, tier: 6 },
  { name: "AMD Ryzen 5 5500", cores: 6, tier: 5 },
  { name: "AMD Ryzen 3 5300G", cores: 4, tier: 4 },

  // AMD Ryzen 3000 Series & 4000 Series (Zen 2)
  { name: "AMD Ryzen 9 3950X", cores: 16, tier: 9 },
  { name: "AMD Ryzen 9 3900X", cores: 12, tier: 8 },
  { name: "AMD Ryzen 7 3800X", cores: 8, tier: 7 },
  { name: "AMD Ryzen 7 3700X", cores: 8, tier: 7 },
  { name: "AMD Ryzen 5 3605X", cores: 6, tier: 6 },
  { name: "AMD Ryzen 5 3600X", cores: 6, tier: 6 },
  { name: "AMD Ryzen 5 3600", cores: 6, tier: 6 },
  { name: "AMD Ryzen 5 3400G", cores: 4, tier: 4 },
  { name: "AMD Ryzen 5 4505", cores: 6, tier: 5 },
  { name: "AMD Ryzen 5 4500", cores: 6, tier: 5 },
  { name: "AMD Ryzen 3 3300X", cores: 4, tier: 4 },
  { name: "AMD Ryzen 3 3100", cores: 4, tier: 3 },
  { name: "AMD Ryzen 3 4100", cores: 4, tier: 3 },

  // AMD Ryzen 2000 Series & 1000 Series (Zen 1 / Zen+)
  { name: "AMD Ryzen 7 2700X", cores: 8, tier: 6 },
  { name: "AMD Ryzen 7 2700", cores: 8, tier: 6 },
  { name: "AMD Ryzen 5 2605X", cores: 6, tier: 5 },
  { name: "AMD Ryzen 5 2600X", cores: 6, tier: 5 },
  { name: "AMD Ryzen 5 2600", cores: 6, tier: 5 },
  { name: "AMD Ryzen 5 2400G", cores: 4, tier: 4 },
  { name: "AMD Ryzen 3 2200G", cores: 4, tier: 3 },
  { name: "AMD Ryzen 7 1800X", cores: 8, tier: 5 },
  { name: "AMD Ryzen 7 1700", cores: 8, tier: 5 },
  { name: "AMD Ryzen 5 1605X", cores: 6, tier: 4 },
  { name: "AMD Ryzen 5 1600", cores: 6, tier: 4 },
  { name: "AMD Ryzen 5 1400", cores: 4, tier: 3 },
  { name: "AMD Ryzen 3 1200", cores: 4, tier: 2 },

  // AMD FX & Phenom & Athlon Legacy Series
  { name: "AMD FX-9590", cores: 8, tier: 2 },
  { name: "AMD FX-8350", cores: 8, tier: 2 },
  { name: "AMD FX-8320", cores: 8, tier: 2 },
  { name: "AMD FX-6300", cores: 6, tier: 2 },
  { name: "AMD FX-4300", cores: 4, tier: 1 },
  { name: "AMD Phenom II X6 1090T", cores: 6, tier: 2 },
  { name: "AMD Phenom II X4 965", cores: 4, tier: 1 },
  { name: "AMD Athlon II X4 640", cores: 4, tier: 1 },
  { name: "AMD Athlon 64 X2 6000+", cores: 2, tier: 1 },
  { name: "AMD Athlon 64 3000+", cores: 1, tier: 1 },

  // Apple Processors (ARM Unified Silicon)
  { name: "Apple M3 Max", cores: 16, tier: 10 },
  { name: "Apple M3 Pro", cores: 11, tier: 8 },
  { name: "Apple M3", cores: 8, tier: 7 },
  { name: "Apple M2 Ultra", cores: 24, tier: 10 },
  { name: "Apple M2 Max", cores: 12, tier: 9 },
  { name: "Apple M2 Pro", cores: 12, tier: 8 },
  { name: "Apple M2", cores: 8, tier: 6 },
  { name: "Apple M1 Ultra", cores: 20, tier: 9 },
  { name: "Apple M1 Max", cores: 10, tier: 8 },
  { name: "Apple M1 Pro", cores: 10, tier: 7 },
  { name: "Apple M1", cores: 8, tier: 5 }
];

export const VRAM_OPTIONS = [
  "512 MB",
  "1 GB",
  "1.5 GB",
  "2 GB",
  "3 GB",
  "4 GB",
  "6 GB",
  "8 GB",
  "10 GB",
  "11 GB",
  "12 GB",
  "16 GB",
  "18 GB",
  "20 GB",
  "24 GB",
  "32 GB",
  "48 GB",
  "64 GB",
  "Unified Apple Memory"
];

export const DDR_OPTIONS = [
  "DDR2 RAM",
  "DDR3 RAM",
  "DDR4 RAM",
  "DDR5 RAM",
  "Unified Memory"
];

export const DIRECTX_OPTIONS = [
  "DirectX 12 (Ultimate)",
  "DirectX 12 Feature Level 12_0",
  "DirectX 12 Feature Level 11_1",
  "DirectX 11 (Standard)",
  "DirectX 11 (Legacy)",
  "DirectX 10 or older"
];
