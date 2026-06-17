// TerraVista — typed API client (axios). One function per backend endpoint.
// Author: Gabriel Mule (RM 560586)

import axios from "axios";
import { getToken } from "./auth";
import type {
  ChatRequest,
  ChatResponse,
  HealthResponse,
  KnowledgeResponse,
  LoginRequest,
  LoginResponse,
  PredictRequest,
  PredictResponse,
  SensorListResponse,
  SensorRecord,
  VisionResponse,
} from "./types";

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "http://localhost:8000/api";

export const api = axios.create({ baseURL: BASE_URL });

// Attach the mock bearer token when present.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>("/health");
  return data;
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function predict(payload: PredictRequest): Promise<PredictResponse> {
  const { data } = await api.post<PredictResponse>("/predict", payload);
  return data;
}

export async function analyzeImage(
  file: File,
  runYolo = false,
): Promise<VisionResponse> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<VisionResponse>("/vision/analyze", form, {
    params: { run_yolo: runYolo },
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function chat(payload: ChatRequest): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", payload);
  return data;
}

export async function getSensorReadings(): Promise<SensorListResponse> {
  const { data } = await api.get<SensorListResponse>("/sensors/readings");
  return data;
}

export async function getLatestReading(): Promise<SensorRecord | null> {
  // The backend returns 404 until the first reading is posted — treat as empty.
  try {
    const { data } = await api.get<SensorRecord>("/sensors/latest");
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}


export async function getKnowledge(): Promise<KnowledgeResponse> {
  const { data } = await api.get<KnowledgeResponse>("/knowledge");
  return data;
}
