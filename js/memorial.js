function formatDateExtenso(dateStr) {
    if (!dateStr) return '20 de julho de 2026';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const ano = parts[0];
        const mesIdx = parseInt(parts[1], 10) - 1;
        const dia = parseInt(parts[2], 10);
        const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        return `${dia} de ${meses[mesIdx] || 'julho'} de ${ano}`;
    }
    return dateStr;
}

function getHeaderHtml(pageNum, d) {
    if (pageNum === 1) return '';
    const logoSrc = (d && d.logoEmpresa) ? d.logoEmpresa : ((typeof ASSETS !== 'undefined' && ASSETS.LOGO_JPEG) ? ASSETS.LOGO_JPEG : 'logo.jpeg');
    return `
        <div class="memorial-header">
            <img src="${logoSrc}" alt="Logo Empresa" class="memorial-header-logo">
        </div>
    `;
}

function getFooterHtml(pageNum) {
    return `
        <div class="memorial-footer">
            <span class="page-number">${pageNum}</span>
        </div>
    `;
}

/**
 * Renderiza uma imagem customizada ou um placeholder interativo para o Memorial Descritivo
 */
function renderMemorialImage(fieldName, imgData, placeholderText, heightPx, icon = '📷') {
    if (imgData && typeof imgData === 'string' && imgData.startsWith('data:image')) {
        return `
            <div class="memorial-img-wrapper has-image" data-field="${fieldName}">
                <div class="img-preview-frame" style="max-height: ${heightPx}px;">
                    <img src="${imgData}" alt="${placeholderText}" class="memorial-custom-img" style="max-height: ${heightPx}px;">
                    <div class="img-hover-overlay">
                        <span class="overlay-text">🔄 Clique para alterar ou remover</span>
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="memorial-img-wrapper is-empty" data-field="${fieldName}" title="Clique ou arraste uma imagem para cá">
            <div class="img-placeholder interactive-dropzone" style="height: ${heightPx}px;">
                <div class="placeholder-content">
                    <span class="placeholder-icon">${icon}</span>
                    <span class="placeholder-text">[ ${placeholderText} ]</span>
                    <span class="placeholder-hint">📁 Clique para carregar ou arraste uma foto</span>
                </div>
            </div>
        </div>
    `;
}

function gerarGraficoGeracaoSVG(data) {
    const geracao = getGeracaoMensal(data);
    // Dados mensais Fev a Dez + Média
    const mesesGrafico = [
        { label: 'Fev', val: Number(data.gerFev) || 720 },
        { label: 'Mar', val: Number(data.gerMar) || 780 },
        { label: 'Abr', val: Number(data.gerAbr) || 760 },
        { label: 'Mai', val: Number(data.gerMai) || 740 },
        { label: 'Jun', val: Number(data.gerJun) || 700 },
        { label: 'Jul', val: Number(data.gerJul) || 720 },
        { label: 'Ago', val: Number(data.gerAgo) || 760 },
        { label: 'Set', val: Number(data.gerSet) || 800 },
        { label: 'Out', val: Number(data.gerOut) || 820 },
        { label: 'Nov', val: Number(data.gerNov) || 790 },
        { label: 'Dez', val: Number(data.gerDez) || 770 }
    ];

    const soma = mesesGrafico.reduce((acc, m) => acc + m.val, 0);
    const media = Math.round(soma / mesesGrafico.length);
    mesesGrafico.push({ label: 'Media', val: media });

    const maxVal = Math.max(...mesesGrafico.map(m => m.val), 900);

    const svgW = 650;
    const svgH = 200;
    const paddingL = 65;
    const paddingR = 20;
    const paddingT = 30;
    const paddingB = 45;
    const chartW = svgW - paddingL - paddingR;
    const chartH = svgH - paddingT - paddingB;

    const barW = 28;
    const gap = (chartW - (barW * mesesGrafico.length)) / (mesesGrafico.length + 1);

    let barsSVG = '';

    // Linhas de grade Y (0, 200, 400, 600, 800)
    const gridLines = [0, 200, 400, 600, 800];
    gridLines.forEach(gVal => {
        const yPos = (svgH - paddingB) - (gVal / maxVal) * chartH;
        barsSVG += `
            <line x1="${paddingL}" y1="${yPos}" x2="${svgW - paddingR}" y2="${yPos}" stroke="#e0e0e0" stroke-width="1"/>
            <text x="${paddingL - 8}" y="${yPos + 3}" text-anchor="end" font-size="8" font-family="Arial" fill="#666">${gVal},00 kWh</text>
        `;
    });

    mesesGrafico.forEach((item, idx) => {
        const xPos = paddingL + gap + idx * (barW + gap);
        const barH = (item.val / maxVal) * chartH;
        const yPos = (svgH - paddingB) - barH;

        const isMedia = item.label === 'Media';
        const color = isMedia ? '#1976d2' : '#0d47a1';

        barsSVG += `
            <rect x="${xPos}" y="${yPos}" width="${barW}" height="${barH}" fill="${color}" rx="1.5"/>
            <text x="${xPos + barW / 2}" y="${yPos - 5}" text-anchor="middle" font-size="7" font-family="Arial" font-weight="bold" fill="#333">${item.val.toFixed(2).replace('.', ',')} kWh</text>
            <text x="${xPos + barW / 2}" y="${svgH - paddingB + 14}" text-anchor="middle" font-size="8.5" font-family="Arial" fill="#333">${item.label}</text>
        `;
    });

    return `
        <svg viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg" style="background:#fff; margin: 4px auto; max-width: 100%; height: auto; display: block;">
            <text x="${paddingL}" y="16" font-size="11" font-family="Arial" font-weight="bold" fill="#666">Previsão de Geração de Energia Mensal</text>
            ${barsSVG}
            <!-- Legenda da Média -->
            <rect x="${svgW / 2 - 50}" y="${svgH - 16}" width="12" height="8" fill="#1976d2" rx="1"/>
            <text x="${svgW / 2 - 32}" y="${svgH - 9}" font-size="8.5" font-family="Arial" fill="#333">${media.toFixed(2).replace('.', ',')} kWh (Média)</text>
        </svg>
    `;
}

function gerarPlacaSinalizacaoSVG() {
    return `
        <div style="text-align: center; margin: 8px 0;">
            <svg viewBox="0 0 350 200" width="280" height="160" xmlns="http://www.w3.org/2000/svg" style="display:inline-block; vertical-align:middle; background:#fff;">
                <!-- Dimensões 25cm x 18cm -->
                <line x1="25" y1="12" x2="295" y2="12" stroke="#333" stroke-width="1" stroke-dasharray="3,3"/>
                <polygon points="25,12 31,9 31,15" fill="#333"/>
                <polygon points="295,12 289,9 289,15" fill="#333"/>
                <text x="160" y="10" text-anchor="middle" font-size="9" font-family="Arial" fill="#333">25 cm</text>

                <line x1="310" y1="25" x2="310" y2="185" stroke="#333" stroke-width="1" stroke-dasharray="3,3"/>
                <polygon points="310,25 307,31 313,31" fill="#333"/>
                <polygon points="310,185 307,179 313,179" fill="#333"/>
                <text x="318" y="110" text-anchor="start" font-size="9" font-family="Arial" fill="#333">18 cm</text>

                <!-- Placa Amarela -->
                <rect x="25" y="25" width="270" height="160" fill="#ffeb3b" stroke="#000" stroke-width="2.5" rx="12"/>
                <rect x="35" y="35" width="250" height="42" fill="#000" rx="3"/>
                <text x="160" y="66" text-anchor="middle" font-size="20" font-family="Arial" font-weight="900" fill="#ffeb3b" letter-spacing="2">CUIDADO</text>
                
                <text x="160" y="104" text-anchor="middle" font-size="13" font-family="Arial" font-weight="bold" fill="#000" letter-spacing="1">RISCO DE CHOQUE</text>
                <text x="160" y="124" text-anchor="middle" font-size="13" font-family="Arial" font-weight="bold" fill="#000" letter-spacing="1">ELÉTRICO</text>
                <text x="160" y="156" text-anchor="middle" font-size="14" font-family="Arial" font-weight="bold" fill="#000" letter-spacing="1">GERAÇÃO PRÓPRIA</text>
            </svg>
        </div>
    `;
}

function gerarMemorialDescritivo(data) {
    const d = data || {};
    const dataExtenso = formatDateExtenso(d.dataProjeto);
    const clienteNome = (d.clienteNome || '').toUpperCase();
    const potenciaSistema = d.potenciaSistema || '';
    const capaLogoSrc = d.logoEmpresa || ((typeof ASSETS !== 'undefined' && ASSETS.LOGO_JPEG) ? ASSETS.LOGO_JPEG : 'logo.jpeg');

    // Cálculos de Potência
    const potenciaModWp = Number(d.moduloPotencia) || 0;
    const qtdModulos = Number(d.moduloQtd) || 0;
    const potenciaTotalModulosKwp = ((potenciaModWp * qtdModulos) / 1000).toFixed(3).replace('.', ',');

    const potenciaInvW = Number(d.inversorPotencia) || 0;
    const qtdInversores = Number(d.inversorQtd) || 1;
    const potenciaInversorTotalKw = ((potenciaInvW * qtdInversores) / 1000).toFixed(3).replace('.', ',');

    const geracao = getGeracaoMensal(d);
    const totalAnual = geracao.reduce((s, m) => s + (Number(m.valor) || 0), 0);

    const modulosPorString = Number(d.modulosPorString) || 9;
    const vocModulo = Number(d.moduloVoc) || 48.10;
    const vocTotalString = (vocModulo * modulosPorString).toFixed(2).replace('.', ',');

    return `
        <div class="memorial-document">
            <!-- PÁGINA 1: CAPA -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(1, d)}
                <div class="capa-content">
                    <div class="capa-logo-container memorial-img-wrapper" data-field="logoEmpresa" title="Clique ou arraste para alterar o logo da empresa">
                        <img src="${capaLogoSrc}" alt="${d.empresaNome || 'Nova Energy'}" class="capa-logo">
                        <div class="capa-empresa-sub">${d.empresaNome || 'Nova Energy LTDA'}</div>
                    </div>

                    <div class="capa-titulo">
                        MEMORIAL DESCRITIVO DO SISTEMA DE MICROGERAÇÃO SOLAR FOTOVOLTAICA, ${clienteNome || '____________________'}, DE ${potenciaSistema || '___'}kW DE POTÊNCIA INSTALADA CONECTADA A REDE DE BAIXA TENSÃO(BT)
                    </div>

                    <div class="capa-rodape">
                        ${d.cidadeDoc || 'Pacajus – CE'}, ${dataExtenso}
                    </div>
                </div>
                ${getFooterHtml(1)}
            </div>

            <!-- PÁGINA 2: SUMÁRIO -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(2, d)}
                <div class="memorial-body">
                    <h1 class="sumario-title">SUMÁRIO</h1>
                    
                    <div class="sumario-list">
                        <div class="sumario-item main"><span>1. OBJETIVOS:</span><span class="dots"></span><span class="num">3</span></div>
                        <div class="sumario-item main"><span>2. DESCRIÇÃO GERAL DO CONSUMIDOR:</span><span class="dots"></span><span class="num">3</span></div>
                        <div class="sumario-item main"><span>3. DESCRIÇÃO GERAL DA GERAÇÃO DISTRIBUÍDA:</span><span class="dots"></span><span class="num">5</span></div>
                        <div class="sumario-item sub"><span>3.1. Módulos fotovoltaicos:</span><span class="dots"></span><span class="num">5</span></div>
                        <div class="sumario-item sub"><span>3.2. Inversor:</span><span class="dots"></span><span class="num">6</span></div>
                        <div class="sumario-item sub"><span>3.3. Gráfico da previsão de rendimento mensal do sistema solar:</span><span class="dots"></span><span class="num">7</span></div>
                        <div class="sumario-item sub"><span>3.4. Estrutura de fixação dos módulos fotovoltaicos:</span><span class="dots"></span><span class="num">7</span></div>
                        <div class="sumario-item sub"><span>3.5. Dispositivos de proteção:</span><span class="dots"></span><span class="num">7</span></div>
                        <div class="sumario-item sub"><span>3.6. Aterramento:</span><span class="dots"></span><span class="num">8</span></div>
                        <div class="sumario-item sub"><span>3.7. Condutores:</span><span class="dots"></span><span class="num">9</span></div>
                        <div class="sumario-item sub"><span>3.8. Sinalização:</span><span class="dots"></span><span class="num">10</span></div>
                        <div class="sumario-item main"><span>4. ANEXOS:</span><span class="dots"></span><span class="num">13</span></div>
                        <div class="sumario-item sub"><span>4.1. Art – anotação de responsabilidade técnica;</span><span class="dots"></span><span class="num">13</span></div>
                        <div class="sumario-item sub"><span>4.2. Formulário de solicitação de acesso;</span><span class="dots"></span><span class="num">13</span></div>
                        <div class="sumario-item sub"><span>4.3. Diagrama unifilar básico;</span><span class="dots"></span><span class="num">13</span></div>
                        <div class="sumario-item sub"><span>4.4. Formulário de rateio;</span><span class="dots"></span><span class="num">13</span></div>
                        <div class="sumario-item sub"><span>4.5. Documentos do cliente;</span><span class="dots"></span><span class="num">13</span></div>
                        <div class="sumario-item sub"><span>4.6. Certificado de conformidade do inversor;</span><span class="dots"></span><span class="num">13</span></div>
                        <div class="sumario-item sub"><span>4.7. Datasheet dos módulos fotovoltaicos;</span><span class="dots"></span><span class="num">13</span></div>
                        <div class="sumario-item sub"><span>4.8. Datasheet do(s) inversor(es)</span><span class="dots"></span><span class="num">13</span></div>
                    </div>
                </div>
                ${getFooterHtml(2)}
            </div>

            <!-- PÁGINA 3: SEÇÕES 1 E 2 + FIGURA 01 -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(3, d)}
                <div class="memorial-body">
                    <h2>1. OBJETIVOS:</h2>
                    <p>Revisão da instalação de uma usina solar fotovoltaica conectada à <u>rede ${(d.tipoConexao || 'monofasica').toLowerCase()}</u> de BT da ENEL – CE de <u>${potenciaSistema || '___'} kW</u> de potência instalada. Projeto revisado pelo tecnico <u>${d.tecnicoNome || '___'}</u>, com Registro Nacional: (CFT/CRT): <u>${d.tecnicoCpf || '___'}</u>, Número do TRT:<u>${d.tecnicoRegistro || '___'}</u> , para a empresa <u>${d.empresaNome || 'Nova Energy Ltda'}</u>, CNPJ:<u>${d.empresaCnpj || '___'}</u> situada na <u>${d.empresaEndereco || '___'}</u>.</p>

                    <h2>2. DESCRIÇÃO GERAL DO CONSUMIDOR:</h2>
                    <p>A tabela 01 possuem os dados do cliente onde será instalada a usina solar fotovoltaica.</p>

                    <div class="table-title">DADOS DO CLIENTE</div>
                    <table class="memorial-table">
                        <tr><td style="width:30%">NOME:</td><td><strong>${clienteNome || ''}</strong></td></tr>
                        <tr><td>CPF/CNPJ:</td><td>${d.clienteCpf || ''}</td></tr>
                        <tr><td>Nº DO CLIENTE:</td><td>${d.uc || ''}</td></tr>
                        <tr><td>MODALIDADE TARIFÁRIA</td><td>${d.modalidade || ''}</td></tr>
                        <tr><td>ENDEREÇO:</td><td>${d.endereco || ''}, n° ${d.numero || '0000'}, ${d.bairro || ''}, ${d.cidade || ''}-CE, CEP: ${d.cep || ''}</td></tr>
                        <tr><td>LATITUDE (Graus Decimais):</td><td>${d.latitude || ''}°</td></tr>
                        <tr><td>LONGITUDE (Graus Decimais):</td><td>${d.longitude || ''}°</td></tr>
                    </table>
                    <div class="table-caption">Tabela 01 – Dados gerais do cliente e do local de instalação da usina</div>

                    <p>A figura 01, ilustra a localização do empreendimento, em destaque, em relação a sua vizinhança:</p>

                    ${renderMemorialImage('imgCroquiLocalizacao', d.imgCroquiLocalizacao, 'Figura 01: Imagem de Satélite / Croquis de Localização', 450, '🛰️')}
                    <div class="figure-caption">Figura 01 – Croquis de localização do empreendimento.</div>
                </div>
                ${getFooterHtml(3)}
            </div>

            <!-- PÁGINA 4: FIGURAS 02, 03 E 04 -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(4, d)}
                <div class="memorial-body">
                    <p>Já a figura 02, ilustra a planta de situação com o arruamento e a figura 03, ilustra em detalhes a localização das placas, localização do(s) inversor(es) e o ponto de entrega.</p>

                    ${renderMemorialImage('imgPlantaSituacao', d.imgPlantaSituacao, 'Figura 02: Planta de Situação com Arruamento', 230, '🗺️')}
                    <div class="figure-caption">Figura 02 – Planta de situação do empreendimento.</div>

                    ${renderMemorialImage('imgLocalizacaoModulos', d.imgLocalizacaoModulos, 'Figura 03: Detalhes da Localização dos Módulos, Inversores e Ponto de Entrega', 230, '🏠')}
                    <div class="figure-caption">Figura 03 – Detalhes da localização dos módulos, inversores e do ponto de entrega do empreendimento.</div>

                    <p>A figura 04 mostra o disjuntor do padrão de entrada, que no caso é um de <u>${d.disjuntorEntrada || '32'}A ${(d.tipoConexao || 'monofasico').toLowerCase()}</u>.</p>

                    ${renderMemorialImage('imgDisjuntorPadrao', d.imgDisjuntorPadrao, 'Figura 04: Fotos do Disjuntor do Padrão do Cliente', 230, '⚡')}
                    <div class="figure-caption">Figura 04 – Disjuntor do padrão do cliente.</div>
                </div>
                ${getFooterHtml(4)}
            </div>

            <!-- PÁGINA 5: AUTOCONSUMO REMOTO & NORMAS TÉCNICAS -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(5, d)}
                <div class="memorial-body">
                    <p>A divisão do excedente será descrito na tabela 2.</p>

                    <table class="memorial-table">
                        <thead>
                            <tr><th colspan="4" style="text-align:center">DADOS DO AUTOCONSUMO REMOTO</th></tr>
                            <tr>
                                <th style="width:55%">ENDEREÇO DA UNIDADE CONSUMIDORA REMOTA</th>
                                <th style="width:20%">Nº CLIENTE</th>
                                <th style="width:12%">%</th>
                                <th style="width:13%">SOMA TOTAL 100</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="table-caption">Tabela 2 – Divisão da energia excedente com as outras unidades consumidoras.</div>

                    <h2>3. DESCRIÇÃO GERAL DA GERAÇÃO DISTRIBUÍDA:</h2>
                    <p>A usina solar fotovoltaica será instalada na unidade consumidora seguindo as seguintes normas técnicas:</p>
                    <ul class="normas-list">
                        <li>− Norma Técnica CNC-OMBR-MAT-18-0122-EDBR – Conexão de micro e minigeração distribuída a sistema elétrico da Enel Distribuidora Ceará;</li>
                        <li>− Norma Técnica CNC-OMBR-MAT-18-0124-EDCE – Fornecimento de energia elétrica em tensão secundária de distribuição da Enel Distribuidora Ceará;</li>
                        <li>− Norma Técnica CNC-OMBR-MAT-18-0125-EDCE – Fornecimento de energia elétrica em tensão primária de distribuição da Enel Distribuidora Ceará;</li>
                        <li>− ABNT NBR 5410:2010 – Instalações elétricas de baixa tensão;</li>
                        <li>− ABNT NBR 16690:2019 – Instalações elétricas de arranjos fotovoltaicos – Requisitos de projeto;</li>
                        <li>− ABNT NBR 6123:2013 – Forças devidas ao vento em edificações;</li>
                        <li>− NR 35 – Trabalho em altura;</li>
                        <li>− ABNT NBR IEC 61439-1:2016 Versão corrigida 2017 – Conjuntos de manobra e comando de baixa tensão. Parte 1: Regras gerais;</li>
                        <li>− ABNT NBR IEC 61439-2:2016 – Conjuntos de manobra e comando de baixa tensão. Parte 2: Conjuntos de manobra e comando de potência;</li>
                        <li>− IEC/TS 62548:2013 – Photovoltaic (PV) arrays: Design requirements;</li>
                        <li>− ABNT NBR 16612:2020 – Cabos de potência para sistemas fotovoltaicos, não halogenados, isolados, com cobertura, para tensão até 1,8 kV C.C. entre condutores – Requisitos de desempenho.</li>
                    </ul>

                    <p>A usina instalada terá uma potência instalada de <u>${potenciaSistema || '___'}kW, com os módulos fixados paralelamente ao telhado cerâmico</u>. Nos tópicos seguintes serão descritos os componentes que compõe a usina solar.</p>
                </div>
                ${getFooterHtml(5)}
            </div>

            <!-- PÁGINA 6: MÓDULOS FOTOVOLTAICOS & INVERSOR -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(6, d)}
                <div class="memorial-body">
                    <h3>3.1. Módulos fotovoltaicos:</h3>
                    <p>As principais características dos módulos fotovoltaicos adquiridos pelo cliente são descritas na tabela 3 e o datasheet do mesmo está anexado no tópico 4 (ANEXOS).</p>

                    <div class="table-title">Especificações</div>
                    <table class="memorial-table">
                        <tr><td style="width:60%">MARCA:</td><td><strong>${d.moduloMarca || ''}</strong></td></tr>
                        <tr><td>MODELO:</td><td><strong>${d.moduloModelo || ''}</strong></td></tr>
                        <tr><td>POTÊNCIA NOMINAL DO MÓDULO (Wp):</td><td><strong>${d.moduloPotencia || ''}W</strong></td></tr>
                        <tr><td>Nº TOTAL DE MÓDULOS:</td><td><strong>${d.moduloQtd || ''}</strong></td></tr>
                        <tr><td>POTÊNCIA TOTAL DOS MÓDULOS (kWp):</td><td><strong>${potenciaTotalModulosKwp}WP</strong></td></tr>
                        <tr><td>ISC - CORRENTE DE CURTO CIRCUITO (A):</td><td><strong>${d.moduloIsc || ''}</strong></td></tr>
                        <tr><td>IMPPT - CORRENTE NOMINAL (A):</td><td><strong>${d.moduloImp || ''}</strong></td></tr>
                        <tr><td>VOC - TENSÃO DE CIRCUITO ABERTO (V):</td><td><strong>${d.moduloVoc || ''}</strong></td></tr>
                        <tr><td>VMPPT - TENSÃO NOMINAL (V):</td><td><strong>${d.moduloVmp || ''}</strong></td></tr>
                        <tr><td>EFICIÊNCIA DO MÓDULO:</td><td><strong>${d.moduloEficiencia || ''}%</strong></td></tr>
                    </table>
                    <div class="table-caption">Tabela 3 – Principais características dos módulos fotovoltaicos (em STC).</div>

                    <h3>3.2. Inversor:</h3>
                    <p>As principais características do(s) inversor(es) adquirido(s) pelo cliente são descritas da tabela 4 e o datasheet do mesmo está anexado no tópico 4 (ANEXOS).</p>

                    <div class="table-title">Especificações</div>
                    <table class="memorial-table">
                        <tr><td style="width:60%">MARCA:</td><td><strong>${d.inversorMarca || ''}</strong></td></tr>
                        <tr><td>MODELO:</td><td><strong>${d.inversorModelo || ''}</strong></td></tr>
                        <tr><td>POTÊNCIA MÁXIMA DA ENTRADA CC (kW):</td><td><strong>${d.inversorPotMaxCc || ''}</strong></td></tr>
                        <tr><td>POTÊNCIA NOMINAL DO INVERSOR (kW):</td><td><strong>${d.inversorPotencia || ''}</strong></td></tr>
                        <tr><td>Nº TOTAL DE INVERSORES:</td><td><strong>${d.inversorQtd || ''}</strong></td></tr>
                        <tr><td>POTÊNCIA TOTAL DOS INVERSORES (kW):</td><td><strong>${potenciaInversorTotalKw}</strong></td></tr>
                        <tr><td>CORRENTE CA DO INVERSOR (A):</td><td><strong>${d.inversorINominal || ''}</strong></td></tr>
                        <tr><td>TENSÃO CA DO INVERSOR (V):</td><td><strong>${d.inversorVSaida || ''}</strong></td></tr>
                        <tr><td>TIPO DE SAÍDA:</td><td><strong>${d.inversorTipoSaida || 'MONOFASICA'}</strong></td></tr>
                        <tr><td>EFICIENCIA DO INVERSOR:</td><td><strong>${d.inversorEficiencia || ''}%</strong></td></tr>
                    </table>
                    <div class="table-caption">Tabela 4 – Principais características do(s) inversor(es).</div>

                    <p>O(s) inversor(es) será(ão) instalado(s) em local apropriado e com proteções adequadas as intempéries e de acesso não autorizado.</p>
                </div>
                ${getFooterHtml(6)}
            </div>

            <!-- PÁGINA 7: GRÁFICO 1 & ESTRUTURA DE FIXAÇÃO -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(7, d)}
                <div class="memorial-body">
                    <h3>3.3. Gráfico da previsão de rendimento mensal do sistema solar:</h3>
                    <p>O gráfico 1 descreve a previsão da produção de energia mensal do sistema instalado no cliente.</p>

                    ${gerarGraficoGeracaoSVG(d)}
                    <div class="figure-caption">Gráfico 1 – Previsão de geração de energia mensal (kWh) para a usina do cliente.</div>

                    <h3>3.4. Estrutura de fixação dos módulos fotovoltaicos:</h3>
                    <p>A estrutura de fixação dos módulos fotovoltaicos na residência do cliente será composta por perfis e suportes em alumínio anodizado e periféricos em aço inox 304 para garantir maior resistência a corrosão, segurança e confiabilidade com uma vida útil em cerca de <u>12 anos</u>. A estrutura de fixação estará aterrada por condutor de proteção (PE) de 4,0 mm², em cor verde ou verde e amarelo, e conectados ao Barramento de Equipotencialização Principal (BEP), quando existente, ou será feito o aterramento conforme o que prescreve a NBR 5410 e a tabela 1 da CNC OMBR-MAT-18-0124-EDCE.</p>

                    <p>Em caso de instalação em uma altura maior que 2,0 m do solo, os montadores deverão seguir as normas de trabalho em altura descritos na NR35.</p>

                    <p>As bases de ancoragem dos trilhos que servirão de fixação dos módulos deverão estar igualmente espaçadas e com uma distância máxima de 3,0 m entre elas para adequar-se a norma ABNT NBR 6123:2013.</p>

                    <p>O local de instalação dos módulos deverá estar disposto sem, ou com o menor sombreamento possível, a fim de maximizar a eficiência do sistema.</p>
                </div>
                ${getFooterHtml(7)}
            </div>

            <!-- PÁGINA 8: DISPOSITIVOS DE PROTEÇÃO & ATERRAMENTO -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(8, d)}
                <div class="memorial-body">
                    <h3>3.5. Dispositivos de proteção:</h3>
                    <p>O conjunto de geração e conexão está dotado de proteção integrada contemplando:</p>
                    <ul class="dot-list">
                        <li>Elemento de interrupção;</li>
                        <li>Sub e sobretensão (inversor);</li>
                        <li>Sub e sobrefrequência (inversor);</li>
                        <li>Sincronismo (inversor);</li>
                        <li>Anti-ilhamento (inversor);</li>
                        <li>Curto-circuito (inversor);</li>
                        <li>Sobrecarga (inversor).</li>
                    </ul>

                    <p>O inversor será convenientemente configurado durante o processo de instalação, para atendimento aos parâmetros mínimos de segurança e confiabilidade definidos pela Enel/CE na sua CNC-OMBR-MAT-18-0122-EDBR. Os detalhes do sistema de proteção podem ser consultados no diagrama unifilar básico em anexo.</p>

                    <p>A proteção CA, localizada em caixa de montagem elétrica adequada (cf. ABNT NBR IEC 61439-1/-2:2016) e distinta daquela destinada à proteção CC (cf. item “4.2.5.7” da ABNT NBR 5410:2010), inclui os seguintes dispositivos descritos na tabela 5, com o intuito de proteger os cabos contra correntes maiores que o permitido por norma.</p>

                    <div class="table-title">DISPOSITIVOS DE PROTEÇÃO CA</div>
                    <table class="memorial-table">
                        <thead>
                            <tr>
                                <th style="width:20%">SÉRIE</th>
                                <th style="width:40%">DISJUNTOR</th>
                                <th style="width:40%">DPS CA</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>#Inversor 1</strong></td>
                                <td>01 disjuntor monopolar de ${d.disjuntorCA || '32'} A e curva característica tipo ${d.curvaDisjuntorCA || 'c'}.</td>
                                <td>${d.dpsCA || '02 DPS ClasseII,tensão nominal de 275 VCA e corrente de descarga nominal/máxima de 20/40 kA por polo,com visualização de vida útil na partefrontalou através de contato auxiliar (1F+1N).'}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="table-caption">Tabela 5 – Descrição dos dispositivos de proteção CA.</div>

                    <p>Todas as proteções estão detalhadas também no Diagrama Unifilar anexado no tópico 4 (ANEXOS). O ponto de conexão do sistema fotovoltaico será feito no quadro de distribuição <u>interno, sendo este</u> localizado dentro da edificação, não havendo modificação do ponto de conexão (padrão de entrada) da unidade consumidora. O fornecimento e medição de energia são feitos através de padrão de entrada monofásica, em 220 V.</p>

                    <h3>3.6. Aterramento:</h3>
                    <p>O aterramento de módulos, estruturas metálicas, inversores, quadros CC e CA será feito com condutores de cobre com um diâmetro mínimo de 4mm e interligado ao sistema de aterramento da residência, promovendo a equipotencialização global da instalação. Caso a residência não possua aterramento adequado, o mesmo será feito</p>
                </div>
                ${getFooterHtml(8)}
            </div>

            <!-- PÁGINA 9: FÓRMULAS E EQUAÇÕES DE CONDUTORES -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(9, d)}
                <div class="memorial-body">
                    <p>com hastes de aço cobreado de 15 mm de diâmetro e comprimento mínimo de 2000 mm, de acordo com a tabela 4 da CNC-OMBR-MAT-18-0124-EDCE.</p>

                    <h3>3.7. Condutores:</h3>
                    <p>Para dimensionamento dos condutores, levou-se em consideração as normas brasileiras para instalação de sistemas elétricos de baixa tensão (NBR 5410); a temperatura ambiente de 30ºC; a temperatura do condutor em regime permanente de 70 ºC; instalado em eletroduto aparente de seção circular sobre a parede; com os condutores encostados um ao outro na vertical; a inclusão de fator de segurança de 5% no comprimento de cada condutor; e a avaliação geral da queda de tensão sempre pelo pior cenário e com um limite de queda de tensão de 3% entre os módulos e o inversor e entre o inversor e o ponto de conexão.</p>

                    <p>Para o dimensionamento da secção dos cabos CC é usado a equação abaixo:</p>

                    <div class="formula-box">
                        <div class="formula-eq">
                            S<sub>cc</sub> = <span class="fraction"><span class="numerator">2 · ρ · d · I</span><span class="denominator">ΔV</span></span>
                        </div>
                    </div>
                    <div class="formula-where">
                        onde:<br>
                        − Scc − secção dos cabos CC (mm²);<br>
                        ρ − resistividade do condutor (cobre = 0,0173 Ω · mm²/m);<br>
                        − d − distância simples percorrida pelo condutor (m);<br>
                        − I − corrente (A);<br>
                        ΔV − queda de tensão (V).
                    </div>

                    <p>A queda de tensão em condutor CC máxima permitida, de acordo com a norma IEC/TS 62548:2013, é de 3%.</p>

                    <p>Para o dimensionamento da secção dos cabos CA é usado a equação abaixo:</p>

                    <div class="formula-box">
                        <div class="formula-eq">
                            ΔV (%) = <span class="fraction"><span class="numerator">2 · ρ · d · I</span><span class="denominator">S<sub>CA</sub> · V<sub>t</sub></span></span> · 100
                        </div>
                    </div>
                    <div class="formula-where">
                        onde:<br>
                        − ΔV − queda de tensão (%);<br>
                        SCA − secção dos cabos CA (mm²);<br>
                        − ρ − resistividade do condutor (cobre = 0,0173 Ω · mm²/m);<br>
                        − d − distância simples percorrida pelo condutor (m);<br>
                        − I − corrente (A);<br>
                        − Vt − tensão de CA do inversor (V).
                    </div>

                    <p>No caso de um inversor trifásico, a queda de tensão percentual será:</p>

                    <div class="formula-box">
                        <div class="formula-eq">
                            ΔV (%) = <span class="fraction"><span class="numerator">√3 · 2 · ρ · d · I</span><span class="denominator">S<sub>CA</sub> · V</span></span> · 100
                        </div>
                    </div>

                    <p>Já no caso do dimensionamento da secção dos cabos CA, a queda de tensão máxima permitida, de acordo com a norma ABNT NBR 5410:2013 é de 2%.</p>
                </div>
                ${getFooterHtml(9)}
            </div>

            <!-- PÁGINA 10: TABELA 6 & SINALIZAÇÃO -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(10, d)}
                <div class="memorial-body">
                    <p>A tabela 6 descreve as características dos condutores utilizados na instalação da usina, os quais foram selecionados de acordo com a tabela C-3 da ABNT NBR 16612:2020 e a tabela 33 da ABNT NBR 5410:2013.</p>

                    <table class="memorial-table small-text">
                        <thead>
                            <tr>
                                <th>CIRCUITO</th>
                                <th>TIPO</th>
                                <th>I<sub>b</sub> (A)</th>
                                <th>Tensão (V)</th>
                                <th>TIPO DE CONDUTOR</th>
                                <th>DIÂMETRO CONDUTOR (mm²)</th>
                                <th>CAP. DE COND. CORRENTE (A)</th>
                                <th>COMPR. (m)</th>
                                <th>ΔV (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>STRING 1</td>
                                <td>CC 1,8 kV</td>
                                <td>${d.moduloIsc || '17,50'}</td>
                                <td>${vocTotalString}</td>
                                <td>Cu-Sn, HEPR+XLPE, UV, 120º, 0,6/1,8 kVCC</td>
                                <td>${d.caboCCPos || '4,0'}</td>
                                <td>32,0</td>
                                <td>${d.comprCC || '25,0'}</td>
                                <td>${d.quedaCC || '0,76'}</td>
                            </tr>
                            <tr>
                                <td>FASE - QCA</td>
                                <td>CA 220 V</td>
                                <td>${d.inversorINominal || '25'}</td>
                                <td>220</td>
                                <td>Cabo Cu, PVC, 70º, 750V</td>
                                <td>${d.caboCAFase || '4.0'}</td>
                                <td>32</td>
                                <td>19,0</td>
                                <td>${d.quedaCA || '1,12'}</td>
                            </tr>
                            <tr>
                                <td>QCA-QGBT</td>
                                <td>CA 220 V</td>
                                <td>${d.inversorINominal || '25'}</td>
                                <td>220</td>
                                <td>Cabo Cu, PVC, 70º, 750V</td>
                                <td>${d.caboCAFase || '4.0'}</td>
                                <td>32</td>
                                <td>7,0</td>
                                <td>${d.quedaCA || '1,12'}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="table-caption">Tabela 6 – Descrição dos condutores da usina solar.</div>

                    <h3>3.8. Sinalização:</h3>
                    <p>Seguindo a CNC-OMBR-MAT-18-0122-EDBR, no padrão de entrada do consumidor será instalado uma placa de sinalização conforme a figura 5, fixada de acordo com a figura 6 (extraída do Desenho 3 anexado a especificação citada). A placa deve possuir as seguintes características:</p>
                    <ul class="normas-list">
                        <li>− Espessura: 2 mm;</li>
                        <li>− Material: chapa galvalume (43,5% zinco, 55% alumínio e 1,5% silício) nº 22 USG (0,79 mm), cantos arredondados;</li>
                        <li>− Cor de fundo: amarela, em epóxi;</li>
                        <li>− Letras: cor preta, tinta eletrostática em pó;</li>
                        <li>− Na chapa deverá ser aplicada uma demão de fundo anti-corrosivo de espessura mínima de 30 μm (frente e fundo).</li>
                    </ul>

                    ${d.imgPlacaSinalizacao ? renderMemorialImage('imgPlacaSinalizacao', d.imgPlacaSinalizacao, 'Figura 05: Foto da Placa de Sinalização', 200, '🪧') : gerarPlacaSinalizacaoSVG()}
                </div>
                ${getFooterHtml(10)}
            </div>

            <!-- PÁGINA 11: FIGURAS 5 E 6 DE SINALIZAÇÃO -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(11, d)}
                <div class="memorial-body">
                    <div class="figure-caption" style="margin-top:10px;">Figura 5 – Modelo da placa de sinalização de geração própria.</div>

                    ${renderMemorialImage('imgPlacaSinalizacao', d.imgPlacaSinalizacao, 'Modelo da placa de sinalização de geração própria', 240, '🪧')}
                    <div class="figure-caption">Figura 6 – Desenho 03: Padrão de medição de baixa tensão.</div>

                    ${renderMemorialImage('imgPadraoMedicao', d.imgPadraoMedicao, 'Padrão de Medição de Baixa Tensão', 240, '📐')}
                </div>
                ${getFooterHtml(11)}
            </div>

            <!-- PÁGINA 12: ANEXOS -->
            <div class="doc-page memorial-page">
                ${getHeaderHtml(12, d)}
                <div class="memorial-body">
                    <h2>4. ANEXOS:</h2>
                    <ul class="anexos-list">
                        <li><strong>4.1.</strong> TRT – anotação de responsabilidade técnica;</li>
                        <li><strong>4.2.</strong> Formulário de solicitação de acesso;</li>
                        <li><strong>4.3.</strong> Diagrama unifilar básico;</li>
                        <li><strong>4.4.</strong> Formulário de rateio;</li>
                        <li><strong>4.5.</strong> Documentos do cliente;</li>
                        <li><strong>4.6.</strong> Certificado de conformidade do inversor;</li>
                        <li><strong>4.7.</strong> Datasheet dos módulos fotovoltaicos;</li>
                        <li><strong>4.8.</strong> Datasheet do(s) inversor(es)</li>
                    </ul>
                </div>
                ${getFooterHtml(12)}
            </div>
        </div>
    `;
}
