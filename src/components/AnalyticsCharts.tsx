/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CACRecord } from "../types";
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { sumCostsOverall } from "../services/db";
import { CircleDollarSign, PieChart as ChartIcon, Sparkles } from "lucide-react";

interface AnalyticsChartsProps {
  records: CACRecord[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ records }) => {
  
  // Sort records chronologically for temporal line charts
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 1. Prepare data for Composed Chart (Cost vs CAC vs Revenue)
  const chartData = sortedRecords.map((rec) => {
    const totalCost = sumCostsOverall(rec.costs);
    const cac = rec.metrics.students > 0 ? Math.round(totalCost / rec.metrics.students) : 0;
    return {
      name: rec.name.length > 20 ? rec.name.substring(0, 18) + "..." : rec.name,
      Investimento: totalCost,
      CAC: cac,
      Receita: rec.metrics.revenue,
      Matrículas: rec.metrics.students,
    };
  });

  // 2. Prepare data for Pie Chart (All categories allocation)
  let trafficSum = 0;
  let toolsSum = 0;
  let teamSum = 0;
  let contentSum = 0;
  let extrasSum = 0;

  // Let's also retrieve details for traffic channels specifically
  let googleAdsSum = 0;
  let metaAdsSum = 0;
  let tikTokAdsSum = 0;
  let linkedInAdsSum = 0;
  let youtubeAdsSum = 0;
  let otherTrafficSum = 0;

  records.forEach((rec) => {
    trafficSum += rec.costs.traffic.googleAds + rec.costs.traffic.metaAds + rec.costs.traffic.tikTokAds + rec.costs.traffic.linkedInAds + rec.costs.traffic.youtubeAds + rec.costs.traffic.otherTraffic;
    toolsSum += rec.costs.tools.crm + rec.costs.tools.whatsAppBusiness + rec.costs.tools.emailMarketing + rec.costs.tools.automations + rec.costs.tools.landingPages + rec.costs.tools.hosting + rec.costs.tools.otherTools;
    teamSum += rec.costs.team.salaries + rec.costs.team.commissions + rec.costs.team.bonuses + rec.costs.team.training;
    contentSum += rec.costs.content.designer + rec.costs.content.socialMedia + rec.costs.content.videoEditor + rec.costs.content.copywriter + rec.costs.content.photography + rec.costs.content.otherContent;
    extrasSum += rec.costs.extras.events + rec.costs.extras.gifts + rec.costs.extras.consulting + rec.costs.extras.partnerships + rec.costs.extras.otherExtras;

    googleAdsSum += rec.costs.traffic.googleAds;
    metaAdsSum += rec.costs.traffic.metaAds;
    tikTokAdsSum += rec.costs.traffic.tikTokAds;
    linkedInAdsSum += rec.costs.traffic.linkedInAds;
    youtubeAdsSum += rec.costs.traffic.youtubeAds;
    otherTrafficSum += rec.costs.traffic.otherTraffic;
  });

  const totalAllCosts = trafficSum + toolsSum + teamSum + contentSum + extrasSum || 1;

  const categoryPieData = [
    { name: "Tráfego Pago", value: trafficSum, color: "#6366f1" }, // indigo
    { name: "SaaS/Ferramentas", value: toolsSum, color: "#3b82f6" }, // blue
    { name: "Equipe Comercial", value: teamSum, color: "#10b981" }, // emerald
    { name: "Produção de Mídia", value: contentSum, color: "#ec4899" }, // pink
    { name: "Custos Extras", value: extrasSum, color: "#f59e0b" }, // amber
  ].filter(item => item.value > 0);

  // Fallback if empty
  const hasCosts = totalAllCosts > 1;

  const trafficChannelPieData = [
    { name: "Google Ads", value: googleAdsSum, color: "#ea4335" },
    { name: "Meta Ads", value: metaAdsSum, color: "#1877f2" },
    { name: "TikTok Ads", value: tikTokAdsSum, color: "#000000" },
    { name: "LinkedIn Ads", value: linkedInAdsSum, color: "#0077b5" },
    { name: "YouTube Ads", value: youtubeAdsSum, color: "#ff0000" },
    { name: "Outros Canais", value: otherTrafficSum, color: "#9ca3af" },
  ].filter(item => item.value > 0);

  const formatCurrencyTooltip = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      {/* Chart 1: Cost vs CAC vs Revenue (Spans 2 columns) */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col min-h-[380px]">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <CircleDollarSign className="w-4 h-4 text-indigo-500" />
              Eficiência Financeira vs CAC por Campanha
            </h4>
            <p className="text-[11px] text-zinc-400">
              Relação entre o volume investido, o faturamento gerado e o Custo de Aquisição (CAC) final.
            </p>
          </div>
          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
            Gráfico Consolidado
          </span>
        </div>

        {chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-zinc-400 text-xs">
            Registre lançamentos para gerar análises comparativas.
          </div>
        ) : (
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" className="dark:stroke-zinc-800/50" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#6366f1" fontSize={10} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                <YAxis yAxisId="right" orientation="right" stroke="#ec4899" fontSize={10} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                <Tooltip 
                  formatter={(value: any, name: any) => {
                    if (name === "CAC") return [`R$ ${value}`, "CAC (Direito)"];
                    return [formatCurrencyTooltip(value), name];
                  }}
                  contentStyle={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "10px", border: "none" }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
                <Bar yAxisId="left" dataKey="Investimento" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.8} />
                <Bar yAxisId="left" dataKey="Receita" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.7} />
                <Line yAxisId="right" type="monotone" dataKey="CAC" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Chart 2: Expense Allocation (Spans 1 column) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col min-h-[380px]">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <ChartIcon className="w-4 h-4 text-indigo-500" />
              Alocação e Mix de Gastos
            </h4>
            <p className="text-[11px] text-zinc-400">
              Distribuição proporcional dos orçamentos operacionais.
            </p>
          </div>
        </div>

        {!hasCosts ? (
          <div className="flex-1 flex items-center justify-center text-zinc-400 text-xs">
            Nenhuma despesa registrada para exibir.
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            {/* Pie Chart container */}
            <div className="w-full text-xs flex justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatCurrencyTooltip(val)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Interactive Legend with percentages */}
            <div className="space-y-2 mt-4">
              <span className="text-[10px] block uppercase font-bold text-zinc-400">Distribuição por Categoria</span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {categoryPieData.map((item, id) => {
                  const percentage = ((item.value / totalAllCosts) * 100).toFixed(1);
                  return (
                    <div key={id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-850/40 p-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800/40">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-zinc-900 dark:text-white">{percentage}%</span>
                        <span className="text-[10px] text-zinc-400 block">{formatCurrencyTooltip(item.value)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        )}
      </div>

    </div>
  );
};
