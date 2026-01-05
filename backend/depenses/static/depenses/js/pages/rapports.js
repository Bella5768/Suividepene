/**
 * Page Rapports - Génération de rapports mensuels
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let rapportData = null;
let selectedMois = new Date().toISOString().slice(0, 7);

export async function renderRapports() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="rapports">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Rapports</span>
      </div>
      <div class="page-header">
        <h1>Rapports</h1>
      </div>
      
      <!-- Sélection du mois -->
      <div class="card filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label>Mois du rapport</label>
            <input type="month" id="filter-mois" class="form-input" value="${selectedMois}" />
          </div>
          <div class="filter-group filter-actions">
            <button class="btn btn-primary" id="btn-generate">Générer le rapport</button>
          </div>
        </div>
      </div>

      <div id="rapports-content">
        <div class="card">
          <p style="text-align: center; color: #64748b; padding: 2rem;">
            Sélectionnez un mois et cliquez sur "Générer le rapport" pour voir les données.
          </p>
        </div>
      </div>
    </div>
  `;

  attachEvents();
}

function attachEvents() {
  document.getElementById('btn-generate')?.addEventListener('click', generateRapport);
}

async function generateRapport() {
  const content = document.getElementById('rapports-content');
  if (!content) return;

  selectedMois = document.getElementById('filter-mois').value;
  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    const data = await apiService.get(`/api/rapports/mensuel/?mois=${selectedMois}`);
    rapportData = data;
    renderRapport();
  } catch (error) {
    console.error('Erreur génération rapport:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors de la génération du rapport.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderRapport() {
  const content = document.getElementById('rapports-content');
  if (!content || !rapportData) return;

  const moisFormate = new Date(selectedMois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  content.innerHTML = `
    <div class="rapport-container">
      <!-- Résumé -->
      <div class="card">
        <h2>Rapport mensuel - ${moisFormate}</h2>
        <div class="rapport-stats">
          <div class="stat-card">
            <div class="stat-label">Total Depense</div>
            <div class="stat-value">${formatGNF(rapportData.total_depenses || rapportData.total_depense || 0)}</div>
            <div class="stat-sublabel" style="font-size: 0.75rem; color: #64748b;">Operations effectuees</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Budget Restant</div>
            <div class="stat-value ${(rapportData.ecart_global || rapportData.ecart || 0) < 0 ? 'negative' : ''}">${formatGNF(rapportData.total_prevu - (rapportData.total_depenses || rapportData.total_depense || 0))}</div>
            <div class="stat-sublabel" style="font-size: 0.75rem; color: #64748b;">Prevu: ${formatGNF(rapportData.total_prevu || 0)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">% Utilise</div>
            <div class="stat-value">${rapportData.total_prevu > 0 ? (((rapportData.total_depenses || rapportData.total_depense || 0) / rapportData.total_prevu) * 100).toFixed(1) : 0}%</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Moyenne journaliere</div>
            <div class="stat-value">${formatGNF(rapportData.moyenne_journaliere || 0)}</div>
          </div>
        </div>
      </div>

      <!-- Détail par catégorie -->
      ${rapportData.par_categorie && rapportData.par_categorie.length > 0 ? `
        <div class="card">
          <h2>Détail par catégorie</h2>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Prévu</th>
                  <th>Dépensé</th>
                  <th>Écart</th>
                  <th>% Utilisé</th>
                </tr>
              </thead>
              <tbody>
                ${rapportData.par_categorie.map(cat => {
                  const ecart = (cat.prevu || 0) - (cat.depense || 0);
                  const pourcent = cat.prevu > 0 ? ((cat.depense / cat.prevu) * 100).toFixed(1) : 0;
                  return `
                    <tr>
                      <td>${cat.categorie_nom || cat.categorie}</td>
                      <td>${formatGNF(cat.prevu || 0)}</td>
                      <td>${formatGNF(cat.depense || 0)}</td>
                      <td class="${ecart < 0 ? 'text-danger' : ''}">${formatGNF(ecart)}</td>
                      <td>
                        <div class="progress-bar">
                          <div class="progress-fill ${pourcent > 100 ? 'danger' : pourcent > 80 ? 'warning' : ''}" style="width: ${Math.min(pourcent, 100)}%"></div>
                        </div>
                        <span>${pourcent}%</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Actions -->
      <div class="card">
        <div class="rapport-actions">
          <button class="btn btn-outline" id="btn-export-pdf">Exporter PDF</button>
          <button class="btn btn-outline" id="btn-export-excel">Exporter Excel</button>
        </div>
      </div>
    </div>
  `;

  // Attacher événements export
  document.getElementById('btn-export-pdf')?.addEventListener('click', exportPDF);
  document.getElementById('btn-export-excel')?.addEventListener('click', exportExcel);
}

function exportPDF() {
  if (!rapportData) {
    toast.error('Generez d\'abord un rapport');
    return;
  }
  
  const moisFormate = new Date(selectedMois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const totalDepenses = rapportData.total_depenses || rapportData.total_depense || 0;
  const budgetRestant = (rapportData.total_prevu || 0) - totalDepenses;
  const pourcent = rapportData.total_prevu > 0 ? ((totalDepenses / rapportData.total_prevu) * 100).toFixed(1) : 0;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rapport ${moisFormate}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #124684; text-align: center; }
        .info { margin-bottom: 20px; }
        .info p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #124684; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f9f9f9; }
        .total { font-weight: bold; background: #e5e7eb !important; }
        .montant { text-align: right; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; padding: 15px; background: #f3f4f6; border-radius: 8px; }
        .stat-value { font-size: 1.5em; font-weight: bold; color: #124684; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>CSIG - Rapport Mensuel</h1>
      <h2 style="text-align: center; color: #64748b;">${moisFormate}</h2>
      
      <div class="stats">
        <div class="stat-box">
          <div>Total Depense</div>
          <div class="stat-value">${formatGNF(totalDepenses)}</div>
        </div>
        <div class="stat-box">
          <div>Budget Restant</div>
          <div class="stat-value">${formatGNF(budgetRestant)}</div>
        </div>
        <div class="stat-box">
          <div>% Utilise</div>
          <div class="stat-value">${pourcent}%</div>
        </div>
        <div class="stat-box">
          <div>Moyenne/jour</div>
          <div class="stat-value">${formatGNF(rapportData.moyenne_journaliere || 0)}</div>
        </div>
      </div>
      
      <p><strong>Budget Prevu:</strong> ${formatGNF(rapportData.total_prevu || 0)}</p>
      <p><strong>Nombre d'operations:</strong> ${rapportData.nombre_operations || 0}</p>
      
      ${rapportData.categories && rapportData.categories.length > 0 ? `
        <h3>Detail par categorie</h3>
        <table>
          <thead>
            <tr>
              <th>Categorie</th>
              <th class="montant">Prevu</th>
              <th class="montant">Depense</th>
              <th class="montant">Ecart</th>
            </tr>
          </thead>
          <tbody>
            ${rapportData.categories.map(cat => `
              <tr>
                <td>${cat.categorie_nom || cat.categorie_code}</td>
                <td class="montant">${formatGNF(cat.montant_prevu || 0)}</td>
                <td class="montant">${formatGNF(cat.total_depense || 0)}</td>
                <td class="montant">${formatGNF(cat.ecart || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
      
      <p style="margin-top: 30px; text-align: center; color: #64748b; font-size: 0.9em;">
        Document genere le ${new Date().toLocaleString('fr-FR')}
      </p>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.onload = () => printWindow.print();
  toast.success('PDF pret pour impression');
}

function exportExcel() {
  if (!rapportData) {
    toast.error('Generez d\'abord un rapport');
    return;
  }
  
  const totalDepenses = rapportData.total_depenses || rapportData.total_depense || 0;
  const budgetRestant = (rapportData.total_prevu || 0) - totalDepenses;
  
  // En-tetes
  const headers = ['Categorie', 'Prevu', 'Depense', 'Ecart'];
  const rows = [];
  
  // Resume
  rows.push(['RESUME', '', '', '']);
  rows.push(['Total Prevu', rapportData.total_prevu || 0, '', '']);
  rows.push(['Total Depense', totalDepenses, '', '']);
  rows.push(['Budget Restant', budgetRestant, '', '']);
  rows.push(['Moyenne Journaliere', rapportData.moyenne_journaliere || 0, '', '']);
  rows.push(['', '', '', '']);
  rows.push(['DETAIL PAR CATEGORIE', '', '', '']);
  rows.push(headers);
  
  // Categories
  if (rapportData.categories) {
    rapportData.categories.forEach(cat => {
      rows.push([
        cat.categorie_nom || cat.categorie_code,
        cat.montant_prevu || 0,
        cat.total_depense || 0,
        cat.ecart || 0
      ]);
    });
  }
  
  // Creer CSV
  const BOM = '\uFEFF';
  const csvContent = BOM + rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')
  ).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `rapport_${selectedMois}.csv`;
  link.click();
  toast.success('Export Excel telecharge');
}

