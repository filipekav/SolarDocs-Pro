/**
 * Gerenciador de Persistência Local (LocalStorage) para Projetos Solares
 */

const STORAGE_KEY_PROJECTS = 'solar_projects_v1';
const STORAGE_KEY_ACTIVE = 'solar_active_project_id';

const DEFAULT_PROJECT_TEMPLATE = {
    clienteNome: "MARIA MYKAELLE FREITAS ALMEIDA",
    clienteCpf: "048.145.663-52",
    clienteTelefone: "(85) 98945-3951",
    clienteEmail: "ithalocarvalho000@gmail.com",
    endereco: "Rua/Av. FAZENDA BOQUEIRAO",
    numero: "0000",
    bairro: "TAPUIRA",
    cidade: "QUIXADA",
    cep: "63900-001",
    latitude: "-4.181012",
    longitude: "-38.519754",
    uc: "4168720",
    grupo: "B",
    modalidade: "B1 RESIDENCIAL",
    tipoConexao: "MONOFÁSICA",
    tensaoAtendimento: "220",
    disjuntorEntrada: "32",
    tipoRamal: "Aéreo",
    tipoMedidor: "Bidirecional",
    potenciaSistema: "6",
    tensaoGeracao: "220",
    tipoFonte: "Solar Fotovoltaica",
    moduloMarca: "TSUN",
    moduloModelo: "TS600S8E-132GANT",
    moduloPotencia: "600",
    stringsPorInversor: 2,
    modulosPorString: 8,
    stringsQtd: 2,
    moduloQtd: 16,
    moduloIsc: "16,05",
    moduloImp: "15,34",
    moduloVoc: "48,10",
    moduloVmp: "39,77",
    moduloEficiencia: "21,41",
    moduloTipo: "Monocristalino",
    moduloNoct: "41°C±3°C",
    moduloCoefTemp: "-0,28",
    moduloDimensoes: "2.384x1.134x35",
    inversorMarca: "SAJ",
    inversorModelo: "R5-6K-S2-15",
    inversorPotMaxCc: "6000",
    inversorPotencia: "6000",
    inversorQtd: 1,
    inversorVEntrada: "60",
    inversorVMaxEntrada: "650",
    inversorVSaida: "220",
    inversorIMaxEntrada: "18,78",
    inversorIMaxMppt: "19",
    inversorINominal: "26,7",
    inversorEficiencia: "97,50",
    inversorTipoSaida: "MONOFÁSICA",
    disjuntorCA: "32",
    curvaDisjuntorCA: "C",
    disjuntorQGBT: "40",
    dpsCA: "2x DPS Classe II - 275 VCA - 20/40 kA (1 fase + 1 neutro)",
    caboCCPos: "4,0",
    caboCCNeg: "4,0",
    caboCAFase: "6,0",
    caboCANeutro: "6,0",
    caboTerra: "4,0",
    comprCC: "25",
    comprCA: "25",
    quedaCC: "1,12",
    quedaCA: "0,76",
    gerJan: 750,
    gerFev: 720,
    gerMar: 780,
    gerAbr: 760,
    gerMai: 740,
    gerJun: 700,
    gerJul: 720,
    gerAgo: 760,
    gerSet: 800,
    gerOut: 820,
    gerNov: 790,
    gerDez: 770,
    empresaNome: "Nova Energy LTDA",
    empresaCnpj: "62.506.839/0001-53",
    empresaEndereco: "Rua Conego Eduardo Araripe, 1750, Centro, Pacajus-CE",
    tecnicoNome: "TEC. JESUS ITHALO",
    tecnicoCpf: "104.152.573-79",
    tecnicoRegistro: "2605536652",
    dataProjeto: new Date().toISOString().split('T')[0],
    cidadeDoc: "Pacajus - CE"
};

const ProjectStorage = {
    /**
     * Retorna a lista de todos os projetos ordenados por data de atualização (mais recente primeiro)
     */
    getAll() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
            if (!raw) {
                return this.initDefault();
            }
            const list = JSON.parse(raw);
            if (!Array.isArray(list) || list.length === 0) {
                return this.initDefault();
            }
            return list.sort((a, b) => new Date(b.atualizadoEm || 0) - new Date(a.atualizadoEm || 0));
        } catch (e) {
            console.error('Erro ao ler projetos do localStorage:', e);
            return this.initDefault();
        }
    },

    /**
     * Inicializa com um projeto de demonstração caso esteja vazio
     */
    initDefault() {
        const defaultProject = {
            id: 'proj_' + Date.now(),
            nome: 'Projeto Modelo - Maria Mykaelle (6.0 kWp)',
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
            data: { ...DEFAULT_PROJECT_TEMPLATE }
        };
        const list = [defaultProject];
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
        return list;
    },

    /**
     * Retorna um projeto por ID
     */
    getById(id) {
        const list = this.getAll();
        return list.find(p => p.id === id) || null;
    },

    /**
     * Salva ou atualiza um projeto
     */
    save(project) {
        const list = this.getAll();
        const now = new Date().toISOString();
        const index = list.findIndex(p => p.id === project.id);

        if (index >= 0) {
            list[index] = {
                ...list[index],
                ...project,
                atualizadoEm: now
            };
        } else {
            const newProj = {
                id: project.id || ('proj_' + Date.now()),
                nome: project.nome || 'Novo Projeto Solar',
                criadoEm: project.criadoEm || now,
                atualizadoEm: now,
                data: project.data || { ...DEFAULT_PROJECT_TEMPLATE }
            };
            list.unshift(newProj);
            project = newProj;
        }

        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
        return project;
    },

    /**
     * Cria um novo projeto vazio ou baseado em template
     */
    create(nome, customData = null) {
        const now = new Date().toISOString();
        const data = customData ? { ...customData } : { ...DEFAULT_PROJECT_TEMPLATE };
        
        if (!customData) {
            data.clienteNome = "";
            data.clienteCpf = "";
            data.clienteTelefone = "";
            data.clienteEmail = "";
            data.endereco = "";
            data.numero = "";
            data.bairro = "";
            data.cidade = "";
            data.cep = "";
            data.uc = "";
            data.dataProjeto = now.split('T')[0];
        }

        const newProject = {
            id: 'proj_' + Date.now(),
            nome: nome || (data.clienteNome ? `Projeto - ${data.clienteNome}` : 'Novo Projeto Solar'),
            criadoEm: now,
            atualizadoEm: now,
            data: data
        };

        const list = this.getAll();
        list.unshift(newProject);
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
        this.setActiveId(newProject.id);
        return newProject;
    },

    /**
     * Duplica um projeto existente
     */
    duplicate(id) {
        const original = this.getById(id);
        if (!original) return null;

        const now = new Date().toISOString();
        const copy = {
            id: 'proj_' + Date.now(),
            nome: `${original.nome} (Cópia)`,
            criadoEm: now,
            atualizadoEm: now,
            data: JSON.parse(JSON.stringify(original.data))
        };

        const list = this.getAll();
        list.unshift(copy);
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
        return copy;
    },

    /**
     * Remove um projeto por ID
     */
    delete(id) {
        let list = this.getAll();
        list = list.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
        
        if (this.getActiveId() === id) {
            localStorage.removeItem(STORAGE_KEY_ACTIVE);
        }
        return true;
    },

    /**
     * ID do projeto atualmente ativo
     */
    getActiveId() {
        return localStorage.getItem(STORAGE_KEY_ACTIVE);
    },

    setActiveId(id) {
        if (id) {
            localStorage.setItem(STORAGE_KEY_ACTIVE, id);
        } else {
            localStorage.removeItem(STORAGE_KEY_ACTIVE);
        }
    },

    /**
     * Exporta um único projeto como arquivo JSON
     */
    exportProjectJSON(id) {
        const project = this.getById(id);
        if (!project) return;
        const filename = `${(project.nome || 'projeto-solar').toLowerCase().replace(/[^a-z0-9_-]/gi, '_')}.json`;
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    },

    /**
     * Exporta todos os projetos como um arquivo de backup completo
     */
    exportAllBackup() {
        const list = this.getAll();
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `backup_projetos_solar_${dateStr}.json`;
        const payload = {
            app: 'GeradorDocsSolar',
            version: '1.0',
            exportadoEm: new Date().toISOString(),
            totalProjetos: list.length,
            projetos: list
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    },

    /**
     * Importa projetos a partir de um arquivo/string JSON
     */
    importFromJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            const now = new Date().toISOString();
            let importedCount = 0;
            const list = this.getAll();

            // Caso seja um backup completo com array em `projetos`
            let itemsToImport = [];
            if (parsed && Array.isArray(parsed.projetos)) {
                itemsToImport = parsed.projetos;
            } else if (Array.isArray(parsed)) {
                itemsToImport = parsed;
            } else if (parsed && typeof parsed === 'object') {
                // Projeto individual
                itemsToImport = [parsed];
            }

            itemsToImport.forEach(item => {
                if (!item || (!item.data && !item.clienteNome)) return;

                // Normaliza formato
                const projectData = item.data ? item.data : item;
                const projName = item.nome || (projectData.clienteNome ? `Projeto - ${projectData.clienteNome}` : 'Projeto Importado');
                
                const newProject = {
                    id: 'proj_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    nome: projName,
                    criadoEm: item.criadoEm || now,
                    atualizadoEm: now,
                    data: projectData
                };

                list.unshift(newProject);
                importedCount++;
            });

            if (importedCount > 0) {
                localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(list));
                return { success: true, count: importedCount };
            } else {
                return { success: false, message: 'Nenhum projeto válido encontrado no arquivo JSON.' };
            }
        } catch (e) {
            console.error('Erro ao importar JSON:', e);
            return { success: false, message: 'Arquivo JSON inválido ou corrompido.' };
        }
    },

    /**
     * Helper para disparar download do Blob no navegador
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
