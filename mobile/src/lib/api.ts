// TerraVista — typed API client (axios). One function per backend endpoint.
// Mirror of web/src/lib/api.ts, adapted for React Native:
//   - base URL comes from app.json `extra.apiUrl` via expo-constants
//   - analyzeImage takes a local image URI (native: {uri,name,type}; web: Blob)
// Author: Gabriel Mule (RM 560586)

import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
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
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  "http://localhost:8000/api";

export const api = axios.create({ baseURL: BASE_URL });

// Attach the mock bearer token when present (read from the in-memory cache).
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
  uri: string,
  runYolo = false,
): Promise<VisionResponse> {
  const name = uri.split("/").pop() ?? "upload.jpg";
  const ext = name.split(".").pop()?.toLowerCase() ?? "jpg";
  const type = ext === "png" ? "image/png" : "image/jpeg";

  const form = new FormData();
  if (Platform.OS === "web") {
    // On web the browser FormData needs a real Blob, not the RN {uri,...} shape.
    const blob = await fetch(uri).then((r) => r.blob());
    form.append("file", blob, name);
  } else {
    // Native FormData accepts this {uri,name,type} shape for file uploads.
    form.append("file", { uri, name, type } as unknown as Blob);
  }

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
