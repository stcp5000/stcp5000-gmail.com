/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { Download, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Colaborador, TabelaResumoRow } from '../types';
import { exportTabelaResumoToCSV } from '../utils/export';

interface TabelaResumoProps {
  filteredColaboradores: Colaborador[];
}

export default function TabelaResumo({ filteredColaboradores }: TabelaResumoProps) {
  const [sortField, setSortField] = useState<keyof TabelaResumoRow>('regional');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Group and compute metrics dynamically
  const tableData = useMemo(() => {
    const groupMap = new Map<string, { regional: string; areaRH: string; elegiveis: number; realizados: number; naoRealizados: number }>();

    filteredColaboradores.forEach((c) => {
      const reg = c.regional || 'Geral';
      const area = c.areaRH || 'Geral';
      const key = `${reg} | ${area}`;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          regional: reg,
          areaRH: area,
          elegiveis: 0,
          realizados: 0,
          naoRealizados: 0
        });
      }

      const info = groupMap.get(key)!;
      info.elegiveis++;
      if (c.status === 'Realizado') {
        info.realizados++;
      } else {
        info.naoRealizados++;
      }
    });

    const rows: TabelaResumoRow[] = [];
    groupMap.forEach((val) => {
      rows.push({
        regional: val.regional,
        areaRH: val.areaRH,
        elegiveis: val.elegiveis,
        realizados: val.realizados,
        naoRealizados: val.naoRealizados,
        pctRealizacao: val.elegiveis > 0 ? (val.realizados / val.elegiveis) * 100 : 0
      });
    });

    // Handle sort
    return rows.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });
  }, [filteredColaboradores, sortField, sortDirection]);

  const handleSort = (field: keyof TabelaResumoRow) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortArrow = (field: keyof TabelaResumoRow) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-emerald-600 inline ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-emerald-600 inline ml-1" />
    );
  };

  const handleExport = () => {
    exportTabelaResumoToCSV(tableData);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl mb-6 shadow-xs overflow-hidden">
      {/* Title Header bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h3 className="text-slate-900 font-display font-semibold text-sm tracking-wide">
              Tabela-Resumo por Unidade Organizacional (Regional x Área de RH)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visão consolidada do número de elegíveis e taxas de realização em cada cruzamento organizacional.
          </p>
        </div>
        
        {tableData.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-200 hover:text-slate-800 transition cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Resumo
          </button>
        )}
      </div>

      {tableData.length === 0 ? (
        <div className="p-8 text-center text-slate-450 font-medium">
          Métrica zero: nenhum registro atende aos filtros atuais.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th onClick={() => handleSort('regional')} className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">
                  Regional {renderSortArrow('regional')}
                </th>
                <th onClick={() => handleSort('areaRH')} className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition whitespace-nowrap">
                  Área de RH {renderSortArrow('areaRH')}
                </th>
                <th onClick={() => handleSort('elegiveis')} className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap">
                  Elegíveis {renderSortArrow('elegiveis')}
                </th>
                <th onClick={() => handleSort('realizados')} className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap">
                  Realizados {renderSortArrow('realizados')}
                </th>
                <th onClick={() => handleSort('naoRealizados')} className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap">
                  Não Realizados {renderSortArrow('naoRealizados')}
                </th>
                <th onClick={() => handleSort('pctRealizacao')} className="py-3.5 px-5 cursor-pointer hover:bg-slate-100 transition text-right whitespace-nowrap">
                  Taxa Realização (%) {renderSortArrow('pctRealizacao')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-sm text-slate-700">
              {tableData.map((row) => {
                const isVeryHigh = row.pctRealizacao >= 90;
                const isLow = row.pctRealizacao < 50;
                
                let pctBadge = "text-slate-800 font-mono";
                if (isVeryHigh) pctBadge = "text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded";
                else if (isLow) pctBadge = "text-amber-700 font-mono font-semibold bg-amber-50 px-2 py-0.5 rounded";

                return (
                  <tr key={`${row.regional}-${row.areaRH}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800 font-display">
                      {row.regional}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      {row.areaRH}
                    </td>
                    <td className="py-3.5 px-5 text-right font-medium text-slate-800">
                      {row.elegiveis}
                    </td>
                    <td className="py-3.5 px-5 text-right text-emerald-600 font-medium">
                      {row.realizados}
                    </td>
                    <td className="py-3.5 px-5 text-right text-amber-600 font-medium font-mono">
                      {row.naoRealizados}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span className={pctBadge}>
                        {row.pctRealizacao.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
