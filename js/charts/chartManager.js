/**
 * chartManager.js — Orquestrador Central de Gráficos
 * =====================================================
 *
 * Este módulo é o "maestro" da orquestra visual. Ele não desenha
 * gráficos diretamente — ele delega para os módulos especializados
 * (step1_3D, step2_Scale, etc.) com base no passo ativo.
 *
 * Responsabilidades:
 *   1. Escutar o evento STEP_CHANGED no EventBus
 *   2. Quando o passo muda:
 *      a. Limpar o gráfico anterior (Plotly.purge)
 *      b. Chamar o render() do módulo correspondente ao novo passo
 *   3. Gerenciar o ciclo de vida dos gráficos (criar / destruir)
 *
 * Fluxo:
 *   User scrolls → scrolly.js → store.setState('currentStep', N)
 *   → EventBus emite 'STEP_CHANGED' → chartManager reage
 *   → chama stepN.render('chart-container')
 *
 * Exporta:
 *   initChartManager() → Inicializa o listener e renderiza o passo atual
 */

import { eventBus } from '../core/eventBus.js';
import { store } from '../core/state.js';

// ── Imports dos módulos de gráfico por passo ──
// Cada módulo exporta render(containerId) e destroy(containerId)
import * as step1 from './step1_3D.js';
import * as step2 from './step2_Scale.js';
import * as step3 from './step3_Cov.js';
import * as step4 from './step4_Eigen.js';
import * as step5 from './step5_Biplot.js';


/** ID da div onde o Plotly renderiza os gráficos */
const CONTAINER_ID = 'chart-container';

/**
 * Mapa de módulos de gráfico por número de passo.
 * Cada entrada referencia o módulo com render() e destroy().
 *
 * Quando um novo módulo de passo for implementado, basta
 * adicionar a entrada aqui e descomentar o import acima.
 */
const STEP_MODULES = {
  1: step1,
  2: step2,
  3: step3,
  4: step4,
  5: step5,
};

/** Guarda referência ao passo atualmente renderizado para evitar re-renders */
let currentRenderedStep = null;


/**
 * Inicializa o Chart Manager.
 * Deve ser chamada uma vez no app.js, após o DOM estar pronto.
 *
 * @returns {void}
 */
export function initChartManager() {
  // ── Escuta mudanças de passo via EventBus ──
  eventBus.on('STEP_CHANGED', handleStepChanged);

  // ── Escuta reset do estado para limpar gráficos ──
  eventBus.on('STATE_RESET', handleReset);

  // ── Renderiza o passo atual (caso a página já tenha sido scrollada) ──
  const currentStep = store.getState('currentStep');
  if (currentStep > 0) {
    renderStep(currentStep);
  }
}


/**
 * Callback do evento STEP_CHANGED.
 * Chamada toda vez que o usuário rola para um novo passo.
 *
 * @param {{ current: number, previous: number }} data — Dados do evento.
 */
function handleStepChanged(data) {
  const { current, previous } = data;

  // Evita re-renderizar se já estamos neste passo
  if (current === currentRenderedStep) return;

  // Limpa o gráfico anterior
  clearChart(previous);

  // Renderiza o novo gráfico (se houver módulo para este passo)
  renderStep(current);
}


/**
 * Renderiza o gráfico correspondente ao passo informado.
 * Se não houver módulo registrado para o passo, exibe um placeholder.
 *
 * @param {number} step — Número do passo a renderizar.
 */
function renderStep(step) {
  const stepModule = STEP_MODULES[step];

  if (stepModule && typeof stepModule.render === 'function') {
    // Módulo existe → renderiza o gráfico
    stepModule.render(CONTAINER_ID);
    currentRenderedStep = step;
  } else {
    // Módulo ainda não implementado → exibe placeholder elegante
    showPlaceholder(step);
    currentRenderedStep = step;
  }
}


/**
 * Limpa o gráfico do passo anterior.
 * Usa a função destroy() do módulo se disponível,
 * caso contrário faz um Plotly.purge() genérico.
 *
 * @param {number} step — Número do passo a limpar.
 */
function clearChart(step) {
  const container = document.getElementById(CONTAINER_ID);
  if (!container) return;

  const stepModule = STEP_MODULES[step];

  if (stepModule && typeof stepModule.destroy === 'function') {
    // Usa o destroy específico do módulo (pode ter cleanup extra)
    stepModule.destroy(CONTAINER_ID);
  } else {
    // Fallback: limpa qualquer gráfico Plotly + innerHTML
    try {
      Plotly.purge(CONTAINER_ID);
    } catch (e) {
      // Plotly.purge pode falhar se não houver gráfico — ignorar silenciosamente
    }
    container.innerHTML = '';
  }
}


/**
 * Exibe um placeholder visual enquanto o módulo do passo
 * não foi implementado. Mostra uma mensagem estilizada
 * informando que o gráfico está "em construção".
 *
 * @param {number} step — Número do passo sem gráfico.
 */
function showPlaceholder(step) {
  const container = document.getElementById(CONTAINER_ID);
  if (!container) return;

  // Limpa qualquer conteúdo anterior
  try { Plotly.purge(CONTAINER_ID); } catch (e) { /* ok */ }

  const stepTitles = {
    1: 'O Caos Dimensional (3D Scatter)',
    2: 'Nivelando o Jogo (Padronização)',
    3: 'Quem Anda com Quem? (Covariância)',
    4: 'As Novas Avenidas (Autovetores)',
    5: 'A Mágica da Projeção (Biplot 2D)',
  };

  const title = stepTitles[step] || `Passo ${step}`;

  container.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #718096;
      font-family: 'Inter', sans-serif;
      text-align: center;
      padding: 2rem;
    ">
      <div style="
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
        animation: pulse 2s ease-in-out infinite;
      ">📊</div>
      <p style="
        font-size: 1.1rem;
        font-weight: 600;
        color: #a0aec0;
        margin-bottom: 0.5rem;
      ">Passo ${step}: ${title}</p>
      <p style="
        font-size: 0.875rem;
        color: #4a5568;
      ">Gráfico será implementado na próxima fase</p>
    </div>
  `;
}


/**
 * Reage ao reset do estado: limpa o gráfico e reseta o controle interno.
 */
function handleReset() {
  clearChart(currentRenderedStep);
  currentRenderedStep = null;

  // Limpa o container visualmente
  const container = document.getElementById(CONTAINER_ID);
  if (container) {
    container.innerHTML = '';
  }
}
