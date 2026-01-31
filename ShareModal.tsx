import React from 'react';
import { X, Copy, Check, Smartphone, Globe, ExternalLink, HelpCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  
  if (!isOpen) return null;

  const currentUrl = window.location.href;
  // Using a public API to generate QR Code for the current URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}&color=0284c7`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLocal = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
        
        <div className="bg-medical-600 p-5 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6" />
            <h3 className="font-bold text-xl">Compartilhar App</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Main Share Area */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-white p-3 rounded-2xl border-4 border-slate-50 shadow-inner mb-4">
              <img src={qrCodeUrl} alt="QR Code para acesso rápido" className="w-48 h-48" />
            </div>
            <p className="text-slate-600 text-sm font-medium">
              Aponte a câmera do celular para abrir o <span className="text-medical-600">HistoMed Atlas</span>
            </p>
          </div>

          {/* Link Display */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Link Direto</label>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={currentUrl} 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 font-mono focus:outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className={`px-4 py-3 rounded-xl border transition-all flex items-center justify-center gap-2
                    ${copied 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-medical-600 border-medical-600 text-white hover:bg-medical-700 shadow-md'}`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  <span className="text-sm font-bold">{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Warning / Help Section */}
            {isLocal ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Ambiente Local Detectado</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Este link só funciona no seu computador. Para os alunos acessarem de qualquer lugar, você precisa publicar o app.
                    </p>
                    <button 
                      onClick={() => setShowHelp(!showHelp)}
                      className="text-xs font-bold text-amber-900 underline mt-2 flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3" /> Como publicar grátis?
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700">
                  O aplicativo está online! Este link e QR Code podem ser enviados para qualquer aluno.
                </p>
              </div>
            )}

            {showHelp && (
              <div className="bg-slate-800 p-4 rounded-xl text-white animate-fade-in">
                <h4 className="font-bold text-sm mb-2">3 Passos para colocar online:</h4>
                <ol className="text-xs space-y-2 list-decimal list-inside text-slate-300">
                  <li>Baixe o código deste projeto.</li>
                  <li>Crie uma conta gratuita em <span className="text-medical-300 font-bold">Vercel.com</span> ou <span className="text-medical-300 font-bold">Netlify.com</span>.</li>
                  <li>Arraste a pasta do projeto para lá e eles te darão o link oficial em segundos!</li>
                </ol>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium">
            HistoMed Atlas • Ferramenta de Compartilhamento Educacional
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;