// server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const DB_PATH = path.join(__dirname, 'db', 'knowledge.json');
const COUNTER_PATH = path.join(__dirname, 'db', 'counter.json'); // Caminho para nosso novo contador

// --- CONFIGURAÇÃO DO MULTER ---
// Agora ele salva na mesma pasta, mas não se preocupa com o nome final do arquivo
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        // Salva com um nome temporário para evitar conflitos
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Rota de salvar artigo (continua a mesma)
app.post('/api/save-article', async (req, res) => {
    // ... seu código de salvar artigo aqui, sem alterações ...
    try {
        const articleData = req.body;
        const dbRaw = await fs.readFile(DB_PATH, 'utf-8');
        let articles = JSON.parse(dbRaw);
        articles = articles.filter(article => article !== null && typeof article === 'object');
        if (articleData.id) {
            const index = articles.findIndex(a => a && a.id === articleData.id);
            if (index > -1) {
                const originalArticle = articles[index];
                articles[index] = { ...originalArticle, title: articleData.title, description: articleData.description, category: articleData.category, tags: articleData.tags, content: articleData.content, lastUpdatedAt: new Date().toISOString() };
            } else { return res.status(404).json({ message: 'Artigo não encontrado para atualização.' }); }
        } else {
            const newArticle = { id: `knw_${Date.now()}`, title: articleData.title, description: articleData.description, category: articleData.category, tags: articleData.tags, content: articleData.content, authorId: 101, createdAt: new Date().toISOString(), lastUpdatedAt: new Date().toISOString(), };
            articles.push(newArticle);
        }
        await fs.writeFile(DB_PATH, JSON.stringify(articles, null, 2), 'utf-8');
        return res.status(200).json({ message: 'Artigo salvo com sucesso!' });
    } catch (error) {
        console.error('Erro no servidor ao salvar artigo:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// --- ROTA DE UPLOAD DE IMAGEM (ATUALIZADA) ---
app.post('/api/upload-image', upload.single('inline_image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    }

    try {
        // 1. Ler o arquivo contador
        const counterData = await fs.readFile(COUNTER_PATH, 'utf-8');
        const counter = JSON.parse(counterData);

        // 2. Incrementar o contador
        counter.lastImageId++;
        
        // 3. Formatar o novo ID para ter 6 dígitos com zeros à esquerda
        // Ex: 1 -> "000001", 123 -> "000123"
        const newImageName = String(counter.lastImageId).padStart(6, '0');
        const fileExtension = path.extname(req.file.originalname);
        const finalFilename = newImageName + fileExtension;

        // 4. Salvar o novo valor de volta no contador
        await fs.writeFile(COUNTER_PATH, JSON.stringify(counter, null, 2), 'utf-8');

        // 5. Renomear o arquivo temporário para o nome final
        const tempPath = req.file.path;
        const finalPath = path.join(__dirname, 'public', 'uploads', finalFilename);
        await fs.rename(tempPath, finalPath);

        // 6. Retornar o caminho público do arquivo com o nome final
        res.status(200).json({
            imageUrl: `/uploads/${finalFilename}`
        });

    } catch (error) {
        console.error('Erro ao processar imagem e contador:', error);
        return res.status(500).json({ message: 'Erro ao processar a imagem no servidor.' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});


