// Configuration de l'API
const API_BASE_URL = 'https://bella5768.pythonanywhere.com';

// État global de l'application
let currentUser = null;
let authToken = null;

// Éléments DOM
const loginPage = document.getElementById('login-page');
const dashboardPage = document.getElementById('dashboard-page');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const navLinks = document.querySelectorAll('.nav-link');
const pageContents = document.querySelectorAll('.page-content');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est déjà connecté
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
    
    // Attacher les écouteurs d'événements
    setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Formulaire de connexion
    loginForm.addEventListener('submit', handleLogin);
    
    // Bouton de déconnexion
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Boutons d'action
    document.getElementById('add-operation-btn')?.addEventListener('click', () => showAddOperationForm());
    document.getElementById('add-category-btn')?.addEventListener('click', () => showAddCategoryForm());
    document.getElementById('add-prevision-btn')?.addEventListener('click', () => showAddPrevionForm());
}

// Gestion de la connexion
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        loginError.style.display = 'none';
        
        const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Identifiants incorrects');
        }
        
        const data = await response.json();
        
        // Sauvegarder le token et l'utilisateur
        authToken = data.access;
        currentUser = { username };
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Afficher le tableau de bord
        showDashboard();
        
    } catch (error) {
        console.error('Erreur de connexion:', error);
        loginError.textContent = 'Erreur de connexion: ' + error.message;
        loginError.style.display = 'block';
    }
}

// Gestion de la déconnexion
function handleLogout() {
    // Supprimer le token et l'utilisateur
    authToken = null;
    currentUser = null;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // Afficher la page de connexion
    showLogin();
}

// Afficher la page de connexion
function showLogin() {
    loginPage.classList.add('active');
    dashboardPage.classList.remove('active');
    loginForm.reset();
    loginError.style.display = 'none';
}

// Afficher le tableau de bord
function showDashboard() {
    loginPage.classList.remove('active');
    dashboardPage.classList.add('active');
    
    // Mettre à jour le nom d'utilisateur
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.username;
    }
    
    // Charger les données du tableau de bord
    loadDashboardData();
}

// Gestion de la navigation
function handleNavigation(e) {
    e.preventDefault();
    
    const targetPage = e.target.dataset.page;
    
    // Mettre à jour les liens de navigation actifs
    navLinks.forEach(link => link.classList.remove('active'));
    e.target.classList.add('active');
    
    // Afficher le contenu correspondant
    pageContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${targetPage}-content`).classList.add('active');
    
    // Charger les données spécifiques à la page
    switch(targetPage) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'operations':
            loadOperations();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'previsions':
            loadPrevisions();
            break;
        case 'rapports':
            loadRapports();
            break;
    }
}

// Charger les données du tableau de bord
async function loadDashboardData() {
    try {
        // Charger les statistiques
        const statsResponse = await apiRequest('/api/rapports/mensuel/');
        if (statsResponse) {
            document.getElementById('total-expenses').textContent = `${statsResponse.total_depenses || 0} FCFA`;
            document.getElementById('monthly-expenses').textContent = `${statsResponse.depenses_mois || 0} FCFA`;
        }
        
        // Charger les opérations récentes
        const operationsResponse = await apiRequest('/api/operations/');
        if (operationsResponse && operationsResponse.length > 0) {
            document.getElementById('operations-count').textContent = operationsResponse.length;
            updateRecentOperations(operationsResponse.slice(0, 5));
        }
        
        // Charger les catégories pour le graphique
        const categoriesResponse = await apiRequest('/api/categories/');
        if (categoriesResponse && categoriesResponse.length > 0) {
            updateCategoryChart(categoriesResponse);
        }
        
    } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
    }
}

// Charger les opérations
async function loadOperations() {
    try {
        const operations = await apiRequest('/api/operations/');
        if (operations && operations.length > 0) {
            displayOperations(operations);
        } else {
            document.getElementById('operations-list').innerHTML = '<p>Aucune opération récente</p>';
        }
    } catch (error) {
        console.error('Erreur lors du chargement des opérations:', error);
        document.getElementById('operations-list').innerHTML = '<p>Erreur lors du chargement des opérations</p>';
    }
}

// Charger les catégories
async function loadCategories() {
    try {
        const categories = await apiRequest('/api/categories/');
        if (categories && categories.length > 0) {
            displayCategories(categories);
        } else {
            document.getElementById('categories-list').innerHTML = '<p>Aucune catégorie</p>';
        }
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        document.getElementById('categories-list').innerHTML = '<p>Erreur lors du chargement des catégories</p>';
    }
}

// Charger les prévisions
async function loadPrevisions() {
    try {
        const previsions = await apiRequest('/api/previsions/');
        if (previsions && previsions.length > 0) {
            displayPrevisions(previsions);
        } else {
            document.getElementById('previsions-list').innerHTML = '<p>Aucune prévision</p>';
        }
    } catch (error) {
        console.error('Erreur lors du chargement des prévisions:', error);
        document.getElementById('previsions-list').innerHTML = '<p>Erreur lors du chargement des prévisions</p>';
    }
}

// Charger les rapports
async function loadRapports() {
    try {
        const rapports = await apiRequest('/api/rapports/');
        if (rapports) {
            displayRapports(rapports);
        } else {
            document.getElementById('rapports-section').innerHTML = '<p>Aucun rapport disponible</p>';
        }
    } catch (error) {
        console.error('Erreur lors du chargement des rapports:', error);
        document.getElementById('rapports-section').innerHTML = '<p>Erreur lors du chargement des rapports</p>';
    }
}

// Fonction utilitaire pour faire des requêtes API
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// Fonctions d'affichage
function displayOperations(operations) {
    const container = document.getElementById('operations-list');
    
    if (operations.length === 0) {
        container.innerHTML = '<p>Aucune opération récente</p>';
        return;
    }
    
    const table = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Catégorie</th>
                    <th>Montant</th>
                    <th>Type</th>
                </tr>
            </thead>
            <tbody>
                ${operations.map(op => `
                    <tr>
                        <td>${new Date(op.date).toLocaleDateString('fr-FR')}</td>
                        <td>${op.description || '-'}</td>
                        <td>${op.categorie || '-'}</td>
                        <td>${op.montant} FCFA</td>
                        <td>${op.type}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

function displayCategories(categories) {
    const container = document.getElementById('categories-list');
    
    if (categories.length === 0) {
        container.innerHTML = '<p>Aucune catégorie</p>';
        return;
    }
    
    const table = `
        <table>
            <thead>
                <tr>
                    <th>Nom</th>
                    <th>Description</th>
                    <th>Couleur</th>
                </tr>
            </thead>
            <tbody>
                ${categories.map(cat => `
                    <tr>
                        <td>${cat.nom}</td>
                        <td>${cat.description || '-'}</td>
                        <td><span style="background-color: ${cat.couleur || '#ccc'}; padding: 2px 8px; border-radius: 3px;">${cat.couleur || '#ccc'}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

function displayPrevisions(previsions) {
    const container = document.getElementById('previsions-list');
    
    if (previsions.length === 0) {
        container.innerHTML = '<p>Aucune prévision</p>';
        return;
    }
    
    const table = `
        <table>
            <thead>
                <tr>
                    <th>Catégorie</th>
                    <th>Montant prévu</th>
                    <th>Période</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${previsions.map(prev => `
                    <tr>
                        <td>${prev.categorie}</td>
                        <td>${prev.montant_prevu} FCFA</td>
                        <td>${prev.periode}</td>
                        <td>${new Date(prev.date).toLocaleDateString('fr-FR')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = table;
}

function displayRapports(rapports) {
    const container = document.getElementById('rapports-section');
    
    container.innerHTML = `
        <div class="rapports-grid">
            <div class="stat-card">
                <h3>Total des dépenses</h3>
                <p>${rapports.total_depenses || 0} FCFA</p>
            </div>
            <div class="stat-card">
                <h3>Dépenses ce mois</h3>
                <p>${rapports.depenses_mois || 0} FCFA</p>
            </div>
            <div class="stat-card">
                <h3>Économies</h3>
                <p>${rapports.economies || 0} FCFA</p>
            </div>
        </div>
    `;
}

function updateRecentOperations(operations) {
    // Mettre à jour la section des opérations récentes du tableau de bord
    // Cette fonction peut être implémentée selon les besoins
}

function updateCategoryChart(categories) {
    const chartContainer = document.getElementById('category-chart');
    
    if (categories.length === 0) {
        chartContainer.innerHTML = '<p>Aucune donnée disponible</p>';
        return;
    }
    
    // Simple affichage textuel pour l'instant
    chartContainer.innerHTML = `
        <ul>
            ${categories.map(cat => `
                <li>${cat.nom}: <span style="background-color: ${cat.couleur || '#ccc'}; padding: 2px 8px; border-radius: 3px;">${cat.couleur || '#ccc'}</span></li>
            `).join('')}
        </ul>
    `;
}

// Fonctions pour afficher les formulaires d'ajout
function showAddOperationForm() {
    alert('Formulaire d\'ajout d\'opération - à implémenter');
}

function showAddCategoryForm() {
    alert('Formulaire d\'ajout de catégorie - à implémenter');
}

function showAddPrevionForm() {
    alert('Formulaire d\'ajout de prévision - à implémenter');
}
