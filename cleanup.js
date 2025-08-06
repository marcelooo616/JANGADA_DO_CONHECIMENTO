// cleanup.js
const fs = require('fs').promises;
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const DB_PATH = path.join(__dirname, 'db', 'knowledge.json');

async function runCleanup() {
    console.log('Iniciando script de limpeza de imagens órfãs...');

    try {
        // 1. Pega a lista de todos os arquivos que existem fisicamente na pasta uploads
        const existingImageFiles = await fs.readdir(UPLOADS_DIR);
        if (existingImageFiles.length === 0) {
            console.log('Nenhuma imagem na pasta de uploads. Encerrando.');
            return;
        }

        // 2. Lê o banco de dados e encontra todos os links de imagem que estão em uso
        const dbRaw = await fs.readFile(DB_PATH, 'utf-8');
        const articles = JSON.parse(dbRaw);

        const usedImages = new Set();
        // Regex para encontrar nomes de arquivo como '000001.jpg' dentro de um caminho /uploads/
        const imageUrlRegex = /\/uploads\/([\w-]+\.\w+)/g;

        articles.forEach(article => {
            if (article && article.content) {
                let match;
                while ((match = imageUrlRegex.exec(article.content)) !== null) {
                    usedImages.add(match[1]); // Adiciona o nome do arquivo (ex: '000001.jpg')
                }
            }
        });

        console.log(`${usedImages.size} imagens estão atualmente em uso.`);

        // 3. Compara as duas listas e deleta os arquivos que não estão em uso
        let orphanCount = 0;
        const deletePromises = existingImageFiles.map(async (filename) => {
            if (!usedImages.has(filename)) {
                orphanCount++;
                const filePath = path.join(UPLOADS_DIR, filename);
                console.log(`Deletando arquivo órfão: ${filePath}`);
                try {
                    await fs.unlink(filePath);
                } catch (deleteError) {
                    console.error(`Falha ao deletar ${filename}:`, deleteError);
                }
            }
        });

        await Promise.all(deletePromises);

        console.log(`Limpeza concluída! ${orphanCount} arquivos órfãos foram removidos.`);

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Arquivo de banco de dados ou pasta de uploads não encontrado. Nenhum artigo para verificar.');
        } else {
            console.error('Ocorreu um erro durante a limpeza:', error);
        }
    }
}

runCleanup();