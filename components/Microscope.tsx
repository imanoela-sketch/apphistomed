import React, { useRef, useState } from "react";
import { Camera, Upload, Loader2, Microscope as MicroscopeIcon } from "lucide-react";

// Import correto (sem .ts e com caminho certo)
import { analyzeImage } from "../services/gemini";

interface AnalysisResult {
  diagnosis: string;
  details: string;
  recommendations: string;
}

export default function Microscope() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    // ✅ Correção importante: só analisa se tiver imagem
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const responseText = await analyzeImage(image);

      setResult({
        diagnosis: "Análise concluída",
        details: responseText,
        recommendations:
          "Use este resultado como apoio ao estudo. Para fins clínicos, confirme sempre com fontes e supervisão.",
      });
    } catch (err: any) {
      setError(err?.message || "Erro ao analisar a imagem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MicroscopeIcon />
        <h2 style={{ margin: 0 }}>Microscópio Virtual</h2>
      </div>

      <p>Envie uma foto da lâmina. O sistema descreve a lâmina e sugere estruturas.</p>

      <div
        style={{
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
          display: "grid",
          gap: 12,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Upload size={18} />
            Enviar imagem
          </button>

          <button
            onClick={handleAnalyze}
            disabled={!image || loading}
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <Camera size={18} />}
            {loading ? "Analisando..." : "Analisar lâmina"}
          </button>
        </div>

        {error && (
          <div style={{ padding: 12, border: "1px solid #f2b8b5", borderRadius: 10, background: "#fff5f5" }}>
            <strong>Erro:</strong> {error}
          </div>
        )}

        {image && (
          <div style={{ display: "grid", gap: 8 }}>
            <strong>Pré-visualização</strong>
            <img
              src={image}
              alt="Lâmina enviada"
              style={{
                width: "100%",
                maxHeight: 420,
                objectFit: "contain",
                border: "1px solid #eee",
                borderRadius: 12,
              }}
            />
          </div>
        )}

        {result && (
          <div style={{ padding: 16, border: "1px solid #d7f0db", borderRadius: 12, background: "#f6fffa" }}>
            <h3 style={{ marginTop: 0 }}>{result.diagnosis}</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{result.details}</p>
            <p>
              <strong>Recomendação:</strong> {result.recommendations}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
