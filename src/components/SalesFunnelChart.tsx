/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CACRecord } from "../types";
import { ArrowDown, TrendingDown, HelpCircle, Users, Eye, MousePointerClick, MessageSquare, ThumbsUp, Calendar, FileText, GraduationCap } from "lucide-react";

interface SalesFunnelModelProps {
  records: CACRecord[];
}

export const SalesFunnelChart: React.FC<SalesFunnelModelProps> = ({ records }) => {
  // Aggregate all funnel numbers
  let impressions = 0;
  let clicks = 0;
  let leads = 0;
  let qualifiedLeads = 0;
  let meetings = 0;
  let proposals = 0;
  let students = 0;

  records.forEach((rec) => {
    impressions += rec.metrics.impressions;
    clicks += rec.metrics.clicks;
    leads += rec.metrics.leads;
    qualifiedLeads += rec.metrics.qualifiedLeads;
    meetings += rec.metrics.meetings;
    proposals += rec.metrics.proposals;
    students += rec.metrics.students;
  });

  const stages = [
    {
      id: "impressions",
      label: "Impressões",
      count: impressions,
      icon: Eye,
      color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-650",
      barColor: "bg-indigo-300 dark:bg-indigo-800",
      description: "Visualizações totais de anúncios",
    },
    {
      id: "clicks",
      label: "Cliques",
      count: clicks,
      icon: MousePointerClick,
      color: "bg-indigo-50 dark:bg-indigo-950/25 text-indigo-500",
      barColor: "bg-indigo-400 dark:bg-indigo-700",
      description: "Acessos na página ou anúncio link",
    },
    {
      id: "leads",
      label: "Leads Cadastrados",
      count: leads,
      icon: MessageSquare,
      color: "bg-blue-50 dark:bg-blue-950/25 text-blue-500",
      barColor: "bg-blue-400 dark:bg-blue-700",
      description: "Contatos de e-mail/telefone gerados",
    },
    {
      id: "qualifiedLeads",
      label: "Leads Qualificados",
      count: qualifiedLeads,
      icon: ThumbsUp,
      color: "bg-sky-50 dark:bg-sky-950/25 text-sky-500",
      barColor: "bg-sky-400 dark:bg-sky-700",
      description: "Atendidos por SDR / Triagem de perfil",
    },
    {
      id: "meetings",
      label: "Reuniões Realizadas",
      count: meetings,
      icon: Calendar,
      color: "bg-teal-50 dark:bg-teal-950/25 text-teal-500",
      barColor: "bg-teal-400 dark:bg-teal-700",
      description: "Entrevistas de vendas/agendados",
    },
    {
      id: "proposals",
      label: "Propostas Enviadas",
      count: proposals,
      icon: FileText,
      color: "bg-emerald-50 dark:bg-emerald-995/25 text-emerald-500",
      barColor: "bg-emerald-400 dark:bg-emerald-700",
      description: "Envio de orçamentos e links de checkout",
    },
    {
      id: "students",
      label: "Alunos / Matrículas",
      count: students,
      icon: GraduationCap,
      color: "bg-emerald-500 text-white",
      barColor: "bg-emerald-500",
      description: "Vendas totalmente fechadas e pagas",
    },
  ];

  // Helper to compute percentage relative to parent
  const getConversionToPrev = (current: number, prev: number) => {
    if (prev === 0) return 0;
    return (current / prev) * 100;
  };

  // Helper to compute percentage relative to top of funnel (impressions)
  const getOverallRate = (current: number) => {
    const topValue = impressions || 1;
    return (current / topValue) * 100;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6 gap-3">
        <div>
          <h4 className="text-base font-bold text-zinc-900 dark:text-white">
            Funil de Vendas & Conversões do Lançamento
          </h4>
          <p className="text-xs text-zinc-400">
            Acompanhe a taxa de eficiência de cada etapa de captação e identifique gargalos operacionais.
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-2 px-3 bg-zinc-50 dark:bg-zinc-850 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 self-start">
          <TrendingDown className="w-4 h-4" />
          <span>Conversão Total (Lead &rarr; Aluno): {(leads > 0 ? (students / leads) * 100 : 0).toFixed(2)}%</span>
        </div>
      </div>

      {/* Funnel Layout */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {stages.map((stage, index) => {
          const prevStage = index > 0 ? stages[index - 1] : null;
          const convToPrev = prevStage ? getConversionToPrev(stage.count, prevStage.count) : 100;
          const overallRate = getOverallRate(stage.count);

          const maxCount = impressions || 1;
          const barWidthPercent = maxCount > 0 ? Math.max((stage.count / maxCount) * 100, 3) : 3;

          return (
            <div key={stage.id} className="group">
              {/* Transition arrow block */}
              {index > 0 && prevStage && (
                <div className="flex justify-center -my-2.5 relative z-10">
                  <div className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-full text-[10px] font-bold text-zinc-500 shadow-xs group-hover:border-indigo-400 group-hover:text-indigo-500 transition-colors">
                    <ArrowDown className="w-3 h-3 text-indigo-500 animate-bounce" />
                    <span>Progresso / Conversão de Etapa: {convToPrev.toFixed(1)}%</span>
                  </div>
                </div>
              )}

              {/* Main Funnel Step Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-850 rounded-xl p-3 md:p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                
                {/* 1. Stage Identity */}
                <div className="md:col-span-3 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${stage.color} shrink-0`}>
                    <stage.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                      {index + 1}. {stage.label}
                    </h5>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">
                      {stage.description}
                    </p>
                  </div>
                </div>

                {/* 2. Visual Bar representation (scaled by width) */}
                <div className="md:col-span-5 space-y-1">
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-8 rounded-lg overflow-hidden relative flex items-center">
                    {/* The Fill bar */}
                    <div 
                      className={`h-full opacity-85 transition-all duration-500 ${stage.barColor}`}
                      style={{ width: `${barWidthPercent}%` }}
                    />
                    
                    {/* Floating label inside */}
                    <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-bold pointer-events-none">
                      <span className="text-zinc-600 dark:text-zinc-300 mix-blend-difference">
                        {stage.count.toLocaleString("pt-BR")}
                      </span>
                      <span className="text-zinc-400 text-[10px] mix-blend-difference font-semibold">
                        {index === 0 ? "Topo (100%)" : `${overallRate.toFixed(index > 3 ? 3 : 1)}% do total`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Conversion Info summaries */}
                <div className="md:col-span-4 grid grid-cols-2 gap-2 text-center md:text-right">
                  <div className="bg-zinc-50 dark:bg-zinc-905 p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 md:bg-transparent md:border-transparent md:p-0">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">Tx do Conversão</span>
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {index === 0 ? "-" : `${convToPrev.toFixed(1)}%`}
                    </span>
                    <span className="text-[9px] text-zinc-400 block">etapa anterior</span>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-905 p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 md:bg-transparent md:border-transparent md:p-0">
                    <span className="text-[9px] uppercase font-bold text-zinc-400 block mb-0.5">Perda Acumulada</span>
                    <span className="text-xs font-bold text-red-500">
                      {index === 0 ? "-" : `${(100 - overallRate).toFixed(1)}%`}
                    </span>
                    <span className="text-[9px] text-zinc-400 block">desistencia comercial</span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
