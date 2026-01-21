/**
 * Page Dashboard (Tableau de bord)
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

export async function renderDashboard() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="dashboard">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Tableau de bord</span>
      </div>
      <div class="dashboard-header">
        <h1>Tableau de bord</h1>
        <p class="page-subtitle" id="month-subtitle">Chargement...</p>
      </div>
      <div id="dashboard-content">
        <div class="loading">
          <div class="spinner"></div>
        </div>
      </div>
    </div>
  `;

  // Charger les données
  await loadDashboardData();
}

async function loadDashboardData() {
  const content = document.getElementById('dashboard-content');
  if (!content) return;

  try {
    // Obtenir le mois actuel
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Formater le mois pour l'affichage
    const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const monthSubtitle = document.getElementById('month-subtitle');
    if (monthSubtitle) {
      monthSubtitle.textContent = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    }

    // Charger le rapport mensuel
    const rapport = await apiService.get(`/api/rapports/mensuel/?mois=${currentMonth}`);
    
    // Charger les opérations récentes
    const operationsData = await apiService.get('/api/operations/?ordering=-date_operation&page_size=5');
    const operations = Array.isArray(operationsData) ? operationsData : (operationsData.results || []);

    // Calculer le nombre de jours du mois
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    // Afficher les données
    renderDashboardContent(rapport, operations, daysInMonth);

  } catch (error) {
    console.error('Erreur lors du chargement du dashboard:', error);
    
    let errorMessage = 'Erreur lors du chargement des données';
    if (error.response?.status === 401) {
      errorMessage = 'Erreur d\'authentification. Veuillez vous reconnecter.';
    }

    content.innerHTML = `
      <div class="card" style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 1.5rem;">
        <h3 style="color: #856404; margin-top: 0;">⚠️ Erreur</h3>
        <p style="color: #856404;">${errorMessage}</p>
      </div>
    `;
  }
}

function renderDashboardContent(rapport, operations, daysInMonth) {
  const content = document.getElementById('dashboard-content');
  if (!content) return;

  const totalDepenses = rapport?.total_depenses || 0;
  const totalPrevu = rapport?.total_prevu || 0;
  const ecart = rapport?.ecart_global || 0;
  const moyenneJournaliere = rapport?.moyenne_journaliere || 0;
  const nombreOperations = rapport?.nombre_operations || 0;
  const categories = rapport?.categories || [];

  content.innerHTML = `
    <div class="dashboard-stats">
      <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div class="stat-label" style="color: rgba(255,255,255,0.9);">Total des dépenses</div>
        <div class="stat-value" style="color: white;">${formatGNF(totalDepenses)}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white;">
        <div class="stat-label" style="color: rgba(255,255,255,0.9);">Total prévu</div>
        <div class="stat-value" style="color: white;">${formatGNF(totalPrevu)}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, ${ecart < 0 ? '#eb3349, #f45c43' : '#56ab2f, #a8e063'}); color: white;">
        <div class="stat-label" style="color: rgba(255,255,255,0.9);">Écart</div>
        <div class="stat-value" style="color: white;">${formatGNF(ecart)}</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
        <div class="stat-label" style="color: rgba(255,255,255,0.9);">Moyenne journalière</div>
        <div class="stat-value" style="color: white;">${formatGNF(moyenneJournaliere)}</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <h2>Dépenses par catégorie</h2>
        <div id="categories-chart">
          ${renderCategoriesChart(categories)}
        </div>
      </div>

      <div class="card">
        <h2>Opérations récentes</h2>
        <div id="recent-operations">
          ${renderRecentOperations(operations)}
        </div>
      </div>
    </div>
  `;
}

function renderCategoriesChart(categories) {
  if (!categories || categories.length === 0) {
    return '<p style="color: #64748b; text-align: center; padding: 2rem;">Aucune donnée disponible</p>';
  }

  return `
    <div class="categories-list">
      ${categories.map(cat => `
        <div class="category-item">
          <div class="category-name">${cat.nom || 'Sans nom'}</div>
          <div class="category-amount">${formatGNF(cat.total || 0)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRecentOperations(operations) {
  if (!operations || operations.length === 0) {
    return '<p style="color: #64748b; text-align: center; padding: 2rem;">Aucune opération récente</p>';
  }

  return `
    <div class="operations-list">
      ${operations.map(op => {
        const date = new Date(op.date_operation);
        const dateStr = date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric' 
        });
        
        return `
          <div class="operation-item">
            <div class="operation-info">
              <div class="operation-description">${op.description || 'Sans description'}</div>
              <div class="operation-meta">${dateStr} • ${op.categorie_nom || 'N/A'}</div>
            </div>
            <div class="operation-amount">${formatGNF(op.montant || 0)}</div>
          </div>
        `;
      }).join('')}
    </div>
    <div style="margin-top: 1rem; text-align: center;">
      <a href="#" data-nav="/operations" class="btn btn-secondary">Voir toutes les opérations</a>
    </div>
  `;
}

