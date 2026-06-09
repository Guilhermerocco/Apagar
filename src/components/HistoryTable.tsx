/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { CACRecord } from "../types";
import { 
  Search, 
  Trash2, 
  Copy, 
  Edit, 
  Download, 
  Upload, 
  Printer, 
  FileSpreadsheet,
  Filter, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  HelpCircle,
  FileText
} from "lucide-react";
import { sumCostsOverall } from "../services/db";

interface HistoryTableProps {
  records: CACRecord[];
  onEdit: (rec: CACRecord) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRestoreBackup: (json: string) => boolean;
  onResetToDefaults: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  records,
  onEdit,
  onDelete,
  onDuplicate,
  onRestoreBackup,
  onResetToDefaults,
}) => {
  // Local states for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "today" | "week" | "month" | "year">("all");
  const [filterChannel, setFilterChannel] = useState("");
  const [filterCampaign, setFilterCampaign] = useState("");
  
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic filter lists
  const availableChannels = Array.from(new Set(records.map((r) => r.channel))).filter(Boolean);
  const availableCampaigns = Array.from(new Set(records.map((r) => r.campaign))).filter(Boolean);

  // Filter records
  const filteredRecords = records.filter((rec) => {
    // 1. Search term match
    const nameMatch = rec.name.toLowerCase().includes(searchTerm.toLowerCase());
    const campMatch = rec.campaign.toLowerCase().includes(searchTerm.toLowerCase());
    const chanMatch = rec.channel.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (searchTerm && !nameMatch && !campMatch && !chanMatch) return false;

    // 2. Filter Channel & Campaign
    if (filterChannel && rec.channel !== filterChannel) return false;
    if (filterCampaign && rec.campaign !== filterCampaign) return false;

    // 3. Filter Period (Date matching)
    if (filterPeriod !== "all") {
      const recDate = new Date(rec.date);
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const recTime = recDate.getTime();
      const todayTime = today.getTime();

      if (filterPeriod === "today") {
        // Simple day compare
        const isSameDay = rec.date === today.toISOString().split("T")[0];
        if (!isSameDay) return false;
      } else if (filterPeriod === "week") {
        // Last 7 days
        const oneWeekAgo = todayTime - 7 * 24 * 60 * 60 * 1000;
        if (recTime < oneWeekAgo) return false;
      } else if (filterPeriod === "month") {
        // Same month
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        if (recDate.getFullYear() !== currentYear || recDate.getMonth() !== currentMonth) return false;
      } else if (filterPeriod === "year") {
        // Same year
        if (recDate.getFullYear() !== today.getFullYear()) return false;
      }
    }

    return true;
  });

  // Calculate row details
  const formatBRL = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const getRecordCalculatedStats = (rec: CACRecord) => {
    const totalCost = sumCostsOverall(rec.costs);
    const cac = rec.metrics.students > 0 ? totalCost / rec.metrics.students : 0;
    const cpl = rec.metrics.leads > 0 ? totalCost / rec.metrics.leads : 0;
    const conversion = rec.metrics.leads > 0 ? (rec.metrics.students / rec.metrics.leads) * 100 : 0;
    const roi = totalCost > 0 ? ((rec.metrics.revenue - totalCost) / totalCost) * 100 : 0;
    return { totalCost, cac, cpl, conversion, roi };
  };

  // --- EXPORTS ENGINE ---

  // Custom Semicolon CSV for perfect Microsoft Excel Portuguese Layout
  const exportToCSV = () => {
    if (filteredRecords.length === 0) return alert("Nenhum registro para exportar.");
    
    let content = "Nome;Data;Canal;Campanha;Total Investido;Novos Alunos;Leads;CAC;CPL;Conversao %;Receita;ROI %;Lucro\r\n";
    
    filteredRecords.forEach((rec) => {
      const stats = getRecordCalculatedStats(rec);
      const row = [
        rec.name.replace(/;/g, " "),
        rec.date,
        rec.channel.replace(/;/g, " "),
        rec.campaign.replace(/;/g, " "),
        stats.totalCost.toFixed(2),
        rec.metrics.students,
        rec.metrics.leads,
        stats.cac.toFixed(2),
        stats.cpl.toFixed(2),
        stats.conversion.toFixed(2),
        rec.metrics.revenue.toFixed(2),
        stats.roi.toFixed(0),
        (rec.metrics.revenue - stats.totalCost).toFixed(2)
      ];
      content += row.join(";") + "\r\n";
    });

    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Calculadora_CAC_Relatorio_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel Export (Semicolon delimited file with explicit headers is easily recognized by Excel)
  const exportToExcel = () => {
    exportToCSV(); // For web clients, an optimized TSV/Semicolon CSV is the best compatible Excel launcher
  };

  // PDF Printing (Creates a beautiful clean window designed strictly for printing with zero SaaS layout menus)
  const exportToPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return alert("Por favor, permita pop-ups para imprimir seu relatório.");

    let totalCostSum = 0;
    let studentsSum = 0;
    let leadsSum = 0;
    let revenueSum = 0;

    const rowsHtml = filteredRecords.map((rec) => {
      const stats = getRecordCalculatedStats(rec);
      totalCostSum += stats.totalCost;
      studentsSum += rec.metrics.students;
      leadsSum += rec.metrics.leads;
      revenueSum += rec.metrics.revenue;

      return `
        <tr>
          <td>${rec.name}</td>
          <td>${new Date(rec.date).toLocaleDateString("pt-BR")}</td>
          <td>${rec.channel}</td>
          <td>R$ ${stats.totalCost.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
          <td>${rec.metrics.students}</td>
          <td>R$ ${stats.cac.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
          <td>${rec.metrics.leads}</td>
          <td>R$ ${rec.metrics.revenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
          <td>${stats.roi.toFixed(0)}%</td>
        </tr>
      `;
    }).join("");

    const avgCac = studentsSum > 0 ? totalCostSum / studentsSum : 0;
    const avgRoi = totalCostSum > 0 ? ((revenueSum - totalCostSum) / totalCostSum) * 100 : 0;

    printWindow.document.write(`
      <html>
        <head>
          <title>Relatório Consolidado de CAC</title>
          <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 22px; color: #111; margin-bottom: 5px; }
            p { font-size: 11px; color: #666; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .totals-row { font-weight: bold; background-color: #fbfbfb; }
            .footer { margin-top: 40px; font-size: 9px; text-align: center; color: #aaa; border-top: 1px solid #ddd; padding-top: 10px; }
            .header-info { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .stats-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 15px; margin-top: 25px; }
            .stat-box { border: 1px solid #eee; padding: 10px; border-radius: 5px; text-align: center; }
            .stat-box h6 { margin: 0; font-size: 10px; color: #777; text-transform: uppercase; }
            .stat-box p { margin: 5px 0 0; font-size: 15px; font-weight: bold; color: #111; }
          </style>
        </head>
        <body>
          <div class="header-info">
            <div>
              <h1>Relatório de Desempenho e Custos de Aquisição (CAC)</h1>
              <p>Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
            </div>
            <div style="text-align: right; font-size: 11px;">
              <strong>Filtros aplicados:</strong><br/>
              Período: ${filterPeriod === "all" ? "Histórico Completo" : filterPeriod}<br/>
              Canal: ${filterChannel || "Todos"}<br/>
              Campanhas: ${filteredRecords.length} encontradas
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <h6>CAC Consolidado</h6>
              <p>R$ ${avgCac.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
            </div>
            <div class="stat-box">
              <h6>Investimento Total</h6>
              <p>R$ ${totalCostSum.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</p>
            </div>
            <div class="stat-box">
              <h6>Novas Matrículas</h6>
              <p>${studentsSum} Alunos</p>
            </div>
            <div class="stat-box">
              <h6>Retorno Financeiro (ROI)</h6>
              <p>${avgRoi.toFixed(0)}%</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Lançamento</th>
                <th>Data</th>
                <th>Canal Principal</th>
                <th>Investido</th>
                <th>Alunos</th>
                <th>CAC</th>
                <th>Leads</th>
                <th>Receita</th>
                <th>ROI</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="totals-row">
                <td colspan="3">TOTAIS / MÉDIAS GERAIS</td>
                <td>R$ ${totalCostSum.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                <td>${studentsSum}</td>
                <td>R$ ${avgCac.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                <td>${leadsSum}</td>
                <td>R$ ${revenueSum.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</td>
                <td>${avgRoi.toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            CAC Tracker - Sistema de Cálculo de Custo de Aquisição de Alunos para Escolas e Infoprodutos.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Backup Manual Files Upload Handler
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleBackupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = onRestoreBackup(text);
      if (success) {
        alert("Backup restaurado e sincronizado com sucesso!");
        window.location.reload();
      } else {
        alert("Falha de validação: O arquivo de backup selecionado é inválido.");
      }
    };
    reader.readAsText(file);
  };

  // Download entire database backup file
  const downloadDatabaseBackupFile = () => {
    const data = {
      records,
      alerts: localStorage.getItem("cac_alert_config") ? JSON.parse(localStorage.getItem("cac_alert_config")!) : null,
      ltv: localStorage.getItem("cac_ltv_config") ? JSON.parse(localStorage.getItem("cac_ltv_config")!) : null,
      version: "1.0",
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CAC_Tracker_Backup_Backup_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
      
      {/* Search and Filters Header */}
      <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              Histórico de Lançamentos ({filteredRecords.length})
            </h4>
            <p className="text-xs text-zinc-400">
              Busque, filtre por canal ou campanha, realize cópias e exportações profissionais.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-nowrap gap-2">
            <button
              onClick={exportToCSV}
              title="Exportar para CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Exportar CSV</span>
            </button>
            <button
              onClick={exportToPDF}
              title="Formatar para PDF / Imprimir"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-500" />
              <span>Imprimir PDF</span>
            </button>
            
            {/* Backup buttons */}
            <button
              onClick={downloadDatabaseBackupFile}
              title="Exportar Backup de Segurança"
              className="px-2.5 py-1.5 text-xs border border-zinc-250 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-650 dark:text-zinc-350 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Backup</span>
            </button>
            <button
              onClick={triggerFileInput}
              title="Importar Arquivo de Backup"
              className="px-2.5 py-1.5 text-xs border border-zinc-250 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-650 dark:text-zinc-350 flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-amber-500" />
              <span>Importar</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleBackupUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={onResetToDefaults}
              title="Reiniciar banco de dados"
              className="p-1.5 text-xs border border-zinc-250 dark:border-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-850 text-red-500 flex items-center gap-1 cursor-pointer font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Input and Basic Filters row */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Pesquisar por nome ou campanha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Period selector */}
          <div className="md:col-span-3">
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Qualquer Período (Total)</option>
              <option value="today">Hoje</option>
              <option value="week">Esta Semana (Últimos 7 dias)</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
            </select>
          </div>

          {/* Filter options buttons */}
          <div className="md:col-span-5 flex justify-end gap-2">
            <button
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isFilterExpanded || filterChannel || filterCampaign
                  ? "border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900"
                  : "border-zinc-300 dark:border-zinc-700 hover:bg-zinc-150 dark:hover:bg-zinc-800 text-zinc-750 dark:text-zinc-300"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filtro de Canais</span>
              {isFilterExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>
            {(filterChannel || filterCampaign || searchTerm || filterPeriod !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterPeriod("all");
                  setFilterChannel("");
                  setFilterCampaign("");
                }}
                className="px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg border border-transparent transition-all cursor-pointer"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Expanded filter panel */}
        {isFilterExpanded && (
          <div className="mt-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl grid grid-cols-2 gap-4 animate-fadeIn">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Filtrar por Canal</label>
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
              >
                <option value="">Qualquer Canal de Aquisição</option>
                {availableChannels.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Filtrar por Objetivo/Campanha</label>
              <select
                value={filterCampaign}
                onChange={(e) => setFilterCampaign(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
              >
                <option value="">Qualquer Campanha</option>
                {availableCampaigns.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Table responsive scroll container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-150 dark:border-zinc-800 text-[10px] uppercase font-bold text-zinc-400 tracking-wider bg-zinc-50/50 dark:bg-zinc-900/20">
              <th className="p-4 pl-6">Nome do Lançamento</th>
              <th className="p-4">Data</th>
              <th className="p-4 text-center">Canal principal</th>
              <th className="p-4 text-right">Investimento</th>
              <th className="p-4 text-center">Matrículas</th>
              <th className="p-4 text-right">CAC Calculado</th>
              <th className="p-4 text-right">Leads (CPL)</th>
              <th className="p-4 text-center">Conversão</th>
              <th className="p-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">ROI Geral</th>
              <th className="p-4 pr-6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-12 text-center text-sm text-zinc-400">
                  <p className="font-semibold">Nenhum lançamento corresponde aos filtros ativos.</p>
                  <p className="text-xs text-zinc-500/70 mt-1">Limpe os filtros ou registre um novo lançamento no topo da página!</p>
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                const stats = getRecordCalculatedStats(rec);
                return (
                  <tr 
                    key={rec.id} 
                    className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/30 dark:hover:bg-zinc-850/10 text-xs text-zinc-550 transition-colors"
                  >
                    <td className="p-4 pl-6 font-bold text-zinc-900 dark:text-white max-w-[180px] truncate">
                      <div className="font-semibold">{rec.name}</div>
                      <div className="text-[10px] font-normal text-zinc-400 block truncate">{rec.campaign}</div>
                    </td>
                    <td className="p-4 text-zinc-500 whitespace-nowrap">
                      {new Date(rec.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-medium text-[10px]">
                        {rec.channel}
                      </span>
                    </td>
                    <td className="p-4 text-right font-semibold text-zinc-850 dark:text-zinc-200">
                      {formatBRL(stats.totalCost)}
                    </td>
                    <td className="p-4 text-center font-semibold text-zinc-800 dark:text-zinc-350">
                      {rec.metrics.students}
                    </td>
                    <td className="p-4 text-right font-bold text-zinc-900 dark:text-white">
                      {formatBRL(stats.cac)}
                    </td>
                    <td className="p-4 text-right text-zinc-500">
                      <div className="font-semibold">{rec.metrics.leads} leads</div>
                      <div className="text-[9px] text-zinc-400">cpl: {formatBRL(stats.cpl)}</div>
                    </td>
                    <td className="p-4 text-center font-medium">
                      <div className="text-zinc-800 dark:text-zinc-350">{stats.conversion.toFixed(1)}%</div>
                      <div className="text-[9px] text-zinc-400">L&rarr;A</div>
                    </td>
                    <td className={`p-4 text-right font-bold ${stats.roi >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {stats.roi.toFixed(0)}%
                    </td>
                    <td className="p-4 pr-6 text-center whitespace-nowrap">
                      <div className="flex justify-center items-center gap-1.5">
                        <button
                          onClick={() => onEdit(rec)}
                          title="Editar lançamento"
                          className="p-1 text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicate(rec.id)}
                          title="Duplicar entrada"
                          className="p-1 text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Tem certeza de que deseja excluir "${rec.name}"?`)) {
                              onDelete(rec.id);
                            }
                          }}
                          title="Excluir entrada"
                          className="p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
