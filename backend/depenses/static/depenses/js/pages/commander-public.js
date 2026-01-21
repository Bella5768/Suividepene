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
    <style>
      .commander-public { max-width: 1200px; margin: 0 auto; padding: 1rem; }
      .commander-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
      @media (min-width: 768px) {
        .commander-public { padding: 2rem; }
        .commander-grid { grid-template-columns: 2fr 1fr; gap: 2rem; }
      }
      .commander-header h1 { font-size: 1.5rem; }
      @media (min-width: 768px) {
        .commander-header h1 { font-size: 2.5rem; }
      }
    </style>
    <div class="commander-public">
      <div class="commander-header" style="text-align: center; margin-bottom: 1.5rem;">
        <img src="/static/depenses/assets/logocsig.png" alt="CSIG" style="height: 60px; margin-bottom: 1rem;" />
        <h1 style="color: #124684; margin-bottom: 0.5rem;">Commander votre repas</h1>
        <p style="color: #64748b; font-size: 1rem;">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div style="margin-top: 1rem; padding: 0.75rem; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd;">
          <p style="color: #0369a1; font-size: 0.9rem; margin: 0;">
            <strong>Contact Gestionnaire:</strong> Hawa Bah - <a href="tel:+224620559464" style="color: #0369a1; text-decoration: none; font-weight: bold;">620 55 94 64</a>
          </p>
          <p style="color: #64748b; font-size: 0.8rem; margin: 0.25rem 0 0 0;">Pour paiement supplement ou informations</p>
        </div>
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
    
    // Appel direct sans authentification pour les endpoints publics
    const response = await fetch(endpoint);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw { response: { data: errorData }, message: errorData.error || 'Erreur serveur' };
    }
    const data = await response.json();
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
    const errorMessage = error?.response?.data?.error || error?.message || 'Erreur inconnue';
    content.innerHTML = `
      <div class="card" style="text-align: center; padding: 2rem;">
        <h2 style="color: #ef4444; margin-bottom: 1rem;">Menu non disponible</h2>
        <p style="color: #64748b; margin-bottom: 1rem;">${errorMessage}</p>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem;">
          Le menu du jour n'a pas encore ete publie par le gestionnaire.
        </p>
        <button class="btn btn-primary" onclick="location.reload()" style="background: #124684; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; color: white; font-weight: bold;">
          Reessayer
        </button>
      </div>
    `;
  }
}

function renderMenu() {
  const content = document.getElementById('commander-public-content');
  if (!content) return;

  // Pas de calcul de prix - affichage uniquement des plats
  
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
    <div class="commander-grid">
      <!-- Menu du jour -->
      <div>
        <h2 style="color: #124684; margin-bottom: 1rem; font-size: 1.3rem;">Plats disponibles</h2>
        <div style="display: grid; gap: 1rem;">
          ${tousLesPlats.length === 0 ? `
            <div class="card" style="padding: 2rem; text-align: center;">
              <p style="color: #64748b;">Aucun plat disponible</p>
            </div>
          ` : tousLesPlats.map(plat => {
            return `
            <div class="card" style="padding: 1rem; border: 2px solid #e5e7eb;">
              <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem;">
                <div style="flex: 1; min-width: 150px;">
                  <h3 style="color: #124684; font-size: 1.1rem; margin-bottom: 0.25rem;">${plat.nom}</h3>
                  ${plat.categorie ? `<span style="background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 8px; font-size: 0.75rem; color: #475569;">${plat.categorie}</span>` : ''}
                </div>
                <div style="text-align: right;">
                  <button 
                    class="btn btn-primary" 
                    onclick="window.ajouterAuPanier(${plat.id}, '${plat.nom.replace(/'/g, "\\'").replace(/"/g, '')}', ${plat.prix})"
                    style="background: #124684; border: none; padding: 0.5rem 1rem; font-weight: bold; border-radius: 6px; font-size: 0.9rem;"
                    ${plat.stock_restant !== null && plat.stock_restant <= 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                  >
                    ${plat.stock_restant !== null && plat.stock_restant <= 0 ? 'Epuise' : 'Choisir'}
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
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                      <button onclick="window.retirerDuPanier(${index})" style="background: #ef4444; border: none; color: white; padding: 0.5rem; border-radius: 6px; cursor: pointer;">Retirer</button>
                    </div>
                  </div>
                </div>
              `).join('')}
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
    
    // Appel direct sans authentification pour les endpoints publics
    const fetchResponse = await fetch(commandeEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commandeData)
    });
    if (!fetchResponse.ok) {
      const errorData = await fetchResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de la commande');
    }
    const response = await fetchResponse.json();
    
    toast.success('Commande enregistree !');
    
    const nomSauvegarde = utilisateurNom;
    const emailFourni = document.getElementById('utilisateur-email')?.value.trim();
    
    // Reinitialiser
    panier = [];
    utilisateurNom = '';
    
    // Afficher message de confirmation
    const content = document.getElementById('commander-public-content');
    
    content.innerHTML = `
      <div class="card" style="text-align: center; padding: 2rem; background: #10b981; color: white;">
        <h2 style="color: white; font-size: 1.8rem; margin-bottom: 1rem;">Commande enregistree !</h2>
        <p style="color: rgba(255,255,255,0.9); font-size: 1rem; margin-bottom: 1rem;">
          Merci <strong>${nomSauvegarde}</strong>, votre commande a ete enregistree avec succes.
        </p>
        <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem;">
          Votre repas sera pret pour le dejeuner.
        </p>
        ${emailFourni ? `
          <p style="color: rgba(255,255,255,0.8); font-size: 0.85rem; margin-top: 0.5rem;">
            Confirmation envoyee a <strong>${emailFourni}</strong>.
          </p>
        ` : ''}
        <button onclick="location.reload()" class="btn" style="background: white; color: #10b981; font-weight: bold; padding: 1rem 2rem; border: none; font-size: 1rem; margin-top: 1rem; border-radius: 6px;">
          Nouvelle commande
        </button>
      </div>
    `;
  } catch (error) {
    console.error('Erreur validation commande:', error);
    toast.error(error.message || 'Erreur lors de la validation de la commande');
  }
};

