import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, Lock, ArrowRight, Mail } from 'lucide-react';
import Logo from './Logo';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isStudent, setIsStudent] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ======================
    // LOGIN / CADASTRO ALUNO
    // ======================
    if (isStudent) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError('Por favor, preencha todos os campos.');
        return;
      }

      if (!email.includes('@')) {
        setError('Por favor, insira um e-mail válido.');
        return;
      }

      setLoading(true);

      try {
        // 1️⃣ tenta cadastrar
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        // 2️⃣ se já existir, tenta login
        if (signUpError) {
          const msg = signUpError.message.toLowerCase();

          if (
            msg.includes('already') ||
            msg.includes('registered') ||
            msg.includes('exists')
          ) {
            const { error: signInError } =
              await supabase.auth.signInWithPassword({
                email,
                password,
              });

            if (signInError) {
              setError(signInError.message);
              setLoading(false);
              return;
            }
          } else {
            setError(signUpError.message);
            setLoading(false);
            return;
          }
        }

        // 3️⃣ sucesso
        onLogin({
          name,
          email,
          role: 'student',
        } as User);

      } catch (err: any) {
        setError(err?.message || 'Erro ao autenticar.');
      } finally {
        setLoading(false);
      }
    }

    // ======================
    // LOGIN ADMIN (LOCAL)
    // ======================
    else {
      if (adminPassword !== 'admin123') {
        setError('Senha de administrador incorreta.');
        return;
      }

      onLogin({
        name: 'Administrador',
        email: 'admin@histomed.app',
        role: 'admin',
      } as User);
    }
  };

  return (
    <div className="login-container">
      <Logo />

      <form onSubmit={handleSubmit} className="login-form">
        <h2>{isStudent ? 'Acesso do Aluno' : 'Acesso do Administrador'}</h2>

        {/* TOGGLE */}
        <div className="login-toggle">
          <button
            type="button"
            className={isStudent ? 'active' : ''}
            onClick={() => setIsStudent(true)}
          >
            Aluno
          </button>
          <button
            type="button"
            className={!isStudent ? 'active' : ''}
            onClick={() => setIsStudent(false)}
          >
            Admin
          </button>
        </div>

        {/* ALUNO */}
        {isStudent && (
          <>
            <div className="input-group">
              <UserIcon size={18} />
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <Mail size={18} />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        )}

        {/* ADMIN */}
        {!isStudent && (
          <div className="input-group">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Senha do administrador"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
            />
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
          <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
};

export default Login;
