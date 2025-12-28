/**
 * Page Commander Public - Commande de repas pour les travailleurs
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';

let menuDuJour = [];
let panier = [];
let utilisateurNom = '';

export async function renderCommanderPublic(token) {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="commander-public" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="color: #1e40af; font-size: 2.5rem; margin-bottom: 0.5rem;">🍽️ Commander votre repas</h1>
        <p style="color: #64748b; font-size: 1.1rem;">Menu du jour - ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p style="color: #ef4444; font-weight: bold; margin-top: 0.5rem;">⏰ Commandes jusqu'à 13h00 GMT</p>
      </div>
      <div id="commander-public-content">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `;

  await loadMenuDuJour();
}

async function loadMenuDuJour() {
  const content = document.getElementById('commander-public-content');
  if (!content) return;

  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await apiService.get(`/api/restauration/menus/?date_menu=${today}&actif=true`);
    menuDuJour = Array.isArray(data) ? data : (data.results || []);
    
    if (menuDuJour.length === 0) {
      content.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem;">
          <h2 style="color: #64748b;">😔 Aucun menu disponible aujourd'hui</h2>
          <p style="color: #94a3b8; margin-top: 1rem;">Revenez demain pour découvrir notre menu !</p>
        </div>
      `;
      return;
    }
    
    renderMenu();
  } catch (error) {
    console.error('Erreur chargement menu:', error);
    content.innerHTML = `
      <div class="card error-card">
        <p>Erreur lors du chargement du menu.</p>
        <button class="btn btn-primary" onclick="location.reload()">Réessayer</button>
      </div>
    `;
  }
}

function renderMenu() {
  const content = document.getElementById('commander-public-content');
  if (!content) return;

  const totalPanier = panier.reduce((sum, item) => sum + (item.prix * item.quantite), 0);

  content.innerHTML = `
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
      <!-- Menu du jour -->
      <div>
        <h2 style="color: #1e40af; margin-bottom: 1.5rem;">📋 Plats disponibles</h2>
        <div style="display: grid; gap: 1rem;">
          ${menuDuJour.map(menu => `
            <div class="card" style="padding: 1.5rem; border: 2px solid #e5e7eb; transition: all 0.3s;" onmouseover="this.style.borderColor='#667eea'" onmouseout="this.style.borderColor='#e5e7eb'">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                  <h3 style="color: #1e40af; font-size: 1.3rem; margin-bottom: 0.5rem;">${menu.nom_menu || 'Menu'}</h3>
                  <p style="color: #64748b; margin-bottom: 1rem;">${menu.description || ''}</p>
                  <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    ${menu.plats?.map(plat => `
                      <span style="background: #f1f5f9; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.9rem; color: #475569;">
                        ${plat.nom}
                      </span>
                    `).join('') || ''}
                  </div>
                </div>
                <div style="text-align: right; margin-left: 1rem;">
                  <div style="font-size: 1.5rem; font-weight: bold; color: #10b981; margin-bottom: 1rem;">
                    ${formatGNF(menu.prix_total || 0)}
                  </div>
                  <button 
                    class="btn btn-primary" 
                    onclick="window.ajouterAuPanier(${menu.id}, '${menu.nom_menu}', ${menu.prix_total})"
                    style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; padding: 0.75rem 1.5rem; font-weight: bold;"
                  >
                    ➕ Ajouter
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Panier -->
      <div>
        <div class="card" style="position: sticky; top: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <h2 style="color: white; margin-bottom: 1.5rem;">🛒 Votre commande</h2>
          
          ${panier.length === 0 ? `
            <p style="color: rgba(255,255,255,0.8); text-align: center; padding: 2rem;">
              Votre panier est vide
            </p>
          ` : `
            <div style="margin-bottom: 1.5rem;">
              ${panier.map((item, index) => `
                <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 0.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: bold;">${item.nom}</div>
                      <div style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">${formatGNF(item.prix)} × ${item.quantite}</div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                      <button onclick="window.modifierQuantite(${index}, -1)" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold;">-</button>
                      <span style="font-weight: bold;">${item.quantite}</span>
                      <button onclick="window.modifierQuantite(${index}, 1)" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-weight: bold;">+</button>
                      <button onclick="window.retirerDuPanier(${index})" style="background: #ef4444; border: none; color: white; padding: 0.5rem; border-radius: 6px; cursor: pointer; margin-left: 0.5rem;">🗑️</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 1rem; margin-bottom: 1.5rem;">
              <div style="display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: bold;">
                <span>Total:</span>
                <span>${formatGNF(totalPanier)}</span>
              </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.9);">Votre nom complet *</label>
              <input 
                type="text" 
                id="utilisateur-nom" 
                placeholder="Ex: Jean Dupont"
                value="${utilisateurNom}"
                style="width: 100%; padding: 0.75rem; border: none; border-radius: 6px; font-size: 1rem;"
              />
            </div>
            
            <button 
              onclick="window.validerCommande()" 
              class="btn" 
              style="width: 100%; background: white; color: #667eea; font-weight: bold; font-size: 1.1rem; padding: 1rem; border: none;"
            >
              ✅ Valider ma commande
            </button>
          `}
        </div>
      </div>
    </div>
  `;
}

// Fonctions globales pour le panier
window.ajouterAuPanier = function(menuId, nom, prix) {
  const existant = panier.find(item => item.menuId === menuId);
  if (existant) {
    existant.quantite++;
  } else {
    panier.push({ menuId, nom, prix, quantite: 1 });
  }
  renderMenu();
  toast.success(`${nom} ajouté au panier`);
};

window.modifierQuantite = function(index, delta) {
  panier[index].quantite += delta;
  if (panier[index].quantite <= 0) {
    panier.splice(index, 1);
  }
  renderMenu();
};

window.retirerDuPanier = function(index) {
  panier.splice(index, 1);
  renderMenu();
  toast.info('Article retiré du panier');
};

window.validerCommande = async function() {
  utilisateurNom = document.getElementById('utilisateur-nom')?.value.trim();
  
  if (!utilisateurNom) {
    toast.error('Veuillez entrer votre nom');
    return;
  }
  
  if (panier.length === 0) {
    toast.error('Votre panier est vide');
    return;
  }
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Créer la commande
    const commandeData = {
      date_commande: today,
      utilisateur_nom: utilisateurNom,
      lignes: panier.map(item => ({
        menu: item.menuId,
        quantite: item.quantite
      }))
    };
    
    await apiService.post('/api/restauration/commandes/', commandeData);
    
    toast.success('✅ Commande validée avec succès !');
    
    // Réinitialiser
    panier = [];
    utilisateurNom = '';
    
    // Afficher message de confirmation
    const content = document.getElementById('commander-public-content');
    content.innerHTML = `
      <div class="card" style="text-align: center; padding: 3rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
        <h2 style="color: white; font-size: 2rem; margin-bottom: 1rem;">Commande validée !</h2>
        <p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; margin-bottom: 2rem;">
          Merci ${utilisateurNom}, votre commande a été enregistrée avec succès.
        </p>
        <button 
          onclick="location.reload()" 
          class="btn" 
          style="background: white; color: #10b981; font-weight: bold; padding: 1rem 2rem; border: none; font-size: 1.1rem;"
        >
          🔄 Nouvelle commande
        </button>
      </div>
    `;
  } catch (error) {
    console.error('Erreur validation commande:', error);
    toast.error(error.message || 'Erreur lors de la validation de la commande');
  }
};

