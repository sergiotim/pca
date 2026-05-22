# 📄 Documento de Requisitos do Produto (PRD)

---

## ℹ️ Informações Gerais
*   **Produto:** Site Interativo *"Business Case: Entendendo o PCA na Prática"*
*   **Contexto:** Aula 11 - Engenharia de Dados (Trabalho Universitário)
*   **Product Manager:** PM Sênior de EdTech & Dados

---

## 1. Visão Geral do Produto e Objetivos

O produto é uma aplicação web single-page (SPA) estritamente front-end, focada em ensinar o algoritmo de Análise de Componentes Principais (PCA) de forma visual, intuitiva e sem pré-requisitos matemáticos.

O usuário assume o papel de um Analista de Dados em um E-commerce que precisa segmentar clientes com base em um dataset de 5 dimensões. Como é impossível visualizar 5 dimensões simultaneamente, o usuário aprenderá, passo a passo, como o PCA resolve este problema.

### Objetivos do Produto (OKRs de Sucesso)
*   **Engajamento:** Garantir que o aluno complete a jornada de 5 passos sem abandonar a página.
*   **Compreensão:** O usuário deve ser capaz de explicar o conceito de "Redução de Dimensionalidade" com suas próprias palavras após o uso.
*   **Performance Técnica:** Renderização fluida das animações e gráficos no navegador, sem dependência de servidor (Serverless/Backend-less).

---

## 2. Personas

### Persona Principal: Lucas, o Estudante de Computação/Negócios
*   **Perfil:** 22 anos, estudante de graduação. Conhece o básico de programação, mas foge de matemática pura.
*   **Dores:** Acha estatística abstrata demais. Não entende matrizes desde o ensino médio. Quando lê "autovalor", sua vontade é fechar o livro.
*   **Necessidades:** Precisa de exemplos práticos ("Onde eu uso isso no mundo real?") e analogias visuais. Ele aprende "vendo acontecer", não lendo blocos de texto.

---

## 3. Jornada do Usuário (Flow de Telas)

A experiência será em formato *Scrollytelling* ou *Wizard* (Passo a Passo):

1.  **Landing/Onboarding:** Apresentação do desafio do E-commerce (A Tabela de 5 Dimensões).
2.  **Passo 1: O Caos Dimensional:** Tentativa frustrada de visualizar os dados.
3.  **Passo 2: Nivelando o Jogo:** Interação com a padronização (balança visual).
4.  **Passo 3: Quem anda com quem?:** Mapa de calor simplificado (Covariância).
5.  **Passo 4: As Novas Avenidas:** Animação gráfica girando os eixos originais para encontrar o melhor ângulo (Autovetores).
6.  **Passo 5: A Mágica (Projeção):** Gráfico de dispersão 2D final revelando os clusters (Perfis de Clientes).
7.  **Encerramento:** Resumo do aprendizado e botão para reiniciar.

---

## 4. Epics e User Stories (com Critérios de Aceite BDD)

### Epic 1: O Contexto e o Problema (Setup)

#### US 1.1: Apresentação da Tabela 5D
Como aluno, quero ver a base de dados de clientes do e-commerce para entender o problema que preciso resolver.

*   **Critérios de Aceite:**
    *   **Dado que** o usuário acessa a página inicial,
    *   **Quando** ele rola a tela para o Passo 1,
    *   **Então** o sistema exibe uma tabela estilizada com 5 colunas: *Idade*, *Tempo no Site*, *Ticket Médio*, *Frequência de Compra*, *Interações com Suporte*.
    *   **E** um texto explica que nossa missão é encontrar "grupos de clientes" nessa tabela.

#### US 1.2: A Impossibilidade do Gráfico 5D
Como aluno, quero tentar visualizar os dados para perceber por que o PCA é necessário.

*   **Critérios de Aceite:**
    *   **Dado que** a tabela de 5 dimensões foi apresentada,
    *   **Quando** o usuário clica no botão "Gerar Gráfico",
    *   **Então** a interface mostra uma animação humorada de um gráfico 3D quebrando ou um emaranhado confuso de linhas (ou um erro simulado do tipo *"Erro: Não é possível desenhar em 5 dimensões"*), provando a necessidade de reduzir as dimensões.

---

### Epic 2: O Motor do PCA (Matemática Visual)

#### US 2.1: Padronização (Maçãs com Maçãs)
Como aluno, quero ver o impacto de diferentes escalas para entender o passo de Padronização (Z-score).

*   **Critérios de Aceite:**
    *   **Dado que** o usuário está no Passo 2,
    *   **Quando** ele arrasta um slider comparando 'Idade' (0-100) com 'Ticket Médio' (R$ 0 - 10.000),
    *   **Então** o gráfico mostra a variável de dinheiro "esmagando" a de idade.
    *   **E Quando** ele clica em "Padronizar", as duas variáveis assumem pesos visuais iguais na tela (mesma escala de eixo).

#### US 2.2: Matriz de Covariância (O Radar de Tendências)
Como aluno, quero entender a relação entre as variáveis para saber o que é covariância.

*   **Critérios de Aceite:**
    *   **Dado que** o usuário avança para o Passo 3,
    *   **Quando** ele passa o mouse sobre pares de variáveis (ex: *Tempo no Site* + *Ticket Médio*),
    *   **Então** um termômetro visual ou emoji indica se eles "crescem juntos" (covariância positiva) ou "andam em direções opostas" (covariância negativa).

#### US 2.3: Autovetores e Autovalores (As Avenidas Principais)
Como aluno, quero ver os dados girando para entender intuitivamente o que são Autovetores.

*   **Critérios de Aceite:**
    *   **Dado que** os dados estão plotados em um espaço genérico no Passo 4,
    *   **Quando** o usuário interage com um botão "Encontrar o melhor ângulo",
    *   **Então** o sistema anima a rotação dos eixos do gráfico de forma fluida.
    *   **E** para no ângulo onde os dados estão mais espalhados, rotulando esta linha reta como "Componente Principal 1" (a Avenida Principal).

---

### Epic 3: O Resultado e o Valor de Negócio

#### US 3.1: Projeção 2D e Clusterização Visível
Como Analista de Dados (aluno), quero ver o resultado da transformação 2D para identificar os perfis de clientes.

*   **Critérios de Aceite:**
    *   **Dado que** as "Avenidas Principais" foram encontradas no passo anterior,
    *   **Quando** o sistema transita para o Passo 5,
    *   **Então** os dados são "esmagados" (projetados) nessas duas novas avenidas (*PC1* e *PC2*), formando um gráfico de dispersão 2D claro.
    *   **E** as bolinhas (clientes) revelam agrupamentos visíveis (ex: "Clientes VIPs", "Clientes de Risco").

---

## 5. Requisitos Não-Funcionais e Stack Tecnológica

*   **Arquitetura:** 100% Client-side. Sem chamadas a APIs externas pós-carregamento.
*   **Stack:** HTML5, CSS3, JavaScript (Vanilla).
*   **Bibliotecas Recomendadas (via CDN):**
    *   **Plotly.js:** Fortemente recomendada para renderizar os gráficos interativos, especialmente as transições de dispersão multidimensional para 2D.
    *   **D3.js:** Alternativa para animações mais customizadas de rotação de eixos e visualização de matrizes.
    *   **GSAP** ou **ScrollMagic** (Opcional): Para controlar as animações atreladas ao scroll da página de forma profissional (*Scrollytelling*).
*   **Responsividade:** O site deve ser legível em monitores e tablets (mínimo de 768px de largura).
    *   *Nota:* Gráficos muito complexos podem ser difíceis de manipular em telas de celulares muito pequenas, o foco principal é desktop/tablet acadêmico.
*   **Performance:** Transições de animação a 60fps.

---

## 6. Especificação do Conteúdo Didático (O Segredo do Site)

A equipe de conteúdo/front-end deve usar rigorosamente as seguintes analogias nos textos da interface, substituindo o jargão matemático:

| Etapa do PCA | Conceito Matemático Real | Como o site deve explicar (Analogia/Copy) | Visualização na Interface |
| :--- | :--- | :--- | :--- |
| **Passo 1** | Maldição da Dimensionalidade | "Temos 5 coisas sobre cada cliente. Você consegue imaginar um objeto em 5D? Nem o computador. Precisamos de uma sombra 2D desse objeto." | Um cubo 3D girando que de repente "trava" ao tentar adicionar a 4ª e 5ª setas de dimensões. |
| **Passo 2** | Z-Score (Padronização) | "Não podemos comparar a idade do João (25 anos) com o que ele gastou (R$ 5.000). O dinheiro vai gritar mais alto. Vamos colocar todos no mesmo volume." | Gráfico de barras onde a barra "R$" gigante encolhe e a barra "Idade" cresce, até ambas usarem a régua de 0 a 1. |
| **Passo 3** | Matriz de Covariância | "Quem anda de mãos dadas? Se o tempo no site sobe, o ticket médio também sobe? Isso é covariância: descobrir quais fofocas se repetem." | Grade estilo "Batalha Naval". Células mudam de cor (verde = andam juntos, vermelho = opostos) ao passar o mouse. |
| **Passo 4** | Autovetores e Autovalores | "Imagine tirar uma foto de uma bicicleta. De frente, ela parece um risco. De lado, você vê a bicicleta inteira. Autovetores são o 'melhor ângulo da foto' (onde há mais informação/espalhamento)." | Nuvens de pontos em formato oval. Uma câmera animada ou eixo giratório procura o eixo mais comprido do oval e o batiza de PC1. |
| **Passo 5** | Projeção e Biplot | "Mágica! Transformamos 5 variáveis em 2 super-variáveis invisíveis (PC1 e PC2). Olha como os clientes se separaram!" | Gráfico de dispersão 2D limpo. Cores diferentes surgem nos clusters (ex: "Grupo A", "Grupo B"), concluindo o Business Case. |

---

## 🏆 Critérios de Pronto (DoD - Definition of Done)

*   [ ] Código HTML/CSS/JS versionado no repositório.
*   [ ] Nenhuma página com erro de console no carregamento.
*   [ ] Todas as 5 etapas navegáveis (scroll ou botões *Next*/*Prev*).
*   [ ] Texto revisado com foco em acessibilidade didática.