/**
 * step3_Cov.js — Gráfico de Matriz de Covariância
 * ===================================================
 *
 * Este módulo renderiza a visualização do Passo 3: um Heatmap (mapa de calor)
 * 5x5 mostrando a covariância entre as dimensões.
 *
 * O objetivo é que o usuário entenda "quem anda com quem".
 * Variáveis altamente correlacionadas formam blocos de cores fortes.
 *
 * Cores (Escala Divergente):
 *   - Vermelho: Covariância negativa (se um sobe, outro desce)
 *   - Branco/Transparente: Covariância perto de zero (independentes)
 *   - Azul/Ciano: Covariância positiva (crescem juntos)
 *
 * Exporta:
 *   render(containerId)  → Cria o heatmap
 *   destroy(containerId) → Limpa o gráfico
 */

import { standardizedData, DIMENSIONS } from '../data/mockData.js';
import { calculateCovarianceMatrix } from '../data/pcaMath.js';


/**
 * Renderiza o Heatmap da Matriz de Covariância.
 *
 * @param {string} containerId — ID da div do gráfico.
 * @returns {void}
 */
export function render(containerId) {
  // ── 1. Calcula a Matriz de Covariância em tempo real ──
  // Usa os dados padronizados (Z-score) para que o resultado
  // seja equivalente a uma Matriz de Correlação de Pearson (-1 a +1)
  const keys = ['idade', 'tempoSite', 'ticketMedio', 'freqCompra', 'suporte'];
  
  // Nomes amigáveis para os eixos do gráfico
  const labels = ['Idade', 'Tempo Site', 'Ticket Médio', 'Freq. Compra', 'Suporte'];

  const matrix = calculateCovarianceMatrix(standardizedData, keys);

  // ── 2. Prepara o texto amigável do Hover (Tooltip) ──
  // Criamos uma matriz 2D de textos com a explicação didática para cada célula
  const hoverText = [];
  
  for (let i = 0; i < matrix.length; i++) {
    hoverText[i] = [];
    for (let j = 0; j < matrix[i].length; j++) {
      const zValue = matrix[i][j];
      const yLabel = labels[i]; // Eixo Y
      const xLabel = labels[j]; // Eixo X
      
      let trendText = 'Sem relação aparente';
      if (zValue > 0.2) trendText = '(Se um sobe, o outro TAMBÉM SOBE)';
      else if (zValue < -0.2) trendText = '(Se um sobe, o outro CAI)';

      // Formata a string de tooltip (Plotly usa tags <b> e <br>)
      hoverText[i][j] = `<b>Relação:</b> ${xLabel} e ${yLabel}<br>` +
                        `<b>Força:</b> ${zValue.toFixed(2)}<br>` +
                        `<span style="color:#a0aec0; font-size:11px;">${trendText}</span>`;
    }
  }

  // ── 3. Trace: Heatmap do Plotly ──
  const trace = {
    type: 'heatmap',
    z: matrix,
    x: labels,
    y: labels,
    text: hoverText,
    hoverinfo: 'text', // Usa o nosso texto customizado em vez do default

    // Escala de cores divergente centrada no zero (zmid: 0)
    // Cores alinhadas ao design system:
    // Vermelho (--accent-danger) -> Neutro escuro -> Ciano (--accent-secondary)
    colorscale: [
      [0.0, 'hsl(0, 75%, 60%)'],     // Negativo (Forte)
      [0.5, 'hsl(225, 20%, 16%)'],   // Zero (Neutro/Fundo)
      [1.0, 'hsl(190, 90%, 55%)'],   // Positivo (Forte)
    ],
    zmid: 0, // Garante que o zero fique exatamente na cor central
    
    // Barra de cores lateral
    colorbar: {
      title: { text: 'Covariância', font: { color: '#a0aec0', size: 12 } },
      tickfont: { color: '#718096', size: 11 },
      thickness: 10,
      len: 0.8,
    },
    
    // Mostra as bordas dos quadrados para ficar como "Batalha Naval"
    xgap: 2,
    ygap: 2,
  };

  // ── 4. Layout: Tema Premium ──
  const layout = {
    title: {
      text: 'Matriz de Covariância: O Radar de Tendências<br>' +
            '<sub style="font-size:11px; color:#718096;">O que cresce junto e o que vai em direções opostas</sub>',
      font: { family: 'Inter, sans-serif', size: 16, color: '#e2e8f0' },
      x: 0.5,
      xanchor: 'center',
    },
    
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { l: 90, r: 20, t: 70, b: 60 },

    // Inverte o eixo Y para a diagonal principal ficar de topo-esquerda p/ baixo-direita
    yaxis: {
      autorange: 'reversed',
      tickfont: { color: '#e2e8f0', size: 12 },
    },
    xaxis: {
      tickfont: { color: '#e2e8f0', size: 12 },
    },
  };

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  // ── 5. Renderiza ──
  Plotly.newPlot(containerId, [trace], layout, config);
}


/**
 * Remove o gráfico do container.
 *
 * @param {string} containerId — ID da div a limpar.
 */
export function destroy(containerId) {
  Plotly.purge(containerId);
}
