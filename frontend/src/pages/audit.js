/**
 * Page Audit - Journaux d'audit
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { toast } from '/static/depenses/js/utils/toast.js';
import { getMainContent } from '/static/depenses/js/layout.js';

let auditLogs = [];
let dateDebut = '';
let dateFin = '';
let actionFilter = '';

const actionLabels = {
  'create': 'Creation',
  'update': 'Modification',
  'delete': 'Suppression',
  'validate': 'Validation',
  'export': 'Export',
  'import': 'Import',
};

const actionColors = {
  'create': '#10b981',
  'update': '#3b82f6',
  'delete': '#ef4444',
  'validate': '#8b5cf6',
  'export': '#f59e0b',
  'import': '#06b6d4',
};

export async function renderAudit() {
  const main = getMainContent();
  if (!main) return;

  const today = new Date().toISOString().split('T')[0];

  main.innerHTML = `
    <div class="audit">
      <div class="breadcrumbs">
        <span>Accueil</span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Audit</span>
      </div>
      <div class="page-header">
        <h1>Journaux d'Audit</h1>
      </div>
      
      <div class="card filters-card">
        <div class="filters-row" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end;">
          <div class="filter-group">
            <label>Date debut</label>
            <input type="date" id="filter-date-debut" class="form-input" value="${today}" />
          </div>
          <div class="filter-group">
            <label>Date fin</label>
            <input type="date" id="filter-date-fin" class="form-input" value="${today}" />
          </div>
          <div class="filter-group">
            <label>Action</label>
            <select id="filter-action" class="form-input">
              <option value="">Toutes</option>
              <option value="create">Creation</option>
              <option value="update">Modification</option>
              <option value="delete">Suppression</option>
              <option value="validate">Validation</option>
              <option value="export">Export</option>
              <option value="import">Import</option>
            </select>
          </div>
          <div class="filter-group filter-actions" style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary" id="btn-filter">Afficher</button>
            <button class="btn" id="btn-export-excel" style="background: #10b981; color: white; border: none;">Excel</button>
            <button class="btn" id="btn-export-pdf" style="background: #ef4444; color: white; border: none;">PDF</button>
          </div>
        </div>
      </div>

      <div id="audit-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `;

  dateDebut = today;
  dateFin = today;
  
  await loadAuditLogs();
  attachEvents();
}

async function loadAuditLogs() {
  const content = document.getElementById('audit-content');
  if (!content) return;

  content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    let url = '/api/audit/?';
    if (dateDebut) url += `timestamp_after=${dateDebut}&`;
    if (dateFin) url += `timestamp_before=${dateFin}&`;
    if (actionFilter) url += `action=${actionFilter}&`;
    
    const data = await apiService.get(url);
    auditLogs = Array.isArray(data) ? data : (data.results || []);
    renderAuditTable();
  } catch (error) {
    console.error('Erreur chargement audit:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement des journaux d'audit.</p>
        <button class="btn btn-primary" onclick="location.reload()">Reessayer</button>
      </div>
    `;
  }
}

function renderAuditTable() {
  const content = document.getElementById('audit-content');
  if (!content) return;

  if (auditLogs.length === 0) {
    content.innerHTML = `
      <div class="card">
        <p style="text-align: center; color: #64748b; padding: 2rem;">
          Aucun journal d'audit pour cette periode.
        </p>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="card">
      <div class="table-header" style="display: flex; flex-wrap: wrap; gap: 1rem;">
        <span><strong>${auditLogs.length}</strong> entree(s)</span>
      </div>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Date/Heure</th>
              <th>Action</th>
              <th>Utilisateur</th>
              <th>Modele</th>
              <th>Objet</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            ${auditLogs.map(log => {
              const actionLabel = actionLabels[log.action] || log.action;
              const actionColor = actionColors[log.action] || '#64748b';
              const timestamp = new Date(log.timestamp).toLocaleString('fr-FR');
              return `
              <tr>
                <td style="white-space: nowrap;">${timestamp}</td>
                <td><span style="background: ${actionColor}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">${actionLabel}</span></td>
                <td>${log.user_username || '-'}</td>
                <td>${log.model_name || '-'}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${log.object_repr || ''}">${log.object_repr || '-'}</td>
                <td>${log.ip_address || '-'}</td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function attachEvents() {
  document.getElementById('btn-filter')?.addEventListener('click', () => {
    dateDebut = document.getElementById('filter-date-debut').value;
    dateFin = document.getElementById('filter-date-fin').value;
    actionFilter = document.getElementById('filter-action').value;
    loadAuditLogs();
  });
  
  document.getElementById('btn-export-excel')?.addEventListener('click', exportExcel);
  document.getElementById('btn-export-pdf')?.addEventListener('click', exportPDF);
}

async function exportExcel() {
  if (auditLogs.length === 0) {
    toast.error('Aucune donnee a exporter');
    return;
  }
  
  try {
    let url = '/api/audit/export_excel/?';
    if (dateDebut) url += `timestamp_after=${dateDebut}&`;
    if (dateFin) url += `timestamp_before=${dateFin}&`;
    if (actionFilter) url += `action=${actionFilter}&`;
    
    window.open(url, '_blank');
    toast.success('Export Excel en cours...');
  } catch (error) {
    toast.error('Erreur lors de l\'export');
  }
}

async function exportPDF() {
  if (auditLogs.length === 0) {
    toast.error('Aucune donnee a exporter');
    return;
  }
  
  try {
    let url = '/api/audit/export_pdf/?';
    if (dateDebut) url += `timestamp_after=${dateDebut}&`;
    if (dateFin) url += `timestamp_before=${dateFin}&`;
    if (actionFilter) url += `action=${actionFilter}&`;
    
    window.open(url, '_blank');
    toast.success('Export PDF en cours...');
  } catch (error) {
    toast.error('Erreur lors de l\'export');
  }
}

