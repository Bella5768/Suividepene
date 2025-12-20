import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { formatGNF } from '../utils/currency'
import OperationForm from '../components/OperationForm'
import './Operations.css'

const Operations = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingOperation, setEditingOperation] = useState(null)
  const [filters, setFilters] = useState({
    date_debut: '',
    date_fin: '',
    categorie: '',
  })
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery(
    ['operations', filters],
    async () => {
      const params = new URLSearchParams()
      if (filters.date_debut) params.append('date_operation_after', filters.date_debut)
      if (filters.date_fin) params.append('date_operation_before', filters.date_fin)
      if (filters.categorie) params.append('categorie', filters.categorie)
      
      const response = await axios.get(`/api/operations/?${params.toString()}`)
      return response.data
    },
    {
      retry: 1,
      onError: (error) => {
        console.error('Erreur lors du chargement des opérations:', error)
      }
    }
  )

  const deleteMutation = useMutation(
    (id) => axios.delete(`/api/operations/${id}/`),
    {
      onSuccess: () => {
        toast.success('Opération supprimée')
        queryClient.invalidateQueries('operations')
      },
      onError: () => toast.error('Erreur lors de la suppression'),
    }
  )

  const exportExcelMutation = useMutation(
    async () => {
      const params = new URLSearchParams()
      if (filters.date_debut) params.append('date_debut', filters.date_debut)
      if (filters.date_fin) params.append('date_fin', filters.date_fin)
      if (filters.categorie) params.append('categorie', filters.categorie)
      
      const response = await axios.get(`/api/operations/export_excel/?${params.toString()}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `operations_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
    {
      onSuccess: () => toast.success('Export Excel réussi'),
      onError: (error) => {
        const message = error.response?.data?.error || error.response?.data?.detail || 'Erreur lors de l\'export (vérifiez l\'authentification et le serveur backend).'
        toast.error(message)
      },
    }
  )

  const exportPdfMutation = useMutation(
    async () => {
      const params = new URLSearchParams()
      if (filters.date_debut) params.append('date_debut', filters.date_debut)
      if (filters.date_fin) params.append('date_fin', filters.date_fin)
      if (filters.categorie) params.append('categorie', filters.categorie)
      
      const response = await axios.get(`/api/operations/export_pdf/?${params.toString()}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `operations_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    },
    {
      onSuccess: () => toast.success('Export PDF réussi'),
      onError: (error) => {
        const message = error.response?.data?.error || error.response?.data?.detail || 'Erreur lors de l\'export PDF (vérifiez l\'authentification et le serveur backend).'
        toast.error(message)
      },
    }
  )

  const handleEdit = (operation) => {
    setEditingOperation(operation)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingOperation(null)
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
      <div className="operations">
        <div className="page-header">
          <h1>Opérations</h1>
        </div>
        <div className="card" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '1.5rem' }}>
          <h3 style={{ color: '#856404', marginTop: 0 }}>⚠️ Erreur lors du chargement des opérations</h3>
          <p style={{ color: '#856404', margin: '0.5rem 0' }}>
            <strong>Message:</strong> {error.response?.data?.detail || error.message || 'Erreur inconnue'}
          </p>
          {error.response?.status && (
            <p style={{ color: '#856404', margin: '0.5rem 0' }}>
              <strong>Code HTTP:</strong> {error.response.status}
            </p>
          )}
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p style={{ color: '#495057', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Solutions possibles:</p>
            <ul style={{ color: '#495057', margin: 0, paddingLeft: '1.5rem' }}>
              <li>Vérifiez que le serveur Django est démarré sur <code>http://localhost:8000</code></li>
              <li>Vérifiez que vous êtes bien authentifié (connectez-vous si nécessaire)</li>
              <li>Vérifiez la console du navigateur (F12) pour plus de détails</li>
              {error.response?.status === 401 && (
                <li style={{ color: '#dc3545', fontWeight: 'bold' }}>
                  Erreur d'authentification: Reconnectez-vous
                </li>
              )}
            </ul>
          </div>
          <button
            onClick={() => refetch()}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="operations">
      <div className="page-header">
        <h1>Opérations</h1>
        <div className="page-actions">
          <button
            type="button"
            onClick={() => exportExcelMutation.mutate()}
            className="btn btn-secondary"
            disabled={exportExcelMutation.isLoading}
          >
            {exportExcelMutation.isLoading ? 'Export en cours...' : '📊 Exporter Excel'}
          </button>
          <button
            type="button"
            onClick={() => exportPdfMutation.mutate()}
            className="btn btn-secondary"
            disabled={exportPdfMutation.isLoading}
            style={{ marginLeft: '0.5rem' }}
          >
            {exportPdfMutation.isLoading ? 'Export en cours...' : '📄 Exporter PDF'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingOperation(null)
              setShowForm(true)
            }}
            className="btn btn-primary"
          >
            ➕ Nouvelle Opération
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
            <button
              onClick={() => setFilters({ date_debut: '', date_fin: '', categorie: '' })}
              className="btn btn-secondary"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Liste des Opérations</h2>
        {data?.results && data.results.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Catégorie</th>
                <th>Sous-Catégorie</th>
                <th>Unités</th>
                <th>Prix Unitaire</th>
                <th>Montant</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((op) => (
                <tr key={op.id}>
                  <td>{op.date_operation}</td>
                  <td>{op.categorie_code} - {op.categorie_nom}</td>
                  <td>{op.sous_categorie_nom || '-'}</td>
                  <td>{parseFloat(op.unites).toFixed(2)}</td>
                  <td>{formatGNF(op.prix_unitaire)}</td>
                  <td><strong>{formatGNF(op.montant_depense)}</strong></td>
                  <td>{op.description || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(op)}
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Supprimer cette opération ?')) {
                          deleteMutation.mutate(op.id)
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
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Aucune opération trouvée.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Cliquez sur "Nouvelle Opération" pour créer votre première opération.
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <OperationForm
          operation={editingOperation}
          onClose={handleFormClose}
          onSuccess={() => {
            handleFormClose()
            refetch()
          }}
        />
      )}
    </div>
  )
}

export default Operations


