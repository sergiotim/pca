/**
 * interactions.js — Listeners de Elementos Interativos
 * =====================================================
 *
 * Este módulo captura ações do usuário no DOM e as traduz
 * em eventos no EventBus, seguindo o fluxo desacoplado:
 *
 *   Usuário clica → interactions.js captura → EventBus.emit()
 *   → Store atualiza → Gráfico reage
 *
 * O módulo NÃO altera o estado diretamente. Ele apenas emite eventos.
 * A responsabilidade de mudar o estado é do listener no Store ou
 * nos módulos que escutam os eventos.
 *
 * Exporta:
 *   initInteractions() → Registra todos os event listeners do DOM
 */

import { eventBus } from '../core/eventBus.js';
import { store } from '../core/state.js';


/**
 * Inicializa todos os listeners de interação do DOM.
 * Deve ser chamada uma vez no app.js, após o DOM estar pronto.
 *
 * @returns {void}
 */
export function initInteractions() {
  setupStep2Buttons();
  setupStep4Buttons();
}


/**
 * Configura o botão "Padronizar Dados" do Passo 2.
 *
 * Fluxo ao clicar:
 *   1. Emite 'STANDARDIZE_CLICKED' no EventBus
 *   2. Atualiza o estado: step2.isStandardized = true
 *   3. Muda o visual do botão para "concluído"
 *   4. Desabilita o botão para evitar cliques repetidos
 */
function setupStep2Buttons() {
  const btnStandardize = document.getElementById('btn-standardize');
  if (!btnStandardize) return;

  btnStandardize.addEventListener('click', () => {
    // Verifica se já foi padronizado (evita ação duplicada)
    const step2State = store.getState('step2');
    if (step2State && step2State.isStandardized) return;

    // 1. Emite o evento no barramento global
    eventBus.emit('STANDARDIZE_CLICKED');

    // 2. Atualiza o estado global
    store.setState('step2', {
      ...store.getState('step2'),
      isStandardized: true,
    });

    // 3. Feedback visual no botão
    btnStandardize.textContent = '✅ Dados Padronizados!';
    btnStandardize.classList.add('is-done');
    btnStandardize.disabled = true;
  });

  // ── Escuta reset para restaurar o botão ao estado original ──
  eventBus.on('STATE_RESET', () => {
    btnStandardize.textContent = '⚖️ Padronizar Dados (Z-Score)';
    btnStandardize.classList.remove('is-done');
    btnStandardize.disabled = false;
  });
}

/**
 * Configura o botão "Encontrar o melhor ângulo" do Passo 4.
 */
function setupStep4Buttons() {
  const btnEigen = document.getElementById('btn-eigen');
  const btnEigen2 = document.getElementById('btn-eigen2');
  if (!btnEigen) return;

  btnEigen.addEventListener('click', () => {
    const step4State = store.getState('step4');
    if (step4State && step4State.hasFoundEigenvectors) return;

    eventBus.emit('EIGENVECTORS_CLICKED');

    store.setState('step4', {
      ...store.getState('step4'),
      hasFoundEigenvectors: true,
    });

    btnEigen.textContent = '✅ PC1 Encontrado!';
    btnEigen.classList.add('is-done');
    btnEigen.disabled = true;

    // Mostra o container principal e o card do PC1
    const container = document.getElementById('pc-loadings');
    const pc1Card = document.getElementById('pc1-loadings');
    if (container) container.style.display = 'flex';
    if (pc1Card) pc1Card.style.display = 'block';

    if (btnEigen2) {
      btnEigen2.disabled = false; // Habilita o botão do PC2
    }
  });

  if (btnEigen2) {
    btnEigen2.addEventListener('click', () => {
      const step4State = store.getState('step4');
      if (step4State && step4State.hasFoundPC2) return;

      eventBus.emit('EIGENVECTORS2_CLICKED');

      store.setState('step4', {
        ...store.getState('step4'),
        hasFoundPC2: true,
      });

      btnEigen2.textContent = '✅ PC2 Encontrado!';
      btnEigen2.classList.add('is-done');
      btnEigen2.disabled = true;

      // Mostra o card do PC2
      const pc2Card = document.getElementById('pc2-loadings');
      if (pc2Card) pc2Card.style.display = 'block';
    });
  }

  eventBus.on('STATE_RESET', () => {
    btnEigen.textContent = '📐 Encontrar o PC1';
    btnEigen.classList.remove('is-done');
    btnEigen.disabled = false;

    if (btnEigen2) {
      btnEigen2.textContent = '➕ Encontrar o PC2';
      btnEigen2.classList.remove('is-done');
      btnEigen2.disabled = true;
    }

    const container = document.getElementById('pc-loadings');
    const pc1Card = document.getElementById('pc1-loadings');
    const pc2Card = document.getElementById('pc2-loadings');
    if (container) container.style.display = 'none';
    if (pc1Card) pc1Card.style.display = 'none';
    if (pc2Card) pc2Card.style.display = 'none';
  });
}
