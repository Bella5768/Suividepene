/**
 * Page Utilisateurs - STUB À COMPLÉTER
 */

import { apiService } from '../services/api.js';
import { formatGNF } from '../utils/currency.js';
import { toast } from '../utils/toast.js';
import { getMainContent } from '../layout.js';

export async function renderUtilisateurs() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="utilisateurs">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Utilisateurs</span>
      </div>
      <div class="page-header">
        <h1>Utilisateurs</h1>
      </div>
      <div id="utilisateurs-content">
        <div class="card">
          <p>Page en cours de développement. Voir MIGRATION_GUIDE.md pour compléter.</p>
        </div>
      </div>
    </div>
  `;
}

