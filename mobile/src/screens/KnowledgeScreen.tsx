// TerraVista — knowledge base. Mirrors web/src/pages/Knowledge.tsx:
// one card per risk level with the recommended mitigation actions.
// Author: Gabriel Mule (RM 560586)

import { useQuery } from "@tanstack/react-query";
import { View } from "react-native";
import { Card, List, Text, useTheme } from "react-native-paper";
import { InfoNote } from "../components/InfoNote";
import { RiskBadge } from "../components/RiskBadge";
import { Screen } from "../components/Screen";
import { getKnowledge } from "../lib/api";

export function KnowledgeScreen() {
  const theme = useTheme();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["knowledge"],
    queryFn: getKnowledge,
  });

  return (
    <Screen
      title="Knowledge Base"
      subtitle="Recommended mitigation and management actions per risk level."
    >
      <InfoNote
        title="How risk levels map to action"
        detail="The same three classes are produced by both the tabular RandomForest model and the computer-vision analyzer. Each level corresponds to a decision band on the environmental indicators (NDVI, soil moisture, dryness/smoke) — so a verdict on the Predict or Vision screens points directly to the recommended response below."
      >
        Each card maps a risk level to the field actions that mitigate it.
      </InfoNote>

      {isLoading && (
        <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading...</Text>
      )}
      {isError && (
        <Text style={{ color: "#ef4444" }}>Failed to load. Is the backend running?</Text>
      )}

      {data?.items.map((item) => (
        <Card key={item.risk_label} mode="contained">
          <Card.Content style={{ gap: 8 }}>
            <View style={{ flexDirection: "row" }}>
              <RiskBadge label={item.risk_label} />
            </View>
            <Text variant="titleMedium" style={{ fontWeight: "700" }}>
              {item.title}
            </Text>
            {item.actions.map((action, i) => (
              <List.Item
                key={i}
                title={action}
                titleNumberOfLines={4}
                left={(props) => <List.Icon {...props} icon="check-circle" color={theme.colors.primary} />}
                style={{ paddingVertical: 0 }}
              />
            ))}
          </Card.Content>
        </Card>
      ))}
    </Screen>
  );
}
