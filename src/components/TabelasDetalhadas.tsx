/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Search, 
  Download, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Sheet
} from 'lucide-react';
import { Colaborador } from '../types';
import { exportColaboradoresToCSV } from '../utils/export';

interface TabelasDetalhadasProps {
  filteredColaboradores: Colaborador[];
}

type SortField = keyof Colaborador;

export default function TabelasDetalhadas({ filteredColaboradores }: TabelasDetalhadasProps) {
  // Tabs management: 'realizados' | 'nao_realizados'
  const [activeTab, setActiveTab] = useState<'realizados' | 'nao_realizados'>('realizados');

  // Separated lists based on Status
  const realizadosRaw = useMemo(() => {
    return filteredColaboradores.filter(c => c.status === 'Realizado');
  }, [filteredColaboradores]);

  const naoRealizadosRaw = useMemo(() => {
    return filteredColaboradores.filter(c => c.status === 'No realizado' || c.status === 'Não realizado');
  }, [filteredColaboradores]);

  // States for Realizados table
  const [realizadosSearch, setRealizadosSearch] = useState('');
  const [realizadosSortField, setRealizadosSortField] = useState<SortField>('nome');
  const [realizadosSortDir, setRealizadosSortDir] = useState<'asc' | 'desc'>('asc');
  const [realizadosPage, setRealizadosPage] = useState(1);
  const [realizadosPageSize, setRealizadosPageSize] = useState(10);

  // States for Não Realizados table
  const [naoRealizadosSearch, setNaoRealizadosSearch] = useState('');
  const [naoRealizadosSortField, setNaoRealizadosSortField] = useState<SortField>('nome');
  const [naoRealizadosSortDir, setNaoRealizadosSortDir] = useState<'asc' | 'desc'>('asc');
  const [naoRealizadosPage, setNaoRealizadosPage] = useState(1);
  const [naoRealizadosPageSize, setNaoRealizadosPageSize] = useState(10);

  // 1. Filter & Sort Realizados List
  const processedRealizados = useMemo(() => {
    let result = [...realizadosRaw];

    // Local Search inside Realizados Tab
    if (realizadosSearch.trim() !== '') {
      const q = realizadosSearch.toLowerCase();
      result = result.filter(c => 
        c.nome.toLowerCase().includes(q) || 
        c.matricula.toLowerCase().includes(q) ||
        c.cargo.toLowerCase().includes(q) ||
        c.centroCusto.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[realizadosSortField] || '';
      let bVal = b[realizadosSortField] || '';

      return realizadosSortDir === 'asc' 
        ? aVal.localeCompare(bVal, 'pt', { sensitivity: 'base' })
        : bVal.localeCompare(aVal, 'pt', { sensitivity: 'base' });
    });

    return result;
  }, [realizadosRaw, realizadosSearch, realizadosSortField, realizadosSortDir]);

  // 2. Filter & Sort Não Realizados List
  const processedNaoRealizados = useMemo(() => {
    let result = [...naoRealizadosRaw];

    // Local Search inside Não Realizados Tab
    if (naoRealizadosSearch.trim() !== '') {
      const q = naoRealizadosSearch.toLowerCase();
      result = result.filter(c => 
        c.nome.toLowerCase().includes(q) || 
        c.matricula.toLowerCase().includes(q) ||
        c.cargo.toLowerCase().includes(q) ||
        c.centroCusto.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[naoRealizadosSortField] || '';
      let bVal = b[naoRealizadosSortField] || '';

      return naoRealizadosSortDir === 'asc' 
        ? aVal.localeCompare(bVal, 'pt', { sensitivity: 'base' })
        : bVal.localeCompare(aVal, 'pt', { sensitivity: 'base' });
    });

    return result;
  }, [naoRealizadosRaw, naoRealizadosSearch, naoRealizadosSortField, naoRealizadosSortDir]);

  // Paginated Slices
  const paginatedRealizados = useMemo(() => {
    const startIndex = (realizadosPage - 1) * realizadosPageSize;
    return processedRealizados.slice(startIndex, startIndex + realizadosPageSize);
  }, [processedRealizados, realizadosPage, realizadosPageSize]);

  const paginatedNaoRealizados = useMemo(() => {
    const startIndex = (naoRealizadosPage - 1) * naoRealizadosPageSize;
    return processedNaoRealizados.slice(startIndex, startIndex + naoRealizadosPageSize);
  }, [processedNaoRealizados, naoRealizadosPage, naoRealizadosPageSize]);

  // Sort Handler Helpers
  const handleRealizadosSort = (field: SortField) => {
    if (realizadosSortField === field) {
      setRealizadosSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setRealizadosSortField(field);
      setRealizadosSortDir('asc');
    }
    setRealizadosPage(1); // reset to first page on sort change
  };

  const handleNaoRealizadosSort = (field: SortField) => {
    if (naoRealizadosSortField === field) {
      setNaoRealizadosSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setNaoRealizadosSortField(field);
      setNaoRealizadosSortDir('asc');
    }
    setNaoRealizadosPage(1); // reset to first page on sort change
  };

  // Rendering sort indicators
  const renderSortArrowRealizados = (field: SortField) => {
    if (realizadosSortField !== field) return null;
    return realizadosSortDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-emerald-600 inline ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-emerald-600 inline ml-1" />
    );
  };

  const renderSortArrowNaoRealizados = (field: SortField) => {
    if (naoRealizadosSortField !== field) return null;
    return naoRealizadosSortDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-amber-600 inline ml-1" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-amber-600 inline ml-1" />
    );
  };

  // Export functions
  const exportRealizados = () => {
    exportColaboradoresToCSV(realizadosRaw, 'Realizados_Filtrados');
  };

  const exportNaoRealizados = () => {
    exportColaboradoresToCSV(naoRealizadosRaw, 'Nao_Realizados_Filtrados');
  };

  const exportFilteredCompleta = () => {
    exportColaboradoresToCSV(filteredColaboradores, 'Base_Completa_Filtrada');
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden mb-8">
      
      {/* 1. Header with integrated Export Options Box */}
      <div className="p-6 border-b border-slate-150 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="text-slate-900 font-display font-bold text-base tracking-wide">
              Registros Detalhados de Colaboradores
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Consulte os registros individuais filtrando, ordenando e paginando dados de forma independente para cada status.
          </p>
        </div>

        {/* Global Export actions bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportRealizados}
            disabled={realizadosRaw.length === 0}
            className="flex items-center gap-1.5 py-2 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            title="Exportar apenas colaboradores com status Realizado em formato Excel/CSV"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            CSV Realizados ({realizadosRaw.length})
          </button>

          <button
            onClick={exportNaoRealizados}
            disabled={naoRealizadosRaw.length === 0}
            className="flex items-center gap-1.5 py-2 px-3 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-lg hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
            title="Exportar apenas colaboradores com status No realizado em formato Excel/CSV"
          >
            <XCircle className="w-3.5 h-3.5 text-amber-600" />
            CSV Não Realizados ({naoRealizadosRaw.length})
          </button>

          <button
            onClick={exportFilteredCompleta}
            disabled={filteredColaboradores.length === 0}
            className="flex items-center gap-1.5 py-2 px-3.5 bg-sky-600 text-white text-xs font-bold rounded-lg hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition cursor-pointer shadow-xs shadow-sky-600/10"
            title="Exportar todos os colaboradores elegíveis que correspondem à combinação de filtros ativos"
          >
            <Sheet className="w-3.5 h-3.5" />
            CSV Base Completa ({filteredColaboradores.length})
          </button>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex border-b border-slate-200 px-6 bg-white shrink-0">
        <button
          onClick={() => setActiveTab('realizados')}
          className={`flex items-center gap-2 py-4 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'realizados'
              ? 'border-emerald-500 text-emerald-700 bg-emerald-50/10'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <CheckCircle className={`w-4 h-4 ${activeTab === 'realizados' ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>Realizados ({realizadosRaw.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('nao_realizados')}
          className={`flex items-center gap-2 py-4 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'nao_realizados'
              ? 'border-amber-500 text-amber-700 bg-amber-50/10'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <XCircle className={`w-4 h-4 ${activeTab === 'nao_realizados' ? 'text-amber-600' : 'text-slate-400'}`} />
          <span>Não Realizados ({naoRealizadosRaw.length})</span>
        </button>
      </div>

      {/* 3. Panel Content */}
      <div className="p-6">
        
        {/* ================= TAB 1: REALIZADOS ================= */}
        {activeTab === 'realizados' && (
          <div className="space-y-4">
            
            {/* Filter toolbar inside the list */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Pesquisar nesta tabela..."
                  value={realizadosSearch}
                  onChange={(e) => {
                    setRealizadosSearch(e.target.value);
                    setRealizadosPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-4 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Page size selector */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Registros por página:</span>
                <select
                  value={realizadosPageSize}
                  onChange={(e) => {
                    setRealizadosPageSize(Number(e.target.value));
                    setRealizadosPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Table Container */}
            {processedRealizados.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Search className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <p className="text-xs font-semibold">Nenhum colaborador encontrado</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Mude seu termo de pesquisa interna ou ajuste os filtros globais do topo.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-150 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th onClick={() => handleRealizadosSort('matricula')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Matrícula {renderSortArrowRealizados('matricula')}
                      </th>
                      <th onClick={() => handleRealizadosSort('nome')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Nome {renderSortArrowRealizados('nome')}
                      </th>
                      <th onClick={() => handleRealizadosSort('regional')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Regional {renderSortArrowRealizados('regional')}
                      </th>
                      <th onClick={() => handleRealizadosSort('diretoria')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Diretoria {renderSortArrowRealizados('diretoria')}
                      </th>
                      <th onClick={() => handleRealizadosSort('areaRH')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Área de RH {renderSortArrowRealizados('areaRH')}
                      </th>
                      <th onClick={() => handleRealizadosSort('cargo')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Cargo {renderSortArrowRealizados('cargo')}
                      </th>
                      <th onClick={() => handleRealizadosSort('centroCusto')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Centro de Custo {renderSortArrowRealizados('centroCusto')}
                      </th>
                      <th className="py-3 px-4 text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    {paginatedRealizados.map((c) => (
                      <tr key={c.matricula} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.matricula}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{c.nome}</td>
                        <td className="py-3 px-4 font-display text-slate-600 font-medium">{c.regional}</td>
                        <td className="py-3 px-4 text-slate-500">{c.diretoria}</td>
                        <td className="py-3 px-4 text-slate-500">{c.areaRH}</td>
                        <td className="py-3 px-4 font-medium text-slate-600">{c.cargo}</td>
                        <td className="py-3 px-4 text-slate-500 font-sans">{c.centroCusto}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Realizado
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination controls */}
            {processedRealizados.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500 font-medium">
                <div>
                  Mostrando <span className="font-bold text-slate-800">{Math.min(processedRealizados.length, (realizadosPage - 1) * realizadosPageSize + 1)}</span> a <span className="font-bold text-slate-800">{Math.min(processedRealizados.length, realizadosPage * realizadosPageSize)}</span> de <span className="font-bold text-slate-800">{processedRealizados.length}</span> registros.
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setRealizadosPage(prev => Math.max(1, prev - 1))}
                    disabled={realizadosPage === 1}
                    className="p-1 px-2 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.ceil(processedRealizados.length / realizadosPageSize) }).map((_, i) => {
                    const pageNo = i + 1;
                    // Max 5 page markers for visual clean look
                    if (Math.abs(pageNo - realizadosPage) > 2 && pageNo !== 1 && pageNo !== Math.ceil(processedRealizados.length / realizadosPageSize)) {
                      if (pageNo === 2 || pageNo === Math.ceil(processedRealizados.length / realizadosPageSize) - 1) {
                        return <span key={`ellipsis-${pageNo}`} className="text-slate-400 font-bold px-1">...</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={pageNo}
                        onClick={() => setRealizadosPage(pageNo)}
                        className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                          realizadosPage === pageNo
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNo}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setRealizadosPage(prev => Math.min(Math.ceil(processedRealizados.length / realizadosPageSize), prev + 1))}
                    disabled={realizadosPage === Math.ceil(processedRealizados.length / realizadosPageSize)}
                    className="p-1 px-2 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 2: NÃO REALIZADOS ================= */}
        {activeTab === 'nao_realizados' && (
          <div className="space-y-4">
            
            {/* Filter toolbar inside the list */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  placeholder="Pesquisar nesta tabela..."
                  value={naoRealizadosSearch}
                  onChange={(e) => {
                    setNaoRealizadosSearch(e.target.value);
                    setNaoRealizadosPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-4 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-550/20 focus:border-amber-500 transition-colors"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Page size selector */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Registros por página:</span>
                <select
                  value={naoRealizadosPageSize}
                  onChange={(e) => {
                    setNaoRealizadosPageSize(Number(e.target.value));
                    setNaoRealizadosPage(1);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Table Container */}
            {processedNaoRealizados.length === 0 ? (
              <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Search className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                <p className="text-xs font-semibold">Nenhum colaborador não realizado encontrado</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Parabéns! Todos os líderes neste recorte concluíram a atividade, ou verifique os filtros.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-150 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th onClick={() => handleNaoRealizadosSort('matricula')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Matrícula {renderSortArrowNaoRealizados('matricula')}
                      </th>
                      <th onClick={() => handleNaoRealizadosSort('nome')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Nome {renderSortArrowNaoRealizados('nome')}
                      </th>
                      <th onClick={() => handleNaoRealizadosSort('regional')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Regional {renderSortArrowNaoRealizados('regional')}
                      </th>
                      <th onClick={() => handleNaoRealizadosSort('diretoria')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Diretoria {renderSortArrowNaoRealizados('diretoria')}
                      </th>
                      <th onClick={() => handleNaoRealizadosSort('areaRH')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Área de RH {renderSortArrowNaoRealizados('areaRH')}
                      </th>
                      <th onClick={() => handleNaoRealizadosSort('cargo')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Cargo {renderSortArrowNaoRealizados('cargo')}
                      </th>
                      <th onClick={() => handleNaoRealizadosSort('centroCusto')} className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition select-none">
                        Centro de Custo {renderSortArrowNaoRealizados('centroCusto')}
                      </th>
                      <th className="py-3 px-4 text-center">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-slate-700">
                    {paginatedNaoRealizados.map((c) => (
                      <tr key={c.matricula} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">{c.matricula}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{c.nome}</td>
                        <td className="py-3 px-4 font-display text-slate-600 font-medium">{c.regional}</td>
                        <td className="py-3 px-4 text-slate-500">{c.diretoria}</td>
                        <td className="py-3 px-4 text-slate-500">{c.areaRH}</td>
                        <td className="py-3 px-4 font-medium text-slate-600">{c.cargo}</td>
                        <td className="py-3 px-4 text-slate-500 font-sans">{c.centroCusto}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            Pendente
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination controls */}
            {processedNaoRealizados.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500 font-medium font-sans">
                <div>
                  Mostrando <span className="font-bold text-slate-850">{Math.min(processedNaoRealizados.length, (naoRealizadosPage - 1) * naoRealizadosPageSize + 1)}</span> a <span className="font-bold text-slate-850">{Math.min(processedNaoRealizados.length, naoRealizadosPage * naoRealizadosPageSize)}</span> de <span className="font-bold text-slate-850">{processedNaoRealizados.length}</span> registros.
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setNaoRealizadosPage(prev => Math.max(1, prev - 1))}
                    disabled={naoRealizadosPage === 1}
                    className="p-1 px-2 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: Math.ceil(processedNaoRealizados.length / naoRealizadosPageSize) }).map((_, i) => {
                    const pageNo = i + 1;
                    if (Math.abs(pageNo - naoRealizadosPage) > 2 && pageNo !== 1 && pageNo !== Math.ceil(processedNaoRealizados.length / naoRealizadosPageSize)) {
                      if (pageNo === 2 || pageNo === Math.ceil(processedNaoRealizados.length / naoRealizadosPageSize) - 1) {
                        return <span key={`ellipsis-${pageNo}`} className="text-slate-400 font-bold px-1">...</span>;
                      }
                      return null;
                    }
                    return (
                      <button
                        key={pageNo}
                        onClick={() => setNaoRealizadosPage(pageNo)}
                        className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                          naoRealizadosPage === pageNo
                            ? 'bg-amber-600 text-white font-bold'
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNo}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setNaoRealizadosPage(prev => Math.min(Math.ceil(processedNaoRealizados.length / naoRealizadosPageSize), prev + 1))}
                    disabled={naoRealizadosPage === Math.ceil(processedNaoRealizados.length / naoRealizadosPageSize)}
                    className="p-1 px-2 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
