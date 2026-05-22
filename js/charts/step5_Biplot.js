/**
 * step5_Biplot.js — A Mágica da Projeção 2D
 * ==============================================================
 *
 * Este módulo renderiza o gráfico do Passo 5 (Final):
 *
 * Objetivo: Mostrar o resultado prático do PCA. Pegamos 5 dimensões
 * complexas e as "esmagamos" em 2 eixos (PC1 e PC2), revelando
 * claramente os clusters/perfis de clientes que antes estavam
 * escondidos na confusão multidimensional.
 *
 * Exporta:
 *   render(containerId)
 *   destroy(containerId)
 */

import { projectedData, CLUSTER_COLORS } from '../data/mockData.js';


/**
 * Renderiza o Biplot (Gráfico de Dispersão 2D com as componentes principais).
 *
 * @param {string} containerId — ID do container.
 */
export function render(containerId) {
  // ── Agrupando os dados por Cluster para gerar traces separados ──
  // Isso permite que o Plotly crie uma legenda interativa nativa
  // (o usuário pode clicar na legenda para esconder/mostrar grupos)
  
  const groups = {
    'VIP': { x: [], y: [], text: [], color: CLUSTER_COLORS['VIP'] },
    'Casual': { x: [], y: [], text: [], color: CLUSTER_COLORS['Casual'] },
    'Em Risco': { x: [], y: [], text: [], color: CLUSTER_COLORS['Em Risco'] },
  };

  projectedData.forEach((d) => {
    const group = groups[d.cluster];
    if (group) {
      group.x.push(d.pc1);
      group.y.push(d.pc2);
      // Usamos apenas o ID no text, pois o grupo será fixo no hovertemplate
      group.text.push(`#${d.id}`);
    }
  });

  // ── Criando os Traces para o Plotly ──
  const traces = Object.keys(groups).map((clusterName) => {
    const group = groups[clusterName];
    
    return {
      name: clusterName,
      type: 'scatter',
      mode: 'markers',
      x: group.x,
      y: group.y,
      text: group.text,
      
      // Hovertemplate formatado exatamente como pedido no PRD
      // A tag <extra></extra> remove aquela caixinha extra com o nome do trace
      hovertemplate: 
        `Cliente: %{text}<br>` +
        `Grupo: ${clusterName}<br>` +
        `PC1: %{x:.2f} | PC2: %{y:.2f}<extra></extra>`,

      marker: {
        size: 14,
        color: group.color,
        opacity: 0.85,
        line: { color: 'rgba(255, 255, 255, 0.3)', width: 1.5 },
      },
    };
  });


  // ── Layout do Gráfico ──
  const layout = {
    title: {
      text: 'Projeção 2D: Perfis de Clientes Revelados!<br>' +
            '<sub style="font-size:11px; color:#718096;">De 5 variáveis complexas para apenas 2 eixos claros</sub>',
      font: { family: 'Inter, sans-serif', size: 16, color: '#e2e8f0' },
      x: 0.5,
      xanchor: 'center',
    },
    
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { l: 65, r: 30, t: 70, b: 55 },
    
    // Mostra a legenda com os nomes dos grupos
    showlegend: true,
    legend: {
      font: { color: '#e2e8f0' },
      bgcolor: 'rgba(20, 25, 40, 0.5)',
      bordercolor: 'rgba(255, 255, 255, 0.1)',
      borderwidth: 1,
      x: 1,
      xanchor: 'right',
      y: 1,
      yanchor: 'top',
    },

    xaxis: {
      title: { text: 'PC1 - Engajamento', font: { color: '#a0aec0', size: 13 }, standoff: 10 },
      gridcolor: 'rgba(160, 174, 192, 0.1)',
      zerolinecolor: 'rgba(160, 174, 192, 0.3)',
      tickfont: { color: '#718096', size: 11 },
    },
    
    yaxis: {
      title: { text: 'PC2 - Risco de Churn ', font: { color: '#a0aec0', size: 13 }, standoff: 10 },
      gridcolor: 'rgba(160, 174, 192, 0.1)',
      zerolinecolor: 'rgba(160, 174, 192, 0.3)',
      tickfont: { color: '#718096', size: 11 },
    },
  };

  const config = {
    responsive: true,
    displayModeBar: false,
  };

  Plotly.newPlot(containerId, traces, layout, config);
}


/**
 * Cleanup.
 */
export function destroy(containerId) {
  Plotly.purge(containerId);
}
