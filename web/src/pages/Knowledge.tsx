import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { InfoNote } from "@/components/InfoNote";
import { RiskBadge } from "@/components/RiskBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKnowledge } from "@/lib/api";

export function Knowledge() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["knowledge"],
    queryFn: getKnowledge,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Recommended mitigation and management actions per risk level.
        </p>
      </header>

      <InfoNote
        title="How risk levels map to action"
        detail={
          <p>
            The same three classes are produced by both the tabular RandomForest
            model and the computer-vision analyzer. Each level corresponds to a
            decision band on the environmental indicators (NDVI, soil moisture,
            dryness/smoke) — so a verdict on the Predict or Vision pages points
            directly to the recommended response below.
          </p>
        }
      >
        Each card maps a risk level to the field actions that mitigate it.
      </InfoNote>

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {isError && (
        <p className="text-sm text-risk-critical">
          Failed to load. Is the backend running?
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {data?.items.map((item) => (
          <Card key={item.risk_label}>
            <CardHeader className="space-y-3">
              <RiskBadge label={item.risk_label} className="w-fit" />
              <CardTitle className="text-base">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {item.actions.map((action, i) => (
                  <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
