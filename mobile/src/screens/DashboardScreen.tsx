// TerraVista — operations dashboard. Mirrors web/src/pages/Dashboard.tsx:
// KPIs, an environmental timeline chart and a recent-readings table.
// Author: Gabriel Mule (RM 560586)

import { useQuery } from "@tanstack/react-query";
import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Card, DataTable, Text, useTheme } from "react-native-paper";
import { InfoNote } from "../components/InfoNote";
import { RiskBadge } from "../components/RiskBadge";
import { Screen } from "../components/Screen";
import { getHealth, getLatestReading, getSensorReadings } from "../lib/api";
import type { SensorRecord } from "../lib/types";

function shortTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  const theme = useTheme();
  return (
    <Card style={{ flex: 1, minWidth: 150 }} mode="contained">
      <Card.Content style={{ gap: 2 }}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {label.toUpperCase()}
        </Text>
        <Text variant="titleLarge" style={{ fontWeight: "700" }}>
          {value}
        </Text>
        {hint && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {hint}
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}

export function DashboardScreen() {
  const theme = useTheme();
  const readingsQuery = useQuery({
    queryKey: ["sensor-readings"],
    queryFn: getSensorReadings,
    refetchInterval: 15_000,
  });
  const latestQuery = useQuery({
    queryKey: ["sensor-latest"],
    queryFn: getLatestReading,
    refetchInterval: 15_000,
  });
  const healthQuery = useQuery({ queryKey: ["health"], queryFn: getHealth });

  const records: SensorRecord[] = readingsQuery.data?.records ?? [];
  const latest = latestQuery.data;

  // Chronological series for the timeline chart (temperature + soil moisture).
  const series = [...records].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const labels = series.map((r) => shortTime(r.timestamp));
  const temps = series.map((r) => r.reading.air_temperature);
  const soils = series.map((r) => r.reading.soil_moisture);

  const criticalCount = records.filter((r) => r.risk_label === "CRITICAL").length;
  const chartWidth = Dimensions.get("window").width - 32 - 32; // screen - padding - card

  return (
    <Screen
      title="Operations Dashboard"
      subtitle="Live territorial-risk telemetry from field sensors."
    >
      {latest && (
        <View style={{ flexDirection: "row" }}>
          <RiskBadge label={latest.risk_label} />
        </View>
      )}

      <InfoNote
        title="What you're looking at"
        detail="Each reading is scored by the same RandomForest model in real time and stored in the database. The timeline captures a continuous 3-day drying cycle — soil moisture and NDVI fall while temperature climbs — so the risk distribution shifts from HEALTHY toward CRITICAL as the parcel dries out, exactly the early-warning pattern the system is built to surface."
      >
        Live telemetry from field IoT sensors, each classified into a territorial risk level.
      </InfoNote>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        <Kpi
          label="Latest temp"
          value={latest ? `${latest.reading.air_temperature.toFixed(1)} °C` : "—"}
          hint={latest ? `Updated ${shortTime(latest.timestamp)}` : "No data yet"}
        />
        <Kpi
          label="Soil moisture"
          value={latest ? `${latest.reading.soil_moisture.toFixed(0)} %` : "—"}
          hint="Healthy > 45% · stress < 20%"
        />
        <Kpi
          label="NDVI"
          value={latest ? latest.reading.ndvi.toFixed(2) : "—"}
          hint="Vigor 0→1 · stress < 0.3"
        />
        <Kpi
          label="Critical readings"
          value={`${criticalCount}/${records.length}`}
          hint={healthQuery.data ? `Model ${healthQuery.data.model_loaded ? "loaded" : "offline"}` : undefined}
        />
      </View>

      {readingsQuery.isError && (
        <Text style={{ color: "#ef4444" }}>
          Failed to load telemetry. Is the backend running?
        </Text>
      )}

      {records.length === 0 ? (
        <Card mode="contained">
          <Card.Content>
            <Text style={{ color: theme.colors.onSurfaceVariant, textAlign: "center" }}>
              No sensor readings yet. Post readings to /api/sensors/readings and they
              will appear here.
            </Text>
          </Card.Content>
        </Card>
      ) : (
        <>
          <Card mode="contained">
            <Card.Title
              title="Environmental timeline"
              subtitle="Temperature and soil moisture over time."
            />
            <Card.Content>
              <LineChart
                data={{
                  labels,
                  datasets: [
                    { data: temps, color: () => "#f97316", strokeWidth: 2 },
                    { data: soils, color: () => "#38bdf8", strokeWidth: 2 },
                  ],
                  legend: ["Temp (°C)", "Soil (%)"],
                }}
                width={chartWidth}
                height={220}
                withDots={false}
                chartConfig={{
                  backgroundGradientFrom: theme.colors.surface,
                  backgroundGradientTo: theme.colors.surface,
                  decimalPlaces: 0,
                  color: (o = 1) => `rgba(148, 163, 184, ${o})`,
                  labelColor: (o = 1) => `rgba(148, 163, 184, ${o})`,
                  propsForBackgroundLines: { stroke: theme.colors.outline },
                }}
                bezier
                style={{ borderRadius: 8 }}
              />
            </Card.Content>
          </Card>

          <Card mode="contained">
            <Card.Title
              title="Recent readings"
              subtitle="Latest telemetry records and their verdicts."
            />
            <Card.Content>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Time</DataTable.Title>
                  <DataTable.Title numeric>°C</DataTable.Title>
                  <DataTable.Title numeric>Soil</DataTable.Title>
                  <DataTable.Title numeric>NDVI</DataTable.Title>
                  <DataTable.Title>Risk</DataTable.Title>
                </DataTable.Header>
                {[...records]
                  .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                  .slice(0, 10)
                  .map((r, i) => (
                    <DataTable.Row key={`${r.timestamp}-${i}`}>
                      <DataTable.Cell>{shortTime(r.timestamp)}</DataTable.Cell>
                      <DataTable.Cell numeric>
                        {r.reading.air_temperature.toFixed(1)}
                      </DataTable.Cell>
                      <DataTable.Cell numeric>
                        {r.reading.soil_moisture.toFixed(0)}
                      </DataTable.Cell>
                      <DataTable.Cell numeric>{r.reading.ndvi.toFixed(2)}</DataTable.Cell>
                      <DataTable.Cell>
                        <RiskBadge label={r.risk_label} />
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
              </DataTable>
            </Card.Content>
          </Card>
        </>
      )}
    </Screen>
  );
}
