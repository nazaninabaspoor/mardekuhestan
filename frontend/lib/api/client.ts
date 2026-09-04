import { CATALOG_REVALIDATE_SECONDS, getApiBaseUrl } from "@/lib/api/config";
import { getAccessToken, setAccessToken } from "@/lib/api/access-token";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiFetchOptions = RequestInit & {
  searchParams?: Record<string, string | number | boolean | undefined | null>;
  revalidate?: number | false;
  _retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function requestTokenRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const base = getApiBaseUrl();
        const res = await fetch(`${base}/api/auth/token/refresh/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: "{}",
        });
        if (!res.ok) {
          setAccessToken(null);
          return null;
        }
        const data = (await res.json()) as { access?: string };
        if (data && typeof data.access === "string") {
          setAccessToken(data.access);
          return data.access;
        }
        setAccessToken(null);
        return null;
      } catch {
        setAccessToken(null);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function buildUrl(
  path: string,
  searchParams?: ApiFetchOptions["searchParams"],
): string {
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalized}`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const {
    searchParams,
    revalidate = CATALOG_REVALIDATE_SECONDS,
    _retry = false,
    ...init
  } = options;

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  const token = getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path, searchParams), {
    ...init,
    headers,
    next: revalidate === false ? { revalidate: 0 } : { revalidate },
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    const isAuthEndpoint =
      path.includes("/api/auth/token/refresh/") ||
      path.includes("/api/auth/login/") ||
      path.includes("/api/auth/register/");

    if (response.status === 401 && !_retry && !isAuthEndpoint) {
      const newAccess = await requestTokenRefresh();
      if (newAccess) {
        return apiFetch<T>(path, {
          ...options,
          _retry: true,
          headers: {
            ...Object.fromEntries(headers.entries()),
            Authorization: `Bearer ${newAccess}`,
          },
        });
      }
    }

    throw new ApiError(
      `API ${response.status} ${path}`,
      response.status,
      body,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
