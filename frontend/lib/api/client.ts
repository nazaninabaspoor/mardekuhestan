import { CATALOG_REVALIDATE_SECONDS, getApiBaseUrl } from "@/lib/api/config";

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
};

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
  const { searchParams, revalidate = CATALOG_REVALIDATE_SECONDS, ...init } =
    options;

  const response = await fetch(buildUrl(path, searchParams), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
    next: revalidate === false ? { revalidate: 0 } : { revalidate },
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = undefined;
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

  return response.json() as Promise<T>;
}
