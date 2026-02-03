import React, { useState } from "react";
import { User, UserRole } from "../types";
import { User as UserIcon, Lock, ArrowRight, Mail } from "lucide-react";
import Logo from "./Logo";
import { supabase } from "../services/supabase";

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isStudent, setIsStudent] = useState(true);

  // Aluno
  const [studentMode, setStudentMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Admin (mantive simples: senha local)
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const clearAlerts = () => {
    setError("");
    setMessage("");
  };

  const validateEmail = (value: string) => value.includes("@") && value.includes(".");

  const resetStudentFields = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleStudentSignup = async () => {
    clearAlerts();

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Por favor, preencha nome, e-mail e senha.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: UserRole.STUDENT,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Observação: se Confirm email estiver ligado no Supabase, pode exigir confirmação no e-mail.
      if (!data.user) {
        setMessage("Conta criada. Verifique seu e-mail para confirmar o cadastro.");
        setLoading(false);
        resetStudentFields();
        setStudentMode("login");
        return;
      }

      setMessage("Conta criada com sucesso!");

      onLogin({
        id: data.user.id,
        name,
        email,
        role: UserRole.STUDENT,
      });

      setLoading(false);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao criar conta.");
      setLoading(false);
    }
  };

  const handleStudentLogin = async () => {
    clearAlerts();

    if (!email.trim() || !password.trim()) {
      setError("Por favor, preencha e-mail e senha.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Não foi possível autenticar. Tente novamente.");
        setLoading(false);
        return;
      }

      const metaName =
        (data.user.user_metadata?.name as string | undefined) ||
        (data.user.user_metadata?.full_name as string | undefined) ||
        "";

      onLogin({
        id: data.user.id,
        name: metaName,
        email: data.user.email ?? email,
        role: UserRole.STUDENT,
      });

      setLoading(false);
    } catch (e: any) {
      setError(e?.message ?? "Erro ao entrar.");
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    clearAlerts();

    const envAdmin =
      (import.meta as any).env?.VITE_ADMIN_PASSWORD ||
      (import.meta as any).env?.ADMIN_PASSWORD ||
      "";

    // Se você não configurar env, ele vai usar um padrão (troque depois!)
    const ADMIN_PASSWORD = envAdmin || "admin123";

    if (!adminPassword.trim()) {
      setError("Informe a senha do admin.");
      return;
    }

    if (adminPassword !== ADMIN_PASSWORD) {
      setError("Senha de admin incorreta.");
      return;
    }

    onLogin({
      id: "admin",
      name: "Admin",
      email: "admin@local",
      role: UserRole.ADMIN,
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isStudent) {
      if (studentMode === "signup") return void handleStudentSignup();
      return void handleStudentLogin();
    }

    return void handleAdminLogin();
  };

  const title = isStudent ? "Aluno" : "Admin";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl shadow-lg p-6 bg-white">
        <div className="flex flex-col items-center mb-6">
          <Logo />
          <h1 className="text-xl font-semibold mt-3">HistoMed</h1>
          <p className="text-sm text-gray-500">Acesso ao aplicativo</p>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 flex items-center justify-center gap-2 border ${
              isStudent ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={() => {
              clearAlerts();
              setIsStudent(true);
              setStudentMode("signup");
            }}
          >
            <UserIcon size={18} />
            Aluno
          </button>

          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 flex items-center justify-center gap-2 border ${
              !isStudent ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={() => {
              clearAlerts();
              setIsStudent(false);
            }}
          >
            <Lock size={18} />
            Admin
          </button>
        </div>

        {isStudent && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 border ${
                studentMode === "signup" ? "bg-gray-100" : "bg-white"
              }`}
              onClick={() => {
                clearAlerts();
                setStudentMode("signup");
              }}
            >
              Criar conta
            </button>

            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 border ${
                studentMode === "login" ? "bg-gray-100" : "bg-white"
              }`}
              onClick={() => {
                clearAlerts();
                setStudentMode("login");
              }}
            >
              Entrar
            </button>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="text-sm font-medium text-gray-700">{title}</div>

          {isStudent && studentMode === "signup" && (
            <div>
              <label className="text-sm text-gray-600">Nome</label>
              <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
                <UserIcon size={18} className="text-gray-400" />
                <input
                  className="w-full outline-none"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          {isStudent && (
            <div>
              <label className="text-sm text-gray-600">E-mail</label>
              <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
                <Mail size={18} className="text-gray-400" />
                <input
                  className="w-full outline-none"
                  placeholder="email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
          )}

          {isStudent && (
            <div>
              <label className="text-sm text-gray-600">Senha</label>
              <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
                <Lock size={18} className="text-gray-400" />
                <input
                  className="w-full outline-none"
                  placeholder="mín. 6 caracteres"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={studentMode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            </div>
          )}

          {isStudent && studentMode === "signup" && (
            <div>
              <label className="text-sm text-gray-600">Confirmar senha</label>
              <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
                <Lock size={18} className="text-gray-400" />
                <input
                  className="w-full outline-none"
                  placeholder="repita a senha"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {!isStudent && (
            <div>
              <label className="text-sm text-gray-600">Senha do Admin</label>
              <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
                <Lock size={18} className="text-gray-400" />
                <input
                  className="w-full outline-none"
                  placeholder="senha do admin"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-lg bg-green-50 text-green-700 px-3 py-2 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-black text-white py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Carregando..." : isStudent ? (studentMode === "signup" ? "Criar conta" : "Entrar") : "Entrar"}
            <ArrowRight size={18} />
          </button>
        </form>

        {isStudent && (
          <div className="mt-4 text-xs text-gray-500">
            Se o Supabase estiver com <b>Confirm email</b> ligado, você precisa confirmar no e-mail antes de conseguir entrar.
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
