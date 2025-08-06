// Variáveis para guardar referências aos dados globais
let articles = [];
let users = [];

/**
 * Renderiza a grelha de artigos com base numa lista filtrada.
 * @param {Array} articlesToRender - A lista de artigos a ser exibida.
 */
const renderArticleGrid = (articlesToRender) => {
    const listContainer = document.querySelector('.article-grid');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    if (articlesToRender.length === 0) {
        listContainer.innerHTML = '<p>Nenhum artigo encontrado com os filtros atuais.</p>';
        return;
    }

    articlesToRender.forEach(article => {
        const author = users.find(user => user.id === article.authorId) || { name: 'Desconhecido' };
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
};

/**
 * Aplica todos os filtros (categoria, pesquisa) e renderiza a lista de artigos.
 */
const applyFilters = () => {
    const searchTerm = document.querySelector('.search-input')?.value.toLowerCase() || '';
    const activeCategoryLink = document.querySelector('.sidebar-link.active');
    const activeCategory = activeCategoryLink ? activeCategoryLink.dataset.category : 'Todos os Artigos';

    let filteredArticles = articles;

    // 1. Filtrar por categoria
    if (activeCategory && activeCategory !== 'Todos os Artigos') {
        filteredArticles = filteredArticles.filter(article => article.category === activeCategory);
    }

    // 2. Filtrar por termo de busca
    if (searchTerm) {
        filteredArticles = filteredArticles.filter(article => 
            article.title.toLowerCase().includes(searchTerm) ||
            article.description.toLowerCase().includes(searchTerm) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    renderArticleGrid(filteredArticles);
};

/**
 * Inicializa a página Knowledge, renderizando a sidebar, os artigos e adicionando os listeners de filtro.
 * @param {Array} allArticles - A lista completa de artigos da aplicação.
 * @param {Array} allUsers - A lista completa de utilizadores da aplicação.
 */
export const initKnowledgePage = (allArticles, allUsers) => {
    articles = allArticles;
    users = allUsers;

    const sidebarNav = document.querySelector('.sidebar-nav');
    const tagCloud = document.querySelector('.tag-cloud');
    const searchInput = document.querySelector('.search-input');

    if (!sidebarNav || !tagCloud || !searchInput) return;

    // Renderiza a sidebar
    const categories = ['Todos os Artigos', ...new Set(articles.map(a => a.category))];
    sidebarNav.innerHTML = categories.map(cat => 
        `<a href="#" class="sidebar-link ${cat === 'Todos os Artigos' ? 'active' : ''}" data-category="${cat}">${cat}</a>`
    ).join('');

    const tagCounts = articles.flatMap(a => a.tags).reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {});
    const popularTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(entry => entry[0]);
    tagCloud.innerHTML = popularTags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('');

    // Renderiza os artigos iniciais
    applyFilters();

    // Adiciona os event listeners para os filtros
    searchInput.addEventListener('input', applyFilters);

    sidebarNav.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('.sidebar-link');
        if (target) {
            document.querySelectorAll('.sidebar-link').forEach(link => link.classList.remove('active'));
            target.classList.add('active');
            applyFilters();
        }
    });
    
    tagCloud.addEventListener('click', (e) => {
        const target = e.target.closest('.tag');
        if (target) {
            searchInput.value = target.dataset.tag;
            applyFilters();
        }
    });
};
