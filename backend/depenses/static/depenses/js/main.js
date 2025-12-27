/**
 * Point d'entrée principal de l'application
 */

import { router } from '/static/depenses/js/router.js';
import { createLayout, getMainContent } from '/static/depenses/js/layout.js';
import { authService } from '/static/depenses/js/services/auth.js';

// Importer les pages
import { renderLogin } from '/static/depenses/js/pages/login.js';
import { renderDashboard } from '/static/depenses/js/pages/dashboard.js';
import { renderOperations } from '/static/depenses/js/pages/operations.js';
import { renderPrevisions } from '/static/depenses/js/pages/previsions.js';
import { renderRapports } from '/static/depenses/js/pages/rapports.js';
import { renderCategories } from '/static/depenses/js/pages/categories.js';
import { renderUtilisateurs } from '/static/depenses/js/pages/utilisateurs.js';
import { renderAudit } from '/static/depenses/js/pages/audit.js';
import { renderImputations } from '/static/depenses/js/pages/imputations.js';
import { renderRestaurationPlats } from '/static/depenses/js/pages/restauration-plats.js';
import { renderRestaurationMenus } from '/static/depenses/js/pages/restauration-menus.js';
import { renderRestaurationCommandes } from '/static/depenses/js/pages/restauration-commandes.js';
import { renderExtrasRestauration } from '/static/depenses/js/pages/extras-restauration.js';
import { renderTableauBordCantine } from '/static/depenses/js/pages/tableau-bord-cantine.js';
import { renderCommanderPublic } from '/static/depenses/js/pages/commander-public.js';

/**
 * Vérifier l'authentification avant d'afficher une page protégée
 */
async function requireAuth() {
  if (!authService.isAuthenticated()) {
    router.navigate('/login');
    return false;
  }
  return true;
}

/**
 * Initialiser l'application
 */
async function init() {
  // Attendre que l'authentification soit chargée
  await new Promise((resolve) => {
    const checkAuth = () => {
      if (!authService.loading) {
        resolve();
      } else {
        setTimeout(checkAuth, 100);
      }
    };
    checkAuth();
  });

  // Créer le layout
  createLayout();

  // Définir les routes
  router.addRoute('/login', async () => {
    const mainContent = document.getElementById('app');
    if (mainContent) {
      mainContent.innerHTML = '';
      await renderLogin();
    }
  }, false);

  router.addRoute('/', async () => {
    if (await requireAuth()) {
      router.navigate('/dashboard', true);
    }
  }, true);

  router.addRoute('/dashboard', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderDashboard();
      }
    }
  }, true);

  router.addRoute('/operations', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderOperations();
      }
    }
  }, true);

  router.addRoute('/previsions', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderPrevisions();
      }
    }
  }, true);

  router.addRoute('/imputations', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderImputations();
      }
    }
  }, true);

  router.addRoute('/rapports', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderRapports();
      }
    }
  }, true);

  router.addRoute('/categories', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderCategories();
      }
    }
  }, true);

  router.addRoute('/utilisateurs', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderUtilisateurs();
      }
    }
  }, true);

  router.addRoute('/audit', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderAudit();
      }
    }
  }, true);

  router.addRoute('/restauration/plats', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderRestaurationPlats();
      }
    }
  }, true);

  router.addRoute('/restauration/menus', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderRestaurationMenus();
      }
    }
  }, true);

  router.addRoute('/restauration/commandes', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderRestaurationCommandes();
      }
    }
  }, true);

  router.addRoute('/restauration/extras', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderExtrasRestauration();
      }
    }
  }, true);

  router.addRoute('/tableau-bord-cantine', async () => {
    if (await requireAuth()) {
      const main = getMainContent();
      if (main) {
        await renderTableauBordCantine();
      }
    }
  }, true);

  // Routes publiques
  router.addRoute('/commander/:token', async (params) => {
    const mainContent = document.getElementById('app');
    if (mainContent) {
      mainContent.innerHTML = '';
      await renderCommanderPublic(params.token);
    }
  }, false);

  router.addRoute('/commander', async () => {
    const mainContent = document.getElementById('app');
    if (mainContent) {
      mainContent.innerHTML = '';
      await renderCommanderPublic();
    }
  }, false);

  // Route 404
  router.setNotFound(async () => {
    const main = getMainContent() || document.getElementById('app');
    if (main) {
      main.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem;">
          <h1>404 - Page non trouvée</h1>
          <p>La page que vous recherchez n'existe pas.</p>
          <a href="#" data-nav="/dashboard" class="btn btn-primary">Retour à l'accueil</a>
        </div>
      `;
      
      // Attacher l'événement de navigation
      const link = main.querySelector('[data-nav]');
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          router.navigate('/dashboard');
        });
      }
    }
  });

  // Gérer la route initiale
  router.handleRoute();
}

// Démarrer l'application quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

