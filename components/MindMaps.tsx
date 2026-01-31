import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Trash2, X, Eye, UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { MindMapItem, User, UserRole } from '../types';

interface MindMapsProps {
  currentUser: User;
}

// Helper function to resize and compress images
const processImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; // Limit width to 1024px
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.6 quality to save space
          resolve(canvas.toDataURL('image/jpeg', 0.6)); 
        } else {
          reject(new Error("Canvas context failed"));
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const MindMaps: React.FC<MindMapsProps> = ({ currentUser }) => {
  // Check if current user is admin
  const isAdmin = currentUser.role === UserRole.ADMIN;
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Helper to load from storage
  const loadMapsFromStorage = (): MindMapItem[] => {
    try {
      const saved = localStorage.getItem('histoMed_mindmaps');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Reconstruct Date objects from strings
        return parsed.map((item: any) => ({
          ...item,
          dateAdded: new Date(item.dateAdded)
        }));
      }
      return [];
    } catch (e) {
      console.error("Failed to load maps from storage", e);
      return [];
    }
  };

  const [maps, setMaps] = useState<MindMapItem[]>(loadMapsFromStorage);
  const [viewingMap, setViewingMap] = useState<MindMapItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Sync across tabs/windows in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'histoMed_mindmaps') {
        setMaps(loadMapsFromStorage());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 2. Persist maps to LocalStorage whenever they change (triggered by Admin actions)
  useEffect(() => {
    // We only want to write to storage if we are an admin and the state has content (or is intentionally empty).
    // To avoid wiping storage on a failed load, we could add checks, but loadMapsFromStorage handles errors by returning [].
    // If maps is updated, we save.
    if (isAdmin) {
       try {
        const serialized = JSON.stringify(maps);
        localStorage.setItem('histoMed_mindmaps', serialized);
        setErrorMsg(null);
      } catch (e) {
        console.error("Storage error:", e);
        setErrorMsg("Espaço insuficiente no navegador! A imagem é muito grande ou há muitos mapas salvos. Tente excluir itens antigos.");
      }
    }
  }, [maps, isAdmin]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrorMsg(null);
    
    if (file && file.type.startsWith('image/')) {
      setIsProcessing(true);
      try {
        // Process image (Resize & Compress)
        const base64Url = await processImage(file);

        const newMap: MindMapItem = {
          id: Date.now().toString(),
          title: newTitle || file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          url: base64Url,
          dateAdded: new Date()
        };

        setMaps(prevMaps => [newMap, ...prevMaps]);
        setNewTitle('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

      } catch (error) {
        console.error("Error processing file", error);
        setErrorMsg("Erro ao processar a imagem. Tente um arquivo menor ou outro formato.");
      } finally {
        setIsProcessing(false);
      }
    } else if (file) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG).');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este mapa mental? O item será removido para todos os alunos.')) {
      setMaps(prevMaps => prevMaps.filter(m => m.id !== id));
      setErrorMsg(null); // Clear any previous storage errors as we are freeing space
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Header & Admin Controls */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-8 h-8 text-medical-600" />
            Mapas Mentais
          </h2>
          <p className="text-slate-500 mt-1">Galeria de esquemas visuais e resumos.</p>
        </div>

        <div>
          {isAdmin ? (
            <div className="flex items-center gap-2 px-4 py-2 text-green-600 bg-green-50 rounded-lg border border-green-200">
              <Unlock className="w-4 h-4" />
              <span className="text-sm font-medium">Modo Edição (Admin)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 text-slate-400 bg-slate-50 rounded-lg border border-slate-200" title="Apenas administradores podem editar">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Modo Leitura</span>
            </div>
          )}
        </div>
      </div>

      {/* Admin Upload Area - Only visible if Global Admin */}
      {isAdmin && (
        <div className="mb-8 p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl animate-fade-in transition-all">
          <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <UploadCloud className="w-5 h-5" /> Adicionar Novo Mapa
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm text-slate-500 mb-1 block">Título do Mapa</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ex: Esquema Tecido Epitelial"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:outline-none"
                disabled={isProcessing}
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm text-slate-500 mb-1 block">Arquivo de Imagem (PNG/JPG)</label>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-medical-50 file:text-medical-700
                  hover:file:bg-medical-100 disabled:opacity-50"
              />
            </div>
          </div>
          
          {isProcessing && (
             <div className="mt-4 text-sm text-slate-500 flex items-center gap-2">
               <div className="w-4 h-4 border-2 border-medical-500 border-t-transparent rounded-full animate-spin"></div>
               Processando e comprimindo imagem...
             </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 animate-fade-in border border-red-200">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{errorMsg}</span>
            </div>
          )}
          
          {showSuccess && !errorMsg && (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2 animate-fade-in border border-green-200">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Mapa mental salvo com sucesso! Os alunos já podem visualizar.</span>
            </div>
          )}
        </div>
      )}

      {/* Maps Grid */}
      {maps.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 border-2 border-dashed border-slate-200 rounded-xl">
          <ImageIcon className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-xl font-medium text-slate-600">Nenhum mapa mental disponível</h3>
          {isAdmin ? (
            <p className="mt-2">Utilize o painel acima para adicionar imagens.</p>
          ) : (
            <div className="mt-2 flex flex-col items-center gap-2">
              <p>Aguarde o professor adicionar o material de estudo.</p>
              <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                <AlertCircle className="w-4 h-4" />
                <span>O banco de dados está vazio no momento.</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in pb-10">
          {maps.map(map => (
            <div key={map.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden h-[280px]">
              <div 
                className="h-48 bg-slate-100 relative cursor-pointer overflow-hidden bg-pattern-grid"
                onClick={() => setViewingMap(map)}
              >
                 {/* Image Thumbnail */}
                 <img src={map.url} alt={map.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                 
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <span className="bg-white/90 text-slate-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm flex items-center gap-2 backdrop-blur-sm">
                    <Eye className="w-4 h-4" /> Ampliar
                  </span>
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                <h4 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-tight mb-2" title={map.title}>{map.title}</h4>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] text-slate-400">
                    {map.dateAdded.toLocaleDateString()}
                  </span>
                  
                  {isAdmin && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(map.id);
                      }}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingMap && (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-50 p-4 md:p-8 backdrop-blur-sm" onClick={() => setViewingMap(null)}>
          <div className="w-full h-full max-w-6xl flex flex-col" onClick={e => e.stopPropagation()}>
            
            <div className="flex justify-between items-center mb-4 text-white">
              <h3 className="font-bold text-lg">{viewingMap.title}</h3>
              <button 
                onClick={() => setViewingMap(null)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-black/50 shadow-2xl border border-white/10 relative">
               <img 
                 src={viewingMap.url} 
                 className="max-w-full max-h-full object-contain" 
                 alt={viewingMap.title}
               />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMaps;
