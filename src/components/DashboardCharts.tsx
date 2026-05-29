/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Info } from 'lucide-react';
import { Colaborador } from '../types';

interface DashboardChartsProps {
  filteredColaboradores: Colaborador[];
  allColaboradores?: Colaborador[];
  selectedRegional?: string;
}

export default function DashboardCharts({ 
  filteredColaboradores, 
  allColaboradores = [], 
  selectedRegional = '' 
}: DashboardChartsProps) {
  
  // Group and compile stats depending on filters
  const chartData = useMemo(() => {
    if (!selectedRegional) {
      // 1. Group by Regional (all regionals mode)
      const regionalMap = new Map<string, { elegiveis: number; realizados: number; naoRealizados: number }>();

      filteredColaboradores.forEach((c) => {
        const reg = c.regional || 'Não Informado';
        if (!regionalMap.has(reg)) {
          regionalMap.set(reg, { elegiveis: 0, realizados: 0, naoRealizados: 0 });
        }
        const data = regionalMap.get(reg)!;
        data.elegiveis++;
        if (c.status === 'Realizado') {
          data.realizados++;
        } else {
          data.naoRealizados++;
        }
      });

      const list: any[] = [];
      regionalMap.forEach((val, key) => {
        list.push({
          name: key,
          elegiveis: val.elegiveis,
          realizados: val.realizados,
          naoRealizados: val.naoRealizados,
          taxaRealizacao: val.elegiveis > 0 ? (val.realizados / val.elegiveis) * 100 : 0,
        });
      });

      // Stable sorting alphabetically by regional name
      return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    } else {
      // 2. Group by AreaRH (specific selected regional mode)
      const baseList = allColaboradores && allColaboradores.length > 0 ? allColaboradores : filteredColaboradores;

      // Identify all unique AreaRHs belonging to this regional across the complete dataset
      const uniqueAreas = new Set<string>();
      baseList.forEach((c) => {
        if (c.regional === selectedRegional) {
          uniqueAreas.add(c.areaRH || 'Não Informado');
        }
      });

      // Default the map with all possible areas initialized to zero (ensures we satisfy user request of showing empty units)
      const areaMap = new Map<string, { elegiveis: number; realizados: number; naoRealizados: number }>();
      uniqueAreas.forEach((area) => {
        areaMap.set(area, { elegiveis: 0, realizados: 0, naoRealizados: 0 });
      });

      // Apply counts from filtered list
      filteredColaboradores.forEach((c) => {
        // Map elements of this regional
        if (c.regional === selectedRegional) {
          const area = c.areaRH || 'Não Informado';
          if (!areaMap.has(area)) {
            areaMap.set(area, { elegiveis: 0, realizados: 0, naoRealizados: 0 });
          }
          const data = areaMap.get(area)!;
          data.elegiveis++;
          if (c.status === 'Realizado') {
            data.realizados++;
          } else {
            data.naoRealizados++;
          }
        }
      });

      const list: any[] = [];
      areaMap.forEach((val, key) => {
        list.push({
          name: key,
          elegiveis: val.elegiveis,
          realizados: val.realizados,
          naoRealizados: val.naoRealizados,
          taxaRealizacao: val.elegiveis > 0 ? (val.realizados / val.elegiveis) * 100 : 0,
        });
      });

      // Sort by completion rate descending so user gets instant insight into ranking for this regional
      return list.sort((a, b) => b.taxaRealizacao - a.taxaRealizacao || a.name.localeCompare(b.name, 'pt-BR'));
    }
  }, [filteredColaboradores, allColaboradores, selectedRegional]);

  // Compute aggregated KPI totals based strictly on the current visual scope of the chart
  const summary = useMemo(() => {
    let totalElegiveis = 0;
    let totalRealizados = 0;
    let totalNaoRealizados = 0;

    chartData.forEach(item => {
      totalElegiveis += item.elegiveis;
      totalRealizados += item.realizados;
      totalNaoRealizados += item.naoRealizados;
    });

    const taxaGeral = totalElegiveis > 0 ? (totalRealizados / totalElegiveis) * 105 : 0; // percentage display fallback safety
    const realTaxaGeral = totalElegiveis > 0 ? (totalRealizados / totalElegiveis) * 100 : 0;

    return {
      totalElegiveis,
      totalRealizados,
      totalNaoRealizados,
      taxaGeral: realTaxaGeral
    };
  }, [chartData]);

  const total = filteredColaboradores.length;

  if (total === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6 text-center shadow-xs">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
        <h3 className="text-slate-800 font-display font-semibold text-base">
          Sem dados disponíveis para exibição do gráfico
        </h3>
        <p className="text-slate-400 text-sm mt-1">Ajuste seus filtros para visualizar indicadores gráficos.</p>
      </div>
    );
  }

  // Adjust parameters dynamically to prevent axis label overlaps on crowded charts
  const isManyItems = chartData.length > 7;
  const barSize = isManyItems ? 9 : 28;

  // Render a beautifully designed Portuguese custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataItem = chartData.find(d => d.name === label);
      if (!dataItem) return null;

      return (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-lg max-w-xs font-sans">
          <p className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-1.5 mb-2 truncate">
            {label}
          </p>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
                Elegíveis:
              </span>
              <span className="font-mono font-bold text-slate-900">{dataItem.elegiveis} colaboradores</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                Realizados:
              </span>
              <span className="font-mono font-bold text-emerald-600">{dataItem.realizados} colaboradores</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-slate-50 pb-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                Não Realizados:
              </span>
              <span className="font-mono font-bold text-amber-600">{dataItem.naoRealizados} colaboradores</span>
            </div>
            <div className="pt-1.5 flex items-center justify-between gap-4 font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
                Taxa de Realização:
              </span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                {dataItem.taxaRealizacao.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col min-h-[460px] mb-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 mt-0.5">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-slate-900 font-display font-semibold text-sm tracking-wide">
              {selectedRegional 
                ? `Elegíveis vs Realizados por Área de RH: ${selectedRegional}` 
                : 'Elegíveis vs Realizados por Regional'}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-sans">
              {selectedRegional 
                ? 'Visualizando a distribuição em cada uma das Lojas/unidades (Área de RH) que compõem a regional selecionada.' 
                : 'Consolidado macro de capacitação por divisões e superintendências regionais.'}
            </p>
          </div>
        </div>

        {/* Dynamic Context KPIs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Escopo:</span>
            <span className="text-xs font-mono font-bold text-slate-800">{summary.totalElegiveis}</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-emerald-600/80">Taxa do Escopo:</span>
            <span className="text-xs font-mono font-bold text-emerald-700">{summary.taxaGeral.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Main Charts Graphic Rendering Container */}
      <div className="w-full h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 30, right: 30, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              tick={{ 
                fill: '#475569', 
                fontSize: isManyItems ? 9.2 : 10.5,
                fontFamily: 'Inter, sans-serif'
              }}
              interval={0}
              angle={isManyItems ? -40 : 0}
              textAnchor={isManyItems ? 'end' : 'middle'}
              height={isManyItems ? 95 : 40}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              width={40}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: '#475569', paddingBottom: '10px' }}
            />
            <Bar 
              yAxisId="left"
              name="Elegíveis (Qtd)" 
              dataKey="elegiveis" 
              fill="#3b82f6" 
              radius={[3, 3, 0, 0]} 
              barSize={barSize} 
              label={{ 
                position: 'top', 
                fill: '#1e3a8a', 
                fontSize: isManyItems ? 8 : 10, 
                fontWeight: 'semibold',
                offset: 6
              }} 
            />
            <Bar 
              yAxisId="right"
              name="Realizados (%)" 
              dataKey="taxaRealizacao" 
              fill="#10b981" 
              radius={[3, 3, 0, 0]} 
              barSize={barSize} 
              label={{ 
                position: 'top', 
                fill: '#065f46', 
                fontSize: isManyItems ? 8 : 10, 
                fontWeight: 'semibold',
                formatter: (val: any) => `${val.toFixed(1)}%`,
                offset: 6
              }} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Info indicator */}
      {isManyItems && (
        <div className="mt-3 bg-slate-50 border border-slate-100 rounded-lg p-2.5 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <p className="text-[10px] text-slate-500 font-sans leading-snug">
            Exibindo <span className="font-semibold">{chartData.length} unidades (Áreas de RH)</span> organizadas por taxa de realização. Passe o mouse sobre as barras para conferir os dados exatos e a taxa de realização.
          </p>
        </div>
      )}
    </div>
  );
}
