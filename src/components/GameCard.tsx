/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Calendar, Star, Milestone, PlayCircle } from "lucide-react";
import { Game } from "../types";

interface GameCardProps {
  key?: React.Key | null;
  game: Game;
  onScan: (game: Game) => void;
}

export default function GameCard({ game, onScan }: GameCardProps) {
  // Metacritic Color indicator
  const getMetacriticColor = (score: number | null) => {
    if (!score) return "bg-slate-800 text-slate-400";
    if (score >= 75) return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    if (score >= 50) return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
  };

  return (
    <div
      className="group bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden text-white flex flex-col justify-between shadow-md hover:shadow-2xl hover:border-slate-700 transition duration-300"
      id={`game-card-${game.id}`}
    >
      {/* Game Image Header */}
      <div className="relative h-48 overflow-hidden bg-slate-950">
        <img
          src={game.background_image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80"}
          alt={game.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 filter brightness-90 group-hover:brightness-100"
        />
        
        {/* Metacritic Score */}
        {game.metacritic !== null && (
          <div className={`absolute top-4 right-4 text-xs font-black font-mono px-2.5 py-1 rounded-lg backdrop-blur-md ${getMetacriticColor(game.metacritic)}`}>
            MC: {game.metacritic}
          </div>
        )}

        {/* Playtime */}
        {game.playtime ? (
          <div className="absolute bottom-4 left-4 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-950/85 text-slate-300 px-2.5 py-1 rounded-full border border-slate-800/80">
            {game.playtime} hrs average
          </div>
        ) : null}
      </div>

      {/* Game Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Genre Row */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {game.genres?.slice(0, 3).map((g) => (
              <span key={g.name} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800/60 text-slate-400 border border-slate-800/20 uppercase tracking-widest">
                {g.name}
              </span>
            ))}
          </div>

          <h3 className="text-base font-extrabold tracking-tight group-hover:text-emerald-400 duration-200 line-clamp-1 mb-1.5">
            {game.name}
          </h3>

          <div className="flex items-center gap-3.5 text-xs text-slate-400 mb-4">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {game.released ? new Date(game.released).getFullYear() : "TBA"}
            </span>

            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {game.rating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onScan(game)}
          type="button"
          className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-emerald-500 text-slate-200 hover:text-slate-950 font-extrabold text-xs tracking-tight transition duration-200 flex items-center justify-center gap-2 group/btn shadow-inner"
        >
          <PlayCircle className="w-4 h-4 transition duration-250 group-hover/btn:translate-x-0.5" />
          Can I Run It?
        </button>
      </div>
    </div>
  );
}
