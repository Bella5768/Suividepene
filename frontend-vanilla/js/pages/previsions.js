/**
 * Page Previsions - STUB À COMPLÉTER
 */

import { apiService } from '../services/api.js';
import { formatGNF } from '../utils/currency.js';
import { toast } from '../utils/toast.js';
import { getMainContent } from '../layout.js';

export async function renderPrevisions() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="previsions">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Prévisions</span>
      </div>
      <div class="page-header">
        <h1>Prévisions</h1>
      </div>
      <div id="previsions-content">
        <div class="card">
          <p>Page en cours de développement. Voir MIGRATION_GUIDE.md pour compléter.</p>
        </div>
      </div>
    </div>
  `;
}

