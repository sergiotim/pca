/**
 * scrolly.js — Motor de Navegação por Passos (Slides)
 * ===================================================
 *
 * Módulo refatorado para controlar a navegação baseada em botões
 * (Próximo / Anterior) em vez de scroll.
 * O nome "scrolly.js" e "initScrolly" foram mantidos para
 * minimizar o impacto de refatoração no app.js, mas o 
 * comportamento agora é de um carrossel de passos.
 */

import { store } from '../core/state.js';
import { eventBus } from '../core/eventBus.js';

let stepElements = [];
let progressBar = null;
let totalSteps = 0;
let btnPrev = null;
let btnNext = null;

export function initScrolly() {
  stepElements = Array.from(document.querySelectorAll('.step'));
  progressBar = document.getElementById('progress-bar');
  totalSteps = stepElements.length;

  btnPrev = document.getElementById('btn-prev');
  btnNext = document.getElementById('btn-next');

  if (totalSteps === 0) return;

  if (btnPrev) btnPrev.addEventListener('click', handlePrev);
  if (btnNext) btnNext.addEventListener('click', handleNext);

  eventBus.on('STEP_CHANGED', handleStepChanged);
  eventBus.on('STATE_RESET', handleReset);

  // Define o passo inicial
  store.setState('currentStep', 1);
}

function handlePrev() {
  const current = store.getState('currentStep');
  if (current > 1) {
    store.setState('currentStep', current - 1);
  }
}

function handleNext() {
  const current = store.getState('currentStep');
  if (current < totalSteps) {
    store.setState('currentStep', current + 1);
  } else if (current === totalSteps) {
    // Se for o último passo, rola para a conclusão
    const conclusion = document.getElementById('conclusion');
    if (conclusion) {
      conclusion.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function handleStepChanged(data) {
  const { current } = data;

  stepElements.forEach((stepEl) => {
    const stepNum = parseInt(stepEl.dataset.step, 10);
    if (stepNum === current) {
      stepEl.classList.add('is-active');
    } else {
      stepEl.classList.remove('is-active');
    }
  });

  updateProgressBar(current);
  updateButtons(current);
}

function updateProgressBar(step) {
  if (!progressBar) return;
  const progress = totalSteps > 0 ? (step / totalSteps) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}

function updateButtons(current) {
  if (btnPrev) {
    btnPrev.disabled = current <= 1;
  }
  if (btnNext) {
    if (current === totalSteps) {
      btnNext.textContent = 'Finalizar 🎉';
    } else {
      btnNext.textContent = 'Próximo Passo →';
    }
  }
}

function handleReset() {
  stepElements.forEach((stepEl) => stepEl.classList.remove('is-active'));
  updateProgressBar(0);
}

export function destroyScrolly() {
  if (btnPrev) btnPrev.removeEventListener('click', handlePrev);
  if (btnNext) btnNext.removeEventListener('click', handleNext);

  eventBus.off('STEP_CHANGED', handleStepChanged);
  eventBus.off('STATE_RESET', handleReset);
}
