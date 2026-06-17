import { useQuery } from "@tanstack/react-query";
import { Activity, Droplets, Leaf, Thermometer } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoNote } from "@/components/InfoNote";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getHealth, getLatestReading, getSensorReadings } from "@/lib/api";
import { RISK_STYLES } from "@/lib/risk";
import type { RiskLabel, SensorRecord } from "@/lib/types";

const ORDER: RiskLabel[] = ["HEALTHY", "ATTENTION", "CRITICAL"];

function shortTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

interface KpiProps {
  label: string;
  value: string;
  icon: React.ElementType;
  hint?: string;
}

function Kpi({ label, value, icon: Icon, hint }: KpiProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="rounded-lg bg-primary/15 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
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

  // Chronological series for the timeline charts.
  const series = [...records]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map((r) => ({
      time: shortTime(r.timestamp),
      temperature: r.reading.air_temperature,
      soil_moisture: r.reading.soil_moisture,
      ndvi: r.reading.ndvi,
      risk_class: r.risk_class,
    }));

  // Risk-class distribution for the bar chart.
  const distribution = ORDER.map((label) => ({
    label,
    count: records.filter((r) => r.risk_label === label).length,
    color: RISK_STYLES[label].hex,
  }));

  const criticalCount = distribution.find((d) => d.label === "CRITICAL")?.count ?? 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Operations Dashboard</h1>
          <p className="text-muted-foreground">
            Live territorial-risk telemetry from field sensors.
          </p>
        </div>
        {latest && <RiskBadge label={latest.risk_label} />}
      </header>

      <InfoNote
        title="What you're looking at"
        detail={
          <p>
            Each reading is scored by the same RandomForest model in real time and
            stored in the database. The timeline below captures a continuous 3-day
            drying cycle — soil moisture and NDVI fall while temperature climbs — so
            the risk distribution shifts from HEALTHY toward CRITICAL as the parcel
            dries out, exactly the early-warning pattern the system is built to
            surface.
          </p>
        }
      >
        Live telemetry from field IoT sensors, each classified into a territorial
        risk level.
      </InfoNote>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Latest temperature"
          value={latest ? `${latest.reading.air_temperature.toFixed(1)} °C` : "—"}
          icon={Thermometer}
          hint={latest ? `Updated ${shortTime(latest.timestamp)}` : "No data yet"}
        />
        <Kpi
          label="Soil moisture"
          value={latest ? `${latest.reading.soil_moisture.toFixed(0)} %` : "—"}
          icon={Droplets}
          hint="Healthy > 45% · stress < 20%"
        />
        <Kpi
          label="NDVI"
          value={latest ? latest.reading.ndvi.toFixed(2) : "—"}
          icon={Leaf}
          hint="Vigor 0→1 · stress < 0.3"
        />
        <Kpi
          label="Critical readings"
          value={`${criticalCount}/${records.length}`}
          icon={Activity}
          hint={healthQuery.data ? `Model ${healthQuery.data.model_loaded ? "loaded" : "offline"}` : undefined}
        />
      </div>

      {readingsQuery.isError && (
        <p className="text-sm text-risk-critical">
          Failed to load telemetry. Is the backend running?
        </p>
      )}

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No sensor readings yet. Post readings to{" "}
            <code className="text-foreground">/api/sensors/readings</code> (the IoT device
            or seed script) and they will appear here.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Environmental timeline</CardTitle>
                <CardDescription>Temperature and soil moisture over time.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={series} margin={{ left: -20, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gSoil" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                    <XAxis dataKey="time" stroke="hsl(215 20% 65%)" fontSize={12} />
                    <YAxis stroke="hsl(215 20% 65%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(222 40% 11%)",
                        border: "1px solid hsl(217 33% 20%)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="temperature"
                      name="Temp (°C)"
                      stroke="#f97316"
                      fill="url(#gTemp)"
                    />
                    <Area
                      type="monotone"
                      dataKey="soil_moisture"
                      name="Soil (%)"
                      stroke="#38bdf8"
                      fill="url(#gSoil)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk distribution</CardTitle>
                <CardDescription>Reading count per risk class.</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={distribution} margin={{ left: -20, right: 8, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 20%)" />
                    <XAxis dataKey="label" stroke="hsl(215 20% 65%)" fontSize={11} />
                    <YAxis allowDecimals={false} stroke="hsl(215 20% 65%)" fontSize={12} />
                    <Tooltip
                      cursor={{ fill: "hsl(217 33% 20% / 0.3)" }}
                      contentStyle={{
                        background: "hsl(222 40% 11%)",
                        border: "1px solid hsl(217 33% 20%)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {distribution.map((d) => (
                        <Cell key={d.label} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent readings table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent readings</CardTitle>
              <CardDescription>Latest telemetry records and their verdicts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="text-right">Temp °C</TableHead>
                    <TableHead className="text-right">Soil %</TableHead>
                    <TableHead className="text-right">NDVI</TableHead>
                    <TableHead className="text-right">Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...records]
                    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                    .slice(0, 10)
                    .map((r, i) => (
                      <TableRow key={`${r.timestamp}-${i}`}>
                        <TableCell>{shortTime(r.timestamp)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {r.reading.device_id}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.reading.air_temperature.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.reading.soil_moisture.toFixed(0)}
                        </TableCell>
                        <TableCell className="text-right">
                          {r.reading.ndvi.toFixed(2)}
                        </TableCell>
                        <TableCell className="flex justify-end">
                          <RiskBadge label={r.risk_label} />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
