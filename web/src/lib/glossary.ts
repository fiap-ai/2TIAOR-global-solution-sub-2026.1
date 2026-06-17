// TerraVista — domain glossary and feature reference.
//
// Single source of truth for the theory behind every number shown in the UI.
// Each entry carries a one-line `short` (the gist) plus a `detail` paragraph
// (the remote-sensing / ML rationale) so the InfoNote component can render both
// a concise hint and an expandable explanation.
//
// Author: Gabriel Mule (RM 560586)

import type { RiskLabel } from "./types";

export interface GlossaryTerm {
  term: string;
  short: string;
  detail: string;
}

export const GLOSSARY: Record<string, GlossaryTerm> = {
  ndvi: {
    term: "NDVI",
    short: "Vegetation vigor index, 0 (bare/dry soil) → 1 (dense canopy).",
    detail:
      "The Normalized Difference Vegetation Index measures how vigorous and " +
      "green the vegetation is. Healthy canopy reflects near-infrared strongly " +
      "and absorbs red light, pushing NDVI toward 1. Values below ~0.3 signal " +
      "water stress, bare soil or senescent vegetation — an early warning of " +
      "drought and fire-prone conditions.",
  },
  exg: {
    term: "ExG (Excess Green Index)",
    short: "RGB proxy for NDVI when no near-infrared band is available.",
    detail:
      "ExG = 2g − r − b on the per-pixel chromatic coordinates. It isolates " +
      "vigorous green vegetation from soil and shadow using only an ordinary RGB " +
      "image, so the vision module can estimate vegetation health from aerial " +
      "photos that lack the NIR band required for a true NDVI.",
  },
  soil_moisture: {
    term: "Soil moisture",
    short: "Water held in the soil (%). Below ~20% indicates drought stress.",
    detail:
      "The volumetric water content of the soil. High moisture sustains crops " +
      "and suppresses fire; a sustained decline is the clearest signal of an " +
      "evolving drought. Below roughly 20% plants enter water stress and dry " +
      "biomass becomes fuel.",
  },
  air_temperature: {
    term: "Air temperature",
    short: "Ambient temperature (°C). Sustained highs accelerate drying.",
    detail:
      "Higher temperatures raise evapotranspiration, drying out soil and " +
      "vegetation faster. Combined with low humidity and wind, heat is a primary " +
      "driver of wildfire ignition and spread.",
  },
  air_humidity: {
    term: "Air humidity",
    short: "Relative humidity (%). Low values dry fuels and raise fire risk.",
    detail:
      "Relative humidity controls how quickly fine fuels (grass, litter) lose " +
      "moisture. Below ~30% these fuels cure rapidly and ignite easily, a classic " +
      "fire-weather condition.",
  },
  solar_radiation: {
    term: "Solar radiation",
    short: "Incoming solar energy (W/m²). Drives heating and evaporation.",
    detail:
      "The radiant energy reaching the surface. Strong radiation increases " +
      "surface temperature and evapotranspiration, compounding drought stress " +
      "during long rain-free periods.",
  },
  days_since_rain: {
    term: "Days since rain",
    short: "Length of the dry spell (days). Longer spells compound stress.",
    detail:
      "The number of consecutive days without meaningful precipitation. Extended " +
      "dry spells deplete soil moisture and cure vegetation, the cumulative " +
      "condition behind most drought and fire emergencies.",
  },
  wind_speed: {
    term: "Wind speed",
    short: "Wind speed (km/h). High winds accelerate fire spread.",
    detail:
      "Wind both dries fuels and carries embers, dramatically increasing the " +
      "rate and direction of fire spread. It is a key modifier that can turn a " +
      "manageable situation critical.",
  },
  vegetation_fraction: {
    term: "Vegetation fraction",
    short: "Share of image pixels that are vigorous green vegetation.",
    detail:
      "The fraction of pixels with a high Excess Green Index — healthy, " +
      "photosynthesizing vegetation. A high value points to a resilient parcel; " +
      "a collapse toward zero indicates bare, burnt or senescent ground.",
  },
  dryness_fraction: {
    term: "Dryness fraction",
    short: "Share of pixels that are brown/reddish bare or burnt soil.",
    detail:
      "The fraction of reddish-brown, low-green pixels, a proxy for exposed soil, " +
      "cured vegetation or burn scars. Rising dryness is a direct indicator of " +
      "drought damage and fire aftermath.",
  },
  smoke_fraction: {
    term: "Smoke fraction",
    short: "Share of gray, low-saturation pixels consistent with smoke.",
    detail:
      "The fraction of bright-to-mid, desaturated (gray) pixels. Smoke is " +
      "near-achromatic, so low saturation above a brightness floor flags active " +
      "fire plumes — captured for dark gray smoke, not only bright white ones.",
  },
  random_forest: {
    term: "RandomForest model",
    short: "Ensemble of decision trees voting on the risk class.",
    detail:
      "A RandomForest classifier trained on environmental features. Many decision " +
      "trees each vote on a class, and the share of votes becomes the per-class " +
      "probability shown below. The ensemble is robust to noise and gives " +
      "interpretable feature importance.",
  },
};

export type RiskRange = string;

export interface FeatureRange {
  key: string;
  label: string;
  unit: string;
  ranges: Record<RiskLabel, RiskRange>;
}

// Typical operating ranges per risk class — for the Predict feature reference.
export const FEATURE_RANGES: FeatureRange[] = [
  { key: "air_temperature", label: "Air temperature", unit: "°C", ranges: { HEALTHY: "18–28", ATTENTION: "28–35", CRITICAL: "> 35" } },
  { key: "air_humidity", label: "Air humidity", unit: "%", ranges: { HEALTHY: "> 55", ATTENTION: "30–55", CRITICAL: "< 30" } },
  { key: "soil_moisture", label: "Soil moisture", unit: "%", ranges: { HEALTHY: "> 45", ATTENTION: "20–45", CRITICAL: "< 20" } },
  { key: "solar_radiation", label: "Solar radiation", unit: "W/m²", ranges: { HEALTHY: "< 550", ATTENTION: "550–800", CRITICAL: "> 800" } },
  { key: "ndvi", label: "NDVI", unit: "", ranges: { HEALTHY: "> 0.6", ATTENTION: "0.3–0.6", CRITICAL: "< 0.3" } },
  { key: "days_since_rain", label: "Days since rain", unit: "days", ranges: { HEALTHY: "0–5", ATTENTION: "5–20", CRITICAL: "> 20" } },
  { key: "wind_speed", label: "Wind speed", unit: "km/h", ranges: { HEALTHY: "< 15", ATTENTION: "15–30", CRITICAL: "> 30" } },
];
