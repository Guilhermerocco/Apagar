/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CACRecord, CostBreakdown, FunnelMetrics } from "../types";
import { X, Calculator, CircleDollarSign, BarChart2, Info } from "lucide-react";
import { sumCostsOverall } from "../services/db";

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: CACRecord) => void;
  recordToEdit?: CACRecord | null;
}

const emptyCosts = (): CostBreakdown => ({
  traffic: { googleAds: 0, metaAds: 0, tikTokAds: 0, linkedInAds: 0, youtubeAds: 0, otherTraffic: 0 },
  tools: { crm: 0, whatsAppBusiness: 0, emailMarketing: 0, automations: 0, landingPages: 0, hosting: 0, otherTools: 0 },
  team: { salaries: 0, commissions: 0, bonuses: 0, training: 0 },
  content: { designer: 0, socialMedia: 0, videoEditor: 0, copywriter: 0, photography: 0, otherContent: 0 },
  extras: { events: 0, gifts: 0, consulting: 0, partnerships: 0, otherExtras: 0 },
});

const emptyMetrics = (): FunnelMetrics => ({
  impressions: 0,
  clicks: 0,
  leads: 0,
  qualifiedLeads: 0,
  meetings: 0,
  proposals: 0,
  students: 0,
  revenue: 0,
});

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  recordToEdit,
}) => {
  const [activeTab, setActiveTab] = useState<"general" | "expenses" | "metrics">("general");
  const [activeExpenseSubTab, setActiveExpenseSubTab] = useState<"traffic" | "tools" | "team" | "content" | "extras">("traffic");

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [channel, setChannel] = useState("Meta Ads");
  const [campaign, setCampaign] = useState("");
  
  const [costs, setCosts] = useState<CostBreakdown>(emptyCosts());
  const [metrics, setMetrics] = useState<FunnelMetrics>(emptyMetrics());

  useEffect(() => {
    if (recordToEdit) {
      setName(recordToEdit.name);
      setDate(recordToEdit.date);
      setChannel(recordToEdit.channel);
      setCampaign(recordToEdit.campaign);
      setCosts(JSON.parse(JSON.stringify(recordToEdit.costs)));
      setMetrics(JSON.parse(JSON.stringify(recordToEdit.metrics)));
    } else {
      setName("");
      setDate(new Date().toISOString().split("T")[0]);
      setChannel("Meta Ads");
      setCampaign("");
      setCosts(emptyCosts());
      setMetrics(emptyMetrics());
    }
    setActiveTab("general");
    setActiveExpenseSubTab("traffic");
  }, [recordToEdit, isOpen]);

  if (!isOpen) return null;

  // Calculators
  const trafficSum = costs.traffic.googleAds + costs.traffic.metaAds + costs.traffic.tikTokAds + costs.traffic.linkedInAds + costs.traffic.youtubeAds + costs.traffic.otherTraffic;
  const toolsSum = costs.tools.crm + costs.tools.whatsAppBusiness + costs.tools.emailMarketing + costs.tools.automations + costs.tools.landingPages + costs.tools.hosting + costs.tools.otherTools;
  const teamSum = costs.team.salaries + costs.team.commissions + costs.team.bonuses + costs.team.training;
  const contentSum = costs.content.designer + costs.content.socialMedia + costs.content.videoEditor + costs.content.copywriter + costs.content.photography + costs.content.otherContent;
  const extrasSum = costs.extras.events + costs.extras.gifts + costs.extras.consulting + costs.extras.partnerships + costs.extras.otherExtras;
  const totalCost = trafficSum + toolsSum + teamSum + contentSum + extrasSum;

  const handleCostChange = (
    category: keyof CostBreakdown,
    field: string,
    value: string
  ) => {
    const numeric = parseFloat(value) || 0;
    setCosts((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: numeric,
      },
    }));
  };

  const handleMetricChange = (field: keyof FunnelMetrics, value: string) => {
    const numeric = parseFloat(value) || 0;
    setMetrics((prev) => ({
      ...prev,
      [field]: numeric,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Por favor, preencha o nome do lançamento.");
    
    onSave({
      id: recordToEdit?.id || "rec-" + Math.random().toString(36).substr(2, 9),
      name,
      date,
      channel,
      campaign: campaign || "Geral",
      costs,
      metrics,
      createdAt: recordToEdit?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  // Predefined channels for course/school marketing
  const popularChannels = [
    "Meta Ads",
    "Google Ads",
    "TikTok Ads",
    "LinkedIn Ads",
    "YouTube Ads",
    "Tráfego Orgânico",
    "Parcerias/Influenciadores",
    "Telegram/WhatsApp",
    "Email MKT",
    "Outros"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-500" />
              {recordToEdit ? "Editar Lançamento/Campanha" : "Registrar Novo Lançamento"}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Insira as despesas e métricas para o cálculo automático e preciso do CAC.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Tabs */}
        <div className="flex border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === "general"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs">1</span>
            Geral / Campanha
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === "expenses"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs">2</span>
            Investimento (R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("metrics")}
            className={`flex-1 py-3 text-center font-medium text-sm border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === "metrics"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-900"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs">3</span>
            Métricas de Conversão
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/30 dark:bg-zinc-950/20">
          {activeTab === "general" && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-150 dark:border-indigo-900/30 rounded-xl p-4 flex gap-3 text-indigo-800 dark:text-indigo-300">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Defina um nome que facilite a busca posterior do relatório (Exemplo: <em>Turma Ingles Intensivo Meta Maio</em> ou <em>Inscrições Graduação Google Q2</em>). O canal e a campanha servirão para filtrar o comportamento do CAC no dashboard.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Identificador / Nome do Lançamento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lançamento Infoproduto Vestibular Maio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Data de Acompanhamento
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Canal Principal de Tráfego
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {popularChannels.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Nome da Campanha / Produto
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Turma IA VIP / Concurso"
                    value={campaign}
                    onChange={(e) => setCampaign(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab("expenses")}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  Continuar para Gastos
                </button>
              </div>
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="space-y-6">
              {/* Expense Category Inner Tabs */}
              <div className="flex flex-wrap gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl max-w-3xl mx-auto">
                <button
                  type="button"
                  onClick={() => setActiveExpenseSubTab("traffic")}
                  className={`flex-1 py-2 px-3 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                    activeExpenseSubTab === "traffic"
                      ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  Tráfego Pago (R$ {trafficSum})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveExpenseSubTab("tools")}
                  className={`flex-1 py-2 px-3 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                    activeExpenseSubTab === "tools"
                      ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  Ferramentas (R$ {toolsSum})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveExpenseSubTab("team")}
                  className={`flex-1 py-2 px-3 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                    activeExpenseSubTab === "team"
                      ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  Vendas/Comercial (R$ {teamSum})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveExpenseSubTab("content")}
                  className={`flex-1 py-2 px-3 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                    activeExpenseSubTab === "content"
                      ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  Produção Mídia (R$ {contentSum})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveExpenseSubTab("extras")}
                  className={`flex-1 py-2 px-3 text-xs md:text-sm font-semibold rounded-lg transition-all ${
                    activeExpenseSubTab === "extras"
                      ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                  }`}
                >
                  Extras (R$ {extrasSum})
                </button>
              </div>

              {/* Total Investment Sticky Banner */}
              <div className="bg-zinc-900 text-white rounded-xl p-4 flex justify-between items-center max-w-2xl mx-auto shadow-md">
                <span className="text-zinc-400 text-sm flex items-center gap-1.5 font-medium">
                  <CircleDollarSign className="w-4 h-4 text-emerald-400" />
                  Investimento Total Calculado
                </span>
                <span className="text-xl font-bold text-emerald-400">
                  R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Expense Category Fields Grid */}
              <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {activeExpenseSubTab === "traffic" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Google Ads (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={costs.traffic.googleAds || ""}
                        onChange={(e) => handleCostChange("traffic", "googleAds", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Meta Ads (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={costs.traffic.metaAds || ""}
                        onChange={(e) => handleCostChange("traffic", "metaAds", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">TikTok Ads (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={costs.traffic.tikTokAds || ""}
                        onChange={(e) => handleCostChange("traffic", "tikTokAds", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">LinkedIn Ads (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={costs.traffic.linkedInAds || ""}
                        onChange={(e) => handleCostChange("traffic", "linkedInAds", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">YouTube Ads (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={costs.traffic.youtubeAds || ""}
                        onChange={(e) => handleCostChange("traffic", "youtubeAds", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Outro Tráfego (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={costs.traffic.otherTraffic || ""}
                        onChange={(e) => handleCostChange("traffic", "otherTraffic", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:indigo-500"
                      />
                    </div>
                  </div>
                )}

                {activeExpenseSubTab === "tools" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">CRM (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.tools.crm || ""}
                        onChange={(e) => handleCostChange("tools", "crm", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-150-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">WhatsApp Business (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.tools.whatsAppBusiness || ""}
                        onChange={(e) => handleCostChange("tools", "whatsAppBusiness", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">E-mail Marketing (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.tools.emailMarketing || ""}
                        onChange={(e) => handleCostChange("tools", "emailMarketing", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Automações / Chatbots (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.tools.automations || ""}
                        onChange={(e) => handleCostChange("tools", "automations", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Landing Pages / Criador (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.tools.landingPages || ""}
                        onChange={(e) => handleCostChange("tools", "landingPages", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Hospedagem de Vídeos/Sites (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.tools.hosting || ""}
                        onChange={(e) => handleCostChange("tools", "hosting", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Outras Ferramentas (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.tools.otherTools || ""}
                        onChange={(e) => handleCostChange("tools", "otherTools", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                )}

                {activeExpenseSubTab === "team" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Salários Redes/Comercial (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.team.salaries || ""}
                        onChange={(e) => handleCostChange("team", "salaries", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Comissões sobre Matrículas (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.team.commissions || ""}
                        onChange={(e) => handleCostChange("team", "commissions", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Bônus por Metas Batidas (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.team.bonuses || ""}
                        onChange={(e) => handleCostChange("team", "bonuses", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Treinamento do Comercial (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.team.training || ""}
                        onChange={(e) => handleCostChange("team", "training", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                )}

                {activeExpenseSubTab === "content" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Designer (Criativos/Imagens) (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.content.designer || ""}
                        onChange={(e) => handleCostChange("content", "designer", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Social Media (Mídias Sociais) (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.content.socialMedia || ""}
                        onChange={(e) => handleCostChange("content", "socialMedia", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Editor de Vídeos (Anúncios/Aulas) (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.content.videoEditor || ""}
                        onChange={(e) => handleCostChange("content", "videoEditor", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Copywriter / Roteirista (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.content.copywriter || ""}
                        onChange={(e) => handleCostChange("content", "copywriter", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Fotografia / Gravação (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.content.photography || ""}
                        onChange={(e) => handleCostChange("content", "photography", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Outros Produção (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.content.otherContent || ""}
                        onChange={(e) => handleCostChange("content", "otherContent", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                )}

                {activeExpenseSubTab === "extras" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Eventos Presenciais/Lives (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.extras.events || ""}
                        onChange={(e) => handleCostChange("extras", "events", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Brindes e KITS (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.extras.gifts || ""}
                        onChange={(e) => handleCostChange("extras", "gifts", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Consultorias do Lançamento (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.extras.consulting || ""}
                        onChange={(e) => handleCostChange("extras", "consulting", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Parcerias / Escolas Afiliadas (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.extras.partnerships || ""}
                        onChange={(e) => handleCostChange("extras", "partnerships", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">Outros Custos Extras (R$)</label>
                      <input
                        type="number"
                        min="0"
                        value={costs.extras.otherExtras || ""}
                        onChange={(e) => handleCostChange("extras", "otherExtras", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-between max-w-3xl mx-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-805 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium transition-all cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("metrics")}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  Continuar para Métricas
                </button>
              </div>
            </div>
          )}

          {activeTab === "metrics" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-white dark:bg-zinc-900/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-2">
                  <BarChart2 className="w-5 h-5 text-indigo-500" />
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-sm">Métricas de funil para cálculo de CAC e conversões</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      1. Impressões de Anúncios
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Cliques/Visibilidade"
                      value={metrics.impressions || ""}
                      onChange={(e) => handleMetricChange("impressions", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      2. Cliques Totais (Anúncios / Páginas)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={metrics.clicks || ""}
                      onChange={(e) => handleMetricChange("clicks", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      3. Leads Cadastrados
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={metrics.leads || ""}
                      onChange={(e) => handleMetricChange("leads", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      4. Leads Qualificados (SDR / Triagem)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={metrics.qualifiedLeads || ""}
                      onChange={(e) => handleMetricChange("qualifiedLeads", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      5. Reuniões Agendadas / Entrevistas
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={metrics.meetings || ""}
                      onChange={(e) => handleMetricChange("meetings", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      6. Propostas Enviadas (Comercial)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={metrics.proposals || ""}
                      onChange={(e) => handleMetricChange("proposals", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      7. Matrículas / Alunos Fechados (Novos Alunos) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={metrics.students || ""}
                      onChange={(e) => handleMetricChange("students", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-[10px] text-zinc-400">Elemento divisor para cálculo do CAC.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-1">
                      8. Receita Gerada com Lançamento (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={metrics.revenue || ""}
                      onChange={(e) => handleMetricChange("revenue", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Instant Calculations Preview */}
              <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/20 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Meta Presumida</span>
                  <div className="text-lg font-bold text-indigo-900 dark:text-indigo-300">
                    R$ {(metrics.students > 0 ? (totalCost / metrics.students) : 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}
                  </div>
                  <span className="text-[10px] text-zinc-500">CAC Estimado</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Investimento</span>
                  <div className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
                    R$ {totalCost.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                  </div>
                  <span className="text-[10px] text-zinc-500">Custo Total</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Leads Convertidos</span>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {(metrics.leads > 0 ? ((metrics.students / metrics.leads) * 100) : 0).toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-zinc-500">Conversão de Lead</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Retorno (ROI)</span>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {(totalCost > 0 ? (((metrics.revenue - totalCost) / totalCost) * 100) : 0).toFixed(0)}%
                  </div>
                  <span className="text-[10px] text-zinc-500">ROI Estimado</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab("expenses")}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium transition-all cursor-pointer"
                >
                  Voltar para Investimentos
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  Salvar Lançamento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
