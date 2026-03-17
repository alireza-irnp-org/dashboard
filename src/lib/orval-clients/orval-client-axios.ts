import { authClient } from "@/lib/auth/auth-client";
import Axios, { type AxiosError, type AxiosRequestConfig } from "axios";

// const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;

export const AXIOS_INSTANCE = Axios.create({
  // baseURL: BASE_URL,
  withCredentials: true,
});

AXIOS_INSTANCE.interceptors.request.use(async (config) => {
  const { data: session } = await authClient.getSession();
  const token = session?.session?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * The generated code calls: customInstance<T>(url: string, options?: RequestInit)
 * and expects Promise<T> where T = { data: Schema; status: number; headers: Headers }
 *
 * RequestInit and AxiosRequestConfig differ on `headers` (HeadersInit vs AxiosHeaders)
 * and `body` vs `data`, so we map them explicitly.
 */
export const customInstance = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const { body, headers, signal, method, ...rest } = options ?? {};

  // Normalise HeadersInit → plain Record<string, string> that axios accepts
  let normalizedHeaders: Record<string, string> | undefined;
  if (headers instanceof Headers) {
    normalizedHeaders = Object.fromEntries(headers.entries());
  } else if (Array.isArray(headers)) {
    normalizedHeaders = Object.fromEntries(headers);
  } else {
    normalizedHeaders = headers as Record<string, string> | undefined;
  }

  const config: AxiosRequestConfig = {
    url,
    method: method as AxiosRequestConfig["method"],
    headers: normalizedHeaders,
    data: body,
    signal: signal as AbortSignal | undefined,
    ...rest,
  };

  const res = await AXIOS_INSTANCE(config);
  return { data: res.data, status: res.status, headers: res.headers } as T;
};

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
