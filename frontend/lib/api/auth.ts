import { apiFetch, ApiError } from "@/lib/api/client";
import { setAccessToken } from "@/lib/api/access-token";

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  phone: string;
  email_verified: boolean;
  is_staff: boolean;
};

type AuthPayload = {
  user: AuthUser;
  access: string;
};

const authInit = {
  credentials: "include" as const,
  revalidate: false as const,
  headers: { "Content-Type": "application/json" },
};

export async function registerAccount(input: {
  email: string;
  password: string;
  passwordRepeat: string;
  name: string;
  phone?: string;
}): Promise<AuthPayload> {
  const payload = await apiFetch<AuthPayload>("/api/auth/register/", {
    ...authInit,
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      password_repeat: input.passwordRepeat,
      name: input.name,
      phone: input.phone ?? "",
    }),
  });
  setAccessToken(payload.access);
  return payload;
}

export async function loginAccount(
  email: string,
  password: string,
): Promise<AuthPayload> {
  const payload = await apiFetch<AuthPayload>("/api/auth/login/", {
    ...authInit,
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(payload.access);
  return payload;
}

export async function logoutAccount(): Promise<void> {
  try {
    await apiFetch<void>("/api/auth/logout/", {
      ...authInit,
      method: "POST",
      body: "{}",
    });
  } finally {
    setAccessToken(null);
  }
}

export async function refreshAccountSession(): Promise<{ access: string }> {
  const payload = await apiFetch<{ access: string }>(
    "/api/auth/token/refresh/",
    {
      ...authInit,
      method: "POST",
      body: "{}",
    },
  );
  setAccessToken(payload.access);
  return payload;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>("/api/auth/me/", {
      credentials: "include",
      revalidate: false,
    });
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    ) {
      setAccessToken(null);
      return null;
    }
    return null;
  }
}

export function authErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const body = error.body;
    if (body && typeof body === "object") {
      const record = body as Record<string, unknown>;
      if (typeof record.detail === "string") return record.detail;
      const first = Object.values(record).flatMap((val) =>
        Array.isArray(val) ? val : [val],
      )[0];
      if (typeof first === "string") return first;
    }
    if (error.status === 401) return "ایمیل یا رمز درست نیست.";
    if (error.status === 409) return "این ایمیل قبلاً ثبت شده است.";
    if (error.status === 429)
      return "درخواست‌های پشت‌سر‌هم زیاد بود. چند لحظه بعد تلاش کنید.";
  }
  return "خطایی رخ داد. لطفاً دوباره امتحان کنید.";
}
