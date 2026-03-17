import { authClient } from "@/lib/auth/auth-client";

// const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;

/**
 * Custom fetch mutator for all orval-generated API calls.
 *
 * Orval calls: customInstance<T>(url: string, options?: RequestInit)
 * and expects Promise<T> where T = { data: Schema; status: number; headers: Headers }
 */
export const customInstance = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const { data: session } = await authClient.getSession();
  const token = session?.session?.token;

  const res = await fetch(`${url}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = [204, 205, 304].includes(res.status)
    ? undefined
    : await res.json();

  if (!res.ok) {
    throw data;
  }

  return { data, status: res.status, headers: res.headers } as T;
};