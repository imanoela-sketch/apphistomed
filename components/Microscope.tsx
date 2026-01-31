import React, { useState, useRef } from 'react';
import { Microscope as ScopeIcon, Upload, X, ScanSearch, AlertTriangle, FileImage } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { MicroscopeAnalysis } from '../types';

const Microscope: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MicroscopeAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Reset previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAnalysis = async () => {
    if (!image) return;
    setAnalyzing(true);
    const data = await analyzeImage(image);
    setResult(data);
    setAnalyzing(false);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6 p-4 md:p-8 max-w-7xl mx-auto">
      
      {/* Left Column: Input Area */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
              <ScopeIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Microscópio Virtual</h2>
              <p className="text-sm text-slate-500">IA treinada para patologia e histologia</p>
            </div>
          </div>

          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-medical-400 hover:bg-slate-50 transition-all group"
            >
              <div className="p-4 bg-slate-100 rounded-full mb-4 group-hover:bg-white group-hover:shadow-md transition-all">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-medical-500" />
              </div>
              <p className="font-medium text-slate-600">Carregar Lâmina</p>
              <p className="text-xs text-slate-400 mt-1">Clique para upload (JPEG, PNG)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black group">
              <img src={image} alt="Microscopy slide" className="w-full h-64 object-contain md:object-cover" />
              <button 
                onClick={reset}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {image && !result && (
            <button
              onClick={triggerAnalysis}
              disabled={analyzing}
              className={`w-full mt-4 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all
                ${analyzing ? 'bg-slate-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'}`}
            >
              {analyzing ? (
                <>
                  <ScanSearch className="w-5 h-5 animate-pulse" /> Analisando Estruturas...
                </>
              ) : (
                <>
                  <ScopeIcon className="w-5 h-5" /> Analisar Lâmina
                </>
              )}
            </button>
          )}
        </div>

        {/* Instructions */}
        {!result && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800 leading-relaxed">
              <strong>Nota:</strong> Esta ferramenta utiliza Inteligência Artificial para fins educacionais. 
              Sempre corrobore os achados com a literatura oficial (Junqueira & Carneiro) e orientação docente.
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Results */}
      {result && (
        <div className="flex-1 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="bg-purple-600 p-4 text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileImage className="w-5 h-5" /> Relatório de Análise
              </h3>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Diagnosis Badge */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Identificação Principal</span>
                <div className="text-xl font-bold text-purple-900 mt-1">{result.tissueType}</div>
                <div className="text-sm text-purple-700 mt-1 font-medium">{result.diagnosis}</div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  Descrição Morfológica
                </h4>
                <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                  {result.description}
                </p>
              </div>

              {/* Features List */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3">Estruturas Identificadas</h4>
                <div className="flex flex-wrap gap-2">
                  {result.features.map((feature, i) => (
                    <span key={i} className="px-3 py-1 bg-medical-50 text-medical-700 text-sm rounded-full border border-medical-100 font-medium">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Microscope;
