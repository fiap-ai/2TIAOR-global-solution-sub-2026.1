// TerraVista — risk level badge (Paper Chip tinted by risk color).
// Author: Gabriel Mule (RM 560586)

import { Chip } from "react-native-paper";
import { riskColor } from "../lib/risk";
import type { RiskLabel } from "../lib/types";

export function RiskBadge({ label }: { label: RiskLabel }) {
  const color = riskColor(label);
  return (
    <Chip
      compact
      textStyle={{ color, fontWeight: "700", fontSize: 12 }}
      style={{ backgroundColor: `${color}22`, borderColor: color }}
    >
      {label}
    </Chip>
  );
}
