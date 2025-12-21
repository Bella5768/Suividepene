import { useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatGNF } from '../utils/currency'
import './CommanderPublic.css'

const CommanderPublic = () => {
  const { token } = useParams()
  // Si pas de token, utiliser "aujourdhui" par défaut
  const tokenFinal = token || 'aujourdhui'
  const [panier, setPanier] = useState([])
  const [formData, setFormData] = useState({
    nom_employe: '',
    email_employe: '',
  })
  const queryClient = useQueryClient()

  // Vérifier si les commandes sont fermées (après 11h30 heure de Guinée Conakry)
  const isCommandeClosed = useMemo(() => {
    // Créer une date avec le fuseau horaire de Guinée Conakry (GMT+0)
    const now = new Date()
    // Convertir l'heure locale en heure GMT+0 (Guinée Conakry)
    const guineaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Conakry' }))
    const heures = guineaTime.getHours()
    const minutes = guineaTime.getMinutes()
    
    // Fermer après 11h30
    return heures > 11 || (heures === 11 && minutes >= 30)
  }, [])

  const { data: menu, isLoading, error } = useQuery(
    ['menu-public', tokenFinal],
    async () => {
      const response = await axios.get(`/api/restauration/public/menu/${tokenFinal}/`)
      return response.data
    },
    {
      retry: 1,
      enabled: !!tokenFinal,
    }
  )

  const creerCommandeMutation = useMutation(
    (data) => axios.post(`/api/restauration/public/commander/${tokenFinal}/`, data),
    {
      onSuccess: () => {
        toast.success('✅ Commande créée avec succès ! Vous recevrez une confirmation par email si vous avez fourni votre adresse.')
        setPanier([])
        setFormData({ nom_employe: '', email_employe: '' })
        // Scroll vers le haut pour voir le message de confirmation
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },
      onError: (error) => {
        const message = error.response?.data?.error || 'Erreur lors de la création'
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

  const handleCommander = (e) => {
    e.preventDefault()
    
    // Vérifier si les commandes sont fermées
    if (isCommandeClosed) {
      toast.error('⏰ Les commandes sont fermées après 11h30 (heure de Guinée Conakry)')
      return
    }

    if (panier.length === 0) {
      toast.error('Votre panier est vide')
      return
    }

    if (!formData.nom_employe.trim()) {
      toast.error('Veuillez entrer votre nom')
      return
    }

    const lignes = panier.map(item => ({
      menu_plat_id: item.menu_plat_id,
      quantite: item.quantite,
    }))

    creerCommandeMutation.mutate({
      nom_employe: formData.nom_employe,
      email_employe: formData.email_employe,
      lignes,
    })
  }

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error || !menu) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Menu non disponible'
    const statusCode = error?.response?.status
    const isAujourdhui = tokenFinal === 'aujourdhui'
    
    return (
      <div className="commander-public">
        <div className="card" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <h2 style={{ color: '#856404', marginTop: 0 }}>⚠️ Menu non disponible</h2>
          <p style={{ color: '#856404', marginBottom: '1rem' }}>
            {errorMessage}
          </p>
          {statusCode === 404 && isAujourdhui && (
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Aucun menu n'a été publié pour aujourd'hui.
              <br />
              La responsable de la cantine doit publier le menu du jour pour que vous puissiez commander.
            </p>
          )}
          {statusCode === 404 && !isAujourdhui && (
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Le menu correspondant à ce lien n'existe pas ou n'est plus disponible.
              <br />
              Vérifiez que le lien est correct ou contactez l'administrateur.
            </p>
          )}
          {statusCode && statusCode !== 404 && (
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Erreur {statusCode}: {errorMessage}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="commander-public">
      <div className="public-header">
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem' }}>🍽️ Commande de Repas</h1>
          <h2 style={{ margin: '0.5rem 0', fontSize: '1.5rem', fontWeight: 'normal' }}>
            {format(new Date(menu.date_menu), 'dd MMMM yyyy', { locale: fr })}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '1rem', fontSize: '1.1rem' }}>
            Remplissez le formulaire ci-dessous pour commander votre repas
          </p>
          {isCommandeClosed && (
            <div style={{ 
              marginTop: '1.5rem', 
              padding: '1rem', 
              backgroundColor: 'rgba(220, 53, 69, 0.9)', 
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>
              ⏰ Les commandes sont fermées après 11h30 (heure de Guinée Conakry)
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleCommander}>
        <div className="card" style={{ marginBottom: '1.5rem', border: '2px solid var(--primary-color)' }}>
          <h2 style={{ color: 'var(--primary-color)', marginTop: 0 }}>📝 Vos Informations</h2>
          <div className="form-group">
            <label className="form-label">
              <strong>Nom complet *</strong>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.nom_employe}
              onChange={(e) => setFormData({ ...formData, nom_employe: e.target.value })}
              required
              placeholder="Ex: Oumar Diallo"
              disabled={isCommandeClosed}
              style={{ fontSize: '1rem', padding: '0.875rem', opacity: isCommandeClosed ? 0.6 : 1 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              <strong>Email (optionnel)</strong>
            </label>
            <input
              type="email"
              className="form-input"
              value={formData.email_employe}
              onChange={(e) => setFormData({ ...formData, email_employe: e.target.value })}
              placeholder="votre.email@example.com"
              disabled={isCommandeClosed}
              style={{ fontSize: '1rem', padding: '0.875rem', opacity: isCommandeClosed ? 0.6 : 1 }}
            />
          </div>
        </div>

        {menu.menu_plats && menu.menu_plats.length > 0 ? (
          <div className="card">
            <h2 style={{ color: 'var(--primary-color)', marginTop: 0 }}>🍴 Menu du Jour</h2>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fee', border: '2px solid #dc3545', borderRadius: '6px' }}>
              <p style={{ color: '#dc3545', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1rem' }}>
                ⚠️ Important : Vous ne pouvez commander qu'un seul plat par commande.
              </p>
              <p style={{ color: '#dc3545', margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>
                Si le prix du plat dépasse 30 000 GNF, un supplément sera facturé à la réception.
              </p>
            </div>
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
                                type="button"
                                onClick={() => retirerDuPanier()}
                                className="btn btn-secondary"
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                              >
                                Retirer
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
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
          </div>
        ) : (
          <div className="card">
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Aucun plat disponible pour ce menu.
            </p>
          </div>
        )}

        {panier.length > 0 ? (
          <div className="card panier-card" style={{ position: 'sticky', bottom: '1rem', border: '3px solid var(--primary-color)', boxShadow: '0 8px 24px rgba(54, 96, 146, 0.3)' }}>
            <h2 style={{ color: 'var(--primary-color)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🛒 Votre Commande
            </h2>
            <div className="panier-items">
              {panier.map((item) => {
                const supplement = item.menu_plat.prix_jour > 30000 ? item.menu_plat.prix_jour - 30000 : 0
                return (
                  <div key={item.menu_plat_id} className="panier-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '0.5rem' }}>
                      <span style={{ flex: 1 }}>
                        <strong>{item.menu_plat.plat.nom}</strong>
                      </span>
                      <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {formatGNF(item.menu_plat.prix_jour)}
                      </span>
                    </div>
                    {supplement > 0 && (
                      <div style={{ 
                        padding: '0.75rem', 
                        backgroundColor: '#fff3cd', 
                        border: '2px solid #ffc107',
                        borderRadius: '6px',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                          <strong style={{ color: '#856404' }}>Note importante :</strong>
                        </div>
                        <p style={{ color: '#856404', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                          Ce plat dépasse la prime de 30 000 GNF. 
                          <br />
                          <strong>Un supplément de {formatGNF(supplement)} sera facturé lors de la réception du plat.</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="panier-total" style={{ fontSize: '1.3rem', padding: '1.5rem 0', borderTop: '2px solid var(--primary-color)', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span><strong>Prix du plat :</strong></span>
                <span style={{ color: 'var(--primary-color)' }}>
                  <strong>{formatGNF(calculerTotal())}</strong>
                </span>
              </div>
              {getSupplementFacture() > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed #ccc' }}>
                  <span style={{ fontSize: '0.9rem', color: '#856404' }}>Supplément à payer à la réception :</span>
                  <span style={{ color: '#856404', fontWeight: 'bold' }}>
                    {formatGNF(getSupplementFacture())}
                  </span>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creerCommandeMutation.isLoading || isCommandeClosed}
              style={{ 
                width: '100%', 
                marginTop: '1.5rem', 
                padding: '1.25rem', 
                fontSize: '1.2rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: isCommandeClosed ? 0.5 : 1,
                cursor: isCommandeClosed ? 'not-allowed' : 'pointer'
              }}
              title={isCommandeClosed ? '⏰ Les commandes sont fermées après 11h30' : ''}
            >
              {isCommandeClosed ? '⏰ Commandes fermées après 11h30' : (creerCommandeMutation.isLoading ? '⏳ Envoi en cours...' : '✅ Valider ma Commande')}
            </button>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', border: '2px dashed var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
              👆 Sélectionnez des plats ci-dessus pour commencer votre commande
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

export default CommanderPublic

