/**
 * Carrega os dados dos ficheiros JSON do banco de dados.
 * @returns {Promise<Object>} Uma promessa que resolve com os artigos e utilizadores.
 */
export const fetchData = async () => {
    try {
        // Carrega os dois ficheiros em paralelo para mais eficiência.
        const [knowledgeResponse, usersResponse] = await Promise.all([
            fetch('db/knowledge.json'),
            fetch('db/users.json')
        ]);

        if (!knowledgeResponse.ok || !usersResponse.ok) {
            throw new Error('Falha ao carregar os ficheiros do banco de dados.');
        }

        const allArticles = await knowledgeResponse.json();
        const allUsers = await usersResponse.json();
        
        return { allArticles, allUsers };

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
        // Retorna um objeto vazio em caso de erro para a aplicação não quebrar.
        return { allArticles: [], allUsers: [] };
    }
};
