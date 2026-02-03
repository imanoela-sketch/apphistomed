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

  // Admin (mantive simples como estava: senha local)
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const clearAlerts = () => {
    setError("");
    setMessage("");
  };

  const validateEmail = (value: string) => value.includes("@");

  const handleStudentSignup = async () => {
    clearAlerts();

    if (!name.trim() || !email.trim() || !password.trim()) {
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

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: "student",
          },
        },
      });

      if (signUpError) throw signUpError;

      // Se "Confirm email" estiver ligado no Supabase, o usuário só entra depois de confirmar
      if (data.user && !data.session) {
        setMessage(
          "Cadastro criado! Agora confirme o e-mail (veja a caixa de entrada/Spam) para poder entrar."
        );
        setStudentMode("login");
        return;
      }

      // Caso esteja com confirmação desligada, ele já entra direto
      const userId = data.user?.id;
      if (!userId) {
        setMessage("Cadastro criado. Faça login para entrar.");
        setStudentMode("login");
        return;
      }

      onLogin({
        id: userId,
        name,
        email,
        role: UserRole.STUDENT,
        createdAt: new Date().toISOString(),
      });
    } catch (e: any) {
      setError(e?.message || "Erro ao criar conta.");
    } finally {
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

      if (signInError) throw signInError;

      const userId = data.user?.id;
      const userEmail = data.user?.email || email;
      const userName =
        (data.user?.user_metadata?.name as string | undefined) || name || "Aluno";

      if (!userId) {
        throw new Error("Não foi possível obter o usuário. Tente novamente.");
      }

      onLogin({
        id: userId,
        name: userName,
        email: userEmail,
        role: UserRole.STUDENT,
        createdAt: data.user?.created_at || new Date().toISOString(),
      });
    } catch (e: any) {
      // Erro típico quando "Confirm email" está ligado e o aluno tenta logar sem confirmar
      const msg = e?.message || "Erro ao entrar.";
      if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("confirm")) {
        setError("Você precisa confirmar seu e-mail antes de entrar. Verifique a caixa de entrada/Spam.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    clearAlerts();

    // ⚠️ Troque aqui pela sua senha real do Admin (apenas para testar)
    const ADMIN_PASSWORD = "admin123";

    if (!adminPassword.trim()) {
      setError("Digite a senha do administrador.");
      return;
    }
    if (adminPassword !== ADMIN_PASSWORD) {
      setError("Senha de administrador incorreta.");
      return;
    }

    onLogin({
      id: "admin",
      name: "Administrador",
      email: "admin@local",
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    if (isStudent) {
      if (studentMode === "signup") await handleStudentSignup();
      else await handleStudentLogin();
    } else {
      handleAdminLogin();
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <Logo />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button
          type="button"
          onClick={() => {
            setIsStudent(true);
            setStudentMode("signup");
            clearAlerts();
          }}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd",
            background: isStudent ? "#111" : "#fff",
            color: isStudent ? "#fff" : "#111",
            cursor: "pointer",
          }}
        >
          <UserIcon size={16} style={{ marginRight: 6 }} />
          Aluno
        </button>

        <button
          type="button"
          onClick={() => {
            setIsStudent(false);
            clearAlerts();
          }}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ddd",
            background: !isStudent ? "#111" : "#fff",
            color: !isStudent ? "#fff" : "#111",
            cursor: "pointer",
          }}
        >
          <Lock size={16} style={{ marginRight: 6 }} />
          Admin
        </button>
      </div>

      {isStudent && (
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button
            type="button"
            onClick={() => {
              setStudentMode("signup");
              clearAlerts();
            }}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
              background: studentMode === "signup" ? "#f2f2f2" : "#fff",
              cursor: "pointer",
            }}
          >
            Criar conta
          </button>
          <button
            type="button"
            onClick={() => {
              setStudentMode("login");
              clearAlerts();
            }}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
              background: studentMode === "login" ? "#f2f2f2" : "#fff",
              cursor: "pointer",
            }}
          >
            Entrar
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        {isStudent && studentMode === "signup" && (
          <div>
            <label style={{ fontSize: 12, color: "#444" }}>Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </div>
        )}

        {isStudent && (
          <>
            <div>
              <label style={{ fontSize: 12, color: "#444" }}>E-mail</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={16} />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: "#444" }}>Senha</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Lock size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="mín. 6 caracteres"
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            </div>
          </>
        )}

        {!isStudent && (
          <div>
            <label style={{ fontSize: 12, color: "#444" }}>Senha do Admin</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Digite a senha"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </div>
        )}

        {error && (
          <div style={{ background: "#ffe5e5", color: "#b00020", padding: 10, borderRadius: 10 }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background: "#e7f7ee", color: "#0b6b2f", padding: 10, borderRadius: 10 }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "none",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? "Aguarde..." : isStudent ? (studentMode === "signup" ? "Criar conta" : "Entrar") : "Entrar como Admin"}
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
};

export default Login;
