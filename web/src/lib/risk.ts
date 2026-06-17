// TerraVista — risk presentation helpers shared across components.
// Author: Gabriel Mule (RM 560586)

import type { RiskClass, RiskLabel } from "./types";

export const RISK_LABELS: Record<RiskClass, RiskLabel> = {
  0: "HEALTHY",
  1: "ATTENTION",
  2: "CRITICAL",
};

/** Tailwind text/background classes per risk level (dark-theme tuned). */
export const RISK_STYLES: Record<RiskLabel, { text: string; bg: string; dot: string; hex: string }> = {
  HEALTHY: {
    text: "text-risk-healthy",
    bg: "bg-risk-healthy/15 border-risk-healthy/40",
    dot: "bg-risk-healthy",
    hex: "#22c55e",
  },
  ATTENTION: {
    text: "text-risk-attention",
    bg: "bg-risk-attention/15 border-risk-attention/40",
    dot: "bg-risk-attention",
    hex: "#facc15",
  },
  CRITICAL: {
    text: "text-risk-critical",
    bg: "bg-risk-critical/15 border-risk-critical/40",
    dot: "bg-risk-critical",
    hex: "#ef4444",
  },
};

export function riskHex(label: RiskLabel): string {
  return RISK_STYLES[label].hex;
}
