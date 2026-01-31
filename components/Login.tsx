import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { User as UserIcon, Lock, ArrowRight, Mail } from 'lucide-react';
import Logo from './Logo';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isStudent, setIsStudent] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isStudent) {
      if (!name.trim() || !email.trim()) {
        setError('Por favor, preencha todos os campos.');
        return;
      }
      if (!email.includes('@')) {
        setError('Por favor, insira um e-mail válido.');
        return;
      }
      
      // Save student login to local history (simulation for Admin to see)
      const loginLog = JSON.parse(localStorage.getItem('histoMed_login_logs') || '[]');
      loginLog.push({ name, email, date: new Date().toISOString() });
      localStorage.setItem('histoMed_login_logs', JSON.stringify(loginLog));

      onLogin({
        name,
        email,
        role: UserRole.STUDENT
      });
    } else {
      if (adminPassword === 'admin') {
        onLogin({
          name: 'Administrador',
          email: 'admin@histomed.atlas',
          role: UserRole.ADMIN
        });
      } else {
        setError('Senha administrativa incorreta.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex overflow-hidden border border-slate-200">
        
        {/* Left Side - Image/Branding */}
        <div className="hidden md:flex w-1/2 bg-medical-600 p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 text-white">
            <div className="mb-6">
              <Logo className="w-20 h-20 shadow-lg rounded-3xl" />
            </div>
            <h1 className="text-3xl font-bold mb-2">HistoMed Atlas</h1>
            <p className="text-medical-100">Sua referência completa em Histologia Básica e Patologia Digital.</p>
          </div>
          
          <div className="relative z-10 text-medical-200 text-sm">
            <p>© 2024 Baseado em Junqueira & Carneiro</p>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-medical-500 opacity-50 mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-medical-400 opacity-50 mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800">Bem-vindo(a)</h2>
            <p className="text-slate-500 mt-1">Identifique-se para acessar a plataforma.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-lg mb-8">
            <button
              onClick={() => { setIsStudent(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2
                ${isStudent ? 'bg-white text-medical-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserIcon className="w-4 h-4" /> Aluno
            </button>
            <button
              onClick={() => { setIsStudent(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center justify-center gap-2
                ${!isStudent ? 'bg-white text-medical-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Lock className="w-4 h-4" /> Administrador
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isStudent ? (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Nome Completo</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: João Silva"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">E-mail Acadêmico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: joao@universidade.edu"
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-medical-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-medical-600 hover:bg-medical-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-4"
            >
              {isStudent ? 'Acessar Plataforma' : 'Entrar no Painel'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
