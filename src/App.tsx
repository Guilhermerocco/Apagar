/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { CACRecord, AlertConfig, LTVConfig, UserProfile } from "./types";
import { 
  getRecords, 
  saveRecord, 
  deleteRecord, 
  duplicateRecord, 
  getAlertConfig, 
  saveAlertConfig, 
  getLTVConfig, 
  saveLTVConfig,
  performAutomaticBackup,
  importDatabaseFromBackup,
  resetDatabaseToDefault,
  sumCostsOverall
} from "./services/db";
import { getCurrentUser, logoutSimulated } from "./services/auth";
import { LoginScreen } from "./components/LoginScreen";
import { DashboardGrid } from "./components/DashboardGrid";
import { SalesFunnelChart } from "./components/SalesFunnelChart";
import { HistoryTable } from "./components/HistoryTable";
import { AnalyticsCharts } from "./components/AnalyticsCharts";
import { SettingsPanel } from "./components/SettingsPanel";
import { RecordFormModal } from "./components/RecordFormModal";
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Plus, 
  Moon, 
  Sun, 
  LogOut, 
  Database,
  Calculator,
  PartyPopper,
  Sparkles,
  RefreshCcw,
  User,
  Activity,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from "lucide-react";

export default function App() {
  // 1. Auth management
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // 2. Data states
  const [records, setRecords] = useState<CACRecord[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({ maxCAC: 700, maxCPL: 40, minConversion: 5.0, minROI: 100.0 });
  const [ltvConfig, setLtvConfig] = useState<LTVConfig>({ avgRetentionMonths: 12, membershipMonthlyFee: 290, estimatedLtv: 3480 });

  // 3. UI states
  const [activeTab, setActiveTab] = useState<"dashboard" | "database" | "settings">("dashboard");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<CACRecord | null>(null);
  
  // 4. Auto-backup indicators
  const [lastBackupTime, setLastBackupTime] = useState<string>("");
  const [showBackupAlert, setShowBackupAlert] = useState(false);

  // Initial load
  useEffect(() => {
    // Auth init
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    // Database core init
    const storedRecords = getRecords();
    setRecords(storedRecords);

    setAlertConfig(getAlertConfig());
    setLtvConfig(getLTVConfig());

    // Theme initialization
    const localTheme = localStorage.getItem("cac_theme") as "light" | "dark" | null;
    if (localTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      // Default to light theme for clean contrast
      setTheme("light");
      localStorage.setItem("cac_theme", "light");
      document.documentElement.classList.remove("dark");
    }

    // Run first silent backup
    const backupResult = performAutomaticBackup();
    if (backupResult.success) {
      setLastBackupTime(new Date(backupResult.date).toLocaleTimeString("pt-BR"));
    }
  }, []);

  // Sync calculations & perform backup when records or configs change
  const triggerDatabaseChange = (newRecords: CACRecord[]) => {
    setRecords(newRecords);
    
    // Perform automatic background backup
    const backupResult = performAutomaticBackup();
    if (backupResult.success) {
      setLastBackupTime(new Date(backupResult.date).toLocaleTimeString("pt-BR"));
      setShowBackupAlert(true);
      setTimeout(() => setShowBackupAlert(false), 2500);
    }
  };

  // --- CRUD DISPATCHERS ---

  const handleSaveRecord = (rec: CACRecord) => {
    const updated = saveRecord(rec);
    triggerDatabaseChange(updated);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = deleteRecord(id);
    triggerDatabaseChange(updated);
  };

  const handleDuplicateRecord = (id: string) => {
    const updated = duplicateRecord(id);
    triggerDatabaseChange(updated);
  };

  const handleRestoreBackup = (jsonString: string): boolean => {
    const isSuccessful = importDatabaseFromBackup(jsonString);
    if (isSuccessful) {
      setRecords(getRecords());
      setAlertConfig(getAlertConfig());
      setLtvConfig(getLTVConfig());
      // Backed up successfully
      const bRes = performAutomaticBackup();
      if (bRes.success) {
        setLastBackupTime(new Date(bRes.date).toLocaleTimeString("pt-BR"));
      }
    }
    return isSuccessful;
  };

  const handleResetToDefault = () => {
    if (confirm("Deseja realmente voltar aos dados demonstrativos iniciais? Todos os dados customizados atuais serão substituídos.")) {
      const reseted = resetDatabaseToDefault();
      triggerDatabaseChange(reseted);
    }
  };

  // --- ALERTS & CONFIG DISPATCHERS ---

  const handleSaveAlerts = (config: AlertConfig) => {
    const saved = saveAlertConfig(config);
    setAlertConfig(saved);
    // Backup triggers
    performAutomaticBackup();
  };

  const handleSaveLtv = (config: LTVConfig) => {
    const saved = saveLTVConfig(config);
    setLtvConfig(saved);
    // Backup triggers
    performAutomaticBackup();
  };

  // Theme switcher helper
  const toggleTheme = () => {
    const targetTheme = theme === "light" ? "dark" : "light";
    setTheme(targetTheme);
    localStorage.setItem("cac_theme", targetTheme);
    if (targetTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Logout handler
  const handleLogout = () => {
    logoutSimulated();
    setCurrentUser(null);
  };

  // View controller helper
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(usr) => setCurrentUser(usr)} />;
  }

  // Calculate weighted CAC for overall header banner
  let totalInvestOverall = 0;
  let totalStudentsOverall = 0;
  records.forEach((rec) => {
    totalInvestOverall += sumCostsOverall(rec.costs);
    totalStudentsOverall += rec.metrics.students;
  });
  const weightedOverallCAC = totalStudentsOverall > 0 ? totalInvestOverall / totalStudentsOverall : 0;

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-[#0c0d0e] transition-colors flex flex-col font-sans">
      
      {/* SaaS Premium Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-150 dark:border-zinc-800 no-print">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          
          {/* Logo & Platform identity */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-650 text-white rounded-xl shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5 leading-none">
                CAC Tracker
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-bold">PRO</span>
              </span>
              <span className="text-[10px] text-zinc-400 block mt-0.5">Gestão de Aquisição & Conversões</span>
            </div>
          </div>

          {/* Quick Metrics ticker */}
          <div className="hidden lg:flex items-center gap-6 text-xs border-l border-zinc-200 dark:border-zinc-800 pl-6">
            <div>
              <span className="text-zinc-450 uppercase text-[9px] font-bold block">CAC Médio Geral</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                R$ {weightedOverallCAC.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div>
              <span className="text-zinc-450 uppercase text-[9px] font-bold block">Total Registrado</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">
                R$ {totalInvestOverall.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Action Hub and Profile options */}
          <div className="flex items-center gap-3">
            
            {/* Automatic Backup notifier */}
            <div className="hidden md:flex items-center gap-1 text-[10px] bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-full text-zinc-500 font-semibold">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cópia de segurança: {lastBackupTime || "Sincronizando"}</span>
            </div>

            {/* Float notification toast */}
            {showBackupAlert && (
              <div className="absolute top-20 right-8 z-50 bg-zinc-900 border border-zinc-800 text-white p-3 rounded-xl shadow-lg flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Backup automático salvo!</span>
              </div>
            )}

            {/* Toggle Theme button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-xl transition-all cursor-pointer"
              title="Trocar tema visual"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Add Launch Button */}
            <button
              onClick={() => {
                setRecordToEdit(null);
                setIsRecordModalOpen(true);
              }}
              className="p-2 px-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Lançar Dados</span>
            </button>

            {/* Profile Dropdown Simulation */}
            <div className="flex items-center gap-2 pl-3 border-l border-zinc-150 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-bold text-xs text-white uppercase shadow-sm">
                {currentUser.displayName ? currentUser.displayName.substring(0, 2) : "US"}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 leading-tight truncate max-w-[100px]">
                  {currentUser.displayName || "Manager"}
                </div>
                <div className="text-[10px] text-zinc-450 truncate max-w-[120px]">{currentUser.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
                title="Sair da plataforma"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main SaaS Workspace */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-6">
        
        {/* Navigation Tabs Header */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-6 no-print">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-3 px-4 font-semibold text-xs md:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "dashboard"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard Principal
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`py-3 px-4 font-semibold text-xs md:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "database"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <History className="w-4 h-4" />
            Registros & Exportação
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-3 px-4 font-semibold text-xs md:text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "settings"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-300"
            }`}
          >
            <Settings className="w-4 h-4" />
            Metas de Performance
          </button>
        </div>

        {/* Dynamic Views Switcher */}
        <div className="space-y-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Core visual overview cards widgets */}
              <DashboardGrid 
                records={records} 
                alertConfig={alertConfig} 
                ltvConfig={ltvConfig} 
              />
              
              {/* Graphic charts section */}
              <AnalyticsCharts records={records} />

              {/* Conversion sales funnel */}
              <SalesFunnelChart records={records} />

            </div>
          )}

          {activeTab === "database" && (
            <div className="animate-fadeIn">
              <HistoryTable
                records={records}
                onEdit={(rec) => {
                  setRecordToEdit(rec);
                  setIsRecordModalOpen(true);
                }}
                onDelete={handleDeleteRecord}
                onDuplicate={handleDuplicateRecord}
                onRestoreBackup={handleRestoreBackup}
                onResetToDefaults={handleResetToDefault}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-fadeIn">
              <SettingsPanel
                alertConfig={alertConfig}
                ltvConfig={ltvConfig}
                onSaveAlerts={handleSaveAlerts}
                onSaveLtv={handleSaveLtv}
              />
            </div>
          )}
        </div>

      </main>

      {/* Exquisite Multi-step Record Creator Modal */}
      <RecordFormModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setRecordToEdit(null);
        }}
        onSave={handleSaveRecord}
        recordToEdit={recordToEdit}
      />

      {/* Footer Branding block */}
      <footer className="py-8 bg-zinc-50 dark:bg-zinc-900/20 border-t border-zinc-150 dark:border-zinc-800 text-center mt-12 text-xs text-zinc-400 no-print">
        <p className="font-semibold text-zinc-500">CAC Tracker Escolar & Infoprodutos &bull; v1.0 PRO</p>
        <p className="text-[10px] text-zinc-400/80 mt-1 max-w-sm mx-auto">
          Painel analítico blindado. Métricas consolidadas conforme as diretrizes do Custo de Aquisição de Alunos (Investimento total ÷ novos alunos).
        </p>
      </footer>

    </div>
  );
}
