const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

/**
 * Aplica o tema (dark ou light) ao documento e atualiza o ícone.
 * @param {string} theme - O tema a ser aplicado ('dark' ou 'light').
 */
const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    sunIcon.classList.toggle('hidden', theme === 'dark');
    moonIcon.classList.toggle('hidden', theme === 'light');
};

/**
 * Alterna entre o tema claro e escuro e salva a preferência.
 */
const toggleTheme = () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
};

/**
 * Inicializa o sistema de tema, aplicando o tema salvo ou o padrão do sistema.
 */
export const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    themeToggleBtn.addEventListener('click', toggleTheme);
};
