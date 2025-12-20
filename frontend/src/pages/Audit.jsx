import { useState } from 'react'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'react-toastify'
import './Audit.css'

const Audit = () => {
  const [filters, setFilters] = useState({
    action: '',
    date_debut: '',
    date_fin: '',
    model_name: '',
  })

  const { data, isLoading, error } = useQuery(
    ['audit-logs', filters],
    async () => {
      const params = new URLSearchParams()
      if (filters.action) params.append('action', filters.action)
      if (filters.date_debut) params.append('timestamp_after', filters.date_debut)
      if (filters.date_fin) params.append('timestamp_before', filters.date_fin)
      if (filters.model_name) params.append('model_name', filters.model_name)
      
      try {
        const response = await axios.get(`/api/audit/?${params.toString()}`)
        return response.data
      } catch (err) {
        console.error('Erreur API Audit:', err)
        throw err
      }
    },
    {
      retry: 1,
      onError: (error) => {
        console.error('Erreur lors du chargement des journaux d\'audit:', error)
      }
    }
  )

  const getActionLabel = (action) => {
    const labels = {
      'create': 'Création',
      'update': 'Modification',
      'delete': 'Suppression',
      'validate': 'Validation',
      'export': 'Export',
      'import': 'Import',
    }
    return labels[action] || action
  }

  const getActionColor = (action) => {
    const colors = {
      'create': 'success',
      'update': 'warning',
      'delete': 'danger',
      'validate': 'info',
      'export': 'secondary',
      'import': 'secondary',
    }
    return colors[action] || 'secondary'
  }

  const exportExcelMutation = useMutation(
    async () => {
      const params = new URLSearchParams()
      if (filters.action) params.append('action', filters.action)
      if (filters.date_debut) params.append('timestamp_after', filters.date_debut)
      if (filters.date_fin) params.append('timestamp_before', filters.date_fin)
      if (filters.model_name) params.append('model_name', filters.model_name)
      
      const response = await axios.get(`/api/audit/export_excel/?${params.toString()}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const filename = `journaux_audit_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    {
      onSuccess: () => {
        toast.success('Export Excel réussi')
      },
      onError: (error) => {
        const message = error.response?.data?.error || error.response?.data?.detail || 'Erreur lors de l\'export Excel'
        toast.error(message)
      },
    }
  )

  const exportPDFMutation = useMutation(
    async () => {
      const params = new URLSearchParams()
      if (filters.action) params.append('action', filters.action)
      if (filters.date_debut) params.append('timestamp_after', filters.date_debut)
      if (filters.date_fin) params.append('timestamp_before', filters.date_fin)
      if (filters.model_name) params.append('model_name', filters.model_name)
      
      const response = await axios.get(`/api/audit/export_pdf/?${params.toString()}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      const filename = `journaux_audit_${format(new Date(), 'yyyy-MM-dd')}.pdf`
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
    {
      onSuccess: () => {
        toast.success('Export PDF réussi')
      },
      onError: (error) => {
        const message = error.response?.data?.error || error.response?.data?.detail || 'Erreur lors de l\'export PDF'
        toast.error(message)
      },
    }
  )

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (error) {
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.message || 
                        error.message || 
                        'Erreur inconnue'
    const statusCode = error.response?.status
    
    return (
      <div className="audit">
        <div className="breadcrumbs">
          <span>Accueil</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Audit et Traçabilité</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Journaux d'Audit</span>
        </div>
        <div className="card" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '1.5rem' }}>
          <h3 style={{ color: '#856404', marginTop: 0 }}>⚠️ Erreur lors du chargement des journaux d'audit</h3>
          <p style={{ color: '#856404', margin: '0.5rem 0' }}>
            <strong>Message:</strong> {errorMessage}
          </p>
          {statusCode && (
            <p style={{ color: '#856404', margin: '0.5rem 0' }}>
              <strong>Code HTTP:</strong> {statusCode}
            </p>
          )}
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <p style={{ color: '#495057', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Solutions possibles:</p>
            <ul style={{ color: '#495057', margin: 0, paddingLeft: '1.5rem' }}>
              <li>Vérifiez que le serveur Django est démarré sur <code>http://localhost:8000</code></li>
              <li>Vérifiez que vous êtes bien authentifié (connectez-vous si nécessaire)</li>
              <li>Vérifiez la console du navigateur (F12) pour plus de détails</li>
              {statusCode === 401 && (
                <li style={{ color: '#dc3545', fontWeight: 'bold' }}>
                  Erreur d'authentification: Reconnectez-vous
                </li>
              )}
              {statusCode === 404 && (
                <li style={{ color: '#dc3545', fontWeight: 'bold' }}>
                  Endpoint non trouvé: Vérifiez que l'API audit est bien configurée
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="audit">
      <div className="breadcrumbs">
        <span>Accueil</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Audit et Traçabilité</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Journaux d'Audit</span>
      </div>

      <div className="page-header">
        <h1>Sélectionnez l'objet Journal d'Audit à afficher</h1>
      </div>

      <div className="card">
        <h2>Filtres</h2>
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Par action</label>
            <select
              className="form-select"
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            >
              <option value="">Tous</option>
              <option value="create">Création</option>
              <option value="update">Modification</option>
              <option value="delete">Suppression</option>
              <option value="validate">Validation</option>
              <option value="export">Export</option>
              <option value="import">Import</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Par timestamp</label>
            <select
              className="form-select"
              value=""
              onChange={(e) => {
                const today = new Date()
                const value = e.target.value
                if (value === 'today') {
                  setFilters({
                    ...filters,
                    date_debut: format(today, 'yyyy-MM-dd'),
                    date_fin: format(today, 'yyyy-MM-dd'),
                  })
                } else if (value === 'week') {
                  const weekAgo = new Date(today)
                  weekAgo.setDate(today.getDate() - 7)
                  setFilters({
                    ...filters,
                    date_debut: format(weekAgo, 'yyyy-MM-dd'),
                    date_fin: format(today, 'yyyy-MM-dd'),
                  })
                } else if (value === 'month') {
                  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
                  setFilters({
                    ...filters,
                    date_debut: format(monthStart, 'yyyy-MM-dd'),
                    date_fin: format(today, 'yyyy-MM-dd'),
                  })
                } else if (value === 'year') {
                  const yearStart = new Date(today.getFullYear(), 0, 1)
                  setFilters({
                    ...filters,
                    date_debut: format(yearStart, 'yyyy-MM-dd'),
                    date_fin: format(today, 'yyyy-MM-dd'),
                  })
                } else {
                  setFilters({ ...filters, date_debut: '', date_fin: '' })
                }
              }}
            >
              <option value="">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
              <option value="month">Ce mois-ci</option>
              <option value="year">Cette année</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Par model name</label>
            <select
              className="form-select"
              value={filters.model_name}
              onChange={(e) => setFilters({ ...filters, model_name: e.target.value })}
            >
              <option value="">Tous</option>
              <option value="Operation">Operation</option>
              <option value="Prevision">Prevision</option>
              <option value="Imputation">Imputation</option>
              <option value="Categorie">Categorie</option>
              <option value="SousCategorie">SousCategorie</option>
            </select>
          </div>

          <div className="form-group">
            <button
              onClick={() => setFilters({ action: '', date_debut: '', date_fin: '', model_name: '' })}
              className="btn btn-secondary"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="audit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>{data?.count || 0} Journaux d'Audit</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => exportPDFMutation.mutate()}
              className="btn btn-secondary"
              disabled={exportPDFMutation.isLoading}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {exportPDFMutation.isLoading ? '⏳ Export en cours...' : '📄 Exporter PDF'}
            </button>
            <button
              onClick={() => exportExcelMutation.mutate()}
              className="btn btn-primary"
              disabled={exportExcelMutation.isLoading}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {exportExcelMutation.isLoading ? '⏳ Export en cours...' : '📊 Exporter Excel'}
            </button>
          </div>
        </div>

        {data && data.results && data.results.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Utilisateur</th>
                <th>Modèle</th>
                <th>Objet</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((log) => (
                <tr key={log.id}>
                  <td>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}</td>
                  <td>
                    <span className={`badge badge-${getActionColor(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td>{log.user || '-'}</td>
                  <td>{log.model_name || '-'}</td>
                  <td>{log.object_repr || '-'}</td>
                  <td>{log.ip_address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            Aucun journal d'audit trouvé.
          </p>
        )}
      </div>
    </div>
  )
}

export default Audit

