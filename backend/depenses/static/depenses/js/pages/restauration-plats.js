/**
 * Page Restauration Plats - Gestion des plats
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let plats = [];
let editingPlat = null;

const CATEGORIES_RESTAU = [
  { id: 'PetitDej', nom: 'Petit-déjeuner' },
  { id: 'Dejeuner', nom: 'Déjeuner' },
  { id: 'Diner', nom: 'Dîner' },
  { id: 'Snack', nom: 'Collation' },
];

export async function renderRestaurationPlats() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="restauration-plats">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span>Restauration</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Plats</span>
      </div>
      <div class="page-header">
        <h1>Gestion des Plats</h1>
        <button class="btn btn-primary" id="btn-new-plat">+ Nouveau plat</button>
      </div>
      <div id="plats-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" id="modal-plat" style="display: none;">
      <div class="modal">
        <div class="modal-header">
          <h2 id="modal-plat-title">Nouveau plat</h2>
          <button class="modal-close" id="modal-plat-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="plat-form">
            <div class="form-group">
              <label class="form-label">Nom du plat *</label>
              <input type="text" id="form-nom" class="form-input" required maxlength="150" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Catégorie *</label>
                <select id="form-categorie" class="form-input" required>
                  ${CATEGORIES_RESTAU.map(c => `<option value="${c.id}">${c.nom}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Prix standard (GNF) *</label>
                <input type="number" id="form-prix" class="form-input" step="0.01" min="0.01" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="form-description" class="form-input" rows="3" maxlength="500"></textarea>
            </div>
            <div class="form-group">
              <label class="form-check">
                <input type="checkbox" id="form-actif" checked />
                <span>Plat actif</span>
              </label>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-plat-cancel">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  await loadPlats();
  attachEvents();
}

async function loadPlats() {
  const content = document.getElementById('plats-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await apiService.get('/api/restauration/plats/');
    plats = Array.isArray(data) ? data : (data.results || []);
    renderPlatsTable();
  } catch (error) {
    console.error('Erreur chargement plats:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des plats.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderPlatsTable() {
  const content = document.getElementById('plats-content');
  if (!content) return;

  if (plats.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucun plat trouvé. Créez votre premier plat.
        </p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="card">
      <div class="table-header">
        <span>${plats.length} plat(s)</span>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${plats.map(plat => `
              <tr>
                <td><strong>${plat.nom}</strong></td>
                <td>${getCategorieNom(plat.categorie_restau)}</td>
                <td>${formatGNF(plat.prix_standard)}</td>
                <td>${plat.actif ? '<span class="badge badge-success">Actif</span>' : '<span class="badge badge-secondary">Inactif</span>'}</td>
                <td>
                  <button class="btn btn-sm btn-outline" data-edit="${plat.id}">Modifier</button>
                  <button class="btn btn-sm btn-danger" data-delete="${plat.id}">Supprimer</button>
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

function getCategorieNom(id) {
  const cat = CATEGORIES_RESTAU.find(c => c.id === id);
  return cat?.nom || id;
}

function attachEvents() {
  document.getElementById('btn-new-plat')?.addEventListener('click', () => {
    editingPlat = null;
    openModal();
  });

  document.getElementById('modal-plat-close')?.addEventListener('click', closeModal);
  document.getElementById('btn-plat-cancel')?.addEventListener('click', closeModal);
  document.getElementById('modal-plat')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-plat') closeModal();
  });

  document.getElementById('plat-form')?.addEventListener('submit', handleSubmit);
}

function attachTableEvents() {
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.edit);
      const plat = plats.find(p => p.id === id);
      if (plat) {
        editingPlat = plat;
        openModal(plat);
      }
    });
  });

  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.delete);
      if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
        deletePlat(id);
      }
    });
  });
}

function openModal(plat = null) {
  const modal = document.getElementById('modal-plat');
  const title = document.getElementById('modal-plat-title');
  
  if (!modal) return;

  title.textContent = plat ? 'Modifier le plat' : 'Nouveau plat';
  document.getElementById('form-nom').value = plat?.nom || '';
  document.getElementById('form-categorie').value = plat?.categorie_restau || 'Dejeuner';
  document.getElementById('form-prix').value = plat?.prix_standard || '';
  document.getElementById('form-description').value = plat?.description || '';
  document.getElementById('form-actif').checked = plat?.actif !== false;
  
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('modal-plat');
  if (modal) modal.style.display = 'none';
  editingPlat = null;
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const data = {
    nom: document.getElementById('form-nom').value,
    categorie_restau: document.getElementById('form-categorie').value,
    prix_standard: parseFloat(document.getElementById('form-prix').value),
    description: document.getElementById('form-description').value,
    actif: document.getElementById('form-actif').checked,
  };

  try {
    if (editingPlat) {
      await apiService.put(`/api/restauration/plats/${editingPlat.id}/`, data);
      toast.success('Plat modifié');
    } else {
      await apiService.post('/api/restauration/plats/', data);
      toast.success('Plat créé');
    }
    
    closeModal();
    await loadPlats();
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    toast.error(error.message || 'Erreur lors de la sauvegarde');
  }
}

async function deletePlat(id) {
  try {
    await apiService.delete(`/api/restauration/plats/${id}/`);
    toast.success('Plat supprimé');
    await loadPlats();
  } catch (error) {
    console.error('Erreur suppression:', error);
    toast.error('Erreur lors de la suppression');
  }
}
