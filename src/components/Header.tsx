/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Monitor, ShieldCheck, Gamepad2, Laptop, Info } from "lucide-react";
import { UserSpecs } from "../types";

interface HeaderProps {
  detectedSpecs: UserSpecs;
}

export default function Header({ detectedSpecs }: HeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and branding */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-900 p-2 rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              CAN <span className="text-emerald-400">YOU</span> RUN IT?
            </h1>
            <p className="text-xs text-slate-400 font-medium">PC Game System Compatibility Laboratory</p>
          </div>
        </div>

        {/* Live Detected Hardware badge */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 rounded-2xl px-4 py-2.5 backdrop-blur-md self-stretch md:self-auto shadow-inner">
          <div className="p-1.5 bg-slate-700/80 text-emerald-400 rounded-lg">
            <Laptop className="w-4.5 h-4.5" />
          </div>
          <div className="text-left overflow-hidden max-w-[280px] sm:max-w-xs md:max-w-[180px] lg:max-w-[240px]">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-widest leading-none mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Hardware Detected
            </div>
            <p className="text-xs font-semibold font-mono text-slate-200 truncate">
              {detectedSpecs.gpu}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
