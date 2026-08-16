/**
 * Controlador Principal da Aplicação SolarDocs Pro
 * Gerencia Dashboard de Projetos, Editor de Documentos, Navegação e Auto-Save
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicialização de Estado
    let currentView = 'dashboard'; // 'dashboard' | 'editor'
    let activeProjectId = ProjectStorage.getActiveId();
    let activeDocType = 'diagrama'; // 'diagrama' | 'memorial' | 'formulario'
    let selectedPrancha = 'all'; // 'all', '1', '2', '3', '4', '5', '6'
    let searchQuery = '';
    let autoSaveTimeout = null;
    let projectToDeleteId = null;
    let modalMode = 'create'; // 'create' | 'rename'

    // Elementos do DOM - Vistas
    const viewDashboard = document.getElementById('viewDashboard');
    const viewEditor = document.getElementById('viewEditor');

    // Elementos do DOM - Dashboard
    const projectsGrid = document.getElementById('projectsGrid');
    const emptyProjectsState = document.getElementById('emptyProjectsState');
    const searchProjectsInput = document.getElementById('searchProjectsInput');
    const metricTotalProjects = document.getElementById('metricTotalProjects');
    const metricTotalPower = document.getElementById('metricTotalPower');
    const projectCountBadge = document.getElementById('projectCountBadge');
    const btnNewProject = document.getElementById('btnNewProject');
    const btnEmptyNewProject = document.getElementById('btnEmptyNewProject');
    const btnImportJson = document.getElementById('btnImportJson');
    const importFileInput = document.getElementById('importFileInput');
    const btnExportAll = document.getElementById('btnExportAll');

    // Elementos do DOM - Editor
    const btnBackToDashboard = document.getElementById('btnBackToDashboard');
    const activeProjectTitle = document.getElementById('activeProjectTitle');
    const btnRenameProject = document.getElementById('btnRenameProject');
    const activeProjectPowerBadge = document.getElementById('activeProjectPowerBadge');
    const activeProjectUcBadge = document.getElementById('activeProjectUcBadge');
    const autoSaveIndicator = document.getElementById('autoSaveIndicator');
    const btnDiagrama = document.getElementById('btnDiagrama');
    const btnMemorial = document.getElementById('btnMemorial');
    const btnFormulario = document.getElementById('btnFormulario');
    const btnPrintDocument = document.getElementById('btnPrintDocument');
    const btnSavePdfDocument = document.getElementById('btnSavePdfDocument');

    // Elementos do DOM - Modais
    const modalProjectName = document.getElementById('modalProjectName');
    const modalProjectNameTitle = document.getElementById('modalProjectNameTitle');
    const projectNameInput = document.getElementById('projectNameInput');
    const btnCloseProjectNameModal = document.getElementById('btnCloseProjectNameModal');
    const btnCancelProjectName = document.getElementById('btnCancelProjectName');
    const btnConfirmProjectName = document.getElementById('btnConfirmProjectName');

    const modalDeleteConfirm = document.getElementById('modalDeleteConfirm');
    const deleteProjectNameTarget = document.getElementById('deleteProjectNameTarget');
    const btnCloseDeleteModal = document.getElementById('btnCloseDeleteModal');
    const btnCancelDelete = document.getElementById('btnCancelDelete');
    const btnConfirmDelete = document.getElementById('btnConfirmDelete');

    // =========================================================================
    // NAVEGAÇÃO E GERENCIAMENTO DE TELAS
    // =========================================================================

    function switchView(targetView) {
        currentView = targetView;
        if (targetView === 'dashboard') {
            viewDashboard.classList.add('active');
            viewEditor.classList.remove('active');
            renderDashboard();
        } else {
            viewDashboard.classList.remove('active');
            viewEditor.classList.add('active');
            updateActiveProjectHeader();
            updatePreview();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openProject(id) {
        const project = ProjectStorage.getById(id);
        if (!project) {
            showToast('Projeto não encontrado!', 'error');
            return;
        }

        activeProjectId = project.id;
        ProjectStorage.setActiveId(project.id);
        
        // Preenche o formulário com os dados salvos
        setFormData(project.data);
        
        switchView('editor');
        showToast(`Projeto "${project.nome}" carregado`, 'success');
    }

    function updateActiveProjectHeader() {
        const project = ProjectStorage.getById(activeProjectId);
        if (!project) return;

        activeProjectTitle.textContent = project.nome || 'Projeto Sem Nome';
        
        const pot = project.data?.potenciaSistema || project.data?.potencia || '0';
        activeProjectPowerBadge.textContent = `${pot} kWp`;
        
        const uc = project.data?.uc ? `UC: ${project.data.uc}` : 'UC: Não informada';
        activeProjectUcBadge.textContent = uc;
    }

    // =========================================================================
    // RENDERIZAÇÃO DO DASHBOARD E CARDS DE PROJETOS
    // =========================================================================

    function renderDashboard() {
        const allProjects = ProjectStorage.getAll();
        
        // Atualiza KPIs do topo
        let totalPower = 0;
        allProjects.forEach(p => {
            const pot = parseFloat(p.data?.potenciaSistema || p.data?.potencia || 0);
            if (!isNaN(pot)) totalPower += pot;
        });

        metricTotalProjects.textContent = allProjects.length;
        metricTotalPower.textContent = `${totalPower.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWp`;

        // Filtragem por busca
        const query = searchQuery.trim().toLowerCase();
        const filteredProjects = allProjects.filter(p => {
            if (!query) return true;
            const nome = (p.nome || '').toLowerCase();
            const cliente = (p.data?.clienteNome || '').toLowerCase();
            const cidade = (p.data?.cidade || '').toLowerCase();
            const uc = (p.data?.uc || '').toLowerCase();
            const pot = String(p.data?.potenciaSistema || '').toLowerCase();
            return nome.includes(query) || cliente.includes(query) || cidade.includes(query) || uc.includes(query) || pot.includes(query);
        });

        projectCountBadge.textContent = `${filteredProjects.length} ${filteredProjects.length === 1 ? 'projeto' : 'projetos'}`;

        if (filteredProjects.length === 0) {
            projectsGrid.innerHTML = '';
            emptyProjectsState.style.display = 'block';
            const emptyMsg = document.getElementById('emptyStateMessage');
            if (query) {
                emptyMsg.textContent = `Nenhum projeto corresponde à pesquisa "${searchQuery}". Tente outros termos.`;
            } else {
                emptyMsg.textContent = 'Você ainda não possui projetos salvos. Crie um novo projeto ou importe um backup em JSON para começar.';
            }
            return;
        }

        emptyProjectsState.style.display = 'none';

        projectsGrid.innerHTML = filteredProjects.map(proj => {
            const data = proj.data || {};
            const pot = data.potenciaSistema || data.potencia || '0';
            const cliente = data.clienteNome || 'Cliente não informado';
            const cidadeUf = data.cidade ? `${data.cidade}${data.cidadeDoc ? ' - ' + data.cidadeDoc.split('-')[1]?.trim() : ''}` : 'Endereço não informado';
            const conexao = data.tipoConexao || 'MONOFÁSICA';
            const modQtd = data.moduloQtd || (data.stringsQtd && data.modulosPorString ? data.stringsQtd * data.modulosPorString : '--');
            const invQtd = data.inversorQtd || 1;
            const invMod = data.inversorModelo || 'Inversor';
            const timeAgo = formatRelativeTime(proj.atualizadoEm);

            return `
                <div class="project-card" data-id="${proj.id}">
                    <div class="project-card-header">
                        <div class="project-card-title-box">
                            <h3 class="project-card-title" title="${escapeHTML(proj.nome)}">${escapeHTML(proj.nome)}</h3>
                            <p class="project-card-client" title="${escapeHTML(cliente)}">👤 ${escapeHTML(cliente)}</p>
                        </div>
                        <div class="project-card-power-badge">⚡ ${pot} kWp</div>
                    </div>

                    <div class="project-card-body">
                        <div class="project-card-meta-row">
                            <span class="project-card-meta-label">Unidade Consumidora:</span>
                            <span class="project-card-meta-val">UC ${data.uc || '---'}</span>
                        </div>
                        <div class="project-card-meta-row">
                            <span class="project-card-meta-label">Conexão / Rede:</span>
                            <span class="project-card-meta-val">${conexao}</span>
                        </div>
                        <div class="project-card-meta-row">
                            <span class="project-card-meta-label">Localização:</span>
                            <span class="project-card-meta-val">${escapeHTML(cidadeUf)}</span>
                        </div>
                        <div class="project-card-meta-row">
                            <span class="project-card-meta-label">Equipamentos:</span>
                            <span class="project-card-meta-val">${modQtd} módulos | ${invQtd}x ${escapeHTML(invMod)}</span>
                        </div>
                        <div class="project-card-meta-row" style="margin-top: 0.2rem; font-size: 0.78rem; opacity: 0.85;">
                            <span class="project-card-meta-label">Última edição:</span>
                            <span>${timeAgo}</span>
                        </div>
                    </div>

                    <div class="project-card-footer">
                        <div class="card-actions-left">
                            <button class="btn-card-action" data-action="duplicate" data-id="${proj.id}" title="Duplicar Projeto">📑</button>
                            <button class="btn-card-action" data-action="export" data-id="${proj.id}" title="Exportar JSON">💾</button>
                            <button class="btn-card-action danger" data-action="delete" data-id="${proj.id}" title="Excluir Projeto">🗑️</button>
                        </div>
                        <button class="btn btn-primary btn-card-open" data-action="open" data-id="${proj.id}">
                            Abrir Projeto →
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Event delegation para os botões dos cards
        projectsGrid.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = btn.dataset.id;

                if (action === 'open') {
                    openProject(id);
                } else if (action === 'duplicate') {
                    const copy = ProjectStorage.duplicate(id);
                    if (copy) {
                        renderDashboard();
                        showToast(`Projeto duplicado como "${copy.nome}"`, 'success');
                    }
                } else if (action === 'export') {
                    ProjectStorage.exportProjectJSON(id);
                    showToast('Arquivo JSON gerado e baixado!', 'success');
                } else if (action === 'delete') {
                    const proj = ProjectStorage.getById(id);
                    if (proj) {
                        projectToDeleteId = id;
                        deleteProjectNameTarget.textContent = `"${proj.nome}"`;
                        modalDeleteConfirm.style.display = 'flex';
                    }
                }
            });
        });
    }

    // =========================================================================
    // AUTO-SAVE E GERENCIAMENTO DE FORMULÁRIO
    // =========================================================================

    function handleFormChange() {
        if (!activeProjectId) return;

        // Atualiza status para 'Salvando...'
        autoSaveIndicator.textContent = '● Salvando...';
        autoSaveIndicator.style.color = '#fbbf24';

        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            const currentData = getFormData();
            const project = ProjectStorage.getById(activeProjectId);
            
            if (project) {
                // Atualiza nome padrão se o projeto ainda tiver nome provisório e o cliente for digitado
                let projNome = project.nome;
                if ((!projNome || projNome.startsWith('Novo Projeto')) && currentData.clienteNome) {
                    projNome = `Projeto - ${currentData.clienteNome}`;
                    project.nome = projNome;
                }

                ProjectStorage.save({
                    id: activeProjectId,
                    nome: projNome,
                    data: currentData
                });

                autoSaveIndicator.textContent = '✓ Salvo no navegador';
                autoSaveIndicator.style.color = '#34d399';
                updateActiveProjectHeader();
            }
        }, 400);

        updatePreview();
    }

    if (docForm) {
        docForm.addEventListener('input', handleFormChange);
        docForm.addEventListener('change', handleFormChange);
    }

    // =========================================================================
    // UPLOAD, COMPRESSÃO E GESTÃO DE IMAGENS DO MEMORIAL
    // =========================================================================

    let currentUploadTargetField = null;
    const globalImageFileInput = document.getElementById('globalImageFileInput');

    function openImagePickerForField(fieldName) {
        currentUploadTargetField = fieldName;
        if (globalImageFileInput) {
            globalImageFileInput.value = '';
            globalImageFileInput.click();
        }
    }

    async function processAndSaveImage(file, fieldName) {
        if (!file || !fieldName) return;

        try {
            showToast('Otimizando imagem no navegador...', 'info');
            const compressedBase64 = await compressImage(file, 1280, 1280, 0.78);

            const input = document.getElementById(`input_${fieldName}`) || document.querySelector(`input[name="${fieldName}"]`);
            if (input) {
                input.value = compressedBase64;
            }

            // Atualiza preview no card da aba Imagens
            const currentData = getFormData();
            currentData[fieldName] = compressedBase64;
            updateImageUploadPreviews(currentData);

            // Dispara salvamento no IndexedDB e atualização do documento
            handleFormChange();
            showToast('Imagem otimizada e salva com sucesso!', 'success');
        } catch (err) {
            console.error('Erro ao processar imagem:', err);
            showToast(err.message || 'Erro ao carregar a imagem.', 'error');
        }
    }

    function removeImageField(fieldName) {
        if (!fieldName) return;
        const input = document.getElementById(`input_${fieldName}`) || document.querySelector(`input[name="${fieldName}"]`);
        if (input) {
            input.value = '';
        }

        const currentData = getFormData();
        currentData[fieldName] = null;
        updateImageUploadPreviews(currentData);

        handleFormChange();
        showToast('Imagem removida.', 'info');
    }

    if (globalImageFileInput) {
        globalImageFileInput.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            if (file && currentUploadTargetField) {
                await processAndSaveImage(file, currentUploadTargetField);
            }
        });
    }

    function setupImageUploadHandlers() {
        // Selecionar foto pelo botão da aba
        document.querySelectorAll('.image-upload-card .btn-select-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.image-upload-card');
                const fieldName = card ? card.dataset.field : null;
                if (fieldName) openImagePickerForField(fieldName);
            });
        });

        // Remover foto pelo botão da aba
        document.querySelectorAll('.image-upload-card .btn-remove-image').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.image-upload-card');
                const fieldName = card ? card.dataset.field : null;
                if (fieldName) removeImageField(fieldName);
            });
        });

        // Clique na área de dropzone da aba
        document.querySelectorAll('.image-upload-card .image-card-dropzone').forEach(dropzone => {
            const card = dropzone.closest('.image-upload-card');
            const fieldName = card ? card.dataset.field : null;

            dropzone.addEventListener('click', () => {
                if (fieldName) openImagePickerForField(fieldName);
            });

            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('drag-over');
            });

            dropzone.addEventListener('dragleave', () => {
                dropzone.classList.remove('drag-over');
            });

            dropzone.addEventListener('drop', async (e) => {
                e.preventDefault();
                dropzone.classList.remove('drag-over');
                const file = e.dataTransfer.files && e.dataTransfer.files[0];
                if (file && fieldName) {
                    await processAndSaveImage(file, fieldName);
                }
            });
        });
    }

    // Liga eventos interativos diretamente no corpo do Memorial Descritivo
    window.attachMemorialImageEvents = function () {
        const wrappers = document.querySelectorAll('.memorial-img-wrapper');
        wrappers.forEach(wrapper => {
            const fieldName = wrapper.dataset.field;
            if (!fieldName) return;

            // Clique no placeholder ou imagem
            wrapper.onclick = (e) => {
                if (e.target.closest('.btn-remove-img')) {
                    e.stopPropagation();
                    removeImageField(fieldName);
                    return;
                }
                openImagePickerForField(fieldName);
            };

            // Drag and drop direto sobre o placeholder do Memorial
            wrapper.ondragover = (e) => {
                e.preventDefault();
                wrapper.classList.add('drag-over-memorial');
            };

            wrapper.ondragleave = () => {
                wrapper.classList.remove('drag-over-memorial');
            };

            wrapper.ondrop = async (e) => {
                e.preventDefault();
                wrapper.classList.remove('drag-over-memorial');
                const file = e.dataTransfer.files && e.dataTransfer.files[0];
                if (file) {
                    await processAndSaveImage(file, fieldName);
                }
            };
        });
    };

    // =========================================================================
    // CONTROLE DE PRÉ-VISUALIZAÇÃO E DOCUMENTOS
    // =========================================================================

    function updateActiveDocButtons() {
        if (btnDiagrama) btnDiagrama.className = `btn ${activeDocType === 'diagrama' ? 'btn-primary' : 'btn-secondary'}`;
        if (btnMemorial) btnMemorial.className = `btn ${activeDocType === 'memorial' ? 'btn-primary' : 'btn-secondary'}`;
        if (btnFormulario) btnFormulario.className = `btn ${activeDocType === 'formulario' ? 'btn-primary' : 'btn-secondary'}`;
    }

    function updatePreview() {
        const data = getFormData();
        updateActiveDocButtons();

        if (activeDocType === 'memorial') {
            if (typeof gerarMemorialDescritivo === 'function') {
                renderDocument(gerarMemorialDescritivo(data));
            }
        } else if (activeDocType === 'formulario') {
            if (typeof gerarFormularioAcesso === 'function') {
                renderDocument(gerarFormularioAcesso(data));
            }
        } else {
            // Visão Diagrama Elétrico (Suporta Pranchas 01 a 06)
            let contentHTML = '';

            const navBarHTML = `
                <div class="prancha-selector-bar">
                    <strong style="font-size: 0.85rem; color: #333; margin-right: 0.4rem;">Pranchas do Projeto:</strong>
                    <button class="btn btn-sm ${selectedPrancha === 'all' ? 'btn-primary' : 'btn-secondary'}" data-prancha="all">Ver Todas (1 a 6)</button>
                    <button class="btn btn-sm ${selectedPrancha === '1' ? 'btn-primary' : 'btn-secondary'}" data-prancha="1">01/06 (Unifilar)</button>
                    <button class="btn btn-sm ${selectedPrancha === '2' ? 'btn-primary' : 'btn-secondary'}" data-prancha="2">02/06 (Situação)</button>
                    <button class="btn btn-sm ${selectedPrancha === '3' ? 'btn-primary' : 'btn-secondary'}" data-prancha="3">03/06 (Fixação)</button>
                    <button class="btn btn-sm ${selectedPrancha === '4' ? 'btn-primary' : 'btn-secondary'}" data-prancha="4">04/06 (Inversor)</button>
                    <button class="btn btn-sm ${selectedPrancha === '5' ? 'btn-primary' : 'btn-secondary'}" data-prancha="5">05/06 (Strings)</button>
                    <button class="btn btn-sm ${selectedPrancha === '6' ? 'btn-primary' : 'btn-secondary'}" data-prancha="6">06/06 (Multifilar QSS)</button>
                </div>
            `;

            if (selectedPrancha === '1' && typeof gerarPrancha1 === 'function') {
                contentHTML = gerarPrancha1(data);
            } else if (selectedPrancha === '2' && typeof gerarPrancha2 === 'function') {
                contentHTML = gerarPrancha2(data);
            } else if (selectedPrancha === '3' && typeof gerarPrancha3 === 'function') {
                contentHTML = gerarPrancha3(data);
            } else if (selectedPrancha === '4' && typeof gerarPrancha4 === 'function') {
                contentHTML = gerarPrancha4(data);
            } else if (selectedPrancha === '5' && typeof gerarPrancha5 === 'function') {
                contentHTML = gerarPrancha5(data);
            } else if (selectedPrancha === '6' && typeof gerarPrancha6 === 'function') {
                contentHTML = gerarPrancha6(data);
            } else if (typeof gerarTodasPranchas === 'function') {
                contentHTML = gerarTodasPranchas(data);
            } else if (typeof gerarDiagramaUnifilar === 'function') {
                contentHTML = gerarDiagramaUnifilar(data);
            } else {
                contentHTML = '<p class="empty-state">Função de geração do diagrama não encontrada.</p>';
            }

            renderDocument(navBarHTML + contentHTML);

            // Listeners para a barra de pranchas
            const pranchaBtns = document.querySelectorAll('.prancha-selector-bar button');
            pranchaBtns.forEach(b => {
                b.addEventListener('click', (e) => {
                    selectedPrancha = e.target.dataset.prancha;
                    updatePreview();
                });
            });
        }
    }

    // Botões seletores de documento
    if (btnDiagrama) {
        btnDiagrama.addEventListener('click', () => {
            activeDocType = 'diagrama';
            updatePreview();
        });
    }

    if (btnMemorial) {
        btnMemorial.addEventListener('click', () => {
            activeDocType = 'memorial';
            updatePreview();
        });
    }

    if (btnFormulario) {
        btnFormulario.addEventListener('click', () => {
            activeDocType = 'formulario';
            updatePreview();
        });
    }

    // =========================================================================
    // MODAIS: CRIAR / RENOMEAR / EXCLUIR
    // =========================================================================

    function openProjectNameModal(mode = 'create') {
        modalMode = mode;
        if (mode === 'create') {
            modalProjectNameTitle.textContent = 'Novo Projeto Solar';
            projectNameInput.value = '';
            projectNameInput.placeholder = 'Ex: Residência Sr. Carlos - 8.5 kWp';
            btnConfirmProjectName.textContent = 'Criar e Abrir';
        } else {
            const project = ProjectStorage.getById(activeProjectId);
            modalProjectNameTitle.textContent = 'Renomear Projeto';
            projectNameInput.value = project ? project.nome : '';
            btnConfirmProjectName.textContent = 'Salvar Nome';
        }
        modalProjectName.style.display = 'flex';
        setTimeout(() => projectNameInput.focus(), 50);
    }

    function closeProjectNameModal() {
        modalProjectName.style.display = 'none';
    }

    if (btnNewProject) btnNewProject.addEventListener('click', () => openProjectNameModal('create'));
    if (btnEmptyNewProject) btnEmptyNewProject.addEventListener('click', () => openProjectNameModal('create'));
    if (btnRenameProject) btnRenameProject.addEventListener('click', () => openProjectNameModal('rename'));
    if (btnCloseProjectNameModal) btnCloseProjectNameModal.addEventListener('click', closeProjectNameModal);
    if (btnCancelProjectName) btnCancelProjectName.addEventListener('click', closeProjectNameModal);

    if (btnConfirmProjectName) {
        btnConfirmProjectName.addEventListener('click', () => {
            const name = projectNameInput.value.trim();
            if (modalMode === 'create') {
                const newProject = ProjectStorage.create(name || 'Novo Projeto Solar');
                closeProjectNameModal();
                openProject(newProject.id);
                showToast('Novo projeto criado!', 'success');
            } else {
                if (activeProjectId && name) {
                    const project = ProjectStorage.getById(activeProjectId);
                    if (project) {
                        project.nome = name;
                        ProjectStorage.save(project);
                        updateActiveProjectHeader();
                        showToast('Nome do projeto atualizado!', 'success');
                    }
                }
                closeProjectNameModal();
            }
        });
    }

    if (projectNameInput) {
        projectNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                btnConfirmProjectName.click();
            } else if (e.key === 'Escape') {
                closeProjectNameModal();
            }
        });
    }

    // Modal de Exclusão
    function closeDeleteModal() {
        modalDeleteConfirm.style.display = 'none';
        projectToDeleteId = null;
    }

    if (btnCloseDeleteModal) btnCloseDeleteModal.addEventListener('click', closeDeleteModal);
    if (btnCancelDelete) btnCancelDelete.addEventListener('click', closeDeleteModal);

    if (btnConfirmDelete) {
        btnConfirmDelete.addEventListener('click', () => {
            if (projectToDeleteId) {
                ProjectStorage.delete(projectToDeleteId);
                closeDeleteModal();
                renderDashboard();
                showToast('Projeto excluído com sucesso.', 'success');
            }
        });
    }

    // =========================================================================
    // IMPORTAÇÃO E EXPORTAÇÃO JSON
    // =========================================================================

    if (btnImportJson && importFileInput) {
        btnImportJson.addEventListener('click', () => {
            importFileInput.value = '';
            importFileInput.click();
        });

        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (evt) => {
                const content = evt.target.result;
                const res = ProjectStorage.importFromJSON(content);
                if (res.success) {
                    renderDashboard();
                    showToast(`Importação concluída! ${res.count} projeto(s) adicionado(s).`, 'success');
                } else {
                    showToast(res.message || 'Falha ao importar arquivo JSON.', 'error');
                }
            };
            reader.readAsText(file);
        });
    }

    if (btnExportAll) {
        btnExportAll.addEventListener('click', () => {
            ProjectStorage.exportAllBackup();
            showToast('Backup completo de projetos baixado com sucesso!', 'success');
        });
    }

    function triggerDocumentPrint() {
        const project = ProjectStorage.getById(activeProjectId);
        const projName = project ? (project.nome || 'Projeto_Solar') : 'Projeto_Solar';
        
        let docName = 'Diagrama_Unifilar';
        if (activeDocType === 'memorial') docName = 'Memorial_Descritivo';
        if (activeDocType === 'formulario') docName = 'Formulario_Acesso_Enel';

        const originalTitle = document.title;
        const printTitle = `${projName} - ${docName}`.replace(/[/\\?%*:|"<>]/g, '_');
        document.title = printTitle;

        window.print();

        setTimeout(() => {
            document.title = originalTitle;
        }, 1200);
    }

    async function exportDirectPDF() {
        const project = ProjectStorage.getById(activeProjectId);
        const projName = project ? (project.nome || 'Projeto_Solar') : 'Projeto_Solar';
        
        let docName = 'Diagrama_Unifilar';
        let isLandscape = false;
        
        if (activeDocType === 'memorial') {
            docName = 'Memorial_Descritivo';
            isLandscape = false;
        } else if (activeDocType === 'formulario') {
            docName = 'Formulario_Acesso_Enel';
            isLandscape = false;
        } else {
            docName = 'Diagrama_Unifilar';
            isLandscape = false; // Vertical (Retrato A4)
        }

        const filename = `${projName} - ${docName}.pdf`.replace(/[/\\?%*:|"<>]/g, '_');
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) return;

        // Identifica as páginas a serem renderizadas de forma individual
        let pagesToRender = [];
        if (activeDocType === 'memorial') {
            pagesToRender = Array.from(previewContainer.querySelectorAll('.doc-page.memorial-page'));
        } else if (activeDocType === 'formulario') {
            const formPage = previewContainer.querySelector('.doc-page.form-ugd-page');
            if (formPage) pagesToRender = [formPage];
        } else {
            pagesToRender = Array.from(previewContainer.querySelectorAll('.diagrama-container'));
        }

        if (pagesToRender.length === 0) {
            showToast('Nenhum documento encontrado para exportar.', 'error');
            return;
        }

        // Verifica disponibilidade do jsPDF e html2canvas
        const hasJsPDF = window.jspdf && window.jspdf.jsPDF;
        const hasHtml2Canvas = typeof window.html2canvas === 'function';

        if (!hasJsPDF || !hasHtml2Canvas) {
            triggerDocumentPrint();
            return;
        }

        showToast(`Gerando PDF "${filename}"... Aguarde.`, 'info');
        
        if (btnSavePdfDocument) {
            btnSavePdfDocument.disabled = true;
            btnSavePdfDocument.innerHTML = '<span class="btn-icon">⏳</span> Gerando...';
        }

        // Ativa o modo de exportação limpo no container
        previewContainer.classList.add('exporting-pdf');

        try {
            const { jsPDF } = window.jspdf;
            const orientation = isLandscape ? 'landscape' : 'portrait';
            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const targetWidthMm = isLandscape ? 297 : 210;
            const targetHeightMm = isLandscape ? 210 : 297;

            // Função auxiliar: renderiza SVG diretamente para canvas (mais confiável que html2canvas)
            function svgToCanvas(svgElement, scale) {
                return new Promise((resolve, reject) => {
                    try {
                        const svgClone = svgElement.cloneNode(true);
                        // Garante que o SVG tenha dimensões explícitas
                        const viewBox = svgClone.getAttribute('viewBox');
                        let svgW = parseFloat(svgClone.getAttribute('width')) || 1080;
                        let svgH = parseFloat(svgClone.getAttribute('height')) || 900;
                        if (viewBox && (!svgClone.getAttribute('width') || !svgClone.getAttribute('height'))) {
                            const parts = viewBox.split(/[\s,]+/);
                            svgW = parseFloat(parts[2]) || svgW;
                            svgH = parseFloat(parts[3]) || svgH;
                        }
                        svgClone.setAttribute('width', svgW);
                        svgClone.setAttribute('height', svgH);
                        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                        svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

                        // Incorpora estilos computados inline para garantir renderização fiel
                        const allElems = svgClone.querySelectorAll('*');
                        const originalElems = svgElement.querySelectorAll('*');
                        allElems.forEach((el, idx) => {
                            if (originalElems[idx]) {
                                const cs = window.getComputedStyle(originalElems[idx]);
                                if (cs.fontFamily) el.style.fontFamily = cs.fontFamily;
                                if (cs.fontSize) el.style.fontSize = cs.fontSize;
                                if (cs.fontWeight) el.style.fontWeight = cs.fontWeight;
                            }
                        });

                        const serializer = new XMLSerializer();
                        let svgString = serializer.serializeToString(svgClone);

                        // Corrige problemas comuns de serialização
                        if (!svgString.match(/xmlns=\"/)) {
                            svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                        }

                        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = svgW * scale;
                            canvas.height = svgH * scale;
                            const ctx = canvas.getContext('2d');
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            URL.revokeObjectURL(url);
                            resolve(canvas);
                        };
                        img.onerror = (err) => {
                            URL.revokeObjectURL(url);
                            reject(err);
                        };
                        img.src = url;
                    } catch (e) {
                        reject(e);
                    }
                });
            }

            for (let i = 0; i < pagesToRender.length; i++) {
                const pageElem = pagesToRender[i];

                if (pagesToRender.length > 1 && btnSavePdfDocument) {
                    btnSavePdfDocument.innerHTML = `<span class="btn-icon">⏳</span> Pág. ${i + 1}/${pagesToRender.length}...`;
                }

                // Rola para a página/prancha atual e aguarda renderização completa
                try {
                    pageElem.scrollIntoView({ block: 'start', inline: 'nearest' });
                } catch(e) {}
                await new Promise(r => setTimeout(r, 200));

                let canvas;
                const svgElem = pageElem.querySelector('svg.diagrama-svg');

                if (svgElem && activeDocType === 'diagrama') {
                    // Para diagramas SVG: serialização nativa (muito mais confiável)
                    try {
                        canvas = await svgToCanvas(svgElem, 3);
                    } catch(svgErr) {
                        console.warn('SVG nativo falhou, usando html2canvas como fallback:', svgErr);
                        canvas = await html2canvas(pageElem, {
                            scale: 2, useCORS: true, allowTaint: true,
                            logging: false, backgroundColor: '#ffffff',
                            scrollX: 0, scrollY: 0
                        });
                    }
                } else {
                    // Para páginas não-SVG (memorial, formulário): html2canvas
                    canvas = await html2canvas(pageElem, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        logging: false,
                        backgroundColor: '#ffffff',
                        scrollX: 0,
                        scrollY: 0
                    });
                }

                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                const imgRatio = canvas.width / canvas.height;
                const marginMm = (activeDocType === 'diagrama') ? 12 : 0;
                const usableWidthMm = targetWidthMm - (marginMm * 2);
                const usableHeightMm = targetHeightMm - (marginMm * 2);

                let renderWidth = usableWidthMm;
                let renderHeight = usableHeightMm;
                let offsetX = marginMm;
                let offsetY = marginMm;

                if (Math.abs(imgRatio - (usableWidthMm / usableHeightMm)) > 0.02) {
                    if (imgRatio > (usableWidthMm / usableHeightMm)) {
                        renderWidth = usableWidthMm;
                        renderHeight = usableWidthMm / imgRatio;
                        offsetX = (targetWidthMm - renderWidth) / 2;
                        offsetY = (targetHeightMm - renderHeight) / 2;
                    } else {
                        renderHeight = usableHeightMm;
                        renderWidth = usableHeightMm * imgRatio;
                        offsetX = (targetWidthMm - renderWidth) / 2;
                        offsetY = (targetHeightMm - renderHeight) / 2;
                    }
                } else {
                    offsetX = (targetWidthMm - renderWidth) / 2;
                    offsetY = (targetHeightMm - renderHeight) / 2;
                }

                if (i > 0) {
                    pdf.addPage('a4', orientation);
                }

                pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');
            }

            pdf.save(filename);
            showToast(`Arquivo "${filename}" baixado com sucesso!`, 'success');
        } catch (err) {
            console.error('Erro ao gerar PDF página a página:', err);
            showToast('Falha na geração direta. Abrindo janela de impressão...', 'error');
            triggerDocumentPrint();
        } finally {
            previewContainer.classList.remove('exporting-pdf');
            try { window.scrollTo(0, 0); } catch(e) {}
            if (btnSavePdfDocument) {
                btnSavePdfDocument.disabled = false;
                btnSavePdfDocument.innerHTML = '<span class="btn-icon">📄</span> Salvar PDF';
            }
        }
    }

    if (btnPrintDocument) {
        btnPrintDocument.addEventListener('click', () => {
            triggerDocumentPrint();
        });
    }

    /*
    if (btnSavePdfDocument) {
        btnSavePdfDocument.addEventListener('click', () => {
            exportDirectPDF();
        });
    }
    */

    if (btnBackToDashboard) {
        btnBackToDashboard.addEventListener('click', () => {
            switchView('dashboard');
        });
    }

    // Busca em tempo real
    if (searchProjectsInput) {
        searchProjectsInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderDashboard();
        });
    }

    // =========================================================================
    // HELPERS: TOAST NOTIFICATIONS & ESCAPE
    // =========================================================================

    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';

        toast.innerHTML = `<span>${icon}</span> <span>${escapeHTML(message)}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }

    function escapeHTML(str) {
        if (str === undefined || str === null) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Inicialização da Aplicação
    setupTabs();
    setupImageUploadHandlers();
    
    // Inicializa o armazenamento IndexedDB e atualiza a interface
    if (typeof ProjectStorage.init === 'function') {
        ProjectStorage.init().then(() => {
            renderDashboard();
            if (activeProjectId) {
                const proj = ProjectStorage.getById(activeProjectId);
                if (proj) updateImageUploadPreviews(proj.data);
            }
        });
    }

    // Inicia no Dashboard de Projetos
    switchView('dashboard');
});
