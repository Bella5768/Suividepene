/**
 * Page Utilisateurs - Gestion des utilisateurs et permissions
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let utilisateurs = [];
let editingUser = null;

const FONCTIONNALITES = [
  { id: 'dashboard', nom: 'Tableau de bord' },
  { id: 'operations', nom: 'Opérations' },
  { id: 'previsions', nom: 'Prévisions' },
  { id: 'imputations', nom: 'Imputations' },
  { id: 'rapports', nom: 'Rapports' },
  { id: 'categories', nom: 'Catégories' },
  { id: 'utilisateurs', nom: 'Utilisateurs' },
  { id: 'audit', nom: 'Audit' },
  { id: 'restauration_commandes', nom: 'Commander (Restauration)' },
  { id: 'restauration_menus', nom: 'Menus (Restauration)' },
  { id: 'restauration_plats', nom: 'Plats (Restauration)' },
  { id: 'tableau_bord_cantine', nom: 'Tableau de Bord Cantine' },
];

export async function renderUtilisateurs() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="utilisateurs">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Utilisateurs</span>
      </div>
      <div class="page-header">
        <h1>Utilisateurs</h1>
        <button class="btn btn-primary" id="btn-new-user">+ Nouvel utilisateur</button>
      </div>
      <div id="utilisateurs-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>

    <!-- Modal Utilisateur -->
    <div class="modal-overlay" id="modal-user" style="display: none;">
      <div class="modal" style="max-width: 700px;">
        <div class="modal-header">
          <h2 id="modal-user-title">Nouvel utilisateur</h2>
          <button class="modal-close" id="modal-user-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="user-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nom d'utilisateur *</label>
                <input type="text" id="form-username" class="form-input" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" id="form-email" class="form-input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Mot de passe ${editingUser ? '(laisser vide pour ne pas changer)' : '*'}</label>
                <input type="password" id="form-password" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Confirmer mot de passe</label>
                <input type="password" id="form-password2" class="form-input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-check">
                  <input type="checkbox" id="form-is-staff" />
                  <span>Staff (accès admin)</span>
                </label>
              </div>
              <div class="form-group">
                <label class="form-check">
                  <input type="checkbox" id="form-is-superuser" />
                  <span>Superutilisateur</span>
                </label>
              </div>
              <div class="form-group">
                <label class="form-check">
                  <input type="checkbox" id="form-is-active" checked />
                  <span>Actif</span>
                </label>
              </div>
            </div>
            
            <h3 style="margin-top: 1.5rem; margin-bottom: 1rem; font-size: 1rem;">Permissions</h3>
            <div class="permissions-grid" id="permissions-grid">
              ${FONCTIONNALITES.map(f => `
                <div class="permission-item">
                  <label class="form-check">
                    <input type="checkbox" data-perm="${f.id}" />
                    <span>${f.nom}</span>
                  </label>
                </div>
              `).join('')}
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-user-cancel">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  await loadUtilisateurs();
  attachEvents();
}

async function loadUtilisateurs() {
  const content = document.getElementById('utilisateurs-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await apiService.get('/api/users/');
    utilisateurs = Array.isArray(data) ? data : (data.results || []);
    renderUtilisateursTable();
  } catch (error) {
    console.error('Erreur chargement utilisateurs:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des utilisateurs.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderUtilisateursTable() {
  const content = document.getElementById('utilisateurs-content');
  if (!content) return;

  if (utilisateurs.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucun utilisateur trouvé.
        </p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="card">
      <div class="table-header">
        <span>${utilisateurs.length} utilisateur(s)</span>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${utilisateurs.map(user => `
              <tr>
                <td><strong>${user.username}</strong></td>
                <td>${user.email || '-'}</td>
                <td>${getRoleBadge(user)}</td>
                <td>${user.is_active ? '<span class="badge badge-success">Actif</span>' : '<span class="badge badge-danger">Inactif</span>'}</td>
                <td>
                  <button class="btn btn-sm btn-outline" data-edit="${user.id}">Modifier</button>
                  <button class="btn btn-sm btn-danger" data-delete="${user.id}">Supprimer</button>
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

function getRoleBadge(user) {
  if (user.is_superuser) return '<span class="badge badge-danger">Superadmin</span>';
  if (user.is_staff) return '<span class="badge badge-warning">Staff</span>';
  return '<span class="badge badge-secondary">Utilisateur</span>';
}

function attachEvents() {
  document.getElementById('btn-new-user')?.addEventListener('click', () => {
    editingUser = null;
    openUserModal();
  });

  document.getElementById('modal-user-close')?.addEventListener('click', closeUserModal);
  document.getElementById('btn-user-cancel')?.addEventListener('click', closeUserModal);
  document.getElementById('modal-user')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-user') closeUserModal();
  });

  document.getElementById('user-form')?.addEventListener('submit', handleUserSubmit);
}

function attachTableEvents() {
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.edit);
      const user = utilisateurs.find(u => u.id === id);
      if (user) {
        editingUser = user;
        openUserModal(user);
      }
    });
  });

  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.delete);
      if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        deleteUser(id);
      }
    });
  });
}

function openUserModal(user = null) {
  const modal = document.getElementById('modal-user');
  const title = document.getElementById('modal-user-title');
  
  if (!modal) return;

  title.textContent = user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur';
  
  document.getElementById('form-username').value = user?.username || '';
  document.getElementById('form-email').value = user?.email || '';
  document.getElementById('form-password').value = '';
  document.getElementById('form-password2').value = '';
  document.getElementById('form-is-staff').checked = user?.is_staff || false;
  document.getElementById('form-is-superuser').checked = user?.is_superuser || false;
  document.getElementById('form-is-active').checked = user?.is_active !== false;
  
  // Permissions
  const permissions = user?.permissions || [];
  FONCTIONNALITES.forEach(f => {
    const checkbox = document.querySelector(`[data-perm="${f.id}"]`);
    if (checkbox) {
      const perm = permissions.find(p => p.fonctionnalite === f.id);
      checkbox.checked = perm?.peut_voir || false;
    }
  });
  
  modal.style.display = 'flex';
}

function closeUserModal() {
  const modal = document.getElementById('modal-user');
  if (modal) modal.style.display = 'none';
  editingUser = null;
}

async function handleUserSubmit(e) {
  e.preventDefault();
  
  const password = document.getElementById('form-password').value;
  const password2 = document.getElementById('form-password2').value;
  
  if (password && password !== password2) {
    toast.error('Les mots de passe ne correspondent pas');
    return;
  }
  
  if (!editingUser && !password) {
    toast.error('Le mot de passe est requis pour un nouvel utilisateur');
    return;
  }

  const data = {
    username: document.getElementById('form-username').value,
    email: document.getElementById('form-email').value,
    is_staff: document.getElementById('form-is-staff').checked,
    is_superuser: document.getElementById('form-is-superuser').checked,
    is_active: document.getElementById('form-is-active').checked,
  };
  
  if (password) {
    data.password = password;
  }

  // Collecter les permissions
  const permissions = [];
  FONCTIONNALITES.forEach(f => {
    const checkbox = document.querySelector(`[data-perm="${f.id}"]`);
    if (checkbox?.checked) {
      permissions.push({
        fonctionnalite: f.id,
        peut_voir: true,
        peut_creer: true,
        peut_modifier: true,
        peut_supprimer: true,
      });
    }
  });
  data.permissions = permissions;

  try {
    if (editingUser) {
      await apiService.put(`/api/users/${editingUser.id}/`, data);
      toast.success('Utilisateur modifié');
    } else {
      await apiService.post('/api/users/', data);
      toast.success('Utilisateur créé');
    }
    
    closeUserModal();
    await loadUtilisateurs();
  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    toast.error(error.message || 'Erreur lors de la sauvegarde');
  }
}

async function deleteUser(id) {
  try {
    await apiService.delete(`/api/users/${id}/`);
    toast.success('Utilisateur supprimé');
    await loadUtilisateurs();
  } catch (error) {
    console.error('Erreur suppression:', error);
    toast.error('Erreur lors de la suppression');
  }
}

