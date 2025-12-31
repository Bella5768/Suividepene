/**
 * Page Commander Public - Commande de repas pour les travailleurs
 */

import { apiService } from '/static/depenses/js/services/api.js';
import { formatGNF } from '/static/depenses/js/utils/currency.js';
import { toast } from '/static/depenses/js/utils/toast.js';

let menuDuJour = [];
let panier = [];
let utilisateurNom = '';
let currentToken = null;

export async function renderCommanderPublic(token) {
  const app = document.getElementById('app');
  if (!app) return;

  // Stocker le token pour l'utiliser dans les appels API
  currentToken = token || null;

  app.innerHTML = `
    <div class="commander-public" style="max-width: 1200px; margin: 0 auto; padding: 2rem;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <img src="/static/depenses/assets/logocsig.png" alt="CSIG" style="height: 80px; margin-bottom: 1rem;" />
        <h1 style="color: #124684; font-size: 2.5rem; margin-bottom: 0.5rem;">Commander votre repas</h1>
        <p style="color: #64748b; font-size: 1.1rem;">Menu du jour - ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <p style="color: #124684; font-weight: bold; margin-top: 0.5rem;">Commandes jusqu'a 18h00 GMT</p>
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
    // Utiliser l'endpoint public avec le token si disponible, sinon menu du jour
    const endpoint = currentToken 
      ? `/api/restauration/public/menu/${currentToken}/`
      : '/api/restauration/public/menu/aujourdhui/';
    const data = await apiService.get(endpoint);
    // L'endpoint public retourne un seul menu, pas un tableau
    menuDuJour = data ? [data] : [];
    
    if (menuDuJour.length === 0) {
      content.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem;">
          <h2 style="color: #64748b;">Aucun menu disponible aujourd'hui</h2>
          <p style="color: #94a3b8; margin-top: 1rem;">Revenez demain pour decouvrir notre menu !</p>
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
  
  // Subvention de 30000 GNF uniquement sur le 1er plat (1 seule unite)
  // Les autres plats et quantites supplementaires sont au prix complet
  let subventionUtilisee = false;
  let totalSubvention = 0;
  let totalAPayer = 0;
  
  panier.forEach((item, index) => {
    for (let i = 0; i < item.quantite; i++) {
      if (!subventionUtilisee) {
        // Premier plat: subvention de max 30000 GNF
        const subvention = Math.min(item.prix, 30000);
        totalSubvention += subvention;
        totalAPayer += item.prix - subvention; // Supplement si > 30000
        subventionUtilisee = true;
      } else {
        // Autres plats: prix complet a payer
        totalAPayer += item.prix;
      }
    }
  });
  
  const totalSupplement = totalAPayer;
  
  // Extraire tous les plats de tous les menus
  const tousLesPlats = [];
  menuDuJour.forEach(menu => {
    if (menu.menu_plats && Array.isArray(menu.menu_plats)) {
      menu.menu_plats.forEach(mp => {
        tousLesPlats.push({
          id: mp.id,
          nom: mp.plat?.nom || mp.plat_detail?.nom || 'Plat',
          prix: parseFloat(mp.prix_jour) || 0,
          stock_restant: mp.stock_restant,
          categorie: mp.plat?.categorie_restau_display || mp.plat_detail?.categorie_restau_display || ''
        });
      });
    }
  });

  content.innerHTML = `
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
      <!-- Menu du jour -->
      <div>
        <h2 style="color: #124684; margin-bottom: 1.5rem;">Plats disponibles</h2>
        <div style="display: grid; gap: 1rem;">
          ${tousLesPlats.length === 0 ? `
            <div class="card" style="padding: 2rem; text-align: center;">
              <p style="color: #64748b;">Aucun plat disponible</p>
            </div>
          ` : tousLesPlats.map(plat => {
            const aSupplementPayer = plat.prix > 30000;
            const supplement = aSupplementPayer ? plat.prix - 30000 : 0;
            return `
            <div class="card" style="padding: 1.5rem; border: 2px solid ${aSupplementPayer ? '#f59e0b' : '#e5e7eb'}; transition: all 0.3s;" onmouseover="this.style.borderColor='#667eea'" onmouseout="this.style.borderColor='${aSupplementPayer ? '#f59e0b' : '#e5e7eb'}'">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                  <h3 style="color: #124684; font-size: 1.3rem; margin-bottom: 0.5rem;">${plat.nom}</h3>
                  ${plat.categorie ? `<span style="background: #f1f5f9; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; color: #475569;">${plat.categorie}</span>` : ''}
                  ${plat.stock_restant !== null ? `<span style="margin-left: 0.5rem; color: ${plat.stock_restant > 0 ? '#10b981' : '#ef4444'}; font-size: 0.85rem;">Stock: ${plat.stock_restant}</span>` : ''}
                  ${aSupplementPayer ? `
                    <div style="margin-top: 0.5rem; padding: 0.5rem; background: #fef3c7; border-radius: 6px; border-left: 3px solid #f59e0b;">
                      <span style="color: #92400e; font-size: 0.85rem; font-weight: bold;">Supplement a payer: ${formatGNF(supplement)}</span>
                      <br><span style="color: #92400e; font-size: 0.75rem;">Subventionne: 30 000 GNF | Vous payez: ${formatGNF(supplement)} en especes</span>
                    </div>
                  ` : ''}
                </div>
                <div style="text-align: right; margin-left: 1rem;">
                  <div style="font-size: 1.5rem; font-weight: bold; color: #10b981; margin-bottom: 0.5rem;">
                    ${formatGNF(plat.prix)}
                  </div>
                  ${aSupplementPayer ? `<div style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem;">Pris en charge: ${formatGNF(30000)}</div>` : ''}
                  <button 
                    class="btn btn-primary" 
                    onclick="window.ajouterAuPanier(${plat.id}, '${plat.nom.replace(/'/g, "\\'").replace(/"/g, '')}', ${plat.prix})"
                    style="background: #124684; border: none; padding: 0.75rem 1.5rem; font-weight: bold; border-radius: 6px;"
                    ${plat.stock_restant !== null && plat.stock_restant <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                  >
                    ${plat.stock_restant !== null && plat.stock_restant <= 0 ? 'Epuise' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          `}).join('')}
        </div>
      </div>

      <!-- Panier -->
      <div>
        <div class="card" style="position: sticky; top: 2rem; background: #124684; color: white;">
          <h2 style="color: white; margin-bottom: 1.5rem;">Votre commande</h2>
          
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
                      <button onclick="window.retirerDuPanier(${index})" style="background: #ef4444; border: none; color: white; padding: 0.5rem; border-radius: 6px; cursor: pointer; margin-left: 0.5rem;">X</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div style="border-top: 2px solid rgba(255,255,255,0.3); padding-top: 1rem; margin-bottom: 1.5rem;">
              <div style="display: flex; justify-content: space-between; font-size: 1rem; margin-bottom: 0.5rem;">
                <span>Prix total:</span>
                <span>${formatGNF(totalPanier)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 1rem; margin-bottom: 0.5rem; color: #10b981;">
                <span>Subvention (1er plat uniquement):</span>
                <span>-${formatGNF(totalSubvention)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem; background: ${totalSupplement > 0 ? '#fef3c7' : 'rgba(255,255,255,0.1)'}; color: ${totalSupplement > 0 ? '#92400e' : 'white'}; padding: 0.75rem; border-radius: 6px;">
                <span>A payer:</span>
                <span>${formatGNF(totalSupplement)}</span>
              </div>
              ${totalSupplement > 0 ? `
              <p style="font-size: 0.8rem; color: rgba(255,255,255,0.7); margin-top: 0.5rem;">
                * La subvention de 30 000 GNF s'applique uniquement au 1er plat. Les autres plats sont au prix complet.
              </p>
              ` : ''}
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
            
            <div style="margin-bottom: 1rem;">
              <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.9);">Votre email (optionnel)</label>
              <input 
                type="email" 
                id="utilisateur-email" 
                placeholder="Ex: jean.dupont@email.com"
                style="width: 100%; padding: 0.75rem; border: none; border-radius: 6px; font-size: 1rem;"
              />
            </div>
            
            <button 
              onclick="window.validerCommande()" 
              class="btn" 
              style="width: 100%; background: white; color: #124684; font-weight: bold; font-size: 1.1rem; padding: 1rem; border: none; border-radius: 6px;"
            >
              Valider ma commande
            </button>
          `}
        </div>
      </div>
    </div>
  `;
}

// Fonctions globales pour le panier
window.ajouterAuPanier = function(menuPlatId, nom, prix) {
  const existant = panier.find(item => item.menuPlatId === menuPlatId);
  if (existant) {
    // Augmenter la quantite si deja dans le panier
    existant.quantite += 1;
  } else {
    // Ajouter le nouveau plat au panier (plusieurs plats autorises)
    panier.push({ menuPlatId, nom, prix, quantite: 1 });
  }
  renderMenu();
  toast.success(`${nom} ajoute au panier`);
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
  const utilisateurEmail = document.getElementById('utilisateur-email')?.value.trim() || '';
  
  if (!utilisateurNom) {
    toast.error('Veuillez entrer votre nom');
    return;
  }
  
  if (panier.length === 0) {
    toast.error('Votre panier est vide');
    return;
  }
  
  try {
    // Créer la commande via l'endpoint public
    const commandeData = {
      nom_employe: utilisateurNom,
      email_employe: utilisateurEmail,
      lignes: panier.map(item => ({
        menu_plat_id: item.menuPlatId,
        quantite: item.quantite
      }))
    };
    
    // Utiliser le token si disponible, sinon menu du jour
    const commandeEndpoint = currentToken 
      ? `/api/restauration/public/commander/${currentToken}/`
      : '/api/restauration/public/commander/aujourdhui/';
    const response = await apiService.post(commandeEndpoint, commandeData);
    
    toast.success('Commande enregistree !');
    
    // Recuperer les informations de supplement
    const supplementInfo = response.supplement_info || {};
    const totalSupplementConfirm = supplementInfo.total_supplement || 0;
    const nomSauvegarde = utilisateurNom;
    const emailFourni = document.getElementById('utilisateur-email')?.value.trim();
    
    // Reinitialiser
    panier = [];
    utilisateurNom = '';
    
    // Afficher message de confirmation
    const content = document.getElementById('commander-public-content');
    content.innerHTML = `
      <div class="card" style="text-align: center; padding: 3rem; background: #124684; color: white;">
        <h2 style="color: white; font-size: 2rem; margin-bottom: 1rem;">Commande enregistree !</h2>
        <p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; margin-bottom: 1rem;">
          Merci <strong>${nomSauvegarde}</strong>, votre commande a ete enregistree.
        </p>
        ${totalSupplementConfirm > 0 ? `
          <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
            <p style="color: rgba(255,255,255,0.9); font-size: 1rem;">
              <strong>En attente de validation</strong> par le gestionnaire.
            </p>
            ${emailFourni ? `
              <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-top: 0.5rem;">
                Vous recevrez un email de confirmation a <strong>${emailFourni}</strong> une fois validee.
              </p>
            ` : ''}
          </div>
          <div style="background: #fef3c7; color: #92400e; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; text-align: left;">
            <h3 style="color: #92400e; margin-bottom: 0.5rem;">
              Supplement a payer
            </h3>
            <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">
              Vous devrez payer <strong>${formatGNF(totalSupplementConfirm)}</strong> en especes.
            </p>
            <p style="font-size: 0.9rem; color: #a16207;">
              Ce montant correspond a la difference entre le prix du plat et la subvention de 30 000 GNF.
            </p>
          </div>
        ` : `
          ${emailFourni ? `
            <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
              <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">
                Un email de confirmation sera envoye a <strong>${emailFourni}</strong>.
              </p>
            </div>
          ` : ''}
        `}
        <button 
          onclick="location.reload()" 
          class="btn" 
          style="background: white; color: #124684; font-weight: bold; padding: 1rem 2rem; border: none; font-size: 1.1rem; margin-top: 1rem; border-radius: 6px;"
        >
          Nouvelle commande
        </button>
      </div>
    `;
  } catch (error) {
    console.error('Erreur validation commande:', error);
    toast.error(error.message || 'Erreur lors de la validation de la commande');
  }
};

