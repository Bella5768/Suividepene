/**
 * Page Extras Restauration - STUB À COMPLÉTER
 */

import { apiService } from '../services/api.js';
import { formatGNF } from '../utils/currency.js';
import { toast } from '../utils/toast.js';
import { getMainContent } from '../layout.js';

export async function renderExtrasRestauration() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="extras-restauration">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Extras</span>
      </div>
      <div class="page-header">
        <h1>Extras (Visiteurs/Stagiaires)</h1>
      </div>
      <div id="extras-restauration-content">
        <div class="card">
          <p>Page en cours de développement. Voir MIGRATION_GUIDE.md pour compléter.</p>
        </div>
      </div>
    </div>
  `;
}

