import { useMutation } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { InfoNote } from "@/components/InfoNote";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeImage } from "@/lib/api";
import { GLOSSARY } from "@/lib/glossary";
import { RISK_STYLES } from "@/lib/risk";
import type { RiskLabel } from "@/lib/types";

// Real aerial/satellite samples (in public/samples), each validated to land on
// the intended risk class — handy for a one-click demo.
const SAMPLES: { label: RiskLabel; file: string }[] = [
  { label: "HEALTHY", file: "/samples/healthy.png" },
  { label: "ATTENTION", file: "/samples/attention.png" },
  { label: "CRITICAL", file: "/samples/critical.png" },
];

function Fraction({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div style={{ width: `${value * 100}%`, height: "100%", backgroundColor: color }} />
      </div>
    </div>
  );
}

export function Vision() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => analyzeImage(file),
    onError: () => toast.error("Analysis failed. Check the file type and backend."),
  });

  const result = mutation.data;

  function handleFile(file?: File) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    mutation.mutate(file);
  }

  // Fetch one of the bundled real samples and feed it through the same flow.
  async function loadSample(file: string, label: RiskLabel) {
    setPreview(file);
    const res = await fetch(file);
    const blob = await res.blob();
    mutation.mutate(new File([blob], `${label.toLowerCase()}.jpg`, { type: blob.type }));
  }


  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Computer Vision</h1>
        <p className="text-muted-foreground">
          Analyze an aerial/satellite image: vegetation, dryness and smoke fractions.
        </p>
      </header>

      <InfoNote
        title="How the scene analysis works"
        detail={
          <>
            <p>
              <strong>{GLOSSARY.exg.term}.</strong> {GLOSSARY.exg.detail}
            </p>
            <p>
              <strong>{GLOSSARY.vegetation_fraction.term}:</strong>{" "}
              {GLOSSARY.vegetation_fraction.detail}
            </p>
            <p>
              <strong>{GLOSSARY.dryness_fraction.term}:</strong>{" "}
              {GLOSSARY.dryness_fraction.detail}
            </p>
            <p>
              <strong>{GLOSSARY.smoke_fraction.term}:</strong>{" "}
              {GLOSSARY.smoke_fraction.detail}
            </p>
            <p>
              The scene is classified <strong>CRITICAL</strong> when dryness ≥ 35%,
              smoke ≥ 12% or vegetation &lt; 12%; <strong>HEALTHY</strong> when
              vegetation is high with little dryness or smoke; otherwise{" "}
              <strong>ATTENTION</strong>.
            </p>
          </>
        }
      >
        An authorial remote-sensing heuristic estimates territorial risk from an
        ordinary RGB image — no near-infrared band required.
      </InfoNote>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upload image</CardTitle>
            <CardDescription>PNG, JPEG or WEBP.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                <>
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">Click to select an image</span>
                </>
              )}
            </button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => inputRef.current?.click()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Analyzing..." : "Choose another image"}
            </Button>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Or try a real sample (one click):
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLES.map((s) => {
                  const style = RISK_STYLES[s.label];
                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => loadSample(s.file, s.label)}
                      disabled={mutation.isPending}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50 ${style.bg} ${style.text}`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Scene classification and indices.</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <p className="text-sm text-muted-foreground">
                Upload an image to see the analysis.
              </p>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <RiskBadge label={result.risk_label} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      confidence {(result.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {result.detections.length} detection(s)
                  </span>
                </div>
                <div className="space-y-3">
                  <Fraction label="Vegetation" value={result.vegetation_fraction} color="#22c55e" />
                  <Fraction label="Dryness" value={result.dryness_fraction} color="#facc15" />
                  <Fraction label="Smoke" value={result.smoke_fraction} color="#9ca3af" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
