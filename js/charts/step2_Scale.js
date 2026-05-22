/**
 * step2_Scale.js — Gráfico de Padronização "Nivelando o Jogo"
 * ==============================================================
 *
 * Este módulo renderiza a visualização do Passo 2: um scatter 2D
 * que compara Idade (X) vs Ticket Médio (Y) para mostrar o problema
 * das escalas diferentes.
 *
 * Estados do gráfico:
 *   1. ANTES da padronização: Escalas "injustas"
 *      - Eixo X: 0–100 (Idade)
 *      - Eixo Y: 0–10000 (Ticket Médio em R$)
 *      - Os pontos ficam esmagados numa faixa estreita
 *
 *   2. APÓS clicar em "Padronizar": Z-Score aplicado
 *      - Ambos os eixos: -3 a +3
 *      - Pontos distribuídos de forma justa e comparável
 *      - Transição animada via Plotly.animate()
 *
 * Exporta:
 *   render(containerId)  → Cria o gráfico "antes" da padronização
 *   destroy(containerId) → Limpa o gráfico
 */

import { rawData, standardizedData, CLUSTER_COLORS } from '../data/mockData.js';
import { eventBus } from '../core/eventBus.js';


/** Flag interna: se o gráfico deste passo está ativo no DOM */
let isActive = false;

/** Referência ao listener do STANDARDIZE_CLICKED (para remoção no destroy) */
let standardizeHandler = null;


/**
 * Renderiza o scatter 2D "Idade vs Ticket Médio" com escalas injustas.
 *
 * @param {string} containerId — ID da div onde o Plotly vai desenhar.
 * @returns {void}
 */
export function render(containerId) {
  isActive = true;

  // ── Dados originais (escalas injustas) ──
  const idades  = rawData.map((d) => d.idade);
  const tickets = rawData.map((d) => d.ticketMedio);
  const clusters = rawData.map((d) => d.cluster);

  // Cores por cluster para manter consistência visual
  const colors = clusters.map((c) => CLUSTER_COLORS[c] || '#718096');

  // Labels de hover
  const labels = rawData.map(
    (d) => `Cliente #${d.id}<br>` +
           `Cluster: ${d.cluster}<br>` +
           `Idade: ${d.idade} anos<br>` +
           `Ticket: R$ ${d.ticketMedio.toLocaleString('pt-BR')}`
  );

  // ── Trace (dados do gráfico) ──
  const trace = {
    type: 'scatter',
    mode: 'markers',
    x: idades,
    y: tickets,
    text: labels,
    hoverinfo: 'text',
    marker: {
      size: 12,
      color: colors,
      opacity: 0.85,
      line: {
        color: 'rgba(255, 255, 255, 0.2)',
        width: 1,
      },
    },
  };

  // ── Layout: escalas INJUSTAS (propositalmente desbalanceadas) ──
  const layout = buildLayout({
    title: '⚠️ Idade vs Dinheiro (Escalas Injustas)',
    subtitle: 'O Ticket Médio (R$) esmaga a Idade no gráfico',
    xTitle: 'Idade (anos)',
    yTitle: 'Ticket Médio (R$)',
    xRange: [0, 100],
    yRange: [0, 10000],
  });

  const config = {
    responsive: true,
    displayModeBar: false,
    displaylogo: false,
  };

  // ── Renderiza o gráfico ──
  Plotly.newPlot(containerId, [trace], layout, config);

  // ── Registra listener para o evento de padronização ──
  standardizeHandler = () => animateStandardization(containerId);
  eventBus.on('STANDARDIZE_CLICKED', standardizeHandler);
}


/**
 * Anima a transição de "escalas injustas" para "dados padronizados".
 * Chamada quando o usuário clica em "Padronizar Dados".
 *
 * Usa Plotly.animate() para uma transição fluida:
 *   - Os pontos se movem de (idade, ticketMedio) para (zIdade, zTicket)
 *   - Os eixos encolhem de (0-100, 0-10000) para (-3, +3)
 *   - O título muda para indicar "Dados Padronizados"
 *
 * @param {string} containerId — ID da div do gráfico.
 */
function animateStandardization(containerId) {
  if (!isActive) return;

  // ── Dados padronizados (Z-score) ──
  const zIdades  = standardizedData.map((d) => d.idade);
  const zTickets = standardizedData.map((d) => d.ticketMedio);
  const clusters = standardizedData.map((d) => d.cluster);
  const colors   = clusters.map((c) => CLUSTER_COLORS[c] || '#718096');

  // Labels atualizados
  const labels = standardizedData.map(
    (d) => `Cliente #${d.id}<br>` +
           `Cluster: ${d.cluster}<br>` +
           `Z-Idade: ${d.idade}<br>` +
           `Z-Ticket: ${d.ticketMedio}`
  );

  // ── Anima os dados (posição dos pontos) ──
  Plotly.animate(containerId, {
    data: [{
      x: zIdades,
      y: zTickets,
      text: labels,
      marker: {
        size: 14,
        color: colors,
        opacity: 0.9,
        line: {
          color: 'rgba(255, 255, 255, 0.3)',
          width: 1.5,
        },
      },
    }],
    layout: buildLayout({
      title: '✅ Dados Padronizados (Z-Score)',
      subtitle: 'Agora ambas as variáveis estão na mesma escala',
      xTitle: 'Idade (Z-Score)',
      yTitle: 'Ticket Médio (Z-Score)',
      xRange: [-3, 3],
      yRange: [-3, 3],
    }),
  }, {
    // Configuração da animação
    transition: {
      duration: 1200,
      easing: 'cubic-in-out',
    },
    frame: {
      duration: 1200,
      redraw: true,
    },
  });
}


/**
 * Constrói o objeto de layout do Plotly com tema escuro premium.
 * Função auxiliar para evitar duplicação entre o estado "antes" e "depois".
 *
 * @param {Object} opts — Opções do layout.
 * @param {string} opts.title    — Título principal.
 * @param {string} opts.subtitle — Subtítulo menor.
 * @param {string} opts.xTitle   — Label do eixo X.
 * @param {string} opts.yTitle   — Label do eixo Y.
 * @param {number[]} opts.xRange — [min, max] do eixo X.
 * @param {number[]} opts.yRange — [min, max] do eixo Y.
 * @returns {Object} — Objeto de layout para o Plotly.
 */
function buildLayout({ title, subtitle, xTitle, yTitle, xRange, yRange }) {
  return {
    title: {
      text: `${title}<br>` +
            `<sub style="font-size:11px; color:#718096;">${subtitle}</sub>`,
      font: {
        family: 'Inter, sans-serif',
        size: 16,
        color: '#e2e8f0',
      },
      x: 0.5,
      xanchor: 'center',
    },

    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',

    xaxis: {
      title: { text: xTitle, font: { color: '#a0aec0', size: 13 }, standoff: 15 },
      range: xRange,
      gridcolor: 'rgba(160, 174, 192, 0.1)',
      zerolinecolor: 'rgba(160, 174, 192, 0.25)',
      zerolinewidth: 1,
      tickfont: { color: '#718096', size: 11 },
      linecolor: 'rgba(160, 174, 192, 0.2)',
    },

    yaxis: {
      title: { text: yTitle, font: { color: '#a0aec0', size: 13 }, standoff: 10 },
      range: yRange,
      gridcolor: 'rgba(160, 174, 192, 0.1)',
      zerolinecolor: 'rgba(160, 174, 192, 0.25)',
      zerolinewidth: 1,
      tickfont: { color: '#718096', size: 11 },
      linecolor: 'rgba(160, 174, 192, 0.2)',
    },

    margin: { l: 65, r: 30, t: 70, b: 55 },
    showlegend: false,

    // Anotação: legenda de cores
    annotations: [
      {
        text: '🟣 VIP &nbsp;&nbsp; 🔵 Casual &nbsp;&nbsp; 🔴 Em Risco',
        font: { size: 11, color: '#718096' },
        showarrow: false,
        x: 0.5,
        y: -0.15,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'center',
      },
    ],
  };
}


/**
 * Remove o gráfico e limpa os listeners deste passo.
 *
 * @param {string} containerId — ID da div a limpar.
 * @returns {void}
 */
export function destroy(containerId) {
  isActive = false;

  // Remove o listener específico do STANDARDIZE_CLICKED
  if (standardizeHandler) {
    eventBus.off('STANDARDIZE_CLICKED', standardizeHandler);
    standardizeHandler = null;
  }

  Plotly.purge(containerId);
}
