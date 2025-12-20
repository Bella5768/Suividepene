import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatGNF } from '../utils/currency'
import './Dashboard.css'

const Dashboard = () => {
  const currentMonth = format(new Date(), 'yyyy-MM')
  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())

  const { data: rapport, isLoading, error: rapportError } = useQuery(
    ['rapport', currentMonth],
    async () => {
      const response = await axios.get(`/api/rapports/mensuel/?mois=${currentMonth}`)
      return response.data
    },
    { 
      enabled: !!currentMonth,
      retry: 1,
      onError: (error) => {
        console.error('Erreur lors du chargement du rapport:', error)
      }
    }
  )

  const { data: operations, error: operationsError } = useQuery(
    ['operations-recentes'],
    async () => {
      const response = await axios.get('/api/operations/?ordering=-date_operation&page_size=5')
      return response.data
    },
    {
      retry: 1,
      onError: (error) => {
        console.error('Erreur lors du chargement des opérations:', error)
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

  // Calculer le nombre total de jours du mois en cours
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }
  
  // Données par défaut si pas de rapport
  const defaultRapport = {
    total_depenses: 0,
    total_prevu: 0,
    ecart_global: 0,
    moyenne_journaliere: 0,
    nombre_operations: 0,
    nombre_jours: getDaysInMonth(new Date()),
    categories: []
  }

  const displayRapport = rapport || defaultRapport

  return (
    <div className="dashboard">
      <div className="breadcrumbs">
        <span>Accueil</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Tableau de bord</span>
      </div>
      <div className="dashboard-header">
        <h1>Tableau de bord</h1>
        <p className="page-subtitle">
          {format(monthStart, 'MMMM yyyy', { locale: fr })}
        </p>
      </div>

      {rapportError && (
        <div className="card" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#856404', marginTop: 0, marginBottom: '0.5rem' }}>
            ⚠️ Erreur lors du chargement du rapport
          </h3>
          <p style={{ color: '#856404', margin: '0.5rem 0' }}>
            <strong>Code HTTP:</strong> {rapportError.response?.status || 'N/A'}
          </p>
          {rapportError.response?.status === 401 ? (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: '#dc3545', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                🔐 Erreur d'authentification
              </p>
              <p style={{ color: '#856404', margin: '0.5rem 0' }}>
                Vous devez vous connecter pour accéder aux données.
              </p>
              <Link 
                to="/login" 
                style={{ 
                  display: 'inline-block', 
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#366092',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: '600'
                }}
              >
                Se connecter
              </Link>
            </div>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: '#856404', margin: '0.5rem 0' }}>
                <strong>Message:</strong> {rapportError.response?.data?.detail || rapportError.message || 'Erreur inconnue'}
              </p>
              <p style={{ color: '#856404', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                Vérifiez que le serveur backend Django est démarré sur http://localhost:8000
              </p>
            </div>
          )}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Dépenses</div>
          <div className="stat-value">{formatGNF(displayRapport.total_depenses || 0)}</div>
        </div>
        <div className="stat-card stat-card-prevision">
          <div className="stat-label">Total Prévu</div>
          <div className="stat-value">{formatGNF(displayRapport.total_prevu || 0)}</div>
          {displayRapport.total_prevu > 0 && (
            <div className="stat-details">
              <div className="stat-detail-item">
                <span className="stat-detail-label">Utilisé:</span>
                <span className="stat-detail-value">
                  {((displayRapport.total_depenses || 0) / displayRapport.total_prevu * 100).toFixed(1)}%
                </span>
              </div>
              <div className="stat-detail-item">
                <span className="stat-detail-label">Restant:</span>
                <span className={`stat-detail-value ${(displayRapport.total_prevu - (displayRapport.total_depenses || 0)) < 0 ? 'negative' : ''}`}>
                  {formatGNF(displayRapport.total_prevu - (displayRapport.total_depenses || 0))}
                </span>
              </div>
            </div>
          )}
          <Link 
            to="/previsions" 
            className="stat-link"
            style={{ 
              display: 'block', 
              marginTop: '0.75rem', 
              fontSize: '0.75rem', 
              color: '#16a34a',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Voir les prévisions →
          </Link>
        </div>
        <div className="stat-card">
          <div className="stat-label">Écart Global</div>
          <div className={`stat-value ${(displayRapport.ecart_global || 0) < 0 ? 'negative' : 'positive'}`}>
            {formatGNF(displayRapport.ecart_global || 0)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Moyenne Journalière</div>
          <div className="stat-value">{formatGNF(displayRapport.moyenne_journaliere || 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Nombre d'Opérations</div>
          <div className="stat-value">{displayRapport.nombre_operations || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Nombre de Jours</div>
          <div className="stat-value">{displayRapport.nombre_jours || getDaysInMonth(new Date())}</div>
        </div>
      </div>

      {/* Carte spéciale pour les Extras Restauration */}
      <div className="card" style={{ 
        marginTop: '1.5rem', 
        border: '2px solid #28a745',
        backgroundColor: '#f8fff9'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: '0 0 0.5rem 0', color: '#28a745' }}>
              🍽️ Extras Restauration
            </h2>
            <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
              Gérer les opérations de restauration pour les visiteurs, stagiaires et activités
            </p>
            <p style={{ margin: '0.5rem 0 0 0', color: '#495057', fontSize: '0.85rem' }}>
              <strong>Note:</strong> Tous les montants sont automatiquement enregistrés dans la catégorie RESTAURATION
            </p>
          </div>
          <Link 
            to="/restauration/extras" 
            className="btn btn-success"
            style={{ 
              backgroundColor: '#28a745',
              borderColor: '#28a745',
              color: 'white',
              padding: '0.75rem 1.5rem',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              whiteSpace: 'nowrap'
            }}
          >
            ➕ Gérer les Extras
          </Link>
        </div>
      </div>

      {displayRapport.categories && displayRapport.categories.length > 0 ? (
        <div className="card">
          <h2>Résumé par Catégorie</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Total Dépensé</th>
                <th>Montant Prévu</th>
                <th>Écart</th>
                <th>Opérations</th>
              </tr>
            </thead>
            <tbody>
              {displayRapport.categories.map((cat) => (
                <tr key={cat.categorie_code}>
                  <td>{cat.categorie_code} - {cat.categorie_nom}</td>
                  <td>{formatGNF(cat.total_depense)}</td>
                  <td>{formatGNF(cat.montant_prevu)}</td>
                  <td className={cat.ecart < 0 ? 'negative' : 'positive'}>
                    {formatGNF(cat.ecart)}
                  </td>
                  <td>{cat.nombre_operations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <h2>Résumé par Catégorie</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            Aucune donnée disponible pour ce mois. 
            <br />
            <Link to="/operations" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
              Commencez par créer des opérations
            </Link> ou 
            <Link to="/previsions" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
              définir des prévisions
            </Link>.
          </p>
        </div>
      )}

      {operationsError ? (
        <div className="card">
          <h2>Opérations Récentes</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            Erreur lors du chargement des opérations.
          </p>
        </div>
      ) : operations && operations.results && operations.results.length > 0 ? (
        <div className="card">
          <h2>Opérations Récentes</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Catégorie</th>
                <th>Montant</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {operations.results.map((op) => (
                <tr key={op.id}>
                  <td>{op.date_operation}</td>
                  <td>{op.categorie_code}</td>
                  <td>{formatGNF(op.montant_depense)}</td>
                  <td>{op.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <h2>Opérations Récentes</h2>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
            Aucune opération enregistrée. 
            <br />
            <Link to="/operations" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
              Créer une nouvelle opération
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

export default Dashboard


