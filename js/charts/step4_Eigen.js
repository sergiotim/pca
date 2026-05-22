/**
 * step4_Eigen.js — As Novas Avenidas (Autovetores e Autovalores)
 * ==============================================================
 */

import { standardizedData, CLUSTER_COLORS } from '../data/mockData.js';
import { calculatePrincipalComponents } from '../data/pcaMath.js';
import { eventBus } from '../core/eventBus.js';

let isActive = false;
let eigenAllHandler = null;

// Geração dos pares de linhas perpendiculares (4 pares)
// Usamos ângulos fixos para estabilidade
const angles = [-20, 10, 35, 60]; 
// 35 é o ângulo do PC1

function getShapes(highlightBest) {
  const shapes = [];
  const pca = calculatePrincipalComponents();
  const slope1 = pca.pc1.slope;
  const slope2 = pca.pc2.slope;

  angles.forEach(angle => {
    const s1 = Math.tan(angle * Math.PI / 180);
    const s2 = -1 / s1;

    if (highlightBest && angle === 35) {
      // Destaque para o PC1 e PC2
      shapes.push({
        type: 'line',
        x0: -4, y0: -4 * slope1,
        x1: 4, y1: 4 * slope1,
        line: { color: '#36d6b5', width: 4, dash: 'solid' }, // PC1
      });
      shapes.push({
        type: 'line',
        x0: -2.8, y0: -2.8 * slope2,
        x1: 2.8, y1: 2.8 * slope2,
        line: { color: '#f59e0b', width: 3, dash: 'solid' }, // PC2
      });
    } else {
      // Pares "aleatórios" ou desbotados
      const opacity = highlightBest ? '0.05' : '0.2';
      const width = highlightBest ? 1 : 1.5;
      
      shapes.push({
        type: 'line',
        x0: -4, y0: -4 * s1,
        x1: 4, y1: 4 * s1,
        line: { color: `rgba(255, 255, 255, ${opacity})`, width: width, dash: 'dot' },
      });
      shapes.push({
        type: 'line',
        x0: -4, y0: -4 * s2,
        x1: 4, y1: 4 * s2,
        line: { color: `rgba(255, 255, 255, ${opacity})`, width: width, dash: 'dot' },
      });
    }
  });

  return shapes;
}

export function render(containerId) {
  isActive = true;

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
    subtitle: 'Qual par de eixos captura a maior variação dos pontos?',
    shapes: getShapes(false),
    annotations: [],
  });

  const config = { responsive: true, displayModeBar: false };
  Plotly.newPlot(containerId, [trace], layout, config);

  eigenAllHandler = () => animateEigenvectorsAll(containerId);
  eventBus.on('EIGENVECTORS_ALL_CLICKED', eigenAllHandler);
}

function animateEigenvectorsAll(containerId) {
  if (!isActive) return;

  const pca = calculatePrincipalComponents();
  const variance1 = pca.variances.pc1;
  const variance2 = pca.variances.pc2;
  const slope1 = pca.pc1.slope;
  const slope2 = pca.pc2.slope;

  Plotly.animate(containerId, {
    layout: {
      title: {
        text: `✅ Autovetores encontrados!<br><sub style="font-size:11px; color:#718096;">O melhor par (PC1 e PC2) explica ${variance1 + variance2}% da informação conjunta!</sub>`,
        font: { family: 'Inter, sans-serif', size: 16, color: '#e2e8f0' },
        x: 0.5,
        xanchor: 'center',
      },
      shapes: getShapes(true),
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
          x: 2.8, y: 2.8 * slope2 + 0.4,
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

function buildLayout({ title, subtitle, shapes, annotations }) {
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
    shapes: shapes,
    annotations: annotations,
    showlegend: false,
    margin: { l: 65, r: 30, t: 70, b: 55 },
  };
}

export function destroy(containerId) {
  isActive = false;
  if (eigenAllHandler) {
    eventBus.off('EIGENVECTORS_ALL_CLICKED', eigenAllHandler);
    eigenAllHandler = null;
  }
  Plotly.purge(containerId);
}
