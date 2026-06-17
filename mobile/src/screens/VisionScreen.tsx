// TerraVista — computer vision. Mirrors web/src/pages/Vision.tsx, adapted to use
// expo-image-picker for the gallery and the same vegetation/dryness/smoke output.
// Author: Gabriel Mule (RM 560586)

import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, View } from "react-native";
import { Button, Card, Snackbar, Text, useTheme } from "react-native-paper";
import { InfoNote } from "../components/InfoNote";
import { RiskBadge } from "../components/RiskBadge";
import { Screen } from "../components/Screen";
import { analyzeImage } from "../lib/api";
import { GLOSSARY } from "../lib/glossary";

function Fraction({ label, value, color }: { label: string; value: number; color: string }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {label}
        </Text>
        <Text variant="bodySmall">{(value * 100).toFixed(1)}%</Text>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.surfaceVariant,
          overflow: "hidden",
        }}
      >
        <View style={{ width: `${value * 100}%`, height: "100%", backgroundColor: color }} />
      </View>
    </View>
  );
}

const VISION_DETAIL =
  `${GLOSSARY.exg.term}. ${GLOSSARY.exg.detail}\n\n` +
  `${GLOSSARY.vegetation_fraction.term}: ${GLOSSARY.vegetation_fraction.detail}\n\n` +
  `${GLOSSARY.dryness_fraction.term}: ${GLOSSARY.dryness_fraction.detail}\n\n` +
  `${GLOSSARY.smoke_fraction.term}: ${GLOSSARY.smoke_fraction.detail}\n\n` +
  "The scene is classified CRITICAL when dryness ≥ 35%, smoke ≥ 12% or vegetation < 12%; " +
  "HEALTHY when vegetation is high with little dryness or smoke; otherwise ATTENTION.";

export function VisionScreen() {
  const theme = useTheme();
  const [preview, setPreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (uri: string) => analyzeImage(uri),
    onError: () => {},
  });

  const result = mutation.data;

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (res.canceled || !res.assets[0]) return;
    const uri = res.assets[0].uri;
    setPreview(uri);
    mutation.mutate(uri);
  }

  return (
    <Screen
      title="Computer Vision"
      subtitle="Analyze an aerial/satellite image: vegetation, dryness and smoke."
    >
      <InfoNote title="How the scene analysis works" detail={VISION_DETAIL}>
        An authorial remote-sensing heuristic estimates territorial risk from an
        ordinary RGB image — no near-infrared band required.
      </InfoNote>

      <Card mode="contained">
        <Card.Title title="Upload image" subtitle="PNG, JPEG or WEBP." />
        <Card.Content style={{ gap: 12 }}>
          {preview ? (
            <Image
              source={{ uri: preview }}
              style={{ width: "100%", aspectRatio: 16 / 9, borderRadius: 8 }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: "100%",
                aspectRatio: 16 / 9,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.colors.outline,
                borderStyle: "dashed",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                No image selected
              </Text>
            </View>
          )}
          <Button
            mode="contained"
            icon="image"
            onPress={pickImage}
            loading={mutation.isPending}
            disabled={mutation.isPending}
          >
            {preview ? "Choose another image" : "Select an image"}
          </Button>
        </Card.Content>
      </Card>

      <Card mode="contained">
        <Card.Title title="Result" subtitle="Scene classification and indices." />
        <Card.Content style={{ gap: 12 }}>
          {!result ? (
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              Upload an image to see the analysis.
            </Text>
          ) : (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ gap: 4 }}>
                  <RiskBadge label={result.risk_label} />
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    confidence {(result.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {result.detections.length} detection(s)
                </Text>
              </View>
              <Fraction label="Vegetation" value={result.vegetation_fraction} color="#22c55e" />
              <Fraction label="Dryness" value={result.dryness_fraction} color="#facc15" />
              <Fraction label="Smoke" value={result.smoke_fraction} color="#9ca3af" />
            </>
          )}
        </Card.Content>
      </Card>

      <Snackbar visible={mutation.isError} onDismiss={() => mutation.reset()} duration={3000}>
        Analysis failed. Check the file type and backend.
      </Snackbar>
    </Screen>
  );
}
