/**
 * Page Restauration Menus - Gestion des menus du jour
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let menus = [];
let plats = [];
let editingMenu = null;

export async function renderRestaurationMenus() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="restauration-menus">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span>Restauration</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Menus</span>
      </div>
      <div class="page-header">
        <h1>Gestion des Menus</h1>
        <button class="btn btn-primary" id="btn-new-menu">+ Nouveau menu</button>
      </div>
      <div id="menus-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>

    <!-- Modal Menu -->
    <div class="modal-overlay" id="modal-menu" style="display: none;">
      <div class="modal">
        <div class="modal-header">
          <h2 id="modal-menu-title">Nouveau menu</h2>
          <button class="modal-close" id="modal-menu-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="menu-form">
            <div class="form-group">
              <label class="form-label">Date du menu *</label>
              <input type="date" id="form-date" class="form-input" required />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-menu-cancel">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  await loadPlats();
  await loadMenus();
  attachEvents();
}

async function loadPlats() {
  try {
    const data = await apiService.get('/api/restauration/plats/?actif=true');
    plats = Array.isArray(data) ? data : (data.results || []);
  } catch (error) {
    console.error('Erreur chargement plats:', error);
  }
}

async function loadMenus() {
  const content = document.getElementById('menus-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await apiService.get('/api/restauration/menus/');
    menus = Array.isArray(data) ? data : (data.results || []);
    renderMenusList();
  } catch (error) {
    console.error('Erreur chargement menus:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des menus.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderMenusList() {
  const content = document.getElementById('menus-content');
  if (!content) return;

  if (menus.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucun menu trouvé. Créez votre premier menu.
        </p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="card">
      <div class="table-header">
        <span>${menus.length} menu(s)</span>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Plats</th>
              <th>Statut</th>
              <th>Lien public</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${menus.map(menu => `
              <tr>
                <td><strong>${formatDate(menu.date_menu)}</strong></td>
                <td>${menu.menu_plats?.length || 0} plat(s)</td>
                <td>${menu.publication_at ? '<span class="badge badge-success">Publié</span>' : '<span class="badge badge-warning">Brouillon</span>'}</td>
                <td>${menu.token_public ? `<a href="/commander/${menu.token_public}" target="_blank" class="btn btn-sm btn-outline">Voir</a>` : '-'}</td>
                <td>
                  ${!menu.publication_at ? `<button class="btn btn-sm btn-success" data-publish="${menu.id}">Publier</button>` : ''}
                  <button class="btn btn-sm btn-danger" data-delete="${menu.id}">Supprimer</button>
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

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

function attachEvents() {
  document.getElementById('btn-new-menu')?.addEventListener('click', () => {
    editingMenu = null;
    openModal();
  });

  document.getElementById('modal-menu-close')?.addEventListener('click', closeModal);
  document.getElementById('btn-menu-cancel')?.addEventListener('click', closeModal);
  document.getElementById('modal-menu')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-menu') closeModal();
  });

  document.getElementById('menu-form')?.addEventListener('submit', handleSubmit);
}

function attachTableEvents() {
  document.querySelectorAll('[data-publish]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.publish);
      publishMenu(id);
    });
  });

  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.delete);
      if (confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
        deleteMenu(id);
      }
    });
  });
}

function openModal() {
  const modal = document.getElementById('modal-menu');
  if (!modal) return;

  document.getElementById('form-date').value = new Date().toISOString().split('T')[0];
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('modal-menu');
  if (modal) modal.style.display = 'none';
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const data = {
    date_menu: document.getElementById('form-date').value,
  };

  try {
    await apiService.post('/api/restauration/menus/', data);
    toast.success('Menu créé');
    closeModal();
    await loadMenus();
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    toast.error(error.message || 'Erreur lors de la sauvegarde');
  }
}

async function publishMenu(id) {
  try {
    await apiService.post(`/api/restauration/menus/${id}/publier/`);
    toast.success('Menu publié');
    await loadMenus();
  } catch (error) {
    console.error('Erreur publication:', error);
    toast.error('Erreur lors de la publication');
  }
}

async function deleteMenu(id) {
  try {
    await apiService.delete(`/api/restauration/menus/${id}/`);
    toast.success('Menu supprimé');
    await loadMenus();
  } catch (error) {
    console.error('Erreur suppression:', error);
    toast.error('Erreur lors de la suppression');
  }
}
