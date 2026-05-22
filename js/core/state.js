/**
 * state.js — Gerenciamento de Estado Global (Store)
 * ===================================================
 * 
 * Este módulo é a "única fonte de verdade" da aplicação.
 * Todo dado compartilhado vive aqui. A UI não guarda estado próprio —
 * ela apenas lê deste Store e reage às mudanças.
 * 
 * Padrão: Observer simplificado (sem Proxy, sem virtual DOM).
 * 
 * Fluxo:
 *   1. Um módulo chama store.setState('currentStep', 3)
 *   2. O Store atualiza o valor interno
 *   3. O Store notifica todos os subscribers registrados
 *   4. O Store emite 'STATE_CHANGED' no EventBus (para módulos desacoplados)
 *   5. Se a propriedade alterada foi 'currentStep', emite também 'STEP_CHANGED'
 * 
 * API:
 *   store.getState()              → Retorna cópia do estado completo
 *   store.getState('chave')       → Retorna valor de uma chave específica
 *   store.setState('chave', valor) → Atualiza uma propriedade e notifica
 *   store.subscribe(callback)     → Registra um ouvinte de mudanças
 *   store.unsubscribe(callback)   → Remove um ouvinte
 */

import { eventBus } from './eventBus.js';


/**
 * Estado inicial da aplicação.
 * Cada propriedade representa uma "fatia" (slice) do estado.
 * 
 * - currentStep: Passo atual da jornada (0 = Landing, 1-5 = Passos do PCA)
 * - step2: Estado específico da interação de padronização
 * - step4: Estado específico da animação de autovetores
 */
const initialState = {
  currentStep: 0,

  step2: {
    sliderValue: 0,
    isStandardized: false,
  },

  step4: {
    hasFoundEigenvectors: false,
  },
};


class Store {
  constructor(initial) {
    /**
     * Estado interno — cópia profunda do estado inicial
     * para evitar mutações acidentais na referência original.
     */
    this._state = structuredClone(initial);

    /**
     * Lista de funções callback registradas como observadores.
     * Cada uma será chamada sempre que o estado mudar.
     */
    this._subscribers = [];
  }

  /**
   * Retorna o estado atual (ou uma propriedade específica).
   * Sempre retorna uma cópia para garantir imutabilidade —
   * nenhum módulo externo pode alterar o estado diretamente.
   * 
   * @param {string} [key] — Chave opcional. Se omitida, retorna o estado inteiro.
   * @returns {*} — Cópia do estado ou do valor da chave.
   */
  getState(key) {
    if (key !== undefined) {
      return structuredClone(this._state[key]);
    }
    return structuredClone(this._state);
  }

  /**
   * Atualiza uma propriedade do estado e notifica os interessados.
   * 
   * @param {string} key   — Nome da propriedade a alterar (ex: 'currentStep').
   * @param {*} value       — Novo valor da propriedade.
   * @returns {void}
   */
  setState(key, value) {
    // Guarda o valor anterior para o log de debug
    const previousValue = this._state[key];

    // Atualiza o estado interno
    this._state[key] = value;

    // Notifica os subscribers locais (callbacks diretos)
    this._notifySubscribers(key, value, previousValue);

    // Emite evento genérico no barramento global
    eventBus.emit('STATE_CHANGED', {
      key,
      value,
      previousValue,
      fullState: this.getState(),
    });

    // Se o passo mudou, emite evento específico para facilitar a escuta
    if (key === 'currentStep') {
      eventBus.emit('STEP_CHANGED', {
        current: value,
        previous: previousValue,
      });
    }
  }

  /**
   * Registra um callback que será chamado toda vez que o estado mudar.
   * 
   * @param {Function} callback — Função que recebe (key, newValue, oldValue).
   * @returns {Function} — Função para cancelar a inscrição (unsubscribe).
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      console.warn('[Store] subscribe() espera uma função como argumento.');
      return () => {};
    }

    this._subscribers.push(callback);

    // Retorna uma função de "desinscrição" para conveniência
    return () => this.unsubscribe(callback);
  }

  /**
   * Remove um callback previamente registrado.
   * 
   * @param {Function} callback — Referência exata do callback a remover.
   * @returns {void}
   */
  unsubscribe(callback) {
    this._subscribers = this._subscribers.filter((sub) => sub !== callback);
  }

  /**
   * Reseta o estado para os valores iniciais.
   * Útil para o botão "Reiniciar" no final da jornada.
   * 
   * @returns {void}
   */
  reset() {
    this._state = structuredClone(initialState);
    this._notifySubscribers('*', this._state, null);
    eventBus.emit('STATE_RESET', this.getState());
  }

  /**
   * Notifica todos os subscribers registrados sobre a mudança.
   * 
   * @private
   * @param {string} key        — Chave alterada.
   * @param {*} newValue        — Novo valor.
   * @param {*} oldValue        — Valor anterior.
   */
  _notifySubscribers(key, newValue, oldValue) {
    this._subscribers.forEach((callback) => {
      try {
        callback(key, newValue, oldValue);
      } catch (error) {
        console.error(
          `[Store] Erro em subscriber ao processar mudança de "${key}":`,
          error
        );
      }
    });
  }
}


/**
 * Exporta uma instância única (Singleton) do Store.
 * Todos os módulos da aplicação compartilham este mesmo estado.
 */
export const store = new Store(initialState);
