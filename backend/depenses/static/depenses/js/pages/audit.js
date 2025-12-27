/**
 * Page Audit - STUB À COMPLÉTER
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

export async function renderAudit() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="audit">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Audit</span>
      </div>
      <div class="page-header">
        <h1>Journaux d'Audit</h1>
      </div>
      <div id="audit-content">
        <div class="card">
          <p>Page en cours de développement. Voir MIGRATION_GUIDE.md pour compléter.</p>
        </div>
      </div>
    </div>
  `;
}

