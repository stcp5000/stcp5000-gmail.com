/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle, Users, XCircle, Percent, AlertCircle } from 'lucide-react';
import { DashboardStats } from '../types';

interface KPICardsProps {
  stats: DashboardStats;
}

export default function KPICards({ stats }: KPICardsProps) {
  
  // Format percentages beautifully
  const formattedPctRealizao = (stats.pctRealizacao * 100).toFixed(1) + '%';
  const formattedPctNaoRealizacao = (stats.pctNaoRealizacao * 100).toFixed(1) + '%';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      
      {/* Total Elegíveis */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between hover:shadow-xs transition duration-200">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Elegíveis
          </p>
          <p className="text-3xl font-display font-bold text-slate-900 tracking-tight">
            {stats.totalElegiveis}
          </p>
          <p className="text-[11px] text-slate-400">
            Público-alvo mapeado
          </p>
        </div>
        <div className="bg-blue-50 text-blue-600 p-3 rounded-lg shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>

      {/* Total Realizado */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between hover:shadow-xs transition duration-200">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Realizados
          </p>
          <p className="text-3xl font-display font-bold text-emerald-700 tracking-tight">
            {stats.totalRealizado}
          </p>
          <p className="text-[11px] text-slate-400">
            Treinamento concluído
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
      </div>

      {/* Total Não Realizado */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between hover:shadow-xs transition duration-200">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Não Realizados
          </p>
          <p className="text-3xl font-display font-bold text-amber-700 tracking-tight">
            {stats.totalNaoRealizado}
          </p>
          <p className="text-[11px] text-slate-400">
            Pendente de realização
          </p>
        </div>
        <div className="bg-amber-50 text-amber-600 p-3 rounded-lg shrink-0">
          <XCircle className="w-5 h-5" />
        </div>
      </div>

      {/* % Realização */}
      <div className="bg-emerald-600 text-white rounded-xl p-5 shadow-xs flex items-center justify-between hover:shadow-md transition duration-200">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
            Taxa Realização
          </p>
          <p className="text-3xl font-display font-extrabold tracking-tight">
            {formattedPctRealizao}
          </p>
          {/* Subtle custom indicator bar */}
          <div className="w-24 bg-emerald-750 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-emerald-250 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.pctRealizacao * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-emerald-500 text-white p-3 rounded-lg shrink-0">
          <Percent className="w-5 h-5" />
        </div>
      </div>

      {/* % Não Realização */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between hover:shadow-xs transition duration-200">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Não Realização
          </p>
          <p className="text-3xl font-display font-bold text-slate-800 tracking-tight">
            {formattedPctNaoRealizacao}
          </p>
          {/* Subtle container bar */}
          <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stats.pctNaoRealizacao * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-slate-100 text-slate-500 p-3 rounded-lg shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
      </div>

    </div>
  );
}
