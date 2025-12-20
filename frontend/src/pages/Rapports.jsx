import { useState } from 'react'
import { useQuery } from 'react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { formatGNF } from '../utils/currency'
import './Rapports.css'

const Rapports = () => {
  const [mois, setMois] = useState(format(new Date(), 'yyyy-MM'))

  const { data: rapport, isLoading } = useQuery(
    ['rapport', mois],
    async () => {
      const response = await axios.get(`/api/rapports/mensuel/?mois=${mois}`)
      return response.data
    },
    { enabled: !!mois }
  )

  const exportPDF = async () => {
    try {
      const response = await axios.get(`/api/rapports/export_pdf/?mois=${mois}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport_${mois}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Export PDF réussi')
    } catch (error) {
      toast.error('Erreur lors de l\'export PDF')
    }
  }

  const exportExcel = async () => {
    try {
      const response = await axios.get(`/api/rapports/export_excel/?mois=${mois}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport_${mois}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Export Excel réussi')
    } catch (error) {
      toast.error('Erreur lors de l\'export Excel')
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
    <div className="rapports">
      <div className="page-header">
        <h1>Rapports Mensuels</h1>
        <div className="page-actions">
          <input
            type="month"
            className="form-input"
            value={mois}
            onChange={(e) => setMois(e.target.value)}
            style={{ width: 'auto', marginRight: '1rem' }}
          />
          <button onClick={exportPDF} className="btn btn-secondary">
            📄 Exporter PDF
          </button>
          <button onClick={exportExcel} className="btn btn-success">
            📊 Exporter Excel
          </button>
        </div>
      </div>

      {rapport && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Dépenses</div>
              <div className="stat-value">{formatGNF(rapport.total_depenses)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Prévu</div>
              <div className="stat-value">{formatGNF(rapport.total_prevu)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Écart Global</div>
              <div className={`stat-value ${rapport.ecart_global < 0 ? 'negative' : 'positive'}`}>
                {formatGNF(rapport.ecart_global)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Moyenne Journalière</div>
              <div className="stat-value">{formatGNF(rapport.moyenne_journaliere)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Nombre d'Opérations</div>
              <div className="stat-value">{rapport.nombre_operations}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Nombre de Jours</div>
              <div className="stat-value">{rapport.nombre_jours}</div>
            </div>
          </div>

          <div className="card">
            <h2>Détails par Catégorie</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Total Dépensé</th>
                  <th>Montant Prévu</th>
                  <th>Écart</th>
                  <th>Nombre d'Opérations</th>
                </tr>
              </thead>
              <tbody>
                {rapport.categories.map((cat) => (
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
        </>
      )}
    </div>
  )
}

export default Rapports


