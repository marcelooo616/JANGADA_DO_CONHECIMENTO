
import { setupEditorPage, saveArticle, addEditorEventListeners } from '../js/editor.js';
// MUDANÇA AQUI: Importa a nova função do módulo knowledge.
import { initKnowledgePage } from '../js/knowledge.js';

// Elementos principais da UI
const mainContent = document.getElementById('main-content');
const navContainer = document.querySelector('.header-nav');

// Variáveis de estado da aplicação
let allArticles = [];
let allUsers = [];

// --- LÓGICA DE RENDERIZAÇÃO ---

const renderPage = async (pageName, id = null) => {
    try {
        const [htmlResponse, cssResponse] = await Promise.all([
            fetch(`pages/${pageName}.html`),
            fetch(`pages/${pageName}.css`).catch(() => null)
        ]);

        if (!htmlResponse.ok) throw new Error(`Página não encontrada: ${pageName}.html`);

        const htmlContent = await htmlResponse.text();
        const cssContent = cssResponse && cssResponse.ok ? await cssResponse.text() : '';

        let styleTag = document.getElementById('page-specific-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'page-specific-style';
            document.head.appendChild(styleTag);
        }
        styleTag.textContent = cssContent;
        mainContent.innerHTML = htmlContent;

        // MUDANÇA AQUI: A lógica de setup da página knowledge foi substituída por uma única chamada.
        if (pageName === 'knowledge') initKnowledgePage(allArticles, allUsers);
        if (pageName === 'article') setupArticlePage(id);
        if (pageName === 'editor') {
            setupEditorPage(id, allArticles);
            addEditorEventListeners();
        }

    } catch (error){        console.error('Erro ao renderizar a página:', error);
        mainContent.innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
    }
};

// --- LÓGICA DE SETUP DE PÁGINAS (EXCETO KNOWLEDGE E EDITOR) ---

const setupArticlePage = (id) => {
    const article = allArticles.find(a => a.id === id);
    if (!article) { renderPage('knowledge'); return; }
    const author = allUsers.find(u => u.id === article.authorId) || { name: 'Desconhecido' };
    document.querySelector('.article-title').textContent = article.title;
    document.querySelector('.article-meta').innerHTML = `<span>Por ${author.name}</span> | <span>Categoria: ${article.category}</span>`;
    document.querySelector('.article-body').innerHTML = article.content;
};

// --- INICIALIZAÇÃO DA APLICAÇÃO ---

// --- INICIALIZAÇÃO DA APLICAÇÃO (VERSÃO CORRIGIDA) ---

export const initApp = async () => {
    try {
        // Fazemos duas chamadas de API separadas para buscar os dados
        const [articlesResponse, usersResponse] = await Promise.all([
            fetch('/api/articles'),
            fetch('/api/users')
        ]);

        allArticles = await articlesResponse.json();
        allUsers = await usersResponse.json();

    } catch (error) {
        console.error('Falha ao buscar dados iniciais da API:', error);
        allArticles = [];
        allUsers = [];
    }

    // O resto da função continua igual
    renderPage('knowledge');

    navContainer.addEventListener('click', (e) => {
        // ... seu código de evento de navegação ...
    });

    mainContent.addEventListener('click', (e) => {
        // ... seu código de evento de clique ...
    });
};
