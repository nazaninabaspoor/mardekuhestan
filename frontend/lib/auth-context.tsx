"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  AuthUser,
  getCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
  updateProfile,
} from "@/lib/api/auth";
import { getAccessToken, setAccessToken } from "@/lib/api/access-token";

type AuthModalTab = "login" | "register";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isModalOpen: boolean;
  modalTab: AuthModalTab;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
  setModalTab: (tab: AuthModalTab) => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    passwordRepeat: string;
    name: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUserProfile: (data: { name?: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<AuthModalTab>("login");

  const refreshUser = useCallback(async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const token = getAccessToken();
    if (user && token) setAccessToken(token);
  }, [user]);

  const openLoginModal = useCallback(() => {
    setModalTab("login");
    setIsModalOpen(true);
  }, []);

  const openRegisterModal = useCallback(() => {
    setModalTab("register");
    setIsModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const login = useCallback(
    async (email: string, pass: string) => {
      const payload = await loginAccount(email, pass);
      setUser(payload.user);
      setIsModalOpen(false);
    },
    [],
  );

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      passwordRepeat: string;
      name: string;
      phone?: string;
    }) => {
      const payload = await registerAccount(input);
      setUser(payload.user);
      setIsModalOpen(false);
    },
    [],
  );

  const updateUserProfile = useCallback(
    async (data: { name?: string; phone?: string }) => {
      const updated = await updateProfile(data);
      setUser(updated);
    },
    [],
  );

  const logout = useCallback(async () => {
    setUser(null);
    try {
      await logoutAccount();
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isModalOpen,
        modalTab,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        setModalTab,
        login,
        register,
        logout,
        refreshUser,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
