/**
 * eventBus.js — Sistema de Publicação/Assinatura (Pub/Sub)
 * =========================================================
 * 
 * Este módulo é o "correio central" da aplicação. Nenhum módulo
 * fala diretamente com outro — todos passam pelo EventBus.
 * 
 * Isso garante desacoplamento: se um módulo for removido ou alterado,
 * os demais continuam funcionando normalmente, pois não se conhecem.
 * 
 * API:
 *   eventBus.on(evento, callback)  → Registra um ouvinte para o evento.
 *   eventBus.off(evento, callback) → Remove um ouvinte específico.
 *   eventBus.emit(evento, payload) → Dispara o evento, notificando todos os ouvintes.
 * 
 * Exemplo de uso:
 *   import { eventBus } from './eventBus.js';
 *   
 *   // Inscrevendo-se num evento
 *   eventBus.on('STEP_CHANGED', (data) => console.log('Novo passo:', data));
 *   
 *   // Disparando o evento
 *   eventBus.emit('STEP_CHANGED', { step: 2 });
 */


class EventBus {
  constructor() {
    /**
     * Mapa interno de eventos.
     * Estrutura: { 'NOME_DO_EVENTO': [callback1, callback2, ...] }
     */
    this._listeners = {};
  }

  /**
   * Registra um callback para ser executado quando o evento for emitido.
   * 
   * @param {string} event  — Nome do evento (ex: 'STEP_CHANGED').
   * @param {Function} callback — Função a ser chamada quando o evento ocorrer.
   * @returns {void}
   */
  on(event, callback) {
    // Se o evento ainda não tem ouvintes, cria o array
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }

    // Evita duplicatas — mesmo callback não deve ser registrado duas vezes
    if (!this._listeners[event].includes(callback)) {
      this._listeners[event].push(callback);
    }
  }

  /**
   * Remove um callback previamente registrado para o evento.
   * 
   * @param {string} event    — Nome do evento.
   * @param {Function} callback — Referência exata do callback a remover.
   * @returns {void}
   */
  off(event, callback) {
    if (!this._listeners[event]) return;

    // Filtra o array mantendo apenas os callbacks diferentes do informado
    this._listeners[event] = this._listeners[event].filter(
      (cb) => cb !== callback
    );

    // Se não sobrou nenhum ouvinte, remove a chave para manter o mapa limpo
    if (this._listeners[event].length === 0) {
      delete this._listeners[event];
    }
  }

  /**
   * Dispara um evento, executando todos os callbacks registrados para ele.
   * 
   * @param {string} event   — Nome do evento a disparar.
   * @param {*} payload      — Dados opcionais a serem enviados aos ouvintes.
   * @returns {void}
   */
  emit(event, payload) {
    if (!this._listeners[event]) return;

    // Itera sobre uma cópia do array para evitar problemas caso um
    // callback modifique a lista de ouvintes durante a execução
    const callbacks = [...this._listeners[event]];

    callbacks.forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        console.error(
          `[EventBus] Erro ao executar callback do evento "${event}":`,
          error
        );
      }
    });
  }

  /**
   * Método utilitário para debug: lista todos os eventos registrados
   * e a quantidade de ouvintes de cada um.
   * 
   * @returns {Object} — Mapa { evento: quantidadeDeOuvintes }
   */
  debug() {
    const summary = {};
    for (const [event, callbacks] of Object.entries(this._listeners)) {
      summary[event] = callbacks.length;
    }
    console.table(summary);
    return summary;
  }
}


/**
 * Exporta uma instância única (Singleton) do EventBus.
 * Todos os módulos da aplicação compartilham esta mesma instância.
 */
export const eventBus = new EventBus();
