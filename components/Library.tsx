import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Loader2, Info } from 'lucide-react';
import { TOPICS } from '../constants';
import { Topic } from '../types';
import { fetchLibraryContent } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

const Library: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState<Record<string, string>>({});

  const handleSelectTopic = async (topic: Topic) => {
    setSelectedTopic(topic);
    if (cache[topic.id]) {
      setContent(cache[topic.id]);
    } else {
      setLoading(true);
      const text = await fetchLibraryContent(topic.title);
      setCache(prev => ({ ...prev, [topic.id]: text }));
      setContent(text);
      setLoading(false);
    }
  };

  // Group topics by category
  const categories = Array.from(new Set(TOPICS.map(t => t.category)));

  return (
    <div className="flex h-full flex-col md:flex-row bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Sidebar List */}
      <div className={`w-full md:w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto flex-shrink-0 ${selectedTopic ? 'hidden md:block' : 'block'}`}>
        <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-medical-600" />
            Sumário
          </h2>
          <p className="text-xs text-slate-500 mt-1">Junqueira & Carneiro (14ª Ed)</p>
        </div>
        
        <div className="p-2 space-y-4">
          {categories.map(cat => (
            <div key={cat}>
              <h3 className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">{cat}</h3>
              <div className="space-y-1">
                {TOPICS.filter(t => t.category === cat).map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => handleSelectTopic(topic)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between group
                      ${selectedTopic?.id === topic.id 
                        ? 'bg-medical-100 text-medical-800 shadow-sm' 
                        : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                  >
                    {topic.title}
                    <ChevronRight className={`w-4 h-4 transition-opacity ${selectedTopic?.id === topic.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 overflow-y-auto bg-white relative ${!selectedTopic ? 'hidden md:block' : 'block'}`}>
        {selectedTopic ? (
          <>
             {/* Mobile Back Button */}
            <div className="md:hidden sticky top-0 bg-white border-b border-slate-100 p-3 flex items-center shadow-sm z-20">
              <button onClick={() => setSelectedTopic(null)} className="text-sm text-medical-600 font-medium flex items-center">
                ← Voltar para o Sumário
              </button>
            </div>

            <div className="p-6 md:p-10 max-w-4xl mx-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="w-10 h-10 text-medical-500 animate-spin" />
                  <p className="text-slate-500 animate-pulse">Consultando a literatura...</p>
                </div>
              ) : (
                <article className="prose prose-slate prose-headings:text-medical-900 prose-a:text-medical-600 max-w-none">
                  <h1 className="text-3xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
                    {selectedTopic.title}
                  </h1>
                  <ReactMarkdown>{content}</ReactMarkdown>
                </article>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-medium text-slate-600">Biblioteca de Histologia</h3>
            <p className="mt-2 max-w-sm">Selecione um tópico no menu lateral para visualizar o resumo detalhado baseado na literatura médica.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
