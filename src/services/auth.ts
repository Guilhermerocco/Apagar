/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from "../types";
import { supabase } from "./db";

// Simulated user memory store for Local Offline Auth
const LOCAL_USERS_KEY = "cac_local_registered_users";
const CURRENT_USER_KEY = "cac_logged_in_user";

// Prepopulate a professional manager user by default so user can login instantly or view logged state
const DEFAULT_DEMO_USER: UserProfile = {
  uid: "usr-demo-adm",
  email: "guilhermeribeirorocco@gmail.com",
  displayName: "Guilherme Rocco"
};

// Ensure default demo user is in our simulated local users database
if (!localStorage.getItem(LOCAL_USERS_KEY)) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify([
    { email: "guilhermeribeirorocco@gmail.com", password: "admin", profile: DEFAULT_DEMO_USER }
  ]));
}

// Automatically log in the demo user on first ever load so they don't get stuck on a gate lock,
// but can sign out/toggle login if they wish to test.
if (!localStorage.getItem(CURRENT_USER_KEY)) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
}

export function getCurrentUser(): UserProfile | null {
  try {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function loginSimulated(email: string, password: string): { success: boolean; user?: UserProfile; error?: string } {
  try {
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!found) {
      // Create user automatically for any new email to keep it friction-free!
      const newUser: UserProfile = {
        uid: "usr-" + Math.random().toString(36).substr(2, 9),
        email,
        displayName: email.split("@")[0].toUpperCase()
      };
      users.push({ email, password, profile: newUser });
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
    
    if (found.password === password || password === "admin") {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found.profile));
      return { success: true, user: found.profile };
    } else {
      return { success: false, error: "Senha incorreta. Experimente entrar usando a senha 'admin' ou registre outro email." };
    }
  } catch (err) {
    return { success: false, error: "Erro desconhecido durante o login." };
  }
}

export function registerSimulated(email: string, password: string, name: string): { success: boolean; user?: UserProfile; error?: string } {
  try {
    const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");
    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Este email já está registrado. Tente outro!" };
    }
    
    const newUser: UserProfile = {
      uid: "usr-" + Math.random().toString(36).substr(2, 9),
      email,
      displayName: name || email.split("@")[0]
    };
    
    users.push({ email, password, profile: newUser });
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return { success: true, user: newUser };
  } catch {
    return { success: false, error: "Falha ao registrar usuário." };
  }
}

export function logoutSimulated(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}
