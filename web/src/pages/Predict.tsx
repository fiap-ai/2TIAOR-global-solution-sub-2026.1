import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { InfoNote } from "@/components/InfoNote";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { predict } from "@/lib/api";
import { FEATURE_RANGES, GLOSSARY } from "@/lib/glossary";
import { RISK_STYLES } from "@/lib/risk";
import type { PredictRequest, RiskLabel } from "@/lib/types";

interface Field {
  key: keyof PredictRequest;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const FIELDS: Field[] = [
  { key: "air_temperature", label: "Air temperature", unit: "°C", min: -10, max: 60, step: 0.1 },
  { key: "air_humidity", label: "Air humidity", unit: "%", min: 0, max: 100, step: 1 },
  { key: "soil_moisture", label: "Soil moisture", unit: "%", min: 0, max: 100, step: 1 },
  { key: "solar_radiation", label: "Solar radiation", unit: "W/m²", min: 0, max: 1500, step: 10 },
  { key: "ndvi", label: "NDVI", unit: "", min: 0, max: 1, step: 0.01 },
  { key: "days_since_rain", label: "Days since rain", unit: "days", min: 0, max: 120, step: 1 },
  { key: "wind_speed", label: "Wind speed", unit: "km/h", min: 0, max: 150, step: 1 },
];

// One representative feature set per risk class — for one-click demos.
const PRESETS: { label: RiskLabel; values: PredictRequest }[] = [
  {
    label: "HEALTHY",
    values: {
      air_temperature: 24,
      air_humidity: 65,
      soil_moisture: 55,
      solar_radiation: 480,
      ndvi: 0.78,
      days_since_rain: 2,
      wind_speed: 8,
    },
  },
  {
    label: "ATTENTION",
    values: {
      air_temperature: 28,
      air_humidity: 43,
      soil_moisture: 32,
      solar_radiation: 560,
      ndvi: 0.5,
      days_since_rain: 7,
      wind_speed: 11,
    },
  },
  {
    label: "CRITICAL",
    values: {
      air_temperature: 39,
      air_humidity: 18,
      soil_moisture: 8,
      solar_radiation: 950,
      ndvi: 0.18,
      days_since_rain: 30,
      wind_speed: 35,
    },
  },
];

// Default to the dry/hot CRITICAL-leaning preset, easy to demo.
const DEFAULTS: PredictRequest = PRESETS[2].values;

export function Predict() {
  const [form, setForm] = useState<PredictRequest>(DEFAULTS);

  const mutation = useMutation({
    mutationFn: () => predict(form),
    onError: () => toast.error("Prediction failed. Is the backend running?"),
  });

  const result = mutation.data;

  // Fill the form with a preset and immediately score it.
  function applyPreset(values: PredictRequest) {
    setForm(values);
    mutation.mutate();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Territorial Risk Prediction</h1>
        <p className="text-muted-foreground">
          Score a land parcel from its environmental features using the trained model.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Parcel features</CardTitle>
            <CardDescription>Adjust the 7 inputs and run the model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Quick presets (fills the form and scores it):
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => {
                  const style = RISK_STYLES[p.label];
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p.values)}
                      disabled={mutation.isPending}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50 ${style.bg} ${style.text}`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              {FIELDS.map((f) => (
                <div key={f.key} className="space-y-2">
                  <Label htmlFor={f.key}>
                    {f.label}
                    {f.unit && (
                      <span className="ml-1 text-xs text-muted-foreground">({f.unit})</span>
                    )}
                  </Label>
                  <Input
                    id={f.key}
                    type="number"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={form[f.key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))
                    }
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Scoring..." : "Run prediction"}
                </Button>
              </div>
            </form>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-muted-foreground">
                Feature reference — typical range per risk class:
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead className="text-right text-risk-healthy">Healthy</TableHead>
                    <TableHead className="text-right text-risk-attention">Attention</TableHead>
                    <TableHead className="text-right text-risk-critical">Critical</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FEATURE_RANGES.map((f) => (
                    <TableRow key={f.key}>
                      <TableCell className="font-medium">
                        {f.label}
                        {f.unit && (
                          <span className="ml-1 text-xs text-muted-foreground">({f.unit})</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {f.ranges.HEALTHY}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {f.ranges.ATTENTION}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {f.ranges.CRITICAL}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verdict</CardTitle>
            <CardDescription>Model output and class probabilities.</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <p className="text-sm text-muted-foreground">
                Run a prediction to see the result.
              </p>
            ) : (
              <div className="space-y-5">
                <InfoNote
                  title="Reading the verdict"
                  detail={
                    <p>
                      <strong>{GLOSSARY.random_forest.term}.</strong>{" "}
                      {GLOSSARY.random_forest.detail}
                    </p>
                  }
                >
                  The bars are the model's confidence in each class; the highest
                  one is the predicted risk.
                </InfoNote>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Risk class</span>
                  <RiskBadge label={result.risk_label} />
                </div>
                <div className="space-y-3">
                  {Object.entries(result.probabilities).map(([label, prob]) => {
                    const style = RISK_STYLES[label as keyof typeof RISK_STYLES];
                    return (
                      <div key={label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className={style?.text}>{label}</span>
                          <span className="text-muted-foreground">
                            {(prob * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={style?.dot}
                            style={{ width: `${prob * 100}%`, height: "100%" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
