/**
 * scrolly.js — Motor de Scrollytelling
 * =======================================
 *
 * Este módulo é responsável por detectar qual passo (seção) da jornada
 * o usuário está visualizando e atualizar o estado global (Store).
 *
 * Mecânica:
 *   1. Usa IntersectionObserver para monitorar cada <section class="step">
 *   2. Quando uma seção cruza o centro da viewport, ela se torna "ativa"
 *   3. O módulo atualiza store.currentStep e aplica a classe .is-active
 *   4. A barra de progresso (#progress-bar) é atualizada proporcionalmente
 *
 * Por que IntersectionObserver e não scroll event?
 *   - Performance: o Observer roda nativamente no browser, sem polling
 *   - Não bloqueia a thread principal com cálculos em cada frame
 *   - A ARCHITECTURE.md recomenda IntersectionObserver como primeira opção
 *
 * Exporta:
 *   - initScrolly()  → Inicializa o Observer e conecta ao Store
 *   - destroyScrolly() → Remove o Observer (para cleanup/reinicialização)
 */

import { store } from '../core/state.js';
import { eventBus } from '../core/eventBus.js';


// ── Referências do DOM (cacheadas na inicialização) ──
let stepElements = [];
let progressBar = null;
let observer = null;

/** Total de passos na jornada (extraído dinamicamente do HTML) */
let totalSteps = 0;


/**
 * Inicializa o sistema de scrollytelling.
 *
 * Deve ser chamada uma única vez no app.js, após o DOM estar pronto.
 * Configura o IntersectionObserver e registra listeners para
 * reagir às mudanças de passo.
 *
 * @returns {void}
 */
export function initScrolly() {
  // Captura todas as seções de passo
  stepElements = Array.from(document.querySelectorAll('.step'));
  progressBar = document.getElementById('progress-bar');
  totalSteps = stepElements.length;

  if (totalSteps === 0) {
    return;
  }

  // ── Configura o IntersectionObserver ──
  // rootMargin: "-50% 0px" faz com que o trigger aconteça quando
  // a seção cruza o ponto central vertical da viewport.
  // Tradução: "considere intersecção apenas quando o elemento
  // estiver visível na metade superior da tela".
  const observerOptions = {
    root: null,           // Viewport do browser
    rootMargin: '0px 0px -50% 0px',
    threshold: 0,         // Basta 1px cruzar a linha para disparar
  };

  observer = new IntersectionObserver(handleIntersection, observerOptions);

  // Observa cada seção .step
  stepElements.forEach((stepEl) => {
    observer.observe(stepEl);
  });

  // ── Escuta mudanças de passo para atualizar a UI ──
  // Esse listener reage ao evento STEP_CHANGED (emitido pelo Store)
  // para manter o visual sincronizado com o estado.
  eventBus.on('STEP_CHANGED', handleStepChanged);

  // ── Escuta reset do estado para limpar a UI ──
  eventBus.on('STATE_RESET', handleReset);

  // Marca o passo inicial (caso o usuário já esteja no meio da página ao carregar)
  detectInitialStep();
}


/**
 * Callback do IntersectionObserver.
 * Chamada toda vez que uma seção entra ou sai da zona de visibilidade.
 *
 * @param {IntersectionObserverEntry[]} entries — Entradas observadas.
 */
function handleIntersection(entries) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    // Extrai o número do passo do atributo data-step
    const stepNumber = parseInt(entry.target.dataset.step, 10);

    // Evita atualizar se já estamos neste passo (sem ruído)
    const currentStep = store.getState('currentStep');
    if (stepNumber === currentStep) return;

    // Atualiza o estado global → isso dispara STEP_CHANGED no EventBus
    store.setState('currentStep', stepNumber);
  });
}


/**
 * Reage à mudança de passo: atualiza classes CSS e barra de progresso.
 *
 * @param {{ current: number, previous: number }} data — Dados do evento.
 */
function handleStepChanged(data) {
  const { current } = data;

  // ── 1. Atualiza classe .is-active nos steps ──
  stepElements.forEach((stepEl) => {
    const stepNum = parseInt(stepEl.dataset.step, 10);

    if (stepNum === current) {
      stepEl.classList.add('is-active');
    } else {
      stepEl.classList.remove('is-active');
    }
  });

  // ── 2. Atualiza a barra de progresso ──
  updateProgressBar(current);
}


/**
 * Atualiza a largura da barra de progresso baseada no passo atual.
 * Passo 0 = 0%, Passo 5 = 100%.
 *
 * @param {number} step — Número do passo atual.
 */
function updateProgressBar(step) {
  if (!progressBar) return;

  const progress = totalSteps > 0
    ? (step / totalSteps) * 100
    : 0;

  progressBar.style.width = `${progress}%`;
}


/**
 * Detecta o passo inicial quando a página é carregada.
 * Necessário caso o usuário recarregue a página no meio da jornada
 * (o browser mantém a posição de scroll após F5).
 */
function detectInitialStep() {
  // Verifica qual seção está mais próxima do centro da viewport
  const viewportCenter = window.innerHeight / 2;
  let closestStep = 0;
  let closestDistance = Infinity;

  stepElements.forEach((stepEl) => {
    const rect = stepEl.getBoundingClientRect();
    const elementCenter = rect.top + rect.height / 2;
    const distance = Math.abs(elementCenter - viewportCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestStep = parseInt(stepEl.dataset.step, 10);
    }
  });

  // Se encontrou um step visível, atualiza o estado
  if (closestStep > 0) {
    // Verifica se o step está razoavelmente visível (não apenas "perto")
    const stepEl = document.querySelector(`[data-step="${closestStep}"]`);
    if (stepEl) {
      const rect = stepEl.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        store.setState('currentStep', closestStep);
      }
    }
  }
}


/**
 * Reage ao reset do estado: remove todas as classes .is-active
 * e zera a barra de progresso.
 */
function handleReset() {
  stepElements.forEach((stepEl) => {
    stepEl.classList.remove('is-active');
  });
  updateProgressBar(0);
}


/**
 * Remove o IntersectionObserver e limpa os listeners.
 * Deve ser chamada antes de reinicializar o scrolly (ex: hot reload).
 *
 * @returns {void}
 */
export function destroyScrolly() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  eventBus.off('STEP_CHANGED', handleStepChanged);
  eventBus.off('STATE_RESET', handleReset);
}
