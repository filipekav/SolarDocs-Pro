/**
 * Gerador do Formulário de Acesso e Orçamento de Conexão ENEL (Anexo 3.A Módulo 3 - REN 956/2021 REV05)
 */

function getCheckboxHtml(checked, label) {
    const mark = checked ? '✓' : '';
    return `<span class="chk-box-wrap"><span class="chk-box">${mark}</span><span class="chk-lbl">${label}</span></span>`;
}

function gerarFormularioAcesso(data) {
    const d = data || {};
    const dataFormatada = formatDateBR(d.dataProjeto);

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

    return `
        <div class="doc-page form-ugd-page">
            <!-- CABEÇALHO DO FORMULÁRIO ENEL -->
            <div class="enel-form-header">
                <div class="enel-logo-container">
                    <img src="${(typeof ASSETS !== 'undefined' && ASSETS.ENEL_PNG) ? ASSETS.ENEL_PNG : 'enel.png'}" alt="Enel" class="enel-logo-img">
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
                        <strong>Classe:</strong> ${d.classe || 'B1'}
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
                        <strong>Potência instalada (kW):</strong> ${d.potenciaSistema || ''}
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
                        <strong>Potência instalada de geração (kW):</strong> ${d.potenciaSistema || ''}
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
