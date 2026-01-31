import React, { useState } from 'react';
import { TOPICS } from '../constants';
import { Topic, QuizQuestion, QuizResult, User } from '../types';
import { fetchQuizQuestions } from '../services/geminiService';
import { GraduationCap, CheckCircle, XCircle, RefreshCcw, Loader2, Trophy, AlertCircle, Info, User as UserIcon } from 'lucide-react';

interface QuizProps {
  currentUser: User;
}

const Quiz: React.FC<QuizProps> = ({ currentUser }) => {
  const [phase, setPhase] = useState<'SELECTION' | 'LOADING' | 'ACTIVE' | 'RESULT'>('SELECTION');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]); // User selected indices
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const startQuiz = async (topic: Topic) => {
    setSelectedTopic(topic);
    setPhase('LOADING');
    const qs = await fetchQuizQuestions(topic.title);
    if (qs && qs.length > 0) {
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(-1));
      setCurrentQuestionIdx(0);
      setScore(0);
      setShowExplanation(false);
      setPhase('ACTIVE');
    } else {
      alert("Erro ao gerar questões. Tente novamente.");
      setPhase('SELECTION');
    }
  };

  const handleAnswer = (optionIdx: number) => {
    if (showExplanation) return; // Prevent changing after answer

    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optionIdx;
    setAnswers(newAnswers);
    setShowExplanation(true);

    if (optionIdx === questions[currentQuestionIdx].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setShowExplanation(false);
    } else {
      setPhase('RESULT');
    }
  };

  const resetQuiz = () => {
    setPhase('SELECTION');
    setSelectedTopic(null);
    setQuestions([]);
  };

  return (
    <div className="max-w-4xl mx-auto h-full p-4 md:p-8">
      {phase === 'SELECTION' && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-medical-100 text-medical-600 mb-4">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Quiz de Histologia</h2>
            <p className="text-slate-500">Olá, <span className="font-semibold text-medical-600">{currentUser.name}</span>! Selecione um tema para iniciar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => startQuiz(topic)}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-medical-400 hover:shadow-md transition-all text-left flex flex-col group"
              >
                <span className="text-xs font-bold text-medical-600 uppercase mb-1">{topic.category}</span>
                <span className="font-medium text-slate-700 group-hover:text-medical-700">{topic.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'LOADING' && (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <Loader2 className="w-12 h-12 text-medical-500 animate-spin" />
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-800">Preparando Exame</h3>
            <p className="text-slate-500 mt-2">O professor está elaborando as questões sobre {selectedTopic?.title}...</p>
          </div>
        </div>
      )}

      {phase === 'ACTIVE' && questions.length > 0 && (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)] md:h-auto">
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Questão {currentQuestionIdx + 1} de {questions.length}
            </span>
            <span className="text-xs px-2 py-1 bg-medical-100 text-medical-700 rounded-full font-bold">
              {selectedTopic?.title}
            </span>
          </div>

          {/* Question Body */}
          <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-6 leading-relaxed">
              {questions[currentQuestionIdx].question}
            </h3>

            <div className="space-y-3">
              {questions[currentQuestionIdx].options.map((option, idx) => {
                const isSelected = answers[currentQuestionIdx] === idx;
                const isCorrect = idx === questions[currentQuestionIdx].correctAnswer;
                
                let btnClass = "border-slate-200 hover:bg-slate-50 hover:border-medical-300";
                let icon = null;

                if (showExplanation) {
                  if (isCorrect) {
                    btnClass = "bg-green-50 border-green-500 text-green-800";
                    icon = <CheckCircle className="w-5 h-5 text-green-600" />;
                  } else if (isSelected) {
                    btnClass = "bg-red-50 border-red-500 text-red-800";
                    icon = <XCircle className="w-5 h-5 text-red-600" />;
                  } else {
                    btnClass = "opacity-50 border-slate-100";
                  }
                } else if (isSelected) {
                  btnClass = "border-medical-500 bg-medical-50 text-medical-800";
                }

                return (
                  <button
                    key={idx}
                    disabled={showExplanation}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 flex items-center justify-between ${btnClass}`}
                  >
                    <span>{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation Panel */}
            {showExplanation && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg animate-fade-in">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-800 text-sm mb-1">Explicação</h4>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      {questions[currentQuestionIdx].explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
            <button
              onClick={nextQuestion}
              disabled={!showExplanation}
              className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                ${showExplanation 
                  ? 'bg-medical-600 text-white hover:bg-medical-700 shadow-md' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
            >
              {currentQuestionIdx === questions.length - 1 ? 'Finalizar Quiz' : 'Próxima Questão'}
              <ChevronRightWrapper />
            </button>
          </div>
        </div>
      )}

      {phase === 'RESULT' && (
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center space-y-6 mt-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-yellow-100 mb-2">
            <Trophy className="w-12 h-12 text-yellow-600" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Resultado</h2>
            <div className="flex items-center justify-center gap-2 mt-2 text-slate-500">
               <UserIcon className="w-4 h-4" />
               <span>Aluno: {currentUser.name}</span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{currentUser.email}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-6">
            <div className="text-sm text-slate-500 uppercase tracking-wide font-semibold">Sua Nota</div>
            <div className={`text-5xl font-bold mt-2 ${score >= 7 ? 'text-green-600' : 'text-red-500'}`}>
              {score}/{questions.length}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {score >= 7 ? 'Excelente! Você domina este assunto.' : 'Recomendamos revisar a matéria na Biblioteca.'}
            </p>
          </div>

          <button
            onClick={resetQuiz}
            className="w-full py-3 px-4 bg-medical-600 hover:bg-medical-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Novo Quiz
          </button>
        </div>
      )}
    </div>
  );
};

const ChevronRightWrapper = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default Quiz;