/**
 * Page Operations - Gestion des opérations de dépenses
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let operations = [];
let categories = [];
let sousCategories = [];
let currentPage = 1;
let totalPages = 1;
let filters = {
  dateDebut: '',
  dateFin: '',
  categorie: '',
};
let editingOperation = null;
let showModal = false;

export async function renderOperations() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="operations">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Opérations</span>
      </div>
      <div class="page-header">
        <h1>Opérations</h1>
        <button class="btn btn-primary" id="btn-new-operation">+ Nouvelle opération</button>
      </div>
      
      <!-- Filtres -->
      <div class="card filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label>Date début</label>
            <input type="date" id="filter-date-debut" class="form-input" />
          </div>
          <div class="filter-group">
            <label>Date fin</label>
            <input type="date" id="filter-date-fin" class="form-input" />
          </div>
          <div class="filter-group">
            <label>Catégorie</label>
            <select id="filter-categorie" class="form-input">
              <option value="">Toutes</option>
            </select>
          </div>
          <div class="filter-group filter-actions">
            <button class="btn btn-secondary" id="btn-filter">Filtrer</button>
            <button class="btn btn-outline" id="btn-reset-filter">Réinitialiser</button>
          </div>
        </div>
      </div>

      <div id="operations-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" id="modal-overlay" style="display: none;">
      <div class="modal">
        <div class="modal-header">
          <h2 id="modal-title">Nouvelle opération</h2>
          <button class="modal-close" id="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="operation-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date *</label>
                <input type="date" id="form-date" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Catégorie *</label>
                <select id="form-categorie" class="form-input" required>
                  <option value="">Sélectionner...</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Sous-catégorie</label>
                <select id="form-sous-categorie" class="form-input">
                  <option value="">Aucune</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Unités *</label>
                <input type="number" id="form-unites" class="form-input" step="0.01" min="0.01" required />
              </div>
              <div class="form-group">
                <label class="form-label">Prix unitaire (GNF) *</label>
                <input type="number" id="form-prix" class="form-input" step="0.01" min="0.01" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Montant total</label>
              <input type="text" id="form-montant" class="form-input" readonly />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="form-description" class="form-input" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-cancel">Annuler</button>
              <button type="submit" class="btn btn-primary" id="btn-save">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Charger les données
  await loadCategories();
  await loadOperations();
  attachEvents();
}

async function loadCategories() {
  try {
    const data = await apiService.get('/api/categories/');
    categories = Array.isArray(data) ? data : (data.results || []);
    
    // Remplir les selects
    const filterSelect = document.getElementById('filter-categorie');
    const formSelect = document.getElementById('form-categorie');
    
    categories.forEach(cat => {
      if (filterSelect) {
        filterSelect.innerHTML += `<option value="${cat.id}">${cat.nom}</option>`;
      }
      if (formSelect) {
        formSelect.innerHTML += `<option value="${cat.id}">${cat.nom}</option>`;
      }
    });
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

async function loadOperations() {
  const content = document.getElementById('operations-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    let url = `/api/operations/?page=${currentPage}`;
    
    if (filters.dateDebut) url += `&date_operation__gte=${filters.dateDebut}`;
    if (filters.dateFin) url += `&date_operation__lte=${filters.dateFin}`;
    if (filters.categorie) url += `&categorie=${filters.categorie}`;
    
    const data = await apiService.get(url);
    
    if (data.results) {
      operations = data.results;
      totalPages = Math.ceil(data.count / 50);
    } else {
      operations = Array.isArray(data) ? data : [];
      totalPages = 1;
    }

    renderOperationsTable();
  } catch (error) {
    console.error('Erreur chargement opérations:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des opérations.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderOperationsTable() {
  const content = document.getElementById('operations-content');
  if (!content) return;

  if (operations.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucune opération trouvée.
        </p>
      </div>
    `;
    return;
  }

  const totalMontant = operations.reduce((sum, op) => sum + parseFloat(op.montant_depense || 0), 0);

  content.innerHTML = `
    <div class="card">
      <div class="table-header">
        <span>${operations.length} opération(s) - Total: ${formatGNF(totalMontant)}</span>
        <button class="btn btn-outline btn-sm" id="btn-export">Exporter CSV</button>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Catégorie</th>
              <th>Description</th>
              <th>Unités</th>
              <th>Prix unit.</th>
              <th>Montant</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${operations.map(op => `
              <tr>
                <td>${formatDate(op.date_operation)}</td>
                <td>${op.categorie_nom || getCategorieNom(op.categorie)}</td>
                <td>${op.description || '-'}</td>
                <td>${op.unites}</td>
                <td>${formatGNF(op.prix_unitaire)}</td>
                <td><strong>${formatGNF(op.montant_depense)}</strong></td>
                <td>
                  <button class="btn btn-sm btn-outline" data-edit="${op.id}">Modifier</button>
                  <button class="btn btn-sm btn-danger" data-delete="${op.id}">Supprimer</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ${renderPagination()}
    </div>
  `;

  // Attacher événements du tableau
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

function attachEvents() {
  // Bouton nouvelle opération
  document.getElementById('btn-new-operation')?.addEventListener('click', () => {
    editingOperation = null;
    openModal();
  });

  // Filtres
  document.getElementById('btn-filter')?.addEventListener('click', applyFilters);
  document.getElementById('btn-reset-filter')?.addEventListener('click', resetFilters);

  // Modal
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
  document.getElementById('btn-cancel')?.addEventListener('click', closeModal);
  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  });

  // Formulaire
  document.getElementById('operation-form')?.addEventListener('submit', handleSubmit);
  
  // Calcul automatique du montant
  document.getElementById('form-unites')?.addEventListener('input', calculateMontant);
  document.getElementById('form-prix')?.addEventListener('input', calculateMontant);
  
  // Chargement sous-catégories
  document.getElementById('form-categorie')?.addEventListener('change', (e) => {
    loadSousCategories(e.target.value);
  });
}

function attachTableEvents() {
  // Boutons modifier
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.edit);
      const op = operations.find(o => o.id === id);
      if (op) {
        editingOperation = op;
        openModal(op);
      }
    });
  });

  // Boutons supprimer
  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.delete);
      if (confirm('Êtes-vous sûr de vouloir supprimer cette opération ?')) {
        deleteOperation(id);
      }
    });
  });

  // Pagination
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      loadOperations();
    });
  });

  // Export
  document.getElementById('btn-export')?.addEventListener('click', exportCSV);
}

function openModal(operation = null) {
  const modal = document.getElementById('modal-overlay');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('operation-form');
  
  if (!modal || !form) return;

  title.textContent = operation ? 'Modifier l\'opération' : 'Nouvelle opération';
  
  // Remplir le formulaire
  document.getElementById('form-date').value = operation?.date_operation || new Date().toISOString().split('T')[0];
  document.getElementById('form-categorie').value = operation?.categorie || '';
  document.getElementById('form-unites').value = operation?.unites || '';
  document.getElementById('form-prix').value = operation?.prix_unitaire || '';
  document.getElementById('form-description').value = operation?.description || '';
  
  if (operation?.categorie) {
    loadSousCategories(operation.categorie).then(() => {
      document.getElementById('form-sous-categorie').value = operation.sous_categorie || '';
    });
  }
  
  calculateMontant();
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('modal-overlay');
  if (modal) modal.style.display = 'none';
  editingOperation = null;
}

function calculateMontant() {
  const unites = parseFloat(document.getElementById('form-unites')?.value) || 0;
  const prix = parseFloat(document.getElementById('form-prix')?.value) || 0;
  const montantField = document.getElementById('form-montant');
  
  if (montantField) {
    montantField.value = formatGNF(unites * prix);
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const data = {
    date_operation: document.getElementById('form-date').value,
    categorie: parseInt(document.getElementById('form-categorie').value),
    unites: parseFloat(document.getElementById('form-unites').value),
    prix_unitaire: parseFloat(document.getElementById('form-prix').value),
    description: document.getElementById('form-description').value,
  };
  
  const sousCategorie = document.getElementById('form-sous-categorie').value;
  if (sousCategorie) {
    data.sous_categorie = parseInt(sousCategorie);
  }

  try {
    if (editingOperation) {
      await apiService.put(`/api/operations/${editingOperation.id}/`, data);
      toast.success('Opération modifiée avec succès');
    } else {
      await apiService.post('/api/operations/', data);
      toast.success('Opération créée avec succès');
    }
    
    closeModal();
    await loadOperations();
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    toast.error(error.message || 'Erreur lors de la sauvegarde');
  }
}

async function deleteOperation(id) {
  try {
    await apiService.delete(`/api/operations/${id}/`);
    toast.success('Opération supprimée');
    await loadOperations();
  } catch (error) {
    console.error('Erreur suppression:', error);
    toast.error('Erreur lors de la suppression');
  }
}

function applyFilters() {
  filters.dateDebut = document.getElementById('filter-date-debut')?.value || '';
  filters.dateFin = document.getElementById('filter-date-fin')?.value || '';
  filters.categorie = document.getElementById('filter-categorie')?.value || '';
  currentPage = 1;
  loadOperations();
}

function resetFilters() {
  filters = { dateDebut: '', dateFin: '', categorie: '' };
  document.getElementById('filter-date-debut').value = '';
  document.getElementById('filter-date-fin').value = '';
  document.getElementById('filter-categorie').value = '';
  currentPage = 1;
  loadOperations();
}

async function exportCSV() {
  try {
    let url = '/api/operations/export_csv/?';
    if (filters.dateDebut) url += `date_debut=${filters.dateDebut}&`;
    if (filters.dateFin) url += `date_fin=${filters.dateFin}&`;
    if (filters.categorie) url += `categorie=${filters.categorie}&`;
    
    window.open(url, '_blank');
  } catch (error) {
    toast.error('Erreur lors de l\'export');
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getCategorieNom(categorieId) {
  const cat = categories.find(c => c.id === categorieId);
  return cat?.nom || 'N/A';
}

