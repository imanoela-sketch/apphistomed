import React, { useState, useEffect } from 'react';
import { Users, Clock, Mail, Trash2, Search, Download } from 'lucide-react';
import { StudentLog } from '../types';

const StudentLogs: React.FC = () => {
  const [logs, setLogs] = useState<StudentLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadLogs = () => {
      try {
        const savedLogs = localStorage.getItem('histoMed_login_logs');
        if (savedLogs) {
          // Parse and sort by date (newest first)
          const parsedLogs: StudentLog[] = JSON.parse(savedLogs);
          setLogs(parsedLogs.reverse());
        }
      } catch (e) {
        console.error("Error loading logs", e);
      }
    };
    loadLogs();
  }, []);

  const handleClearLogs = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico de acesso?')) {
      localStorage.removeItem('histoMed_login_logs');
      setLogs([]);
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Data,Nome,Email\n"
      + logs.map(log => `${new Date(log.date).toLocaleString()},${log.name},${log.email}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "historico_acessos_histomed.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => 
    log.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-8 h-8 text-medical-600" />
            Registro de Alunos
          </h2>
          <p className="text-slate-500 mt-1">Histórico de acessos à plataforma.</p>
        </div>

        <div className="flex gap-2">
           <button 
            onClick={handleExport}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-medical-600 bg-medical-50 hover:bg-medical-100 rounded-lg transition-colors border border-medical-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Exportar CSV</span>
          </button>
          <button 
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-medium">Limpar Histórico</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Buscar aluno por nome ou e-mail..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-medical-500 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <Users className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-medium text-slate-600">Nenhum registro encontrado</h3>
            <p className="mt-2">O histórico de acessos está vazio.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Aluno</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-sm uppercase tracking-wider">Data de Acesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-medical-100 flex items-center justify-center text-medical-700 font-bold text-xs">
                          {log.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{log.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {log.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(log.date).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && searchTerm && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      Nenhum aluno encontrado para "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLogs;
