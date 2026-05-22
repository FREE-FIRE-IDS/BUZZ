/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, FormEvent } from "react";
import { Search, Sparkles, Loader2, Gamepad2, Info, Flame, Trophy, Layers, Cpu, ShieldCheck, Zap } from "lucide-react";
import { Game, UserSpecs, CyriState } from "./types";
import { detectSystemSpecs, detectStorageSpace } from "./utils";
import Header from "./components/Header";
import SpecsForm from "./components/SpecsForm";
import GameCard from "./components/GameCard";
import AnalyzerModal from "./components/AnalyzerModal";

const defaultSpecs = detectSystemSpecs();

export default function App() {
  // Unified specifications and override state
  const [cyriState, setCyriState] = useState<CyriState>(() => {
    // 1st priority: Unified state v2 LocalStorage
    const saved = localStorage.getItem("cyri_state_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && "mode" in parsed) {
          return parsed;
        }
      } catch (e) {
        console.warn("Stale cached specs state, recreating...");
      }
    }

    // 2nd priority: Legacy "cyri_user_specs" migration support
    const legacy = localStorage.getItem("cyri_user_specs");
    if (legacy) {
      try {
        const specs = JSON.parse(legacy);
        return {
          real_specs: specs,
          custom_specs: null,
          mode: "real"
        };
      } catch (e) {}
    }

    // 3rd priority: Start fresh (null real specs, awaiting PowerShell scan)
    return {
      real_specs: null,
      custom_specs: null,
      mode: "real"
    };
  });

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "benchmarks">("benchmarks");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetectionToast, setShowDetectionToast] = useState(false);

  // Computed active effective specs passed to comparison algorithms
  const effectiveSpecs = cyriState.mode === "custom" && cyriState.custom_specs
    ? cyriState.custom_specs
    : (cyriState.real_specs || defaultSpecs);

  // Search input typing timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Quick-Bench games filter mappings if user requests benchmarks
  const BENCHMARK_IDS = "28,22511,41494,326243,3328,5813,3498";

  // Unified State Change handler
  const handleStateChange = (newState: CyriState) => {
    setCyriState(newState);
    localStorage.setItem("cyri_state_v2", JSON.stringify(newState));
  };

  // Backwards compatible specs callback
  const handleSpecsChange = (updatedSpecs: UserSpecs) => {
    if (cyriState.mode === "custom") {
      handleStateChange({
        ...cyriState,
        custom_specs: updatedSpecs,
        mode: "custom"
      });
    } else {
      handleStateChange({
        ...cyriState,
        real_specs: updatedSpecs,
        mode: "real"
      });
    }
  };

  // Fetch games helper
  const fetchGamesData = async (searchStr: string, genreStr: string, activeTabSelection: "all" | "benchmarks") => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/games?page_size=12";
      if (searchStr.trim()) {
        url += `&search=${encodeURIComponent(searchStr.trim())}`;
      } else if (activeTabSelection === "benchmarks") {
        url += `&ordering=-metacritic&genres=action`;
      } else {
        url += "&ordering=-added";
      }

      if (genreStr && !searchStr) {
        url += `&genres=${genreStr}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Could not acquire benchmark data from server.");
      }
      const data = await response.json();
      setGames(data.results || []);
    } catch (err: any) {
      console.error("Retrieve error:", err);
      setError("Unable to synchronize with RAWG game catalog. Verify API status.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount & Dynamic hardware detection on start
  useEffect(() => {
    // Only show toast helper if user doesn't have a verified real specs yet
    if (!cyriState.real_specs) {
      setShowDetectionToast(true);
      
      // Let's run a soft async detection for the storage fallback
      detectStorageSpace().then((storageInfo) => {
        if (storageInfo && !cyriState.real_specs) {
          // Softly set this in a custom specs or real specs default if null
          console.log("Estimated storage loaded in background:", storageInfo);
        }
      }).catch(err => console.warn("Storage resolution deferred:", err));
    }

    const timer = setTimeout(() => {
      setShowDetectionToast(false);
    }, 6000);

    fetchGamesData("", "", "benchmarks");

    return () => clearTimeout(timer);
  }, []);

  // Handle immediate search triggers
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchGamesData(searchQuery, selectedGenre, "all");
    setActiveTab("all");
  };

  // Keystroke debouncer to handle soft typing feedback
  const handleSearchInputChange = (val: string) => {
    setSearchQuery(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(() => {
      fetchGamesData(val, selectedGenre, val ? "all" : activeTab);
    }, 450);
  };

  // Filter tag selections
  const handleGenreSelect = (genreSlug: string) => {
    setSelectedGenre(genreSlug);
    setSearchQuery(""); // Clear search when switching categories
    fetchGamesData("", genreSlug, "all");
    setActiveTab("all");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app-root">
      
      {/* Brand Header */}
      <Header detectedSpecs={effectiveSpecs} />

      {/* Floating Specs Detected Toast */}
      {showDetectionToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-4 shadow-2xl flex items-start gap-3.5 animate-in slide-in-from-bottom duration-350">
          <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-2xl flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Specs Auto-Detected!</span>
              <button 
                onClick={() => setShowDetectionToast(false)} 
                className="text-slate-500 hover:text-slate-300 text-xs font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-200 mt-1 truncate font-semibold font-mono">
              GPU: {effectiveSpecs.gpu}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">
              CPU: {effectiveSpecs.cpu} | RAM: {effectiveSpecs.ram}
            </p>
          </div>
        </div>
      )}

      {/* Main Container Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Specs and Diagnostic diagnostics form card */}
        <section aria-label="PC Specs Configurator">
          <SpecsForm 
            cyriState={cyriState}
            onStateChange={handleStateChange}
            currentSpecs={effectiveSpecs} 
            onSpecsChange={handleSpecsChange} 
          />
        </section>

        {/* Diagnostic game directory board section */}
        <section className="space-y-6" id="catalog-section" aria-label="PC Game Comparison Board">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-900 pb-5">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                <Trophy className="text-emerald-400 w-5 h-5" />
                Compatibility Laboratory Catalog
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Select from standard high-demand benchmark titles or search across 500k+ global indexes.
              </p>
            </div>

            {/* Catalog Switch Tabs */}
            <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("benchmarks");
                  setSearchQuery("");
                  setSelectedGenre("");
                  fetchGamesData("", "", "benchmarks");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "benchmarks"
                    ? "bg-emerald-500 text-slate-950 font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                Heavy Benchmarks
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all");
                  fetchGamesData("", selectedGenre, "all");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "all"
                    ? "bg-emerald-500 text-slate-950 font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Browse Catalog
              </button>
            </div>
          </div>

          {/* Interactive filter rows */}
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Realtime Search Bar Form */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative group">
              <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 duration-150">
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                placeholder="Search games (e.g., Cyberpunk 2077, Hogwarts Legacy, Elden Ring, CS2...)"
                value={searchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500/80 rounded-2xl pl-11 pr-5 py-3 text-sm focus:outline-none transition font-medium placeholder-slate-500 text-white shadow-inner"
              />
            </form>

            {/* Quick Genre Tags List */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-slate-500 text-xs font-mono shrink-0 uppercase tracking-widest mr-1">Categories:</span>
              {[
                { name: "Action", slug: "action" },
                { name: "RPG", slug: "role-playing-games-rpg" },
                { name: "Shooter", slug: "shooter" },
                { name: "Racing", slug: "racing" },
                { name: "Strategy", slug: "strategy" }
              ].map((genre) => (
                <button
                  key={genre.slug}
                  onClick={() => handleGenreSelect(genre.slug)}
                  type="button"
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition border tracking-tight shrink-0 ${
                    selectedGenre === genre.slug
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {genre.name}
                </button>
              ))}
              {selectedGenre && (
                <button
                  onClick={() => {
                    setSelectedGenre("");
                    fetchGamesData(searchQuery, "", activeTab);
                  }}
                  type="button"
                  className="px-2.5 py-2 text-xs text-rose-400 hover:text-rose-300 font-extrabold"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          {/* Catalog Results Grid */}
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
              <p className="text-xs text-slate-400 font-mono tracking-wider">Synchronizing system specifications compatibility tables...</p>
            </div>
          ) : error ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-10 text-center max-w-lg mx-auto space-y-3 shadow-inner">
              <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">Synchronize Error</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">{error}</p>
              <button
                type="button"
                onClick={() => fetchGamesData(searchQuery, selectedGenre, activeTab)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition font-mono border border-slate-700"
              >
                Retry Request
              </button>
            </div>
          ) : games.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-2">
              <Info className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">Catalog Registry Empty</h3>
              <span className="block text-xs text-slate-400 leading-relaxed font-mono">No matching titles registered. Try updating target specifications or keyword terms.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {games.map((gameItem) => (
                <GameCard
                  key={gameItem.id}
                  game={gameItem}
                  onScan={(selected) => setSelectedGame(selected)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Feature/Fidelity summary banner at the bottom */}
        <section aria-label="Laborative Info card" id="promo-banner" className="bg-slate-900 border border-slate-800/80 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 shadow-xl">
          <div className="bg-slate-950 p-3 rounded-2xl text-emerald-400 border border-slate-800/60 flex items-center justify-center">
            <Zap className="w-8 h-8 fill-emerald-500/20" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Can You Run It? - Intel Engine</h4>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Powered by raw specifications comparison of hundreds of modern hardware profiles. Add your own custom CPU/GPU speeds to test gaming compatibility on any resolution or graphical setting.
            </p>
          </div>
        </section>

      </main>

      {/* Side-by-Side Diagnostic Screen overlay */}
      {selectedGame && (
        <AnalyzerModal
          game={selectedGame}
          userSpecs={effectiveSpecs}
          onClose={() => setSelectedGame(null)}
        />
      )}

      {/* Humble Humanized Footer */}
      <footer className="mt-12 py-6 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-600 font-mono flex items-center justify-center gap-2">
        <span>Can You Run It Lab &copy; 2026</span>
        <span>&bull;</span>
        <span>Powered safely with Rawg Game Library</span>
      </footer>

    </div>
  );
}
