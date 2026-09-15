const STORAGE_KEY = "mk_access_token";

let accessToken: string | null = null;
let hydrated = false;

function readStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function hydrateFromStorage(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  accessToken = readStoredToken();
}

export function getAccessToken(): string | null {
  hydrateFromStorage();
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
  hydrated = true;
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // private mode / blocked storage
  }
}
