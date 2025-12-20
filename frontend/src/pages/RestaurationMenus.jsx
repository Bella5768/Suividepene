import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatGNF } from '../utils/currency'
import './RestaurationMenus.css'

const RestaurationMenus = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showAddPlatModal, setShowAddPlatModal] = useState(false)
  const [formData, setFormData] = useState({
    plat_id: '',
    prix_jour: '',
    stock_max: '',
    ordre: 0,
  })
  const queryClient = useQueryClient()

  const { data: menus, isLoading, refetch } = useQuery(
    ['menus', selectedDate],
    async () => {
      try {
        const response = await axios.get(`/api/restauration/menus/?date_menu=${selectedDate}`)
        const data = response.data
        // Gérer les deux formats possibles (liste ou pagination)
        if (data.results) {
          return data.results
        }
        if (Array.isArray(data)) {
          return data
        }
        return []
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 400) {
          return []
        }
        throw error
      }
    },
    {
      retry: 1,
    }
  )

  const { data: plats } = useQuery(
    'plats',
    async () => {
      const response = await axios.get('/api/restauration/plats/?actif=true')
      return response.data
    }
  )

  const publierMutation = useMutation(
    (menuId) => axios.post(`/api/restauration/menus/${menuId}/publier/`),
    {
      onSuccess: () => {
        toast.success('Menu publié')
        queryClient.invalidateQueries('menus')
      },
      onError: () => toast.error('Erreur lors de la publication'),
    }
  )

  const creerMenuMutation = useMutation(
    (date_menu) => axios.post('/api/restauration/menus/', { date_menu }),
    {
      onSuccess: () => {
        toast.success('Menu créé')
        refetch()
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Erreur lors de la création')
      },
    }
  )

  const ajouterPlatMutation = useMutation(
    ({ menuId, platId, prix_jour, stock_max, ordre }) =>
      axios.post(`/api/restauration/menus/${menuId}/ajouter_plat/`, {
        plat_id: platId,
        prix_jour,
        stock_max: stock_max || null,
        ordre,
      }),
    {
      onSuccess: () => {
        toast.success('Plat ajouté au menu')
        queryClient.invalidateQueries('menus')
        setShowAddPlatModal(false)
        setFormData({ plat_id: '', prix_jour: '', stock_max: '', ordre: 0 })
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout')
      },
    }
  )

  const retirerPlatMutation = useMutation(
    ({ menuId, menuPlatId }) =>
      axios.delete(`/api/restauration/menus/${menuId}/retirer_plat/`, {
        data: { menu_plat_id: menuPlatId },
      }),
    {
      onSuccess: () => {
        toast.success('Plat retiré du menu')
        queryClient.invalidateQueries('menus')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression')
      },
    }
  )

  const handleCreerMenu = () => {
    creerMenuMutation.mutate(selectedDate)
  }

  const handleAjouterPlat = (e) => {
    e.preventDefault()
    if (!menu) {
      toast.error('Créez d\'abord un menu pour cette date')
      return
    }
    ajouterPlatMutation.mutate({
      menuId: menu.id,
      platId: formData.plat_id,
      prix_jour: parseFloat(formData.prix_jour),
      stock_max: formData.stock_max ? parseInt(formData.stock_max) : null,
      ordre: parseInt(formData.ordre) || 0,
    })
  }

  const handleRetirerPlat = (menuPlatId) => {
    if (!menu) return
    if (window.confirm('Êtes-vous sûr de vouloir retirer ce plat du menu ?')) {
      retirerPlatMutation.mutate({
        menuId: menu.id,
        menuPlatId: menuPlatId,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  const menu = Array.isArray(menus) ? menus[0] : menus?.results?.[0] || menus?.[0]

  return (
    <div className="restauration-menus">
      <div className="breadcrumbs">
        <span>Accueil</span>
        <span className="breadcrumb-separator">›</span>
        <span>Restauration</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Gestion des Menus</span>
      </div>
      
      <div className="page-header">
        <h1>Gestion des Menus</h1>
        <div className="page-actions">
          <input
            type="date"
            className="form-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: 'auto', marginRight: '1rem' }}
          />
          {!menu && (
            <button
              onClick={handleCreerMenu}
              className="btn btn-primary"
              disabled={creerMenuMutation.isLoading}
            >
              {creerMenuMutation.isLoading ? 'Création...' : '➕ Créer le Menu'}
            </button>
          )}
          {menu && (
            <>
              <button
                onClick={() => setShowAddPlatModal(true)}
                className="btn btn-secondary"
                style={{ marginRight: '0.5rem' }}
              >
                ➕ Ajouter un Plat
              </button>
              {!menu.est_publie && (
                <button
                  onClick={() => publierMutation.mutate(menu.id)}
                  className="btn btn-primary"
                  disabled={publierMutation.isLoading}
                >
                  {publierMutation.isLoading ? 'Publication...' : '📢 Publier le Menu'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {menu ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>Menu du {format(new Date(menu.date_menu), 'dd MMMM yyyy', { locale: fr })}</h2>
            {menu.est_publie ? (
              <div className="badge badge-success">
                ✓ Menu publié
              </div>
            ) : (
              <div className="badge badge-warning">
                ⏳ Menu non publié
              </div>
            )}
          </div>
          {menu.est_publie && (
            <div style={{ marginBottom: '1.5rem' }}>
              {/* Lien fixe unique pour tous les travailleurs */}
              <div className="card" style={{ backgroundColor: '#e7f3ff', border: '2px solid #366092', padding: '1rem', marginTop: '1rem' }}>
                <h3 style={{ marginTop: 0, color: '#366092' }}>🔗 Lien Unique de Commande</h3>
                <p style={{ margin: '0.5rem 0', color: '#333' }}>
                  <strong>Lien fixe à partager avec tous les travailleurs :</strong> Ce lien affichera automatiquement le menu du jour lorsqu'il est publié.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/commander/aujourdhui`}
                    className="form-input"
                    style={{ flex: 1, minWidth: '300px', backgroundColor: 'white', cursor: 'text', fontWeight: 'bold' }}
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/commander/aujourdhui`)
                      toast.success('Lien copié dans le presse-papier !')
                    }}
                    className="btn btn-primary"
                  >
                    📋 Copier
                  </button>
                  <a
                    href="/commander/aujourdhui"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ textDecoration: 'none' }}
                  >
                    🔗 Ouvrir le lien
                  </a>
                </div>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
                  💡 <strong>Avantage :</strong> Les travailleurs n'ont qu'un seul lien à retenir. Il affiche automatiquement le menu du jour lorsqu'il est publié.
                </p>
              </div>
            </div>
          )}
          
          {menu.menu_plats && menu.menu_plats.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Plat</th>
                  <th>Catégorie</th>
                  <th>Prix du Jour</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menu.menu_plats.map((mp) => (
                  <tr key={mp.id}>
                    <td><strong>{mp.plat.nom}</strong></td>
                    <td>{mp.plat.categorie_restau_display}</td>
                    <td>{formatGNF(mp.prix_jour)}</td>
                    <td>
                      {mp.stock_max !== null ? (
                        <span>{mp.stock_restant !== null ? mp.stock_restant : mp.stock_max} / {mp.stock_max}</span>
                      ) : (
                        <span className="badge badge-secondary">Illimité</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={() => handleRetirerPlat(mp.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          disabled={retirerPlatMutation.isLoading}
                          title="Retirer ce plat du menu"
                        >
                          🗑️ Retirer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Aucun plat dans ce menu.
            </p>
          )}
        </div>
      ) : (
        <div className="card">
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Aucun menu pour cette date.
            <br />
            <button
              onClick={handleCreerMenu}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
              disabled={creerMenuMutation.isLoading}
            >
              {creerMenuMutation.isLoading ? 'Création...' : 'Créer le Menu'}
            </button>
          </p>
        </div>
      )}

      {showAddPlatModal && menu && (
        <div className="modal-overlay" onClick={() => setShowAddPlatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un Plat au Menu</h2>
              <button onClick={() => setShowAddPlatModal(false)} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleAjouterPlat}>
              <div className="form-group">
                <label className="form-label">Plat *</label>
                <select
                  className="form-select"
                  value={formData.plat_id}
                  onChange={(e) => {
                    const plat = plats?.results?.find(p => p.id === parseInt(e.target.value)) || plats?.find(p => p.id === parseInt(e.target.value))
                    setFormData({
                      ...formData,
                      plat_id: e.target.value,
                      prix_jour: plat ? plat.prix_standard : '',
                    })
                  }}
                  required
                >
                  <option value="">Sélectionner un plat</option>
                  {(plats?.results || plats || [])
                    .filter((plat) => {
                      // Exclure les plats déjà dans le menu
                      if (!menu || !menu.menu_plats) return true
                      return !menu.menu_plats.some(mp => mp.plat.id === plat.id)
                    })
                    .map((plat) => (
                      <option key={plat.id} value={plat.id}>
                        {plat.nom} ({plat.categorie_restau_display}) - {formatGNF(plat.prix_standard)}
                      </option>
                    ))}
                </select>
                {menu && menu.menu_plats && menu.menu_plats.length > 0 && (
                  <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                    💡 Les plats déjà dans le menu ne sont pas affichés dans cette liste.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Prix du Jour (GNF) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  value={formData.prix_jour}
                  onChange={(e) => setFormData({ ...formData, prix_jour: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock Maximum (optionnel)</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={formData.stock_max}
                  onChange={(e) => setFormData({ ...formData, stock_max: e.target.value })}
                  placeholder="Laisser vide pour illimité"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ordre d'affichage</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.ordre}
                  onChange={(e) => setFormData({ ...formData, ordre: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddPlatModal(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={ajouterPlatMutation.isLoading}
                >
                  {ajouterPlatMutation.isLoading ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurationMenus

