import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatGNF } from '../utils/currency'
import { useAuth } from '../contexts/AuthContext'
import './RestaurationCommandes.css'

const RestaurationCommandes = () => {
  const [dateCommande, setDateCommande] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [panier, setPanier] = useState([])
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fonction pour vérifier si l'utilisateur a la permission de valider les commandes
  const canValidateCommand = () => {
    // Les superusers ont toujours la permission
    if (user?.is_superuser) return true
    
    // Si l'utilisateur n'a pas de permissions définies, on retourne false
    if (!user?.permissions) {
      return false
    }
    
    // Chercher la permission de validation des commandes
    if (Array.isArray(user.permissions)) {
      const permission = user.permissions.find(
        p => p.fonctionnalite === 'restauration_valider_commandes'
      )
      return permission ? permission.peut_modifier : false
    }
    
    return false
  }

  const { data: menu, refetch: refetchMenu } = useQuery(
    ['menu', dateCommande],
    async () => {
      try {
        const response = await axios.get(`/api/restauration/menus/?date_menu=${dateCommande}`)
        const data = response.data
        // Gérer les deux formats possibles (liste ou pagination)
        let menus = []
        if (data.results) {
          menus = data.results
        } else if (Array.isArray(data)) {
          menus = data
        }
        return menus.find(m => m.date_menu === dateCommande) || menus[0] || null
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 400) {
          return null
        }
        throw error
      }
    },
    {
      retry: 1,
      enabled: !!dateCommande,
    }
  )

  // Récupérer toutes les commandes pour la date (ou seulement celle de l'utilisateur)
  const { data: commandesData } = useQuery(
    ['commandes', dateCommande],
    async () => {
      const response = await axios.get(`/api/restauration/commandes/?date_commande=${dateCommande}`)
      const commandes = response.data.results || response.data
      return Array.isArray(commandes) ? commandes : (commandes ? [commandes] : [])
    },
    {
      retry: 1,
      enabled: !!dateCommande,
    }
  )

  // La commande de l'utilisateur connecté
  const commandeExistante = commandesData && commandesData.length > 0 
    ? commandesData.find(c => c.utilisateur === user?.id || c.utilisateur_username === user?.username) || null
    : null
  
  // Toutes les commandes en brouillon pour validation (si l'utilisateur a la permission)
  const commandesAValider = canValidateCommand() && commandesData
    ? commandesData.filter(c => c.etat === 'brouillon' && (c.utilisateur !== user?.id && c.utilisateur_username !== user?.username))
    : []

  const creerCommandeMutation = useMutation(
    (data) => axios.post('/api/restauration/commandes/creer_avec_lignes/', data),
    {
      onSuccess: () => {
        toast.success('Commande créée')
        queryClient.invalidateQueries('commande')
        setPanier([])
      },
      onError: (error) => {
        const message = error.response?.data?.error || error.response?.data?.details || 'Erreur lors de la création'
        toast.error(message)
      },
    }
  )

  const validerMutation = useMutation(
    (commandeId) => axios.post(`/api/restauration/commandes/${commandeId}/valider/`),
    {
      onSuccess: () => {
        toast.success('Commande validée')
        queryClient.invalidateQueries('commande')
        queryClient.invalidateQueries('commandes')
      },
      onError: (error) => {
        const message = error.response?.data?.error || error.response?.data?.detail || 'Erreur lors de la validation'
        toast.error(message)
      },
    }
  )

  const ajouterAuPanier = (menuPlat) => {
    // Limiter à un seul plat : remplacer le panier au lieu d'ajouter
    setPanier([{
      menu_plat_id: menuPlat.id,
      quantite: 1,
      menu_plat: menuPlat,
    }])
  }

  const retirerDuPanier = () => {
    setPanier([])
  }

  const calculerTotal = () => {
    if (panier.length === 0) return 0
    return panier[0].menu_plat.prix_jour
  }

  const getPlatSelectionne = () => {
    return panier.length > 0 ? panier[0] : null
  }

  const getSupplementFacture = () => {
    const plat = getPlatSelectionne()
    if (!plat) return 0
    const prix = plat.menu_plat.prix_jour
    return prix > 30000 ? prix - 30000 : 0
  }

  const handleCommander = () => {
    if (panier.length === 0) {
      toast.error('Votre panier est vide')
      return
    }

    const lignes = panier.map(item => ({
      menu_plat_id: item.menu_plat_id.toString(),
      quantite: item.quantite.toString(),
    }))

    creerCommandeMutation.mutate({
      date_commande: dateCommande,
      lignes,
    })
  }

  const handleValider = (commandeId) => {
    if (commandeId) {
      validerMutation.mutate(commandeId)
    } else if (commandeExistante && commandeExistante.etat === 'brouillon') {
      validerMutation.mutate(commandeExistante.id)
    }
  }

  return (
    <div className="restauration-commandes">
      <div className="breadcrumbs">
        <span>Accueil</span>
        <span className="breadcrumb-separator">›</span>
        <span>Restauration</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Commander</span>
      </div>
      
      <div className="page-header">
        <h1>Commander un Repas</h1>
        <input
          type="date"
          className="form-input"
          value={dateCommande}
          onChange={(e) => setDateCommande(e.target.value)}
          style={{ width: 'auto' }}
        />
      </div>

      {commandeExistante ? (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2>Ma Commande du {format(new Date(commandeExistante.date_commande), 'dd/MM/yyyy')}</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <span className={`badge badge-${commandeExistante.etat === 'validee' ? 'success' : 'warning'}`}>
              {commandeExistante.etat_display}
            </span>
            {commandeExistante.etat === 'brouillon' && canValidateCommand() && (
              <button
                onClick={handleValider}
                className="btn btn-primary"
                disabled={validerMutation.isLoading}
              >
                {validerMutation.isLoading ? 'Validation...' : '✓ Valider la Commande'}
              </button>
            )}
          </div>
          
          {commandeExistante.lignes && commandeExistante.lignes.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Plat</th>
                  <th>Quantité</th>
                  <th>Prix Unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {commandeExistante.lignes.map((ligne) => (
                  <tr key={ligne.id}>
                    <td>{ligne.plat_nom}</td>
                    <td>{ligne.quantite}</td>
                    <td>{formatGNF(ligne.prix_unitaire)}</td>
                    <td><strong>{formatGNF(ligne.montant_ligne)}</strong></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>Total Brut</strong></td>
                  <td><strong>{formatGNF(commandeExistante.montant_brut)}</strong></td>
                </tr>
                {commandeExistante.montant_subvention > 0 && (
                  <tr>
                    <td colSpan="3"><strong>Subvention</strong></td>
                    <td><strong style={{ color: 'var(--success-color)' }}>-{formatGNF(commandeExistante.montant_subvention)}</strong></td>
                  </tr>
                )}
                <tr>
                  <td colSpan="3"><strong>Total Net</strong></td>
                  <td><strong>{formatGNF(commandeExistante.montant_net)}</strong></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      ) : null}

      {/* Section pour valider les commandes d'autres utilisateurs */}
      {canValidateCommand() && commandesAValider.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid #007bff' }}>
          <h2 style={{ color: '#007bff', marginBottom: '1rem' }}>
            🔍 Commandes à Valider ({commandesAValider.length})
          </h2>
          <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
            Liste de toutes les commandes en brouillon pour le {format(new Date(dateCommande), 'dd/MM/yyyy')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {commandesAValider.map((commande) => (
              <div 
                key={commande.id} 
                style={{ 
                  padding: '1rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <strong>Commande #{commande.id}</strong>
                    <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>
                      - <strong style={{ color: '#007bff' }}>{commande.utilisateur_nom || commande.utilisateur_username || 'Utilisateur inconnu'}</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => handleValider(commande.id)}
                    className="btn btn-primary"
                    disabled={validerMutation.isLoading}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    {validerMutation.isLoading ? 'Validation...' : '✓ Valider'}
                  </button>
                </div>
                {commande.lignes && commande.lignes.length > 0 && (
                  <table className="table" style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <thead>
                      <tr>
                        <th>Plat</th>
                        <th>Quantité</th>
                        <th>Prix Unitaire</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commande.lignes.map((ligne) => (
                        <tr key={ligne.id}>
                          <td>{ligne.plat_nom}</td>
                          <td>{ligne.quantite}</td>
                          <td>{formatGNF(ligne.prix_unitaire)}</td>
                          <td><strong>{formatGNF(ligne.montant_ligne)}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3"><strong>Total Net</strong></td>
                        <td><strong>{formatGNF(commande.montant_net)}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {menu && menu.est_publie ? (
        <div className="card">
          <h2>Menu du {format(new Date(menu.date_menu), 'dd MMMM yyyy', { locale: fr })}</h2>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fee', border: '2px solid #dc3545', borderRadius: '6px' }}>
            <p style={{ color: '#dc3545', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1rem' }}>
              ⚠️ Important : Vous ne pouvez commander qu'un seul plat par commande.
            </p>
            <p style={{ color: '#dc3545', margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>
              Si le prix du plat dépasse 30 000 GNF, un supplément sera facturé à la réception.
            </p>
          </div>
          
          {menu.menu_plats && menu.menu_plats.length > 0 ? (
            <div className="plats-grid">
              {menu.menu_plats.map((menuPlat) => {
                const panierItem = panier.find(item => item.menu_plat_id === menuPlat.id)
                const stockRestant = menuPlat.stock_restant
                const disponible = stockRestant === null || stockRestant > 0
                
                return (
                  <div key={menuPlat.id} className="plat-card">
                    <div className="plat-header">
                      <h3>{menuPlat.plat.nom}</h3>
                      <span className="badge badge-primary">{menuPlat.plat.categorie_restau_display}</span>
                    </div>
                    {menuPlat.plat.description && (
                      <p className="plat-description">{menuPlat.plat.description}</p>
                    )}
                    <div className="plat-footer">
                      <div className="plat-prix">{formatGNF(menuPlat.prix_jour)}</div>
                      {stockRestant !== null && (
                        <div className="plat-stock">Stock: {stockRestant}</div>
                      )}
                      {disponible ? (
                        <div className="plat-actions">
                          {panierItem ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                              <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                                ✓ Sélectionné
                              </span>
                              <button
                                onClick={() => retirerDuPanier()}
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                              >
                                Retirer
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => ajouterAuPanier(menuPlat)}
                              className="btn btn-primary"
                              disabled={stockRestant !== null && stockRestant <= 0 || panier.length > 0}
                              title={panier.length > 0 ? "Vous ne pouvez commander qu'un seul plat" : "Sélectionner ce plat"}
                            >
                              {panier.length > 0 ? "Un seul plat autorisé" : "Sélectionner"}
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="badge badge-danger">Épuisé</span>
                      )}
                      {menuPlat.prix_jour > 30000 && (
                        <div style={{ 
                          marginTop: '0.5rem', 
                          padding: '0.5rem', 
                          backgroundColor: '#fff3cd', 
                          border: '1px solid #ffc107',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          color: '#856404',
                          textAlign: 'center'
                        }}>
                          ⚠️ Supplément: {formatGNF(menuPlat.prix_jour - 30000)} à payer à la réception
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Aucun plat disponible pour ce menu.
            </p>
          )}

          {panier.length > 0 && (
            <div className="panier-fixed">
              <div className="panier-content">
                <div className="panier-header">
                  <h3>Votre Commande</h3>
                  <button onClick={() => setPanier([])} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                    Retirer
                  </button>
                </div>
                <div className="panier-items">
                  {panier.map((item) => {
                    const supplement = item.menu_plat.prix_jour > 30000 ? item.menu_plat.prix_jour - 30000 : 0
                    return (
                      <div key={item.menu_plat_id} className="panier-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span><strong>{item.menu_plat.plat.nom}</strong></span>
                          <span>{formatGNF(item.menu_plat.prix_jour)}</span>
                        </div>
                        {supplement > 0 && (
                          <div style={{ 
                            padding: '0.5rem', 
                            backgroundColor: '#fff3cd', 
                            border: '1px solid #ffc107',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            color: '#856404'
                          }}>
                            ⚠️ <strong>Supplément:</strong> {formatGNF(supplement)} à payer à la réception
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div className="panier-total" style={{ padding: '1rem 0', borderTop: '2px solid var(--primary-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span><strong>Prix du plat :</strong></span>
                    <span><strong>{formatGNF(calculerTotal())}</strong></span>
                  </div>
                  {getSupplementFacture() > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      paddingTop: '0.5rem',
                      borderTop: '1px dashed #ccc',
                      fontSize: '0.9rem',
                      color: '#856404'
                    }}>
                      <span>Supplément à la réception :</span>
                      <span style={{ fontWeight: 'bold' }}>{formatGNF(getSupplementFacture())}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCommander}
                  className="btn btn-primary"
                  disabled={creerCommandeMutation.isLoading}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {creerCommandeMutation.isLoading ? 'Commande en cours...' : 'Commander'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            {menu ? (
              <>
                <p style={{ color: '#856404', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  ⚠️ Le menu n'est pas encore publié.
                </p>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Le menu existe mais n'a pas été publié. Les employés ne peuvent pas encore commander.
                </p>
                <button
                  onClick={() => navigate('/restauration/menus')}
                  className="btn btn-primary"
                >
                  Aller à la Gestion des Menus pour publier
                </button>
              </>
            ) : (
              <>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Aucun menu disponible pour cette date.
                </p>
                {user?.is_staff && (
                  <button
                    onClick={() => navigate('/restauration/menus')}
                    className="btn btn-primary"
                  >
                    Créer un Menu
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurationCommandes

