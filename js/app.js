/**
 * app.js — Ponto de Entrada da Aplicação
 * ========================================
 *
 * Este é o módulo "bootstrap" — o primeiro JS que roda.
 * Responsabilidades:
 *   1. Importar e conectar os módulos core (EventBus, Store, Scrolly)
 *   2. Registrar listeners dos botões de navegação (Iniciar, Reiniciar)
 *   3. Inicializar o gerenciador de gráficos (chartManager.js)
 *   4. Inicializar os listeners de interação (interactions.js)
 *   5. Validar que os dados estão carregados corretamente
 *   6. Exibir feedback no console confirmando que tudo carregou
 */

import { eventBus } from './core/eventBus.js';
import { store } from './core/state.js';
import { initScrolly } from './ui/scrolly.js';
import { initChartManager } from './charts/chartManager.js';
import { initInteractions } from './ui/interactions.js';
import { rawData, DIMENSIONS } from './data/mockData.js';


/**
 * Inicialização principal da aplicação.
 * Chamada quando o DOM estiver completamente carregado.
 */
function init() {
  // ── 1. Mensagem de boas-vindas estilizada no console ──
  console.log(
    '%c🧬 Business Case PCA — Entendendo o PCA na Prática',
    'background: linear-gradient(135deg, #7c5cfc, #36d6b5); ' +
    'color: white; ' +
    'font-size: 18px; ' +
    'font-weight: bold; ' +
    'padding: 12px 24px; ' +
    'border-radius: 8px; ' +
    'text-shadow: 1px 1px 2px rgba(0,0,0,0.3);'
  );

  console.log(
    '%c📦 Fase 4: Padronização (Passo 2) + Interações',
    'color: #36d6b5; font-size: 13px; font-weight: bold;'
  );


  // ── 2. Validação dos dados ──
  console.log(
    `%c✅ Dataset carregado: ${rawData.length} clientes × ${DIMENSIONS.length} dimensões`,
    'color: #7c5cfc; font-size: 12px;'
  );
  console.log(
    `%c   Dimensões: ${DIMENSIONS.join(', ')}`,
    'color: #95a5a6; font-size: 11px;'
  );


  // ── 3. Inicializa o sistema de scrollytelling ──
  initScrolly();


  // ── 4. Inicializa o gerenciador de gráficos ──
  // Deve ser chamado APÓS o scrolly, para que os listeners
  // de STEP_CHANGED já estejam registrados.
  initChartManager();


  // ── 5. Inicializa os listeners de interação ──
  // Captura cliques em botões e sliders, emitindo eventos no EventBus.
  initInteractions();


  // ── 6. Configura botões de navegação ──
  setupNavigation();


  // ── 7. Subscriber de debug: loga mudanças de estado ──
  store.subscribe((key, newValue, oldValue) => {
    if (key === 'currentStep') {
      console.log(
        `%c[App] 🚶 Passo alterado: ${oldValue} → ${newValue}`,
        'color: #e74c3c; font-weight: bold;'
      );
    }
  });


  // ── 8. Confirmação final ──
  console.log(
    '%c\n🎉 Fase 4 carregada! Role ao Passo 2 e clique em "Padronizar Dados".',
    'color: #2ecc71; font-size: 14px; font-weight: bold;'
  );
}


/**
 * Configura os botões de navegação do Hero e do Footer.
 *
 * - "Iniciar Jornada" → rola suavemente até o Passo 1
 * - "Reiniciar Jornada" → reseta o estado e rola até o topo
 */
function setupNavigation() {
  // ── Botão "Iniciar Jornada" ──
  const btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', () => {
      const firstStep = document.getElementById('step-1');
      if (firstStep) {
        firstStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  // ── Botão "Reiniciar Jornada" ──
  const btnRestart = document.getElementById('btn-restart');
  if (btnRestart) {
    btnRestart.addEventListener('click', () => {
      // Reseta o estado global (dispara STATE_RESET no EventBus)
      store.reset();

      // Rola até o topo da página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  console.log(
    '%c✅ Navegação configurada: botões Iniciar e Reiniciar prontos',
    'color: #7c5cfc; font-size: 12px;'
  );
}


// ── Executa a inicialização quando o DOM estiver pronto ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
