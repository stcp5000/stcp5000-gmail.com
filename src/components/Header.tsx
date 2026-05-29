/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Clock, Shield, ShieldCheck, Key, X, Check } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface HeaderProps {
  lastUpdated: string;
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
}

export default function Header({ lastUpdated, isAdminMode, setIsAdminMode }: HeaderProps) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleAdminToggleClick = () => {
    if (isAdminMode) {
      // Exit Admin Mode immediately
      setIsAdminMode(false);
    } else {
      // Open passcode input
      setShowPasswordInput(true);
      setPassword('');
      setPasswordError(false);
    }
  };

  const handleVerifyPassword = (e: FormEvent) => {
    e.preventDefault();
    // Case insensitive "admin" passkey for easy access
    if (password.toLowerCase().trim() === 'admin') {
      setIsAdminMode(true);
      setShowPasswordInput(false);
      setPassword('');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 py-5 px-6 md:px-8 shadow-xs relative">
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

        {/* Status Indicators & Admin Control Section */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Admin Mode Controls */}
          {showPasswordInput ? (
            <form 
              onSubmit={handleVerifyPassword} 
              className="flex items-center gap-2 bg-slate-50 border border-emerald-200 rounded-lg p-1.5 animate-fade-in shrink-0"
            >
              <Key className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
              <input 
                type="password"
                placeholder="Senha (Dica: admin)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                className={`text-xs px-2 py-1 border rounded bg-white w-32 focus:outline-hidden ${
                  passwordError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-emerald-500'
                }`}
                autoFocus
              />
              <button 
                type="submit" 
                className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded cursor-pointer transition-colors"
                title="Confirmar"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button 
                type="button" 
                onClick={() => setShowPasswordInput(false)}
                className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded cursor-pointer transition-colors"
                title="Cancelar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <button
              id="admin-toggle"
              onClick={handleAdminToggleClick}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isAdminMode 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-xs hover:bg-emerald-100/75' 
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800'
              }`}
            >
              {isAdminMode ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Modo Admin Ativo</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Acessar como Admin</span>
                </>
              )}
            </button>
          )}

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

      </div>
    </header>
  );
}
