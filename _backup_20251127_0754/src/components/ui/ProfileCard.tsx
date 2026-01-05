import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { Button } from './Button';
import { User, ChevronDown, ChevronUp, Star, Award, Brain, Heart, Zap } from 'lucide-react';

export const curriculum = `Valdemar Junior
   
  Psicoterapeuta Junguiano, Fisioterapeuta, Educador Físico, Acupunturista e Desenvolvedor em Inteligência Artificial
   
  Há vidas que se dividem entre o visível e o invisível. A minha se constrói na travessia entre o corpo e a alma, onde o músculo fala a língua dos símbolos e o inconsciente sussurra pela respiração.
  Sou terapeuta e pesquisador das tramas que conectam movimento, emoção e sentido. Meu ofício é cuidar de pessoas — e traduzir, em linguagem humana e tecnológica, a alquimia da transformação.
   
  No consultório, a psicologia junguiana encontra a fisiologia; nos códigos, o arquétipo se converte em algoritmo.
  A escuta se expande para além da palavra: acontece também nos gestos, nas tensões musculares, nos sonhos e nas dores que o corpo insiste em lembrar.
   
  Integro psicoterapia, fisioterapia, acupuntura, movimento e inteligência artificial em um mesmo campo simbólico: a cura pela integração.
  Entre a academia e o sagrado, a ciência e o mito, sigo construindo uma prática que une análise profunda, toque consciente e tecnologia intuitiva.
   
  
  FORMAÇÃO ACADÊMICA
   
  • Mestrado em Tecnologia e Saúde – Integração entre inovação tecnológica e processos de reabilitação.
  • Graduação em Fisioterapia – Ênfase em reabilitação funcional e saúde integrativa.
  • Graduação em Educação Física / Personal Training – 21 anos de experiência em treinamento físico e performance.
  • Graduação em Inteligência Artificial (em andamento) – Aplicação de IA em saúde, psicologia e movimento humano.
  • Pós-graduação em Psicologia Analítica Junguiana (duas formações) – Foco em simbologia, arquétipos e processos de individuação.
  • Pós-graduação em Acupuntura e Medicina Tradicional Chinesa – Diagnóstico energético e integração entre corpo e emoção.
  • Pós-graduação em Farmacologia Chinesa – Estudo das fórmulas clássicas e fitoterápicos orientais.
  • Pós-graduação em Terapia Manual – Abordagens miofasciais e integração estrutural.
  • Pós-graduação em Fisioterapia em Terapia Intensiva – Ênfase em funcionalidade e reabilitação hospitalar.
  • Pós-graduação em Exercício Físico Aplicado à Reabilitação Cardíaca e Grupos Especiais – Estratégias de treinamento para pacientes com patologias crônicas.
  • Pós-graduação em Método Pilates – Cinesiologia e consciência corporal.
  • Pós-graduação em Exercício Físico Aplicado à Terceira Idade – Saúde, longevidade e vitalidade.
  • Formações complementares: Quiropraxia, Homeofito, Aurículo-acupuntura, Moxabustão, Kinesio Tape.
  • Certificação: Coach Level 1 CrossFit.
   
  
  EXPERIÊNCIA PROFISSIONAL
   
  • Psicoterapeuta Junguiano – Atendimento clínico e simbólico, integração entre inconsciente, corpo e cotidiano.
  • Fisioterapeuta e Quiropraxista – 21 anos de prática clínica, com foco em reequilíbrio postural, dor e movimento.
  • Educador Físico / Personal Trainer – Treinamentos individualizados, CrossFit e condicionamento terapêutico.
  • Fisiologista e Preparador Físico de Futebol – 3 anos atuando com atletas de alta performance.
  • Professor de Ensino Superior – 6 anos de docência nas áreas de saúde, biomecânica e psicologia aplicada ao corpo.
  • Atuação Hospitalar – 3 anos de experiência em reabilitação cardiorrespiratória e funcionalidade.
  • Desenvolvedor Full-Stack e Pesquisador em IA – 7 anos de desenvolvimento de aplicativos e dashboards integrando dados fisiológicos e psicológicos.
   
  
  COMPETÊNCIAS INTEGRATIVAS
   
  • Integração corpo-mente e leitura simbólica das patologias.
  • Criação de protocolos terapêuticos personalizados.
  • Desenvolvimento de sistemas inteligentes para análise de prontidão, recuperação e autoconhecimento.
  • Comunicação empática e didática em ambientes acadêmicos e clínicos.
  • Atuação interdisciplinar em contextos de saúde, espiritualidade e tecnologia.
   
  
  INTERESSES E CAMPO DE PESQUISA
   
  • Psicologia Analítica, Mitologia e Alquimia Interior
  • Neurofisiologia e IA aplicada à terapia e reabilitação
  • Tarot Terapêutico e Numerologia simbólica
  • Meditação, espiritualidade e estados ampliados de consciência
  • Filosofia, Cinema e Narrativas da alma
   
  
  ASSINATURA PROFISSIONAL
   
  Valdemar Junior
  Psicoterapeuta Junguiano • Fisioterapeuta • Educador Físico • Acupunturista
  Mestre em Tecnologia e Saúde • Desenvolvedor em Inteligência Artificial`;

interface ProfileCardProps {
  className?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Removido export duplicado dentro do componente
  const curriculumLocal = curriculum;

  return (
    <Card className={`bg-[#0b1b3a] border-blue-900 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          {/* Foto de perfil circular */}
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-1">
              <div className="w-full h-full rounded-full bg-[#0b1b3a] flex items-center justify-center overflow-hidden border border-blue-900">
                {/* Placeholder para a foto - você pode substituir por uma imagem real */}
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            {/* Badge de status */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#0b1b3a] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          {/* Nome e título */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Valdemar Junior</span>
              <Star className="h-4 w-4 text-yellow-400" />
            </h3>
            <p className="text-sm text-gray-300">Gestor de Dados Humanos</p>
            <div className="flex items-center space-x-2 mt-1">
              <Brain className="h-3 w-3 text-purple-400" />
              <Heart className="h-3 w-3 text-red-400" />
              <Zap className="h-3 w-3 text-yellow-400" />
              <Award className="h-3 w-3 text-blue-400" />
            </div>
          </div>
          
          {/* Botão de expandir */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="bg-[#0b1b3a] rounded-lg p-4 max-h-96 overflow-y-auto border border-blue-900">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
              {curriculumLocal}
            </pre>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ProfileCard;