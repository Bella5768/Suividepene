/**
 * Page Rapports - Génération de rapports mensuels
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let rapportData = null;
let selectedMois = new Date().toISOString().slice(0, 7);

export async function renderRapports() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="rapports">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Rapports</span>
      </div>
      <div class="page-header">
        <h1>Rapports</h1>
      </div>
      
      <!-- Sélection du mois -->
      <div class="card filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label>Mois du rapport</label>
            <input type="month" id="filter-mois" class="form-input" value="${selectedMois}" />
          </div>
          <div class="filter-group filter-actions">
            <button class="btn btn-primary" id="btn-generate">Générer le rapport</button>
          </div>
        </div>
      </div>

      <div id="rapports-content">
        <div class="card">
          <p style="text-align: center; color: #64748b; padding: 2rem;">
            Sélectionnez un mois et cliquez sur "Générer le rapport" pour voir les données.
          </p>
        </div>
      </div>
    </div>
  `;

  attachEvents();
}

function attachEvents() {
  document.getElementById('btn-generate')?.addEventListener('click', generateRapport);
}

async function generateRapport() {
  const content = document.getElementById('rapports-content');
  if (!content) return;

  selectedMois = document.getElementById('filter-mois').value;
  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await apiService.get(`/api/rapports/mensuel/?mois=${selectedMois}`);
    rapportData = data;
    renderRapport();
  } catch (error) {
    console.error('Erreur génération rapport:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors de la génération du rapport.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderRapport() {
  const content = document.getElementById('rapports-content');
  if (!content || !rapportData) return;

  const moisFormate = new Date(selectedMois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  content.innerHTML = `
    <div class="rapport-container">
      <!-- Résumé -->
      <div class="card">
        <h2>Rapport mensuel - ${moisFormate}</h2>
        <div class="rapport-stats">
          <div class="stat-card">
            <div class="stat-label">Total Prévu</div>
            <div class="stat-value">${formatGNF(rapportData.total_prevu || 0)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Dépensé</div>
            <div class="stat-value">${formatGNF(rapportData.total_depense || 0)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Écart</div>
            <div class="stat-value ${(rapportData.ecart || 0) < 0 ? 'negative' : ''}">${formatGNF(rapportData.ecart || 0)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Moyenne journalière</div>
            <div class="stat-value">${formatGNF(rapportData.moyenne_journaliere || 0)}</div>
          </div>
        </div>
      </div>

      <!-- Détail par catégorie -->
      ${rapportData.par_categorie && rapportData.par_categorie.length > 0 ? `
        <div class="card">
          <h2>Détail par catégorie</h2>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Prévu</th>
                  <th>Dépensé</th>
                  <th>Écart</th>
                  <th>% Utilisé</th>
                </tr>
              </thead>
              <tbody>
                ${rapportData.par_categorie.map(cat => {
                  const ecart = (cat.prevu || 0) - (cat.depense || 0);
                  const pourcent = cat.prevu > 0 ? ((cat.depense / cat.prevu) * 100).toFixed(1) : 0;
                  return `
                    <tr>
                      <td>${cat.categorie_nom || cat.categorie}</td>
                      <td>${formatGNF(cat.prevu || 0)}</td>
                      <td>${formatGNF(cat.depense || 0)}</td>
                      <td class="${ecart < 0 ? 'text-danger' : ''}">${formatGNF(ecart)}</td>
                      <td>
                        <div class="progress-bar">
                          <div class="progress-fill ${pourcent > 100 ? 'danger' : pourcent > 80 ? 'warning' : ''}" style="width: ${Math.min(pourcent, 100)}%"></div>
                        </div>
                        <span>${pourcent}%</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Actions -->
      <div class="card">
        <div class="rapport-actions">
          <button class="btn btn-outline" id="btn-export-pdf">Exporter PDF</button>
          <button class="btn btn-outline" id="btn-export-excel">Exporter Excel</button>
        </div>
      </div>
    </div>
  `;

  // Attacher événements export
  document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
    window.open(`/api/rapports/export_pdf/?mois=${selectedMois}`, '_blank');
  });
  document.getElementById('btn-export-excel')?.addEventListener('click', () => {
    window.open(`/api/rapports/export_excel/?mois=${selectedMois}`, '_blank');
  });
}

