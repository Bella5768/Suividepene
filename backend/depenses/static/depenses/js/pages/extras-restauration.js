/**
 * Page Extras Restauration - Visiteurs, stagiaires, activités
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let extras = [];
let editingExtra = null;

const TYPES_EXTRA = [
  { id: 'visiteur', nom: 'Visiteur' },
  { id: 'stagiaire', nom: 'Stagiaire' },
  { id: 'activite', nom: 'Activité' },
];

export async function renderExtrasRestauration() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="extras-restauration">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span>Restauration</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Extras</span>
      </div>
      <div class="page-header">
        <h1>Extras Restauration</h1>
        <button class="btn btn-primary" id="btn-new-extra">+ Nouvel extra</button>
      </div>
      <div id="extras-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" id="modal-extra" style="display: none;">
      <div class="modal">
        <div class="modal-header">
          <h2 id="modal-extra-title">Nouvel extra</h2>
          <button class="modal-close" id="modal-extra-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="extra-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Type *</label>
                <select id="form-type" class="form-input" required>
                  ${TYPES_EXTRA.map(t => `<option value="${t.id}">${t.nom}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Date *</label>
                <input type="date" id="form-date" class="form-input" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Nom / Description *</label>
              <input type="text" id="form-nom" class="form-input" required maxlength="200" />
            </div>
            <div class="form-group">
              <label class="form-label">Plat *</label>
              <input type="text" id="form-plat" class="form-input" required maxlength="200" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Quantité *</label>
                <input type="number" id="form-quantite" class="form-input" step="0.01" min="0.01" value="1" required />
              </div>
              <div class="form-group">
                <label class="form-label">Prix unitaire (GNF) *</label>
                <input type="number" id="form-prix" class="form-input" step="0.01" min="0.01" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Description supplémentaire</label>
              <textarea id="form-description" class="form-input" rows="2"></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-extra-cancel">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  await loadExtras();
  attachEvents();
}

async function loadExtras() {
  const content = document.getElementById('extras-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await apiService.get('/api/restauration/extras/');
    extras = Array.isArray(data) ? data : (data.results || []);
    renderExtrasTable();
  } catch (error) {
    console.error('Erreur chargement extras:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des extras.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderExtrasTable() {
  const content = document.getElementById('extras-content');
  if (!content) return;

  if (extras.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucun extra trouvé.
        </p>
      </div>
    `;
    return;
  }

  const total = extras.reduce((sum, e) => sum + parseFloat(e.montant_total || 0), 0);

  content.innerHTML = `
    <div class="card">
      <div class="table-header">
        <span>${extras.length} extra(s) - Total: ${formatGNF(total)}</span>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Nom</th>
              <th>Plat</th>
              <th>Montant</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${extras.map(e => `
              <tr>
                <td>${formatDate(e.date_operation)}</td>
                <td>${getTypeNom(e.type_extra)}</td>
                <td><strong>${e.nom_personne}</strong></td>
                <td>${e.plat_nom}</td>
                <td><strong>${formatGNF(e.montant_total)}</strong></td>
                <td>
                  <button class="btn btn-sm btn-outline" data-edit="${e.id}">Modifier</button>
                  <button class="btn btn-sm btn-danger" data-delete="${e.id}">Supprimer</button>
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

function getTypeNom(id) {
  const t = TYPES_EXTRA.find(x => x.id === id);
  return t?.nom || id;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function attachEvents() {
  document.getElementById('btn-new-extra')?.addEventListener('click', () => {
    editingExtra = null;
    openModal();
  });

  document.getElementById('modal-extra-close')?.addEventListener('click', closeModal);
  document.getElementById('btn-extra-cancel')?.addEventListener('click', closeModal);
  document.getElementById('modal-extra')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-extra') closeModal();
  });

  document.getElementById('extra-form')?.addEventListener('submit', handleSubmit);
}

function attachTableEvents() {
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.edit);
      const extra = extras.find(e => e.id === id);
      if (extra) {
        editingExtra = extra;
        openModal(extra);
      }
    });
  });

  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.delete);
      if (confirm('Êtes-vous sûr de vouloir supprimer cet extra ?')) {
        deleteExtra(id);
      }
    });
  });
}

function openModal(extra = null) {
  const modal = document.getElementById('modal-extra');
  const title = document.getElementById('modal-extra-title');
  
  if (!modal) return;

  title.textContent = extra ? 'Modifier l\'extra' : 'Nouvel extra';
  document.getElementById('form-type').value = extra?.type_extra || 'visiteur';
  document.getElementById('form-date').value = extra?.date_operation || new Date().toISOString().split('T')[0];
  document.getElementById('form-nom').value = extra?.nom_personne || '';
  document.getElementById('form-plat').value = extra?.plat_nom || '';
  document.getElementById('form-quantite').value = extra?.quantite || 1;
  document.getElementById('form-prix').value = extra?.prix_unitaire || '';
  document.getElementById('form-description').value = extra?.description || '';
  
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('modal-extra');
  if (modal) modal.style.display = 'none';
  editingExtra = null;
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const data = {
    type_extra: document.getElementById('form-type').value,
    date_operation: document.getElementById('form-date').value,
    nom_personne: document.getElementById('form-nom').value,
    plat_nom: document.getElementById('form-plat').value,
    quantite: parseFloat(document.getElementById('form-quantite').value),
    prix_unitaire: parseFloat(document.getElementById('form-prix').value),
    description: document.getElementById('form-description').value,
  };

  try {
    if (editingExtra) {
      await apiService.put(`/api/restauration/extras/${editingExtra.id}/`, data);
      toast.success('Extra modifié');
    } else {
      await apiService.post('/api/restauration/extras/', data);
      toast.success('Extra créé');
    }
    
    closeModal();
    await loadExtras();
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    toast.error(error.message || 'Erreur lors de la sauvegarde');
  }
}

async function deleteExtra(id) {
  try {
    await apiService.delete(`/api/restauration/extras/${id}/`);
    toast.success('Extra supprimé');
    await loadExtras();
  } catch (error) {
    console.error('Erreur suppression:', error);
    toast.error('Erreur lors de la suppression');
  }
}

