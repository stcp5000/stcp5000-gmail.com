/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Colaborador {
  ldap: string;
  nome: string;
  status: 'Realizado' | 'No realizado' | 'Não realizado';
  regional: string;
  diretoria: string;
  areaRH: string;
  cargo: string;
}

export interface DashboardFilters {
  regional: string;
  areaRH: string;
  status: string;
  search: string;
}

export interface DashboardStats {
  totalElegiveis: number;
  totalRealizado: number;
  totalNaoRealizado: number;
  pctRealizacao: number;
  pctNaoRealizacao: number;
  ultimaAtualizacao: string;
}

export interface RegionalStats {
  name: string;
  elegiveis: number;
  realizados: number;
  naoRealizados: number;
  taxaRealizacao: number; // percentage (0 - 100)
}

export interface AreaRHStats {
  name: string;
  elegiveis: number;
  realizados: number;
  naoRealizados: number;
  taxaRealizacao: number; // percentage (0 - 100)
}

export interface TabelaResumoRow {
  regional: string;
  areaRH: string;
  elegiveis: number;
  realizados: number;
  naoRealizados: number;
  pctRealizacao: number;
}
