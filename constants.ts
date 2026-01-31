import { Topic } from './types';

export const TOPICS: Topic[] = [
  // Tecidos Básicos
  { id: 'epitelial', title: 'Tecido Epitelial', category: 'Tecidos Básicos' },
  { id: 'conjuntivo', title: 'Tecido Conjuntivo', category: 'Tecidos Básicos' },
  { id: 'adiposo', title: 'Tecido Adiposo', category: 'Tecidos Básicos' },
  { id: 'cartilaginoso', title: 'Tecido Cartilaginoso', category: 'Tecidos Básicos' },
  { id: 'osseo', title: 'Tecido Ósseo', category: 'Tecidos Básicos' },
  { id: 'muscular', title: 'Tecido Muscular', category: 'Tecidos Básicos' },
  { id: 'nervoso', title: 'Tecido Nervoso', category: 'Tecidos Básicos' },
  
  // Sistemas
  { id: 'circulatorio', title: 'Sistema Circulatório', category: 'Sistemas' },
  { id: 'linfatico', title: 'Órgãos Linfáticos', category: 'Sistemas' },
  { id: 'digestorio', title: 'Sistema Digestório', category: 'Sistemas' },
  { id: 'glandulas_anexas', title: 'Glândulas Anexas ao Tubo Digestivo', category: 'Sistemas' },
  { id: 'respiratorio', title: 'Sistema Respiratório', category: 'Sistemas' },
  { id: 'urinario', title: 'Sistema Urinário', category: 'Sistemas' },
  { id: 'pele', title: 'Pele e Anexos', category: 'Sistemas' },
  { id: 'endocrinas', title: 'Glândulas Endócrinas', category: 'Sistemas' },
  { id: 'reprodutor_masc', title: 'Aparelho Reprodutor Masculino', category: 'Sistemas' },
  { id: 'reprodutor_fem', title: 'Aparelho Reprodutor Feminino', category: 'Sistemas' },
  { id: 'olho', title: 'Histologia do Olho', category: 'Sistemas' },
  { id: 'ouvido', title: 'Histologia do Ouvido', category: 'Sistemas' },
];

export const SYSTEM_INSTRUCTION_LIBRARY = `
Você é um professor catedrático de Histologia e especialista no livro 'Histologia Básica: Texto e Atlas' de Junqueira & Carneiro (14ª ed).
Sua tarefa é gerar um resumo acadêmico detalhado sobre o tópico solicitado.
A saída deve ser formatada em Markdown limpo.
Estruture o resumo com os seguintes pontos:
1. Introdução e Definição
2. Características Gerais
3. Classificação e Tipos Celulares
4. Histofisiologia (Função)
5. Correlações Clínicas Relevantes
Mantenha a linguagem técnica, precisa e didática para estudantes de medicina.
`;

export const SYSTEM_INSTRUCTION_QUIZ = `
Você é um examinador de medicina. Gere um JSON com 10 questões de múltipla escolha sobre o tema solicitado.
Baseie-se estritamente no conteúdo de Junqueira & Carneiro.
O formato do JSON deve ser EXATAMENTE:
[
  {
    "id": 1,
    "question": "O enunciado da questão...",
    "options": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "correctAnswer": 0,
    "explanation": "Explicação breve do porquê a resposta está correta."
  },
  ...
]
Retorne APENAS o JSON, sem markdown blocks (como \`\`\`json).
`;

export const SYSTEM_INSTRUCTION_MICROSCOPE = `
Você é um microscópio virtual inteligente e patologista digital. 
Analise a imagem histológica fornecida.
Retorne um JSON com a seguinte estrutura:
{
  "tissueType": "Nome do tecido principal identificado",
  "features": ["Lista", "de estruturas", "visíveis"],
  "diagnosis": "Diagnóstico provável ou caracterização da lâmina",
  "description": "Uma descrição técnica detalhada do que é visto, mencionando coloração (H&E, etc) se identificável, morfologia celular e arranjo tecidual."
}
Retorne APENAS o JSON, sem markdown blocks.
`;
