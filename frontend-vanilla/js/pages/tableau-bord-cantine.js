/**
 * Page Tableau de Bord Cantine - STUB À COMPLÉTER
 */

import { apiService } from '../services/api.js';
import { formatGNF } from '../utils/currency.js';
import { toast } from '../utils/toast.js';
import { getMainContent } from '../layout.js';

export async function renderTableauBordCantine() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="tableau-bord-cantine">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Tableau de Bord Cantine</span>
      </div>
      <div class="page-header">
        <h1>Tableau de Bord Cantine</h1>
      </div>
      <div id="tableau-bord-cantine-content">
        <div class="card">
          <p>Page en cours de développement. Voir MIGRATION_GUIDE.md pour compléter.</p>
        </div>
      </div>
    </div>
  `;
}

