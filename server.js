const express = require('express');
const { kv } = require('@vercel/kv');
const app = express();

// Rota para inicializar o banco de dados
app.get('/api/setup-data', async (req, res) => {
  try {
    await kv.set('articles', []); // Tenta criar a chave 'articles'
    await kv.set('users', []);   // Tenta criar a chave 'users'

    res.status(200).send('<h1>BANCO DE DADOS INICIALIZADO COM SUCESSO!</h1><p>As chaves "articles" e "users" foram criadas no Vercel KV.</p>');

  } catch (error) {
    console.error('ERRO DETALHADO AO INICIALIZAR:', error); // Log mais detalhado no servidor
    res.status(500).json({
      message: 'Falha ao inicializar dados.',
      errorDetails: error.message // Devolve a mensagem de erro específica
    });
  }
});

module.exports = app;