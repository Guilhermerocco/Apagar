/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { UserProfile } from "../types";
import { loginSimulated, registerSimulated } from "../services/auth";
import { Calculator, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("guilhermeribeirorocco@gmail.com");
  const [password, setPassword] = useState("admin");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      return setError("Por favor, preencha todos os campos obrigatórios.");
    }

    setLoading(true);
    setError(null);

    // Simulate small delay for premium SaaS realism
    setTimeout(() => {
      const result = loginSimulated(email, password);
      setLoading(false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || "E-mail ou senha inválidos.");
      }
    }, 700);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !name.trim()) {
      return setError("Por favor, preencha todos os campos obrigatórios.");
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      const result = registerSimulated(email, password, name);
      setLoading(false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || "Erro ao realizar registro.");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      
      {/* Outer Glow backdrop decorations */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-250 dark:border-zinc-800 shadow-xl p-8 relative z-10 transition-all">
        
        {/* Brand identity header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-4 shadow-sm border border-indigo-100 dark:border-indigo-900/20">
            <Calculator className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            CAC Tracker
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 max-w-[280px] mx-auto">
            Plataforma para monitoramento, análise e otimização do Custo de Aquisição de Alunos.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/15 border border-red-150 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}

        {/* Dynamic Forms */}
        {!isRegistering ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400 mb-1.5 tracking-wider">
                Endereço de E-mail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@escola.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-850 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400 tracking-wider">
                  Senha de Acesso
                </label>
                <span className="text-[10px] text-indigo-500">Demo? use "admin"</span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-850 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Sincronizando..." : "Entrar no Painel"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="pt-4 text-center border-t border-zinc-150 dark:border-zinc-800 text-[11px] text-zinc-400">
              Não possui uma conta?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsRegistering(true);
                }}
                className="font-bold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Crie um cadastro gratuito
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400 mb-1.5 tracking-wider">
                Seu Nome Completo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Guilherme Rocco"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-850 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400 mb-1.5 tracking-wider">
                E-mail de Trabalho
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@escola.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-850 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-450 dark:text-zinc-400 mb-1.5 tracking-wider">
                Senha de Acesso
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-250 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-850 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Cadastrando..." : "Registrar Nova Conta"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            <div className="pt-4 text-center border-t border-zinc-150 dark:border-zinc-800 text-[11px] text-zinc-400">
              Já possui uma conta?{" "}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setIsRegistering(false);
                }}
                className="font-bold text-indigo-650 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Faça login
              </button>
            </div>
          </form>
        )}

        {/* Demo Credentials quick tips */}
        <div className="mt-8 pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5 text-[10px] text-zinc-400 justify-center">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Servidor seguro offline habilitado. Sincronização pronta.</span>
        </div>

      </div>

      <span className="text-[10px] text-zinc-400/80 mt-6 block text-center">
        Guilherme Rocco &bull; Painel de Gestão e Análise Escolar v1.0
      </span>
    </div>
  );
};
