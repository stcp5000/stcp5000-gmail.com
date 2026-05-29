/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clock } from 'lucide-react';

interface HeaderProps {
  lastUpdated: string;
}

export default function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-slate-200 py-5 px-6 md:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Title and Branding */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Competências do Líder ADEO
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-sans">
              Dashboard de Status de Realização de Programas de Capacitação Corporativa
            </p>
          </div>
        </div>

        {/* Status Indicator / Last updated */}
        <div className="flex items-center gap-4 py-2 px-4 bg-slate-50 rounded-lg border border-slate-100 self-start md:self-auto shrink-0">
          <div className="relative">
            <span className="flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          
          <div className="text-xs">
            <p className="text-slate-400 font-medium tracking-wide prose uppercase text-[10px]">
              Status de Sincronismo
            </p>
            <div className="flex items-center gap-1.5 font-mono text-slate-600 font-medium mt-0.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Base: {lastUpdated}</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
