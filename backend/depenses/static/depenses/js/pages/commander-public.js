/**
 * Page Commander Public - STUB À COMPLÉTER
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';

export async function renderCommanderPublic(token) {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="commander-public">
      <div class="page-header">
        <h1>Commander</h1>
      </div>
      <div id="commander-public-content">
        <div class="card">
          <p>Page en cours de développement. Voir MIGRATION_GUIDE.md pour compléter.</p>
          ${token ? `<p>Token: ${token}</p>` : ''}
        </div>
      </div>
    </div>
  `;
}

