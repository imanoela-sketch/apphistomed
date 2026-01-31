import React, { useState, useEffect } from 'react';
import { Book, GraduationCap, Microscope, Menu, FileText, LogOut, User as UserIcon, Users, Share2 } from 'lucide-react';
import Library from './components/Library';
import Quiz from './components/Quiz';
import VirtualMicroscope from './components/Microscope';
import MindMaps from './components/MindMaps';
import StudentLogs from './components/StudentLogs';
import Login from './components/Login';
import Logo from './components/Logo';
import ShareModal from './components/ShareModal';
import { AppTab, User, UserRole } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.LIBRARY);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('histoMed_user_session');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('histoMed_user_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('histoMed_user_session');
    setActiveTab(AppTab.LIBRARY);
  };

  const renderContent = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case AppTab.LIBRARY:
        return <Library />;
      case AppTab.QUIZ:
        return <Quiz currentUser={currentUser} />;
      case AppTab.MICROSCOPE:
        return <VirtualMicroscope />;
      case AppTab.MINDMAP:
        return <MindMaps currentUser={currentUser} />;
      case AppTab.STUDENT_LOGS:
        return <StudentLogs />;
      default:
        return <Library />;
    }
  };

  const NavItem = ({ tab, label, icon: Icon }: { tab: AppTab; label: string; icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full md:w-auto md:justify-center whitespace-nowrap
        ${activeTab === tab 
          ? 'bg-medical-600 text-white shadow-md shadow-medical-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-medical-600'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Logo className="w-10 h-10 shadow-sm" />
              <h1 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">HistoMed <span className="text-medical-500 font-normal">Atlas</span></h1>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight sm:hidden">HistoMed</h1>
            </div>
            
            {/* User Profile Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 ml-4">
              <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-green-500' : 'bg-medical-500'}`}></div>
              <span className="text-xs font-semibold text-slate-600 max-w-[150px] truncate">
                {currentUser.name} {isAdmin ? '(Admin)' : ''}
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar">
            <NavItem tab={AppTab.LIBRARY} label="Biblioteca" icon={Book} />
            <NavItem tab={AppTab.QUIZ} label="Quiz" icon={GraduationCap} />
            <NavItem tab={AppTab.MICROSCOPE} label="Microscópio" icon={Microscope} />
            <NavItem tab={AppTab.MINDMAP} label="Mapas Mentais" icon={FileText} />
            
            {isAdmin && (
              <NavItem tab={AppTab.STUDENT_LOGS} label="Alunos" icon={Users} />
            )}
            
            <div className="w-px h-6 bg-slate-200 mx-2"></div>

            <button 
              onClick={() => setShareModalOpen(true)}
              className="p-2 text-medical-600 hover:bg-medical-50 rounded-lg transition-colors"
              title="Compartilhar App com Alunos"
            >
              <Share2 className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden p-4 bg-white border-t border-slate-100 space-y-2 shadow-lg absolute w-full z-40 left-0 right-0">
             <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${isAdmin ? 'bg-green-500' : 'bg-medical-500'}`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="font-bold text-slate-800 truncate">{currentUser.name}</div>
                  <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                </div>
             </div>

            <NavItem tab={AppTab.LIBRARY} label="Biblioteca" icon={Book} />
            <NavItem tab={AppTab.QUIZ} label="Quiz" icon={GraduationCap} />
            <NavItem tab={AppTab.MICROSCOPE} label="Microscópio Virtual" icon={Microscope} />
            <NavItem tab={AppTab.MINDMAP} label="Mapas Mentais" icon={FileText} />

            {isAdmin && (
               <NavItem tab={AppTab.STUDENT_LOGS} label="Registro de Alunos" icon={Users} />
            )}
            
            <button
                onClick={() => {
                  setShareModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-medical-600 hover:bg-medical-50"
              >
                <Share2 className="w-5 h-5" />
                <span className="font-medium">Compartilhar App</span>
            </button>

            <div className="border-t border-slate-100 my-2 pt-2">
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair da Conta</span>
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full w-full absolute inset-0 p-2 md:p-6 overflow-y-auto">
           {renderContent()}
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} />
    </div>
  );
};

export default App;
