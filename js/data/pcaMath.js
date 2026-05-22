/**
 * pcaMath.js — Utilitários Matemáticos para Transformações de Dados
 * ===================================================================
 *
 * Este módulo contém as funções de cálculo que o site usa para
 * demonstrar visualmente as etapas do PCA. Embora os dados finais
 * já estejam pré-calculados em mockData.js, estas funções permitem:
 *
 *   1. Calcular Z-score em tempo real (para a animação do Passo 2)
 *   2. Extrair estatísticas descritivas (média, desvio-padrão)
 *   3. Auxiliar na geração de dados intermediários para animações
 *
 * NOTA: Não implementamos SVD/decomposição espectral completa aqui —
 *       os autovetores e projeções estão pré-calculados em mockData.js
 *       conforme orientação do ARCHITECTURE.md.
 */


/**
 * Calcula a média aritmética de um array de números.
 *
 * @param {number[]} values — Array de valores numéricos.
 * @returns {number} — Média aritmética.
 *
 * @example
 *   mean([10, 20, 30]) // → 20
 */
export function mean(values) {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}


/**
 * Calcula o desvio-padrão (populacional) de um array de números.
 * Usamos a fórmula populacional (divisão por N) pois trabalhamos
 * com a população inteira de clientes simulados.
 *
 * @param {number[]} values — Array de valores numéricos.
 * @returns {number} — Desvio-padrão.
 *
 * @example
 *   stdDev([10, 20, 30]) // → 8.165...
 */
export function stdDev(values) {
  if (!values || values.length === 0) return 0;
  const avg = mean(values);
  const squaredDiffs = values.map((val) => (val - avg) ** 2);
  return Math.sqrt(mean(squaredDiffs));
}


/**
 * Aplica a padronização Z-score em um array de valores.
 * Z = (valor - média) / desvio_padrão
 *
 * Resultado: cada valor indica "quantos desvios-padrão" ele está
 * acima (positivo) ou abaixo (negativo) da média.
 *
 * @param {number[]} values — Array de valores originais.
 * @returns {{ zScores: number[], mean: number, stdDev: number }}
 *   - zScores: valores padronizados
 *   - mean: média original (para exibir na UI)
 *   - stdDev: desvio-padrão original (para exibir na UI)
 *
 * @example
 *   zScore([100, 200, 300])
 *   // → { zScores: [-1, 0, 1], mean: 200, stdDev: 81.65 }
 */
export function zScore(values) {
  const avg = mean(values);
  const sd = stdDev(values);

  // Proteção contra divisão por zero (todos os valores iguais)
  if (sd === 0) {
    return {
      zScores: values.map(() => 0),
      mean: avg,
      stdDev: 0,
    };
  }

  const zScores = values.map((val) => +((val - avg) / sd).toFixed(2));

  return { zScores, mean: avg, stdDev: sd };
}


/**
 * Extrai os valores de uma coluna específica de um array de objetos.
 * Útil para isolar uma dimensão do dataset antes de calcular estatísticas.
 *
 * @param {Object[]} data — Array de objetos (cada objeto é um cliente).
 * @param {string} key — Nome da propriedade a extrair (ex: 'idade').
 * @returns {number[]} — Array com os valores daquela coluna.
 *
 * @example
 *   extractColumn(rawData, 'idade') // → [45, 52, 38, ...]
 */
export function extractColumn(data, key) {
  return data.map((item) => item[key]);
}


/**
 * Padroniza todas as dimensões numéricas de um dataset de uma vez.
 * Aplica Z-score em cada coluna, retornando um dataset padronizado.
 *
 * @param {Object[]} data — Array de clientes (objetos com campos numéricos).
 * @param {string[]} keys — Nomes das colunas numéricas a padronizar.
 * @returns {{ data: Object[], stats: Object }}
 *   - data: novo array com valores padronizados
 *   - stats: estatísticas por coluna { key: { mean, stdDev } }
 *
 * @example
 *   standardize(rawData, ['idade', 'ticketMedio'])
 */
export function standardize(data, keys) {
  const stats = {};
  const columns = {};

  // Passo 1: Calcular Z-score de cada coluna
  keys.forEach((key) => {
    const values = extractColumn(data, key);
    const result = zScore(values);
    columns[key] = result.zScores;
    stats[key] = { mean: result.mean, stdDev: result.stdDev };
  });

  // Passo 2: Reconstruir o array de objetos com valores padronizados
  const standardized = data.map((item, i) => {
    const newItem = { ...item };
    keys.forEach((key) => {
      newItem[key] = columns[key][i];
    });
    return newItem;
  });

  return { data: standardized, stats };
}


/**
 * Interpola linearmente entre dois valores.
 * Útil para animações (ex: transição suave do slider no Passo 2).
 *
 * @param {number} a — Valor inicial.
 * @param {number} b — Valor final.
 * @param {number} t — Progresso (0 = a, 1 = b, 0.5 = meio).
 * @returns {number} — Valor interpolado.
 *
 * @example
 *   lerp(0, 100, 0.5)  // → 50
 *   lerp(10, 20, 0.25) // → 12.5
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}


/**
 * Arredonda um número para N casas decimais.
 *
 * @param {number} value — Valor a arredondar.
 * @param {number} [decimals=2] — Número de casas decimais.
 * @returns {number} — Valor arredondado.
 */
export function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}


/**
 * Calcula a covariância (populacional) entre duas variáveis.
 * Indica como duas variáveis variam juntas.
 * Fórmula: Σ((X_i - µX) * (Y_i - µY)) / N
 *
 * @param {number[]} arr1 — Primeira variável (ex: idades).
 * @param {number[]} arr2 — Segunda variável (ex: ticket médio).
 * @returns {number} — Valor da covariância.
 */
export function covariance(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length || arr1.length === 0) return 0;
  
  const m1 = mean(arr1);
  const m2 = mean(arr2);
  
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += (arr1[i] - m1) * (arr2[i] - m2);
  }
  
  return sum / arr1.length;
}


/**
 * Calcula a matriz de covariância N x N para um dataset.
 * Como o PCA trabalha com as correlações, a matriz de covariância
 * de dados padronizados (Z-score) é igual à matriz de correlação de Pearson.
 *
 * @param {Object[]} data — Array de objetos (clientes).
 * @param {string[]} keys — Nomes das dimensões para gerar a matriz.
 * @returns {number[][]} — Matriz de covariância onde cell[i][j] é a cov(keys[i], keys[j]).
 */
export function calculateCovarianceMatrix(data, keys) {
  const matrix = [];
  
  for (let i = 0; i < keys.length; i++) {
    matrix[i] = [];
    for (let j = 0; j < keys.length; j++) {
      const col1 = extractColumn(data, keys[i]);
      const col2 = extractColumn(data, keys[j]);
      
      const cov = covariance(col1, col2);
      // Arredonda para 2 casas para facilitar a visualização no Heatmap
      matrix[i][j] = round(cov, 2);
    }
  }
  
  return matrix;
}
/**
 * Simula (mock) o cálculo de Autovetores e Autovalores (PCA) com
 * propósito puramente didático para a Fase 6.
 * Em um cenário real de Data Science, usaríamos bibliotecas de álgebra linear 
 * para Decomposição Espectral ou SVD da Matriz de Covariância.
 *
 * @returns {Object} — Propriedades matemáticas do eixo principal (PC1).
 */
export function calculatePrincipalComponents() {
  return {
    // Para ilustrar Idade vs Tempo no Site, a reta de maior variância
    // tem um ângulo aproximado de 35 graus (y = 0.7x)
    pc1: {
      slope: 0.7,
      angle: 35, // Graus
    },
    pc2: {
      slope: -1 / 0.7, // Ortogonal (90 graus)
      angle: 125,
    },
    pc3: { slope: 0.2, angle: 11 },
    pc4: { slope: -2.5, angle: -68 },
    pc5: { slope: 0.05, angle: 3 },
    variances: {
      pc1: 75, // 75% da informação original
      pc2: 18,
      pc3: 4,
      pc4: 2,
      pc5: 1,
    },
  };
}
