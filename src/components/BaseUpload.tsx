/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Trash2,
  Layers,
  Database,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Colaborador } from '../types';

interface BaseUploadProps {
  onDataLoaded: (data: Colaborador[], sourceName: string) => void;
  onReset: () => void;
  isUsingCustomData: boolean;
  customDataName: string | null;
  customDataRows: number;
}

export default function BaseUpload({ 
  onDataLoaded, 
  onReset, 
  isUsingCustomData, 
  customDataName, 
  customDataRows 
}: BaseUploadProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalization logic for matching spreadsheet headers dynamically
  const normalizeKey = (key: string): string => {
    return key
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[.\s-_]+/g, "");       // remove dots, spaces, dashes
  };

  const processFile = (file: File) => {
    setError(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (workbook.SheetNames.length === 0) {
          throw new Error("O arquivo de planilha está vazio.");
        }

        // Search specifically for "Base_Elegíveis" or similar target tab
        let targetSheetName = workbook.SheetNames.find(name => {
          const norm = normalizeKey(name);
          return norm === 'baseelegiveis' || norm === 'baseelegivel' || norm.includes('eleg');
        });

        // Fallback to the first worksheet if no spec matches
        if (!targetSheetName) {
          targetSheetName = workbook.SheetNames[0];
        }

        const worksheet = workbook.Sheets[targetSheetName];
        if (!worksheet) {
          throw new Error(`A aba "${targetSheetName}" não pôde ser lida.`);
        }

        // Standard parsing using SheetJS
        const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });

        if (rows.length === 0) {
          throw new Error(`Nenhum dado encontrado na aba "${targetSheetName}". Verifique os dados.`);
        }

        // Get positional column headers
        const sheetRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
        const headersRow = sheetRows[0] || [];

        // Match headers dynamically to find exact column indices
        const headerIndices: { [key: string]: number } = {};
        for (let i = 0; i < headersRow.length; i++) {
          const rawHeader = headersRow[i];
          if (rawHeader === undefined || rawHeader === null) continue;
          const norm = normalizeKey(String(rawHeader));
          headerIndices[norm] = i;
        }

        const getIndex = (possibleKeys: string[], defaultIdx: number): number => {
          for (const key of possibleKeys) {
            const norm = normalizeKey(key);
            // 1. Try finding exact match
            if (headerIndices[norm] !== undefined) {
              return headerIndices[norm];
            }
          }
          // 2. Try finding loose / partial matches
          for (const key of possibleKeys) {
            const norm = normalizeKey(key);
            for (const header of Object.keys(headerIndices)) {
              if (header.includes(norm) || norm.includes(header)) {
                // Ensure we never match "codcargo" or "codigocargo" when specifically looking for "cargo"
                if (norm === 'cargo' && (header === 'codcargo' || header === 'codigocargo')) {
                  continue;
                }
                return headerIndices[header];
              }
            }
          }
          return defaultIdx;
        };

        // Specific, prioritized mapped indices with fallbacks matching standard layout
        const ldapIdx = getIndex(['ldap', 'matricula', 'id', 'codm'], 1); // Column B is index 1
        const cargoIdx = getIndex(['cargo', 'funcao', 'role'], 6); // Column G is index 6
        const nomeIdx = getIndex(['nome', 'namesocial', 'nomesocial', 'fullname', 'funcionario', 'colaborador'], 2); // Column C is index 2
        const statusIdx = getIndex(['status', 'situacao', 'realizacao', 'capacitacao'], 4); // Column E is index 4
        const regionalIdx = getIndex(['regional', 'regiao', 'descrdiretoria', 'descr.diretoria', 'diretoria descr', 'diretoria'], 11); // Column L is index 11
        const diretoriaIdx = getIndex(['descrdiretoria', 'descr.diretoria', 'diretoria descr', 'diretoria'], 12); // Column M is index 12
        const areaRHIdx = getIndex(['areaderecursoshumanos', 'arearecursoshumanos', 'arearh', 'rharea', 'bp', 'businesspartner', 'recursoshumanos', 'rh', 'recurso'], 13); // Column N is index 13

        // Map raw grid objects into our Colaborador entity
        const mappedColaboradores: Colaborador[] = [];

        // Loop through all data rows starting from row 1 (0 is header)
        for (let r = 1; r < sheetRows.length; r++) {
          const rowArr = sheetRows[r];
          if (!rowArr || rowArr.length === 0) continue;

          // 1. LDAP (first column) comes from our mapped LDAP Column (index 1 / Column B fallback)
          const ldap = rowArr[ldapIdx] !== undefined ? String(rowArr[ldapIdx]).trim() : '';

          // 2. Cargo comes from our mapped Cargo Column (index 6 / Column G fallback)
          const cargo = rowArr[cargoIdx] !== undefined ? String(rowArr[cargoIdx]).trim() : 'Colaborador';

          // 3. Nome comes from Nome Column (index 2 / Column C fallback)
          const nome = rowArr[nomeIdx] !== undefined ? String(rowArr[nomeIdx]).trim() : '';
          
          if (!ldap || !nome) {
            // Skip rows without main identifiers (typically empty footer spacing or corrupted data rows)
            continue;
          }

          // 4. Status decoding (index 4 / Column E fallback)
          const statusRaw = rowArr[statusIdx] !== undefined ? String(rowArr[statusIdx]).trim() : 'Não realizado';
          let status: 'Realizado' | 'Não realizado' | 'No realizado' = 'Não realizado';
          
          const normStatus = statusRaw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          if (normStatus.startsWith('realiz') || normStatus === 'sim' || normStatus === 's' || normStatus === 'completed' || normStatus === 'ok') {
            status = 'Realizado';
          } else {
            status = 'Não realizado';
          }

          // 5. Regional and Diretoria directory mapping (L / M / N indices fallback)
          const regionalRowRaw = rowArr[regionalIdx] !== undefined ? String(rowArr[regionalIdx]).trim() : '';
          const diretoriaRowRaw = rowArr[diretoriaIdx] !== undefined ? String(rowArr[diretoriaIdx]).trim() : '';
          
          const regional = regionalRowRaw || 'Regional Geral';
          const diretoria = diretoriaRowRaw || 'Diretoria Geral';

          // 6. Área de Recursos Humanos maps to "areaRH" (index 13 / Column N fallback)
          const areaRH = rowArr[areaRHIdx] !== undefined ? String(rowArr[areaRHIdx]).trim() : 'Geral';

          mappedColaboradores.push({
            ldap,
            nome,
            status,
            regional,
            diretoria,
            areaRH,
            cargo
          });
        }

        if (mappedColaboradores.length === 0) {
          throw new Error("Carregamento falhou: Sem linhas válidas correspondentes (precisa de 'Matrícula' e 'Nome' para cada linha).");
        }

        // Callback success output
        onDataLoaded(mappedColaboradores, `${file.name} [Aba: ${targetSheetName}]`);
        setSuccessMsg(`Sucesso! ${mappedColaboradores.length} colaboradores importados da aba "${targetSheetName}".`);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Ocorreu um erro ao decodificar a planilha.');
      }
    };

    reader.onerror = () => {
      setError('Falha na leitura física do arquivo.');
    };

    reader.readAsArrayBuffer(file);
  };

  // Drag handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        processFile(file);
      } else {
        setError('Tipo de arquivo não suportado. Por favor, envie uma planilha do Excel (.xlsx, .xls) ou CSV.');
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="base-upload-section" className="w-full bg-white border border-slate-200 rounded-xl p-3.5 mb-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left Side: Status / Info */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 animate-fade-in">Base de Dados Ativa</h3>
              {isUsingCustomData && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Customizada</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-sans">
              {isUsingCustomData ? (
                <>
                  Utilizando dados carregados de <span className="font-semibold text-emerald-700">{customDataName?.split(' [Aba')[0]}</span> ({customDataRows} registros)
                </>
              ) : (
                "Carregado automaticamente via arquivo public/data/base_elegiveis.json"
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Small upload target + action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Compact Upload Zone Target (acts as drop zone and click trigger) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`border border-dashed rounded-lg px-4 py-2 text-center cursor-pointer transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isDragging 
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 scale-95' 
                : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50 text-slate-600'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <Upload className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>Fazer Upload (Excel / CSV)</span>
          </div>

          {/* Reset button if custom data is active */}
          {isUsingCustomData && (
            <button
              onClick={() => {
                onReset();
                setSuccessMsg(null);
                setError(null);
              }}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
              title="Restaurar base estática original"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
          )}

        </div>

      </div>

      {/* Very compact error/success inline footer under the bar */}
      {(error || successMsg) && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] animate-fade-in font-sans">
          {error ? (
            <div className="flex items-center gap-1.5 text-red-700 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
          <button 
            onClick={() => {
              setError(null);
              setSuccessMsg(null);
            }} 
            className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer shrink-0"
          >
            Dispensar
          </button>
        </div>
      )}

    </div>
  );
}
