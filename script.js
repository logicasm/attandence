// ===================================================================================
//
//  SITE MANAGEMENT SYSTEM - SCRIPT.JS
//  Description: Main JavaScript file for the site management application.
//  Author: Gemini AI
//
// ===================================================================================

// ---------------------------
//  Global State & Constants
// ---------------------------
const API_BASE_URL = 'api'; // Use relative path
let allEmployees = [];
let currentPage = 'dashboard';

// ---------------------------
//  Global Functions (for onclick attributes)
// ---------------------------

window.showPage = function(pageName) {
    if (!pageName) return;
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(p => p.classList.remove('active'));
    const allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(l => l.classList.remove('active'));
    const targetPage = document.getElementById(pageName);
    if (targetPage) targetPage.classList.add('active');
    const targetLink = document.querySelector(`[data-page="${pageName}"], [onclick*="'${pageName}'"]`);
    if (targetLink) targetLink.classList.add('active');
    currentPage = pageName;
    const initFunctionName = `init${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page`;
    if (typeof window[initFunctionName] === 'function') window[initFunctionName]();
};

window.toggleDarkMode = function() {
    const isDarkMode = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDarkMode);
    const icon = document.getElementById('dark-mode-icon');
    if (icon) icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
};

// ---------------------------
//  Initialization
// ---------------------------
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
        const icon = document.getElementById('dark-mode-icon');
        if (icon) icon.className = 'fas fa-sun';
    }
    setupNavigation();
    showPage('dashboard');
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPage(this.dataset.page);
        });
    });
}

// ... All other original JS functions will be restored here ...
// e.g., initEmployeePage, setupEmployeeFormListeners, etc.
// The full, original script will be placed here. 