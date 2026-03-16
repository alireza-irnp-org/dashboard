import { authClient } from "@/lib/auth/auth-client";

export const API_BASE_URL = `${process.env.NEXT_PUBLIC_APP_URL}`;

type AuthMode = "cookie" | "bearer";

// 'cookie'  — credentials: 'include', session cookie sent automatically (same-domain web)
// 'bearer'  — calls authClient.getSession() and attaches Authorization: Bearer <token>
const AUTH_MODE: AuthMode = "bearer";

async function getAuthHeaders(): Promise<HeadersInit> {
  if (AUTH_MODE === "bearer") {
    const { data } = await authClient.getSession();
    const token = data?.session?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  return {};
}

/**
 * Custom fetch mutator used by all orval-generated API calls.
 *
 * Orval passes the full wrapper type as T:
 *   T = { data: SchemaType; status: number; headers: Headers }
 * so we must return that exact shape to satisfy the generated types.
 */
export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const absoluteUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  const authHeaders = await getAuthHeaders();

  const res = await fetch(absoluteUrl, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
      ...authHeaders,
    },
  });

  if (!res.ok) {
    throw await res.json();
  }

  const data = [204, 205, 304].includes(res.status)
    ? undefined
    : await res.json();

  return { data, status: res.status, headers: res.headers } as T;
};
