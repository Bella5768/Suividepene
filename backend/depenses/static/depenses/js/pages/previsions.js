/**
 * Page Previsions - Gestion des prévisions budgétaires
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let previsions = [];
let categories = [];
let sousCategories = [];
let selectedMois = new Date().toISOString().slice(0, 7);
let editingPrevision = null;

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
        <button class="btn btn-primary" id="btn-new-prevision">+ Nouvelle prévision</button>
      </div>
      
      <!-- Filtre par mois -->
      <div class="card filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label>Mois</label>
            <input type="month" id="filter-mois" class="form-input" value="${selectedMois}" />
          </div>
          <div class="filter-group filter-actions">
            <button class="btn btn-secondary" id="btn-filter">Afficher</button>
          </div>
        </div>
      </div>

      <div id="previsions-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" id="modal-overlay" style="display: none;">
      <div class="modal">
        <div class="modal-header">
          <h2 id="modal-title">Nouvelle prévision</h2>
          <button class="modal-close" id="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="prevision-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Mois *</label>
                <input type="month" id="form-mois" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Statut</label>
                <select id="form-statut" class="form-input">
                  <option value="draft">Brouillon</option>
                  <option value="validated">Validée</option>
                  <option value="closed">Clôturée</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Catégorie *</label>
                <select id="form-categorie" class="form-input" required>
                  <option value="">Sélectionner...</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Sous-catégorie</label>
                <select id="form-sous-categorie" class="form-input">
                  <option value="">Aucune</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Montant prévu (GNF) *</label>
              <input type="number" id="form-montant" class="form-input" step="0.01" min="0.01" required />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  await loadCategories();
  await loadPrevisions();
  attachEvents();
}

async function loadCategories() {
  try {
    const data = await apiService.get('/api/categories/');
    categories = Array.isArray(data) ? data : (data.results || []);
    
    const select = document.getElementById('form-categorie');
    if (select) {
      categories.forEach(cat => {
        select.innerHTML += `<option value="${cat.id}">${cat.nom}</option>`;
      });
    }
  } catch (error) {
    console.error('Erreur chargement catégories:', error);
  }
}

async function loadSousCategories(categorieId) {
  const select = document.getElementById('form-sous-categorie');
  if (!select) return;
  
  select.innerHTML = '<option value="">Aucune</option>';
  if (!categorieId) return;
  
  try {
    const data = await apiService.get(`/api/sous-categories/?categorie=${categorieId}`);
    sousCategories = Array.isArray(data) ? data : (data.results || []);
    sousCategories.forEach(sc => {
      select.innerHTML += `<option value="${sc.id}">${sc.nom}</option>`;
    });
  } catch (error) {
    console.error('Erreur chargement sous-catégories:', error);
  }
}

async function loadPrevisions() {
  const content = document.getElementById('previsions-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const moisDate = `${selectedMois}-01`;
    const data = await apiService.get(`/api/previsions/?mois=${moisDate}`);
    previsions = Array.isArray(data) ? data : (data.results || []);
    renderPrevisionsTable();
  } catch (error) {
    console.error('Erreur chargement prévisions:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des prévisions.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderPrevisionsTable() {
  const content = document.getElementById('previsions-content');
  if (!content) return;

  if (previsions.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucune prévision pour ce mois.
        </p>
      </div>
    `;
    return;
  }

  const totalPrevu = previsions.reduce((sum, p) => sum + parseFloat(p.montant_prevu || 0), 0);

  content.innerHTML = `
    <div class="card">
      <div class="table-header">
        <span>${previsions.length} prévision(s) - Total: ${formatGNF(totalPrevu)}</span>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Catégorie</th>
              <th>Sous-catégorie</th>
              <th>Montant prévu</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${previsions.map(p => `
              <tr>
                <td>${p.categorie_nom || getCategorieNom(p.categorie)}</td>
                <td>${p.sous_categorie_nom || '-'}</td>
                <td><strong>${formatGNF(p.montant_prevu)}</strong></td>
                <td>${getStatutBadge(p.statut)}</td>
                <td>
                  <button class="btn btn-sm btn-outline" data-edit="${p.id}">Modifier</button>
                  <button class="btn btn-sm btn-danger" data-delete="${p.id}">Supprimer</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  attachTableEvents();
}

function getStatutBadge(statut) {
  const badges = {
    'draft': '<span class="badge badge-warning">Brouillon</span>',
    'validated': '<span class="badge badge-success">Validée</span>',
    'closed': '<span class="badge badge-secondary">Clôturée</span>',
  };
  return badges[statut] || statut;
}

function attachEvents() {
  document.getElementById('btn-new-prevision')?.addEventListener('click', () => {
    editingPrevision = null;
    openModal();
  });

  document.getElementById('btn-filter')?.addEventListener('click', () => {
    selectedMois = document.getElementById('filter-mois').value;
    loadPrevisions();
  });

  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  document.getElementById('prevision-form')?.addEventListener('submit', handleSubmit);
  
  document.getElementById('form-categorie')?.addEventListener('change', (e) => {
    loadSousCategories(e.target.value);
  });
}

function attachTableEvents() {
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.edit);
      const p = previsions.find(prev => prev.id === id);
      if (p) {
        editingPrevision = p;
        openModal(p);
      }
    });
  });

  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.delete);
      if (confirm('Êtes-vous sûr de vouloir supprimer cette prévision ?')) {
        deletePrevision(id);
      }
    });
  });
}

function openModal(prevision = null) {
  const modal = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  
  if (!modal) return;

  title.textContent = prevision ? 'Modifier la prévision' : 'Nouvelle prévision';
  
  const moisValue = prevision?.mois ? prevision.mois.slice(0, 7) : selectedMois;
  document.getElementById('form-mois').value = moisValue;
  document.getElementById('form-statut').value = prevision?.statut || 'draft';
  document.getElementById('form-categorie').value = prevision?.categorie || '';
  document.getElementById('form-montant').value = prevision?.montant_prevu || '';
  
  if (prevision?.categorie) {
    loadSousCategories(prevision.categorie).then(() => {
      document.getElementById('form-sous-categorie').value = prevision.sous_categorie || '';
    });
  }
  
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('modal-overlay');
  if (modal) modal.style.display = 'none';
  editingPrevision = null;
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const moisValue = document.getElementById('form-mois').value;
  const data = {
    mois: `${moisValue}-01`,
    categorie: parseInt(document.getElementById('form-categorie').value),
    montant_prevu: parseFloat(document.getElementById('form-montant').value),
    statut: document.getElementById('form-statut').value,
  };
  
  const sousCategorie = document.getElementById('form-sous-categorie').value;
  if (sousCategorie) {
    data.sous_categorie = parseInt(sousCategorie);
  }

  try {
    if (editingPrevision) {
      await apiService.put(`/api/previsions/${editingPrevision.id}/`, data);
      toast.success('Prévision modifiée');
    } else {
      await apiService.post('/api/previsions/', data);
      toast.success('Prévision créée');
    }
    
    closeModal();
    await loadPrevisions();
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    toast.error(error.message || 'Erreur lors de la sauvegarde');
  }
}

async function deletePrevision(id) {
  try {
    await apiService.delete(`/api/previsions/${id}/`);
    toast.success('Prévision supprimée');
    await loadPrevisions();
  } catch (error) {
    console.error('Erreur suppression:', error);
    toast.error('Erreur lors de la suppression');
  }
}

function getCategorieNom(categorieId) {
  const cat = categories.find(c => c.id === categorieId);
  return cat?.nom || 'N/A';
}

