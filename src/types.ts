/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Categorized costs breakdown
export interface TrafficCosts {
  googleAds: number;
  metaAds: number;
  tikTokAds: number;
  linkedInAds: number;
  youtubeAds: number;
  otherTraffic: number;
}

export interface ToolsCosts {
  crm: number;
  whatsAppBusiness: number;
  emailMarketing: number;
  automations: number;
  landingPages: number;
  hosting: number;
  otherTools: number;
}

export interface TeamCosts {
  salaries: number;
  commissions: number;
  bonuses: number;
  training: number;
}

export interface ContentCosts {
  designer: number;
  socialMedia: number;
  videoEditor: number;
  copywriter: number;
  photography: number;
  otherContent: number;
}

export interface ExtraCosts {
  events: number;
  gifts: number;
  consulting: number;
  partnerships: number;
  otherExtras: number;
}

export interface CostBreakdown {
  traffic: TrafficCosts;
  tools: ToolsCosts;
  team: TeamCosts;
  content: ContentCosts;
  extras: ExtraCosts;
}

export interface FunnelMetrics {
  impressions: number;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  meetings: number;
  proposals: number;
  students: number; // Novas Matrículas/Vendas
  revenue: number;  // Receita Gerada
}

// Unified track entry representing a launch, period, or campaign
export interface CACRecord {
  id: string;
  name: string; // e.g., "Lançamento Março", "Campanha Google Junho"
  date: string; // format YYYY-MM-DD
  channel: string; // e.g., "Meta Ads", "Google Ads", "Orgânico", "Multi-canal"
  campaign: string; // e.g., "Tráfego Direto", "Webinar de Vendas"
  costs: CostBreakdown;
  metrics: FunnelMetrics;
  createdAt: string;
}

export interface AlertConfig {
  maxCAC: number; // User-defined target CAC threshold
  maxCPL: number; // User-defined target CPL threshold
  minConversion: number; // e.g. 5%
  minROI: number; // e.g. 0%
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface LTVConfig {
  avgRetentionMonths: number;
  membershipMonthlyFee: number;
  estimatedLtv: number; // Can be computed as ticket * frequency or manually forced
}
