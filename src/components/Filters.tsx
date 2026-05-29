/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Colaborador, DashboardFilters } from '../types';

interface FiltersProps {
  filters: DashboardFilters;
  onFilterChange: (newFilters: Partial<DashboardFilters>) => void;
  onClear: () => void;
  allColaboradores: Colaborador[];
}

export default function Filters({ filters, onFilterChange, onClear, allColaboradores }: FiltersProps) {
  
  // Extract unique values dynamically to handle any future data replacement seamlessly 
  const filterOptions = useMemo(() => {
    const regionals = new Set<string>();
    const areaRHs = new Set<string>();
    const statuses = new Set<string>();

    allColaboradores.forEach((c) => {
      if (c.regional) {
        regionals.add(c.regional);
      }
      if (c.status) statuses.add(c.status);
    });

    // Handle cascading / respective filter for Area de Recursos Humanos
    // If a Regional is selected, only show respective Area RHs that have records for that Regional
    const filteredForAreaRH = filters.regional 
      ? allColaboradores.filter(c => c.regional === filters.regional)
      : allColaboradores;

    filteredForAreaRH.forEach((c) => {
      if (c.areaRH) areaRHs.add(c.areaRH);
    });

    return {
      regionals: Array.from(regionals).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      areaRHs: Array.from(areaRHs).sort((a, b) => a.localeCompare(b, 'pt-BR')),
      statuses: Array.from(statuses).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    };
  }, [allColaboradores, filters.regional]);

  // Check if any filter is active so we can show/hide the clear button elegantly
  const isAnyFilterActive = useMemo(() => {
    return (
      filters.regional !== '' ||
      filters.areaRH !== '' ||
      filters.status !== '' ||
      filters.search !== ''
    );
  }, [filters]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-5 mb-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-emerald-600" />
        <h2 className="text-slate-900 font-display font-semibold text-sm tracking-wide">
          Filtros de Segmentação e Consulta
        </h2>
        {isAnyFilterActive && (
          <span className="text-[11px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full animate-fade-in">
            Ativo
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Search Input */}
        <div className="relative">
          <label htmlFor="search" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Nome ou Matrícula
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              placeholder="Digite para buscar..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-slate-300 transition-colors"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Regional Filter */}
        <div>
          <label htmlFor="regional" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Regional
          </label>
          <select
            id="regional"
            value={filters.regional}
            onChange={(e) => onFilterChange({ regional: e.target.value })}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-slate-300 transition-colors"
          >
            <option value="">Todas</option>
            {filterOptions.regionals.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Área de RH Filter */}
        <div>
          <label htmlFor="areaRH" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Área de Recursos Humanos
          </label>
          <select
            id="areaRH"
            value={filters.areaRH}
            onChange={(e) => onFilterChange({ areaRH: e.target.value })}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-slate-300 transition-colors"
          >
            <option value="">Todas</option>
            {filterOptions.areaRHs.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="status" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Status Realização
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => onFilterChange({ status: e.target.value })}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-lg py-2 px-3 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 hover:border-slate-300 transition-colors"
            >
              <option value="">Todos</option>
              {filterOptions.statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Clean filters button inside status segment if desired, or beside */}
          {isAnyFilterActive && (
            <button
              onClick={onClear}
              className="flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 cursor-pointer transition-all duration-150 tooltip shrink-0 h-[38px] w-[38px]"
              title="Limpar Filtros"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
