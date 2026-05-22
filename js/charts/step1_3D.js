/**
 * step1_3D.js — Gráfico 3D "A Maldição da Dimensionalidade"
 * ============================================================
 *
 * Este módulo renderiza o gráfico do Passo 1: um scatter 3D do Plotly
 * que tenta representar 5 variáveis simultaneamente, resultando em
 * um visual confuso e sobrecarregado de propósito.
 *
 * Mapeamento das 5 dimensões:
 *   Eixo X  → Idade
 *   Eixo Y  → Ticket Médio (R$)
 *   Eixo Z  → Tempo no Site (min)
 *   Tamanho → Frequência de Compra (marker.size)
 *   Cor     → Interações com Suporte (marker.color, escala de calor)
 *
 * O objetivo didático é que o aluno olhe para este gráfico e pense:
 * "Isso é um caos, preciso de algo melhor!" — justificando o PCA.
 *
 * Exporta:
 *   render(containerId)  → Cria o gráfico na div informada
 *   destroy(containerId) → Limpa o gráfico com Plotly.purge()
 */

import { rawData } from '../data/mockData.js';


/**
 * Renderiza o scatter 3D "caótico" no container informado.
 *
 * @param {string} containerId — ID da div onde o Plotly vai desenhar.
 * @returns {void}
 */
export function render(containerId) {
  // ── Extrai as 5 dimensões dos dados brutos ──
  const idades       = rawData.map((d) => d.idade);
  const tickets      = rawData.map((d) => d.ticketMedio);
  const temposSite   = rawData.map((d) => d.tempoSite);
  const frequencias  = rawData.map((d) => d.freqCompra);
  const suportes     = rawData.map((d) => d.suporte);

  // Labels com o ID do cliente para aparecer no hover
  const labels = rawData.map(
    (d) => `Cliente #${d.id}<br>` +
           `Cluster: ${d.cluster}<br>` +
           `Idade: ${d.idade}<br>` +
           `Ticket: R$ ${d.ticketMedio.toLocaleString('pt-BR')}<br>` +
           `Tempo: ${d.tempoSite} min<br>` +
           `Freq. Compra: ${d.freqCompra}<br>` +
           `Suporte: ${d.suporte}`
  );

  // ── Configuração do trace (dados do gráfico) ──
  const trace = {
    type: 'scatter3d',
    mode: 'markers',

    // Eixos: 3 das 5 dimensões
    x: idades,
    y: tickets,
    z: temposSite,

    // Texto de hover detalhado
    text: labels,
    hoverinfo: 'text',

    marker: {
      // 4ª dimensão: tamanho proporcional à Frequência de Compra
      // Escala o tamanho para ficar entre 6 e 28 pixels
      size: frequencias.map((f) => Math.max(6, f * 1.0)),

      // 5ª dimensão: cor baseada nas Interações com Suporte
      // Escala de calor: poucos chamados = frio (azul) → muitos = quente (vermelho)
      color: suportes,
      colorscale: [
        [0.0, 'hsl(190, 90%, 55%)'],   // Ciano — poucas interações
        [0.3, 'hsl(250, 85%, 65%)'],   // Roxo — intermediário
        [0.6, 'hsl(330, 80%, 60%)'],   // Rosa — muitas interações
        [1.0, 'hsl(0, 75%, 60%)'],     // Vermelho — suporte crítico
      ],
      colorbar: {
        title: {
          text: 'Suporte',
          font: { color: '#a0aec0', size: 12 },
        },
        tickfont: { color: '#a0aec0', size: 10 },
        bgcolor: 'rgba(0,0,0,0)',
        borderwidth: 0,
        len: 0.6,
        thickness: 12,
      },

      opacity: 0.85,
      line: {
        color: 'rgba(255, 255, 255, 0.15)',
        width: 0.5,
      },
    },
  };

  // ── Layout do gráfico: tema escuro premium ──
  const layout = {
    title: {
      text: '⚠️ A Maldição da Dimensionalidade<br>' +
            '<sub style="font-size:11px; color:#718096;">Tentando visualizar 5 Variáveis ao mesmo tempo</sub>',
      font: {
        family: 'Inter, sans-serif',
        size: 16,
        color: '#e2e8f0',
      },
      x: 0.5,
      xanchor: 'center',
    },

    // Fundo transparente para integrar com o glassmorphism do container
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',

    // Configuração da cena 3D
    scene: {
      // Eixo X: Idade
      xaxis: {
        title: { text: 'Idade', font: { color: '#a0aec0', size: 12 } },
        gridcolor: 'rgba(160, 174, 192, 0.1)',
        zerolinecolor: 'rgba(160, 174, 192, 0.2)',
        tickfont: { color: '#718096', size: 10 },
        backgroundcolor: 'rgba(0,0,0,0)',
      },
      // Eixo Y: Ticket Médio
      yaxis: {
        title: { text: 'Ticket Médio (R$)', font: { color: '#a0aec0', size: 12 } },
        gridcolor: 'rgba(160, 174, 192, 0.1)',
        zerolinecolor: 'rgba(160, 174, 192, 0.2)',
        tickfont: { color: '#718096', size: 10 },
        backgroundcolor: 'rgba(0,0,0,0)',
      },
      // Eixo Z: Tempo no Site
      zaxis: {
        title: { text: 'Tempo no Site (min)', font: { color: '#a0aec0', size: 12 } },
        gridcolor: 'rgba(160, 174, 192, 0.1)',
        zerolinecolor: 'rgba(160, 174, 192, 0.2)',
        tickfont: { color: '#718096', size: 10 },
        backgroundcolor: 'rgba(0,0,0,0)',
      },

      // Câmera posicionada para dar uma visão ligeiramente inclinada
      camera: {
        eye: { x: 1.8, y: 1.8, z: 1.2 },
        center: { x: 0, y: 0, z: -0.1 },
      },

      // Proporção dos eixos (não forçar aspectratio uniforme)
      aspectmode: 'data',
    },

    // Margem ajustada para aproveitar o espaço do container
    margin: { l: 0, r: 0, t: 60, b: 0 },

    // Anotação extra: legenda do tamanho das bolinhas
    annotations: [
      {
        text: '● Tamanho = Freq. Compra &nbsp;&nbsp; 🎨 Cor = Suporte',
        font: { size: 11, color: '#718096' },
        showarrow: false,
        x: 0.5,
        y: -0.02,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'center',
      },
    ],

    // Desabilita o logo do Plotly para um visual limpo
    showlegend: false,
  };

  // ── Opções de configuração do Plotly ──
  const config = {
    responsive: true,           // Redimensiona com a janela
    displayModeBar: true,       // Mostra barra de ferramentas
    modeBarButtonsToRemove: [
      'toImage',                // Remove botão de exportar imagem
      'sendDataToCloud',        // Remove botão de compartilhar
    ],
    displaylogo: false,         // Remove logo do Plotly
  };

  // ── Renderiza o gráfico ──
  Plotly.newPlot(containerId, [trace], layout, config);
}


/**
 * Remove o gráfico do container, liberando memória.
 *
 * @param {string} containerId — ID da div a limpar.
 * @returns {void}
 */
export function destroy(containerId) {
  Plotly.purge(containerId);
}
