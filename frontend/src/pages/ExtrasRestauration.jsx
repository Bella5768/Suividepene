import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { formatGNF } from '../utils/currency'
import './ExtrasRestauration.css'

const ExtrasRestauration = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingExtra, setEditingExtra] = useState(null)
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    type_extra: '',
  })

  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery(
    ['extras-restauration', filters],
    async () => {
      const params = new URLSearchParams()
      if (filters.date_debut) params.append('date_operation_after', filters.date_debut)
      if (filters.date_fin) params.append('date_operation_before', filters.date_fin)
      if (filters.type_extra) params.append('type_extra', filters.type_extra)
      params.append('ordering', '-date_operation')
      
      const response = await axios.get(`/api/restauration/extras/?${params.toString()}`)
      return response.data
    },
    {
      retry: 1,
      onError: (error) => {
        console.error('Erreur lors du chargement des extras:', error)
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => axios.delete(`/api/restauration/extras/${id}/`),
    {
      onSuccess: () => {
        toast.success('Extra supprimé')
        queryClient.invalidateQueries('extras-restauration')
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    }
  )

  const handleEdit = (extra) => {
    setEditingExtra(extra)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingExtra(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet extra ?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="extras-restauration">
      <div className="breadcrumbs">
        <span>Accueil</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Extras Restauration</span>
      </div>

      <div className="page-header">
        <h1>Extras Restauration</h1>
        <p className="page-subtitle">Gestion des opérations pour visiteurs, stagiaires et activités</p>
        <div className="page-actions">
          <button
            type="button"
            onClick={() => {
              setEditingExtra(null)
              setShowForm(true)
            }}
            className="btn btn-primary"
          >
            ➕ Nouvel Extra
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Filtres</h2>
        <div className="filters">
          <div className="form-group">
            <label className="form-label">Date début</label>
            <input
              type="date"
              className="form-input"
              value={filters.date_debut}
              onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date fin</label>
            <input
              type="date"
              className="form-input"
              value={filters.date_fin}
              onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-input"
              value={filters.type_extra}
              onChange={(e) => setFilters({ ...filters, type_extra: e.target.value })}
            >
              <option value="">Tous</option>
              <option value="visiteur">Visiteur</option>
              <option value="stagiaire">Stagiaire</option>
              <option value="activite">Activité</option>
            </select>
          </div>
          <div className="form-group">
            <button
              onClick={() => setFilters({ date_debut: '', date_fin: '', type_extra: '' })}
              className="btn btn-secondary"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Liste des Extras</h2>
        {error ? (
          <div className="alert alert-danger">
            Erreur lors du chargement des extras: {error.message}
          </div>
        ) : data?.results && data.results.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Nom</th>
                <th>Plat</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Montant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((extra) => (
                <tr key={extra.id}>
                  <td>{format(new Date(extra.date_operation), 'dd/MM/yyyy')}</td>
                  <td>
                    <span className={`badge badge-${extra.type_extra === 'visiteur' ? 'info' : extra.type_extra === 'stagiaire' ? 'warning' : 'success'}`}>
                      {extra.type_extra_display}
                    </span>
                  </td>
                  <td>{extra.nom_personne}</td>
                  <td>{extra.plat_nom}</td>
                  <td>{parseFloat(extra.quantite).toFixed(2)}</td>
                  <td>{formatGNF(extra.prix_unitaire)}</td>
                  <td><strong>{formatGNF(extra.montant_total)}</strong></td>
                  <td>
                    <button
                      onClick={() => handleEdit(extra)}
                      className="btn-icon"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(extra.id)}
                      className="btn-icon"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted">Aucun extra trouvé</p>
        )}
      </div>

      {showForm && (
        <ExtraForm
          extra={editingExtra}
          onClose={handleFormClose}
          onSuccess={() => {
            queryClient.invalidateQueries('extras-restauration')
            handleFormClose()
          }}
        />
      )}
    </div>
  )
}

const ExtraForm = ({ extra, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type_extra: extra?.type_extra || 'visiteur',
    nom_personne: extra?.nom_personne || '',
    date_operation: extra?.date_operation || format(new Date(), 'yyyy-MM-dd'),
    plat_nom: extra?.plat_nom || '',
    quantite: extra?.quantite || '1',
    prix_unitaire: extra?.prix_unitaire || '',
    description: extra?.description || '',
  })

  const createMutation = useMutation(
    (data) => axios.post('/api/restauration/extras/', data),
    {
      onSuccess: () => {
        toast.success('Extra créé avec succès')
        onSuccess()
      },
      onError: (error) => {
        console.error('Erreur lors de la création:', error)
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.message || 
                            (error.response?.data && typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : null) ||
                            error.message || 
                            'Erreur lors de la création'
        toast.error(errorMessage)
      },
    }
  )

  const updateMutation = useMutation(
    (data) => axios.put(`/api/restauration/extras/${extra.id}/`, data),
    {
      onSuccess: () => {
        toast.success('Extra modifié avec succès')
        onSuccess()
      },
      onError: (error) => {
        toast.error(error.response?.data?.detail || 'Erreur lors de la modification')
      },
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = {
      ...formData,
      quantite: parseFloat(formData.quantite),
      prix_unitaire: parseFloat(formData.prix_unitaire),
    }
    
    if (extra) {
      updateMutation.mutate(data)
    } else {
      createMutation.mutate(data)
    }
  }

  const calculateTotal = () => {
    const qty = parseFloat(formData.quantite) || 0
    const prix = parseFloat(formData.prix_unitaire) || 0
    return qty * prix
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{extra ? 'Modifier Extra' : 'Nouvel Extra'}</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select
              className="form-input"
              value={formData.type_extra}
              onChange={(e) => setFormData({ ...formData, type_extra: e.target.value })}
              required
            >
              <option value="visiteur">Visiteur</option>
              <option value="stagiaire">Stagiaire</option>
              <option value="activite">Activité</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nom de la personne / Activité *</label>
            <input
              type="text"
              className="form-input"
              value={formData.nom_personne}
              onChange={(e) => setFormData({ ...formData, nom_personne: e.target.value })}
              required
              placeholder="Ex: Jean Dupont, Formation Python, etc."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input
              type="date"
              className="form-input"
              value={formData.date_operation}
              onChange={(e) => setFormData({ ...formData, date_operation: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nom du plat *</label>
            <input
              type="text"
              className="form-input"
              value={formData.plat_nom}
              onChange={(e) => setFormData({ ...formData, plat_nom: e.target.value })}
              required
              placeholder="Ex: Riz au gras, Poulet Yassa, etc."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantité *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                value={formData.quantite}
                onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Prix unitaire (GNF) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                value={formData.prix_unitaire}
                onChange={(e) => setFormData({ ...formData, prix_unitaire: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Montant total</label>
            <div className="form-input" style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
              {formatGNF(calculateTotal())}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Informations supplémentaires..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading ? 'Enregistrement...' : extra ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExtrasRestauration

