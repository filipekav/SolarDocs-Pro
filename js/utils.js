/**
 * Funções Utilitárias para o Gerador de Documentos Solar
 */

function getFormData() {
    const form = document.getElementById('docForm');
    if (!form) return {};

    const data = {};
    const elements = form.querySelectorAll('input, select, textarea');
    elements.forEach(el => {
        if (!el.name) return;
        data[el.name] = el.type === 'number' ? (el.value === '' ? '' : Number(el.value)) : el.value;
    });

    // Derivação automática do Tipo de Acesso Pretendido a partir do Tipo de Conexão
    if (data.tipoConexao) {
        if (data.tipoConexao.includes('MONO')) data.tipoAcesso = 'MONO';
        else if (data.tipoConexao.includes('BI')) data.tipoAcesso = 'BI';
        else if (data.tipoConexao.includes('TRI')) data.tipoAcesso = 'TRI';
        else data.tipoAcesso = data.tipoConexao;
    } else {
        data.tipoAcesso = 'MONO';
    }

    // Derivação de classe a partir da Modalidade Tarifária caso classe não seja preenchida
    if (!data.classe) {
        data.classe = data.modalidade ? data.modalidade.split(' ')[0] : 'B1';
    }

    // Cálculo automático encadeado:
    // 1. Total de Strings = Inversores * Strings por Inversor
    // 2. Total de Módulos = Total de Strings * Módulos por String
    const invQtd = Math.max(1, Number(data.inversorQtd) || 1);
    const strPorInv = Math.max(1, Number(data.stringsPorInversor) || 1);
    const modPorStr = Number(data.modulosPorString) || 0;

    data.inversorQtd = invQtd;
    data.stringsPorInversor = strPorInv;
    data.stringsQtd = invQtd * strPorInv;
    data.moduloQtd = data.stringsQtd * modPorStr;

    // Atualiza visualmente os campos readonly no formulário caso existam
    const elStringsQtd = form.querySelector('input[name="stringsQtd"]');
    if (elStringsQtd) {
        elStringsQtd.value = data.stringsQtd || '';
    }

    const elModuloQtd = form.querySelector('input[name="moduloQtd"]');
    if (elModuloQtd) {
        elModuloQtd.value = data.moduloQtd || '';
    }

    return data;
}

function setFormData(data) {
    const form = document.getElementById('docForm');
    if (!form || !data) return;

    const elements = form.querySelectorAll('input, select, textarea');
    elements.forEach(el => {
        const name = el.name;
        if (name && data[name] !== undefined) {
            el.value = data[name];
        }
    });

    // Recalcula campos encadeados
    getFormData();
}

function clearFormData() {
    const form = document.getElementById('docForm');
    if (!form) return;
    form.reset();
}

function formatDateBR(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('pt-BR');
}

function formatRelativeTime(dateIsoStr) {
    if (!dateIsoStr) return 'Recente';
    try {
        const date = new Date(dateIsoStr);
        if (isNaN(date.getTime())) return 'Recente';
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `Há ${diffMins} min`;
        if (diffHours < 24) return `Hoje às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        if (diffDays === 1) return `Ontem às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        if (diffDays < 7) return `Há ${diffDays} dias`;
        return date.toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Recente';
    }
}

function renderDocument(html) {
    const container = document.getElementById('previewContainer');
    if (container) {
        container.innerHTML = html;
    }
}

function setupTabs() {
    const buttons = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.tab);
            if (target) target.classList.add('active');
        });
    });
}

function getGeracaoMensal(data) {
    return [
        { mes: 'Janeiro', valor: data.gerJan || 0 },
        { mes: 'Fevereiro', valor: data.gerFev || 0 },
        { mes: 'Março', valor: data.gerMar || 0 },
        { mes: 'Abril', valor: data.gerAbr || 0 },
        { mes: 'Maio', valor: data.gerMai || 0 },
        { mes: 'Junho', valor: data.gerJun || 0 },
        { mes: 'Julho', valor: data.gerJul || 0 },
        { mes: 'Agosto', valor: data.gerAgo || 0 },
        { mes: 'Setembro', valor: data.gerSet || 0 },
        { mes: 'Outubro', valor: data.gerOut || 0 },
        { mes: 'Novembro', valor: data.gerNov || 0 },
        { mes: 'Dezembro', valor: data.gerDez || 0 }
    ];
}
