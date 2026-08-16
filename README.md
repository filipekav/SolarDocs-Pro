# ⚡ SolarDocs Pro

> **Sistema Completo de Gestão de Projetos e Geração Automática de Documentação Técnica para Microgeração Solar Fotovoltaica.**

![Versão](https://img.shields.io/badge/vers%C3%A3o-2.0.0-blue.svg)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)
![Deploy](https://img.shields.io/badge/demo-GitHub%20Pages-success.svg)

🌐 **Acesse a versão online:** [https://filipekav.github.io/SolarDocs-Pro/](https://filipekav.github.io/SolarDocs-Pro/)

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Documentos e Pranchas Geradas](#-documentos-e-pranchas-geradas)
  - [1. Pranchas Técnicas (Diagramas SVG Vetoriais)](#1-pranchas-t%C3%A9cnicas-diagramas-svg-vetoriais)
  - [2. Memorial Descritivo Completo](#2-memorial-descritivo-completo)
  - [3. Formulário de Acesso / Conexão](#3-formul%C3%A1rio-de-acesso--conex%C3%A3o)
- [Gestão de Imagens e Compressão no Navegador](#-gest%C3%A3o-de-imagens-e-compress%C3%A3o-no-navegador)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Executar Localmente](#-como-executar-localmente)
  - [Opção 1: Servidor Local Node.js (Recomendado)](#op%C3%A7%C3%A3o-1-servidor-local-nodejs-recomendado)
  - [Opção 2: Live Server (VS Code)](#op%C3%A7%C3%A3o-2-live-server-vs-code)
  - [Opção 3: Navegador Direto](#op%C3%A7%C3%A3o-3-navegador-direto)
- [Persistência de Dados e Backups](#-persist%C3%AAncia-de-dados-e-backups)
- [Licença](#-licen%C3%A7a)

---

## 🌟 Sobre o Projeto

O **SolarDocs Pro** é uma solução web *client-side* desenvolvida para engenheiros, integradores e projetistas solares agilizarem o processo de homologação de sistemas fotovoltaicos junto às concessionárias de energia elétrica (como ENEL, CPFL, Equatorial, Cemig, entre outras).

A plataforma permite cadastrar, gerenciar, duplicar e editar múltiplos projetos de microgeração, gerando automaticamente toda a documentação de engenharia exigida pelas normas vigentes da **ANEEL (REN 1000/2021, REN 956/2021 / PRODIST)** e da **ABNT (NBR 5410, NBR 16690)**.

---

## 🚀 Funcionalidades Principais

- 📊 **Dashboard de Gestão de Projetos**: Painel com métricas em tempo real (total de projetos e potência total instalada em kWp), busca dinâmica instantânea (por cliente, cidade, UC ou potência) e cards informativos.
- ⚡ **Dimensionamento e Formulário Técnico Parametrizado**:
  - Dados cadastrais do cliente e da Unidade Consumidora (UC).
  - Dimensionamento encadeado de módulos, strings por inversor, inversores grid-tie, proteções CC/CA, condutores e quedas de tensão.
  - Dados da empresa integradora e responsável técnico (CFT/CREA).
- 🔄 **Auto-Save Inteligente com Debounce**: Salvamento automático e contínuo durante a digitação para prevenir perda de dados.
- 🗄️ **Persistência em IndexedDB Nativo**: Capacidade expandida de armazenamento local no navegador para suportar múltiplos projetos com anexos e imagens em alta definição, contando com fallback automático para `localStorage`.
- 📷 **Upload e Otimização Automática de Imagens**: Compressão inteligente via Canvas no cliente com suporte a *drag & drop* direto nos cards ou nos placeholders do memorial.
- 📦 **Backup & Restauração JSON**: Exportação individual de projetos ou backup geral de toda a base com restauração instantânea.
- 🖨️ **Impressão e Exportação para PDF**: Estilização otimizada com `@media print` para pranchas e documentos técnicos em folhas A4 padronizadas.

---

## 📄 Documentos e Pranchas Geradas

### 1. Pranchas Técnicas (Diagramas SVG Vetoriais)
Renderizadas dinamicamente em SVG de alta precisão com carimbos customizados com os dados da empresa e do responsável técnico:

- **Prancha 01/06 — Diagrama Unifilar Principal**: Arranjo de módulos, strings, cabeamento CC/CA, proteções (DPS CC/CA, disjuntor CA, disjuntor QGBT, padrão de entrada) e detalhes de aterramento.
- **Prancha 02/06 — Planta de Situação e Arranjo Fotovoltaico**: Planta de situação, limites do lote, arruamento de acesso e arranjo com identificação de strings e módulos (`I01S01M01...`).
- **Prancha 03/06 — Layout e Estrutura de Fixação dos Módulos**: Esquema de fixação (telhado cerâmico/metálico/solo), cortes esquemáticos, espaçamentos e trilhos de fixação.
- **Prancha 04/06 — Detalhamento de Montagem, Instalação do Inversor e Eletrodutos**: Instalação mecânica do inversor, distâncias mínimas de ventilação, encaminhamento de eletrodutos e barramentos.
- **Prancha 05/06 — Identificação das Strings, Diagrama de Blocos e Placa de Advertência**: Padrão de cores de cabos e anilhas, diagrama de blocos do sistema e modelo regulamentar da placa de advertência ("CUIDADO: RISCO DE CHOQUE ELÉTRICO - GERAÇÃO PRÓPRIA").
- **Prancha 06/06 — Detalhamento do Padrão de Entrada, QSS Multifilar e Aterramento**: Esquema multifilar do Quadro de Saída Solar (QSS), conexões de fases/neutro/terra, caixa de medição e malha de aterramento.

### 2. Memorial Descritivo Completo
- **Capa e Dados Cadastrais**: Identificação da UC, titular, coordenadas geográficas e responsável técnico.
- **Justificativa e Dados Meteorológicos**: Localização, índice solarimétrico e irradiação solar local.
- **Dimensionamento Elétrico Detalhado**: Circuitos CC e CA, bitolas de cabos solares, condutores de aterramento, DPS e disjuntores termomagnéticos.
- **Gráfico de Geração Mensal (SVG)**: Gráfico dinâmico de barras com previsão mês a mês (kWh) e média anual calculada.
- **Caderno de Figuras e Croquis**: Seção estruturada para inserção de fotos do local (satélite, situação, telhado, disjuntor, placa e medição).

### 3. Formulário de Acesso / Conexão
- Modelo padrão de **Orçamento de Conexão / Solicitação de Acesso para Microgeração Distribuída** (Anexo 3.A Módulo 3 - REN 956/2021 / PRODIST - REV05).
- Preenchimento automatizado dos dados do titular, coordenadas geográficas, parâmetros elétricos e características da conexão.

---

## 📷 Gestão de Imagens e Compressão no Navegador

O sistema possui uma esteira de processamento de imagens no lado do cliente:

1. **Upload Flexível**: Seleção via explorador de arquivos ou arrastar e soltar (*drag & drop*).
2. **Compressão via Canvas API**: Redimensionamento proporcional (máx. 1280x1280px) com conversão para JPEG otimizado (~80 a 140 KB), preservando nitidez sem travar a renderização.
3. **Persistência Assíncrona**: Armazenamento no IndexedDB (`SolarDocsDB`), permitindo dezenas de projetos com fotos sem limitações de espaço.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3 Moderno**: Layout responsivo, design dark/light sofisticado com glassmorphism, tipografia Google Fonts (*Inter* e *Outfit*) e regras de impressão `@media print`.
- **JavaScript (ES6+) Vanilla**: Arquitetura modular sem dependência de frameworks pesados, garantindo carregamento instantâneo.
- **IndexedDB Nativo**: Banco de dados transacional assíncrono no navegador para armazenamento de dados e fotos em Base64.
- **SVG Dinâmico**: Renderização vetorial dos diagramas elétricos e gráficos técnicos.
- **HTML5 Canvas**: Processamento e compressão de imagens em tempo real.
- **jsPDF & html2canvas**: Manipulação e suporte à geração de PDFs no cliente.
- **Node.js (Opcional)**: Servidor estático leve nativo para execução local (`server.js`).
- **GitHub Actions**: Pipeline de CI/CD para deploy contínuo no GitHub Pages.

---

## 📁 Estrutura de Pastas

```plaintext
gerador-docs-solar/
├── .github/
│   └── workflows/
│       └── deploy.yml        # Automação de deploy no GitHub Pages
├── css/
│   └── style.css            # Estilos globais, dashboard, editor, modais e impressão
├── js/
│   ├── app.js               # Controlador da interface, navegação, eventos e modais
│   ├── assets.js            # Recursos e logotipos embutidos em Base64
│   ├── diagrama.js          # Gerador vetorial SVG das 6 pranchas técnicas
│   ├── formulario.js        # Gerador do formulário de acesso de conexão (Anexo 3.A)
│   ├── memorial.js          # Gerador do memorial descritivo em HTML e gráficos SVG
│   ├── storage.js           # Gerenciador IndexedDB/LocalStorage e exportação JSON
│   ├── utils.js             # Utilitários, compressão Canvas de fotos e cálculos encadeados
│   ├── html2canvas.min.js   # Biblioteca auxiliar de captura de tela
│   └── jspdf.umd.min.js     # Biblioteca de manipulação de PDF
├── enel.png                 # Logotipo da distribuidora
├── logo.jpeg                # Logotipo padrão de engenharia para carimbos
├── server.js                # Servidor estático leve em Node.js
├── index.html               # Ponto de entrada da aplicação SPA
└── README.md                # Documentação do projeto
```

---

## 💻 Como Executar Localmente

### Opção 1: Servidor Local Node.js (Recomendado)

Se você possui o [Node.js](https://nodejs.org/) instalado:

```bash
# Inicie o servidor
node server.js
```

Em seguida, acesse no navegador:
👉 `http://localhost:3456`

---

### Opção 2: Live Server (VS Code)

1. Abra a pasta do projeto no **Visual Studio Code**.
2. Instale a extensão **Live Server** (se ainda não tiver).
3. Clique com o botão direito no arquivo `index.html` e selecione **Open with Live Server**.

---

### Opção 3: Navegador Direto

Por ser uma aplicação 100% estática baseada em HTML/JS/CSS, você também pode abrir o arquivo `index.html` diretamente em qualquer navegador moderno.

---

## 💾 Persistência de Dados e Backups

- Todos os projetos, parâmetros e fotos são salvos de forma segura no **IndexedDB** do navegador.
- **Backup Geral**: Clique em **Backup Geral** no Dashboard para baixar um arquivo `.json` com todos os projetos cadastrados.
- **Importar JSON**: Restaure projetos a qualquer momento arrastando ou selecionando arquivos `.json` de backup.
- **Exportação Individual**: No card de cada projeto, use o botão de disquete (💾) para baixar o arquivo JSON exclusivo daquele cliente.

---

## 📝 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE). Sinta-se livre para utilizar, customizar e expandir em seus projetos de engenharia solar.
