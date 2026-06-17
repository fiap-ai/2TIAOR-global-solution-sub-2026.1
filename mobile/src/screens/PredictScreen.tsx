// TerraVista — territorial risk prediction. Mirrors web/src/pages/Predict.tsx:
// 7 environmental inputs, one-click presets and the model verdict with bars.
// Author: Gabriel Mule (RM 560586)

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { View } from "react-native";
import { Button, Card, Chip, Snackbar, Text, TextInput, useTheme } from "react-native-paper";
import { InfoNote } from "../components/InfoNote";
import { RiskBadge } from "../components/RiskBadge";
import { Screen } from "../components/Screen";
import { predict } from "../lib/api";
import { GLOSSARY } from "../lib/glossary";
import { riskColor } from "../lib/risk";
import type { PredictRequest, RiskLabel } from "../lib/types";

interface Field {
  key: keyof PredictRequest;
  label: string;
  unit: string;
}

const FIELDS: Field[] = [
  { key: "air_temperature", label: "Air temperature", unit: "°C" },
  { key: "air_humidity", label: "Air humidity", unit: "%" },
  { key: "soil_moisture", label: "Soil moisture", unit: "%" },
  { key: "solar_radiation", label: "Solar radiation", unit: "W/m²" },
  { key: "ndvi", label: "NDVI", unit: "" },
  { key: "days_since_rain", label: "Days since rain", unit: "days" },
  { key: "wind_speed", label: "Wind speed", unit: "km/h" },
];

const PRESETS: { label: RiskLabel; values: PredictRequest }[] = [
  {
    label: "HEALTHY",
    values: { air_temperature: 24, air_humidity: 65, soil_moisture: 55, solar_radiation: 480, ndvi: 0.78, days_since_rain: 2, wind_speed: 8 },
  },
  {
    label: "ATTENTION",
    values: { air_temperature: 28, air_humidity: 43, soil_moisture: 32, solar_radiation: 560, ndvi: 0.5, days_since_rain: 7, wind_speed: 11 },
  },
  {
    label: "CRITICAL",
    values: { air_temperature: 39, air_humidity: 18, soil_moisture: 8, solar_radiation: 950, ndvi: 0.18, days_since_rain: 30, wind_speed: 35 },
  },
];

// Default to the dry/hot CRITICAL-leaning preset, easy to demo.
const DEFAULTS: PredictRequest = PRESETS[2].values;

export function PredictScreen() {
  const theme = useTheme();
  const [form, setForm] = useState<PredictRequest>(DEFAULTS);
  const [error, setError] = useState(false);

  const mutation = useMutation({
    mutationFn: () => predict(form),
    onError: () => setError(true),
  });

  const result = mutation.data;

  function applyPreset(values: PredictRequest) {
    setForm(values);
    mutation.mutate();
  }

  return (
    <Screen
      title="Territorial Risk Prediction"
      subtitle="Score a land parcel from its environmental features."
    >
      <Card mode="contained">
        <Card.Title title="Parcel features" subtitle="Adjust the 7 inputs and run the model." />
        <Card.Content style={{ gap: 12 }}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            Quick presets (fills the form and scores it):
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {PRESETS.map((p) => (
              <Chip
                key={p.label}
                onPress={() => applyPreset(p.values)}
                disabled={mutation.isPending}
                textStyle={{ color: riskColor(p.label), fontWeight: "700" }}
                style={{ backgroundColor: `${riskColor(p.label)}22` }}
              >
                {p.label}
              </Chip>
            ))}
          </View>

          {FIELDS.map((f) => (
            <TextInput
              key={f.key}
              label={f.unit ? `${f.label} (${f.unit})` : f.label}
              mode="outlined"
              keyboardType="numeric"
              dense
              value={String(form[f.key])}
              onChangeText={(t) =>
                setForm((prev) => ({ ...prev, [f.key]: Number(t) || 0 }))
              }
            />
          ))}

          <Button
            mode="contained"
            onPress={() => mutation.mutate()}
            loading={mutation.isPending}
            disabled={mutation.isPending}
          >
            Run prediction
          </Button>
        </Card.Content>
      </Card>

      <Card mode="contained">
        <Card.Title title="Verdict" subtitle="Model output and class probabilities." />
        <Card.Content style={{ gap: 12 }}>
          {!result ? (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Run a prediction to see the result.
            </Text>
          ) : (
            <>
              <InfoNote title="Reading the verdict" detail={GLOSSARY.random_forest.detail}>
                The bars are the model's confidence in each class; the highest one is
                the predicted risk.
              </InfoNote>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>Risk class</Text>
                <RiskBadge label={result.risk_label} />
              </View>
              {Object.entries(result.probabilities).map(([label, prob]) => {
                const color = riskColor(label as RiskLabel);
                return (
                  <View key={label} style={{ gap: 4 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text variant="bodySmall" style={{ color }}>
                        {label}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {(prob * 100).toFixed(1)}%
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.colors.surfaceVariant,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{ width: `${prob * 100}%`, height: "100%", backgroundColor: color }}
                      />
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </Card.Content>
      </Card>

      <Snackbar visible={error} onDismiss={() => setError(false)} duration={3000}>
        Prediction failed. Is the backend running?
      </Snackbar>
    </Screen>
  );
}
