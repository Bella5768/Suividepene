/**
 * Page Restauration Commandes - Gestion des commandes
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let commandes = [];
let selectedDate = new Date().toISOString().split('T')[0];
let dateDebut = selectedDate;
let dateFin = selectedDate;

export async function renderRestaurationCommandes() {
  const main = getMainContent();
  if (!main) return;

  main.innerHTML = `
    <div class="restauration-commandes">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span>Restauration</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Commandes</span>
      </div>
      <div class="page-header">
        <h1>Gestion des Commandes</h1>
      </div>
      
      <div class="card filters-card">
        <div class="filters-row" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;">
          <div class="filter-group">
            <label>Date debut</label>
            <input type="date" id="filter-date-debut" class="form-input" value="${selectedDate}" />
          </div>
          <div class="filter-group">
            <label>Date fin</label>
            <input type="date" id="filter-date-fin" class="form-input" value="${selectedDate}" />
          </div>
          <div class="filter-group filter-actions" style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" id="btn-filter">Afficher</button>
            <button class="btn" id="btn-export-excel" style="background: #10b981; color: white; border: none;">Excel</button>
            <button class="btn" id="btn-export-pdf" style="background: #ef4444; color: white; border: none;">PDF</button>
          </div>
        </div>
      </div>

      <div id="commandes-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `;

  await loadCommandes();
  attachEvents();
}

async function loadCommandes() {
  const content = document.getElementById('commandes-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    // Charger les commandes pour la plage de dates
    let url = `/api/restauration/commandes/?`;
    if (dateDebut === dateFin) {
      url += `date_commande=${dateDebut}`;
    } else {
      url += `date_commande__gte=${dateDebut}&date_commande__lte=${dateFin}`;
    }
    const data = await apiService.get(url);
    commandes = Array.isArray(data) ? data : (data.results || []);
    renderCommandesTable();
  } catch (error) {
    console.error('Erreur chargement commandes:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des commandes.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderCommandesTable() {
  const content = document.getElementById('commandes-content');
  if (!content) return;

  if (commandes.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucune commande pour cette date.
        </p>
      </div>
    `;
    return;
  }

  // Débogage: Afficher les premières commandes dans la console
  console.log('Commandes reçues:', commandes.slice(0, 2));
  if (commandes.length > 0 && commandes[0].lignes) {
    console.log('Première commande lignes:', commandes[0].lignes);
  }

  const totalPrixReel = commandes.reduce((sum, c) => sum + parseFloat(c.prix_reel_total || 0), 0);
  const totalSubvention = commandes.reduce((sum, c) => sum + parseFloat(c.subvention_calculee || 0), 0);
  const totalAPayer = commandes.reduce((sum, c) => sum + parseFloat(c.supplement_total || 0), 0);

  content.innerHTML = `
    <div class="card">
      <div class="table-header" style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <span><strong>${commandes.length}</strong> commande(s)</span>
        <span>Prix total: <strong>${formatGNF(totalPrixReel)}</strong></span>
        <span>Subvention: <strong style="color: #10b981;">-${formatGNF(totalSubvention)}</strong></span>
        <span>A payer: <strong style="color: #f59e0b;">${formatGNF(totalAPayer)}</strong></span>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Plats</th>
              <th>Prix</th>
              <th>Subvention</th>
              <th>A payer</th>
              <th>État</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${commandes.map(cmd => {
              const prixReel = parseFloat(cmd.prix_reel_total || 0);
              const subvention = parseFloat(cmd.subvention_calculee || 0);
              const aPayer = parseFloat(cmd.supplement_total || 0);
              return `
              <tr>
                <td><strong>${cmd.utilisateur_nom || cmd.utilisateur}</strong></td>
                <td>
                  ${(() => {
                    if (!cmd.lignes || cmd.lignes.length === 0) {
                      return 'Aucun plat';
                    }
                    const plats = cmd.lignes.map(ligne => {
                      // Essayer différentes sources pour le nom du plat
                      const nom = ligne.plat_nom || 
                                 ligne.menu_plat?.plat?.nom || 
                                 ligne.menu_plat_nom || 
                                 ligne.nom_plat ||
                                 'Plat inconnu';
                      return nom;
                    });
                    console.log('Plats pour commande:', plats);
                    return plats.join(', ');
                  })()}
                </td>
                <td>${formatGNF(prixReel)}</td>
                <td style="color: #10b981;"><strong>-${formatGNF(subvention)}</strong></td>
                <td style="color: ${aPayer > 0 ? '#f59e0b' : '#64748b'};">${aPayer > 0 ? formatGNF(aPayer) : '-'}</td>
                <td>${getEtatBadge(cmd.etat)}</td>
                <td>
                  ${cmd.etat === 'brouillon' ? `<button class="btn btn-sm btn-success" data-validate="${cmd.id}">Valider</button>` : ''}
                  ${cmd.etat === 'validee' ? `<button class="btn btn-sm btn-primary" data-deliver="${cmd.id}">Livrer</button>` : ''}
                  ${cmd.etat !== 'livree' ? `<button class="btn btn-sm btn-danger" data-cancel="${cmd.id}">Annuler</button>` : ''}
                </td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  attachTableEvents();
}

function getEtatBadge(etat) {
  const badges = {
    'brouillon': '<span class="badge badge-warning">Brouillon</span>',
    'validee': '<span class="badge badge-success">Validée</span>',
    'annulee': '<span class="badge badge-danger">Annulée</span>',
    'livree': '<span class="badge badge-secondary">Livrée</span>',
  };
  return badges[etat] || etat;
}

function attachEvents() {
  document.getElementById('btn-filter')?.addEventListener('click', () => {
    dateDebut = document.getElementById('filter-date-debut').value;
    dateFin = document.getElementById('filter-date-fin').value;
    loadCommandes();
  });
  
  document.getElementById('btn-export-excel')?.addEventListener('click', exportExcel);
  document.getElementById('btn-export-pdf')?.addEventListener('click', exportPDF);
}

function exportExcel() {
  if (commandes.length === 0) {
    toast.error('Aucune commande a exporter');
    return;
  }
  
  // Creer le CSV
  const headers = ['Date', 'Utilisateur', 'Plats', 'Prix Reel', 'Subvention', 'Supplement', 'Etat'];
  const rows = commandes.map(cmd => [
    cmd.date_commande,
    cmd.utilisateur_nom || cmd.utilisateur,
    cmd.lignes?.map(l => l.plat_nom || l.menu_plat_nom).join(', ') || '',
    parseFloat(cmd.prix_reel_total || 0),
    parseFloat(cmd.montant_subvention || 0),
    parseFloat(cmd.supplement_total || 0),
    cmd.etat
  ]);
  
  // Totaux
  const totalPrixReel = commandes.reduce((sum, c) => sum + parseFloat(c.prix_reel_total || 0), 0);
  const totalSubvention = commandes.reduce((sum, c) => sum + parseFloat(c.montant_subvention || 0), 0);
  const totalSupplement = commandes.reduce((sum, c) => sum + parseFloat(c.supplement_total || 0), 0);
  rows.push(['', '', 'TOTAL:', totalPrixReel, totalSubvention, totalSupplement, '']);
  
  // Creer le CSV avec BOM pour Excel
  const BOM = '\uFEFF';
  const csvContent = BOM + [headers, ...rows].map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')
  ).join('\n');
  
  // Telecharger
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `commandes_${dateDebut}_${dateFin}.csv`;
  link.click();
  toast.success('Export Excel telecharge');
}

function exportPDF() {
  if (commandes.length === 0) {
    toast.error('Aucune commande a exporter');
    return;
  }
  
  const totalPrixReel = commandes.reduce((sum, c) => sum + parseFloat(c.prix_reel_total || 0), 0);
  const totalSubvention = commandes.reduce((sum, c) => sum + parseFloat(c.montant_subvention || 0), 0);
  const totalSupplement = commandes.reduce((sum, c) => sum + parseFloat(c.supplement_total || 0), 0);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rapport Commandes - ${dateDebut} au ${dateFin}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #124684; text-align: center; }
        .info { text-align: center; margin-bottom: 20px; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #124684; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background: #f9f9f9; }
        .total { font-weight: bold; background: #e5e7eb !important; }
        .montant { text-align: right; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>CSIG - Rapport des Commandes</h1>
      <p class="info">Periode: ${dateDebut} au ${dateFin} | ${commandes.length} commande(s)</p>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Utilisateur</th>
            <th>Plats</th>
            <th class="montant">Prix Reel</th>
            <th class="montant">Subvention</th>
            <th class="montant">Supplement</th>
            <th>Etat</th>
          </tr>
        </thead>
        <tbody>
          ${commandes.map(cmd => `
            <tr>
              <td>${cmd.date_commande}</td>
              <td>${cmd.utilisateur_nom || cmd.utilisateur}</td>
              <td>${cmd.lignes?.map(l => l.plat_nom || l.menu_plat_nom).join(', ') || ''}</td>
              <td class="montant">${formatGNF(cmd.prix_reel_total || 0)}</td>
              <td class="montant">${formatGNF(cmd.montant_subvention || 0)}</td>
              <td class="montant">${formatGNF(cmd.supplement_total || 0)}</td>
              <td>${cmd.etat}</td>
            </tr>
          `).join('')}
          <tr class="total">
            <td colspan="3">TOTAL</td>
            <td class="montant">${formatGNF(totalPrixReel)}</td>
            <td class="montant">${formatGNF(totalSubvention)}</td>
            <td class="montant">${formatGNF(totalSupplement)}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  // Ouvrir dans une nouvelle fenetre pour impression
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.onload = () => {
    printWindow.print();
  };
  toast.success('PDF pret pour impression');
}

function attachTableEvents() {
  document.querySelectorAll('[data-validate]').forEach(btn => {
    btn.addEventListener('click', () => updateEtat(parseInt(btn.dataset.validate), 'validee'));
  });

  document.querySelectorAll('[data-deliver]').forEach(btn => {
    btn.addEventListener('click', () => updateEtat(parseInt(btn.dataset.deliver), 'livree'));
  });

  document.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
        updateEtat(parseInt(btn.dataset.cancel), 'annulee');
      }
    });
  });
}

async function updateEtat(id, etat) {
  try {
    await apiService.patch(`/api/restauration/commandes/${id}/`, { etat });
    toast.success('Commande mise à jour');
    await loadCommandes();
  } catch (error) {
    console.error('Erreur mise à jour:', error);
    toast.error('Erreur lors de la mise à jour');
  }
}
