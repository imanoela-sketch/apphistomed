import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Microscope as MicroscopeIcon } from 'lucide-react';
// A linha abaixo é o ajuste crítico: o nome deve ser 'Gemini' para bater com seu arquivo
import { analyzeImage } from '../services/Gemini';

interface AnalysisResult {
  diagnosis: string;
  details: string;
  recommendations: string;
}

export default function Microscope() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const response = await analyzeImage(image);
      // Ajuste conforme a estrutura de retorno do seu Gemini.ts
      setResult({
        diagnosis: "Análise Concluída",
        details: response,
        recommendations: "Consulte sempre um especialista para confirmação diagnóstica."
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao analisar imagem. Verifique sua chave de API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-center mb-8">
            <MicroscopeIcon className="w-12 h-12 text-blue-600 mr-4" />
            <h1 className="text-3xl font-bold text-gray-800">Microscópio Virtual IA</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div 
                className="aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {image ? (
                  <img src={image} alt="Lâmina" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Clique para carregar imagem da lâmina</p>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
              <button
                onClick={handleAnalyze}
                disabled={!image || loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:bg-gray-400 hover:bg-blue-700 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Camera className="w-5 h-5" />}
                {loading ? 'Analisando...' : 'Analisar Lâmina'}
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 min-h-[300px]">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Relatório de Análise</h2>
              {result ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-blue-700">Diagnóstico Sugerido:</h3>
                    <p className="text-gray-600">{result.diagnosis}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-700">Observações:</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{result.details}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic text-center mt-20">
                  Aguardando upload e análise...
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
