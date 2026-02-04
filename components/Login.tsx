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

  // Admin (senha local via env)
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const clearAlerts = () => {
    setError("");
    setMessage("");
  };

  const validateEmail = (value: string) => value.includes("@") && value.includes(".");

  // ============ ALUNO: SIGNUP ============
  const handleStudentSignup = async () => {
    clearAlerts();

    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Por favor, preencha nome, e-mail, senha e confirmar senha.");
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
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim(),
            role: UserRole.STUDENT,
          },
        },
      });

      if (signUpError) {
        console.error("SUPABASE SIGNUP ERROR:", signUpError);
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Quando "Confirm email" está ligado, pode não vir session.
      // Mesmo assim o user costuma existir; mostramos instrução clara.
      if (!data?.user) {
        setError("Não foi possível criar o usuário. Tente novamente.");
        setLoading(false);
        return;
      }

      if (!data.session) {
        setMessage(
          "Conta criada! Verifique seu e-mail (e a caixa de spam) para confirmar antes do primeiro login."
        );
        setStudentMode("login");
        setLoading(false);
        return;
      }

      // Se veio session, já loga no app
      onLogin({
        id: data.user.id,
        name: (data.user.user_metadata?.name as string) || name.trim(),
        email: data.user.email || email.trim(),
        role: UserRole.STUDENT,
      });

      setLoading(false);
    } catch (err: any) {
      console.error("CATCH SIGNUP ERROR:", err);
      setError(err?.message || "Erro inesperado no cadastro.");
      setLoading(false);
    }
  };

  // ============ ALUNO: LOGIN ============
  const handleStudentLogin = async () => {
    clearAlerts();

    if (!email.trim() || !password.trim()) {
      setError("Informe e-mail e senha.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        console.error("SUPABASE SIGNIN ERROR:", signInError);
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setError("Não foi possível entrar. Confira seus dados.");
        setLoading(false);
        return;
      }

      onLogin({
        id: data.user.id,
        name: (data.user.user_metadata?.name as string) || "Aluno",
        email: data.user.email || email.trim(),
        role: UserRole.STUDENT,
      });

      setLoading(false);
    } catch (err: any) {
      console.error("CATCH LOGIN ERROR:", err);
      setError(err?.message || "Erro ao entrar.");
      setLoading(false);
    }
  };

  // ============ ADMIN: LOGIN (SENHA LOCAL) ============
  const handleAdminLogin = () => {
    clearAlerts();

    // Suporte a variações e ao typo PASSAWORD que você criou no Netlify
    const envAdmin =
      (import.meta as any).env?.VITE_ADMIN_PASSAWORD ||
      (import.meta as any).env?.VITE_ADMIN_PASSWORD ||
      (import.meta as any).env?.ADMIN_PASSWORD ||
      "";

    // Sem variável definida, usa padrão (NÃO recomendado para produção)
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

  // ============ UI HELPERS ============
  const onSwitchRole = (student: boolean) => {
    clearAlerts();
    setIsStudent(student);

    // limpa campos ao alternar
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAdminPassword("");
  };

  const onSwitchStudentMode = (mode: "login" | "signup") => {
    clearAlerts();
    setStudentMode(mode);

    // limpa apenas campos sensíveis
    setPassword("");
    setConfirmPassword("");
  };

  const showConfirmEmailHint = isStudent && studentMode === "login";

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <div className="flex items-center justify-center mb-4">
          <Logo />
        </div>

        <h1 className="text-2xl font-semibold mb-1">HistoMed</h1>
        <p className="text-gray-600 mb-4">Acesso ao aplicativo</p>

        {/* Role switch */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => onSwitchRole(true)}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
              isStudent ? "bg-black text-white" : "bg-white text-gray-800"
            }`}
          >
            <UserIcon size={18} />
            Aluno
          </button>

          <button
            type="button"
            onClick={() => onSwitchRole(false)}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${
              !isStudent ? "bg-black text-white" : "bg-white text-gray-800"
            }`}
          >
            <Lock size={18} />
            Admin
          </button>
        </div>

        {/* Student mode switch */}
        {isStudent && (
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => onSwitchStudentMode("signup")}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                studentMode === "signup" ? "bg-gray-100" : "bg-white"
              }`}
            >
              Criar conta
            </button>
            <button
              type="button"
              onClick={() => onSwitchStudentMode("login")}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                studentMode === "login" ? "bg-gray-100" : "bg-white"
              }`}
            >
              Entrar
            </button>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 text-red-700 px-3 py-2">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-3 rounded-lg bg-green-50 border border-green-200 text-green-700 px-3 py-2">
            {message}
          </div>
        )}

        {/* Forms */}
        {isStudent ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (studentMode === "signup") handleStudentSignup();
              else handleStudentLogin();
            }}
            className="space-y-3"
          >
            {studentMode === "signup" && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nome</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
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

            <div>
              <label className="block text-sm text-gray-700 mb-1">E-mail</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
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

            <div>
              <label className="block text-sm text-gray-700 mb-1">Senha</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <Lock size={18} className="text-gray-400" />
                <input
                  type="password"
                  className="w-full outline-none"
                  placeholder="mín. 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={studentMode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            </div>

            {studentMode === "signup" && (
              <div>
                <label className="block text-sm text-gray-700 mb-1">Confirmar senha</label>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                  <Lock size={18} className="text-gray-400" />
                  <input
                    type="password"
                    className="w-full outline-none"
                    placeholder="repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-black text-white rounded-lg px-4 py-2 disabled:opacity-60"
            >
              {loading ? "Carregando..." : studentMode === "signup" ? "Criar conta" : "Entrar"}
              <ArrowRight size={18} />
            </button>

            {showConfirmEmailHint && (
              <p className="text-xs text-gray-500">
                Se o Supabase estiver com <b>Confirm email</b> ligado, você precisa confirmar no e-mail antes
                de conseguir entrar.
              </p>
            )}
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdminLogin();
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-sm text-gray-700 mb-1">Senha do Admin</label>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
                <Lock size={18} className="text-gray-400" />
                <input
                  type="password"
                  className="w-full outline-none"
                  placeholder="Senha do Admin"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-black text-white rounded-lg px-4 py-2"
            >
              Entrar
              <ArrowRight size={18} />
            </button>

            <p className="text-xs text-gray-500">
              Dica: a senha do admin vem do Netlify em <b>VITE_ADMIN_PASSAWORD</b> (ou VITE_ADMIN_PASSWORD).
              Se não existir, cai no padrão <b>admin123</b>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
