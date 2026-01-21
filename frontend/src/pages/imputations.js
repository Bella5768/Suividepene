/**
 * Page Imputations - Suivi des imputations budgétaires
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let imputations = [];
let currentPage = 1;
let totalPages = 1;

export async function renderImputations() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="imputations">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Imputations</span>
      </div>
      <div class="page-header">
        <h1>Imputations</h1>
      </div>
      <div id="imputations-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `;

  await loadImputations();
}

async function loadImputations() {
  const content = document.getElementById('imputations-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await apiService.get(`/api/imputations/?page=${currentPage}`);
    
    if (data.results) {
      imputations = data.results;
      totalPages = Math.ceil(data.count / 50);
    } else {
      imputations = Array.isArray(data) ? data : [];
      totalPages = 1;
    }

    renderImputationsTable();
  } catch (error) {
    console.error('Erreur chargement imputations:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des imputations.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderImputationsTable() {
  const content = document.getElementById('imputations-content');
  if (!content) return;

  if (imputations.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucune imputation trouvée. Les imputations sont créées automatiquement lors de la création d'opérations.
        </p>
      </div>
    `;
    return;
  }

  const totalImpute = imputations.reduce((sum, imp) => sum + parseFloat(imp.montant_impute || 0), 0);

  content.innerHTML = `
    <div class="card">
      <div class="table-header">
        <span>${imputations.length} imputation(s) - Total imputé: ${formatGNF(totalImpute)}</span>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Date opération</th>
              <th>Catégorie</th>
              <th>Prévision (mois)</th>
              <th>Montant opération</th>
              <th>Montant imputé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${imputations.map(imp => `
              <tr>
                <td>${formatDate(imp.operation_date || imp.created_at)}</td>
                <td>${imp.categorie_nom || '-'}</td>
                <td>${imp.prevision_mois ? formatMois(imp.prevision_mois) : '-'}</td>
                <td>${formatGNF(imp.operation_montant || 0)}</td>
                <td><strong>${formatGNF(imp.montant_impute)}</strong></td>
                <td>
                  <button class="btn btn-sm btn-danger" data-delete="${imp.id}">Supprimer</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${renderPagination()}
    </div>
  `;

  attachTableEvents();
}

function renderPagination() {
  if (totalPages <= 1) return '';
  
  return `
    <div class="pagination">
      <button class="btn btn-sm" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">Précédent</button>
      <span>Page ${currentPage} / ${totalPages}</span>
      <button class="btn btn-sm" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Suivant</button>
    </div>
  `;
}

function attachTableEvents() {
  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.delete);
      if (confirm('Êtes-vous sûr de vouloir supprimer cette imputation ?')) {
        deleteImputation(id);
      }
    });
  });

  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      loadImputations();
    });
  });
}

async function deleteImputation(id) {
  try {
    await apiService.delete(`/api/imputations/${id}/`);
    toast.success('Imputation supprimée');
    await loadImputations();
  } catch (error) {
    console.error('Erreur suppression:', error);
    toast.error('Erreur lors de la suppression');
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatMois(moisStr) {
  if (!moisStr) return '-';
  const date = new Date(moisStr);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

