/**
 * Converte um ficheiro de imagem para o formato Base64.
 * @param {File} file - O ficheiro a ser convertido.
 * @returns {Promise<string>} Uma promessa que resolve com a string Base64 da imagem.
 */


const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// --- Funções Auxiliares do Editor (Sem execCommand) ---

/**
 * Aplica formatação de linha (inline) ao texto selecionado, como negrito ou itálico.
 * @param {string} tag - A tag HTML a ser aplicada (ex: 'strong', 'em').
 */
const applyInlineFormat = (tag) => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.extractContents();
    const formatElement = document.createElement(tag);
    formatElement.appendChild(selectedText);
    range.insertNode(formatElement);

    // Reposiciona o cursor
    selection.removeAllRanges();
    selection.addRange(range);
};


/**
 * Transforma o bloco de texto atual (ex: <p>) em outro tipo de bloco (ex: <h2>).
 * @param {string} tag - A nova tag do bloco (ex: 'h1', 'p', 'blockquote').
 */
const formatBlock = (tag) => {
    document.execCommand('formatBlock', false, tag); // execCommand é aceitável para formatBlock, pois é bem suportado.
};

// --- Lógica Principal da Página do Editor ---

/**
 * Preenche os campos do formulário do editor.
 * @param {string|null} id - O ID do artigo a ser editado.
 * @param {Array} allArticles - A lista completa de artigos.
 */
export const setupEditorPage = (id, allArticles) => {
    const titleInput = document.getElementById('editor-article-title');
    const contentEditor = document.getElementById('editor-article-content');
    const idInput = document.getElementById('editor-article-id');
    const pageTitle = document.querySelector('.editor-page-title');
    const descInput = document.getElementById('editor-article-desc');
    const categoryInput = document.getElementById('editor-article-category');
    const tagsInput = document.getElementById('editor-article-tags');
    const statusMessage = document.getElementById('editor-status-message');

    statusMessage.textContent = ''; // Limpa status
    if (id) {
        const article = allArticles.find(a => a.id === id);
        if (article) {
            pageTitle.textContent = 'Editar Artigo';
            titleInput.value = article.title;
            contentEditor.innerHTML = article.content;
            idInput.value = article.id;
            descInput.value = article.description;
            categoryInput.value = article.category;
            tagsInput.value = article.tags.join(', ');
        }
    } else {
        pageTitle.textContent = 'Novo Artigo';
        titleInput.value = '';
        contentEditor.innerHTML = '<p>Comece a escrever aqui...</p>'; // Conteúdo inicial
        idInput.value = '';
        descInput.value = '';
        categoryInput.value = '';
        tagsInput.value = '';
    }
};

/**
 * Lê os dados do formulário, valida e atualiza a lista de artigos.
 * @param {Array} allArticles - A lista completa de artigos.
 * @returns {boolean} Retorna true se o artigo foi salvo com sucesso.
 */
/**
 * Envia os dados do artigo para o back-end para serem salvos.
 * @returns {Promise<boolean>} Retorna true se o artigo foi salvo com sucesso.
 */
// No seu JavaScript do Front-End

// Suponha que você tem um <input type="file" id="cover-image-input"> para a imagem de capa

// editor.js

export const saveArticle = async () => {
    // 1. Coleta os dados do formulário
    const id = document.getElementById('editor-article-id').value;
    const title = document.getElementById('editor-article-title').value.trim();
    const description = document.getElementById('editor-article-desc').value.trim();
    const category = document.getElementById('editor-article-category').value.trim();
    const tags = document.getElementById('editor-article-tags').value.split(',').map(t => t.trim()).filter(Boolean);
    const content = document.getElementById('editor-article-content').innerHTML;

    if (!title) {
        alert('O título é obrigatório.');
        return false;
    }

    // 2. Monta um OBJETO JAVASCRIPT simples
    const articleData = {
        id: id || null,
        title,
        description,
        category,
        tags,
        content,
    };

    try {
        // 3. Envia este objeto como uma STRING JSON
        const response = await fetch('/api/save-article', {
            method: 'POST',
            headers: {
                // O header DEVE ser 'application/json'
                'Content-Type': 'application/json',
            },
            // O corpo DEVE ser o objeto stringificado
            body: JSON.stringify(articleData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Falha ao salvar o artigo.');
        }

        const result = await response.json();
        alert(result.message);
        return true;

    } catch (error) {
        console.error('Erro ao salvar artigo:', error);
        alert(`Erro ao salvar artigo: ${error.message}`);
        return false;
    }
};

/**
 * Adiciona os event listeners para os controles do editor.
 */
// editor.js


export const addEditorEventListeners = () => {
    const mainContent = document.getElementById('main-content');
    const imageUploadInput = document.getElementById('image-upload-input');
    const LOADING_SPINNER_SRC = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid' width='200' height='200' style='shape-rendering: auto; display: block; background: transparent;' xmlns:xlink='http://www.w3.org/1999/xlink'%3e%3cg%3e%3ccircle cx='50' cy='50' r='32' stroke-width='8' stroke='%233498db' stroke-dasharray='50.26548245743669 50.26548245743669' fill='none' stroke-linecap='round'%3e%3canimateTransform attributeName='transform' type='rotate' dur='1s' repeatCount='indefinite' keyTimes='0;1' values='0 50 50;360 50 50'%3e%3c/animateTransform%3e%3c/circle%3e%3cg%3e%3c/g%3e%3c/g%3e%3c!-- [ldio] generated by https://loading.io/ --%3e";

    mainContent.addEventListener('click', (e) => {
        const action = e.target.dataset.action || e.target.parentElement.dataset.action;
        if (!action) return;

        switch (action) {
            case 'save-article':
                saveArticle();
                break;
            case 'cancel-edit':
                const userConfirmed = confirm('Você tem certeza que deseja cancelar? Todas as alterações não salvas serão perdidas.');
                if (userConfirmed) {
                    window.location.href = '/'; // Redireciona para a página inicial
                }
                break;
            case 'insert-image':
                imageUploadInput.click();
                break;
            // Adicione outros casos para 'bold', 'italic', etc. se necessário
        }
    });

    

   imageUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const placeholderId = `img-placeholder-${Date.now()}`;
        document.execCommand('insertHTML', false, `<img id="${placeholderId}" src="${LOADING_SPINNER_SRC}" alt="Carregando imagem..." style="width: 50px; height: 50px;">`);
        e.target.value = '';

        const formData = new FormData();
        formData.append('inline_image', file);

        try {
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Falha no upload da imagem.');

            const result = await response.json();
            const placeholderImg = document.getElementById(placeholderId);
            if (placeholderImg) {
                placeholderImg.src = result.imageUrl;
                placeholderImg.alt = "Imagem do artigo";
                placeholderImg.removeAttribute('id');
                placeholderImg.removeAttribute('style');
            }
        } catch (error) {
            console.error('Erro ao fazer upload da imagem:', error);
            const placeholderImg = document.getElementById(placeholderId);
            if (placeholderImg) placeholderImg.remove();
            alert('Não foi possível carregar a imagem.');
        }
    });

    // ... listener do select de formato
    mainContent.addEventListener('change', (e) => {
        const action = e.target.dataset.action;
        if (action === 'format-block') {
            document.execCommand('formatBlock', false, e.target.value);
        }
    });
};

