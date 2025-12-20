import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import { formatGNF } from '../utils/currency'
import './RestaurationPlats.css'

const RestaurationPlats = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingPlat, setEditingPlat] = useState(null)
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    categorie_restau: 'Dejeuner',
    prix_standard: '',
    actif: true,
  })
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery(
    'plats',
    async () => {
      const response = await axios.get('/api/restauration/plats/')
      return response.data
    },
    {
      retry: 1,
      onError: (err) => {
        console.error('Erreur lors du chargement des plats:', err)
        toast.error(`Erreur: ${err.response?.status} - ${err.response?.data?.detail || err.message}`)
      }
    }
  )

  const saveMutation = useMutation(
    (data) => {
      if (editingPlat) {
        return axios.put(`/api/restauration/plats/${editingPlat.id}/`, data)
      }
      return axios.post('/api/restauration/plats/', data)
    },
    {
      onSuccess: () => {
        toast.success(editingPlat ? 'Plat modifié' : 'Plat créé')
        queryClient.invalidateQueries('plats')
        handleFormClose()
      },
      onError: (error) => {
        const message = error.response?.data?.detail || 'Erreur lors de la sauvegarde'
        toast.error(message)
      },
    }
  )

  const deleteMutation = useMutation(
    (id) => axios.delete(`/api/restauration/plats/${id}/`),
    {
      onSuccess: () => {
        toast.success('Plat supprimé')
        queryClient.invalidateQueries('plats')
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    }
  )

  const handleEdit = (plat) => {
    setEditingPlat(plat)
    setFormData({
      nom: plat.nom,
      description: plat.description || '',
      categorie_restau: plat.categorie_restau,
      prix_standard: plat.prix_standard,
      actif: plat.actif,
    })
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingPlat(null)
    setFormData({
      nom: '',
      description: '',
      categorie_restau: 'Dejeuner',
      prix_standard: '',
      actif: true,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="restauration-plats">
        <div className="page-header">
          <h1>Gestion des Plats</h1>
        </div>
        <div className="card" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '1.5rem' }}>
          <p style={{ color: '#856404', margin: 0 }}>
            ⚠️ Erreur lors du chargement des plats. Vérifiez que le serveur backend est démarré.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="restauration-plats">
      <div className="breadcrumbs">
        <span>Accueil</span>
        <span className="breadcrumb-separator">›</span>
        <span>Restauration</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Gestion des Plats</span>
      </div>
      
      <div className="page-header">
        <h1>Gestion des Plats</h1>
        <button
          type="button"
          onClick={() => {
            setEditingPlat(null)
            setShowForm(true)
          }}
          className="btn btn-primary"
        >
          ➕ Nouveau Plat
        </button>
      </div>

      {data?.results && data.results.length > 0 ? (
        <div className="card">
          <h2>Liste des Plats</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Prix Standard</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((plat) => (
                <tr key={plat.id}>
                  <td><strong>{plat.nom}</strong></td>
                  <td>{plat.categorie_restau_display}</td>
                  <td>{formatGNF(plat.prix_standard)}</td>
                  <td>
                    <span className={`badge ${plat.actif ? 'badge-success' : 'badge-secondary'}`}>
                      {plat.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(plat)}
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Supprimer ce plat ?')) {
                          deleteMutation.mutate(plat.id)
                        }
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Aucun plat enregistré.
            <br />
            <button
              onClick={() => {
                setEditingPlat(null)
                setShowForm(true)
              }}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Créer le premier plat
            </button>
          </p>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlat ? 'Modifier' : 'Nouveau'} Plat</h2>
              <button onClick={handleFormClose} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom du plat *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Catégorie *</label>
                <select
                  className="form-select"
                  value={formData.categorie_restau}
                  onChange={(e) => setFormData({ ...formData, categorie_restau: e.target.value })}
                  required
                >
                  <option value="PetitDej">Petit-déjeuner</option>
                  <option value="Dejeuner">Déjeuner</option>
                  <option value="Diner">Dîner</option>
                  <option value="Snack">Collation</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prix Standard (GNF) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  value={formData.prix_standard}
                  onChange={(e) => setFormData({ ...formData, prix_standard: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <input
                    type="checkbox"
                    checked={formData.actif}
                    onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                  />
                  {' '}Actif
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleFormClose} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saveMutation.isLoading}>
                  {saveMutation.isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurationPlats


