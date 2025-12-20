import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { formatGNF } from '../utils/currency'
import PrevisionForm from '../components/PrevisionForm'
import './Previsions.css'

const Previsions = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingPrevision, setEditingPrevision] = useState(null)
  const [filters, setFilters] = useState({
    mois: format(new Date(), 'yyyy-MM'),
    statut: '',
  })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    ['previsions', filters],
    async () => {
      const params = new URLSearchParams()
      if (filters.mois) {
        const moisDate = new Date(filters.mois + '-01')
        params.append('mois', format(moisDate, 'yyyy-MM-dd'))
      }
      if (filters.statut) params.append('statut', filters.statut)
      
      const response = await axios.get(`/api/previsions/?${params.toString()}`)
      return response.data
    }
  )

  const { data: categories } = useQuery('categories', async () => {
    const response = await axios.get('/api/categories/')
    return response.data
  })

  const deleteMutation = useMutation(
    (id) => axios.delete(`/api/previsions/${id}/`),
    {
      onSuccess: () => {
        toast.success('Prévision supprimée')
        queryClient.invalidateQueries('previsions')
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    }
  )

  return (
    <div className="previsions">
      <div className="page-header">
        <h1>Prévisions</h1>
        <div className="page-actions">
          <button
            type="button"
            onClick={() => {
              setEditingPrevision(null)
              setShowForm(true)
            }}
            className="btn btn-primary"
          >
            ➕ Nouvelle Prévision
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Filtres</h2>
        <div className="filters">
          <div className="form-group">
            <label className="form-label">Mois</label>
            <input
              type="month"
              className="form-input"
              value={filters.mois}
              onChange={(e) => setFilters({ ...filters, mois: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Statut</label>
            <select
              className="form-select"
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            >
              <option value="">Tous</option>
              <option value="draft">Brouillon</option>
              <option value="validated">Validée</option>
              <option value="closed">Clôturée</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="card">
          <h2>Liste des Prévisions</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Mois</th>
                <th>Catégorie</th>
                <th>Sous-Catégorie</th>
                <th>Montant Prévu</th>
                <th>Montant Imputé</th>
                <th>Solde Restant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.results?.map((prev) => (
                <tr key={prev.id}>
                  <td>{format(new Date(prev.mois), 'MM/yyyy')}</td>
                  <td>{prev.categorie_code} - {prev.categorie_nom}</td>
                  <td>{prev.sous_categorie_nom || '-'}</td>
                  <td>{formatGNF(prev.montant_prevu)}</td>
                  <td>{formatGNF(prev.montant_impute)}</td>
                  <td className={prev.solde_restant < 0 ? 'negative' : ''}>
                    {formatGNF(prev.solde_restant)}
                  </td>
                  <td>
                    <span className={`badge badge-${prev.statut === 'validated' ? 'success' : prev.statut === 'closed' ? 'warning' : 'secondary'}`}>
                      {prev.statut === 'validated' ? 'Validée' : prev.statut === 'closed' ? 'Clôturée' : 'Brouillon'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        if (window.confirm('Supprimer cette prévision ?')) {
                          deleteMutation.mutate(prev.id)
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
      )}

      {showForm && (
        <PrevisionForm
          prevision={editingPrevision}
          onClose={() => {
            setShowForm(false)
            setEditingPrevision(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingPrevision(null)
            queryClient.invalidateQueries('previsions')
          }}
        />
      )}
    </div>
  )
}

export default Previsions


