/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Game } from "../src/types";

export const FALLBACK_GAMES: Game[] = [
  {
    id: 28,
    name: "Red Dead Redemption 2",
    slug: "red-dead-redemption-2",
    released: "2018-10-26",
    metacritic: 97,
    rating: 4.59,
    ratings_count: 5200,
    background_image: "https://media.rawg.io/media/games/511/511a43a6d405ccb28e08d9ddda7c135c.jpg",
    playtime: 46,
    genres: [
      { id: 4, name: "Action", slug: "action" },
      { id: 3, name: "Adventure", slug: "adventure" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: Windows 10 - April 2018 Update (v1803)\nProcessor: Intel® Core™ i5-2500K / AMD FX-6300\nMemory: 8 GB RAM\nGraphics: Nvidia GeForce GTX 770 2GB / AMD Radeon R9 280 3GB\nStorage: 150 GB available space",
          recommended: "Recommended:\nOS: Windows 10 - April 2018 Update (v1803)\nProcessor: Intel® Core™ i7-4770K / AMD Ryzen 5 1500X\nMemory: 12 GB RAM\nGraphics: Nvidia GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB\nStorage: 150 GB available space"
        }
      }
    ]
  },
  {
    id: 22511,
    name: "Cyberpunk 2077",
    slug: "cyberpunk-2077",
    released: "2020-12-10",
    metacritic: 86,
    rating: 4.31,
    ratings_count: 3800,
    background_image: "https://media.rawg.io/media/games/618/618c2031a07bbff5545b45f191b173cc.jpg",
    playtime: 32,
    genres: [
      { id: 4, name: "Action", slug: "action" },
      { id: 5, name: "RPG", slug: "role-playing-games-rpg" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: Windows 10 64-bit\nProcessor: Intel Core i7-6700 or AMD Ryzen 5 1600\nMemory: 12 GB RAM\nGraphics: NVIDIA GeForce GTX 1060 6GB or AMD Radeon RX 580 8GB\nStorage: 70 GB available space (SSD Recommended)",
          recommended: "Recommended:\nOS: Windows 10 64-bit\nProcessor: Intel Core i7-12700 or AMD Ryzen 7 7800X3D\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce RTX 3070 or AMD Radeon RX 6800 XT\nStorage: 70 GB available space (SSD Required)"
        }
      }
    ]
  },
  {
    id: 326243,
    name: "Elden Ring",
    slug: "elden-ring",
    released: "2022-02-25",
    metacritic: 96,
    rating: 4.68,
    ratings_count: 4500,
    background_image: "https://media.rawg.io/media/games/b11/b115b2c0d59c9ff9107de564b1057d4e.jpg",
    playtime: 60,
    genres: [
      { id: 4, name: "Action", slug: "action" },
      { id: 5, name: "RPG", slug: "role-playing-games-rpg" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: Windows 10 64-bit\nProcessor: INTEL CORE I5-8400 or AMD RYZEN 3 3300X\nMemory: 12 GB RAM\nGraphics: NVIDIA GEFORCE GTX 1060 3GB or AMD RADEON RX 580 4GB\nDirectX: Version 12\nStorage: 60 GB available space",
          recommended: "Recommended:\nOS: Windows 10/11 64-bit\nProcessor: INTEL CORE I7-8700K or AMD RYZEN 5 3600X\nMemory: 16 GB RAM\nGraphics: NVIDIA GEFORCE GTX 1070 8GB or AMD RADEON RX 5600 XT 6GB\nDirectX: Version 12\nStorage: 60 GB available space (SSD)"
        }
      }
    ]
  },
  {
    id: 3498,
    name: "Grand Theft Auto V",
    slug: "grand-theft-auto-v",
    released: "2013-09-17",
    metacritic: 96,
    rating: 4.47,
    ratings_count: 6700,
    background_image: "https://media.rawg.io/media/games/456/456fc5a11700d18f35a044843a0c1701.jpg",
    playtime: 73,
    genres: [
      { id: 4, name: "Action", slug: "action" },
      { id: 3, name: "Adventure", slug: "adventure" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: Windows 10 64 Bit, Windows 8.1 64 Bit, Windows 8 64 Bit\nProcessor: Intel Core 2 Quad CPU Q6600 @ 2.40GHz / AMD Phenom 9850 Quad-Core Processor @ 2.5GHz\nMemory: 4 GB RAM\nGraphics: NVIDIA 9800 GT 1GB / AMD HD 4870 1GB\nStorage: 72 GB available space",
          recommended: "Recommended:\nOS: Windows 10 64 Bit\nProcessor: Intel Core i5 3470 @ 3.2GHz / AMD X8 FX-8350 @ 4GHz\nMemory: 8 GB RAM\nGraphics: NVIDIA GTX 660 2GB / AMD HD 7870 2GB\nStorage: 72 GB available space"
        }
      }
    ]
  },
  {
    id: 41494,
    name: "Hogwarts Legacy",
    slug: "hogwarts-legacy",
    released: "2023-02-10",
    metacritic: 84,
    rating: 4.35,
    ratings_count: 1400,
    background_image: "https://media.rawg.io/media/games/90a/90a97bfdc08ca9ee14479e0be6f9cbd8.jpg",
    playtime: 40,
    genres: [
      { id: 4, name: "Action", slug: "action" },
      { id: 5, name: "RPG", slug: "role-playing-games-rpg" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: Windows 10 64-bit\nProcessor: Intel Core i5-6600 or AMD Ryzen 5 1400\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce GTX 960 4GB or AMD Radeon RX 470 4GB\nStorage: 85 GB available space (SSD Preferred)",
          recommended: "Recommended:\nOS: Windows 10/11 64-bit\nProcessor: Intel Core i7-8700 or AMD Ryzen 5 3600\nMemory: 16 GB RAM\nGraphics: NVIDIA GeForce 1080 Ti or AMD Radeon RX 5700 XT\nStorage: 85 GB available space (SSD Required)"
        }
      }
    ]
  },
  {
    id: 3328,
    name: "The Witcher 3: Wild Hunt",
    slug: "the-witcher-3-wild-hunt",
    released: "2015-05-18",
    metacritic: 93,
    rating: 4.66,
    ratings_count: 6100,
    background_image: "https://media.rawg.io/media/games/618/618c2031a07bbff5545b45f191b173cc.jpg",
    playtime: 51,
    genres: [
      { id: 4, name: "Action", slug: "action" },
      { id: 5, name: "RPG", slug: "role-playing-games-rpg" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: 64-bit Windows 7, 64-bit Windows 8 (8.1) or 64-bit Windows 10\nProcessor: Intel CPU Core i5-2500K 3.3GHz / AMD CPU Phenom II X4 940\nMemory: 6 GB RAM\nGraphics: Nvidia GPU GeForce GTX 660 / AMD GPU Radeon HD 7870\nStorage: 35 GB available space",
          recommended: "Recommended:\nOS: 64-bit Windows 7, 64-bit Windows 8 (8.1) or 64-bit Windows 10\nProcessor: Intel CPU Core i7 3770 3.4 GHz / AMD CPU FX-8350 4 GHz\nMemory: 8 GB RAM\nGraphics: Nvidia GPU GeForce GTX 770 / AMD GPU Radeon R9 290\nStorage: 35 GB available space"
        }
      }
    ]
  },
  {
    id: 5813,
    name: "Forza Horizon 5",
    slug: "forza-horizon-5",
    released: "2021-11-09",
    metacritic: 92,
    rating: 4.45,
    ratings_count: 1200,
    background_image: "https://media.rawg.io/media/games/082/082bc55011684bad11413fee31898c0d.jpg",
    playtime: 25,
    genres: [
      { id: 1, name: "Racing", slug: "racing" },
      { id: 15, name: "Sports", slug: "sports" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: Windows 10 version 15063.0 or higher\nProcessor: Intel i5-4460 or AMD Ryzen 3 1200\nMemory: 8 GB RAM\nGraphics: NVidia GTX 970 or AMD RX 470\nStorage: 110 GB available space",
          recommended: "Recommended:\nOS: Windows 10 version 15063.0 or higher\nProcessor: Intel i7-10700K or AMD Ryzen 5 5600X\nMemory: 16 GB RAM\nGraphics: NVidia RTX 3060 Ti or AMD RX 6700 XT\nStorage: 110 GB available space (SSD)"
        }
      }
    ]
  },
  {
    id: 2454,
    name: "Marvel's Spider-Man Remastered",
    slug: "marvels-spider-man-remastered",
    released: "2022-08-12",
    metacritic: 87,
    rating: 4.54,
    ratings_count: 1600,
    background_image: "https://media.rawg.io/media/games/9aa/9aa2af61d1757695e200c30c36f4b322.jpg",
    playtime: 21,
    genres: [
      { id: 4, name: "Action", slug: "action" },
      { id: 3, name: "Adventure", slug: "adventure" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: Windows 10 64-bit\nProcessor: Intel Core i3-4160 or AMD equivalent\nMemory: 8 GB RAM\nGraphics: NVIDIA GTX 950 or AMD Radeon RX 470\nStorage: 75 GB available space",
          recommended: "Recommended:\nOS: Windows 10/11 64-bit\nProcessor: Intel Core i5-4670 or AMD Ryzen 5 1600\nMemory: 16 GB RAM\nGraphics: NVIDIA GTX 1060 6GB or AMD Radeon RX 580 8GB\nStorage: 75 GB available space (SSD Recommended)"
        }
      }
    ]
  },
  {
    id: 5286,
    name: "God of War",
    slug: "god-of-war-2018",
    released: "2018-04-20",
    metacritic: 94,
    rating: 4.59,
    ratings_count: 3100,
    background_image: "https://media.rawg.io/media/games/fc1/fc1199d6934243d3c8a9ab08d17b7b1b.jpg",
    playtime: 28,
    genres: [
      { id: 4, name: "Action", slug: "action" },
      { id: 3, name: "Adventure", slug: "adventure" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: Windows 10 64-bit\nProcessor: Intel i5-2500k (4 core 3.3 GHz) or AMD Ryzen 3 1200 (4 core 3.1 GHz)\nMemory: 8 GB RAM\nGraphics: NVIDIA GTX 960 (4 GB) or AMD R9 290X (4 GB)\nStorage: 70 GB available space",
          recommended: "Recommended:\nOS: Windows 10 64-bit\nProcessor: Intel i7-4770k (4 core 3.5 GHz) or AMD Ryzen 5 1600 (6 core 3.2 GHz)\nMemory: 8 GB RAM\nGraphics: NVIDIA GTX 1060 (6 GB) or AMD RX 570 (8 GB)\nStorage: 70 GB available space (SSD Recommended)"
        }
      }
    ]
  },
  {
    id: 111,
    name: "Counter-Strike 2",
    slug: "counter-strike-2",
    released: "2023-09-27",
    metacritic: 82,
    rating: 4.12,
    ratings_count: 850,
    background_image: "https://media.rawg.io/media/games/73e/73e13c05bc40d39f00c53443b7beab94.jpg",
    playtime: 150,
    genres: [
      { id: 2, name: "Shooter", slug: "shooter" },
      { id: 4, name: "Action", slug: "action" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: Windows® 10\nProcessor: 4 hardware threads - Intel® Core™ i5 750 or higher\nMemory: 8 GB RAM\nGraphics: NVIDIA® GeForce® GTX 660 or AMD Radeon™ HD 7850\nStorage: 85 GB available space",
          recommended: "Recommended:\nOS: Windows® 10/11\nProcessor: Intel® Core™ i5-10400F or AMD Ryzen™ 5 3600\nMemory: 16 GB RAM\nGraphics: NVIDIA® GeForce® GTX 1070 or AMD Radeon™ RX 5600 XT\nStorage: 85 GB available space (SSD Required)"
        }
      }
    ]
  },
  {
    id: 222,
    name: "Valorant",
    slug: "valorant",
    released: "2020-06-02",
    metacritic: 80,
    rating: 3.95,
    ratings_count: 650,
    background_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80",
    playtime: 120,
    genres: [
      { id: 2, name: "Shooter", slug: "shooter" },
      { id: 4, name: "Action", slug: "action" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: Windows 10/11 64-bit\nProcessor: Intel Core 2 Duo E8400 / AMD Athlon 200GE\nMemory: 4 GB RAM\nGraphics: Intel HD 4000 / AMD Radeon R5 200\nStorage: 30 GB available space",
          recommended: "Recommended:\nOS: Windows 10/11 64-bit\nProcessor: Intel i3-4150 / AMD Ryzen 3 1200\nMemory: 8 GB RAM\nGraphics: NVIDIA GT 730 / AMD Radeon R7 240\nStorage: 30 GB available space (SSD Recommended)"
        }
      }
    ]
  },
  {
    id: 333,
    name: "Minecraft",
    slug: "minecraft",
    released: "2011-11-18",
    metacritic: 93,
    rating: 4.52,
    ratings_count: 4200,
    background_image: "https://media.rawg.io/media/games/b4e/b4e4c3d6d3d6d5a11700d18f35a04484.jpg",
    playtime: 140,
    genres: [
      { id: 3, name: "Adventure", slug: "adventure" },
      { id: 14, name: "Simulation", slug: "simulation" }
    ],
    parent_platforms: [{ platform: { id: 1, name: "PC", slug: "pc" } }],
    platforms: [
      {
        platform: { id: 4, name: "PC", slug: "pc" },
        requirements_en: {
          minimum: "Minimum:\nOS: Windows 7 or higher\nProcessor: Intel Core i3-3210 / AMD A8-7600 APU\nMemory: 4 GB RAM\nGraphics: Intel HD Graphics 4000 / AMD Radeon R5 series\nStorage: 4 GB available space",
          recommended: "Recommended:\nOS: Windows 10/11 64-bit\nProcessor: Intel Core i5-4690 / AMD A10-7800\nMemory: 8 GB RAM\nGraphics: NVIDIA GeForce 700 series / AMD Radeon Rx 200 series\nStorage: 4 GB available space (SSD Recommended)"
        }
      }
    ]
  }
];
