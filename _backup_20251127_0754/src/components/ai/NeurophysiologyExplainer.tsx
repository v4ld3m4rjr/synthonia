// [AI Generated] Data: 19/01/2025
// Descrição: Componente de IA para explicações neurofisiológicas das variáveis
// Gerado por: Cursor AI
// Versão: React 18.3.1
// AI_GENERATED_CODE_START
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Brain, Lightbulb, Sparkles } from 'lucide-react';

interface MetricExplanation {
  metric: string;
  value: number;
  neurophysiology: string;
  implications: string;
  recommendations: string;
}

interface NeurophysiologyExplainerProps {
  metrics: {
    [key: string]: number;
  };
  className?: string;
}

const NeurophysiologyExplainer: React.FC<NeurophysiologyExplainerProps> = ({
  metrics,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const getMetricExplanation = (metric: string, value: number): MetricExplanation => {
    const explanations: { [key: string]: (value: number) => MetricExplanation } = {
      atl: (val) => ({
        metric: "ATL (Acute Training Load)",
        value: val,
        neurophysiology: `A ATL representa a carga de treinamento aguda dos últimos 7 dias. Neurologicamente, valores elevados (>${Math.round(val * 1.2)}) indicam alta ativação do sistema nervoso simpático, com aumento da liberação de catecolaminas (adrenalina/noradrenalina) e cortisol. Isso resulta em maior demanda energética celular e estresse oxidativo.`,
        implications: val > 150 ? 
          "Valor alto indica sobrecarga do sistema nervoso autônomo. Pode haver fadiga central, diminuição da variabilidade da frequência cardíaca e comprometimento da função imunológica." :
          val < 50 ?
          "Valor baixo sugere destreinamento ou recuperação adequada. O sistema nervoso parassimpático está predominante, favorecendo processos anabólicos." :
          "Valor moderado indica equilíbrio entre estresse e recuperação, com ativação controlada do eixo hipotálamo-hipófise-adrenal.",
        recommendations: val > 150 ?
          "Reduza a intensidade por 2-3 dias. Priorize sono (8+ horas), hidratação e técnicas de relaxamento para reequilibrar o sistema nervoso autônomo." :
          val < 50 ?
          "Considere aumentar gradualmente a carga. Mantenha consistência para estimular adaptações neurais positivas." :
          "Continue o padrão atual. Monitore sinais de fadiga e ajuste conforme necessário."
      }),
      
      ctl: (val) => ({
        metric: "CTL (Chronic Training Load)",
        value: val,
        neurophysiology: `A CTL reflete adaptações neuroplásticas de longo prazo (28 dias). Valores adequados (${Math.round(val * 0.8)}-${Math.round(val * 1.2)}) indicam remodelação sináptica eficiente, melhora na condução neural e otimização das vias metabólicas aeróbicas. O sistema nervoso central desenvolve maior eficiência na coordenação motora.`,
        implications: val > 100 ?
          "Alto nível de fitness neurológico. Adaptações incluem maior densidade mitocondrial, melhora na captação de oxigênio e eficiência neuromuscular aprimorada." :
          val < 30 ?
          "Baixo condicionamento neural. Pode haver perda de adaptações, redução da eficiência mitocondrial e declínio na coordenação neuromuscular." :
          "Nível moderado de adaptação. Sistema nervoso em processo de adaptação com melhorias graduais na eficiência neural.",
        recommendations: val > 100 ?
          "Mantenha a consistência. Varie estímulos para evitar platôs neurais. Inclua trabalho técnico para otimizar padrões motores." :
          val < 30 ?
          "Aumente progressivamente a carga. Foque em exercícios de coordenação e técnica para estimular neuroplasticidade." :
          "Continue o desenvolvimento gradual. Monitore progressão e ajuste estímulos conforme adaptações neurais."
      }),

      tsb: (val) => ({
        metric: "TSB (Training Stress Balance)",
        value: val,
        neurophysiology: `O TSB indica o equilíbrio entre fadiga e fitness. Valores positivos (>${Math.abs(val)}) sugerem predominância parassimpática com maior variabilidade da FC, melhor recuperação do SNC e otimização da síntese proteica. Valores negativos indicam dominância simpática com elevação do cortisol e possível supressão imunológica.`,
        implications: val > 10 ?
          "Sistema nervoso bem recuperado. Alta variabilidade da frequência cardíaca, baixos níveis de cortisol e ótima função do sistema imunológico." :
          val < -10 ?
          "Fadiga acumulada significativa. Possível elevação crônica do cortisol, redução da variabilidade da FC e comprometimento da função imunológica." :
          "Equilíbrio adequado entre estresse e recuperação. Sistema nervoso autônomo em homeostase relativa.",
        recommendations: val > 10 ?
          "Momento ideal para treinos intensos. Aproveite a janela de supercompensação neural para estímulos de alta qualidade." :
          val < -10 ?
          "Priorize recuperação ativa. Técnicas de respiração, meditação e sono de qualidade para reequilibrar o sistema nervoso." :
          "Mantenha o padrão atual. Monitore sinais subjetivos de fadiga e ajuste conforme necessário."
      }),

      sleep_quality: (val) => ({
        metric: "Qualidade do Sono",
        value: val,
        neurophysiology: `A qualidade do sono reflete a eficiência dos ciclos de sono REM e NREM. Valores altos (${Math.round(val)}/10) indicam adequada liberação de hormônio do crescimento, consolidação da memória no hipocampo e limpeza de metabólitos cerebrais pelo sistema glinfático. O sono de qualidade otimiza a neuroplasticidade e a recuperação neural.`,
        implications: val >= 8 ?
          "Excelente recuperação neural. Ótima consolidação da memória, síntese proteica eficiente e limpeza de toxinas cerebrais." :
          val <= 4 ?
          "Recuperação neural comprometida. Possível acúmulo de adenosina, redução da neuroplasticidade e comprometimento cognitivo." :
          "Recuperação neural moderada. Alguns processos de restauração podem estar subótimos.",
        recommendations: val >= 8 ?
          "Mantenha a rotina de sono. Continue priorizando higiene do sono para sustentar a qualidade neural." :
          val <= 4 ?
          "Melhore urgentemente a higiene do sono. Evite telas 2h antes de dormir, mantenha ambiente fresco (18-20°C) e escuro." :
          "Otimize gradualmente o sono. Estabeleça rotina consistente e monitore fatores que afetam a qualidade."
      }),

      hrv: (val) => ({
        metric: "Variabilidade da Frequência Cardíaca (HRV)",
        value: val,
        neurophysiology: `A HRV reflete o equilíbrio do sistema nervoso autônomo. Valores elevados (>${Math.round(val * 1.1)}) indicam predominância parassimpática com maior atividade do nervo vago, melhor regulação da pressão arterial e otimização da variabilidade R-R. Isso sugere sistema nervoso resiliente e bem adaptado.`,
        implications: val > 50 ?
          "Excelente função autonômica. Sistema nervoso parassimpático dominante, indicando boa recuperação e adaptação ao estresse." :
          val < 20 ?
          "Possível fadiga do sistema nervoso autônomo. Dominância simpática pode indicar overreaching ou estresse crônico." :
          "Função autonômica moderada. Sistema nervoso em equilíbrio relativo entre simpático e parassimpático.",
        recommendations: val > 50 ?
          "Sistema bem adaptado. Pode tolerar cargas de treino mais intensas com boa recuperação." :
          val < 20 ?
          "Priorize técnicas de ativação parassimpática: respiração diafragmática, meditação e redução de estressores." :
          "Monitore tendências. Mantenha práticas de recuperação ativa e gestão de estresse."
      }),

      stress_level: (val) => ({
        metric: "Nível de Estresse",
        value: val,
        neurophysiology: `O estresse ativa o eixo hipotálamo-hipófise-adrenal (HPA). Níveis elevados (${Math.round(val)}/10) resultam em liberação crônica de cortisol, que pode suprimir a neuroplasticidade no hipocampo, reduzir a síntese de BDNF (fator neurotrófico) e comprometer a função imunológica através da modulação de citocinas pró-inflamatórias.`,
        implications: val >= 8 ?
          "Estresse crônico elevado. Possível supressão da neuroplasticidade, comprometimento da memória e função imunológica reduzida." :
          val <= 3 ?
          "Baixo estresse percebido. Sistema nervoso em estado de relaxamento, favorecendo processos de recuperação e adaptação." :
          "Nível moderado de estresse. Sistema nervoso gerenciando adequadamente as demandas.",
        recommendations: val >= 8 ?
          "Implemente técnicas de redução de estresse: mindfulness, exercícios de respiração e atividades relaxantes." :
          val <= 3 ?
          "Continue as práticas atuais de gestão de estresse. Mantenha equilíbrio entre desafio e recuperação." :
          "Monitore fontes de estresse. Desenvolva estratégias de enfrentamento e mantenha práticas de relaxamento."
      })
    };

    const explainer = explanations[metric];
    return explainer ? explainer(value) : {
      metric: metric.toUpperCase(),
      value,
      neurophysiology: "Análise neurofisiológica não disponível para esta métrica.",
      implications: "Implicações específicas em desenvolvimento.",
      recommendations: "Recomendações personalizadas em breve."
    };
  };

  const availableMetrics = Object.keys(metrics).filter(key => 
    ['atl', 'ctl', 'tsb', 'sleep_quality', 'hrv', 'stress_level', 'fatigue_level', 'mood'].includes(key)
  );

  return (
    <Card className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30 ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Brain className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                IA Neurofisiológica
              </h3>
              <p className="text-sm text-gray-400">Análise científica das suas métricas</p>
            </div>
          </div>
          {/* Conteúdo sempre visível - toggle removido */}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
           {availableMetrics.map((metric) => (
             <Button
               key={metric}
               variant={selectedMetric === metric ? "default" : "outline"}
               size="sm"
               onClick={() => setSelectedMetric(selectedMetric === metric ? null : metric)}
               className={`text-xs ${
                 selectedMetric === metric 
                   ? "bg-purple-600 text-white" 
                   : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
               }`}
             >
               {metric.toUpperCase()}
             </Button>
           ))}
         </div>

         {selectedMetric && (
           <div className="mt-6 space-y-4">
             {(() => {
               const explanation = getMetricExplanation(selectedMetric, metrics[selectedMetric]);
               return (
                 <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
                   <div className="flex items-center justify-between">
                     <h4 className="text-lg font-semibold text-purple-300">
                       {explanation.metric}
                     </h4>
                     <span className="text-2xl font-bold text-white">
                       {explanation.value}
                     </span>
                   </div>

                   <div className="space-y-3">
                     <div>
                       <div className="flex items-center gap-2 mb-2">
                         <Brain className="h-4 w-4 text-blue-400" />
                         <h5 className="font-medium text-blue-300">Neurofisiologia</h5>
                       </div>
                       <p className="text-sm text-gray-300 leading-relaxed">
                         {explanation.neurophysiology}
                       </p>
                     </div>

                     <div>
                       <div className="flex items-center gap-2 mb-2">
                         <Lightbulb className="h-4 w-4 text-yellow-400" />
                         <h5 className="font-medium text-yellow-300">Implicações</h5>
                       </div>
                       <p className="text-sm text-gray-300 leading-relaxed">
                         {explanation.implications}
                       </p>
                     </div>

                     <div>
                       <div className="flex items-center gap-2 mb-2">
                         <Sparkles className="h-4 w-4 text-green-400" />
                         <h5 className="font-medium text-green-300">Recomendações</h5>
                       </div>
                       <p className="text-sm text-gray-300 leading-relaxed">
                         {explanation.recommendations}
                       </p>
                       <div className="mt-3 text-xs text-gray-400">
                         <p>
                           Adaptação de treino pela IA: combine o estado atual desta métrica com seu histórico.
                           • Se a carga aguda (ATL) estiver alta e o equilíbrio (TSB) negativo, reduza intensidade e aumente recuperação ativa.
                           • Se a carga crônica (CTL) for adequada e o TSB positivo, priorize estímulos intensos com técnica e qualidade.
                           • Se o sono/HRV estiverem baixos e o estresse alto, foque em base aeróbica leve, mobilidade e higiene do sono.
                           • Ajuste volume e intensidade em passos de 5–10%, monitorando fadiga, humor e dor muscular.
                         </p>
                       </div>
                     </div>
                   </div>
                 </div>
               );
             })()}
           </div>
         )}

         {!selectedMetric && (
           <div className="text-center py-8">
             <Brain className="h-12 w-12 text-purple-400 mx-auto mb-3 opacity-50" />
             <p className="text-gray-400">
               Selecione uma métrica acima para ver a análise neurofisiológica detalhada
             </p>
           </div>
         )}
       </CardContent>
    </Card>
  );
};

export default NeurophysiologyExplainer;