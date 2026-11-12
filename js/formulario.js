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
 * MODELO 2: Potência SUPERIOR A 10kW
 * Adaptado fielmente da planilha oficial Enel: Formulário e Checklist - VER 17 (1).xlsm
 * Aba: OC-MCG-C (Orçamento de Conexão - Microgeração Distribuída + Carga - Anexo 1 - Módulo 3 - REN 3171/2023 - REV17)
 */
function gerarFormularioAcessoSuperior10kW(d, calcPot) {
    const isGrupoB = (d.grupo || 'B').toUpperCase() === 'B';
    const isGrupoA = (d.grupo || '').toUpperCase() === 'A';

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
    const tensaoAtendimentoFormatada = d.tensaoAtendimento || '220 / 380';
    const classeFormatada = d.modalidade || d.classe || 'B1';

    const isResidencial = classeFormatada.toLowerCase().includes('resid') || classeFormatada.toUpperCase() === 'B1';
    const isComercial = classeFormatada.toLowerCase().includes('comer') || classeFormatada.toUpperCase() === 'B3';
    const isIndustrial = classeFormatada.toLowerCase().includes('indus');
    const isRural = classeFormatada.toLowerCase().includes('rural') || classeFormatada.toUpperCase() === 'B2';

    const comp = (d.tipoCompensacao || 'autoconsumo_local').toLowerCase();
    const isAutoconsumoLocal = comp.includes('local') || (!comp.includes('remoto') && !comp.includes('compartilhada') && !comp.includes('multipla') && !comp.includes('múltipla'));
    const isAutoconsumoRemoto = comp.includes('remoto');
    const isGeracaoCompartilhada = comp.includes('compartilhada');
    const isMultiplasUc = comp.includes('multipla') || comp.includes('múltipla');

    const ufFormatada = d.uf || (d.cidadeDoc ? d.cidadeDoc.split('–').pop().split('-').pop().trim() : 'CE') || 'CE';
    const atividadeFormatada = d.descricaoAtividade || (isComercial ? 'Comercial' : (isIndustrial ? 'Industrial' : (isRural ? 'Rural' : 'Residencial')));

    const phone = formatPhoneParts(d.clienteTelefone);
    const celPhone = formatPhoneParts(d.clienteCelular);

    const dataSlots = formatDateSlots(d.dataProjeto);
    const localNome = d.cidadeDoc ? d.cidadeDoc.split('-')[0].trim() : (d.cidade || 'Pacajus');
    const logoSrc = (typeof ASSETS !== 'undefined' && ASSETS.ENEL_PNG) ? ASSETS.ENEL_PNG : 'enel.png';

    return `
        <!-- PÁGINA 1: CABEÇALHO + SEÇÕES 1, 2, 3 E 4 -->
        <div class="doc-page form-ugd-page">
            <!-- CABEÇALHO DO FORMULÁRIO ENEL (REV17 - REN 3171/2023) -->
            <div class="enel-form-header">
                <div class="enel-logo-container">
                    <img src="${logoSrc}" alt="Enel" class="enel-logo-img">
                </div>
                <div class="enel-title-container">
                    <div class="enel-title-main">FORMULÁRIO DE ORÇAMENTO DE CONEXÃO</div>
                    <div class="enel-title-sub">MICROGERAÇÃO DISTRIBUÍDA + CARGA</div>
                    <div class="enel-title-norma">
                        <span>ANEXO 1 -  MÓDULO 3 - REN 3171/2023</span>
                        <span class="enel-rev">REV17</span>
                    </div>
                </div>
            </div>

            <!-- SEÇÃO 1 -->
            <div class="enel-section-banner">
                <span class="sec-title">1- Identificação da Unidade Consumidora - UC</span>
                <span class="sec-req">(Preenchimento Obrigatório)</span>
            </div>
            <table class="enel-table">
                <tr>
                    <td style="width: 48%;">
                        <strong>Código da UC (Se existente):</strong> ${d.uc || ''}
                    </td>
                    <td style="width: 52%;">
                        ${getCheckboxHtml(isGrupoB, 'Grupo B')}
                        &nbsp;&nbsp;
                        ${getCheckboxHtml(isGrupoA, 'Grupo A')}
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <strong>Classe:</strong> ${classeFormatada}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Nome do Representante:</strong> ${d.clienteNome || ''}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Nome da UC :</strong> ${d.clienteNome || ''}
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
                            <span style="flex:1.2;"><strong>Bairro:</strong> ${d.bairro || ''}</span>
                            <span style="flex:1.2;"><strong>Cidade:</strong> ${d.cidade || ''}</span>
                            <span style="flex:0.6;"><strong>UF:</strong> ${ufFormatada}</span>
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
                            <span style="flex:1;"><strong>Telefone:</strong>  ( ${phone.ddd ? phone.ddd : '&nbsp;&nbsp;&nbsp;&nbsp;'} ) ${phone.num || ''}</span>
                            <span style="flex:1;"><strong>Celular:</strong> ( ${celPhone.ddd ? celPhone.ddd : '&nbsp;&nbsp;&nbsp;&nbsp;'} ) ${celPhone.num || ''}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>CNPJ/CPF:</strong> ${d.clienteCpf || ''}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Descrição da atividade:</strong> ${atividadeFormatada}
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
                    <td style="width: 58%;">
                        <strong>Tensão de atendimento de interesse (Volts):</strong> ${tensaoAtendimentoFormatada}
                    </td>
                    <td style="width: 42%;">
                        <strong>Quantidade de entradas:</strong> 1
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Localização em coordenadas (em graus decimais) do padrão ou ponto de conexão:</strong><br>
                        <div class="row-flex" style="margin-top: 2px;">
                            <span style="flex:1;"><strong>Latitude:</strong> ${d.latitude ? d.latitude + '°' : '(-)___._________°'}</span>
                            <span style="flex:1;"><strong>Longitude:</strong> ${d.longitude ? d.longitude + '°' : '(-)___._________°'}</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tipo de ramal:</strong>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isAereo, 'Aéreo')}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(isSubterraneo, 'Subterrâneo')}
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
                        <strong>Tipo de instalação:</strong>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(true, 'Medição Direta')}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(false, 'Medição Indireta')}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(false, 'Medição Coletiva')}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Modalidade Tarifaria:</strong>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(true, 'Convencional Monômia')}
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        ${getCheckboxHtml(false, 'Horaria Branca')}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Subclasse:</strong><br>
                        <div style="margin-top: 2px; display: flex; flex-direction: column; gap: 2px;">
                            <div class="row-flex">
                                <span>${getCheckboxHtml(isResidencial, 'Residencia Individual')}</span>
                                <span>${getCheckboxHtml(isComercial, 'Comercial')}</span>
                                <span>${getCheckboxHtml(isIndustrial, 'Industrial')}</span>
                                <span>${getCheckboxHtml(false, 'Iluminação Publica')}</span>
                            </div>
                            <div class="row-flex">
                                <span>${getCheckboxHtml(false, 'Residencial / Comercial EMUC')}</span>
                                <span>${getCheckboxHtml(isRural, 'Rural')}</span>
                                <span>${getCheckboxHtml(false, 'Ocupantes')}</span>
                                <span>${getCheckboxHtml(false, 'Radio Base')}</span>
                            </div>
                            <div style="font-size: 6.8pt; margin-top: 1px;">
                                Outro tipo de Atividade descrever na linha: ____________________________________________
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Particularidades do atendimento:</strong>
                        &nbsp;&nbsp;
                        ${getCheckboxHtml(false, 'Atendimento provisório')}
                        &nbsp;&nbsp;
                        ${getCheckboxHtml(false, 'Atendimento em mais de 1 circuito com fins de operação ou rede reserva')}
                    </td>
                </tr>
            </table>

            <!-- SEÇÃO 3 -->
            <div class="enel-section-banner">
                <span class="sec-title">3 - Cronograma das etapa(s)</span>
                <span class="sec-req">(Preenchimento Obrigatório)</span>
            </div>
            <table class="enel-table" style="margin-bottom: 3px;">
                <tr>
                    <td style="width: 50%;">
                        <strong>Carga :</strong><br>
                        <div style="margin-top: 2px; display: flex; flex-direction: column; gap: 2px;">
                            ${getCheckboxHtml(isNovaUc, 'Nova Carga')}
                            ${getCheckboxHtml(isExistenteComAumento, 'Alteração da Carga Instalada')}
                            ${getCheckboxHtml(isExistenteSemAumento, 'Sem alteração na Carga Instalada')}
                        </div>
                    </td>
                    <td style="width: 50%;">
                        <strong>Geração :</strong><br>
                        <div style="margin-top: 2px; display: flex; flex-direction: column; gap: 2px;">
                            ${getCheckboxHtml(true, 'Nova Geração')}
                            ${getCheckboxHtml(false, 'Alteração da Geração Instalada')}
                            ${getCheckboxHtml(false, 'Sem alteração na Geração Instalada')}
                        </div>
                    </td>
                </tr>
            </table>

            <div style="font-size: 7pt; font-weight: bold; background: #eee; padding: 1.5px 5px; border: 1px solid #000; border-bottom: none;">CARGA</div>
            <table class="enel-table" style="margin-bottom: 3px; font-size: 6.8pt;">
                <thead>
                    <tr style="background: #f7f7f7;">
                        <th style="border: 1px solid #000; padding: 2px 4px; width: 25%;">Etapa(s)</th>
                        <th style="border: 1px solid #000; padding: 2px 4px; width: 25%;">Data</th>
                        <th style="border: 1px solid #000; padding: 2px 4px; width: 25%;">Capacidade instalada Total (kVA)</th>
                        <th style="border: 1px solid #000; padding: 2px 4px; width: 25%;">Demanda (kW) Ponto de Entrega 1</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: center;">0 - Atual (Se Houver)</td>
                        <td style="text-align: center;">${dataSlots}</td>
                        <td style="text-align: center;">${potenciaInstaladaFormatada}</td>
                        <td style="text-align: center;">${potenciaInstaladaFormatada}</td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">Final</td>
                        <td style="text-align: center;">${dataSlots}</td>
                        <td style="text-align: center;">${potenciaInstaladaFormatada}</td>
                        <td style="text-align: center;">${potenciaInstaladaFormatada}</td>
                    </tr>
                </tbody>
            </table>

            <div style="font-size: 7pt; font-weight: bold; background: #eee; padding: 1.5px 5px; border: 1px solid #000; border-bottom: none;">GERAÇÃO</div>
            <table class="enel-table" style="margin-bottom: 3px; font-size: 6.8pt;">
                <thead>
                    <tr style="background: #f7f7f7;">
                        <th style="border: 1px solid #000; padding: 2px 4px; width: 25%;">Etapa(s)</th>
                        <th style="border: 1px solid #000; padding: 2px 4px; width: 25%;">Data</th>
                        <th style="border: 1px solid #000; padding: 2px 4px; width: 25%;">Capacidade instalada Total (kVA)</th>
                        <th style="border: 1px solid #000; padding: 2px 4px; width: 25%;">Demanda instalada (kW) Ponto de Entrega 1</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="text-align: center;">Final</td>
                        <td style="text-align: center;">${dataSlots}</td>
                        <td style="text-align: center;">${potenciaGeracaoKwStr}</td>
                        <td style="text-align: center;">${potenciaGeracaoKwStr}</td>
                    </tr>
                </tbody>
            </table>

            <!-- SEÇÃO 4 -->
            <div class="enel-section-banner">
                <span class="sec-title">4 - Dados da Geração</span>
                <span class="sec-req">(Preenchimento Obrigatório)</span>
            </div>
            <table class="enel-table">
                <tr>
                    <td style="width: 50%;">
                        <strong>Potência instalada de geração (kW):</strong> ${potenciaGeracaoKwStr}
                    </td>
                    <td style="width: 50%;">
                        <strong>Potência instalada das cargas e serviços aux. (kW):</strong> ${d.potenciaSistema || '0'}
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Tipo da Fonte de Geração:</strong><br>
                        <div style="margin-top: 2px; display: flex; gap: 10px; flex-wrap: wrap;">
                            ${getCheckboxHtml(isSolar, 'Solar fotovoltaica')}
                            ${getCheckboxHtml(isHidraulica, 'Hidraúlica')}
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
                <tr>
                    <td colspan="2">
                        <strong>Tipo de geração:</strong><br>
                        <div style="margin-top: 2px; display: flex; gap: 12px; flex-wrap: wrap;">
                            ${getCheckboxHtml(true, 'Empregando conversor eletrônico/inversor')}
                            ${getCheckboxHtml(false, 'Empregando máquina síncrona sem conversor')}
                            ${getCheckboxHtml(false, 'Mista')}
                            ${getCheckboxHtml(false, 'Outra (especificar)')}
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <strong>Modalidade de Compensação de Excedentes:</strong><br>
                        <div style="margin-top: 2px; display: flex; gap: 12px; flex-wrap: wrap;">
                            ${getCheckboxHtml(isAutoconsumoLocal, 'Autoconsumo local')}
                            ${getCheckboxHtml(isAutoconsumoRemoto, 'Autoconsumo remoto')}
                            ${getCheckboxHtml(isGeracaoCompartilhada, 'Geração compartilhada')}
                            ${getCheckboxHtml(isMultiplasUc, 'Múltiplas Unidades Consumidoras')}
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- PÁGINA 2: SEÇÕES 5, 6, 7, 8 E 9 -->
        <div class="doc-page form-ugd-page">
            <div class="enel-title-norma" style="margin-bottom: 4px; padding: 2px 0; border-bottom: 1.5px solid #000; font-size: 7pt;">
                <span>FORMULÁRIO DE ORÇAMENTO DE CONEXÃO | MICROGERAÇÃO DISTRIBUÍDA + CARGA - ANEXO 1 MÓDULO 3 REN 3171/2023</span>
                <span class="enel-rev">REV17</span>
            </div>

            <!-- SEÇÃO 5 -->
            <div class="enel-section-banner">
                <span class="sec-title">5 - Informações Adicionais</span>
                <span class="sec-req">(Preenchimento Opcional)</span>
            </div>
            <table class="enel-table" style="margin-bottom: 3px;">
                <tr>
                    <td style="font-size: 6.8pt; padding: 4px 6px;">
                        <strong>Informações adicionais (preencher aqui):</strong><br>
                        Sistema de microgeração distribuída solar fotovoltaica com inversor grid-tie interligado à rede de baixa tensão da Enel Distribuidora Ceará, atendendo integralmente às normas CNC-OMBR-MAT-18-0122-EDBR, NBR 5410, NBR 16690 e resoluções normativas ANEEL vigentes.
                    </td>
                </tr>
            </table>

            <!-- SEÇÃO 6 -->
            <div class="enel-section-banner">
                <span class="sec-title">6 - Documentação a ser anexada</span>
                <span class="sec-req">(Anexo Obrigatório)</span>
            </div>
            <div class="enel-docs-box" style="font-size: 6.1pt; line-height: 1.25; margin-bottom: 3px;">
                <ol class="enel-docs-list" style="margin: 0; padding-left: 14px;">
                    <li>1.1 Para pessoa jurídica, apresentação dos documentos relativos à sua constituição, ao seu registro e dos seus representantes legais;</li>
                    <li>1.2 Para pessoa física, apresentação de: (a) Cadastro de Pessoa Física – CPF; (b) Carteira de Identidade ou outro documento de identificação oficial com foto;</li>
                    <li>1.3 Endereço das instalações ou do número de identificação das instalações já existentes e o endereço ou meio de comunicação para entrega da fatura;</li>
                    <li>1.4 Declaração descritiva da carga instalada;</li>
                    <li>1.4.1 Informação do benefício tarifário que tenha direito, com a respectiva documentação (se aplicável);</li>
                    <li>1.5 Informação das cargas que possam provocar perturbações no sistema de distribuição;</li>
                    <li>1.6 No caso de central geradora, informação das cargas e o valor máximo de potência relativo a seus serviços auxiliares e infraestrutura local;</li>
                    <li>1.7 Informação e documentação das atividades desenvolvidas nas instalações;</li>
                    <li>1.8 Apresentação de licença ou declaração emitida pelo órgão competente caso as instalações ocuparem áreas protegidas pela legislação;</li>
                    <li>1.9 Documento com data que comprove a propriedade ou posse do imóvel onde será implantada a unidade consumidora com microgeração;</li>
                    <li>1.10 Documento que identifique o responsável técnico no conselho profissional competente (ART/TRT), observado o Art. 33 da REN 1000/21;</li>
                    <li>1.11 Na instalação de microgeração e minigeração distribuída: I - é dispensada a apresentação do Certificado de Registro ou documento equivalente; II - dados de segurança de barragens (se aplicável);</li>
                    <li>2 - Documento de responsabilidade técnica (projeto e execução) do conselho profissional competente (ART/TRT), com registro válido e atividades descritas;</li>
                    <li>3 - Indicação do local do padrão ou da subestação de entrada no imóvel (quando exigível aprovação prévia de projeto);</li>
                    <li>4 - Diagrama unifilar e de blocos e memorial descritivo do sistema de geração e proteção;</li>
                    <li>5 - Relatório de ensaio ou certificado de conformidade atestando a conformidade de todos os conversores de potência (inversores) para a tensão nominal de conexão;</li>
                    <li>6 - Dados necessários ao registro da central geradora distribuída conforme disponível no site da ANEEL;</li>
                    <li>7 - Lista de unidades consumidoras participantes do sistema de compensação, indicando o percentual ou ordem de rateio (se houver);</li>
                    <li>8 - Cópia de instrumento jurídico que comprove a participação dos integrantes para casos de múltiplas UCs e geração compartilhada (se aplicável);</li>
                    <li>9 - Documento que comprove o reconhecimento, pela ANEEL, da cogeração qualificada (se aplicável);</li>
                    <li>10 - Dados de segurança das barragens no caso do uso de sistemas com fontes hídricas (se aplicável);</li>
                    <li>11 - Para centrais fotovoltaicas enquadradas como despacháveis, comprovação de sistema de armazenamento conforme art. 655-B da REN 1.000/2021 (se aplicável);</li>
                    <li>12 - Documento que comprove o aporte da Garantia de Fiel Cumprimento, se aplicável, conforme art. 655-C da REN 1.000/2021;</li>
                    <li>13 - Formulário ENEL preenchido e assinado para elaboração de contrato de fornecimento.</li>
                </ol>
            </div>

            <!-- SEÇÃO 7 -->
            <div class="enel-section-banner">
                <span class="sec-title">7 - Solicitações e Declarações</span>
                <span class="sec-req">(Assinalar com "X")</span>
            </div>
            <table class="enel-table" style="font-size: 6.5pt; margin-bottom: 3px;">
                <tr>
                    <td style="padding: 2px 4px;">
                        ${getCheckboxHtml(false, '')} Solicito que a contagem do prazo para realização da vistoria pela distribuidora, conforme art. 91 da Resolução Normativa nº 1.000/2021, inicie-se somente após minha solicitação. (Opcional)
                    </td>
                </tr>
                <tr>
                    <td style="padding: 2px 4px;">
                        ${getCheckboxHtml(false, '')} Renuncio ao direito de desistir do orçamento de conexão nos termos dos §§ 7º e 8º do art. 89 da Resolução Normativa nº 1.000/2021. (Opcional)
                    </td>
                </tr>
                <tr>
                    <td style="padding: 2px 4px;">
                        ${getCheckboxHtml(false, '')} Autorizo a distribuidora a entregar junto com o orçamento de conexão os contratos e o documento ou meio para pagamento de custos de minha responsabilidade. (Opcional)
                    </td>
                </tr>
                <tr>
                    <td style="padding: 2px 4px;">
                        ${getCheckboxHtml(true, '')} <strong>Declaro que as instalações internas da minha unidade consumidora, incluindo a geração distribuída, atendem às normas e padrões da distribuidora, às normas da Associação Brasileira de Normas Técnicas - ABNT e às normas dos órgãos oficiais competentes, e ao art. 8º da Lei nº 9.074, de 1995, naquilo que for aplicável. (Obrigatório)</strong>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 2px 4px;">
                        ${getCheckboxHtml(false, '')} Solicito dispensa da análise de inversão de fluxo por enquadramento no art. 73-A, na seguinte regra: (Opcional)<br>
                        <div style="margin-left: 18px; line-height: 1.25; margin-top: 1px;">
                            • Não injeção na rede de distribuição de energia elétrica (“Grid Zero”);<br>
                            • Enquadramento nos critérios de gratuidade da REN 1.000/2021 e potência de geração compatível com o consumo no horário de geração;<br>
                            • Modalidade autoconsumo local, com potência instalada de geração igual ou inferior a 7,5 kW, com renúncia irrevogável à realocação de créditos (inciso III do caput do art. 73-A da REN 1.000/2021).
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 2px 4px;">
                        ${getCheckboxHtml(true, '')} <strong>Declaro, para todos os fins, que todas as informações prestadas neste documento são verdadeiras. (Obrigatório)</strong>
                    </td>
                </tr>
            </table>

            <!-- SEÇÃO 8 -->
            <div class="enel-section-banner">
                <span class="sec-title">8 - Contato na Distribuidora (preenchido pela Distribuidora)</span>
                <span class="sec-req">(Informação à ser repassada pela Distribuidora)</span>
            </div>
            <table class="enel-table" style="margin-bottom: 3px;">
                <tr>
                    <td style="width: 50%;"><strong>Responsável/Área:</strong></td>
                    <td style="width: 50%;"><strong>Endereço:</strong></td>
                </tr>
                <tr>
                    <td><strong>Telefone:</strong></td>
                    <td><strong>E-mail:</strong></td>
                </tr>
            </table>

            <!-- SEÇÃO 9 -->
            <div class="enel-section-banner">
                <span class="sec-title">9 - Solicitante</span>
                <span class="sec-req">(Preenchimento Obrigatório)</span>
            </div>
            <table class="enel-table" style="margin-bottom: 4px;">
                <tr>
                    <td colspan="2"><strong>Nome/Procurador Legal:</strong> ${d.clienteNome || ''}</td>
                </tr>
                <tr>
                    <td style="width: 50%;"><strong>Telefone:</strong> ( ${phone.ddd ? phone.ddd : '&nbsp;&nbsp;&nbsp;&nbsp;'} ) ${phone.num || ''}</td>
                    <td style="width: 50%;"><strong>E-mail:</strong> ${d.clienteEmail || ''}</td>
                </tr>
            </table>

            <!-- ASSINATURA E LOCAL / DATA (FORMATO ENEL OC-MCG-C) -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 12px; padding: 0 5px;">
                <div style="width: 45%; text-align: left;">
                    <div style="font-size: 7.5pt; font-weight: bold; margin-bottom: 2px;">${localNome}, ${dataSlots}</div>
                    <div style="border-top: 1px solid #000; width: 100%; margin-top: 2px;"></div>
                    <div style="display: flex; justify-content: space-between; font-size: 6.8pt; color: #333; margin-top: 2px;">
                        <span>Local</span>
                        <span>Data</span>
                    </div>
                </div>
                <div style="width: 50%; text-align: center;">
                    <div style="height: 18px;"></div>
                    <div style="border-top: 1px solid #000; width: 100%;"></div>
                    <span style="font-size: 7pt; color: #333; display: block; margin-top: 2px;">Assinatura do Representante Legal</span>
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
