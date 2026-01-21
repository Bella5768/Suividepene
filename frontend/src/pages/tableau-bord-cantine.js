/**
 * Page Tableau Bord Cantine - Statistiques restauration
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let stats = null;
let selectedMois = new Date().toISOString().slice(0, 7);

export async function renderTableauBordCantine() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="tableau-bord-cantine">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span>Restauration</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Tableau de bord</span>
      </div>
      <div class="page-header">
        <h1>Tableau de bord Cantine</h1>
      </div>
      
      <div class="card filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label>Mois</label>
            <input type="month" id="filter-mois" class="form-input" value="${selectedMois}" />
          </div>
          <div class="filter-group filter-actions">
            <button class="btn btn-primary" id="btn-load">Charger</button>
          </div>
        </div>
      </div>

      <div id="cantine-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `;

  await loadStats();
  attachEvents();
}

async function loadStats() {
  const content = document.getElementById('cantine-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await apiService.get(`/api/restauration/statistiques/?mois=${selectedMois}`);
    stats = data;
    renderStats();
  } catch (error) {
    console.error('Erreur chargement stats:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des statistiques.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderStats() {
  const content = document.getElementById('cantine-content');
  if (!content) return;

  const moisFormate = new Date(selectedMois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  content.innerHTML = `
    <!-- Lien de commande publique -->
    <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-bottom: 2rem;">
      <h2 style="color: white; margin-bottom: 1rem;">🔗 Lien de Commande du Jour</h2>
      <p style="color: rgba(255,255,255,0.9); margin-bottom: 1rem;">
        Partagez ce lien avec tous les travailleurs pour qu'ils puissent commander leur repas
      </p>
      <div style="display: flex; gap: 1rem; align-items: center; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px;">
        <input 
          type="text" 
          id="lien-commande" 
          readonly 
          value="${window.location.origin}/commander"
          style="flex: 1; padding: 0.75rem; border: none; border-radius: 6px; font-size: 1rem;"
        />
        <button class="btn" id="btn-copier-lien" style="background: white; color: #667eea; font-weight: bold;">
          📋 Copier
        </button>
        <button class="btn" id="btn-ouvrir-lien" style="background: #10b981; color: white; font-weight: bold;">
          🔗 Ouvrir
        </button>
      </div>
      <p style="color: rgba(255,255,255,0.8); margin-top: 0.5rem; font-size: 0.9rem;">
        ⏰ Limite de commande : 13h00 GMT
      </p>
    </div>

    <div class="dashboard-stats">
      <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div class="stat-label" style="color: rgba(255,255,255,0.9);">Total commandes</div>
        <div class="stat-value" style="color: white;">${stats?.total_commandes || 0}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white;">
        <div class="stat-label" style="color: rgba(255,255,255,0.9);">Montant brut</div>
        <div class="stat-value" style="color: white;">${formatGNF(stats?.montant_brut || 0)}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
        <div class="stat-label" style="color: rgba(255,255,255,0.9);">Subventions</div>
        <div class="stat-value" style="color: white;">${formatGNF(stats?.montant_subvention || 0)}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white;">
        <div class="stat-label" style="color: rgba(255,255,255,0.9);">Montant net</div>
        <div class="stat-value" style="color: white;">${formatGNF(stats?.montant_net || 0)}</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <h2>Commandes par jour</h2>
        ${stats?.par_jour && stats.par_jour.length > 0 ? `
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Commandes</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                ${stats.par_jour.map(j => `
                  <tr>
                    <td>${formatDate(j.date)}</td>
                    <td>${j.count}</td>
                    <td>${formatGNF(j.montant)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p style="color: #64748b; text-align: center; padding: 1rem;">Aucune donnée</p>'}
      </div>

      <div class="card">
        <h2>Plats les plus commandés</h2>
        ${stats?.top_plats && stats.top_plats.length > 0 ? `
          <div class="categories-list">
            ${stats.top_plats.map((p, i) => `
              <div class="category-item">
                <span>${i + 1}. ${p.nom}</span>
                <span><strong>${p.quantite}</strong> portions</span>
              </div>
            `).join('')}
          </div>
        ` : '<p style="color: #64748b; text-align: center; padding: 1rem;">Aucune donnée</p>'}
      </div>
    </div>
  `;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function attachEvents() {
  document.getElementById('btn-load')?.addEventListener('click', () => {
    selectedMois = document.getElementById('filter-mois').value;
    loadStats();
  });
  
  // Copier le lien
  document.getElementById('btn-copier-lien')?.addEventListener('click', () => {
    const input = document.getElementById('lien-commande');
    input.select();
    document.execCommand('copy');
    toast.success('Lien copié dans le presse-papier !');
  });
  
  // Ouvrir le lien dans un nouvel onglet
  document.getElementById('btn-ouvrir-lien')?.addEventListener('click', () => {
    window.open('/commander', '_blank');
  });
}
