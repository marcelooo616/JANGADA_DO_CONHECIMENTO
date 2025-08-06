import { initApp } from '../js/app.js';
// MUDANÇA AQUI: O caminho de importação foi atualizado para a pasta /theme/
import { initTheme } from '../theme/theme.js';

// Espera o DOM carregar para garantir que todos os elementos HTML existam.
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o sistema de tema (Dark Mode).
    initTheme();
    // Inicializa o cérebro da aplicação (carrega dados, renderiza a página, etc.).
    initApp();
});
