// TerraVista — API data contracts (mirror of backend/app/schemas.py).
// Author: Gabriel Mule (RM 560586)

export type RiskClass = 0 | 1 | 2;
export type RiskLabel = "HEALTHY" | "ATTENTION" | "CRITICAL";

export interface HealthResponse {
  status: string;
  app: string;
  version: string;
  model_loaded: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: string;
  expires_in: number;
}

export interface PredictRequest {
  air_temperature: number;
  air_humidity: number;
  soil_moisture: number;
  solar_radiation: number;
  ndvi: number;
  days_since_rain: number;
  wind_speed: number;
}

export interface PredictResponse {
  risk_class: RiskClass;
  risk_label: RiskLabel;
  probabilities: Record<string, number>;
}

export interface VisionDetection {
  label: string;
  domain_tag: string;
  confidence: number;
  box: number[];
}

export interface VisionResponse {
  image: string;
  risk_class: RiskClass;
  risk_label: RiskLabel;
  confidence: number;
  vegetation_fraction: number;
  dryness_fraction: number;
  smoke_fraction: number;
  detections: VisionDetection[];
}

export interface ChatRequest {
  message: string;
  context?: string | null;
}

export interface ChatResponse {
  reply: string;
  source: string;
}

export interface SensorReading {
  air_temperature: number;
  air_humidity: number;
  soil_moisture: number;
  solar_radiation: number;
  ndvi: number;
  days_since_rain: number;
  wind_speed: number;
  device_id: string;
}

export interface SensorRecord {
  reading: SensorReading;
  risk_class: RiskClass;
  risk_label: RiskLabel;
  timestamp: string;
}

export interface SensorListResponse {
  count: number;
  records: SensorRecord[];
}

export interface KnowledgeItem {
  risk_label: RiskLabel;
  title: string;
  actions: string[];
}

export interface KnowledgeResponse {
  items: KnowledgeItem[];
}
