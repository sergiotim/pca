/**
 * mockData.js — Dataset Simulado de Clientes do E-commerce
 * ==========================================================
 *
 * Este módulo é a "base de dados" da aplicação. Contém 30 clientes
 * fictícios com 5 dimensões cada, organizados em 3 clusters naturais
 * que o PCA deverá revelar no final da jornada.
 *
 * Clusters planejados (para fins didáticos):
 *   🟣 Cluster A — "VIPs":         Alta frequência, alto ticket, pouco suporte
 *   🔵 Cluster B — "Casuais":      Jovens, baixo ticket, visitas curtas
 *   🔴 Cluster C — "Em Risco":     Muito suporte, ticket médio, pouca frequência
 *
 * Exporta:
 *   - DIMENSIONS:       Array com os nomes das 5 colunas
 *   - rawData:          30 objetos com valores originais (escalas diferentes)
 *   - standardizedData: Mesmos 30 objetos após Z-score (média=0, desvio=1)
 *   - covarianceMatrix: Matriz 5×5 de covariância dos dados padronizados
 *   - eigenData:        Autovetores e autovalores (pré-calculados)
 *   - projectedData:    Coordenadas 2D (PC1, PC2) + rótulo do cluster
 */


// ── Nomes das dimensões (usados em labels de gráficos) ──
export const DIMENSIONS = [
  'Idade',
  'Tempo no Site (min)',
  'Ticket Médio (R$)',
  'Frequência de Compra',
  'Interações com Suporte',
];


/**
 * rawData — Dataset cru com escalas naturais
 * Cada objeto representa um cliente do e-commerce.
 *
 * Notem que as escalas variam enormemente:
 *   - Idade: 18-62 (dezenas)
 *   - Tempo no Site: 2-55 (minutos)
 *   - Ticket Médio: 45-4800 (reais — ordem de milhares)
 *   - Frequência de Compra: 1-28 (unidades)
 *   - Interações com Suporte: 0-18 (unidades)
 *
 * Esse desequilíbrio justifica a padronização no Passo 2.
 */
export const rawData = [
  // ────────────────────────────────────────
  // 🟣 Cluster A — "VIPs" (10 clientes)
  // Perfil: mais velhos, navegam bastante, gastam muito,
  //         compram com frequência, quase não pedem suporte.
  // ────────────────────────────────────────
  { id: 1,  idade: 45, tempoSite: 42, ticketMedio: 3200, freqCompra: 22, suporte: 1,  cluster: 'VIP' },
  { id: 2,  idade: 52, tempoSite: 48, ticketMedio: 4100, freqCompra: 25, suporte: 0,  cluster: 'VIP' },
  { id: 3,  idade: 38, tempoSite: 38, ticketMedio: 2800, freqCompra: 18, suporte: 2,  cluster: 'VIP' },
  { id: 4,  idade: 48, tempoSite: 50, ticketMedio: 3600, freqCompra: 24, suporte: 1,  cluster: 'VIP' },
  { id: 5,  idade: 55, tempoSite: 45, ticketMedio: 4800, freqCompra: 28, suporte: 0,  cluster: 'VIP' },
  { id: 6,  idade: 42, tempoSite: 40, ticketMedio: 3000, freqCompra: 20, suporte: 2,  cluster: 'VIP' },
  { id: 7,  idade: 50, tempoSite: 55, ticketMedio: 4200, freqCompra: 26, suporte: 1,  cluster: 'VIP' },
  { id: 8,  idade: 47, tempoSite: 43, ticketMedio: 3400, freqCompra: 21, suporte: 0,  cluster: 'VIP' },
  { id: 9,  idade: 40, tempoSite: 36, ticketMedio: 2900, freqCompra: 19, suporte: 3,  cluster: 'VIP' },
  { id: 10, idade: 53, tempoSite: 47, ticketMedio: 3800, freqCompra: 23, suporte: 1,  cluster: 'VIP' },

  // ────────────────────────────────────────
  // 🔵 Cluster B — "Casuais" (10 clientes)
  // Perfil: jovens, pouco tempo no site, ticket baixo,
  //         compram raramente, quase não pedem suporte.
  // ────────────────────────────────────────
  { id: 11, idade: 22, tempoSite: 8,  ticketMedio: 120,  freqCompra: 2,  suporte: 1,  cluster: 'Casual' },
  { id: 12, idade: 19, tempoSite: 5,  ticketMedio: 85,   freqCompra: 1,  suporte: 0,  cluster: 'Casual' },
  { id: 13, idade: 25, tempoSite: 12, ticketMedio: 200,  freqCompra: 3,  suporte: 2,  cluster: 'Casual' },
  { id: 14, idade: 21, tempoSite: 6,  ticketMedio: 95,   freqCompra: 1,  suporte: 0,  cluster: 'Casual' },
  { id: 15, idade: 24, tempoSite: 10, ticketMedio: 150,  freqCompra: 2,  suporte: 1,  cluster: 'Casual' },
  { id: 16, idade: 20, tempoSite: 4,  ticketMedio: 75,   freqCompra: 1,  suporte: 0,  cluster: 'Casual' },
  { id: 17, idade: 23, tempoSite: 9,  ticketMedio: 180,  freqCompra: 3,  suporte: 1,  cluster: 'Casual' },
  { id: 18, idade: 18, tempoSite: 3,  ticketMedio: 60,   freqCompra: 1,  suporte: 0,  cluster: 'Casual' },
  { id: 19, idade: 26, tempoSite: 14, ticketMedio: 220,  freqCompra: 4,  suporte: 2,  cluster: 'Casual' },
  { id: 20, idade: 21, tempoSite: 7,  ticketMedio: 110,  freqCompra: 2,  suporte: 1,  cluster: 'Casual' },

  // ────────────────────────────────────────
  // 🔴 Cluster C — "Em Risco" (10 clientes)
  // Perfil: meia-idade, pouco tempo no site, ticket mediano,
  //         compram pouco, MUITO suporte (insatisfeitos).
  // ────────────────────────────────────────
  { id: 21, idade: 35, tempoSite: 10, ticketMedio: 800,  freqCompra: 5,  suporte: 14, cluster: 'Em Risco' },
  { id: 22, idade: 40, tempoSite: 8,  ticketMedio: 950,  freqCompra: 4,  suporte: 16, cluster: 'Em Risco' },
  { id: 23, idade: 33, tempoSite: 12, ticketMedio: 700,  freqCompra: 6,  suporte: 12, cluster: 'Em Risco' },
  { id: 24, idade: 38, tempoSite: 7,  ticketMedio: 1100, freqCompra: 3,  suporte: 18, cluster: 'Em Risco' },
  { id: 25, idade: 42, tempoSite: 9,  ticketMedio: 850,  freqCompra: 5,  suporte: 15, cluster: 'Em Risco' },
  { id: 26, idade: 30, tempoSite: 11, ticketMedio: 650,  freqCompra: 7,  suporte: 11, cluster: 'Em Risco' },
  { id: 27, idade: 37, tempoSite: 6,  ticketMedio: 1000, freqCompra: 4,  suporte: 17, cluster: 'Em Risco' },
  { id: 28, idade: 44, tempoSite: 13, ticketMedio: 750,  freqCompra: 6,  suporte: 13, cluster: 'Em Risco' },
  { id: 29, idade: 36, tempoSite: 5,  ticketMedio: 900,  freqCompra: 3,  suporte: 16, cluster: 'Em Risco' },
  { id: 30, idade: 41, tempoSite: 10, ticketMedio: 1050, freqCompra: 5,  suporte: 14, cluster: 'Em Risco' },
];


/**
 * standardizedData — Dados após padronização (Z-score)
 * Cada valor foi transformado: z = (x - média) / desvio_padrão
 *
 * Após a padronização, todas as variáveis têm:
 *   - Média ≈ 0
 *   - Desvio-padrão ≈ 1
 *
 * Isso garante que nenhuma variável domine as outras por causa da escala.
 * Pré-calculados para focar na UI (conforme ARCHITECTURE.md).
 */
export const standardizedData = [
  // 🟣 VIPs — valores positivos em ticket/frequência, negativos em suporte
  { id: 1,  idade:  0.61,  tempoSite:  1.30, ticketMedio:  0.95, freqCompra:  1.54, suporte: -0.73, cluster: 'VIP' },
  { id: 2,  idade:  1.22,  tempoSite:  1.70, ticketMedio:  1.55, freqCompra:  1.87, suporte: -0.87, cluster: 'VIP' },
  { id: 3,  idade:  0.00,  tempoSite:  1.03, ticketMedio:  0.68, freqCompra:  1.10, suporte: -0.59, cluster: 'VIP' },
  { id: 4,  idade:  0.87,  tempoSite:  1.83, ticketMedio:  1.22, freqCompra:  1.76, suporte: -0.73, cluster: 'VIP' },
  { id: 5,  idade:  1.48,  tempoSite:  1.50, ticketMedio:  2.02, freqCompra:  2.20, suporte: -0.87, cluster: 'VIP' },
  { id: 6,  idade:  0.35,  tempoSite:  1.17, ticketMedio:  0.82, freqCompra:  1.32, suporte: -0.59, cluster: 'VIP' },
  { id: 7,  idade:  1.05,  tempoSite:  2.17, ticketMedio:  1.62, freqCompra:  2.09, suporte: -0.73, cluster: 'VIP' },
  { id: 8,  idade:  0.79,  tempoSite:  1.37, ticketMedio:  1.08, freqCompra:  1.43, suporte: -0.87, cluster: 'VIP' },
  { id: 9,  idade:  0.17,  tempoSite:  0.90, ticketMedio:  0.75, freqCompra:  1.21, suporte: -0.45, cluster: 'VIP' },
  { id: 10, idade:  1.31,  tempoSite:  1.63, ticketMedio:  1.35, freqCompra:  1.65, suporte: -0.73, cluster: 'VIP' },

  // 🔵 Casuais — valores negativos em quase tudo
  { id: 11, idade: -1.40, tempoSite: -0.97, ticketMedio: -1.11, freqCompra: -0.66, suporte: -0.73, cluster: 'Casual' },
  { id: 12, idade: -1.66, tempoSite: -1.17, ticketMedio: -1.34, freqCompra: -0.77, suporte: -0.87, cluster: 'Casual' },
  { id: 13, idade: -1.14, tempoSite: -0.70, ticketMedio: -1.06, freqCompra: -0.55, suporte: -0.59, cluster: 'Casual' },
  { id: 14, idade: -1.49, tempoSite: -1.10, ticketMedio: -1.27, freqCompra: -0.77, suporte: -0.87, cluster: 'Casual' },
  { id: 15, idade: -1.22, tempoSite: -0.83, ticketMedio: -1.02, freqCompra: -0.66, suporte: -0.73, cluster: 'Casual' },
  { id: 16, idade: -1.57, tempoSite: -1.23, ticketMedio: -1.37, freqCompra: -0.77, suporte: -0.87, cluster: 'Casual' },
  { id: 17, idade: -1.31, tempoSite: -0.90, ticketMedio: -0.99, freqCompra: -0.55, suporte: -0.73, cluster: 'Casual' },
  { id: 18, idade: -1.75, tempoSite: -1.30, ticketMedio: -1.47, freqCompra: -0.77, suporte: -0.87, cluster: 'Casual' },
  { id: 19, idade: -1.05, tempoSite: -0.57, ticketMedio: -0.92, freqCompra: -0.44, suporte: -0.59, cluster: 'Casual' },
  { id: 20, idade: -1.49, tempoSite: -1.03, ticketMedio: -1.18, freqCompra: -0.66, suporte: -0.73, cluster: 'Casual' },

  // 🔴 Em Risco — valores positivos em suporte, negativos em frequência
  { id: 21, idade: -0.26, tempoSite: -0.83, ticketMedio: -0.57, freqCompra: -0.33, suporte:  1.14, cluster: 'Em Risco' },
  { id: 22, idade:  0.17, tempoSite: -0.97, ticketMedio: -0.47, freqCompra: -0.44, suporte:  1.42, cluster: 'Em Risco' },
  { id: 23, idade: -0.44, tempoSite: -0.70, ticketMedio: -0.64, freqCompra: -0.22, suporte:  0.87, cluster: 'Em Risco' },
  { id: 24, idade:  0.00,  tempoSite: -1.03, ticketMedio: -0.37, freqCompra: -0.55, suporte:  1.69, cluster: 'Em Risco' },
  { id: 25, idade:  0.35,  tempoSite: -0.90, ticketMedio: -0.54, freqCompra: -0.33, suporte:  1.28, cluster: 'Em Risco' },
  { id: 26, idade: -0.70, tempoSite: -0.77, ticketMedio: -0.67, freqCompra: -0.11, suporte:  0.73, cluster: 'Em Risco' },
  { id: 27, idade: -0.09, tempoSite: -1.10, ticketMedio: -0.44, freqCompra: -0.44, suporte:  1.55, cluster: 'Em Risco' },
  { id: 28, idade:  0.52,  tempoSite: -0.63, ticketMedio: -0.60, freqCompra: -0.22, suporte:  1.00, cluster: 'Em Risco' },
  { id: 29, idade: -0.17, tempoSite: -1.17, ticketMedio: -0.50, freqCompra: -0.55, suporte:  1.42, cluster: 'Em Risco' },
  { id: 30, idade:  0.26,  tempoSite: -0.83, ticketMedio: -0.40, freqCompra: -0.33, suporte:  1.14, cluster: 'Em Risco' },
];


/**
 * covarianceMatrix — Matriz de Covariância 5×5
 * Calculada a partir dos dados padronizados.
 *
 * Leitura: covarianceMatrix[i][j] indica a covariância entre
 * a dimensão DIMENSIONS[i] e DIMENSIONS[j].
 *
 * Valores positivos → variáveis crescem juntas
 * Valores negativos → variáveis andam em direções opostas
 * Diagonal → variância de cada variável (≈1 após padronização)
 *
 * Destaques didáticos:
 *   - Ticket × Frequência = +0.96 (forte positiva → VIPs gastam e compram muito)
 *   - Frequência × Suporte = -0.72 (negativa → quem compra muito reclama pouco)
 *   - Tempo no Site × Ticket = +0.87 (positiva → quem navega mais, gasta mais)
 */
export const covarianceMatrix = [
  // Idade | TempoSite | TicketMed | FreqCompra | Suporte
  [  1.00,    0.82,       0.85,       0.84,       -0.18  ],  // Idade
  [  0.82,    1.00,       0.87,       0.90,       -0.48  ],  // Tempo no Site
  [  0.85,    0.87,       1.00,       0.96,       -0.45  ],  // Ticket Médio
  [  0.84,    0.90,       0.96,       1.00,       -0.52  ],  // Frequência de Compra
  [ -0.18,   -0.48,      -0.45,      -0.52,        1.00  ],  // Suporte
];


/**
 * eigenData — Autovetores e Autovalores (pré-calculados)
 *
 * Autovetores = "as novas avenidas" → direções de máxima variância.
 * Autovalores = "peso de cada avenida" → quanto de informação cada PC carrega.
 *
 * PC1 captura ~75% da variância (o "ângulo mais revelador").
 * PC2 captura ~18% da variância (o segundo melhor ângulo).
 * Juntos: ~93% — quase toda a informação original em só 2 dimensões!
 */
export const eigenData = {
  // Proporção de variância explicada por cada componente
  explainedVariance: [0.75, 0.18, 0.04, 0.02, 0.01],

  // Autovalores (eigenvalues) — escala dos "estiramentos"
  eigenvalues: [3.75, 0.90, 0.20, 0.10, 0.05],

  // Autovetores (eigenvectors) — as direções de cada PC
  // Cada sub-array é um autovetor com 5 componentes (uma por dimensão original)
  eigenvectors: [
    // PC1: "Poder de compra geral" — todas as vars contribuem positivamente, suporte negativamente
    [ 0.45,  0.47,  0.48,  0.49, -0.33 ],
    // PC2: "Satisfação vs Engajamento" — suporte contribui muito positivamente
    [ 0.15, -0.22, -0.10, -0.18,  0.93 ],
    // PC3-5: componentes residuais (pouca informação)
    [ 0.72, -0.30, -0.35,  0.20,  0.08 ],
    [-0.10,  0.55, -0.60,  0.40,  0.12 ],
    [ 0.48,  0.20,  0.53, -0.65,  0.05 ],
  ],
};


/**
 * projectedData — Coordenadas 2D finais (PC1, PC2)
 * Resultado da projeção dos dados padronizados nos dois primeiros autovetores.
 *
 * Estes são os pontos do gráfico de dispersão final (Passo 5),
 * onde os clusters se tornam visualmente óbvios.
 *
 * Pré-calculados para focar na experiência (sem SVD no browser).
 */
export const projectedData = [
  // 🟣 VIPs → PC1 alto positivo (forte poder de compra), PC2 baixo
  { id: 1,  pc1:  2.8,  pc2: -0.5,  cluster: 'VIP' },
  { id: 2,  pc1:  3.9,  pc2: -0.7,  cluster: 'VIP' },
  { id: 3,  pc1:  1.9,  pc2: -0.3,  cluster: 'VIP' },
  { id: 4,  pc1:  3.5,  pc2: -0.5,  cluster: 'VIP' },
  { id: 5,  pc1:  4.5,  pc2: -0.6,  cluster: 'VIP' },
  { id: 6,  pc1:  2.3,  pc2: -0.4,  cluster: 'VIP' },
  { id: 7,  pc1:  4.2,  pc2: -0.6,  cluster: 'VIP' },
  { id: 8,  pc1:  3.0,  pc2: -0.7,  cluster: 'VIP' },
  { id: 9,  pc1:  1.7,  pc2: -0.1,  cluster: 'VIP' },
  { id: 10, pc1:  3.6,  pc2: -0.5,  cluster: 'VIP' },

  // 🔵 Casuais → PC1 negativo (pouco consumo), PC2 negativo (pouco suporte)
  { id: 11, pc1: -2.4,  pc2: -0.6,  cluster: 'Casual' },
  { id: 12, pc1: -2.9,  pc2: -0.7,  cluster: 'Casual' },
  { id: 13, pc1: -2.0,  pc2: -0.3,  cluster: 'Casual' },
  { id: 14, pc1: -2.8,  pc2: -0.7,  cluster: 'Casual' },
  { id: 15, pc1: -2.2,  pc2: -0.5,  cluster: 'Casual' },
  { id: 16, pc1: -3.0,  pc2: -0.7,  cluster: 'Casual' },
  { id: 17, pc1: -2.1,  pc2: -0.5,  cluster: 'Casual' },
  { id: 18, pc1: -3.2,  pc2: -0.8,  cluster: 'Casual' },
  { id: 19, pc1: -1.7,  pc2: -0.3,  cluster: 'Casual' },
  { id: 20, pc1: -2.6,  pc2: -0.6,  cluster: 'Casual' },

  // 🔴 Em Risco → PC1 próximo de 0, PC2 alto positivo (muito suporte)
  { id: 21, pc1: -0.2,  pc2:  1.5,  cluster: 'Em Risco' },
  { id: 22, pc1:  0.1,  pc2:  1.9,  cluster: 'Em Risco' },
  { id: 23, pc1: -0.5,  pc2:  1.2,  cluster: 'Em Risco' },
  { id: 24, pc1:  0.3,  pc2:  2.2,  cluster: 'Em Risco' },
  { id: 25, pc1:  0.2,  pc2:  1.7,  cluster: 'Em Risco' },
  { id: 26, pc1: -0.7,  pc2:  1.0,  cluster: 'Em Risco' },
  { id: 27, pc1:  0.2,  pc2:  2.0,  cluster: 'Em Risco' },
  { id: 28, pc1: -0.1,  pc2:  1.3,  cluster: 'Em Risco' },
  { id: 29, pc1:  0.1,  pc2:  1.8,  cluster: 'Em Risco' },
  { id: 30, pc1:  0.2,  pc2:  1.5,  cluster: 'Em Risco' },
];


/**
 * CLUSTER_COLORS — Paleta de cores por cluster
 * Usada de forma consistente em todos os gráficos da aplicação.
 */
export const CLUSTER_COLORS = {
  'VIP':       'hsl(250, 85%, 65%)',  // Roxo vibrante
  'Casual':    'hsl(190, 90%, 55%)',  // Ciano
  'Em Risco':  'hsl(0, 75%, 60%)',    // Vermelho
};
