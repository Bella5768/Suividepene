import { useQuery } from 'react-query'
import axios from 'axios'
import { formatGNF } from '../utils/currency'
import './Imputations.css'

const Imputations = () => {
  const { data, isLoading, error } = useQuery(
    'imputations',
    async () => {
      const response = await axios.get('/api/imputations/')
      return response.data
    },
    {
      retry: 1,
      onError: (error) => {
        console.error('Erreur lors du chargement des imputations:', error)
      }
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
    return (
      <div className="imputations">
        <h1>Imputations</h1>
        <div className="card" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '1.5rem' }}>
          <h3 style={{ color: '#856404', marginTop: 0 }}>⚠️ Erreur lors du chargement des imputations</h3>
          <p style={{ color: '#856404', margin: '0.5rem 0' }}>
            <strong>Message:</strong> {error.response?.data?.detail || error.message || 'Erreur inconnue'}
          </p>
          {error.response?.status === 401 && (
            <p style={{ color: '#dc3545', fontWeight: 'bold', marginTop: '1rem' }}>
              Erreur d'authentification: Reconnectez-vous
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="imputations">
      <h1>Imputations</h1>
      <div className="card">
        <h2>Liste des Imputations</h2>
        {data?.results && data.results.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Opération</th>
                <th>Date Opération</th>
                <th>Prévision</th>
                <th>Mois Prévision</th>
                <th>Montant Imputé</th>
                <th>Créé le</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((imp) => (
                <tr key={imp.id}>
                  <td>#{imp.operation}</td>
                  <td>{imp.operation_date}</td>
                  <td>{imp.prevision_categorie}</td>
                  <td>{imp.prevision_mois}</td>
                  <td>{formatGNF(imp.montant_impute)}</td>
                  <td>{new Date(imp.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Aucune imputation trouvée.</p>
            <div style={{ backgroundColor: '#e7f3ff', padding: '1rem', borderRadius: '4px', marginTop: '1rem' }}>
              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                <strong>💡 Comment créer des imputations ?</strong>
              </p>
              <ol style={{ textAlign: 'left', display: 'inline-block', margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  Créez d'abord une <strong>prévision</strong> pour le mois et la catégorie souhaités
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  Ensuite, créez une <strong>opération</strong> avec la même catégorie et le même mois
                </li>
                <li>
                  L'<strong>imputation</strong> sera créée automatiquement entre l'opération et la prévision
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Imputations


