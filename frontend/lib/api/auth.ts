import { apiFetch } from "@/lib/api/client";

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

export function registerAccount(input: {
  email: string;
  password: string;
  passwordRepeat: string;
  name: string;
  phone?: string;
}) {
  return apiFetch<AuthPayload>("/api/auth/register/", {
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
}

export function loginAccount(email: string, password: string) {
  return apiFetch<AuthPayload>("/api/auth/login/", {
    ...authInit,
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logoutAccount() {
  return apiFetch<void>("/api/auth/logout/", {
    ...authInit,
    method: "POST",
    body: "{}",
  });
}

export function refreshAccountSession() {
  return apiFetch<{ access: string }>("/api/auth/token/refresh/", {
    ...authInit,
    method: "POST",
    body: "{}",
  });
}

export function getCurrentUser() {
  return apiFetch<AuthUser>("/api/auth/me/", {
    credentials: "include",
    revalidate: false,
  });
}
