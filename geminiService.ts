import { GoogleGenAI, Type } from "@google/genai";
import { 
  SYSTEM_INSTRUCTION_LIBRARY, 
  SYSTEM_INSTRUCTION_QUIZ, 
  SYSTEM_INSTRUCTION_MICROSCOPE 
} from "../constants";
import { QuizQuestion, MicroscopeAnalysis } from "../types";

// Helper to ensure API Key exists
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found inside environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchLibraryContent = async (topicTitle: string): Promise<string> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere um resumo detalhado sobre: ${topicTitle}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_LIBRARY,
        temperature: 0.3, // Low temperature for factual accuracy
      }
    });
    return response.text || "Erro ao gerar conteúdo.";
  } catch (error) {
    console.error("Error fetching library content:", error);
    return "Não foi possível carregar o conteúdo da biblioteca. Verifique sua chave de API.";
  }
};

export const fetchQuizQuestions = async (topicTitle: string): Promise<QuizQuestion[]> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tema: ${topicTitle}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_QUIZ,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
              explanation: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from API");
    return JSON.parse(text) as QuizQuestion[];

  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

export const analyzeImage = async (base64Image: string): Promise<MicroscopeAnalysis | null> => {
  try {
    const ai = getAIClient();
    // Clean base64 string if it has prefix
    const data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data } },
          { text: "Analise esta lâmina histológica." }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_MICROSCOPE,
        // responseMimeType: "application/json", // Not supported for gemini-2.5-flash-image
        temperature: 0.2,
      }
    });

    let text = response.text;
    if (!text) throw new Error("No analysis returned");
    
    // Cleanup markdown code blocks if present
    text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    return JSON.parse(text) as MicroscopeAnalysis;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return null;
  }
};