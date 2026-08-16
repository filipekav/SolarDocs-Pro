/**
 * Gerenciador de Persistência Avançado para Projetos Solares
 * Suporta IndexedDB com alta capacidade de armazenamento (imagens e anexos)
 * e mantém cache em memória com sincronização síncrona/assíncrona e fallback para LocalStorage.
 */

const STORAGE_KEY_PROJECTS = 'solar_projects_v1';
const STORAGE_KEY_ACTIVE = 'solar_active_project_id';
const DB_NAME = 'SolarDocsDB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_META = 'meta';

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
    cidadeDoc: "Pacajus - CE",
    // Campos de Imagens & Anexos (Base64 Otimizado)
    logoEmpresa: null,
    imgCroquiLocalizacao: null,
    imgPlantaSituacao: null,
    imgLocalizacaoModulos: null,
    imgDisjuntorPadrao: null,
    imgPlacaSinalizacao: null,
    imgPadraoMedicao: null
};

// =========================================================================
// CAMADA INDEXEDDB NATIVA
// =========================================================================

const IDBAdapter = {
    _dbPromise: null,

    getDB() {
        if (!this._dbPromise) {
            this._dbPromise = new Promise((resolve, reject) => {
                if (!window.indexedDB) {
                    console.warn('IndexedDB não suportado. Usando LocalStorage fallback.');
                    return resolve(null);
                }

                const request = indexedDB.open(DB_NAME, DB_VERSION);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
                        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains(STORE_META)) {
                        db.createObjectStore(STORE_META, { keyPath: 'key' });
                    }
                };

                request.onsuccess = (event) => resolve(event.target.result);
                request.onerror = (event) => {
                    console.error('Erro ao abrir IndexedDB:', event.target.error);
                    resolve(null);
                };
            });
        }
        return this._dbPromise;
    },

    async getAllProjects() {
        const db = await this.getDB();
        if (!db) return null;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORE_PROJECTS, 'readonly');
                const store = tx.objectStore(STORE_PROJECTS);
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => resolve(null);
            } catch (e) {
                console.error('Erro getAllProjects IDB:', e);
                resolve(null);
            }
        });
    },

    async saveProject(project) {
        const db = await this.getDB();
        if (!db) return false;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORE_PROJECTS, 'readwrite');
                const store = tx.objectStore(STORE_PROJECTS);
                const req = store.put(project);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            } catch (e) {
                console.error('Erro saveProject IDB:', e);
                resolve(false);
            }
        });
    },

    async deleteProject(id) {
        const db = await this.getDB();
        if (!db) return false;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORE_PROJECTS, 'readwrite');
                const store = tx.objectStore(STORE_PROJECTS);
                const req = store.delete(id);
                req.onsuccess = () => resolve(true);
                req.onerror = () => resolve(false);
            } catch (e) {
                console.error('Erro deleteProject IDB:', e);
                resolve(false);
            }
        });
    },

    async bulkSave(projectsList) {
        const db = await this.getDB();
        if (!db || !Array.isArray(projectsList)) return false;
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORE_PROJECTS, 'readwrite');
                const store = tx.objectStore(STORE_PROJECTS);
                projectsList.forEach(p => store.put(p));
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            } catch (e) {
                console.error('Erro bulkSave IDB:', e);
                resolve(false);
            }
        });
    }
};

// =========================================================================
// CONTROLADOR PRINCIPAL PROJECTSTORAGE
// =========================================================================

const ProjectStorage = {
    _cache: [],
    _initialized: false,

    /**
     * Inicializa o armazenamento lendo do IndexedDB e migrando do LocalStorage se necessário
     */
    async init() {
        if (this._initialized) return this._cache;

        // 1. Tenta carregar do IndexedDB
        const idbProjects = await IDBAdapter.getAllProjects();

        if (idbProjects && idbProjects.length > 0) {
            this._cache = idbProjects.sort((a, b) => new Date(b.atualizadoEm || 0) - new Date(a.atualizadoEm || 0));
        } else {
            // 2. Se IndexedDB vazio, verifica se tem projetos legados no localStorage para migrar
            let legacyList = null;
            try {
                const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
                if (raw) legacyList = JSON.parse(raw);
            } catch (e) {
                legacyList = null;
            }

            if (Array.isArray(legacyList) && legacyList.length > 0) {
                this._cache = legacyList;
                // Migra para o IndexedDB em segundo plano
                await IDBAdapter.bulkSave(legacyList);
            } else {
                // 3. Inicializa com o projeto modelo padrão
                this._cache = this.initDefault();
            }
        }

        this._initialized = true;
        this._syncLocalStorageFallback();
        return this._cache;
    },

    /**
     * Retorna a lista de todos os projetos (ordenados por data de atualização)
     */
    getAll() {
        if (!this._initialized) {
            // Leitura síncrona emergencial caso chamado antes do init()
            try {
                const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        this._cache = parsed;
                    }
                }
            } catch (e) { }

            if (this._cache.length === 0) {
                this._cache = this.initDefault();
            }
        }
        return [...this._cache].sort((a, b) => new Date(b.atualizadoEm || 0) - new Date(a.atualizadoEm || 0));
    },

    /**
     * Cria o projeto de demonstração padrão
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
        this._cache = list;
        IDBAdapter.bulkSave(list);
        this._syncLocalStorageFallback();
        return list;
    },

    /**
     * Retorna um projeto por ID
     */
    getById(id) {
        if (!id) return null;
        const list = this.getAll();
        return list.find(p => p.id === id) || null;
    },

    /**
     * Salva ou atualiza um projeto
     */
    save(project) {
        if (!project || !project.id) return null;

        const list = this.getAll();
        const now = new Date().toISOString();
        const index = list.findIndex(p => p.id === project.id);

        let savedProj = null;

        if (index >= 0) {
            list[index] = {
                ...list[index],
                ...project,
                data: {
                    ...list[index].data,
                    ...(project.data || {})
                },
                atualizadoEm: now
            };
            savedProj = list[index];
        } else {
            const newProj = {
                id: project.id,
                nome: project.nome || 'Novo Projeto Solar',
                criadoEm: project.criadoEm || now,
                atualizadoEm: now,
                data: { ...DEFAULT_PROJECT_TEMPLATE, ...(project.data || {}) }
            };
            list.unshift(newProj);
            savedProj = newProj;
        }

        this._cache = list;

        // Persiste assincronamente no IndexedDB
        IDBAdapter.saveProject(savedProj);

        // Atualiza fallback LocalStorage
        this._syncLocalStorageFallback();

        return savedProj;
    },

    /**
     * Cria um novo projeto vazio ou baseado em template
     */
    create(nome, customData = null) {
        const now = new Date().toISOString();
        const data = customData ? { ...DEFAULT_PROJECT_TEMPLATE, ...customData } : { ...DEFAULT_PROJECT_TEMPLATE };

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
            data.logoEmpresa = null;
            data.imgCroquiLocalizacao = null;
            data.imgPlantaSituacao = null;
            data.imgLocalizacaoModulos = null;
            data.imgDisjuntorPadrao = null;
            data.imgPlacaSinalizacao = null;
            data.imgPadraoMedicao = null;
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
        this._cache = list;

        IDBAdapter.saveProject(newProject);
        this.setActiveId(newProject.id);
        this._syncLocalStorageFallback();

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
        this._cache = list;

        IDBAdapter.saveProject(copy);
        this._syncLocalStorageFallback();
        return copy;
    },

    /**
     * Remove um projeto por ID
     */
    delete(id) {
        let list = this.getAll();
        list = list.filter(p => p.id !== id);
        this._cache = list;

        IDBAdapter.deleteProject(id);

        if (this.getActiveId() === id) {
            this.setActiveId(list.length > 0 ? list[0].id : null);
        }

        this._syncLocalStorageFallback();
        return true;
    },

    /**
     * ID do projeto ativo
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
     * Exporta um único projeto como arquivo JSON (incluindo imagens)
     */
    exportProjectJSON(id) {
        const project = this.getById(id);
        if (!project) return;
        const filename = `${(project.nome || 'projeto-solar').toLowerCase().replace(/[^a-z0-9_-]/gi, '_')}.json`;
        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    },

    /**
     * Exporta todos os projetos como backup completo
     */
    exportAllBackup() {
        const list = this.getAll();
        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `backup_projetos_solar_${dateStr}.json`;
        const payload = {
            app: 'SolarDocsPro',
            version: '2.0',
            exportadoEm: new Date().toISOString(),
            totalProjetos: list.length,
            projetos: list
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    },

    /**
     * Importa projetos a partir de JSON (suporta imagens)
     */
    async importFromJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            const now = new Date().toISOString();
            let importedCount = 0;
            const list = this.getAll();

            let itemsToImport = [];
            if (parsed && Array.isArray(parsed.projetos)) {
                itemsToImport = parsed.projetos;
            } else if (Array.isArray(parsed)) {
                itemsToImport = parsed;
            } else if (parsed && typeof parsed === 'object') {
                itemsToImport = [parsed];
            }

            for (const item of itemsToImport) {
                if (!item || (!item.data && !item.clienteNome)) continue;

                const projectData = item.data ? { ...DEFAULT_PROJECT_TEMPLATE, ...item.data } : { ...DEFAULT_PROJECT_TEMPLATE, ...item };
                const projName = item.nome || (projectData.clienteNome ? `Projeto - ${projectData.clienteNome}` : 'Projeto Importado');

                const newProject = {
                    id: 'proj_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
                    nome: projName,
                    criadoEm: item.criadoEm || now,
                    atualizadoEm: now,
                    data: projectData
                };

                list.unshift(newProject);
                await IDBAdapter.saveProject(newProject);
                importedCount++;
            }

            if (importedCount > 0) {
                this._cache = list;
                this._syncLocalStorageFallback();
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
     * Sincroniza uma versão leve/segura com o LocalStorage como fallback
     */
    _syncLocalStorageFallback() {
        try {
            localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(this._cache));
        } catch (e) {
            // Se exceder a cota do LocalStorage por causa das fotos Base64, salva versão sem imagens no localStorage
            try {
                const lightweight = this._cache.map(p => {
                    const cleanData = { ...p.data };
                    cleanData.logoEmpresa = null;
                    cleanData.imgCroquiLocalizacao = null;
                    cleanData.imgPlantaSituacao = null;
                    cleanData.imgLocalizacaoModulos = null;
                    cleanData.imgDisjuntorPadrao = null;
                    cleanData.imgPlacaSinalizacao = null;
                    cleanData.imgPadraoMedicao = null;
                    return { ...p, data: cleanData };
                });
                localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(lightweight));
            } catch (err) {
                console.warn('LocalStorage sem espaço livre. Dados mantidos com segurança no IndexedDB.');
            }
        }
    },

    /**
     * Helper para download de Blob
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

// Inicialização imediata assíncrona
if (typeof window !== 'undefined') {
    ProjectStorage.init();
}
