/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  Database, 
  RefreshCw, 
  AlertTriangle,
  Github,
  Globe,
  Plus
} from 'lucide-react';

import { Colaborador, DashboardFilters, DashboardStats } from './types';
import { fallbackColaboradores } from './data/base_elegiveis';

import Header from './components/Header';
import Filters from './components/Filters';
import KPICards from './components/KPICards';
import DashboardCharts from './components/DashboardCharts';
import TabelaResumo from './components/TabelaResumo';
import TabelasDetalhadas from './components/TabelasDetalhadas';
import BaseUpload from './components/BaseUpload';

export default function App() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(fallbackColaboradores);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [lastUpdatedDate, setLastUpdatedDate] = useState<string>('Carregando...');
  
  // Custom uploaded data states
  const [isUsingCustomData, setIsUsingCustomData] = useState<boolean>(false);
  const [customDataName, setCustomDataName] = useState<string | null>(null);
  const [customDataRows, setCustomDataRows] = useState<number>(0);

  // Admin state to filter access to upload utility
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  // Filter States
  const [filters, setFilters] = useState<DashboardFilters>({
    regional: '',
    areaRH: '',
    status: '',
    search: '',
  });

  // Fetch real-time JSON file on startup (Netlify compliant), checking localStorage fallback first
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorHeader(null);

        // Check if there is already custom uploaded spreadsheet database saved in localStorage
        const cachedBase = localStorage.getItem('adeo_custom_base_v2');
        const cachedFilename = localStorage.getItem('adeo_custom_filename');
        const cachedTimestamp = localStorage.getItem('adeo_custom_timestamp');

        if (cachedBase && cachedFilename) {
          const parsed = JSON.parse(cachedBase);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setColaboradores(parsed);
            setIsUsingCustomData(true);
            setCustomDataName(cachedFilename);
            setCustomDataRows(parsed.length);
            setLastUpdatedDate(cachedTimestamp || 'Base Customizada');
            setLoading(false);
            return; // skip fetching default
          }
        }

        // Default behavior: Try fetching public JSON
        const response = await fetch('/data/base_elegiveis.json');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setColaboradores(data);
          
          // Try to get Last-Modified header from the asset
          const lastModHeader = response.headers.get('Last-Modified');
          if (lastModHeader) {
            const date = new Date(lastModHeader);
            setLastUpdatedDate(date.toLocaleString('pt-BR'));
          } else {
            // Static default if header is omitted
            const today = new Date();
            setLastUpdatedDate(today.toLocaleDateString('pt-BR') + ' ' + today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' (Sincronizado)');
          }
        } else {
          throw new Error('Formato de dados JSON incorreto ou lista vazia.');
        }
      } catch (err: any) {
        console.warn('Utilizando fallback dados incorporados. Causa:', err.message);
        setErrorHeader(`Nota: Lendo base local de contingência.`);
        // Fallback set already by default state
        const today = new Date();
        setLastUpdatedDate(today.toLocaleDateString('pt-BR') + ' (Estático Fallback)');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  // Handler for custom uploaded spreadsheet data
  const handleCustomDataLoaded = (data: Colaborador[], sourceName: string) => {
    try {
      const now = new Date();
      const timestampString = `Enviado hoje às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} (${now.toLocaleDateString('pt-BR')})`;
      
      localStorage.setItem('adeo_custom_base_v2', JSON.stringify(data));
      localStorage.setItem('adeo_custom_filename', sourceName);
      localStorage.setItem('adeo_custom_timestamp', timestampString);

      setColaboradores(data);
      setIsUsingCustomData(true);
      setCustomDataName(sourceName);
      setCustomDataRows(data.length);
      setLastUpdatedDate(timestampString);
      
      // Clear filters to avoid confusing user if previous filters don't exist in new dataset
      handleClearFilters();
    } catch (err: any) {
      console.error("Local storage error:", err);
      // Fallback state update even if localStorage fails (e.g. quota exceeded)
      setColaboradores(data);
      setIsUsingCustomData(true);
      setCustomDataName(sourceName);
      setCustomDataRows(data.length);
      setLastUpdatedDate('Envio Temporário (Sem cache)');
    }
  };

  // Handler for resetting back to default seed data
  const handleResetData = () => {
    localStorage.removeItem('adeo_custom_base_v2');
    localStorage.removeItem('adeo_custom_filename');
    localStorage.removeItem('adeo_custom_timestamp');

    setIsUsingCustomData(false);
    setCustomDataName(null);
    setCustomDataRows(0);

    // Reload original static files
    const triggerReload = async () => {
      try {
        setLoading(true);
        setErrorHeader(null);
        const response = await fetch('/data/base_elegiveis.json');
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setColaboradores(data);
          const today = new Date();
          setLastUpdatedDate(today.toLocaleDateString('pt-BR') + ' ' + today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' (Restaurado)');
        } else {
          throw new Error();
        }
      } catch {
        setColaboradores(fallbackColaboradores);
        const today = new Date();
        setLastUpdatedDate(today.toLocaleDateString('pt-BR') + ' (Estático Fallback)');
      } finally {
        setLoading(false);
      }
    };
    
    triggerReload();
  };

  // Filter handlers
  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      
      // Cascading logic: if regional changes, check if the currently selected areaRH exists under this regional.
      // If it doesn't, we reset areaRH to ''.
      if ('regional' in newFilters) {
        const selectedRegional = newFilters.regional;
        if (selectedRegional) {
          const hasAreaInRegional = colaboradores.some(
            c => c.regional === selectedRegional && c.areaRH === updated.areaRH
          );
          if (!hasAreaInRegional) {
            updated.areaRH = '';
          }
        }
      }
      return updated;
    });
  };

  const handleClearFilters = () => {
    setFilters({
      regional: '',
      areaRH: '',
      status: '',
      search: '',
    });
  };

  // 1. Process Master Filter Pipeline (Top Filters rule)
  const filteredColaboradores = useMemo(() => {
    return colaboradores.filter((colab) => {
      // 1.1 Regional Filter
      if (filters.regional !== '' && colab.regional !== filters.regional) {
        return false;
      }

      // 1.2 Área de Recursos Humanos Filter
      if (filters.areaRH !== '' && colab.areaRH !== filters.areaRH) {
        return false;
      }

      // 1.4 Status Filter
      if (filters.status !== '') {
        // Classify to avoid casing or spelling mismatches
        if (filters.status === 'Realizado') {
          if (colab.status !== 'Realizado') return false;
        } else {
          if (colab.status === 'Realizado') return false;
        }
      }

      // 1.5 Global Search String (matricula or name)
      if (filters.search.trim() !== '') {
        const query = filters.search.toLowerCase();
        const nomeMatch = colab.nome ? colab.nome.toLowerCase().includes(query) : false;
        const matriculaMatch = colab.matricula ? colab.matricula.toLowerCase().includes(query) : false;
        if (!nomeMatch && !matriculaMatch) {
          return false;
        }
      }

      return true;
    });
  }, [colaboradores, filters]);

  // 2. Compute Dashboard KPI indicators on active filtered subset
  const stats: DashboardStats = useMemo(() => {
    const totalElegiveis = filteredColaboradores.length;
    const totalRealizado = filteredColaboradores.filter(c => c.status === 'Realizado').length;
    const totalNaoRealizado = totalElegiveis - totalRealizado;

    const pctRealizacao = totalElegiveis > 0 ? totalRealizado / totalElegiveis : 0;
    const pctNaoRealizacao = totalElegiveis > 0 ? totalNaoRealizado / totalElegiveis : 0;

    return {
      totalElegiveis,
      totalRealizado,
      totalNaoRealizado,
      pctRealizacao,
      pctNaoRealizacao,
      ultimaAtualizacao: lastUpdatedDate,
    };
  }, [filteredColaboradores, lastUpdatedDate]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Header section (Title of Dashboard + last sync timestamp) */}
      <Header 
        lastUpdated={lastUpdatedDate} 
        isAdminMode={isAdminMode} 
        setIsAdminMode={setIsAdminMode} 
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Connection contingency alert (subtle info item if fallback is in use) */}
        {errorHeader && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <span>{errorHeader} A aplicação está rodando perfeitamente offline utilizando o banco interno.</span>
            </div>
            <button 
              onClick={() => setErrorHeader(null)}
              className="text-xs text-amber-500 hover:text-amber-800 underline font-semibold cursor-pointer"
            >
              Dispensar
            </button>
          </div>
        )}

        {/* Dynamic Excel / CSV Upload zone (Only accessible to local Admins) */}
        {isAdminMode && (
          <BaseUpload 
            onDataLoaded={handleCustomDataLoaded} 
            onReset={handleResetData}
            isUsingCustomData={isUsingCustomData}
            customDataName={customDataName}
            customDataRows={customDataRows}
          />
        )}

        {/* 1. First Row: Filters (visible on top) */}
        <Filters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onClear={handleClearFilters}
          allColaboradores={colaboradores} 
        />

        {/* 2. Second Row: KPIs (Elegiveis, realizados, etc.) */}
        <KPICards stats={stats} />

        {/* 3. Third Row: Charts */}
        <section id="graficos" className="w-full">
          <DashboardCharts 
            filteredColaboradores={filteredColaboradores} 
            allColaboradores={colaboradores} 
            selectedRegional={filters.regional}
          />
        </section>

        {/* 4. Fourth Row: Tabela-resumo */}
        <section id="resumo" className="w-full">
          <TabelaResumo filteredColaboradores={filteredColaboradores} />
        </section>

        {/* 5. Fifth Row: Tabelas detalhadas com exportação */}
        <section id="detalhes" className="w-full">
          <TabelasDetalhadas filteredColaboradores={filteredColaboradores} />
        </section>

      </main>

      {/* Corporate footer */}
      <footer className="w-full border-t border-slate-200 bg-white py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-500 tracking-wider">ADEO</span>
            <span>&bull;</span>
            <span>Painel status de capacitação corporativa</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Desenvolvido com Diretrizes Operativas Sênior</span>
            <span>&bull;</span>
            <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">v1.1.0-stática</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

