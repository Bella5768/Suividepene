import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { formatGNF } from '../utils/currency'
import { toast } from 'react-toastify'
import './TableauBordCantine.css'

const TableauBordCantine = () => {
  const [dateFiltre, setDateFiltre] = useState(format(new Date(), 'yyyy-MM-dd'))
  const queryClient = useQueryClient()

  const { data: commandes, isLoading } = useQuery(
    ['commandes-cantine', dateFiltre],
    async () => {
      const response = await axios.get(`/api/restauration/commandes/?date_commande=${dateFiltre}`)
      return response.data
    },
    {
      retry: 1,
    }
  )

  const { data: facture } = useQuery(
    ['facture', dateFiltre],
    async () => {
      try {
        const response = await axios.get(`/api/restauration/factures/${dateFiltre}/`)
        return response.data
      } catch (error) {
        if (error.response?.status === 404) {
          return null
        }
        throw error
      }
    },
    {
      retry: 1,
    }
  )

  const genererFactureMutation = useMutation(
    (date) => axios.post(`/api/restauration/factures/${date}/`),
    {
      onSuccess: (data) => {
        toast.success(`Facture ${data.data.numero_facture} générée avec succès`)
        queryClient.invalidateQueries('facture')
        queryClient.invalidateQueries(['facture', dateFiltre])
      },
      onError: (error) => {
        const errorMsg = error.response?.data?.error || error.message || 'Erreur lors de la génération'
        toast.error(`Erreur: ${errorMsg}`)
        console.error('Erreur génération facture:', error.response?.data || error)
      },
    }
  )

  const handleGenererFacture = () => {
    genererFactureMutation.mutate(dateFiltre)
  }

  const handleImprimerFacture = async () => {
    try {
      // Récupérer le token d'authentification
      const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
      
      // Télécharger le PDF avec authentification
      const response = await axios.get(`/api/restauration/factures/${dateFiltre}/imprimer/`, {
        responseType: 'blob',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      })
      
      // Créer un blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      
      // Télécharger le fichier
      const link = document.createElement('a')
      link.href = url
      link.download = `facture_${dateFiltre.replace(/-/g, '')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Ouvrir dans un nouvel onglet pour impression (le navigateur gère automatiquement les PDFs)
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        // Nettoyer l'URL après un délai
        setTimeout(() => {
          // Le navigateur gère l'impression du PDF automatiquement
          window.URL.revokeObjectURL(url)
        }, 5000)
      } else {
        // Si popup bloquée, nettoyer quand même l'URL
        setTimeout(() => window.URL.revokeObjectURL(url), 2000)
      }
      
      toast.success('Facture téléchargée et ouverte pour impression')
    } catch (error) {
      const errorMsg = error.response?.data?.error || error.message || 'Erreur lors du téléchargement'
      toast.error(`Erreur: ${errorMsg}`)
      console.error('Erreur téléchargement facture:', error.response?.data || error)
    }
  }

  const commandesList = commandes?.results || commandes || []

  const stats = {
    total: commandesList.length,
    validees: commandesList.filter(c => c.etat === 'validee').length,
    brouillons: commandesList.filter(c => c.etat === 'brouillon').length,
    totalBrut: commandesList.reduce((sum, c) => sum + parseFloat(c.montant_brut || 0), 0),
    totalNet: commandesList.reduce((sum, c) => sum + parseFloat(c.montant_net || 0), 0),
    totalSubvention: commandesList.reduce((sum, c) => sum + parseFloat(c.montant_subvention || 0), 0),
  }

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="tableau-bord-cantine">
      <div className="breadcrumbs">
        <span>Accueil</span>
        <span className="breadcrumb-separator">›</span>
        <span>Restauration</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Tableau de Bord Cantine</span>
      </div>
      
      <div className="page-header">
        <h1>📊 Tableau de Bord - Gestion Cantine</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="date"
            className="form-input"
            value={dateFiltre}
            onChange={(e) => setDateFiltre(e.target.value)}
            style={{ width: 'auto' }}
          />
          {facture ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                ✓ Facture: {facture.numero_facture}
              </span>
              <button
                onClick={handleImprimerFacture}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
              >
                🖨️ Télécharger & Imprimer PDF
              </button>
            </div>
          ) : (
            <button
              onClick={handleGenererFacture}
              className="btn btn-primary"
              disabled={genererFactureMutation.isLoading || commandesList.length === 0}
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              {genererFactureMutation.isLoading ? '⏳ Génération...' : '📄 Générer la Facture'}
            </button>
          )}
        </div>
      </div>

      {facture && (
        <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#e7f3ff', border: '2px solid #366092', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ color: '#366092', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📄 Facture du {format(new Date(facture.date_facture), 'dd MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={handleImprimerFacture}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              🖨️ Télécharger & Imprimer PDF
            </button>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #366092'
          }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Numéro</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#366092' }}>{facture.numero_facture}</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Commandes</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#366092' }}>{facture.total_commandes}</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Brut</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#366092' }}>{formatGNF(parseFloat(facture.total_brut))}</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Subvention</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>{formatGNF(parseFloat(facture.total_subvention))}</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>Total Net</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#366092' }}>{formatGNF(parseFloat(facture.total_net))}</div>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: '#fff3cd', borderRadius: '6px', border: '1px solid #ffc107' }}>
              <div style={{ fontSize: '0.85rem', color: '#856404', marginBottom: '0.25rem' }}>Total Suppléments</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#856404' }}>{formatGNF(parseFloat(facture.total_supplement))}</div>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #366092 0%, #2d4f7a 100%)', borderLeft: '4px solid #1e3a5f' }}>
          <div className="stat-label">Total Commandes</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderLeft: '4px solid #047857' }}>
          <div className="stat-label">Validées</div>
          <div className="stat-value">{stats.validees}</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', borderLeft: '4px solid #b45309' }}>
          <div className="stat-label">En Brouillon</div>
          <div className="stat-value">{stats.brouillons}</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', borderLeft: '4px solid #6d28d9' }}>
          <div className="stat-label">Total Brut</div>
          <div className="stat-value">{formatGNF(stats.totalBrut)}</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3abff8 0%, #0ea5e9 100%)', borderLeft: '4px solid #0284c7' }}>
          <div className="stat-label">Total Subvention</div>
          <div className="stat-value">{formatGNF(stats.totalSubvention)}</div>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', borderLeft: '4px solid #be185d' }}>
          <div className="stat-label">Total Net</div>
          <div className="stat-value">{formatGNF(stats.totalNet)}</div>
        </div>
      </div>

      <div className="card">
        <h2>Commandes du {format(new Date(dateFiltre), 'dd MMMM yyyy', { locale: fr })}</h2>
        
        {commandesList.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Employé</th>
                <th>Date</th>
                <th>État</th>
                <th>Nb Plats</th>
                <th>Montant Brut</th>
                <th>Subvention</th>
                <th>Montant Net</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {commandesList.map((commande) => (
                <tr key={commande.id}>
                  <td><strong>{commande.utilisateur_username || 'Anonyme'}</strong></td>
                  <td>{format(new Date(commande.date_commande), 'dd/MM/yyyy')}</td>
                  <td>
                    <span className={`badge badge-${commande.etat === 'validee' ? 'success' : commande.etat === 'brouillon' ? 'warning' : 'secondary'}`}>
                      {commande.etat_display}
                    </span>
                  </td>
                  <td>
                    {commande.lignes ? commande.lignes.reduce((sum, l) => sum + l.quantite, 0) : 0}
                  </td>
                  <td>{formatGNF(commande.montant_brut)}</td>
                  <td>{formatGNF(commande.montant_subvention)}</td>
                  <td><strong>{formatGNF(commande.montant_net)}</strong></td>
                  <td>
                    {commande.lignes && commande.lignes.length > 0 && (
                      <details>
                        <summary style={{ cursor: 'pointer', color: 'var(--primary-color)' }}>Voir détails</summary>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                          {commande.lignes.map((ligne) => {
                            const supplement = ligne.prix_unitaire > 30000 ? ligne.prix_unitaire - 30000 : 0
                            return (
                              <li key={ligne.id} style={{ marginBottom: '0.5rem' }}>
                                <div>
                                  <strong>{ligne.plat_nom}</strong> x{ligne.quantite} = {formatGNF(ligne.montant_ligne)}
                                </div>
                                {supplement > 0 && (
                                  <div style={{ 
                                    marginTop: '0.25rem',
                                    padding: '0.25rem 0.5rem',
                                    backgroundColor: '#fff3cd',
                                    border: '1px solid #ffc107',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    color: '#856404',
                                    display: 'inline-block'
                                  }}>
                                    ⚠️ Supplément à facturer: {formatGNF(supplement)}
                                  </div>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            Aucune commande pour cette date.
          </p>
        )}
      </div>
    </div>
  )
}

export default TableauBordCantine

