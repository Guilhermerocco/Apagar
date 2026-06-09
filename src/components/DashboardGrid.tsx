/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CACRecord, AlertConfig, LTVConfig } from "../types";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  PiggyBank,
  Percent,
  TrendingDown,
  Activity
} from "lucide-react";
import { sumCostsOverall } from "../services/db";

interface DashboardGridProps {
  records: CACRecord[];
  alertConfig: AlertConfig;
  ltvConfig: LTVConfig;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  records,
  alertConfig,
  ltvConfig,
}) => {
  // 1. Calculate Aggregated values
  let totalInvested = 0;
  let totalTraffic = 0;
  let totalTools = 0;
  let totalTeam = 0;
  let totalContent = 0;
  let totalExtras = 0;

  let totalImpressions = 0;
  let totalClicks = 0;
  let totalLeads = 0;
  let totalQualifiedLeads = 0;
  let totalMeetings = 0;
  let totalProposals = 0;
  let totalStudents = 0;
  let totalRevenue = 0;

  records.forEach((rec) => {
    // Sum costs
    totalTraffic += rec.costs.traffic.googleAds + rec.costs.traffic.metaAds + rec.costs.traffic.tikTokAds + rec.costs.traffic.linkedInAds + rec.costs.traffic.youtubeAds + rec.costs.traffic.otherTraffic;
    totalTools += rec.costs.tools.crm + rec.costs.tools.whatsAppBusiness + rec.costs.tools.emailMarketing + rec.costs.tools.automations + rec.costs.tools.landingPages + rec.costs.tools.hosting + rec.costs.tools.otherTools;
    totalTeam += rec.costs.team.salaries + rec.costs.team.commissions + rec.costs.team.bonuses + rec.costs.team.training;
    totalContent += rec.costs.content.designer + rec.costs.content.socialMedia + rec.costs.content.videoEditor + rec.costs.content.copywriter + rec.costs.content.photography + rec.costs.content.otherContent;
    totalExtras += rec.costs.extras.events + rec.costs.extras.gifts + rec.costs.extras.consulting + rec.costs.extras.partnerships + rec.costs.extras.otherExtras;

    // Sum metrics
    totalImpressions += rec.metrics.impressions;
    totalClicks += rec.metrics.clicks;
    totalLeads += rec.metrics.leads;
    totalQualifiedLeads += rec.metrics.qualifiedLeads;
    totalMeetings += rec.metrics.meetings;
    totalProposals += rec.metrics.proposals;
    totalStudents += rec.metrics.students;
    totalRevenue += rec.metrics.revenue;
  });

  totalInvested = totalTraffic + totalTools + totalTeam + totalContent + totalExtras;

  // 2. Calculations
  const calculatedCAC = totalStudents > 0 ? totalInvested / totalStudents : 0;
  const calculatedCPL = totalLeads > 0 ? totalInvested / totalLeads : 0;
  const conversionRate = totalLeads > 0 ? (totalStudents / totalLeads) * 105 : 0; // Adjusted for conversion calculations
  const actualConversionRate = totalLeads > 0 ? (totalStudents / totalLeads) * 100 : 0;
  
  const estimatedProfit = totalRevenue - totalInvested;
  const calculatedROI = totalInvested > 0 ? ((totalRevenue - totalInvested) / totalInvested) * 100 : 0;
  const ticketMedio = totalStudents > 0 ? totalRevenue / totalStudents : 0;
  
  // LTV is pulled from the configuration
  const ltvRatio = calculatedCAC > 0 ? ltvConfig.estimatedLtv / calculatedCAC : 0;

  // 3. Alerts evaluation
  const isCacOverLimit = calculatedCAC > alertConfig.maxCAC && calculatedCAC > 0;
  const isCplOverLimit = calculatedCPL > alertConfig.maxCPL && calculatedCPL > 0;
  const isConversionUnderLimit = actualConversionRate < alertConfig.minConversion && totalLeads > 0;
  const isRoiNegative = calculatedROI < 0 && totalInvested > 0;

  // Helper with formatting currency
  const formatBRL = (val: number) => {
    return val.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Performance Index rating for LTV/CAC
  const getLTVRating = (ratio: number) => {
    if (ratio >= 4) return { text: "Excelente (Saudável)", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200" };
    if (ratio >= 3) return { text: "Saudável (Ideal)", color: "text-teal-500 bg-teal-50 dark:bg-teal-900/10 border-teal-200" };
    if (ratio >= 2) return { text: "Moderado (Alerta)", color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-905 bg-opacity-10 border-yellow-200" };
    return { text: "Crítico", color: "text-red-500 bg-red-50 dark:bg-red-950 bg-opacity-20 border-red-200" };
  };

  const ltvRating = getLTVRating(ltvRatio);

  return (
    <div className="space-y-6">
      
      {/* Active Warning Alerts Banner */}
      {(isCacOverLimit || isCplOverLimit || isConversionUnderLimit || isRoiNegative) && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4">
          <div className="flex gap-2 text-amber-800 dark:text-amber-300 font-bold mb-1 items-center">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Alertas Inteligentes Ativos</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pl-7 text-xs text-amber-700 dark:text-amber-400">
            {isCacOverLimit && (
              <p className="flex items-center gap-1.5">&#8226; <strong>CAC de {formatBRL(calculatedCAC)}</strong> ultrapassou o teto definido de {formatBRL(alertConfig.maxCAC)}.</p>
            )}
            {isCplOverLimit && (
              <p className="flex items-center gap-1.5">&#8226; <strong>CPL de {formatBRL(calculatedCPL)}</strong> ultrapassou o desejável de {formatBRL(alertConfig.maxCPL)}.</p>
            )}
            {isConversionUnderLimit && (
              <p className="flex items-center gap-1.5">&#8226; <strong>Conversão de {actualConversionRate.toFixed(1)}%</strong> está abaixo do limite de {alertConfig.minConversion}%.</p>
            )}
            {isRoiNegative && (
              <p className="flex items-center gap-1.5">&#8226; <strong>ROI Negativo ({calculatedROI.toFixed(0)}%)</strong>. Operação deficitária neste período!</p>
            )}
          </div>
        </div>
      )}

      {/* Grid of Key Performance Indicators (SaaS Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* CAC Card */}
        <div className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all ${
          isCacOverLimit 
            ? "border-red-400 dark:border-red-900 shadow-sm shadow-red-50 dark:shadow-none" 
            : "border-zinc-200 dark:border-zinc-800"
        }`}>
          <div className="flex justify-between items-start text-zinc-400">
            <span className="text-sm font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">CAC Atual</span>
            <div className={`p-2 rounded-xl ${isCacOverLimit ? "bg-red-50 dark:bg-red-900/15 text-red-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {formatBRL(calculatedCAC)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {isCacOverLimit ? (
                <>
                  <span className="text-red-500 font-semibold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Alta de CAC
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500">teto: {formatBRL(alertConfig.maxCAC)}</span>
                </>
              ) : (
                <>
                  <span className="text-emerald-500 font-semibold flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-0.5" /> Controlado
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-500">ótimo desempenho</span>
                </>
              )}
            </div>
          </div>
          
          {/* Spark-indicator */}
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[11px] text-zinc-400">
            <span>Invest.: {formatBRL(totalInvested)}</span>
            <span>Matrículas: {totalStudents}</span>
          </div>
        </div>

        {/* Investimento Total Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex justify-between items-start text-zinc-400">
            <span className="text-sm font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">Total Investido</span>
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-indigo-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {formatBRL(totalInvested)}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded font-medium">
                Tráfego: {((totalTraffic / (totalInvested || 1)) * 100).toFixed(0)}%
              </span>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded font-medium">
                SaaS/Time: {(((totalTools + totalTeam + totalContent) / (totalInvested || 1)) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          
          <div className="mt-3.5 space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Tráfego Pago</span>
              <span className="font-semibold text-zinc-600 dark:text-zinc-300">{formatBRL(totalTraffic)}</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full" 
                style={{ width: `${(totalTraffic / (totalInvested || 1)) * 100}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Conversão Card */}
        <div className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all ${
          isConversionUnderLimit
            ? "border-amber-400 dark:border-amber-900 shadow-sm shadow-amber-50 dark:shadow-none"
            : "border-zinc-200 dark:border-zinc-800"
        }`}>
          <div className="flex justify-between items-start text-zinc-400">
            <span className="text-sm font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">Conversão (L&rarr;A)</span>
            <div className={`p-2 rounded-xl ${isConversionUnderLimit ? "bg-amber-50 dark:bg-amber-900/15 text-amber-500" : "bg-zinc-100 dark:bg-zinc-800 text-emerald-500"}`}>
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              {actualConversionRate.toFixed(2)}%
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              {isConversionUnderLimit ? (
                <>
                  <span className="text-amber-500 font-semibold flex items-center">
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> Conversão Baixa
                  </span>
                  <span className="text-zinc-400 text-[10px]">mínima: {alertConfig.minConversion}%</span>
                </>
              ) : (
                <>
                  <span className="text-emerald-500 font-semibold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Alta Conversão
                  </span>
                  <span className="text-zinc-400 text-[10px]">excelente funil</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[11px] text-zinc-400">
            <span>Leads: {totalLeads}</span>
            <span>Matrículas: {totalStudents}</span>
          </div>
        </div>

        {/* ROI / Lucro Card */}
        <div className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all ${
          isRoiNegative
            ? "border-red-400 dark:border-red-900"
            : "border-zinc-200 dark:border-zinc-800"
        }`}>
          <div className="flex justify-between items-start text-zinc-400">
            <span className="text-sm font-semibold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">ROI Geral</span>
            <div className={`p-2 rounded-xl ${isRoiNegative ? "bg-red-50 dark:bg-red-900/15 text-red-500" : "bg-emerald-50 dark:bg-emerald-990 bg-opacity-20 text-emerald-500"}`}>
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-3xl font-bold tracking-tight ${isRoiNegative ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"}`}>
              {calculatedROI.toFixed(0)}%
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Lucro:</span>
              <span className={`font-bold ${estimatedProfit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {formatBRL(estimatedProfit)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[11px] text-zinc-400">
            <span>Faturado: {formatBRL(totalRevenue)}</span>
            <span>Est. {calculatedROI > 0 ? "Multiplicador" : ""}: {(totalRevenue / (totalInvested || 1)).toFixed(1)}x</span>
          </div>
        </div>

      </div>

      {/* Secondary Row (CPL, Ticket Médio) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* CPL Card */}
        <div className={`p-5 rounded-xl bg-white dark:bg-zinc-900 border ${
          isCplOverLimit ? "border-amber-300 dark:border-amber-900/50" : "border-zinc-200 dark:border-zinc-800"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Custo por Lead (CPL)</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 block">
                {formatBRL(calculatedCPL)}
              </span>
            </div>
            <div className="p-3 bg-zinc-150 dark:bg-zinc-800 text-zinc-500 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Performance CPL</span>
              <span>Desejado: {formatBRL(alertConfig.maxCPL)}</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${isCplOverLimit ? "bg-amber-500" : "bg-indigo-500"}`} 
                style={{ width: `${Math.min((calculatedCPL / (alertConfig.maxCPL || 1)) * 100, 100)}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Ticket Médio Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Ticket Médio de Venda</span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-white mt-1 block">
                {formatBRL(ticketMedio)}
              </span>
            </div>
            <div className="p-3 bg-zinc-150 dark:bg-zinc-800 text-indigo-500 rounded-lg">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Média ponderada baseada no faturamento real e matrículas arrecadadas no período.
          </div>
        </div>

      </div>

    </div>
  );
};
