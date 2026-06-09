/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from "@supabase/supabase-js";
import { CACRecord, AlertConfig, LTVConfig, CostBreakdown } from "../types";

// Detect Supabase keys from environment
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

const isSupabaseConfigured = SUPABASE_URL.trim() !== "" && SUPABASE_ANON_KEY.trim() !== "";

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Initial high-fidelity professional mock data (Disabled to start with a clean workspace)
const INITIAL_MOCK_RECORDS: CACRecord[] = [];

// Default configurations
const DEFAULT_ALERT_CONFIG: AlertConfig = {
  maxCAC: 700,
  maxCPL: 40,
  minConversion: 5.0,
  minROI: 100.0
};

const DEFAULT_LTV_CONFIG: LTVConfig = {
  avgRetentionMonths: 12,
  membershipMonthlyFee: 290,
  estimatedLtv: 3480
};

// --- DATABASE FUNCTIONS ---

// Load or initialize records
export function getRecords(): CACRecord[] {
  try {
    const local = localStorage.getItem("cac_records_clean");
    if (!local) {
      // First run, populate with mock data
      localStorage.setItem("cac_records_clean", JSON.stringify(INITIAL_MOCK_RECORDS));
      return INITIAL_MOCK_RECORDS;
    }
    return JSON.parse(local);
  } catch (error) {
    console.error("Erro ao ler registros locais:", error);
    return INITIAL_MOCK_RECORDS;
  }
}

// Save or Update a single record
export function saveRecord(record: CACRecord): CACRecord[] {
  const records = getRecords();
  const index = records.findIndex(r => r.id === record.id);
  
  if (index >= 0) {
    records[index] = { ...record };
  } else {
    records.push(record);
  }
  
  localStorage.setItem("cac_records_clean", JSON.stringify(records));
  return records;
}

// Delete Record
export function deleteRecord(id: string): CACRecord[] {
  const records = getRecords();
  const filtered = records.filter(r => r.id !== id);
  localStorage.setItem("cac_records_clean", JSON.stringify(filtered));
  return filtered;
}

// Duplicate Record
export function duplicateRecord(id: string): CACRecord[] {
  const records = getRecords();
  const recordToDup = records.find(r => r.id === id);
  if (!recordToDup) return records;
  
  const duplicated: CACRecord = {
    ...JSON.parse(JSON.stringify(recordToDup)),
    id: "rec-" + Math.random().toString(36).substr(2, 9),
    name: `${recordToDup.name} (Cópia)`,
    date: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString()
  };
  
  records.push(duplicated);
  localStorage.setItem("cac_records_clean", JSON.stringify(records));
  return records;
}

// Clear all databases / revert to initial state
export function resetDatabaseToDefault(): CACRecord[] {
  localStorage.setItem("cac_records_clean", JSON.stringify(INITIAL_MOCK_RECORDS));
  return INITIAL_MOCK_RECORDS;
}

// Alert Threshold Operations
export function getAlertConfig(): AlertConfig {
  try {
    const config = localStorage.getItem("cac_alert_config");
    if (!config) {
      localStorage.setItem("cac_alert_config", JSON.stringify(DEFAULT_ALERT_CONFIG));
      return DEFAULT_ALERT_CONFIG;
    }
    return JSON.parse(config);
  } catch {
    return DEFAULT_ALERT_CONFIG;
  }
}

export function saveAlertConfig(config: AlertConfig): AlertConfig {
  localStorage.setItem("cac_alert_config", JSON.stringify(config));
  return config;
}

// LTV Configuration Operations
export function getLTVConfig(): LTVConfig {
  try {
    const config = localStorage.getItem("cac_ltv_config");
    if (!config) {
      localStorage.setItem("cac_ltv_config", JSON.stringify(DEFAULT_LTV_CONFIG));
      return DEFAULT_LTV_CONFIG;
    }
    return JSON.parse(config);
  } catch {
    return DEFAULT_LTV_CONFIG;
  }
}

export function saveLTVConfig(config: LTVConfig): LTVConfig {
  localStorage.setItem("cac_ltv_config", JSON.stringify(config));
  return config;
}

// Sum all costs inside a cost breakdown
export function sumCostsOverall(cost: CostBreakdown): number {
  const traffic = cost.traffic.googleAds + cost.traffic.metaAds + cost.traffic.tikTokAds + cost.traffic.linkedInAds + cost.traffic.youtubeAds + cost.traffic.otherTraffic;
  const tools = cost.tools.crm + cost.tools.whatsAppBusiness + cost.tools.emailMarketing + cost.tools.automations + cost.tools.landingPages + cost.tools.hosting + cost.tools.otherTools;
  const team = cost.team.salaries + cost.team.commissions + cost.team.bonuses + cost.team.training;
  const content = cost.content.designer + cost.content.socialMedia + cost.content.videoEditor + cost.content.copywriter + cost.content.photography + cost.content.otherContent;
  const extras = cost.extras.events + cost.extras.gifts + cost.extras.consulting + cost.extras.partnerships + cost.extras.otherExtras;
  return traffic + tools + team + content + extras;
}

// --- BACKUP AUTOMÁTICO ENGINE (To Local Storage backups and File export) ---
export function performAutomaticBackup(): { date: string; success: boolean } {
  try {
    const dataString = JSON.stringify({
      records: getRecords(),
      alerts: getAlertConfig(),
      ltv: getLTVConfig(),
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("cac_automatic_backup", dataString);
    return { date: new Date().toISOString(), success: true };
  } catch {
    return { date: new Date().toISOString(), success: false };
  }
}

export function importDatabaseFromBackup(backupJson: string): boolean {
  try {
    const parsed = JSON.parse(backupJson);
    if (!parsed.records || !Array.isArray(parsed.records)) {
      return false;
    }
    localStorage.setItem("cac_records_clean", JSON.stringify(parsed.records));
    if (parsed.alerts) {
      localStorage.setItem("cac_alert_config", JSON.stringify(parsed.alerts));
    }
    if (parsed.ltv) {
      localStorage.setItem("cac_ltv_config", JSON.stringify(parsed.ltv));
    }
    return true;
  } catch {
    return false;
  }
}
