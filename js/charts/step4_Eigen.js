/**
 * step4_Eigen.js — As Novas Avenidas (Autovetores e Autovalores)
 * ==============================================================
 *
 * Este módulo renderiza o gráfico do Passo 4:
 *
 * Objetivo: Mostrar visualmente como o PCA encontra a reta (Autovetor)
 * que atravessa a maior dispersão (variância) dos dados.
 *
 * Estados:
 *   1. ANTES: Nuvem de pontos genérica (Idade vs Tempo no Site, padronizados).
 *      Uma reta horizontal "giratória" aparece no meio.
 *   2. DEPOIS (ao clicar "Encontrar o melhor ângulo"):
 *      - A reta gira (animada) até o ângulo ideal calculado (PC1).
 *      - Mostra uma anotação identificando a reta como "PC1".
 *      - Título do gráfico atualiza para refletir o sucesso.
 *
 * Exporta:
 *   render(containerId)
 *   destroy(containerId)
 */

import { standardizedData, CLUSTER_COLORS } from '../data/mockData.js';
import { calculatePrincipalComponents } from '../data/pcaMath.js';
import { eventBus } from '../core/eventBus.js';

let isActive = false;
let eigenHandler = null;
let eigen2Handler = null;


/**
 * Renderiza o Scatter inicial com a linha na horizontal (sem rotação).
 *
 * @param {string} containerId — ID do container.
 */
export function render(containerId) {
  isActive = true;

  // Usamos Idade e Tempo no Site padronizados
  const idades = standardizedData.map((d) => d.idade);
  const tempos = standardizedData.map((d) => d.tempoSite);
  const clusters = standardizedData.map((d) => d.cluster);
  const colors = clusters.map((c) => CLUSTER_COLORS[c] || '#718096');

  const trace = {
    type: 'scatter',
    mode: 'markers',
    x: idades,
    y: tempos,
    text: standardizedData.map(d => `Cluster: ${d.cluster}`),
    hoverinfo: 'text',
    marker: {
      size: 14,
      color: colors,
      opacity: 0.8,
      line: { color: 'rgba(255,255,255,0.2)', width: 1 },
    },
  };

  const layout = buildLayout({
    title: 'Buscando a Avenida Principal (Autovetores)',
    subtitle: 'Qual ângulo captura a maior variação dos pontos?',
    // Linha horizontal inicialmente
    lineX0: -4,
    lineY0: 0,
    lineX1: 4,
    lineY1: 0,
    annotations: [], // Sem anotação de PC1 ainda
  });

  // Linha fantasma para o PC2 (será revelada depois)
  layout.shapes.push({
    type: 'line',
    x0: 0, y0: 0, x1: 0, y1: 0,
    line: { color: 'transparent', width: 3, dash: 'dash' }
  });

  const config = { responsive: true, displayModeBar: false };
  Plotly.newPlot(containerId, [trace], layout, config);

  // ── Listener para o botão de encontrar o ângulo ──
  eigenHandler = () => animateEigenvector(containerId);
  eventBus.on('EIGENVECTORS_CLICKED', eigenHandler);
  
  eigen2Handler = () => animatePC2(containerId);
  eventBus.on('EIGENVECTORS2_CLICKED', eigen2Handler);
}


/**
 * Anima a rotação da linha até o ângulo ideal (PC1).
 */
function animateEigenvector(containerId) {
  if (!isActive) return;

  // Busca os dados matemáticos (mock) do PCA
  const pca = calculatePrincipalComponents();
  const slope = pca.pc1.slope; // ≈ 0.7
  const variance = pca.variances.pc1; // 75

  // Calcula a posição Y final da linha baseada no slope (y = mx)
  const y0_final = -4 * slope;
  const y1_final = 4 * slope;

  // Usa Plotly.animate para criar uma transição suave da linha girando
  Plotly.animate(containerId, {
    layout: buildLayout({
      title: '✅ Autovetores: O ângulo com maior variância',
      subtitle: `Este eixo (PC1) explica ${variance}% de toda a informação!`,
      // Linha rotacionada
      lineX0: -4,
      lineY0: y0_final,
      lineX1: 4,
      lineY1: y1_final,
      // Anotação que aparece no final da linha
      annotations: [
        {
          x: 3.5,
          y: 3.5 * slope + 0.3,
          text: 'PC1 (A Avenida Principal)',
          showarrow: false,
          font: { color: '#36d6b5', size: 13, weight: 'bold' },
          bgcolor: 'rgba(20, 25, 40, 0.8)',
          bordercolor: '#36d6b5',
          borderwidth: 1,
          borderpad: 4,
        },
      ],
    }),
  }, {
    transition: { duration: 1500, easing: 'cubic-in-out' },
    frame: { duration: 1500, redraw: false },
  }).then(() => {
    // Preserva a linha fantasma do PC2 no layout construído
    const currentLayout = document.getElementById(containerId).layout;
    if (currentLayout.shapes.length < 2) {
      Plotly.relayout(containerId, {
        shapes: [
          currentLayout.shapes[0],
          { type: 'line', x0: 0, y0: 0, x1: 0, y1: 0, line: { color: 'transparent', width: 3, dash: 'dash' } }
        ]
      });
    }
  });
}

/**
 * Anima a criação do eixo PC2 (ortogonal ao PC1).
 */
function animatePC2(containerId) {
  if (!isActive) return;

  const pca = calculatePrincipalComponents();
  const slope1 = pca.pc1.slope;
  const slope2 = pca.pc2.slope;
  const variance1 = pca.variances.pc1;
  const variance2 = pca.variances.pc2;

  const pc2_x0 = -2.8;
  const pc2_y0 = pc2_x0 * slope2;
  const pc2_x1 = 2.8;
  const pc2_y1 = pc2_x1 * slope2;

  const y0_final = -4 * slope1;
  const y1_final = 4 * slope1;

  Plotly.animate(containerId, {
    layout: {
      title: {
        text: `✅ PC1 e PC2 encontrados!<br><sub style="font-size:11px; color:#718096;">Formam um ângulo de 90° e explicam ${variance1 + variance2}% da informação conjunta!</sub>`,
        font: { family: 'Inter, sans-serif', size: 16, color: '#e2e8f0' },
        x: 0.5,
        xanchor: 'center',
      },
      shapes: [
        {
          type: 'line',
          x0: -4, y0: y0_final,
          x1: 4, y1: y1_final,
          line: { color: '#36d6b5', width: 3, dash: 'dash' },
        },
        {
          type: 'line',
          x0: pc2_x0, y0: pc2_y0,
          x1: pc2_x1, y1: pc2_y1,
          line: { color: '#f59e0b', width: 3, dash: 'dash' },
        }
      ],
      annotations: [
        {
          x: 3.5, y: 3.5 * slope1 + 0.3,
          text: 'PC1',
          showarrow: false,
          font: { color: '#36d6b5', size: 13, weight: 'bold' },
          bgcolor: 'rgba(20, 25, 40, 0.8)',
          bordercolor: '#36d6b5', borderwidth: 1, borderpad: 4,
        },
        {
          x: pc2_x1, y: pc2_y1 + 0.4,
          text: 'PC2',
          showarrow: false,
          font: { color: '#f59e0b', size: 13, weight: 'bold' },
          bgcolor: 'rgba(20, 25, 40, 0.8)',
          bordercolor: '#f59e0b', borderwidth: 1, borderpad: 4,
        }
      ]
    }
  }, {
    transition: { duration: 1500, easing: 'cubic-in-out' },
    frame: { duration: 1500, redraw: false },
  });
}


/**
 * Auxiliar para construir o layout com o "Shape" da reta do Autovetor.
 */
function buildLayout({ title, subtitle, lineX0, lineY0, lineX1, lineY1, annotations }) {
  return {
    title: {
      text: `${title}<br><sub style="font-size:11px; color:#718096;">${subtitle}</sub>`,
      font: { family: 'Inter, sans-serif', size: 16, color: '#e2e8f0' },
      x: 0.5,
      xanchor: 'center',
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    xaxis: {
      title: { text: 'Idade (Z-Score)', font: { color: '#a0aec0', size: 13 }, standoff: 10 },
      range: [-4, 4],
      gridcolor: 'rgba(160, 174, 192, 0.1)',
      zerolinecolor: 'rgba(160, 174, 192, 0.3)',
      tickfont: { color: '#718096', size: 11 },
    },
    yaxis: {
      title: { text: 'Tempo no Site (Z-Score)', font: { color: '#a0aec0', size: 13 }, standoff: 10 },
      range: [-4, 4],
      gridcolor: 'rgba(160, 174, 192, 0.1)',
      zerolinecolor: 'rgba(160, 174, 192, 0.3)',
      tickfont: { color: '#718096', size: 11 },
    },
    // A Reta do Autovetor
    shapes: [
      {
        type: 'line',
        x0: lineX0,
        y0: lineY0,
        x1: lineX1,
        y1: lineY1,
        line: {
          color: '#36d6b5',
          width: 3,
          dash: 'dash',
        },
      },
    ],
    annotations: annotations,
    showlegend: false,
    margin: { l: 65, r: 30, t: 70, b: 55 },
  };
}


/**
 * Cleanup.
 */
export function destroy(containerId) {
  isActive = false;
  if (eigenHandler) {
    eventBus.off('EIGENVECTORS_CLICKED', eigenHandler);
    eigenHandler = null;
  }
  if (eigen2Handler) {
    eventBus.off('EIGENVECTORS2_CLICKED', eigen2Handler);
    eigen2Handler = null;
  }
  Plotly.purge(containerId);
}
