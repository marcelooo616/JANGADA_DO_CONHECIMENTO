// server.js
const express = require('express');
const path =require('path');
const { kv } = require('@vercel/kv');
const { put } = require('@vercel/blob');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rota de salvar artigo (continua a mesma)
// Rota de salvar artigo (ATUALIZADA PARA VERCEL KV)
app.post('/api/save-article', async (req, res) => {
    try {
        const articleData = req.body;

        // 1. Lê a lista de artigos direto do Vercel KV
        //    Se a chave 'articles' não existir, começa com um array vazio []
        let articles = await kv.get('articles') || [];

        // O resto da sua lógica para criar ou atualizar um artigo continua IGUAL!
        if (articleData.id) {
            const index = articles.findIndex(a => a && a.id === articleData.id);
            if (index > -1) {
                const originalArticle = articles[index];
                articles[index] = { ...originalArticle, title: articleData.title, description: articleData.description, category: articleData.category, tags: articleData.tags, content: articleData.content, lastUpdatedAt: new Date().toISOString() };
            } else {
                return res.status(404).json({ message: 'Artigo não encontrado para atualização.' });
            }
        } else {
            const newArticle = { id: `knw_${Date.now()}`, title: articleData.title, description: articleData.description, category: articleData.category, tags: articleData.tags, content: articleData.content, authorId: 101, createdAt: new Date().toISOString(), lastUpdatedAt: new Date().toISOString(), };
            articles.push(newArticle);
        }

        // 2. Salva a lista de artigos atualizada de volta no Vercel KV
        await kv.set('articles', articles);

        return res.status(200).json({ message: 'Artigo salvo com sucesso!' });

    } catch (error) {
        console.error('Erro no servidor ao salvar artigo:', error);
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }
});

// ROTA DE UPLOAD DE IMAGEM (VERSÃO FINAL PARA VERCEL)
app.post('/api/upload-image', async (req, res) => {
    // O nome do arquivo original vem do header, como combinamos antes
    const filename = req.headers['x-filename'];
    if (!filename || !req.body) {
        return res.status(400).json({ message: 'Nome do arquivo ou conteúdo não enviado.' });
    }

    try {
        // 1. LER O CONTADOR DO VERCEL KV
        // Se não existir, começa com o valor { lastImageId: 0 }
        const counter = await kv.get('counter') || { lastImageId: 0 };

        // 2. INCREMENTAR O CONTADOR (sua lógica)
        counter.lastImageId++;
        
        // 3. CRIAR O NOME FINAL DO ARQUIVO (sua lógica)
        const newImageName = String(counter.lastImageId).padStart(6, '0');
        const fileExtension = path.extname(filename);
        const finalFilename = newImageName + fileExtension;

        // 4. SALVAR O CONTADOR ATUALIZADO DE VOLTA NO VERCEL KV
        await kv.set('counter', counter);

        // 5. ENVIAR O ARQUIVO PARA O VERCEL BLOB (como fizemos antes)
        const blob = await put(finalFilename, req.body, {
            access: 'public',
        });

        // 6. RETORNAR A URL DA IMAGEM
        return res.status(200).json(blob);

    } catch (error) {
        console.error('Erro ao processar imagem:', error);
        return res.status(500).json({ message: 'Erro ao processar a imagem no servidor.' });
    }
});

// NOVA ROTA - GET para buscar todos os usuários
app.get('/api/users', async (req, res) => {
  try {
    const users = await kv.get('users') || [];
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


module.exports = app;


