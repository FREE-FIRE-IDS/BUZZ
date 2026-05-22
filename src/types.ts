/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlatformInfo {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
  requirements_en?: {
    minimum?: string;
    recommended?: string;
  };
  requirements_ru?: {
    minimum?: string;
    recommended?: string;
  };
}

export interface GameGenre {
  id: number;
  name: string;
  slug: string;
}

export interface GamePlatformShort {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface GameTrailer {
  id: number;
  name: string;
  preview: string;
  data: {
    480: string;
    max: string;
  };
}

export interface GameScreenshot {
  id: number;
  image: string;
  width: number;
  height: number;
}

export interface Game {
  id: number;
  name: string;
  slug: string;
  description?: string;
  description_raw?: string;
  background_image: string;
  background_image_additional?: string;
  released: string;
  metacritic: number | null;
  rating: number;
  ratings_count: number;
  platforms?: PlatformInfo[];
  parent_platforms?: GamePlatformShort[];
  genres?: GameGenre[];
  website?: string;
  playtime?: number;
}

export interface UserSpecs {
  os: string;
  cpu: string;
  gpu: string;
  ram: string; // e.g. "16 GB"
  storage: string; // e.g. "SSD 500 GB"
  storageFree?: string; // e.g. "245.8 GB Free"
  ramDdr?: string; // e.g. "DDR4"
  vram?: string; // e.g. "8 GB"
  directx?: string; // e.g. "DirectX 12"
  gpuType?: "Dedicated" | "Integrated";
}

export interface SpecCompareResult {
  required: string;
  user: string;
  pass: boolean;
  reason: string;
}

export interface ParsedRequirements {
  pass: boolean;
  specs: {
    cpu: SpecCompareResult;
    gpu: SpecCompareResult;
    ram: SpecCompareResult;
    os: SpecCompareResult;
    storage: SpecCompareResult;
  };
}

export interface RequirementsAnalysisResult {
  minimum: ParsedRequirements | null;
  recommended: ParsedRequirements | null;
  overallVerdict: string;
  summary: string;
}

export interface SearchResponse {
  results: Game[];
  count: number;
}

export interface CyriState {
  real_specs: UserSpecs | null;
  custom_specs: UserSpecs | null;
  mode: "real" | "custom";
}

