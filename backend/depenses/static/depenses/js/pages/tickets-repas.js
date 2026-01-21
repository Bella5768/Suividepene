/**
 * Page Tickets Repas - Génération et gestion des tickets pour les travailleurs
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let lots = [];
let ticketsActuels = [];
let lotSelectionne = null;

export async function renderTicketsRepas() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="tickets-repas">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span>Restauration</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Tickets Repas</span>
      </div>
      <div class="page-header">
        <h1>Tickets Repas</h1>
        <button class="btn btn-primary" id="btn-generer-lot">+ Générer des tickets</button>
      </div>
      
      <!-- Statistiques -->
      <div id="stats-container" class="stats-grid" style="margin-bottom: 1.5rem;">
        <div class="loading"><div class="spinner"></div></div>
      </div>
      
      <!-- Liste des lots -->
      <div id="lots-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>

    <!-- Modal Générer Lot -->
    <div class="modal-overlay" id="modal-generer" style="display: none;">
      <div class="modal">
        <div class="modal-header">
          <h2>Générer des tickets</h2>
          <button class="modal-close" id="modal-generer-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="generer-form">
            <div class="form-group">
              <label class="form-label">Nom du lot *</label>
              <input type="text" id="form-nom" class="form-input" required maxlength="100" 
                     placeholder="Ex: Lot Janvier 2026" />
            </div>
            <div class="form-group">
              <label class="form-label">Nombre de tickets *</label>
              <input type="number" id="form-nombre" class="form-input" min="1" max="500" value="10" required />
              <small style="color: #64748b;">Maximum 500 tickets par lot</small>
            </div>
            <div class="form-group">
              <label class="form-label">Date de validité</label>
              <input type="date" id="form-validite" class="form-input" />
              <small style="color: #64748b;">Laisser vide pour une validité illimitée</small>
            </div>
            <div class="form-group">
              <label class="form-label">Description</label>
              <textarea id="form-description" class="form-input" rows="2" 
                        placeholder="Notes ou description du lot..."></textarea>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-generer-cancel">Annuler</button>
              <button type="submit" class="btn btn-primary">Générer les tickets</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Voir Tickets -->
    <div class="modal-overlay" id="modal-tickets" style="display: none;">
      <div class="modal" style="max-width: 900px;">
        <div class="modal-header">
          <h2 id="modal-tickets-title">Tickets du lot</h2>
          <button class="modal-close" id="modal-tickets-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="tickets-actions" style="margin-bottom: 1rem; display: flex; gap: 0.5rem;">
            <button class="btn btn-primary" id="btn-imprimer-tickets">
              <span>🖨️</span> Imprimer les tickets
            </button>
            <select id="filter-statut" class="form-input" style="width: auto;">
              <option value="">Tous les statuts</option>
              <option value="disponible">Disponibles</option>
              <option value="utilise">Utilisés</option>
              <option value="annule">Annulés</option>
            </select>
          </div>
          <div id="tickets-list">
            <div class="loading"><div class="spinner"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Scanner/Utiliser Ticket -->
    <div class="modal-overlay" id="modal-utiliser" style="display: none;">
      <div class="modal" style="max-width: 500px;">
        <div class="modal-header">
          <h2>Utiliser un ticket</h2>
          <button class="modal-close" id="modal-utiliser-close">&times;</button>
        </div>
        <div class="modal-body">
          <form id="utiliser-form">
            <div class="form-group">
              <label class="form-label">Code du ticket *</label>
              <input type="text" id="form-code-ticket" class="form-input" required 
                     placeholder="Ex: TKT-2026-ABCD1234" style="text-transform: uppercase;" />
            </div>
            <div class="form-group">
              <label class="form-label">Nom du bénéficiaire</label>
              <input type="text" id="form-beneficiaire" class="form-input" 
                     placeholder="Nom du travailleur" />
            </div>
            <div id="ticket-info" style="display: none; margin: 1rem 0; padding: 1rem; background: #f8fafc; border-radius: 8px;">
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-outline" id="btn-rechercher-ticket">Rechercher</button>
              <button type="submit" class="btn btn-primary" id="btn-valider-ticket" disabled>Valider l'utilisation</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  await Promise.all([loadStats(), loadLots()]);
  attachEvents();
}

async function loadStats() {
  const container = document.getElementById('stats-container');
  if (!container) return;

  try {
    const stats = await apiService.get('/api/restauration/tickets/statistiques/');
    
    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">Total tickets</div>
      </div>
      <div class="stat-card" style="border-left: 4px solid #22c55e;">
        <div class="stat-value" style="color: #22c55e;">${stats.disponibles}</div>
        <div class="stat-label">Disponibles</div>
      </div>
      <div class="stat-card" style="border-left: 4px solid #3b82f6;">
        <div class="stat-value" style="color: #3b82f6;">${stats.utilises}</div>
        <div class="stat-label">Utilisés</div>
      </div>
      <div class="stat-card" style="border-left: 4px solid #ef4444;">
        <div class="stat-value" style="color: #ef4444;">${stats.annules}</div>
        <div class="stat-label">Annulés</div>
      </div>
    `;
  } catch (error) {
    console.error('Erreur chargement stats:', error);
    container.innerHTML = '<p style="color: #ef4444;">Erreur lors du chargement des statistiques</p>';
  }
}

async function loadLots() {
  const content = document.getElementById('lots-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await apiService.get('/api/restauration/lots-tickets/');
    lots = Array.isArray(data) ? data : (data.results || []);
    renderLotsTable();
  } catch (error) {
    console.error('Erreur chargement lots:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des lots de tickets.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderLotsTable() {
  const content = document.getElementById('lots-content');
  if (!content) return;

  if (lots.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucun lot de tickets trouvé. Cliquez sur "Générer des tickets" pour créer un nouveau lot.
        </p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="card">
      <div class="table-header" style="display: flex; justify-content: space-between; align-items: center;">
        <span>${lots.length} lot(s) de tickets</span>
        <button class="btn btn-outline btn-sm" id="btn-utiliser-ticket">
          <span>🎫</span> Utiliser un ticket
        </button>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Nom du lot</th>
              <th>Tickets</th>
              <th>Disponibles</th>
              <th>Utilisés</th>
              <th>Validité</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${lots.map(lot => `
              <tr>
                <td><strong>${lot.nom}</strong></td>
                <td>${lot.nombre_tickets}</td>
                <td><span class="badge badge-success">${lot.tickets_disponibles}</span></td>
                <td><span class="badge badge-info">${lot.tickets_utilises}</span></td>
                <td>${lot.date_validite ? formatDate(lot.date_validite) : 'Illimitée'}</td>
                <td>${formatDate(lot.created_at)}</td>
                <td>
                  <button class="btn btn-sm btn-outline" data-voir="${lot.id}">Voir tickets</button>
                  <button class="btn btn-sm btn-primary" data-imprimer="${lot.id}">Imprimer</button>
                  <button class="btn btn-sm btn-danger" data-supprimer="${lot.id}">Supprimer</button>
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
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { 
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function attachEvents() {
  // Bouton générer
  document.getElementById('btn-generer-lot')?.addEventListener('click', openModalGenerer);
  document.getElementById('modal-generer-close')?.addEventListener('click', closeModalGenerer);
  document.getElementById('btn-generer-cancel')?.addEventListener('click', closeModalGenerer);
  document.getElementById('modal-generer')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-generer') closeModalGenerer();
  });
  document.getElementById('generer-form')?.addEventListener('submit', handleGenerer);

  // Modal tickets
  document.getElementById('modal-tickets-close')?.addEventListener('click', closeModalTickets);
  document.getElementById('modal-tickets')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-tickets') closeModalTickets();
  });
  document.getElementById('filter-statut')?.addEventListener('change', filterTickets);
  document.getElementById('btn-imprimer-tickets')?.addEventListener('click', imprimerTicketsLot);

  // Modal utiliser
  document.getElementById('modal-utiliser-close')?.addEventListener('click', closeModalUtiliser);
  document.getElementById('modal-utiliser')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-utiliser') closeModalUtiliser();
  });
  document.getElementById('btn-rechercher-ticket')?.addEventListener('click', rechercherTicket);
  document.getElementById('utiliser-form')?.addEventListener('submit', handleUtiliserTicket);
}

function attachTableEvents() {
  // Voir tickets
  document.querySelectorAll('[data-voir]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.voir);
      const lot = lots.find(l => l.id === id);
      if (lot) openModalTickets(lot);
    });
  });

  // Imprimer
  document.querySelectorAll('[data-imprimer]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.imprimer);
      imprimerLot(id);
    });
  });

  // Supprimer
  document.querySelectorAll('[data-supprimer]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.supprimer);
      if (confirm('Êtes-vous sûr de vouloir supprimer ce lot et tous ses tickets ?')) {
        supprimerLot(id);
      }
    });
  });

  // Utiliser un ticket
  document.getElementById('btn-utiliser-ticket')?.addEventListener('click', openModalUtiliser);
}

// Modal Générer
function openModalGenerer() {
  const modal = document.getElementById('modal-generer');
  if (!modal) return;
  
  document.getElementById('form-nom').value = `Lot ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
  document.getElementById('form-nombre').value = 10;
  document.getElementById('form-validite').value = '';
  document.getElementById('form-description').value = '';
  
  modal.style.display = 'flex';
}

function closeModalGenerer() {
  const modal = document.getElementById('modal-generer');
  if (modal) modal.style.display = 'none';
}

async function handleGenerer(e) {
  e.preventDefault();
  
  const data = {
    nom: document.getElementById('form-nom').value,
    nombre_tickets: parseInt(document.getElementById('form-nombre').value),
    date_validite: document.getElementById('form-validite').value || null,
    description: document.getElementById('form-description').value,
  };

  try {
    const result = await apiService.post('/api/restauration/lots-tickets/generer/', data);
    toast.success(`${data.nombre_tickets} tickets générés avec succès !`);
    closeModalGenerer();
    await Promise.all([loadStats(), loadLots()]);
    
    // Proposer d'imprimer directement
    if (confirm('Voulez-vous imprimer les tickets maintenant ?')) {
      imprimerLot(result.id);
    }
  } catch (error) {
    console.error('Erreur génération:', error);
    toast.error(error.message || 'Erreur lors de la génération des tickets');
  }
}

// Modal Tickets
async function openModalTickets(lot) {
  const modal = document.getElementById('modal-tickets');
  const title = document.getElementById('modal-tickets-title');
  
  if (!modal) return;
  
  lotSelectionne = lot;
  title.textContent = `Tickets - ${lot.nom}`;
  document.getElementById('filter-statut').value = '';
  
  modal.style.display = 'flex';
  await loadTicketsLot(lot.id);
}

function closeModalTickets() {
  const modal = document.getElementById('modal-tickets');
  if (modal) modal.style.display = 'none';
  lotSelectionne = null;
  ticketsActuels = [];
}

async function loadTicketsLot(lotId, statut = '') {
  const container = document.getElementById('tickets-list');
  if (!container) return;
  
  container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  
  try {
    let url = `/api/restauration/lots-tickets/${lotId}/tickets/`;
    if (statut) url += `?statut=${statut}`;
    
    ticketsActuels = await apiService.get(url);
    renderTicketsList();
  } catch (error) {
    console.error('Erreur chargement tickets:', error);
    container.innerHTML = '<p style="color: #ef4444;">Erreur lors du chargement des tickets</p>';
  }
}

function renderTicketsList() {
  const container = document.getElementById('tickets-list');
  if (!container) return;
  
  if (ticketsActuels.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 1rem;">Aucun ticket trouvé.</p>';
    return;
  }
  
  container.innerHTML = `
    <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
      <table class="table">
        <thead style="position: sticky; top: 0; background: white;">
          <tr>
            <th>Code</th>
            <th>Statut</th>
            <th>Bénéficiaire</th>
            <th>Date utilisation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${ticketsActuels.map(ticket => `
            <tr>
              <td><code style="font-size: 0.9rem; background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 4px;">${ticket.code_unique}</code></td>
              <td>${getStatutBadge(ticket.statut)}</td>
              <td>${ticket.utilisateur_beneficiaire || '-'}</td>
              <td>${ticket.date_utilisation ? formatDateTime(ticket.date_utilisation) : '-'}</td>
              <td>
                ${ticket.statut === 'disponible' ? `
                  <button class="btn btn-sm btn-primary" data-utiliser-ticket="${ticket.id}">Utiliser</button>
                  <button class="btn btn-sm btn-danger" data-annuler-ticket="${ticket.id}">Annuler</button>
                ` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  // Events pour les boutons des tickets
  document.querySelectorAll('[data-utiliser-ticket]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.utiliserTicket);
      const beneficiaire = prompt('Nom du bénéficiaire (optionnel):');
      if (beneficiaire !== null) {
        await utiliserTicket(id, beneficiaire);
      }
    });
  });
  
  document.querySelectorAll('[data-annuler-ticket]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.annulerTicket);
      if (confirm('Êtes-vous sûr de vouloir annuler ce ticket ?')) {
        await annulerTicket(id);
      }
    });
  });
}

function getStatutBadge(statut) {
  const badges = {
    'disponible': '<span class="badge badge-success">Disponible</span>',
    'utilise': '<span class="badge badge-info">Utilisé</span>',
    'annule': '<span class="badge badge-danger">Annulé</span>',
  };
  return badges[statut] || statut;
}

function filterTickets() {
  const statut = document.getElementById('filter-statut')?.value || '';
  if (lotSelectionne) {
    loadTicketsLot(lotSelectionne.id, statut);
  }
}

// Modal Utiliser
function openModalUtiliser() {
  const modal = document.getElementById('modal-utiliser');
  if (!modal) return;
  
  document.getElementById('form-code-ticket').value = '';
  document.getElementById('form-beneficiaire').value = '';
  document.getElementById('ticket-info').style.display = 'none';
  document.getElementById('btn-valider-ticket').disabled = true;
  
  modal.style.display = 'flex';
}

function closeModalUtiliser() {
  const modal = document.getElementById('modal-utiliser');
  if (modal) modal.style.display = 'none';
}

let ticketTrouve = null;

async function rechercherTicket() {
  const code = document.getElementById('form-code-ticket')?.value?.trim().toUpperCase();
  const infoDiv = document.getElementById('ticket-info');
  const btnValider = document.getElementById('btn-valider-ticket');
  
  if (!code) {
    toast.error('Veuillez entrer un code de ticket');
    return;
  }
  
  try {
    const ticket = await apiService.get(`/api/restauration/tickets/rechercher/?code=${encodeURIComponent(code)}`);
    ticketTrouve = ticket;

    const expiresAt = ticket.expires_at ? new Date(ticket.expires_at) : null;
    const expiresAtStr = expiresAt
      ? expiresAt.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '-';
    
    infoDiv.innerHTML = `
      <p><strong>Code:</strong> ${ticket.code_unique}</p>
      <p><strong>Lot:</strong> ${ticket.lot_nom}</p>
      <p><strong>Statut:</strong> ${getStatutBadge(ticket.statut)}</p>
      <p><strong>Expiration (24h):</strong> ${expiresAtStr}</p>
      ${ticket.is_expired ? `
        <p style="color: #ef4444;"><strong>⛔ Ticket expiré</strong></p>
      ` : ''}
      ${ticket.statut !== 'disponible' ? `
        <p style="color: #ef4444;"><strong>⚠️ Ce ticket ne peut pas être utilisé (${ticket.statut_display})</strong></p>
      ` : `
        <p style="color: #22c55e;"><strong>✓ Ce ticket est valide et peut être utilisé</strong></p>
      `}
    `;
    infoDiv.style.display = 'block';
    btnValider.disabled = ticket.statut !== 'disponible' || ticket.is_expired;
    
  } catch (error) {
    ticketTrouve = null;
    infoDiv.innerHTML = '<p style="color: #ef4444;"><strong>❌ Ticket non trouvé</strong></p>';
    infoDiv.style.display = 'block';
    btnValider.disabled = true;
  }
}

async function handleUtiliserTicket(e) {
  e.preventDefault();
  
  if (!ticketTrouve || ticketTrouve.statut !== 'disponible' || ticketTrouve.is_expired) {
    toast.error('Aucun ticket valide sélectionné');
    return;
  }
  
  const beneficiaire = document.getElementById('form-beneficiaire')?.value?.trim() || '';
  
  try {
    await apiService.post(`/api/restauration/tickets/${ticketTrouve.id}/utiliser/`, { beneficiaire });
    toast.success('Ticket utilisé avec succès !');
    closeModalUtiliser();
    await loadStats();
    ticketTrouve = null;
  } catch (error) {
    console.error('Erreur utilisation:', error);
    toast.error(error.message || 'Erreur lors de l\'utilisation du ticket');
  }
}

// Actions
async function utiliserTicket(ticketId, beneficiaire = '') {
  try {
    await apiService.post(`/api/restauration/tickets/${ticketId}/utiliser/`, { beneficiaire });
    toast.success('Ticket utilisé');
    if (lotSelectionne) {
      await loadTicketsLot(lotSelectionne.id, document.getElementById('filter-statut')?.value || '');
    }
    await loadStats();
  } catch (error) {
    console.error('Erreur utilisation:', error);
    toast.error(error.message || 'Erreur lors de l\'utilisation');
  }
}

async function annulerTicket(ticketId) {
  try {
    await apiService.post(`/api/restauration/tickets/${ticketId}/annuler/`);
    toast.success('Ticket annulé');
    if (lotSelectionne) {
      await loadTicketsLot(lotSelectionne.id, document.getElementById('filter-statut')?.value || '');
    }
    await loadStats();
  } catch (error) {
    console.error('Erreur annulation:', error);
    toast.error(error.message || 'Erreur lors de l\'annulation');
  }
}

async function supprimerLot(lotId) {
  try {
    await apiService.delete(`/api/restauration/lots-tickets/${lotId}/`);
    toast.success('Lot supprimé');
    await Promise.all([loadStats(), loadLots()]);
  } catch (error) {
    console.error('Erreur suppression:', error);
    toast.error('Erreur lors de la suppression');
  }
}

async function imprimerLot(lotId) {
  try {
    const blob = await apiService.getBlob(`/api/restauration/lots-tickets/${lotId}/imprimer/`);
    const blobUrl = window.URL.createObjectURL(blob);

    // Ouvrir dans un nouvel onglet (visualisation PDF)
    const win = window.open(blobUrl, '_blank');
    if (!win) {
      // Fallback si popup bloquée: télécharger
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `tickets_lot_${lotId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Libérer l'URL après un délai (laisser le temps au navigateur de charger)
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60_000);
  } catch (error) {
    console.error('Erreur impression:', error);
    toast.error('Impossible d\'imprimer: authentification requise ou erreur serveur');
  }
}

function imprimerTicketsLot() {
  if (lotSelectionne) {
    imprimerLot(lotSelectionne.id);
  }
}

