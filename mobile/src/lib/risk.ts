// TerraVista — risk presentation helpers (mobile, Paper-tuned colors).
// Author: Gabriel Mule (RM 560586)

import type { RiskClass, RiskLabel } from "./types";

export const RISK_LABELS: Record<RiskClass, RiskLabel> = {
  0: "HEALTHY",
  1: "ATTENTION",
  2: "CRITICAL",
};

// Hex colors per risk level, matching the web theme.
export const RISK_COLORS: Record<RiskLabel, string> = {
  HEALTHY: "#22c55e",
  ATTENTION: "#facc15",
  CRITICAL: "#ef4444",
};

export function riskColor(label: RiskLabel): string {
  return RISK_COLORS[label];
}
