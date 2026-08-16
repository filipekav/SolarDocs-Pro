/**
 * Funções Utilitárias para o Gerador de Documentos Solar
 * Inclui captura de dados do formulário, cálculos elétricos,
 * formatações e algoritmo de compressão inteligente de imagens via Canvas.
 */

/**
 * Redimensiona e comprime uma imagem (PNG/JPEG/WEBP) no navegador
 * Converte para JPEG otimizado (~80KB a 140KB) para economizar espaço e garantir fluidez.
 */
async function compressImage(file, maxWidth = 1280, maxHeight = 1280, quality = 0.78) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            return reject(new Error('O arquivo selecionado não é uma imagem válida.'));
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Erro ao ler o arquivo de imagem.'));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject(new Error('Não foi possível carregar a imagem selecionada.'));
            img.onload = () => {
                let width = img.naturalWidth || img.width;
                let height = img.naturalHeight || img.height;

                // Redimensionamento proporcional se exceder os limites
                if (width > maxWidth || height > maxHeight) {
                    if (width / height > maxWidth / maxHeight) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                // Fundo branco sólido para preservar transparências em PNG sem ficar preto
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // Exporta como JPEG otimizado
                const base64 = canvas.toDataURL('image/jpeg', quality);
                resolve(base64);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

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
            el.value = data[name] || '';
        }
    });

    // Atualiza os componentes visuais de upload e preview de imagens
    updateImageUploadPreviews(data);

    // Recalcula campos encadeados
    getFormData();
}

/**
 * Atualiza os previews dos cards de upload de imagens na aba 'Imagens'
 */
function updateImageUploadPreviews(data) {
    const imageFields = [
        'logoEmpresa',
        'imgCroquiLocalizacao',
        'imgPlantaSituacao',
        'imgLocalizacaoModulos',
        'imgDisjuntorPadrao',
        'imgPlacaSinalizacao',
        'imgPadraoMedicao'
    ];

    imageFields.forEach(fieldName => {
        const card = document.querySelector(`.image-upload-card[data-field="${fieldName}"]`);
        if (!card) return;

        const val = data ? data[fieldName] : null;
        const previewImg = card.querySelector('.image-card-preview');
        const emptyBox = card.querySelector('.image-card-empty');
        const btnRemove = card.querySelector('.btn-remove-image');
        const sizeBadge = card.querySelector('.image-size-badge');

        if (val && typeof val === 'string' && val.startsWith('data:image')) {
            if (previewImg) {
                previewImg.src = val;
                previewImg.style.display = 'block';
            }
            if (emptyBox) emptyBox.style.display = 'none';
            if (btnRemove) btnRemove.style.display = 'inline-flex';
            if (sizeBadge) {
                const approxKb = Math.round((val.length * 3 / 4) / 1024);
                sizeBadge.textContent = `~${approxKb} KB (Otimizada)`;
                sizeBadge.style.display = 'inline-block';
            }
            card.classList.add('has-image');
        } else {
            if (previewImg) {
                previewImg.src = '';
                previewImg.style.display = 'none';
            }
            if (emptyBox) emptyBox.style.display = 'flex';
            if (btnRemove) btnRemove.style.display = 'none';
            if (sizeBadge) sizeBadge.style.display = 'none';
            card.classList.remove('has-image');
        }
    });
}

function clearFormData() {
    const form = document.getElementById('docForm');
    if (!form) return;
    form.reset();
    updateImageUploadPreviews({});
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
        // Reinicializa eventos interativos nos placeholders de imagem após renderizar
        if (typeof attachMemorialImageEvents === 'function') {
            attachMemorialImageEvents();
        }
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
