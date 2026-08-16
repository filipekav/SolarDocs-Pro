function criarCarimboPrancha(d, pranchaNum, tituloPrancha, carimboX = 550, carimboY = 660, carimboW = 480, carimboH = 215) {
    const logoSrc = d.logoEmpresa || ((typeof ASSETS !== 'undefined' && ASSETS.LOGO_JPEG) ? ASSETS.LOGO_JPEG : 'logo.jpeg');
    return `
        <rect x="${carimboX}" y="${carimboY}" width="${carimboW}" height="${carimboH}" fill="#fff" stroke="#c62828" stroke-width="1.8"/>
        
        <!-- Logo Image -->
        <image href="${logoSrc}" x="${carimboX + 8}" y="${carimboY + 8}" width="130" height="70" preserveAspectRatio="xMinYMin meet"/>

        <!-- Empresa Header -->
        <text x="${carimboX + 150}" y="${carimboY + 28}" font-size="15" font-family="Arial" font-weight="bold" fill="#00838f">${d.empresaNome || ''}</text>
        <text x="${carimboX + 150}" y="${carimboY + 48}" font-size="9.5" font-family="Arial" fill="#00838f">${d.empresaEndereco || ''}</text>
        <text x="${carimboX + 150}" y="${carimboY + 66}" font-size="9.5" font-family="Arial" fill="#00838f">CNPJ: ${d.empresaCnpj || ''}</text>

        <!-- Linha Proprietário -->
        <rect x="${carimboX + 8}" y="${carimboY + 88}" width="${carimboW - 16}" height="28" fill="#fefefe" stroke="#c62828" stroke-width="1"/>
        <text x="${carimboX + 16}" y="${carimboY + 106}" font-size="10" font-family="Arial" font-weight="bold" fill="#c62828">PROPRIETÁRIO: </text>
        <text x="${carimboX + 120}" y="${carimboY + 106}" font-size="10" font-family="Arial" font-weight="bold" fill="#00838f">${(d.clienteNome || '').toUpperCase()}</text>

        <!-- Linha Projeto / Desenho -->
        <rect x="${carimboX + 8}" y="${carimboY + 122}" width="${(carimboW - 24)/2}" height="26" fill="#fefefe" stroke="#c62828" stroke-width="1"/>
        <text x="${carimboX + 16}" y="${carimboY + 139}" font-size="9" font-family="Arial" font-weight="bold" fill="#c62828">PROJETO:</text>
        <text x="${carimboX + 80}" y="${carimboY + 139}" font-size="9" font-family="Arial" font-weight="bold" fill="#00838f">${d.tecnicoNome || ''}</text>

        <rect x="${carimboX + 16 + (carimboW - 24)/2}" y="${carimboY + 122}" width="${(carimboW - 24)/2}" height="26" fill="#fefefe" stroke="#c62828" stroke-width="1"/>
        <text x="${carimboX + 24 + (carimboW - 24)/2}" y="${carimboY + 139}" font-size="9" font-family="Arial" font-weight="bold" fill="#c62828">DESENHO:</text>
        <text x="${carimboX + 90 + (carimboW - 24)/2}" y="${carimboY + 139}" font-size="9" font-family="Arial" font-weight="bold" fill="#00838f">${d.tecnicoNome || ''}</text>

        <!-- Linha Registro / CPF Técnico e Prancha -->
        <rect x="${carimboX + 8}" y="${carimboY + 154}" width="${(carimboW - 24)*0.7}" height="26" fill="#fefefe" stroke="#c62828" stroke-width="1"/>
        <text x="${carimboX + 16}" y="${carimboY + 171}" font-size="8.5" font-family="Arial" font-weight="bold" fill="#c62828">RESP. TÉCNICO:</text>
        <text x="${carimboX + 110}" y="${carimboY + 171}" font-size="8.5" font-family="Arial" font-weight="bold" fill="#00838f">${d.tecnicoNome || ''}</text>

        <rect x="${carimboX + 12 + (carimboW - 24)*0.7}" y="${carimboY + 154}" width="${(carimboW - 24)*0.3}" height="26" fill="#fefefe" stroke="#c62828" stroke-width="1"/>
        <text x="${carimboX + 18 + (carimboW - 24)*0.7}" y="${carimboY + 171}" font-size="8" font-family="Arial" font-weight="bold" fill="#c62828">PRANCHA:</text>
        <text x="${carimboX + 72 + (carimboW - 24)*0.7}" y="${carimboY + 171}" font-size="12" font-family="Arial" font-weight="bold" fill="#00838f">${pranchaNum}</text>

        <!-- Linha Escala / Data / Tipo -->
        <rect x="${carimboX + 8}" y="${carimboY + 184}" width="${(carimboW - 24)*0.35}" height="23" fill="#fefefe" stroke="#c62828" stroke-width="1"/>
        <text x="${carimboX + 14}" y="${carimboY + 199}" font-size="8" font-family="Arial" font-weight="bold" fill="#c62828">ESCALA:</text>
        <text x="${carimboX + 60}" y="${carimboY + 199}" font-size="8" font-family="Arial" font-weight="bold" fill="#00838f">SEM ESCALA</text>

        <rect x="${carimboX + 12 + (carimboW - 24)*0.35}" y="${carimboY + 184}" width="${(carimboW - 24)*0.35}" height="23" fill="#fefefe" stroke="#c62828" stroke-width="1"/>
        <text x="${carimboX + 18 + (carimboW - 24)*0.35}" y="${carimboY + 199}" font-size="8" font-family="Arial" font-weight="bold" fill="#c62828">DATA:</text>
        <text x="${carimboX + 55 + (carimboW - 24)*0.35}" y="${carimboY + 199}" font-size="8" font-family="Arial" font-weight="bold" fill="#00838f">${formatDateBR(d.dataProjeto)}</text>

        <rect x="${carimboX + 16 + (carimboW - 24)*0.7}" y="${carimboY + 184}" width="${(carimboW - 24)*0.3}" height="23" fill="#fefefe" stroke="#c62828" stroke-width="1"/>
        <text x="${carimboX + 22 + (carimboW - 24)*0.7}" y="${carimboY + 199}" font-size="8.5" font-family="Arial" font-weight="bold" fill="#00838f">ELÉTRICO</text>
    `;
}

// ==========================================
// PRANCHA 01/06: DIAGRAMA UNIFILAR PRINCIPAL (100% PRESERVADO)
// ==========================================
function gerarPrancha1(d) {
    const inversorQtd = Math.max(1, Number(d.inversorQtd) || 1);
    const stringsPorInversor = Math.max(1, Number(d.stringsPorInversor) || 1);
    const strings = inversorQtd * stringsPorInversor;
    const modPorString = Number(d.modulosPorString) || 0;
    const totalModulos = strings * modPorString;

    const potInversorKw = Number(d.inversorPotencia || 6000) / 1000;
    const potTotalUsinaKw = (inversorQtd * potInversorKw).toFixed(1);

    const svgW = 1080;
    const startX = 45;
    const startY = 108;

    let maxCols = 6;
    let modW = 24;
    let modH = 40;
    let gapX = 4;
    let gapY = 5;

    if (modPorString > 12) {
        maxCols = 9;
        modW = 17;
        modH = 30;
        gapX = 3;
        gapY = 4;
    } else if (modPorString > 6) {
        maxCols = 6;
        modW = 20;
        modH = 34;
        gapX = 4;
        gapY = 4;
    }

    const aterramentos = [];
    const stringData = [];
    let currY = startY;
    let lastPanelY = startY;

    for (let s = 0; s < strings; s++) {
        const cols = Math.min(modPorString, maxCols);
        const rows = Math.ceil(modPorString / cols);
        const stringHeight = rows * (modH + gapY) - gapY;
        const lineY = currY + stringHeight / 2;
        const lineStartX = startX + cols * (modW + gapX) - gapX + 2;

        stringData.push({
            index: s,
            startY: currY,
            lineY: lineY,
            lineStartX: lineStartX,
            height: stringHeight,
            cols: cols,
            rows: rows
        });

        if (currY + stringHeight > lastPanelY) {
            lastPanelY = currY + stringHeight;
        }

        currY += stringHeight + 22;
    }

    const arrayCenterY = (stringData[0].lineY + stringData[strings - 1].lineY) / 2;
    const caY = arrayCenterY;

    const groupCenterYPerInv = [];
    for (let i = 0; i < inversorQtd; i++) {
        const firstIdx = i * stringsPorInversor;
        const lastIdx = Math.min(strings - 1, (i + 1) * stringsPorInversor - 1);
        const firstY = stringData[firstIdx].lineY;
        const lastY = stringData[lastIdx].lineY;
        groupCenterYPerInv.push((firstY + lastY) / 2);
    }

    const invX = 390;
    const invW = 85;
    const invH = inversorQtd === 1 ? 65 : 55;
    const invStepY = 95;

    const startY_inv = inversorQtd === 1 
        ? (caY - invH / 2) 
        : (caY - ((inversorQtd - 1) * invStepY) / 2 - invH / 2);

    let modulosSVG = '';
    const junctionPointsDrawn = new Set();

    for (let s = 0; s < strings; s++) {
        const str = stringData[s];

        for (let m = 0; m < modPorString; m++) {
            const col = m % str.cols;
            const row = Math.floor(m / str.cols);
            const x = startX + col * (modW + gapX);
            const y = str.startY + row * (modH + gapY);

            modulosSVG += `
                <rect x="${x}" y="${y}" width="${modW}" height="${modH}" fill="#e8f5e9" stroke="#2e7d32" stroke-width="1.2" rx="1"/>
                <text x="${x + modW/2}" y="${y + modH/2 + 3}" text-anchor="middle" font-size="${modH < 35 ? '8' : '9'}" font-weight="bold" fill="#1b5e20" font-family="Arial">${m+1}</text>
            `;
        }

        const invIndex = Math.min(inversorQtd - 1, Math.floor(s / stringsPorInversor));
        const groupCenterY = groupCenterYPerInv[invIndex];
        const targetInvCenterY = (startY_inv + invIndex * invStepY) + (invH / 2);
        const junctionX = str.lineStartX + 25;

        if (stringsPorInversor === 1) {
            modulosSVG += `
                <line x1="${str.lineStartX}" y1="${str.lineY}" x2="${invX}" y2="${targetInvCenterY}" stroke="#1976d2" stroke-width="1.8"/>
            `;
        } else {
            modulosSVG += `
                <polyline points="${str.lineStartX},${str.lineY} ${str.lineStartX + 12},${str.lineY} ${junctionX},${groupCenterY}" fill="none" stroke="#1976d2" stroke-width="1.8"/>
            `;

            if (!junctionPointsDrawn.has(invIndex)) {
                junctionPointsDrawn.add(invIndex);

                if (Math.abs(groupCenterY - targetInvCenterY) < 1) {
                    modulosSVG += `
                        <line x1="${junctionX}" y1="${groupCenterY}" x2="${invX}" y2="${groupCenterY}" stroke="#1976d2" stroke-width="2"/>
                    `;
                } else {
                    modulosSVG += `
                        <polyline points="${junctionX},${groupCenterY} ${invX - 15},${groupCenterY} ${invX - 6},${targetInvCenterY} ${invX},${targetInvCenterY}" fill="none" stroke="#1976d2" stroke-width="2"/>
                    `;
                }
            }
        }
    }

    const arranjoText = inversorQtd > 1 
        ? `Arranjo: ${strings} strings (${stringsPorInversor}/inv) de ${modPorString} painéis` 
        : `Arranjo: ${strings} string de ${modPorString} painéis`;

    modulosSVG += `
        <text x="${startX}" y="${startY - 40}" font-size="12" font-family="Arial" font-weight="bold" fill="#000">${totalModulos} Módulos Fotovoltaicos - ${d.moduloMarca || ''}</text>
        <text x="${startX}" y="${startY - 26}" font-size="10" font-family="Arial" fill="#333">Modelo: ${d.moduloModelo || ''} (${d.moduloPotencia || ''}Wp)</text>
        <text x="${startX}" y="${startY - 12}" font-size="9" font-family="Arial" font-weight="bold" fill="#1565c0">${arranjoText}</text>
    `;

    const ccTextY = Math.max(104, groupCenterYPerInv[0] - 36);
    const caboCCSVG = `
        <text x="245" y="${ccTextY}" font-size="8" font-family="Arial" font-weight="bold" fill="#000">#P(+) ${d.caboCCPos || '4,0'}mm² EPR 1kV 90°C</text>
        <text x="245" y="${ccTextY + 12}" font-size="8" font-family="Arial" font-weight="bold" fill="#000">#N(-) ${d.caboCCNeg || '4,0'}mm² EPR 1kV 90°C</text>
        <text x="245" y="${ccTextY + 24}" font-size="8" font-family="Arial" fill="#000">#T ${d.caboTerra || '4,0'}mm² XLPE 1kV 90°C</text>
    `;

    let inversoresSVG = '';
    let conexoesInversoresCASVG = '';
    const disjX = 535;

    for (let i = 0; i < inversorQtd; i++) {
        const invY_i = startY_inv + i * invStepY;
        const invCenterY_i = invY_i + (invH / 2);
        const labelInv = inversorQtd > 1 ? `INVERSOR 0${i + 1}` : '1 INVERSOR';

        if (inversorQtd === 1) {
            inversoresSVG += `
                <rect x="${invX}" y="${invY_i}" width="${invW}" height="${invH}" fill="#ffffff" stroke="#1565c0" stroke-width="1.8" rx="2"/>
                <line x1="${invX + invW - 15}" y1="${invY_i}" x2="${invX + invW}" y2="${invY_i + 15}" stroke="#1565c0" stroke-width="1.5"/>
                <text x="${invX + invW/2}" y="${invY_i + 16}" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="#000">${labelInv}</text>
                <text x="${invX + invW/2}" y="${invY_i + 29}" text-anchor="middle" font-size="9" font-family="Arial" fill="#000">${d.inversorMarca || ''}</text>
                <text x="${invX + invW/2}" y="${invY_i + 42}" text-anchor="middle" font-size="8" font-family="Arial" fill="#555">${d.inversorModelo || ''}</text>
                <text x="${invX + invW/2}" y="${invY_i + 56}" text-anchor="middle" font-size="9.5" font-family="Arial" font-weight="bold" fill="#1565c0">${potInversorKw.toFixed(1)} kW</text>
            `;
            conexoesInversoresCASVG += `
                <line x1="${invX + invW}" y1="${caY}" x2="${disjX}" y2="${caY}" stroke="#1976d2" stroke-width="2"/>
            `;
        } else {
            inversoresSVG += `
                <rect x="${invX}" y="${invY_i}" width="${invW}" height="${invH}" fill="#ffffff" stroke="#1565c0" stroke-width="1.8" rx="2"/>
                <line x1="${invX + invW - 12}" y1="${invY_i}" x2="${invX + invW}" y2="${invY_i + 12}" stroke="#1565c0" stroke-width="1.5"/>
                <text x="${invX + invW/2}" y="${invY_i + 14}" text-anchor="middle" font-size="8.5" font-family="Arial" font-weight="bold" fill="#000">${labelInv}</text>
                <text x="${invX + invW/2}" y="${invY_i + 26}" text-anchor="middle" font-size="8" font-family="Arial" fill="#000">${d.inversorMarca || ''} ${d.inversorModelo || ''}</text>
                <text x="${invX + invW/2}" y="${invY_i + 38}" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="#1565c0">${potInversorKw.toFixed(1)} kW</text>
            `;
            conexoesInversoresCASVG += `
                <polyline points="${invX + invW},${invCenterY_i} 495,${invCenterY_i} 495,${caY} ${disjX},${caY}" fill="none" stroke="#1976d2" stroke-width="2"/>
            `;
        }

        aterramentos.push({ x: invX + 42.5, y: invY_i + invH });
    }

    const qssX = 515;
    const qssW = 165;
    const qssH = 130;
    const qssY = caY - qssH / 2;

    const qssSVG = `
        <rect x="${qssX}" y="${qssY}" width="${qssW}" height="${qssH}" fill="none" stroke="#555" stroke-width="1.2" stroke-dasharray="5,3"/>
        <text x="${qssX + qssW/2}" y="${qssY - 14}" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="#000">Quadro de Proteção</text>
        <text x="${qssX + qssW/2}" y="${qssY - 3}" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="#000">do Sistema Solar (QSS)</text>
    `;

    const disjSVG = `
        <rect x="${disjX}" y="${caY - 12}" width="38" height="24" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <text x="${disjX + 19}" y="${caY + 4}" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="#000">C ${d.disjuntorCA || '32'}A</text>
    `;

    const dpsX = 620;
    const dpsSVG = `
        <g transform="translate(${dpsX}, ${caY})">
            <rect x="-10" y="-18" width="20" height="36" fill="#fff" stroke="#333" stroke-width="1.2"/>
            <line x1="0" y1="-12" x2="0" y2="12" stroke="#4caf50" stroke-width="2"/>
            <text x="0" y="-22" text-anchor="middle" font-size="7.5" font-family="Arial" font-weight="bold" fill="#000">DPS CA</text>
            <text x="-14" y="24" text-anchor="end" font-size="6.5" font-family="Arial" fill="#555">Classe II</text>
            <text x="-14" y="32" text-anchor="end" font-size="6.5" font-family="Arial" fill="#555">275V - 20/40kA</text>
        </g>
    `;

    aterramentos.push({ x: dpsX, y: caY + 18 });

    const qgbtX = 810;
    const qgbtW = 60;
    const qgbtH = 120;
    const qgbtY = caY - qgbtH / 2;
    const disjQgbX = 825;

    const linhaCASVG = `
        <line x1="${disjX + 38}" y1="${caY}" x2="${dpsX - 10}" y2="${caY}" stroke="#1976d2" stroke-width="2"/>
        <line x1="${dpsX + 10}" y1="${caY}" x2="${qssX + qssW}" y2="${caY}" stroke="#1976d2" stroke-width="2"/>
        <line x1="${qssX + qssW}" y1="${caY}" x2="${disjQgbX}" y2="${caY}" stroke="#1976d2" stroke-width="2"/>

        <text x="686" y="${caY - 35}" font-size="7.5" font-family="Arial" font-weight="bold" fill="#000">#F(R) ${d.caboCAFase || '6,0'}mm² XLPE 1kV 90°C</text>
        <text x="686" y="${caY - 23}" font-size="7.5" font-family="Arial" font-weight="bold" fill="#000">#N ${d.caboCANeutro || '6,0'}mm² XLPE 1kV 90°C</text>
        <text x="686" y="${caY - 11}" font-size="7.5" font-family="Arial" font-weight="bold" fill="#000">#T ${d.caboTerra || '4,0'}mm² XLPE 1kV 90°C</text>
    `;

    const qgbtSVG = `
        <rect x="${qgbtX}" y="${qgbtY}" width="${qgbtW}" height="${qgbtH}" fill="none" stroke="#333" stroke-width="1.2" stroke-dasharray="4,2"/>
        <text x="${qgbtX + qgbtW/2}" y="${qgbtY - 8}" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="#000">QGBT</text>
    `;

    const disjQgbSVG = `
        <rect x="${disjQgbX}" y="${caY - 12}" width="30" height="24" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <text x="${disjQgbX + 15}" y="${caY + 4}" text-anchor="middle" font-size="8.5" font-family="Arial" font-weight="bold" fill="#000">C ${d.disjuntorQGBT || '40'}A</text>
        <line x1="${disjQgbX + 15}" y1="${caY + 12}" x2="${disjQgbX + 15}" y2="${caY + 36}" stroke="#333" stroke-width="1.2"/>
        <polygon points="${disjQgbX + 11},${caY + 31} ${disjQgbX + 15},${caY + 38} ${disjQgbX + 19},${caY + 31}" fill="#333"/>
        <text x="${disjQgbX + 15}" y="${caY + 50}" text-anchor="middle" font-size="8.5" font-family="Arial" font-weight="bold" fill="#000">Cargas</text>
    `;

    const medX = 910;
    const medSVG = `
        <line x1="${disjQgbX + 30}" y1="${caY}" x2="${medX - 20}" y2="${caY}" stroke="#1976d2" stroke-width="2"/>
        <rect x="${medX - 20}" y="${caY - 25}" width="40" height="50" fill="#fff" stroke="#333" stroke-width="1.5"/>
        <circle cx="${medX}" cy="${caY}" r="15" fill="#fff" stroke="#333" stroke-width="1.2"/>
        <text x="${medX}" y="${caY + 4}" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="#000">Wh</text>
        <text x="${medX}" y="${caY - 30}" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="#000">MEDIÇÃO</text>
    `;

    aterramentos.push({ x: medX, y: caY + 25 });

    const redeX = 990;
    const redeSVG = `
        <line x1="${medX + 20}" y1="${caY}" x2="${redeX}" y2="${caY}" stroke="#1976d2" stroke-width="2"/>
        <line x1="${redeX}" y1="${caY - 30}" x2="${redeX}" y2="${caY + 30}" stroke="#333" stroke-width="2"/>
        <line x1="${redeX - 8}" y1="${caY - 18}" x2="${redeX + 8}" y2="${caY - 14}" stroke="#333" stroke-width="1.5"/>
        <line x1="${redeX - 8}" y1="${caY - 4}" x2="${redeX + 8}" y2="${caY}" stroke="#333" stroke-width="1.5"/>
        <line x1="${redeX - 8}" y1="${caY + 10}" x2="${redeX + 8}" y2="${caY + 14}" stroke="#333" stroke-width="1.5"/>
        <text x="${redeX + 22}" y="${caY - 5}" font-size="10" font-family="Arial" font-weight="bold" fill="#000">REDE</text>
        <text x="${redeX + 22}" y="${caY + 10}" font-size="10" font-family="Arial" font-weight="bold" fill="#000">ENEL</text>
    `;

    let aterramentoSVG = '';
    aterramentos.forEach(p => {
        aterramentoSVG += `
            <line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="${p.y + 22}" stroke="#4caf50" stroke-width="1.5"/>
            <line x1="${p.x - 8}" y1="${p.y + 22}" x2="${p.x + 8}" y2="${p.y + 22}" stroke="#4caf50" stroke-width="1.5"/>
            <line x1="${p.x - 5}" y1="${p.y + 26}" x2="${p.x + 5}" y2="${p.y + 26}" stroke="#4caf50" stroke-width="1.5"/>
            <line x1="${p.x - 2}" y1="${p.y + 30}" x2="${p.x + 2}" y2="${p.y + 30}" stroke="#4caf50" stroke-width="1.5"/>
        `;
    });

    const lowestY = Math.max(lastPanelY, startY_inv + inversorQtd * invStepY, caY + 70);
    const infoY = lowestY + 45;
    const infoX = 50;
    const infoW = 470;
    const infoH = 200;

    const dadosUC = `
        <rect x="${infoX}" y="${infoY}" width="${infoW}" height="${infoH}" fill="#fff" stroke="#333" stroke-width="1.2" rx="2"/>
        <path d="M ${infoX} ${infoY+24} L ${infoX+infoW} ${infoY+24}" stroke="#eee" stroke-width="1"/>
        <text x="${infoX + 10}" y="${infoY + 17}" font-size="11" font-family="Arial" font-weight="bold" fill="#0057b7">Dados da Unidade Consumidora</text>
        <text x="${infoX + 10}" y="${infoY + 40}" font-size="10" font-family="Arial" fill="#000">01 - N° da UC: <tspan font-weight="bold">${d.uc || ''}</tspan></text>
        <text x="${infoX + 10}" y="${infoY + 57}" font-size="10" font-family="Arial" fill="#000">02 - Coordenadas: LON: ${d.longitude || ''} / LAT: ${d.latitude || ''}</text>
        <text x="${infoX + 10}" y="${infoY + 74}" font-size="10" font-family="Arial" fill="#000">03 - Tipo de Conexão: <tspan font-weight="bold">${(d.tipoConexao || '').toUpperCase()}</tspan></text>
        <text x="${infoX + 10}" y="${infoY + 91}" font-size="10" font-family="Arial" fill="#000">04 - Disjuntor do Padrão de Entrada: <tspan font-weight="bold">${d.disjuntorEntrada || ''} A</tspan></text>

        <text x="${infoX + 10}" y="${infoY + 115}" font-size="11" font-family="Arial" font-weight="bold" fill="#0057b7">Dados da Medição</text>
        <text x="${infoX + 10}" y="${infoY + 132}" font-size="10" font-family="Arial" fill="#000">01 - Tipo de Medidor: ${d.tipoMedidor || ''}</text>

        <text x="${infoX + 10}" y="${infoY + 156}" font-size="11" font-family="Arial" font-weight="bold" fill="#0057b7">Informações Gerais sobre a Geração</text>
        <text x="${infoX + 10}" y="${infoY + 173}" font-size="10" font-family="Arial" fill="#000">01 - Fonte: ${d.tipoFonte || ''} | 02 - Potência Nominal Total: <tspan font-weight="bold">${potTotalUsinaKw} kW</tspan></text>
        <text x="${infoX + 10}" y="${infoY + 190}" font-size="10" font-family="Arial" fill="#000">03 - Tensão Nominal Geração: ${d.tensaoGeracao || ''} V | 04 - Acesso Pretendido: ${d.tipoAcesso || ''}</text>
    `;

    const info2X = 50;
    const info2Y = infoY + 215;
    const info2W = 470;
    const info2H = 215;

    const dadosEquip = `
        <rect x="${info2X}" y="${info2Y}" width="${info2W}" height="${info2H}" fill="#fff" stroke="#333" stroke-width="1.2" rx="2"/>
        <text x="${info2X + 10}" y="${info2Y + 18}" font-size="11" font-family="Arial" font-weight="bold" fill="#0057b7">Informações Básicas da Geração Fotovoltaica</text>
        <text x="${info2X + 10}" y="${info2Y + 36}" font-size="10" font-family="Arial" font-weight="bold" fill="#333">Módulos Fotovoltaicos:</text>
        <text x="${info2X + 15}" y="${info2Y + 54}" font-size="9.5" font-family="Arial" fill="#000">01 - Tipo: ${d.moduloTipo || ''} | 02 - Potência Nominal: ${d.moduloPotencia || ''} W</text>
        <text x="${info2X + 15}" y="${info2Y + 70}" font-size="9.5" font-family="Arial" fill="#000">03 - Quantidade Total: <tspan font-weight="bold">${totalModulos} painéis</tspan> (${strings} strings)</text>
        <text x="${info2X + 15}" y="${info2Y + 86}" font-size="9.5" font-family="Arial" fill="#000">05 - Corrente IMP: ${d.moduloImp || ''} A | Corrente ISC: ${d.moduloIsc || ''} A</text>
        <text x="${info2X + 15}" y="${info2Y + 102}" font-size="9.5" font-family="Arial" fill="#000">07 - Tensão VMP: ${d.moduloVmp || ''} V | Tensão VOC: ${d.moduloVoc || ''} V</text>

        <text x="${info2X + 10}" y="${info2Y + 130}" font-size="10" font-family="Arial" font-weight="bold" fill="#333">Inversores Solar Grid-Tie:</text>
        <text x="${info2X + 15}" y="${info2Y + 148}" font-size="9.5" font-family="Arial" fill="#000">01 - Quantidade: <tspan font-weight="bold">${inversorQtd} unidade(s)</tspan> | Marca: ${d.inversorMarca || ''}</text>
        <text x="${info2X + 15}" y="${info2Y + 164}" font-size="9.5" font-family="Arial" fill="#000">02 - Modelo: ${d.inversorModelo || ''} (${potInversorKw.toFixed(1)} kW cada)</text>
        <text x="${info2X + 15}" y="${info2Y + 180}" font-size="9.5" font-family="Arial" fill="#000">03 - Potência Total Instalada: <tspan font-weight="bold">${potTotalUsinaKw} kW</tspan> | Eficiência: ${d.inversorEficiencia || ''}%</text>
    `;

    const placaX = 710;
    const placaY = infoY + 10;
    const placaW = 180;
    const placaH = 85;
    const placaSVG = `
        <rect x="${placaX}" y="${placaY}" width="${placaW}" height="${placaH}" fill="#fffde7" stroke="#f57f17" stroke-width="2" rx="4"/>
        <text x="${placaX + placaW/2}" y="${placaY + 24}" text-anchor="middle" font-size="14" font-family="Arial" font-weight="bold" fill="#d50000">CUIDADO</text>
        <text x="${placaX + placaW/2}" y="${placaY + 44}" text-anchor="middle" font-size="10" font-family="Arial" font-weight="bold" fill="#000">RISCO DE CHOQUE ELÉTRICO</text>
        <text x="${placaX + placaW/2}" y="${placaY + 60}" text-anchor="middle" font-size="10" font-family="Arial" font-weight="bold" fill="#000">GERAÇÃO PRÓPRIA</text>
        <text x="${placaX + placaW/2}" y="${placaY + 104}" text-anchor="middle" font-size="9" font-family="Arial" fill="#555">Detalhe da placa de advertência a ser</text>
        <text x="${placaX + placaW/2}" y="${placaY + 118}" text-anchor="middle" font-size="9" font-family="Arial" fill="#555">instalada ao lado da caixa de medição</text>
    `;

    const carimboSVG = criarCarimboPrancha(d, "01/06", "DIAGRAMA UNIFILAR", 550, info2Y, 480, 215);

    const svgH = Math.max(900, info2Y + 215 + 25);
    const tituloDiagrama = inversorQtd > 1
        ? `DIAGRAMA UNIFILAR - USINA SOLAR FOTOVOLTAICA DE ${potTotalUsinaKw}kW (${inversorQtd} INVERSORES DE ${potInversorKw.toFixed(1)}kW)`
        : `DIAGRAMA UNIFILAR - USINA SOLAR FOTOVOLTAICA DE ${(Number(d.potenciaSistema) || potInversorKw).toFixed(1)}kW`;

    return `
        <div class="doc-page diagrama-container">
            <svg class="diagrama-svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.5" y="1.5" width="${svgW - 3}" height="${svgH - 3}" fill="#ffffff" stroke="#000" stroke-width="1.8"/>
                <text x="${svgW/2}" y="32" text-anchor="middle" font-size="14" font-family="Arial" font-weight="bold" fill="#000">${tituloDiagrama}</text>
                
                ${modulosSVG}
                ${caboCCSVG}
                ${inversoresSVG}
                ${conexoesInversoresCASVG}
                ${disjSVG}
                ${qssSVG}
                ${dpsSVG}
                ${linhaCASVG}
                ${disjQgbSVG}
                ${qgbtSVG}
                ${medSVG}
                ${redeSVG}
                ${aterramentoSVG}
                ${dadosUC}
                ${dadosEquip}
                ${placaSVG}
                ${carimboSVG}
            </svg>
        </div>
    `;
}

// ==========================================
// PRANCHA 02/06: PLANTA DE SITUAÇÃO E ARRANJO FOTOVOLTAICO
// ==========================================
function gerarPrancha2(d) {
    const svgW = 1080;
    const svgH = 900;
    const carimboSVG = criarCarimboPrancha(d, "02/06", "PLANTA DE SITUAÇÃO E ARRANJO FOTOVOLTAICO", 550, 660, 480, 215);

    const inversorQtd = Math.max(1, Number(d.inversorQtd) || 1);
    const stringsPorInversor = Math.max(1, Number(d.stringsPorInversor) || 1);
    const strings = inversorQtd * stringsPorInversor;
    const modPorString = Number(d.modulosPorString) || 0;
    const totalModulos = strings * modPorString;

    let aranjosSVG = '';
    const startX = 580;
    const startY = 160;
    const modW = 32;
    const modH = 50;
    const cols = Math.min(10, Math.ceil(totalModulos / 2));

    for (let m = 0; m < totalModulos; m++) {
        const c = m % cols;
        const r = Math.floor(m / cols);
        const x = startX + c * (modW + 4);
        const y = startY + r * (modH + 6);
        const invIdx = Math.floor(m / (stringsPorInversor * modPorString)) + 1;
        const stringIdx = (Math.floor(m / modPorString) % stringsPorInversor) + 1;
        const tagMod = `I0${invIdx}S0${stringIdx}M${(m % modPorString) + 1}`;

        aranjosSVG += `
            <rect x="${x}" y="${y}" width="${modW}" height="${modH}" fill="#f5f5f5" stroke="#2e7d32" stroke-width="1"/>
            <text x="${x + modW/2}" y="${y + modH/2 + 2}" text-anchor="middle" font-size="6.5" font-family="Arial" fill="#333" transform="rotate(-90 ${x + modW/2} ${y + modH/2 + 2})">${tagMod}</text>
        `;
    }

    return `
        <div class="doc-page diagrama-container">
            <svg class="diagrama-svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.5" y="1.5" width="${svgW - 3}" height="${svgH - 3}" fill="#ffffff" stroke="#000" stroke-width="1.8"/>
                <text x="${svgW/2}" y="32" text-anchor="middle" font-size="14" font-family="Arial" font-weight="bold" fill="#000">PLANTA DE SITUAÇÃO E ARRANJO FOTOVOLTAICO</text>

                <!-- QUADRO ESQUERDO: PLANTA DE SITUAÇÃO (Espaço em branco reservado para inserção da planta DWG/Croqui) -->
                <rect x="45" y="80" width="460" height="550" fill="#ffffff" stroke="#333" stroke-width="1.2"/>
                <text x="275" y="105" text-anchor="middle" font-size="11" font-family="Arial" font-weight="bold" fill="#000">PLANTA DE SITUAÇÃO / LOCALIZAÇÃO DA UC</text>

                <!-- QUADRO DIREITO: ARRANJO DOS MÓDULOS NO TELHADO -->
                <rect x="530" y="80" width="505" height="550" fill="#fff" stroke="#333" stroke-width="1.2"/>
                <text x="782" y="105" text-anchor="middle" font-size="11" font-family="Arial" font-weight="bold" fill="#000">ARRANJO FOTOVOLTAICO DOS MÓDULOS NO TELHADO</text>
                ${aranjosSVG}

                <!-- Legenda do Arranjo -->
                <text x="782" y="${startY + Math.ceil(totalModulos / cols) * (modH + 6) + 40}" text-anchor="middle" font-size="10" font-family="Arial" font-weight="bold" fill="#000">${inversorQtd} Inversor(es) ${d.inversorMarca || ''} ${d.inversorModelo || ''}</text>
                <text x="782" y="${startY + Math.ceil(totalModulos / cols) * (modH + 6) + 58}" text-anchor="middle" font-size="10" font-family="Arial" fill="#333">${totalModulos} painéis ${d.moduloMarca || ''} ${d.moduloPotencia || 600}W (${strings} strings)</text>

                ${carimboSVG}
            </svg>
        </div>
    `;
}

// ==========================================
// PRANCHA 03/06: LAYOUT E ESTRUTURA DE FIXAÇÃO DOS MÓDULOS FOTOVOLTAICOS
// ==========================================
function gerarPrancha3(d) {
    const svgW = 1080;
    const svgH = 900;
    const carimboSVG = criarCarimboPrancha(d, "03/06", "LAYOUT E ESTRUTURA DE FIXAÇÃO DOS MÓDULOS FOTOVOLTAICOS", 550, 660, 480, 215);

    const inversorQtd = Math.max(1, Number(d.inversorQtd) || 1);
    const stringsPorInversor = Math.max(1, Number(d.stringsPorInversor) || 1);
    const strings = inversorQtd * stringsPorInversor;
    const modPorString = Number(d.modulosPorString) || 0;
    const totalModulos = strings * modPorString;

    let layoutSVG = '';
    const startX = 120;
    let currY = 160;
    const modW = 42;
    const modH = 70;

    for (let s = 0; s < strings; s++) {
        const invIdx = Math.floor(s / stringsPorInversor) + 1;
        const stringIdx = (s % stringsPorInversor) + 1;

        const cols = Math.min(10, Math.ceil(modPorString / (modPorString > 12 ? 2 : 1)));
        const rows = Math.ceil(modPorString / cols);
        const stringBlockHeight = rows * (modH + 10) - 10;
        const stringCenterY = currY + stringBlockHeight / 2;

        let maxX = startX;

        for (let m = 0; m < modPorString; m++) {
            const col = m % cols;
            const row = Math.floor(m / cols);
            const x = startX + col * (modW + 6);
            const y = currY + row * (modH + 10);
            if (x + modW > maxX) maxX = x + modW;

            const tagMod = `I0${invIdx}S0${stringIdx}M${m + 1}`;

            layoutSVG += `
                <rect x="${x}" y="${y}" width="${modW}" height="${modH}" fill="#ffffff" stroke="#1b5e20" stroke-width="1.5" rx="2"/>
                <line x1="${x}" y1="${y + modH/2}" x2="${x + modW}" y2="${y + modH/2}" stroke="#a5d6a7" stroke-width="0.8"/>
                <text x="${x + modW/2}" y="${y + modH/2 + 3}" text-anchor="middle" font-size="7" font-family="Arial" fill="#000" transform="rotate(-90 ${x + modW/2} ${y + modH/2 + 3})">${tagMod}</text>
            `;
        }

        const strLabel = strings === 1
            ? `Inversor ${d.inversorMarca || ''} (${modPorString} painéis ${d.moduloMarca || ''} ${d.moduloPotencia || 600}W)`
            : (inversorQtd > 1 
                ? `INV 0${invIdx} (${d.inversorMarca || ''}) - String 0${stringIdx} (${modPorString} painéis ${d.moduloMarca || ''} ${d.moduloPotencia || 600}W)`
                : `Inversor ${d.inversorMarca || ''} - String 0${stringIdx} (${modPorString} painéis ${d.moduloMarca || ''} ${d.moduloPotencia || 600}W)`);

        layoutSVG += `
            <polyline points="${maxX},${stringCenterY} ${maxX + 30},${stringCenterY} ${maxX + 70},${stringCenterY}" fill="none" stroke="#1565c0" stroke-width="1.2"/>
            <text x="${maxX + 75}" y="${stringCenterY + 3}" font-size="9" font-family="Arial" font-weight="bold" fill="#1565c0">${strLabel}</text>
        `;

        currY += stringBlockHeight + 25;
    }

    return `
        <div class="doc-page diagrama-container">
            <svg class="diagrama-svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.5" y="1.5" width="${svgW - 3}" height="${svgH - 3}" fill="#ffffff" stroke="#000" stroke-width="1.8"/>
                <text x="${svgW/2}" y="32" text-anchor="middle" font-size="14" font-family="Arial" font-weight="bold" fill="#000">LAYOUT E ESTRUTURA DE FIXAÇÃO DOS MÓDULOS FOTOVOLTAICOS</text>

                <rect x="45" y="80" width="990" height="550" fill="#fff" stroke="#333" stroke-width="1.2"/>
                <text x="${svgW/2}" y="110" text-anchor="middle" font-size="11" font-family="Arial" font-weight="bold" fill="#000">DETALHAMENTO DAS FIADAS DE PAINÉIS E LIGAÇÃO DAS STRINGS</text>

                ${layoutSVG}

                ${carimboSVG}
            </svg>
        </div>
    `;
}

// ==========================================
// PRANCHA 04/06: DETALHAMENTO DE MONTAGEM DO INVERSOR E ELETRODUTOS
// ==========================================
function gerarPrancha4(d) {
    const svgW = 1080;
    const svgH = 900;
    const carimboSVG = criarCarimboPrancha(d, "04/06", "DETALHAMENTO DE MONTAGEM E INSTALAÇÃO DO INVERSOR", 550, 660, 480, 215);

    const invMarca = d.inversorMarca || 'SAJ';

    return `
        <div class="doc-page diagrama-container">
            <svg class="diagrama-svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.5" y="1.5" width="${svgW - 3}" height="${svgH - 3}" fill="#ffffff" stroke="#000" stroke-width="1.8"/>
                <text x="${svgW/2}" y="32" text-anchor="middle" font-size="14" font-family="Arial" font-weight="bold" fill="#000">DETALHAMENTO DE MONTAGEM E INSTALAÇÃO DO INVERSOR</text>

                <!-- MOLDURA PRINCIPAL DO DESENHO (Linha Superior de Borda) -->
                <rect x="45" y="80" width="990" height="550" fill="#fff" stroke="#333" stroke-width="1.2"/>

                <!-- ELETRODUTO SUPERIOR ESQUERDO -->
                <line x1="310" y1="80" x2="310" y2="445" stroke="#1565c0" stroke-width="1.8"/>
                <line x1="316" y1="80" x2="316" y2="445" stroke="#1565c0" stroke-width="1.8"/>
                
                <!-- Curva PVC 90 graus Inferior Esquerda (Suave) -->
                <path d="M 310 445 Q 310 461 326 461 L 390 461" fill="none" stroke="#1565c0" stroke-width="1.8"/>
                <path d="M 316 445 Q 316 455 326 455 L 390 455" fill="none" stroke="#1565c0" stroke-width="1.8"/>

                <!-- INVERSOR SOLAR REALISTA -->
                <rect x="420" y="240" width="160" height="115" fill="#fcfcfc" stroke="#444" stroke-width="2" rx="10"/>
                <rect x="424" y="244" width="152" height="107" fill="none" stroke="#d0d0d0" stroke-width="1.2" rx="8"/>
                
                <!-- Display Circular Verde com 3 Aneis Concentricos -->
                <circle cx="500" cy="290" r="22" fill="#ffffff" stroke="#4caf50" stroke-width="3"/>
                <circle cx="500" cy="290" r="16" fill="#e8f5e9" stroke="#66bb6a" stroke-width="1.5"/>
                <circle cx="500" cy="290" r="10" fill="#43a047"/>

                <!-- Logo da Marca -->
                <text x="500" y="328" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="#444">${invMarca}</text>

                <!-- Conectores Inferiores -->
                <rect x="442" y="355" width="14" height="12" fill="#222" rx="2"/>
                <rect x="458" y="355" width="14" height="12" fill="#222" rx="2"/>
                <rect x="476" y="355" width="9" height="9" fill="#333" rx="1"/>
                <rect x="488" y="355" width="9" height="9" fill="#333" rx="1"/>
                <rect x="520" y="355" width="14" height="14" fill="#222" rx="2"/>
                <rect x="542" y="355" width="16" height="14" fill="#222" rx="2"/>

                <!-- COTA VERTICAL 1600 mm (ESQUERDA) -->
                <!-- Extensão Horizontal Red da esquerda ate a lateral do Inversor -->
                <line x1="80" y1="297" x2="420" y2="297" stroke="#e53935" stroke-width="1.2"/>
                <!-- Linha Vertical Red com Setas nas pontas -->
                <line x1="80" y1="297" x2="80" y2="580" stroke="#e53935" stroke-width="1.5"/>
                <polygon points="80,297 75,309 85,309" fill="#e53935"/>
                <polygon points="80,580 75,568 85,568" fill="#e53935"/>
                <!-- Texto Cota 1600 em Vermelho Sólido -->
                <text x="65" y="450" font-size="28" font-family="Arial" fill="#e53935" font-weight="bold" transform="rotate(-90 65 450)">1600</text>

                <!-- COTA HORIZONTAL 500 mm (TOPO DIREITA) -->
                <!-- Linha de extensão vertical vermelha do canto superior direito do Inversor -->
                <line x1="580" y1="240" x2="580" y2="150" stroke="#e53935" stroke-width="1.2"/>
                <!-- Linha de extensão vertical vermelha do eletroduto direito -->
                <line x1="750" y1="200" x2="750" y2="120" stroke="#e53935" stroke-width="1.2"/>
                <!-- Linha Horizontal Red com Setas duplas (<--->) -->
                <line x1="580" y1="160" x2="750" y2="160" stroke="#e53935" stroke-width="1.5"/>
                <polygon points="580,160 592,155 592,165" fill="#e53935"/>
                <polygon points="750,160 738,155 738,165" fill="#e53935"/>
                <!-- Texto Cota 500 ao lado do Eletroduto à direita -->
                <text x="765" y="155" font-size="28" font-family="Arial" fill="#e53935" font-weight="bold">500</text>

                <!-- INFRAESTRUTURA DIREITA -->
                <!-- Eletroduto Superior PVC 1 pol -->
                <line x1="750" y1="80" x2="750" y2="310" stroke="#1565c0" stroke-width="1.8"/>
                <line x1="756" y1="80" x2="756" y2="310" stroke="#1565c0" stroke-width="1.8"/>
                <text x="810" y="260" font-size="11" font-family="Arial" fill="#000">Eletroduto PVC 1&quot;</text>

                <!-- Quadro DIN com Disjuntor à Direita (Com botão azul e acento vermelho) -->
                <rect x="738" y="310" width="36" height="50" fill="#ffffff" stroke="#333" stroke-width="1.5" rx="2"/>
                <rect x="744" y="320" width="24" height="30" fill="#f0f0f0" stroke="#444" stroke-width="1"/>
                <rect x="748" y="328" width="16" height="14" fill="#1976d2" rx="1"/>
                <line x1="746" y1="324" x2="766" y2="324" stroke="#d32f2f" stroke-width="1.8"/>

                <!-- ELETRODUTO INFERIOR PVC 3/4 pol -->
                <!-- Descida Vertical do Quadro DIN -->
                <line x1="750" y1="360" x2="750" y2="445" stroke="#1565c0" stroke-width="1.8"/>
                <line x1="756" y1="360" x2="756" y2="445" stroke="#1565c0" stroke-width="1.8"/>
                <text x="810" y="430" font-size="11" font-family="Arial" fill="#000">Eletroduto PVC 3/4&quot;</text>

                <!-- Curva PVC 90° Inferior Direita (Suave) -->
                <path d="M 756 445 Q 756 461 740 461 L 569 461" fill="none" stroke="#1565c0" stroke-width="1.8"/>
                <path d="M 750 445 Q 750 455 740 455 L 569 455" fill="none" stroke="#1565c0" stroke-width="1.8"/>

                <!-- CONDULETES DE PASSAGEM METÁLICOS -->
                <!-- Condulete Esquerdo [ o o ] (Recebe a Curva Suave vinda da esquerda) -->
                <rect x="390" y="450" width="24" height="16" fill="#e8e8e8" stroke="#333" stroke-width="1.5" rx="2"/>
                <circle cx="396" cy="458" r="3" fill="#aaa" stroke="#333" stroke-width="0.8"/>
                <circle cx="408" cy="458" r="3" fill="#aaa" stroke="#333" stroke-width="0.8"/>

                <!-- Condulete Direito [ o o ] (Recebe a Curva Suave vinda da direita) -->
                <rect x="545" y="450" width="24" height="16" fill="#e8e8e8" stroke="#333" stroke-width="1.5" rx="2"/>
                <circle cx="551" cy="458" r="3" fill="#aaa" stroke="#333" stroke-width="0.8"/>
                <circle cx="563" cy="458" r="3" fill="#aaa" stroke="#333" stroke-width="0.8"/>

                <!-- FIAÇÃO DE SAÍDA DO INVERSOR (CURVADA ATÉ OS CONDULETES) -->
                <!-- Chicote CC Esquerdo (4 condutores: Vermelho, Preto, Preto, Vermelho) -->
                <path d="M 442 355 Q 442 435 395 450" fill="none" stroke="#d32f2f" stroke-width="1.8"/> <!-- Red (+) -->
                <path d="M 458 355 Q 458 437 400 450" fill="none" stroke="#1b1b1b" stroke-width="1.8"/> <!-- Black (-) -->
                <path d="M 476 355 Q 476 439 405 450" fill="none" stroke="#1b1b1b" stroke-width="1.8"/> <!-- Black (-) -->
                <path d="M 488 355 Q 488 441 410 450" fill="none" stroke="#d32f2f" stroke-width="1.8"/> <!-- Red (+) -->

                <!-- Chicote CA Direito (3 condutores: Vermelho, Azul, Verde) -->
                <path d="M 520 355 Q 520 435 550 450" fill="none" stroke="#d32f2f" stroke-width="1.8"/> <!-- Red (Fase) -->
                <path d="M 542 355 Q 542 437 556 450" fill="none" stroke="#1976d2" stroke-width="1.8"/> <!-- Blue (Neutro) -->
                <path d="M 564 355 Q 564 439 562 450" fill="none" stroke="#388e3c" stroke-width="1.8"/> <!-- Green (Terra) -->

                <!-- LISTA DE MATERIAIS DE INFRAESTRUTURA (BOM) ALINHADA -->
                <text x="300" y="520" font-size="11" font-family="Arial" fill="#333">01 - condulete 3/4&quot;</text>
                <text x="280" y="540" font-size="11" font-family="Arial" fill="#333">10 - prensa cabo de 1/4&quot;</text>
                <text x="280" y="560" font-size="11" font-family="Arial" fill="#333">01 - curva PVC de 3/4&quot;</text>

                <text x="590" y="520" font-size="11" font-family="Arial" fill="#333">01 - condulete 3/4&quot;</text>
                <text x="590" y="540" font-size="11" font-family="Arial" fill="#333">01 - prensa cabo de 3/4&quot;</text>
                <text x="590" y="560" font-size="11" font-family="Arial" fill="#333">01 - curva PVC de 3/4&quot;</text>

                ${carimboSVG}
            </svg>
        </div>
    `;
}

// ==========================================
// PRANCHA 05/06: DETALHAMENTO DE CONEXÕES ELÉTRICAS DAS STRINGS
// ==========================================
function gerarPrancha5(d) {
    const svgW = 1080;
    const svgH = 900;
    const carimboSVG = criarCarimboPrancha(d, "05/06", "DETALHAMENTO DE CONEXÕES / ARRANJO DE STRINGS", 550, 660, 480, 215);

    const inversorQtd = Math.max(1, Number(d.inversorQtd) || 1);
    const stringsPorInversor = Math.max(1, Number(d.stringsPorInversor) || 1);
    const strings = inversorQtd * stringsPorInversor;
    const modPorString = Number(d.modulosPorString) || 0;
    const totalModulos = strings * modPorString;

    let stringConnSVG = '';
    const startX = 100;
    let currY = 160;
    const modW = 42;
    const modH = 70;

    for (let s = 0; s < strings; s++) {
        const invIdx = Math.floor(s / stringsPorInversor) + 1;
        const stringIdx = (s % stringsPorInversor) + 1;

        const cols = Math.min(10, Math.ceil(modPorString / (modPorString > 12 ? 2 : 1)));
        const rows = Math.ceil(modPorString / cols);
        const stringBlockHeight = rows * (modH + 10) - 10;
        const stringCenterY = currY + stringBlockHeight / 2;

        let maxX = startX;

        for (let m = 0; m < modPorString; m++) {
            const col = m % cols;
            const row = Math.floor(m / cols);
            const x = startX + col * (modW + 6);
            const y = currY + row * (modH + 10);
            if (x + modW > maxX) maxX = x + modW;

            const tagMod = `I0${invIdx}S0${stringIdx}M${m + 1}`;

            stringConnSVG += `
                <rect x="${x}" y="${y}" width="${modW}" height="${modH}" fill="#ffffff" stroke="#1b5e20" stroke-width="1.5" rx="2"/>
                <text x="${x + modW/2}" y="${y + modH/2 + 3}" text-anchor="middle" font-size="7" font-family="Arial" fill="#000" transform="rotate(-90 ${x + modW/2} ${y + modH/2 + 3})">${tagMod}</text>
            `;
        }

        const strLabel = strings === 1
            ? `Inversor ${d.inversorMarca || ''} (${modPorString} painéis ${d.moduloMarca || ''} ${d.moduloPotencia || 600}W)`
            : (inversorQtd > 1 
                ? `INV 0${invIdx} (${d.inversorMarca || ''}) - String 0${stringIdx} (${modPorString} painéis ${d.moduloMarca || ''} ${d.moduloPotencia || 600}W)`
                : `Inversor ${d.inversorMarca || ''} - String 0${stringIdx} (${modPorString} painéis ${d.moduloMarca || ''} ${d.moduloPotencia || 600}W)`);

        stringConnSVG += `
            <polyline points="${maxX},${stringCenterY} ${maxX + 40},${stringCenterY} ${maxX + 80},${stringCenterY}" fill="none" stroke="#1565c0" stroke-width="1.5"/>
            <text x="${maxX + 85}" y="${stringCenterY + 3}" font-size="10" font-family="Arial" font-weight="bold" fill="#1565c0">${strLabel}</text>
        `;

        currY += stringBlockHeight + 25;
    }

    return `
        <div class="doc-page diagrama-container">
            <svg class="diagrama-svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.5" y="1.5" width="${svgW - 3}" height="${svgH - 3}" fill="#ffffff" stroke="#000" stroke-width="1.8"/>
                <text x="${svgW/2}" y="32" text-anchor="middle" font-size="14" font-family="Arial" font-weight="bold" fill="#000">DETALHAMENTO DE CONEXÕES / ARRANJO DE STRINGS</text>

                <rect x="45" y="80" width="990" height="550" fill="#fff" stroke="#333" stroke-width="1.2"/>
                <text x="${svgW/2}" y="110" text-anchor="middle" font-size="11" font-family="Arial" font-weight="bold" fill="#000">ESQUEMA DE LIGAÇÃO EM SÉRIE DOS MÓDULOS FOTOVOLTAICOS</text>

                ${stringConnSVG}

                ${carimboSVG}
            </svg>
        </div>
    `;
}

// ==========================================
// PRANCHA 06/06: DIAGRAMA MULTIFILAR DO QUADRO QSS (100% FIEL AO CAD)
// ==========================================
function gerarPrancha6(d) {
    const svgW = 1080;
    const svgH = 900;
    const carimboSVG = criarCarimboPrancha(d, "06/06", "DIAGRAMA MULTIFILAR DO QUADRO DE PROTEÇÃO SOLAR (QSS)", 550, 660, 480, 215);

    const disjA = d.disjuntorCA || '32';

    return `
        <div class="doc-page diagrama-container">
            <svg class="diagrama-svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.5" y="1.5" width="${svgW - 3}" height="${svgH - 3}" fill="#ffffff" stroke="#000" stroke-width="1.8"/>
                <text x="${svgW/2}" y="32" text-anchor="middle" font-size="14" font-family="Arial" font-weight="bold" fill="#000">DIAGRAMA MULTIFILAR DO QUADRO DE PROTEÇÃO SOLAR (QSS)</text>

                <!-- MOLDURA PRINCIPAL DO DESENHO DA PRANCHA -->
                <rect x="45" y="80" width="990" height="550" fill="#fff" stroke="#333" stroke-width="1.2"/>

                <!-- MOLDURA DO QUADRO QSS (ENCLOSURE BOX CENTRAL) -->
                <rect x="180" y="140" width="680" height="470" fill="#ffffff" stroke="#222" stroke-width="1.8"/>

                <!-- TRILHO DIN CENTRAL METÁLICO -->
                <rect x="250" y="340" width="540" height="30" fill="#f0f0f0" stroke="#444" stroke-width="1.2"/>
                <rect x="250" y="348" width="540" height="14" fill="#e0e0e0" stroke="#888" stroke-width="0.8"/>

                <!-- BARRAMENTO TERRA (ESQUERDA) -->
                <rect x="205" y="240" width="22" height="230" fill="#ffffff" stroke="#333" stroke-width="1.5"/>
                <text x="195" y="355" font-size="10" font-family="Arial" font-weight="bold" fill="#2e7d32" transform="rotate(-90 195 355)">Barramento Terra</text>
                ${[255, 280, 305, 330, 355, 380, 405, 430, 455].map(y => `
                    <circle cx="216" cy="${y}" r="5" fill="#fff" stroke="#333" stroke-width="1.2"/>
                    <line x1="213" y1="${y}" x2="219" y2="${y}" stroke="#333" stroke-width="1"/>
                `).join('')}

                <!-- BARRAMENTO NEUTRO (DIREITA) -->
                <rect x="800" y="240" width="22" height="230" fill="#ffffff" stroke="#333" stroke-width="1.5"/>
                <text x="837" y="355" font-size="10" font-family="Arial" font-weight="bold" fill="#1565c0" transform="rotate(90 837 355)">Barramento Neutro</text>
                ${[255, 280, 305, 330, 355, 380, 405, 430, 455].map(y => `
                    <circle cx="811" cy="${y}" r="5" fill="#fff" stroke="#333" stroke-width="1.2"/>
                    <line x1="808" y1="${y}" x2="814" y2="${y}" stroke="#333" stroke-width="1"/>
                `).join('')}

                <!-- DISJUNTORES CA (DIPOLAR / 2 MONOPOLARES NO TRILHO) -->
                <g transform="translate(415, 290)">
                    <!-- Pólo 1 Disjuntor -->
                    <rect x="0" y="0" width="40" height="130" fill="#ffffff" stroke="#222" stroke-width="1.5"/>
                    <circle cx="20" cy="20" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
                    <circle cx="20" cy="110" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
                    <rect x="12" y="55" width="16" height="20" fill="#eee" stroke="#333" stroke-width="1"/>
                    <line x1="16" y1="65" x2="24" y2="65" stroke="#d32f2f" stroke-width="2"/>
                    <text x="20" y="95" text-anchor="middle" font-size="8.5" font-family="Arial" font-weight="bold" fill="#000">C ${disjA} A</text>

                    <!-- Pólo 2 Disjuntor -->
                    <rect x="42" y="0" width="40" height="130" fill="#ffffff" stroke="#222" stroke-width="1.5"/>
                    <circle cx="62" cy="20" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
                    <circle cx="62" cy="110" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
                    <rect x="54" y="55" width="16" height="20" fill="#eee" stroke="#333" stroke-width="1"/>
                    <line x1="58" y1="65" x2="66" y2="65" stroke="#d32f2f" stroke-width="2"/>
                    <text x="62" y="95" text-anchor="middle" font-size="8.5" font-family="Arial" font-weight="bold" fill="#000">C ${disjA} A</text>
                </g>

                <!-- MÓDULOS DPS CA (2 UNIDADES NO TRILHO) -->
                <g transform="translate(505, 290)">
                    <!-- DPS 1 -->
                    <rect x="0" y="0" width="38" height="130" fill="#ffffff" stroke="#222" stroke-width="1.5"/>
                    <circle cx="19" cy="20" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
                    <circle cx="19" cy="110" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
                    <rect x="9" y="48" width="20" height="14" fill="#4caf50" stroke="#333" stroke-width="0.8"/> <!-- Janela Verde -->
                    <text x="19" y="80" text-anchor="middle" font-size="7" font-family="Arial" font-weight="bold" fill="#000">DPS</text>
                    <text x="19" y="90" text-anchor="middle" font-size="6.5" font-family="Arial" fill="#000">275 V~</text>
                    <text x="19" y="100" text-anchor="middle" font-size="6.5" font-family="Arial" fill="#000">20/40 kA</text>

                    <!-- DPS 2 -->
                    <rect x="40" y="0" width="38" height="130" fill="#ffffff" stroke="#222" stroke-width="1.5"/>
                    <circle cx="59" cy="20" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
                    <circle cx="59" cy="110" r="5" fill="#fff" stroke="#333" stroke-width="1"/>
                    <rect x="49" y="48" width="20" height="14" fill="#4caf50" stroke="#333" stroke-width="0.8"/> <!-- Janela Verde -->
                    <text x="59" y="80" text-anchor="middle" font-size="7" font-family="Arial" font-weight="bold" fill="#000">DPS</text>
                    <text x="59" y="90" text-anchor="middle" font-size="6.5" font-family="Arial" fill="#000">275 V~</text>
                    <text x="59" y="100" text-anchor="middle" font-size="6.5" font-family="Arial" fill="#000">20/40 kA</text>
                </g>

                <!-- FIAÇÃO DA ENTRADA INFERIOR (CABOS VINDOS DOS INVERSORES) -->
                <!-- Condulete / Tubo de Entrada Inferior -->
                <rect x="475" y="610" width="90" height="20" fill="#ffffff" stroke="#1565c0" stroke-width="1.8"/>
                <line x1="500" y1="610" x2="500" y2="630" stroke="#1565c0" stroke-width="1.8"/>
                <line x1="540" y1="610" x2="540" y2="630" stroke="#1565c0" stroke-width="1.8"/>
                <rect x="460" y="580" width="120" height="18" fill="#ffffff" stroke="#666" stroke-width="0.8"/>
                <text x="520" y="593" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="#000">Cabos vindos dos Inversores</text>

                <!-- 2 Cabos Fases (Vermelhos) subindo direto nos terminais inferiores do Disjuntor -->
                <line x1="435" y1="580" x2="435" y2="400" stroke="#d32f2f" stroke-width="1.8"/>
                <line x1="477" y1="580" x2="477" y2="400" stroke="#d32f2f" stroke-width="1.8"/>

                <!-- 1 Cabo Neutro (Azul) correndo por baixo ate o Barramento Neutro -->
                <path d="M 505 580 L 505 570 Q 505 560 515 560 L 811 560 L 811 470" fill="none" stroke="#1976d2" stroke-width="1.8"/>

                <!-- 1 Cabo Terra (Verde) correndo por baixo ate o Barramento Terra -->
                <path d="M 490 580 L 490 575 Q 490 568 480 568 L 216 568 L 216 470" fill="none" stroke="#388e3c" stroke-width="1.8"/>

                <!-- FIAÇÃO DA SAÍDA SUPERIOR (CABOS INDO PARA O QGBT) -->
                <!-- Condulete / Tubo de Saída Superior -->
                <rect x="475" y="80" width="90" height="60" fill="#ffffff" stroke="#1565c0" stroke-width="1.8"/>
                <line x1="500" y1="80" x2="500" y2="140" stroke="#1565c0" stroke-width="1.8"/>
                <line x1="540" y1="80" x2="540" y2="140" stroke="#1565c0" stroke-width="1.8"/>
                <rect x="460" y="95" width="120" height="18" fill="#ffffff" stroke="#666" stroke-width="0.8"/>
                <text x="520" y="108" text-anchor="middle" font-size="9" font-family="Arial" font-weight="bold" fill="#000">Cabos indo para o QGBT</text>

                <!-- Cabo Fase (Vermelho) saindo do disjuntor para o topo -->
                <path d="M 435 310 L 435 240 L 490 240 L 490 140" fill="none" stroke="#d32f2f" stroke-width="1.8"/>

                <!-- Cabo Neutro (Azul) saindo do Barramento Neutro para o topo -->
                <path d="M 811 255 L 811 180 L 515 180 L 515 140" fill="none" stroke="#1976d2" stroke-width="1.8"/>

                <!-- Cabo Terra (Verde) saindo do Barramento Terra para o topo -->
                <path d="M 216 255 L 216 160 L 535 160 L 535 140" fill="none" stroke="#388e3c" stroke-width="1.8"/>

                <!-- LIGAÇÕES INTERNAS ENTRE DISJUNTORES E DPS (PONTES SUPERIORES E INFERIORES) -->
                <!-- Ponte de Fase (Vermelha) nos Topos dos Disjuntores e DPS -->
                <path d="M 435 310 L 435 270 L 524 270 L 524 310" fill="none" stroke="#d32f2f" stroke-width="1.8"/>
                <path d="M 477 310 L 477 275 L 564 275 L 564 310" fill="none" stroke="#d32f2f" stroke-width="1.8"/>

                <!-- Ponte de Neutro (Azul) do Barramento Neutro ate o topo dos DPS -->
                <path d="M 811 305 L 575 305 L 575 310" fill="none" stroke="#1976d2" stroke-width="1.8"/>

                <!-- Ponte de Aterramento (Verde) na base dos DPS indo para o Barramento Terra -->
                <path d="M 524 400 L 524 425 Q 524 430 530 430 L 564 430 L 564 400" fill="none" stroke="#388e3c" stroke-width="1.8"/>
                <path d="M 524 425 L 216 425" fill="none" stroke="#388e3c" stroke-width="1.8"/>

                ${carimboSVG}
            </svg>
        </div>
    `;
}

// ==========================================
// FUNÇÃO GERADORA DE TODAS AS PRANCHAS (01 A 06)
// ==========================================
function gerarTodasPranchas(data) {
    return `
        <div class="pranchas-container">
            ${gerarPrancha1(data)}
            ${gerarPrancha2(data)}
            ${gerarPrancha3(data)}
            ${gerarPrancha4(data)}
            ${gerarPrancha5(data)}
            ${gerarPrancha6(data)}
        </div>
    `;
}

function gerarDiagramaUnifilar(data) {
    return gerarTodasPranchas(data);
}
