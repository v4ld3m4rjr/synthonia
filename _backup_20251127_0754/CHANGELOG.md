# Changelog

## 2025-11-08

- Corrige falha crítica em `MultiLineChart.tsx` que retornava JSX dentro de `useEffect`, causando tela em branco e erros de módulo durante HMR.
- Implementa desenho completo das séries (linhas, pontos, grade e legenda) no canvas do `MultiLineChart`.
- Aplica lazy loading com `React.lazy` e `Suspense` para `LineChart`, `BarChart` e `MultiLineChart` em `AnalyticsView` e `TrainingChart`, reduzindo abortos de rede (`net::ERR_ABORTED`) durante recarregamentos.
- Mantém CSP de desenvolvimento em `vite.config.ts` permitindo `'unsafe-inline'` no `script-src` para que o preâmbulo do React Refresh funcione corretamente (commit anterior).
- Validação local: servidor em `http://localhost:5178/` sem erros no preview, gráficos renderizando e HMR funcional.

## Notas

- A alteração de CSP aplica-se apenas ao desenvolvimento/preview; o build de produção permanece sem `unsafe-inline`.
- Caso o preview apresente novamente abortos de rede, isso normalmente indica recarregamentos do HMR, não falhas de import. O lazy loading e os guards de efeitos foram adicionados para estabilizar o fluxo.

## Orientações Supabase (404 em tabelas)

- Se ocorrer `404` em `rest/v1/users`, `rest/v1/training_sessions` ou `rest/v1/daily_data`, verifique:
  - Tabelas existem no schema `public` com estes nomes.
  - Políticas RLS permitem `select` para `anon` quando `record.user_id = auth.uid()`.
  - Variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão definidas (ou `localStorage` com `SUPABASE_URL` e `SUPABASE_ANON_KEY`).
- O código agora retorna arrays vazios quando há erro (inclui 404) nos helpers `getDailyData` e `getTrainingSessions`, evitando quebra da UI.
- Em desenvolvimento, os erros são logados com mensagens claras no console.

## Estabilidade da tela “Análises”

- Adicionado `ErrorBoundary` em `Dashboard.tsx` envolvendo `AnalyticsView` para capturar erros de runtime e exibir fallback amigável.
- Mantidos `React.lazy` + `Suspense` nos gráficos para reduzir concorrência de carregamento e melhorar UX em HMR.