/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Colaborador } from '../types';

/**
 * Escapes characters for CSV values to prevent formatting issues
 */
function escapeCSVValue(val: string | number | undefined): string {
  if (val === undefined || val === null) return '';
  const str = String(val).replace(/"/g, '""');
  // If value contains comma, double quotes, or newlines, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`;
  }
  return str;
}

/**
 * Downloads a string content as a CSV file with BOM for proper Excel encoding
 */
export function downloadCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const csvContent = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map(row => row.map(escapeCSVValue).join(','))
  ].join('\r\n');

  // Prefix with BOM (\uFEFF) to make Excel read it as UTF-8
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Performs a CSV export of active collaborator data.
 */
export function exportColaboradoresToCSV(colaboradores: Colaborador[], typeLabel: string) {
  const headers = [
    'LDAP',
    'Nome',
    'Status',
    'Regional',
    'Diretoria',
    'Área de Recursos Humanos',
    'Cargo'
  ];

  const rows = colaboradores.map(c => [
    c.ldap,
    c.nome,
    c.status,
    c.regional,
    c.diretoria,
    c.areaRH,
    c.cargo
  ]);

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `ADEO_Libras_${typeLabel.replace(/\s+/g, '_')}_${dateStr}`;
  downloadCSV(headers, rows, filename);
}

/**
 * Exports summary data rows to CSV file
 */
export function exportTabelaResumoToCSV(rowsData: {
  regional: string;
  areaRH: string;
  elegiveis: number;
  realizados: number;
  naoRealizados: number;
  pctRealizacao: number;
}[]) {
  const headers = [
    'Regional',
    'Área de Recursos Humanos',
    'Elegíveis',
    'Realizados',
    'Não Realizados',
    'Taxa de Realização (%)'
  ];

  const rows = rowsData.map(r => [
    r.regional,
    r.areaRH,
    r.elegiveis,
    r.realizados,
    r.naoRealizados,
    r.pctRealizacao.toFixed(1) + '%'
  ]);

  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(headers, rows, `ADEO_Resumo_Recouperamento_${dateStr}`);
}
