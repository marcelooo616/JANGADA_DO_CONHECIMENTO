let navigate = () => {};

const addEventListeners = () => {
    const mainContent = document.getElementById('main-content');
    mainContent.addEventListener('click', (e) => {
        const goBackBtn = e.target.closest('[data-action="go-back"]');
        if (goBackBtn) {
            navigate('knowledge');
        }
    });
};

export const initArticlePage = (id, allArticles, allUsers, navigateTo) => {
    navigate = navigateTo;

    const article = allArticles.find(a => a.id === id);
    if (!article) {
        navigate('knowledge');
        return;
    }

    const author = allUsers.find(u => u.id === article.authorId) || { name: 'Desconhecido' };
    document.querySelector('.article-title').textContent = article.title;
    document.querySelector('.article-meta').innerHTML = `<span>Por ${author.name}</span> | <span>Categoria: ${article.category}</span>`;
    document.querySelector('.article-body').innerHTML = article.content;

    addEventListeners();
};
