/**
 * Page Restauration Commandes - Gestion des commandes
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let commandes = [];
let selectedDate = new Date().toISOString().split('T')[0];

export async function renderRestaurationCommandes() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="restauration-commandes">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span>Restauration</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Commandes</span>
      </div>
      <div class="page-header">
        <h1>Gestion des Commandes</h1>
      </div>
      
      <div class="card filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label>Date</label>
            <input type="date" id="filter-date" class="form-input" value="${selectedDate}" />
          </div>
          <div class="filter-group filter-actions">
            <button class="btn btn-secondary" id="btn-filter">Afficher</button>
          </div>
        </div>
      </div>

      <div id="commandes-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `;

  await loadCommandes();
  attachEvents();
}

async function loadCommandes() {
  const content = document.getElementById('commandes-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await apiService.get(`/api/restauration/commandes/?date_commande=${selectedDate}`);
    commandes = Array.isArray(data) ? data : (data.results || []);
    renderCommandesTable();
  } catch (error) {
    console.error('Erreur chargement commandes:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des commandes.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderCommandesTable() {
  const content = document.getElementById('commandes-content');
  if (!content) return;

  if (commandes.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucune commande pour cette date.
        </p>
      </div>
    `;
    return;
  }

  const totalPrixReel = commandes.reduce((sum, c) => sum + parseFloat(c.prix_reel_total || 0), 0);
  const totalSubvention = commandes.reduce((sum, c) => sum + parseFloat(c.montant_subvention || 0), 0);
  const totalSupplement = commandes.reduce((sum, c) => sum + parseFloat(c.supplement_total || 0), 0);

  content.innerHTML = `
    <div class="card">
      <div class="table-header" style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <span><strong>${commandes.length}</strong> commande(s)</span>
        <span>Prix réel: <strong>${formatGNF(totalPrixReel)}</strong></span>
        <span>Subvention (max 30k): <strong style="color: #10b981;">${formatGNF(totalSubvention)}</strong></span>
        <span>Supplément: <strong style="color: #f59e0b;">${formatGNF(totalSupplement)}</strong></span>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Plats</th>
              <th>Prix réel</th>
              <th>Subvention (max 30k)</th>
              <th>Supplément</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${commandes.map(cmd => {
              const prixReel = parseFloat(cmd.prix_reel_total || 0);
              const subvention = parseFloat(cmd.montant_subvention || 0);
              const supplement = parseFloat(cmd.supplement_total || 0);
              return `
              <tr>
                <td><strong>${cmd.utilisateur_nom || cmd.utilisateur}</strong></td>
                <td>${cmd.lignes?.length || 0} plat(s)</td>
                <td>${formatGNF(prixReel)}</td>
                <td style="color: #10b981;"><strong>${formatGNF(subvention)}</strong></td>
                <td style="color: ${supplement > 0 ? '#f59e0b' : '#64748b'};">${supplement > 0 ? formatGNF(supplement) : '-'}</td>
                <td>${getEtatBadge(cmd.etat)}</td>
                <td>
                  ${cmd.etat === 'brouillon' ? `<button class="btn btn-sm btn-success" data-validate="${cmd.id}">Valider</button>` : ''}
                  ${cmd.etat === 'validee' ? `<button class="btn btn-sm btn-primary" data-deliver="${cmd.id}">Livrer</button>` : ''}
                  ${cmd.etat !== 'livree' ? `<button class="btn btn-sm btn-danger" data-cancel="${cmd.id}">Annuler</button>` : ''}
                </td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  attachTableEvents();
}

function getEtatBadge(etat) {
  const badges = {
    'brouillon': '<span class="badge badge-warning">Brouillon</span>',
    'validee': '<span class="badge badge-success">Validée</span>',
    'annulee': '<span class="badge badge-danger">Annulée</span>',
    'livree': '<span class="badge badge-secondary">Livrée</span>',
  };
  return badges[etat] || etat;
}

function attachEvents() {
  document.getElementById('btn-filter')?.addEventListener('click', () => {
    selectedDate = document.getElementById('filter-date').value;
    loadCommandes();
  });
}

function attachTableEvents() {
  document.querySelectorAll('[data-validate]').forEach(btn => {
    btn.addEventListener('click', () => updateEtat(parseInt(btn.dataset.validate), 'validee'));
  });

  document.querySelectorAll('[data-deliver]').forEach(btn => {
    btn.addEventListener('click', () => updateEtat(parseInt(btn.dataset.deliver), 'livree'));
  });

  document.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
        updateEtat(parseInt(btn.dataset.cancel), 'annulee');
      }
    });
  });
}

async function updateEtat(id, etat) {
  try {
    await apiService.patch(`/api/restauration/commandes/${id}/`, { etat });
    toast.success('Commande mise à jour');
    await loadCommandes();
  } catch (error) {
    console.error('Erreur mise à jour:', error);
    toast.error('Erreur lors de la mise à jour');
  }
}
