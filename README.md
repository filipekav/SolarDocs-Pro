# ⚡ SolarDocs Pro

> **Sistema Completo de Gestão de Projetos e Geração Automática de Documentação Técnica para Microgeração Solar Fotovoltaica.**

![Versão](https://img.shields.io/badge/vers%C3%A3o-1.0.0-blue.svg)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green.svg)
![Deploy](https://img.shields.io/badge/demo-GitHub%20Pages-success.svg)

🌐 **Acesse a versão online:** [https://filipekav.github.io/SolarDocs-Pro/](https://filipekav.github.io/SolarDocs-Pro/)

---

## 📋 Sumário

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Documentos Gerados](#-documentos-gerados)
  - [1. Pranchas Técnicas (Diagramas SVG)](#1-pranchas-t%C3%A9cnicas-diagramas-svg)
  - [2. Memorial Descritivo Completo](#2-memorial-descritivo-completo)
  - [3. Formulário de Acesso / Conexão](#3-formul%C3%A1rio-de-acesso--conex%C3%A3o)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Executar](#-como-executar)
  - [Opção 1: Servidor Local Node.js (Recomendado)](#op%C3%A7%C3%A3o-1-servidor-local-nodejs-recomendado)
  - [Opção 2: Live Server (VS Code)](#op%C3%A7%C3%A3o-2-live-server-vs-code)
  - [Opção 3: Navegador Direto](#op%C3%A7%C3%A3o-3-navegador-direto)
- [Backup e Persistência de Dados](#-backup-e-persist%C3%AAncia-de-dados)
- [Licença](#-licen%C3%A7a)

---

## 🌟 Sobre o Projeto

O **SolarDocs Pro** é uma solução web desenvolvida para engenheiros, integradores e projetistas solares agilizarem o processo de homologação de sistemas fotovoltaicos junto às concessionárias de energia elétrica (como ENEL, CPFL, Equatorial, Cemig, entre outras).

A plataforma permite cadastrar, gerenciar e editar projetos de microgeração, gerando automaticamente toda a documentação de engenharia exigida pelas normas vigentes da **ANEEL (REN 1000/2021, REN 956/2021)** e da **ABNT (NBR 5410, NBR 16690)**.

---

## 🚀 Funcionalidades Principais

- 📊 **Dashboard de Projetos**: Gerenciamento de múltiplos clientes, busca dinâmica por nome, cidade ou UC, com métricas de potência total instalada.
- ⚡ **Dimensionamento e Formulário Técnico**: Edição em tempo real de parâmetros como potência dos módulos, tipo de inversor, quantidade de strings, condutores, DPS, disjuntores e concessionária.
- 🔄 **Auto-Save Inteligente**: Salvamento automático no navegador (`localStorage`), prevenindo qualquer perda de dados durante a edição.
- 📦 **Importação & Exportação JSON**: Exporte o backup individual de um projeto ou de toda a base de dados para troca entre computadores ou armazenamento em nuvem.
- 🖨️ **Exportação para PDF & Impressão**: Geração de documentos em alta resolução prontos para submissão digital ou impressão em pranchas técnicas.

---

## 📄 Documentos Gerados

### 1. Pranchas Técnicas (Diagramas SVG)
Diagramas elétricos desenhados dinamicamente em SVG vetorial de alta precisão com carimbos customizados:

- **Prancha 01/06**: Diagrama Unifilar Principal (Painéis, Strings, DPS CC, Inversor, Disjuntor CA, Proteção e Padrão).
- **Prancha 02/06**: Diagrama Multifilar e Detalhe de Ponto de Conexão à Rede.
- **Prancha 03/06**: Layout e Estrutura de Fixação dos Módulos Fotovoltaicos (Identificação por String e Painel).
- **Prancha 04/06**: Detalhamento de Montagem, Instalação do Inversor e Eletrodutos.
- **Prancha 05/06**: Placa de Advertência e Sinalização de Segurança (Norma Regulamentadora).
- **Prancha 06/06**: Detalhamento do Padrão de Entrada, Ramal e Malha de Aterramento.

### 2. Memorial Descritivo Completo
- Dados da Unidade Consumidora (UC), Titular e Responsável Técnico (CREA/CFT).
- Justificativa técnica, dados meteorológicos e irradiação solar local.
- Dimensionamento elétrico dos circuitos CC e CA, cabos solares, condutores de aterramento e dispositivos de proteção contra surtos (DPS).
- Especificações dos inversores e módulos com cálculos de rendimento e perdas.

### 3. Formulário de Acesso / Conexão
- Formulário padrão de Orçamento de Conexão / Solicitação de Acesso para Microgeração Distribuída (Anexo 3.A Módulo 3 - PRODIST).
- Preenchimento automatizado das informações cadastrais, técnicas e coordenadas geográficas.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** e **CSS3 Moderno**: Layout responsivo, design dark/light sofisticado com glassmorphism e tipografia Google Fonts (Inter / Outfit).
- **JavaScript (ES6+) Vanilla**: Arquitetura modular sem dependência de frameworks pesados, garantindo carregamento instantâneo.
- **SVG Dinâmico**: Renderização vetorial dos diagramas elétricos.
- **jsPDF / html2pdf / html2canvas**: Geração e download de PDFs no lado do cliente.
- **Node.js (Opcional)**: Servidor estático leve nativo para execução local (`server.js`).

---

## 📁 Estrutura de Pastas

```plaintext
gerador-docs-solar/
├── css/
│   └── style.css            # Estilos globais, dashboard, editor e regras de impressão (@media print)
├── js/
│   ├── app.js               # Controlador da interface, navegação e eventos
│   ├── assets.js            # Recursos e logos em formato Base64 para PDF
│   ├── diagrama.js          # Gerador vetorial SVG das 6 pranchas técnicas
│   ├── formulario.js        # Gerador do formulário de acesso de conexão
│   ├── memorial.js          # Gerador do memorial descritivo em HTML
│   ├── storage.js           # Gerenciador de armazenamento local e exportação JSON
│   ├── utils.js             # Funções utilitárias (formatações, validações e datas)
│   ├── html2canvas.min.js   # Biblioteca auxiliar de captura de tela
│   ├── html2pdf.bundle.min.js # Biblioteca de exportação para PDF
│   └── jspdf.umd.min.js     # Biblioteca de manipulação de PDF
├── enel.png                 # Logo da distribuidora
├── logo.jpeg                # Logo padrão de engenharia para carimbos
├── server.js                # Servidor estático Node.js
├── index.html               # Ponto de entrada da aplicação
└── README.md                # Documentação do projeto
```

---

## 💻 Como Executar

### Opção 1: Servidor Local Node.js (Recomendado)

Se você possui o [Node.js](https://nodejs.org/) instalado na máquina:

```bash
# Inicie o servidor
node server.js
```

Em seguida, abra no navegador:
👉 `http://localhost:3456`

---

### Opção 2: Live Server (VS Code)

1. Abra a pasta do projeto no **Visual Studio Code**.
2. Instale a extensão **Live Server** (se ainda não tiver).
3. Clique com o botão direito no arquivo `index.html` e selecione **Open with Live Server**.

---

### Opção 3: Navegador Direto

Por ser uma aplicação 100% estática baseada em HTML/JS, você também pode simplesmente dar um **duplo clique no arquivo `index.html`** para abrir no seu navegador padrão.

---

## 💾 Backup e Persistência de Dados

- Todos os projetos e edições ficam salvos de forma segura no **armazenamento local (localStorage)** do seu navegador.
- Para migrar de navegador ou computador, utilize os botões:
  - **Exportar Todos**: Gera um arquivo `.json` contendo todos os projetos cadastrados.
  - **Importar JSON**: Restaura os projetos a partir do arquivo exportado.

---

## 📝 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE). Sinta-se livre para customizar e utilizar em seus projetos solares.
