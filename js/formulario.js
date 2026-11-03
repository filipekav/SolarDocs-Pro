/**
 * Gerador de Formulários de Acesso e Orçamento de Conexão ENEL
 * 
 * - Modelo 1 (<= 10kW): Solicitação de Acesso para Microgeração com Potência Igual ou Inferior a 10kW (Anexo 3.A Módulo 3 - REN 956/2021 REV05)
 * - Modelo 2 (> 10kW): Formulário de Solicitação de Acesso para Microgeração Distribuída com Potência Superior a 10kW
 * 
 * O controle do modelo considera prioritariamente a Potência Nominal total dos inversores (Potência x Quantidade).
 */

function getCheckboxHtml(checked, label) {
    const mark = checked ? '✓' : '';
    return `<span class="chk-box-wrap"><span class="chk-box">${mark}</span><span class="chk-lbl">${label}</span></span>`;
}

/**
 * Calcula a Potência Nominal total dos inversores em kW
 */
function calcularPotenciaNominalInversor(d) {
    let rawPotInvStr = String(d.inversorPotencia || '').trim();
    if (rawPotInvStr.includes(',') && rawPotInvStr.includes('.')) {
        rawPotInvStr = rawPotInvStr.replace(/\./g, '').replace(',', '.');
    } else if (rawPotInvStr.includes(',')) {
        rawPotInvStr = rawPotInvStr.replace(',', '.');
    }
    const potInvVal = parseFloat(rawPotInvStr) || 0;
    const qtdInv = Math.max(1, parseInt(d.inversorQtd, 10) || 1);

    let potUnitKw = 0;
    let totalKw = 0;
    if (potInvVal > 0) {
        // Se maior que 100, valor está em Watts (ex: 6000W -> 6kW, 15000W -> 15kW); se <= 100, já está em kW (ex: 6kW, 15kW)
        potUnitKw = potInvVal > 100 ? (potInvVal / 1000) : potInvVal;
        totalKw = potUnitKw * qtdInv;
    } else if (d.potenciaSistema) {
        let rawPotSis = String(d.potenciaSistema).replace(',', '.');
        totalKw = parseFloat(rawPotSis) || 0;
        potUnitKw = totalKw / qtdInv;
    }

    const totalKwStr = Number.isInteger(totalKw) ? String(totalKw) : String(parseFloat(totalKw.toFixed(3)));
    return {
        potInvVal,
        qtdInv,
        potUnitKw,
        totalKw,
        totalKwStr
    };
}

/**
 * Determina se o projeto se enquadra no formulário de potência superior a 10kW
 */
function isFormularioSuperior10kW(d, calcPot) {
    if (d && d.modeloFormulario === 'superior_10kw') return true;
    if (d && d.modeloFormulario === 'ate_10kw') return false;
    const calc = calcPot || calcularPotenciaNominalInversor(d || {});
    return (calc.totalKw > 10);
}

/**
 * Formata telefone separando DDD e número
 */
function formatPhoneParts(phoneStr) {
    if (!phoneStr) return { ddd: '', num: '' };
    const raw = String(phoneStr).trim();
    const digits = raw.replace(/\D/g, '');
    if (digits.length >= 10) {
        const ddd = digits.slice(0, 2);
        const rest = digits.slice(2);
        let numFormatted = rest;
        if (rest.length === 9) {
            numFormatted = `${rest[0]} ${rest.slice(1, 5)}-${rest.slice(5)}`;
        } else if (rest.length === 8) {
            numFormatted = `${rest.slice(0, 4)}-${rest.slice(4)}`;
        }
        return { ddd, num: numFormatted };
    }
    return { ddd: '', num: raw };
}

/**
 * Formata data em slots separados para formulário
 */
function formatDateSlots(dateStr) {
    if (!dateStr) return '_______&nbsp;/&nbsp;_______&nbsp;/&nbsp;_______';
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
        const ano = parts[0];
        const mes = parts[1];
        const dia = parts[2];
        return `${dia}&nbsp;&nbsp;/&nbsp;&nbsp;${mes}&nbsp;&nbsp;/&nbsp;&nbsp;${ano}`;
    }
    return (typeof formatDateBR === 'function') ? formatDateBR(dateStr) : dateStr;
}

/**
 * MODELO 1: Potência IGUAL OU INFERIOR A 10kW (Anexo 3.A Módulo 3 - REN 956/2021 REV05)
 */
function gerarFormularioAcessoAte10kW(d, calcPot) {
    const dataFormatada = (typeof formatDateBR === 'function') ? formatDateBR(d.dataProjeto) : (d.dataProjeto || '');

    const isMono = (d.tipoConexao || 'MONOFÁSICA').toUpperCase().includes('MONO');
    const isBi = (d.tipoConexao || '').toUpperCase().includes('BI');
    const isTri = (d.tipoConexao || '').toUpperCase().includes('TRI');

    const isAereo = (d.tipoRamal || 'Aéreo').toLowerCase().includes('aéreo') || (d.tipoRamal || '').toLowerCase().includes('aereo');
    const isSubterraneo = (d.tipoRamal || '').toLowerCase().includes('subterrâneo') || (d.tipoRamal || '').toLowerCase().includes('subterraneo');

    const isGrupoB = (d.grupo || 'B').toUpperCase() === 'B';
    const isGrupoA = (d.grupo || '').toUpperCase() === 'A';

    const isSolar = (d.tipoFonte || 'Solar Fotovoltaica').toLowerCase().includes('solar');
    const isEolica = (d.tipoFonte || '').toLowerCase().includes('eólica') || (d.tipoFonte || '').toLowerCase().includes('eolica');
    const isHidraulica = (d.tipoFonte || '').toLowerCase().includes('hidraúlica') || (d.tipoFonte || '').toLowerCase().includes('hidraulica');
    const isBiomassa = (d.tipoFonte || '').toLowerCase().includes('biomassa');
    const isCogeracao = (d.tipoFonte || '').toLowerCase().includes('cogeração') || (d.tipoFonte || '').toLowerCase().includes('cogeracao');

    const potenciaGeracaoKw = calcPot ? calcPot.totalKwStr : (d.potenciaSistema || '');
    const logoSrc = (typeof ASSETS !== 'undefined' && ASSETS.ENEL_PNG) ? ASSETS.ENEL_PNG : 'enel.png';

    return `
        <div class="doc-page form-ugd-page">
            <!-- CABEÇALHO DO FORMULÁRIO ENEL (ATÉ 10kW) -->
            <div class="enel-form-header">
                <div class="enel-logo-container">
                    <img src="${logoSrc}" alt="Enel" class="enel-logo-img">
                </div>
                <div class="enel-title-container">
                    <div class="enel-title-main">FORMULÁRIO DE ORÇAMENTO DE CONEXÃO</div>
                    <div class="enel-title-sub">SOLICITAÇÃO DE ACESSO PARA MICROGERAÇÃO DISTRIBUÍDA COM POTÊNCIA IGUAL OU INFERIOR A 10kW</div>
                    <div class="enel-title-norma">
                        <span>ANEXO 3.A MÓDULO 3 - REN 956/2021</span>
                        <span class="enel-rev">REV05</span>
                    </div>
                </div>
            </div>

            <!-- SEÇÃO 1 -->
            <div class="enel-section-banner">
                <span class="sec-title">1 - Identificação da Unidade Consumidora - UC</span>
                <span class="sec-req">(Preenchimento Obrigatório)</span>
            </div>
            <table class="enel-table">
                <tr>
                    <td style="width: 45%;">
                        <strong>Código da UC:</strong> ${d.uc || ''}
                    </td>
                    <td>
                        ${getCheckboxHtml(isGrupoB, 'Grupo B')}
                        &nbsp;&nbsp;
                        ${getCheckboxHtml(isGrupoA, 'Grupo A')}
                        &nbsp;&nbsp;
                        <strong>Classe:</strong> ${d.modalidade || d.classe || 'B1'}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Titular da UC :</strong> ${d.clienteNome || ''}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="row-flex">
                            <span style="flex:2.2;"><strong>Rua/Av.:</strong> ${d.endereco || ''}</span>
                            <span style="flex:0.9;"><strong>Nº:</strong> ${d.numero || '0000'}</span>
                            <span style="flex:1.1;"><strong>CEP:</strong> ${d.cep || ''}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="row-flex">
                            <span style="flex:1;"><strong>Bairro:</strong> ${d.bairro || ''}</span>
                            <span style="flex:1;"><strong>Cidade:</strong> ${d.cidade || ''}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>E-mail:</strong> ${d.clienteEmail || ''}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="row-flex">
                            <span style="flex:1;"><strong>Telefone:</strong> ${d.clienteTelefone ? d.clienteTelefone : '( )'}</span>
                            <span style="flex:1;"><strong>Celular:</strong> ${d.clienteTelefone ? d.clienteTelefone : '( )'}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>CNPJ/CPF:</strong> ${d.clienteCpf || ''}
                    </td>
                </tr>
            </table>

            <!-- SEÇÃO 2 -->
            <div class="enel-section-banner">
                <span class="sec-title">2 - Dados da Unidade Consumidora</span>
                <span class="sec-req">(Preenchimento Obrigatório)</span>
            </div>
            <table class="enel-table">
                <tr>
                    <td style="width: 50%;">
                        <strong>Localização em coordenadas (em graus decimais):</strong>
                    </td>
                    <td>
                        <strong>Latitude: </strong> ${d.latitude || ''}° &nbsp;&nbsp;
                        <strong>Longitude: </strong> ${d.longitude || ''}°
                    </td>
                </tr>
                <tr>
                    <td>
                        <strong>Potência instalada (kW):</strong> ${d.potenciaSistema || potenciaGeracaoKw}
                    </td>
                    <td>
                        <strong>Tensão de atendimento (V):</strong> ${d.tensaoAtendimento || '220'}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tipo de conexão:</strong>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isMono, 'Monofásica')}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isBi, 'Bifásica')}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isTri, 'Trifásica')}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tipo de ramal:</strong>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isAereo, 'Aéreo')}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isSubterraneo, 'Subterrâneo')}
                    </td>
                </tr>
            </table>

            <!-- SEÇÃO 3 -->
            <div class="enel-section-banner">
                <span class="sec-title">3 - Dados da Geração</span>
                <span class="sec-req">(Preenchimento Obrigatório)</span>
            </div>
            <table class="enel-table">
                <tr>
                    <td colspan="2">
                        <strong>Potência instalada de geração (kW):</strong> ${potenciaGeracaoKw}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tipo da Fonte de Geração:</strong><br>
                        <div style="margin-top: 4px; display: flex; gap: 14px; flex-wrap: wrap;">
                            ${getCheckboxHtml(isHidraulica, 'Hidráulica')}
                            ${getCheckboxHtml(isCogeracao, 'Cogeração Qualificada')}
                            ${getCheckboxHtml(isEolica, 'Eólica')}
                            ${getCheckboxHtml(isBiomassa, 'Biomassa')}
                            ${getCheckboxHtml(isSolar, 'Solar')}
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Outra (especificar):</strong> ____________________________________________________________________
                    </td>
                </tr>
            </table>

            <!-- SEÇÃO 4 -->
            <div class="enel-section-banner">
                <span class="sec-title">4 - Documentação a Ser Anexada</span>
                <span class="sec-req">(Anexo Obrigatório)</span>
            </div>
            <div class="enel-docs-box">
                <ol class="enel-docs-list">
                    <li>1. Documento de responsabilidade técnica (projeto e execução) do conselho profissional competente, que identifique o número do registro válido e o nome do responsável técnico, o local da obra ou serviço e as atividades profissionais desenvolvidas, caso seja exigível na legislação específica e na forma prevista nessa legislação.</li>
                    <li>2. Diagrama unifilar contemplando Geração/Proteção (inversor, se for o caso)/Medição e memorial descritivo da instalação.</li>
                    <li>3. Certificado de conformidade do(s) inversor(es) ou número de registro da concessão do Inmetro do(s) inversor(es) para a tensão nominal de conexão com a rede.</li>
                    <li>4. Dados necessários para registro da central geradora conforme disponível no site da ANEEL, a depender do tipo de fonte.</li>
                    <li>5. Lista de unidades consumidoras participantes do sistema de compensação (se houver) indicando a porcentagem de rateio dos créditos e o enquadramento, conforme Resolução Normativa nº 482/2012.</li>
                    <li>6. Cópia de instrumento jurídico que comprove o compromisso de solidariedade entre os integrantes, se houver.</li>
                    <li>7. Documento que comprove o reconhecimento pela ANEEL da cogeração qualificada, se houver.</li>
                    <li>8. No caso de ligação de nova unidade consumidora ou aumento de carga de unidade existente, devem ser apresentadas as informações descritas nas Regras de Prestação do Serviço Público de Distribuição de Energia Elétrica para os respectivos casos.</li>
                </ol>
            </div>

            <!-- SEÇÃO 5 -->
            <div class="enel-section-banner">
                <span class="sec-title">5 - Contato na Distribuidora (preenchido pela Distribuidora)</span>
                <span class="sec-req">(Informação à ser repassada pela Distribuidora)</span>
            </div>
            <table class="enel-table">
                <tr><td><strong>Responsável/Área:</strong></td></tr>
                <tr><td><strong>Endereço:</strong></td></tr>
                <tr><td><strong>Telefone:</strong></td></tr>
                <tr><td><strong>E-mail:</strong></td></tr>
            </table>

            <!-- SEÇÃO 6 -->
            <div class="enel-section-banner">
                <span class="sec-title">6 - Solicitante</span>
                <span class="sec-req">(Preenchimento Obrigatório)</span>
            </div>
            <table class="enel-table">
                <tr><td colspan="2"><strong>Nome/Procurador Legal:</strong> ${d.clienteNome || ''}</td></tr>
                <tr><td colspan="2"><strong>Telefone:</strong> ${d.clienteTelefone || ''}</td></tr>
                <tr><td colspan="2"><strong>E-mail:</strong> ${d.clienteEmail || ''}</td></tr>
            </table>

            <!-- ASSINATURA -->
            <div class="enel-signature-block">
                <div class="sig-col-left">
                    <span class="sig-date-text">${d.cidadeDoc || 'Pacajus - CE'}, ${dataFormatada}</span>
                    <div class="sig-line"></div>
                    <span class="sig-label">Local / Data</span>
                </div>
                <div class="sig-col-right">
                    <div class="sig-line" style="margin-top: 15px;"></div>
                    <span class="sig-label">Assinatura do Representante Legal</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * MODELO 2: Potência SUPERIOR A 10kW (Formulário de Solicitação de Acesso para Microgeração Superior a 10kW)
 */
function gerarFormularioAcessoSuperior10kW(d, calcPot) {
    const isMono = (d.tipoConexao || 'MONOFÁSICA').toUpperCase().includes('MONO');
    const isBi = (d.tipoConexao || '').toUpperCase().includes('BI');
    const isTri = (d.tipoConexao || '').toUpperCase().includes('TRI');

    const isAereo = (d.tipoRamal || 'Aéreo').toLowerCase().includes('aéreo') || (d.tipoRamal || '').toLowerCase().includes('aereo');
    const isSubterraneo = (d.tipoRamal || '').toLowerCase().includes('subterrâneo') || (d.tipoRamal || '').toLowerCase().includes('subterraneo');

    const isSolar = (d.tipoFonte || 'Solar Fotovoltaica').toLowerCase().includes('solar');
    const isEolica = (d.tipoFonte || '').toLowerCase().includes('eólica') || (d.tipoFonte || '').toLowerCase().includes('eolica');
    const isHidraulica = (d.tipoFonte || '').toLowerCase().includes('hidraúlica') || (d.tipoFonte || '').toLowerCase().includes('hidraulica');
    const isBiomassa = (d.tipoFonte || '').toLowerCase().includes('biomassa');
    const isCogeracao = (d.tipoFonte || '').toLowerCase().includes('cogeração') || (d.tipoFonte || '').toLowerCase().includes('cogeracao');

    const tipoSol = d.tipoSolicitacao || 'existente_sem_aumento';
    const isNovaUc = tipoSol === 'nova_uc';
    const isExistenteSemAumento = tipoSol === 'existente_sem_aumento' || (!d.tipoSolicitacao && !!d.uc);
    const isExistenteComAumento = tipoSol === 'existente_com_aumento';

    const potenciaGeracaoKwStr = calcPot ? calcPot.totalKwStr : (d.potenciaSistema || '');
    const potenciaInstaladaFormatada = d.potenciaSistema || potenciaGeracaoKwStr;
    const tensaoAtendimentoFormatada = d.tensaoAtendimento || '220V / 380V';
    const classeFormatada = d.modalidade || d.classe || 'B1';

    const phone = formatPhoneParts(d.clienteTelefone);
    const celPhone = formatPhoneParts(d.clienteCelular);

    const dataSlots = formatDateSlots(d.dataProjeto);
    const localNome = d.cidadeDoc ? d.cidadeDoc.split('-')[0].trim() : (d.cidade || 'Pacajus');
    const logoSrc = (typeof ASSETS !== 'undefined' && ASSETS.ENEL_PNG) ? ASSETS.ENEL_PNG : 'enel.png';

    return `
        <div class="doc-page form-ugd-page">
            <!-- CABEÇALHO DO FORMULÁRIO ENEL (SUPERIOR A 10kW) -->
            <div class="enel-form-header">
                <div class="enel-logo-container">
                    <img src="${logoSrc}" alt="Enel" class="enel-logo-img">
                </div>
                <div class="enel-title-container" style="display: flex; flex-direction: column; justify-content: center; text-align: center; padding: 4px 6px;">
                    <div class="enel-title-main" style="font-size: 8.5pt; font-weight: bold; line-height: 1.35; margin-bottom: 2px;">FORMULÁRIO DE SOLICITAÇÃO DE ACESSO PARA MICROGERAÇÃO</div>
                    <div class="enel-title-main" style="font-size: 8.5pt; font-weight: bold; line-height: 1.35;">DISTRIBUÍDA COM POTÊNCIA SUPERIOR A 10kW</div>
                </div>
            </div>

            <!-- SEÇÃO 1 -->
            <div class="enel-section-banner-gray">
                <span class="sec-title-centered">1 - Identificação da Unidade Consumidora - UC</span>
            </div>
            <table class="enel-table">
                <tr>
                    <td style="width: 48%;">
                        <strong>Código da UC:</strong> ${d.uc || ''}
                    </td>
                    <td style="width: 52%;">
                        <strong>Classe:</strong> ${classeFormatada}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Titular da UC:</strong> ${d.clienteNome || ''}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="row-flex">
                            <span style="flex:2.2;"><strong>Rua/Av.:</strong> ${d.endereco || ''}</span>
                            <span style="flex:0.9;"><strong>Nº:</strong> ${d.numero || '0000'}</span>
                            <span style="flex:1.1;"><strong>CEP:</strong> ${d.cep || ''}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="row-flex">
                            <span style="flex:1;"><strong>Bairro:</strong> ${d.bairro || ''}</span>
                            <span style="flex:1;"><strong>Cidade:</strong> ${d.cidade || ''}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>E-mail:</strong> ${d.clienteEmail || ''}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="row-flex">
                            <span style="flex:1;"><strong>Telefone:</strong> ( ${phone.ddd ? phone.ddd : '&nbsp;&nbsp;&nbsp;&nbsp;'} ) ${phone.num || ''}</span>
                            <span style="flex:1;"><strong>Celular:</strong> ( ${celPhone.ddd ? celPhone.ddd : '&nbsp;&nbsp;&nbsp;&nbsp;'} ) ${celPhone.num || ''}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>CNPJ/CPF:</strong> ${d.clienteCpf || ''}
                    </td>
                </tr>
            </table>

            <!-- SEÇÃO 2 -->
            <div class="enel-section-banner-gray">
                <span class="sec-title-centered">2 - Dados da Unidade Consumidora</span>
            </div>
            <table class="enel-table">
                <tr>
                    <td style="width: 48%;">
                        <strong>Potência instalada (kW):</strong> ${potenciaInstaladaFormatada}
                    </td>
                    <td style="width: 52%;">
                        <strong>Tensão de atendimento (V):</strong> ${tensaoAtendimentoFormatada}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Capacidade do Disjuntor (A):</strong> ${d.disjuntorEntrada || ''}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tipo de conexão:</strong>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isMono, 'monofásica')}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isBi, 'bifásica')}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isTri, 'trifásica')}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tipo de ramal:</strong>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isAereo, 'aéreo')}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isSubterraneo, 'subterrâneo')}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tipo de Solicitação:</strong><br>
                        <div style="margin-top: 3px; display: flex; flex-direction: column; gap: 2px;">
                            ${getCheckboxHtml(isNovaUc, 'Ligação de Nova Unidade Consumidora com Geração Distribuída')}
                            ${getCheckboxHtml(isExistenteSemAumento, 'Conexão de Geração Distribuída em Unidade Consumidora Existente SEM Aumento de Potência Disponibilizada')}
                            ${getCheckboxHtml(isExistenteComAumento, 'Conexão de Geração Distribuída em Unidade Consumidora Existente COM Aumento de Potência Disponibilizada')}
                        </div>
                    </td>
                </tr>
            </table>

            <!-- SEÇÃO 3 -->
            <div class="enel-section-banner-gray">
                <span class="sec-title-centered">3 - Dados da Geração</span>
            </div>
            <table class="enel-table">
                <tr>
                    <td colspan="2">
                        <strong>Potência instalada de geração (kW):</strong> ${potenciaGeracaoKwStr}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tipo da Fonte de Geração:</strong><br>
                        <div style="margin-top: 3px; display: flex; gap: 14px; flex-wrap: wrap;">
                            ${getCheckboxHtml(isHidraulica, 'Hidráulica')}
                            ${getCheckboxHtml(isSolar, 'Solar')}
                            ${getCheckboxHtml(isEolica, 'Eólica')}
                            ${getCheckboxHtml(isBiomassa, 'Biomassa')}
                            ${getCheckboxHtml(isCogeracao, 'Cogeração Qualificada')}
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Outra (especificar):</strong> ____________________________________________________________________
                    </td>
                </tr>
            </table>

            <!-- SEÇÃO 4 -->
            <div class="enel-section-banner-gray">
                <span class="sec-title-centered">4 - Documentação a Ser Anexada</span>
            </div>
            <div class="enel-docs-box">
                <ol class="enel-docs-list">
                    <li>1. ART do Responsável Técnico pelo projeto elétrico e instalação do sistema de microgeração</li>
                    <li>2. Projeto elétrico das instalações de conexão, memorial descritivo</li>
                    <li>3. Diagrama unifilar e de blocos do sistema de geração, carga e proteção</li>
                    <li>4. Certificado de conformidade do(s) inversor(es) ou número de registro da concessão do Inmetro do(s) inversor(es) para a tensão nominal de conexão com a rede.</li>
                    <li>5. Dados necessários ao registro da central geradora conforme disponível no site da ANEEL: <span class="enel-link-aneel">www.aneel.gov.br/scg</span></li>
                    <li>6. Lista de unidades consumidoras participantes do sistema de compensação (se houver) indicando a porcentagem de rateio dos créditos e o enquadramento conforme incisos VI a VIII do art. 2º da Resolução Normativa nº 482/2012</li>
                    <li>7. Cópia de instrumento jurídico que comprove o compromisso de solidariedade entre os integrantes (se houver)</li>
                    <li>8. Documento que comprove o reconhecimento, pela ANEEL, da cogeração qualificada (se houver)</li>
                </ol>
            </div>

            <!-- SEÇÃO 5 -->
            <div class="enel-section-banner-gray">
                <span class="sec-title-centered">5 - Contato na Distribuidora (preenchido pela Distribuidora)</span>
            </div>
            <table class="enel-table">
                <tr><td><strong>Responsável/Área:</strong></td></tr>
                <tr><td><strong>Endereço:</strong></td></tr>
                <tr><td><strong>Telefone:</strong></td></tr>
                <tr><td><strong>E-mail:</strong></td></tr>
            </table>

            <!-- SEÇÃO 6 -->
            <div class="enel-section-banner-gray">
                <span class="sec-title-centered">6 - Solicitante</span>
            </div>
            <table class="enel-table">
                <tr><td colspan="2"><strong>Nome/Procurador Legal:</strong> ${d.clienteNome || ''}</td></tr>
                <tr><td colspan="2"><strong>Telefone:</strong> ${d.clienteTelefone || ''}</td></tr>
                <tr><td colspan="2"><strong>E-mail:</strong> ${d.clienteEmail || ''}</td></tr>
            </table>

            <!-- ASSINATURA E LOCAL / DATA (3 COLUNAS) -->
            <div class="enel-signature-block-3col">
                <div class="sig-col-3">
                    <div class="sig-val-text">${localNome}</div>
                    <div class="sig-line"></div>
                    <span class="sig-label">Local</span>
                </div>
                <div class="sig-col-3">
                    <div class="sig-val-text">${dataSlots}</div>
                    <div class="sig-line"></div>
                    <span class="sig-label">Data</span>
                </div>
                <div class="sig-col-3">
                    <div class="sig-val-text">&nbsp;</div>
                    <div class="sig-line"></div>
                    <span class="sig-label">Assinatura do Responsável</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Função principal geradora do Formulário de Acesso Enel
 * Seleciona automaticamente entre o modelo <= 10kW ou > 10kW baseado na Potência Nominal do Inversor
 */
function gerarFormularioAcesso(data) {
    const d = data || {};
    const calcPot = calcularPotenciaNominalInversor(d);
    const isSuperior = isFormularioSuperior10kW(d, calcPot);

    if (isSuperior) {
        return gerarFormularioAcessoSuperior10kW(d, calcPot);
    } else {
        return gerarFormularioAcessoAte10kW(d, calcPot);
    }
}
