/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { AlertConfig, LTVConfig } from "../types";
import { Settings, Bell, CircleDollarSign, ShieldAlert, GraduationCap, RefreshCw, Sparkles, Check } from "lucide-react";

interface SettingsPanelProps {
  alertConfig: AlertConfig;
  ltvConfig: LTVConfig;
  onSaveAlerts: (config: AlertConfig) => void;
  onSaveLtv: (config: LTVConfig) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  alertConfig,
  ltvConfig,
  onSaveAlerts,
  onSaveLtv,
}) => {
  // Local configuration states
  const [maxCAC, setMaxCAC] = useState(alertConfig.maxCAC);
  const [maxCPL, setMaxCPL] = useState(alertConfig.maxCPL);
  const [minConversion, setMinConversion] = useState(alertConfig.minConversion);
  const [minROI, setMinROI] = useState(alertConfig.minROI);

  const [avgRetentionMonths, setAvgRetentionMonths] = useState(ltvConfig.avgRetentionMonths);
  const [membershipMonthlyFee, setMembershipMonthlyFee] = useState(ltvConfig.membershipMonthlyFee);
  
  const [isSavedAlerts, setIsSavedAlerts] = useState(false);
  const [isSavedLtv, setIsSavedLtv] = useState(false);

  // Compute LTV dynamically on-screen
  const computedLtvValue = avgRetentionMonths * membershipMonthlyFee;

  const handleAlertsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAlerts({
      maxCAC,
      maxCPL,
      minConversion,
      minROI
    });
    setIsSavedAlerts(true);
    setTimeout(() => setIsSavedAlerts(false), 2000);
  };

  const handleLtvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLtv({
      avgRetentionMonths,
      membershipMonthlyFee,
      estimatedLtv: computedLtvValue
    });
    setIsSavedLtv(true);
    setTimeout(() => setIsSavedLtv(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      
      {/* 1. Alerts Threshold Management Form */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <Bell className="w-5 h-5 text-indigo-500" />
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Alvos e Limites de Alerta</h4>
            <p className="text-[10px] text-zinc-400">Defina os parâmetros limites. Se os dados ultrapassarem estes marcos, o sistema avisa.</p>
          </div>
        </div>

        <form onSubmit={handleAlertsSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Teto de CAC (R$)
              </label>
              <input
                type="number"
                min="1"
                value={maxCAC}
                onChange={(e) => setMaxCAC(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-805 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Teto do CPL (R$)
              </label>
              <input
                type="number"
                min="1"
                value={maxCPL}
                onChange={(e) => setMaxCPL(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-805 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Conversão Mínima (%)
              </label>
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={minConversion}
                onChange={(e) => setMinConversion(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-805 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                ROI Mínimo (%)
              </label>
              <input
                type="number"
                min="0"
                value={minROI}
                onChange={(e) => setMinROI(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-850 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4 flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              Sincronização reativa ativa
            </span>
            <button
              type="submit"
              className={`px-4 py-2 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSavedAlerts 
                  ? "bg-emerald-600 text-white" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              }`}
            >
              {isSavedAlerts ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Concluído!
                </>
              ) : (
                "Salvar Limites"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Educational Advanced LTV Calculator config */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col">
        <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <GraduationCap className="w-5 h-5 text-indigo-500" />
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Cálculo de LTV (Lifetime Value)</h4>
            <p className="text-[10px] text-zinc-400">Mensalidade média e tempo de retenção para cálculo da relação de lucro da escola.</p>
          </div>
        </div>

        <form onSubmit={handleLtvSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Mensalidade Média (R$)
              </label>
              <input
                type="number"
                min="1"
                value={membershipMonthlyFee}
                onChange={(e) => setMembershipMonthlyFee(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-805 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                Tempo de Matrícula (Meses)
              </label>
              <input
                type="number"
                min="1"
                value={avgRetentionMonths}
                onChange={(e) => setAvgRetentionMonths(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-805 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-zinc-950/40 p-3 rounded-xl border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs mt-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">LTV Estimado do Aluno</span>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                R$ {computedLtvValue.toLocaleString("pt-BR")}
              </span>
            </div>
            <span className="text-[9px] text-zinc-400 text-right max-w-[150px]">
              Fórmula: Mensalidade × Meses Médios de Permanência.
            </span>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-2 flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <CircleDollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Impacta a relação LTV/CAC: R$ {computedLtvValue}
            </span>
            <button
              type="submit"
              className={`px-4 py-2 text-xs rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                isSavedLtv 
                  ? "bg-emerald-600 text-white" 
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              }`}
            >
              {isSavedLtv ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Configurado!
                </>
              ) : (
                "Salvar Regras LTV"
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
