/**
 * Layout principal avec header et sidebar
 */

import { authService } from '/static/depenses/js/services/auth.js';
import { router } from '/static/depenses/js/router.js';

let currentUser = null;
let unsubscribeAuth = null;

/**
 * Créer le layout
 */
export function createLayout() {
  const app = document.getElementById('app');
  if (!app) return;

  // Écouter les changements d'authentification
  unsubscribeAuth = authService.onAuthChange((user, loading) => {
    currentUser = user;
    if (!loading) {
      renderLayout();
    }
  });
}

/**
 * Rendre le layout
 */
function renderLayout() {
  const app = document.getElementById('app');
  if (!app) return;

  const pathname = window.location.pathname;
  const isLoginPage = pathname === '/login' || pathname.startsWith('/commander');

  if (isLoginPage) {
    // Ne pas afficher le layout sur la page de login
    return;
  }

  app.innerHTML = `
    <div class="layout">
      ${createHeader()}
      <div class="layout-body">
        ${createSidebar()}
        <main class="main-content" id="main-content"></main>
      </div>
    </div>
  `;

  // Attacher les événements
  attachHeaderEvents();
  attachSidebarEvents();
}

/**
 * Créer le header
 */
function createHeader() {
  const username = currentUser?.username?.toUpperCase() || 'UTILISATEUR';
  
  return `
    <header class="main-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-brand">
            <img src="/static/depenses/assets/logocsig.png" alt="Logo CSIG" class="header-logo" />
            <h1 class="header-title">Suivi Dépense CSIG</h1>
          </div>
        </div>
        <div class="header-right">
          <span class="header-welcome">BIENVENUE, ${username}.</span>
          <a href="#" class="header-link" data-nav="/dashboard">VOIR LE SITE</a>
          <button class="header-link header-button" id="logout-btn">DÉCONNEXION</button>
        </div>
      </div>
    </header>
  `;
}

/**
 * Créer la sidebar
 */
function createSidebar() {
  const pathname = window.location.pathname;
  const isActive = (path) => pathname === path;

  const hasPermission = (fonctionnalite, action = 'peut_voir') => {
    if (currentUser?.is_superuser) return true;
    if (!currentUser?.permissions) return false;
    if (Array.isArray(currentUser.permissions)) {
      const permission = currentUser.permissions.find(p => p.fonctionnalite === fonctionnalite);
      return permission ? permission[action] : false;
    }
    return false;
  };

  let menuItems = '';

  // Gestion des dépenses
  menuItems += `
    <div class="sidebar-section">
      <div class="sidebar-section-header">GESTION DES DÉPENSES</div>
      <ul class="sidebar-menu">
  `;

  if (hasPermission('dashboard')) {
    menuItems += `
      <li>
        <a href="#" class="sidebar-item ${isActive('/dashboard') ? 'active' : ''}" data-nav="/dashboard">
          Accueil
        </a>
      </li>
    `;
  }

  if (hasPermission('operations')) {
    menuItems += `
      <li>
        <a href="#" class="sidebar-item ${isActive('/operations') ? 'active' : ''}" data-nav="/operations">
          Opérations
        </a>
      </li>
    `;
  }

  if (hasPermission('previsions')) {
    menuItems += `
      <li>
        <a href="#" class="sidebar-item ${isActive('/previsions') ? 'active' : ''}" data-nav="/previsions">
          Prévisions
        </a>
      </li>
    `;
  }

  if (hasPermission('imputations')) {
    menuItems += `
      <li>
        <a href="#" class="sidebar-item ${isActive('/imputations') ? 'active' : ''}" data-nav="/imputations">
          Imputations
        </a>
      </li>
    `;
  }

  if (hasPermission('rapports')) {
    menuItems += `
      <li>
        <a href="#" class="sidebar-item ${isActive('/rapports') ? 'active' : ''}" data-nav="/rapports">
          Rapports
        </a>
      </li>
    `;
  }

  if (hasPermission('categories')) {
    menuItems += `
      <li>
        <a href="#" class="sidebar-item ${isActive('/categories') ? 'active' : ''}" data-nav="/categories">
          Catégories
        </a>
      </li>
    `;
  }

  menuItems += `
      </ul>
    </div>
  `;

  // Administration
  if (currentUser?.is_superuser || hasPermission('utilisateurs')) {
    menuItems += `
      <div class="sidebar-section">
        <div class="sidebar-section-header">ADMINISTRATION</div>
        <ul class="sidebar-menu">
    `;

    if (hasPermission('utilisateurs')) {
      menuItems += `
        <li>
          <a href="#" class="sidebar-item ${isActive('/utilisateurs') ? 'active' : ''}" data-nav="/utilisateurs">
            Utilisateurs
          </a>
        </li>
      `;
    }

    menuItems += `
        </ul>
      </div>
    `;
  }

  // Restauration
  if (hasPermission('restauration_commandes') || hasPermission('restauration_menus') || 
      hasPermission('restauration_plats') || hasPermission('tableau_bord_cantine') || 
      hasPermission('operations')) {
    menuItems += `
      <div class="sidebar-section">
        <div class="sidebar-section-header">RESTAURATION / CANTINE</div>
        <ul class="sidebar-menu">
    `;

    if (hasPermission('restauration_commandes')) {
      menuItems += `
        <li>
          <a href="#" class="sidebar-item ${isActive('/restauration/commandes') ? 'active' : ''}" data-nav="/restauration/commandes">
            Commander
          </a>
        </li>
      `;
    }

    if (hasPermission('operations')) {
      menuItems += `
        <li>
          <a href="#" class="sidebar-item ${isActive('/restauration/extras') ? 'active' : ''}" data-nav="/restauration/extras">
            🍽️ Extras (Visiteurs/Stagiaires)
          </a>
        </li>
      `;
    }

    if (hasPermission('restauration_menus')) {
      menuItems += `
        <li>
          <a href="#" class="sidebar-item ${isActive('/restauration/menus') ? 'active' : ''}" data-nav="/restauration/menus">
            Menus
          </a>
        </li>
      `;
    }

    if (hasPermission('restauration_plats')) {
      menuItems += `
        <li>
          <a href="#" class="sidebar-item ${isActive('/restauration/plats') ? 'active' : ''}" data-nav="/restauration/plats">
            Plats
          </a>
        </li>
      `;
    }

    if (hasPermission('tableau_bord_cantine')) {
      menuItems += `
        <li>
          <a href="#" class="sidebar-item ${isActive('/tableau-bord-cantine') ? 'active' : ''}" data-nav="/tableau-bord-cantine">
            Tableau de Bord Cantine
          </a>
        </li>
      `;
    }

    menuItems += `
        </ul>
      </div>
    `;
  }

  // Audit
  if (hasPermission('audit')) {
    menuItems += `
      <div class="sidebar-section">
        <div class="sidebar-section-header">AUDIT ET TRAÇABILITÉ</div>
        <ul class="sidebar-menu">
          <li>
            <a href="#" class="sidebar-item ${isActive('/audit') ? 'active' : ''}" data-nav="/audit">
              Journaux d'Audit
            </a>
          </li>
        </ul>
      </div>
    `;
  }

  return `
    <aside class="sidebar">
      <div class="sidebar-search">
        <input 
          type="text" 
          placeholder="Écrivez ici pour filtrer..." 
          class="sidebar-filter-input"
          id="sidebar-filter"
        />
      </div>
      ${menuItems}
    </aside>
  `;
}

/**
 * Attacher les événements du header
 */
function attachHeaderEvents() {
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authService.logout();
    });
  }

  // Navigation depuis le header
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = e.target.getAttribute('data-nav');
      router.navigate(path);
    });
  });
}

/**
 * Attacher les événements de la sidebar
 */
function attachSidebarEvents() {
  // Navigation depuis la sidebar
  document.querySelectorAll('.sidebar-item[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const path = e.target.getAttribute('data-nav');
      router.navigate(path);
    });
  });

  // Filtre de recherche dans la sidebar
  const filterInput = document.getElementById('sidebar-filter');
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      document.querySelectorAll('.sidebar-item').forEach(item => {
        const text = item.textContent.toLowerCase();
        const li = item.closest('li');
        if (li) {
          if (text.includes(searchTerm)) {
            li.style.display = '';
          } else {
            li.style.display = 'none';
          }
        }
      });
    });
  }
}

/**
 * Obtenir le conteneur principal
 */
export function getMainContent() {
  return document.getElementById('main-content');
}

