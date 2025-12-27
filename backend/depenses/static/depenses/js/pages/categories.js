/**
 * Page Categories - Gestion des catégories de dépenses
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let categories = [];
let sousCategories = [];
let editingCategorie = null;
let editingSousCategorie = null;

export async function renderCategories() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="categories">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Catégories</span>
      </div>
      <div class="page-header">
        <h1>Catégories</h1>
        <button class="btn btn-primary" id="btn-new-categorie">+ Nouvelle catégorie</button>
      </div>
      <div id="categories-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>

    <!-- Modal Catégorie -->
    <div class="modal-overlay" id="modal-categorie" style="display: none;">
      <div class="modal">
        <div class="modal-header">
          <h2 id="modal-cat-title">Nouvelle catégorie</h2>
          <button class="modal-close" id="modal-cat-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="categorie-form">
            <div class="form-group">
              <label class="form-label">Code *</label>
              <input type="text" id="form-cat-code" class="form-input" required maxlength="20" />
            </div>
            <div class="form-group">
              <label class="form-label">Nom *</label>
              <input type="text" id="form-cat-nom" class="form-input" required maxlength="100" />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="form-cat-description" class="form-input" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-cat-cancel">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Sous-catégorie -->
    <div class="modal-overlay" id="modal-sous-categorie" style="display: none;">
      <div class="modal">
        <div class="modal-header">
          <h2 id="modal-sc-title">Nouvelle sous-catégorie</h2>
          <button class="modal-close" id="modal-sc-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="sous-categorie-form">
            <input type="hidden" id="form-sc-categorie-id" />
            <div class="form-group">
              <label class="form-label">Catégorie</label>
              <input type="text" id="form-sc-categorie-nom" class="form-input" readonly />
            </div>
            <div class="form-group">
              <label class="form-label">Nom *</label>
              <input type="text" id="form-sc-nom" class="form-input" required maxlength="100" />
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="form-sc-description" class="form-input" rows="3"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-sc-cancel">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  await loadCategories();
  attachEvents();
}

async function loadCategories() {
  const content = document.getElementById('categories-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await apiService.get('/api/categories/');
    categories = Array.isArray(data) ? data : (data.results || []);
    
    // Charger les sous-catégories pour chaque catégorie
    for (let cat of categories) {
      const scData = await apiService.get(`/api/sous-categories/?categorie=${cat.id}`);
      cat.sous_categories = Array.isArray(scData) ? scData : (scData.results || []);
    }

    renderCategoriesList();
  } catch (error) {
    console.error('Erreur chargement catégories:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des catégories.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderCategoriesList() {
  const content = document.getElementById('categories-content');
  if (!content) return;

  if (categories.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucune catégorie trouvée. Créez votre première catégorie.
        </p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="categories-grid">
      ${categories.map(cat => `
        <div class="card categorie-card">
          <div class="categorie-header">
            <div>
              <span class="categorie-code">${cat.code}</span>
              <h3 class="categorie-nom">${cat.nom}</h3>
              ${cat.description ? `<p class="categorie-desc">${cat.description}</p>` : ''}
            </div>
            <div class="categorie-actions">
              <button class="btn btn-sm btn-outline" data-edit-cat="${cat.id}">Modifier</button>
              <button class="btn btn-sm btn-danger" data-delete-cat="${cat.id}">Supprimer</button>
            </div>
          </div>
          
          <div class="sous-categories">
            <div class="sous-categories-header">
              <span>Sous-catégories (${cat.sous_categories?.length || 0})</span>
              <button class="btn btn-sm btn-outline" data-add-sc="${cat.id}" data-cat-nom="${cat.nom}">+ Ajouter</button>
            </div>
            ${cat.sous_categories && cat.sous_categories.length > 0 ? `
              <ul class="sous-categories-list">
                ${cat.sous_categories.map(sc => `
                  <li>
                    <span>${sc.nom}</span>
                    <div>
                      <button class="btn-icon" data-edit-sc="${sc.id}" data-cat-id="${cat.id}">✏️</button>
                      <button class="btn-icon" data-delete-sc="${sc.id}">🗑️</button>
                    </div>
                  </li>
                `).join('')}
              </ul>
            ` : '<p class="no-sous-cat">Aucune sous-catégorie</p>'}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  attachTableEvents();
}

function attachEvents() {
  // Nouvelle catégorie
  document.getElementById('btn-new-categorie')?.addEventListener('click', () => {
    editingCategorie = null;
    openCategorieModal();
  });

  // Modal catégorie
  document.getElementById('modal-cat-close')?.addEventListener('click', closeCategorieModal);
  document.getElementById('btn-cat-cancel')?.addEventListener('click', closeCategorieModal);
  document.getElementById('modal-categorie')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-categorie') closeCategorieModal();
  });
  document.getElementById('categorie-form')?.addEventListener('submit', handleCategorieSubmit);

  // Modal sous-catégorie
  document.getElementById('modal-sc-close')?.addEventListener('click', closeSousCategorieModal);
  document.getElementById('btn-sc-cancel')?.addEventListener('click', closeSousCategorieModal);
  document.getElementById('modal-sous-categorie')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-sous-categorie') closeSousCategorieModal();
  });
  document.getElementById('sous-categorie-form')?.addEventListener('submit', handleSousCategorieSubmit);
}

function attachTableEvents() {
  // Modifier catégorie
  document.querySelectorAll('[data-edit-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.editCat);
      const cat = categories.find(c => c.id === id);
      if (cat) {
        editingCategorie = cat;
        openCategorieModal(cat);
      }
    });
  });

  // Supprimer catégorie
  document.querySelectorAll('[data-delete-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.deleteCat);
      if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie et toutes ses sous-catégories ?')) {
        deleteCategorie(id);
      }
    });
  });

  // Ajouter sous-catégorie
  document.querySelectorAll('[data-add-sc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = parseInt(btn.dataset.addSc);
      const catNom = btn.dataset.catNom;
      editingSousCategorie = null;
      openSousCategorieModal(catId, catNom);
    });
  });

  // Modifier sous-catégorie
  document.querySelectorAll('[data-edit-sc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const scId = parseInt(btn.dataset.editSc);
      const catId = parseInt(btn.dataset.catId);
      const cat = categories.find(c => c.id === catId);
      const sc = cat?.sous_categories?.find(s => s.id === scId);
      if (sc && cat) {
        editingSousCategorie = sc;
        openSousCategorieModal(catId, cat.nom, sc);
      }
    });
  });

  // Supprimer sous-catégorie
  document.querySelectorAll('[data-delete-sc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.deleteSc);
      if (confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?')) {
        deleteSousCategorie(id);
      }
    });
  });
}

function openCategorieModal(categorie = null) {
  const modal = document.getElementById('modal-categorie');
  const title = document.getElementById('modal-cat-title');
  
  if (!modal) return;

  title.textContent = categorie ? 'Modifier la catégorie' : 'Nouvelle catégorie';
  document.getElementById('form-cat-code').value = categorie?.code || '';
  document.getElementById('form-cat-nom').value = categorie?.nom || '';
  document.getElementById('form-cat-description').value = categorie?.description || '';
  
  modal.style.display = 'flex';
}

function closeCategorieModal() {
  const modal = document.getElementById('modal-categorie');
  if (modal) modal.style.display = 'none';
  editingCategorie = null;
}

function openSousCategorieModal(categorieId, categorieNom, sousCategorie = null) {
  const modal = document.getElementById('modal-sous-categorie');
  const title = document.getElementById('modal-sc-title');
  
  if (!modal) return;

  title.textContent = sousCategorie ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie';
  document.getElementById('form-sc-categorie-id').value = categorieId;
  document.getElementById('form-sc-categorie-nom').value = categorieNom;
  document.getElementById('form-sc-nom').value = sousCategorie?.nom || '';
  document.getElementById('form-sc-description').value = sousCategorie?.description || '';
  
  modal.style.display = 'flex';
}

function closeSousCategorieModal() {
  const modal = document.getElementById('modal-sous-categorie');
  if (modal) modal.style.display = 'none';
  editingSousCategorie = null;
}

async function handleCategorieSubmit(e) {
  e.preventDefault();
  
  const data = {
    code: document.getElementById('form-cat-code').value,
    nom: document.getElementById('form-cat-nom').value,
    description: document.getElementById('form-cat-description').value,
  };

  try {
    if (editingCategorie) {
      await apiService.put(`/api/categories/${editingCategorie.id}/`, data);
      toast.success('Catégorie modifiée');
    } else {
      await apiService.post('/api/categories/', data);
      toast.success('Catégorie créée');
    }
    
    closeCategorieModal();
    await loadCategories();
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    toast.error(error.message || 'Erreur lors de la sauvegarde');
  }
}

async function handleSousCategorieSubmit(e) {
  e.preventDefault();
  
  const data = {
    categorie: parseInt(document.getElementById('form-sc-categorie-id').value),
    nom: document.getElementById('form-sc-nom').value,
    description: document.getElementById('form-sc-description').value,
  };

  try {
    if (editingSousCategorie) {
      await apiService.put(`/api/sous-categories/${editingSousCategorie.id}/`, data);
      toast.success('Sous-catégorie modifiée');
    } else {
      await apiService.post('/api/sous-categories/', data);
      toast.success('Sous-catégorie créée');
    }
    
    closeSousCategorieModal();
    await loadCategories();
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    toast.error(error.message || 'Erreur lors de la sauvegarde');
  }
}

async function deleteCategorie(id) {
  try {
    await apiService.delete(`/api/categories/${id}/`);
    toast.success('Catégorie supprimée');
    await loadCategories();
  } catch (error) {
    console.error('Erreur suppression:', error);
    toast.error('Erreur lors de la suppression');
  }
}

async function deleteSousCategorie(id) {
  try {
    await apiService.delete(`/api/sous-categories/${id}/`);
    toast.success('Sous-catégorie supprimée');
    await loadCategories();
  } catch (error) {
    console.error('Erreur suppression:', error);
    toast.error('Erreur lors de la suppression');
  }
}

