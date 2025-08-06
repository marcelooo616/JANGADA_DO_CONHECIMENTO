document.addEventListener('DOMContentLoaded', () => {
    
    const mainContent = document.getElementById('main-content');
    const navContainer = document.querySelector('.header-nav');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // --- BANCO DE DADOS ---
    // Os dados agora serão carregados dos arquivos JSON
    let allArticles = [];
    let allUsers = [];

    /**
     * Carrega os dados dos arquivos JSON do banco de dados.
     */
    const fetchData = async () => {
        try {
            // Carrega os dois arquivos em paralelo para mais eficiência
            const [knowledgeResponse, usersResponse] = await Promise.all([
                fetch('db/knowledge.json'),
                fetch('db/users.json')
            ]);

            if (!knowledgeResponse.ok || !usersResponse.ok) {
                throw new Error('Falha ao carregar os arquivos do banco de dados.');
            }

            allArticles = await knowledgeResponse.json();
            allUsers = await usersResponse.json();

        } catch (error) {
            console.error('Erro ao carregar os dados:', error);
            mainContent.innerHTML = '<p>Falha ao carregar a base de conhecimento. Verifique o console para mais detalhes.</p>';
        }
    };

    // --- LÓGICA DE RENDERIZAÇÃO E NAVEGAÇÃO ---

    const loadPageStyles = (pageName) => {
        const oldStyle = document.getElementById('page-specific-style');
        if (oldStyle) oldStyle.remove();

        const newStyle = document.createElement('link');
        newStyle.id = 'page-specific-style';
        newStyle.rel = 'stylesheet';
        newStyle.href = `pages/${pageName}.css`;
        document.head.appendChild(newStyle);
        newStyle.onerror = () => newStyle.remove();
    };

    const renderPage = async (pageName, id = null) => {
        loadPageStyles(pageName);
        try {
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) throw new Error(`Página não encontrada: ${pageName}`);
            mainContent.innerHTML = await response.text();

            if (pageName === 'knowledge') setupKnowledgePage();
            if (pageName === 'article') setupArticlePage(id);
            if (pageName === 'editor') setupEditorPage(id);
        } catch (error) {
            console.error('Erro ao renderizar a página:', error);
            mainContent.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
        }
    };

    // --- LÓGICA DE SETUP DE CADA PÁGINA ---

    const setupKnowledgePage = () => {
        const listContainer = document.querySelector('.article-grid');
        const sidebarNav = document.querySelector('.sidebar-nav');
        const tagCloud = document.querySelector('.tag-cloud');

        if (!listContainer || !sidebarNav || !tagCloud) return;

        // 1. Renderiza os artigos
        listContainer.innerHTML = '';
        if (allArticles.length === 0) {
            listContainer.innerHTML = '<p>Nenhum artigo encontrado.</p>';
        } else {
            allArticles.forEach(article => {
                const author = allUsers.find(user => user.id === article.authorId) || { name: 'Desconhecido' };
                const articleDate = new Date(article.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

                const card = document.createElement('div');
                card.className = 'article-card';
                card.dataset.id = article.id;
                card.innerHTML = `
                    <div class="card-content">
                        <div class="card-tags">
                            ${article.tags.slice(0, 2).map(tag => `<span class="tag small">${tag}</span>`).join('')}
                        </div>
                        <h2 class="card-title">${article.title}</h2>
                        <p class="card-description">${article.description}</p>
                    </div>
                    <div class="card-footer">
                        <span class="card-author">Por ${author.name}</span>
                        <span class="card-date">${articleDate}</span>
                    </div>
                `;
                listContainer.appendChild(card);
            });
        }

        // 2. Renderiza as categorias dinamicamente
        const categories = ['Todos os Artigos', ...new Set(allArticles.map(a => a.category))];
        sidebarNav.innerHTML = categories.map(cat => 
            `<a href="#" class="sidebar-link ${cat === 'Todos os Artigos' ? 'active' : ''}" data-category="${cat}">${cat}</a>`
        ).join('');

        // 3. Renderiza as tags mais populares
        const tagCounts = allArticles.flatMap(a => a.tags).reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {});
        const popularTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(entry => entry[0]);
        tagCloud.innerHTML = popularTags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('');
    };
    
    const setupArticlePage = (id) => {
        const article = allArticles.find(a => a.id === id);
        if (!article) { renderPage('knowledge'); return; }
        const author = allUsers.find(u => u.id === article.authorId) || { name: 'Desconhecido' };
        document.querySelector('.article-title').textContent = article.title;
        document.querySelector('.article-meta').innerHTML = `<span>Por ${author.name}</span> | <span>Categoria: ${article.category}</span>`;
        document.querySelector('.article-body').innerHTML = article.content;
    };

    const setupEditorPage = (id = null) => {
        const titleInput = document.getElementById('editor-article-title');
        const contentEditor = document.getElementById('editor-article-content');
        const idInput = document.getElementById('editor-article-id');
        const pageTitle = document.querySelector('.editor-page-title');
        const descInput = document.getElementById('editor-article-desc');
        const categoryInput = document.getElementById('editor-article-category');
        const tagsInput = document.getElementById('editor-article-tags');

        if (id) {
            const article = allArticles.find(a => a.id === id);
            pageTitle.textContent = 'Editar Artigo';
            titleInput.value = article.title;
            contentEditor.innerHTML = article.content;
            idInput.value = article.id;
            descInput.value = article.description;
            categoryInput.value = article.category;
            tagsInput.value = article.tags.join(', ');
        } else {
            pageTitle.textContent = 'Novo Artigo';
        }
    };

    // --- FUNÇÕES DE AÇÃO ---

    const saveArticle = () => {
        const id = document.getElementById('editor-article-id').value;
        const title = document.getElementById('editor-article-title').value.trim();
        const description = document.getElementById('editor-article-desc').value.trim();
        const category = document.getElementById('editor-article-category').value.trim();
        const tags = document.getElementById('editor-article-tags').value.split(',').map(t => t.trim()).filter(Boolean);
        const content = document.getElementById('editor-article-content').innerHTML;

        if (!title) {
            alert('O título é obrigatório.');
            return;
        }

        if (id) { // Editando
            const index = allArticles.findIndex(a => a.id === id);
            allArticles[index] = { ...allArticles[index], title, description, category, tags, content, lastUpdatedAt: new Date().toISOString() };
        } else { // Criando
            const newId = `knw_${Date.now()}`;
            allArticles.push({ id: newId, title, description, category, tags, content, authorId: 101, createdAt: new Date().toISOString(), lastUpdatedAt: new Date().toISOString() });
        }
        
        // Em uma aplicação real, aqui você enviaria os dados atualizados para o backend para salvar o arquivo JSON.
        console.log("Dados atualizados (simulação):", allArticles);
        alert('Artigo salvo com sucesso! (Verifique o console)');
        renderPage('knowledge');
    };

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // --- EVENT LISTENERS GLOBAIS ---
    
    mainContent.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const articleId = e.target.closest('.article-card')?.dataset.id;

        if (action === 'new-article') renderPage('editor');
        if (action === 'go-back') renderPage('knowledge');
        if (action === 'save-article') saveArticle();
        if (articleId) renderPage('article', articleId);

        if (action === 'add-image') document.getElementById('image-upload-input').click();
        if (action === 'add-code') document.execCommand('insertHTML', false, '<pre><code>Seu código aqui...</code></pre>');
    });
    
    mainContent.addEventListener('change', async (e) => {
        if (e.target.id === 'image-upload-input') {
            const file = e.target.files[0];
            if (file) {
                const base64 = await toBase64(file);
                document.execCommand('insertHTML', false, `<img src="${base64}" alt="Imagem do artigo">`);
            }
        }
        if (e.target.id === 'format-block-select') {
            document.execCommand('formatBlock', false, `<${e.target.value}>`);
        }
    });

    navContainer.addEventListener('click', (e) => {
        e.preventDefault();
        const clickedLink = e.target.closest('.nav-link');
        if (!clickedLink) return;
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
        renderPage(clickedLink.dataset.page);
    });
    
    // Lógica do Dark Mode
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        sunIcon.classList.toggle('hidden', theme === 'dark');
        moonIcon.classList.toggle('hidden', theme === 'light');
    };
    themeToggleBtn.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // --- INICIALIZAÇÃO ---
    const init = async () => {
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        applyTheme(savedTheme);
        
        await fetchData(); // Carrega os dados dos arquivos JSON primeiro
        renderPage('knowledge'); // Renderiza a página inicial com os dados carregados
    };

    init();
});
