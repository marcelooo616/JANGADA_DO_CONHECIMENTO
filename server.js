const express = require('express');
const { createClient } = require('redis'); // A importação que a Vercel recomendou
const app = express();

// Cria o cliente Redis. Ele vai encontrar a REDIS_URL automaticamente
// nas variáveis de ambiente da Vercel.
const redisClient = createClient({
  url: process.env.REDIS_URL
});

// É importante ter um 'listener' para erros de conexão
redisClient.on('error', (err) => {
  console.error('Erro de Conexão com o Redis:', err);
});

// Conecta ao Redis assim que o servidor inicia
// Não precisamos esperar (await) aqui, o cliente gerencia a fila de comandos.
redisClient.connect();


// Rota principal para teste
app.get('/', (req, res) => {
  res.send('<h1>Backend com a biblioteca "redis" no Ar!</h1><p>Visite /api/setup-data para inicializar o banco.</p>');
});


// Rota para inicializar o banco de dados
app.get('/api/setup-data', async (req, res) => {
  try {
    await redisClient.set('articles', JSON.stringify([]));
    await redisClient.set('users', JSON.stringify([]));
    
    res.status(200).send('<h1>BANCO DE DADOS INICIALIZADO com a biblioteca "redis"!</h1>');
  
  } catch (error) {
    console.error('ERRO DETALHADO AO INICIALIZAR com "redis":', error);
    res.status(500).json({
      message: 'Falha crítica ao inicializar dados com "redis".',
      errorName: error.name,
      errorMessage: error.message
    });
  }
});


// Rota para buscar os artigos (exemplo para o futuro)
app.get('/api/articles', async (req, res) => {
    try {
        const articlesString = await redisClient.get('articles');
        const articles = JSON.parse(articlesString || '[]'); 
        res.status(200).json(articles);
    } catch(error) {
        res.status(500).json({ message: 'Erro ao buscar artigos.' });
    }
});


module.exports = app;