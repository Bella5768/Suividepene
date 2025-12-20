import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { formatGNF } from '../utils/currency'
import './OperationForm.css'

const PrevisionForm = ({ prevision, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    mois: format(new Date(), 'yyyy-MM'),
    categorie: '',
    sous_categorie: '',
    montant_prevu: '',
    statut: 'draft',
  })
  const queryClient = useQueryClient()

  const { data: categories, error: categoriesError, isLoading: categoriesLoading } = useQuery(
    'categories',
    async () => {
      const response = await axios.get('/api/categories/')
      return response.data
    },
    {
      retry: 1,
      onError: (error) => {
        console.error('Erreur lors du chargement des catégories:', error)
      }
    }
  )

  const { data: sousCategories } = useQuery(
    ['sous-categories', formData.categorie],
    async () => {
      if (!formData.categorie) return []
      const response = await axios.get(`/api/sous-categories/?categorie=${formData.categorie}`)
      return response.data
    },
    { enabled: !!formData.categorie }
  )

  useEffect(() => {
    if (prevision) {
      setFormData({
        mois: format(new Date(prevision.mois), 'yyyy-MM'),
        categorie: prevision.categorie,
        sous_categorie: prevision.sous_categorie || '',
        montant_prevu: prevision.montant_prevu,
        statut: prevision.statut || 'draft',
      })
    }
  }, [prevision])

  const saveMutation = useMutation(
    (data) => {
      // Convertir le mois en format YYYY-MM-DD (premier jour du mois)
      const moisDate = new Date(data.mois + '-01')
      const dataToSend = {
        ...data,
        mois: format(moisDate, 'yyyy-MM-dd'),
      }
      
      if (prevision) {
        return axios.put(`/api/previsions/${prevision.id}/`, dataToSend)
      }
      return axios.post('/api/previsions/', dataToSend)
    },
    {
      onSuccess: () => {
        toast.success(prevision ? 'Prévision modifiée' : 'Prévision créée')
        queryClient.invalidateQueries('previsions')
        onSuccess?.()
      },
      onError: (error) => {
        const message = error.response?.data?.detail || error.response?.data?.error || 'Erreur lors de la sauvegarde'
        toast.error(message)
      },
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.categorie) {
      toast.error('Veuillez sélectionner une catégorie')
      return
    }
    
    if (!formData.montant_prevu || parseFloat(formData.montant_prevu) <= 0) {
      toast.error('Le montant prévu doit être supérieur à 0')
      return
    }

    saveMutation.mutate(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{prevision ? 'Modifier' : 'Nouvelle'} Prévision</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Mois *</label>
            <input
              type="month"
              className="form-input"
              value={formData.mois}
              onChange={(e) => setFormData({ ...formData, mois: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Catégorie *</label>
            {categoriesError ? (
              <div style={{ padding: '0.75rem', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', color: '#856404' }}>
                Erreur lors du chargement des catégories. Vérifiez votre connexion et réessayez.
              </div>
            ) : (
              <select
                className="form-select"
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value, sous_categorie: '' })}
                required
                disabled={categoriesLoading}
              >
                <option value="">{categoriesLoading ? 'Chargement...' : 'Sélectionner une catégorie'}</option>
                {categories?.results?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.code} - {cat.nom}
                  </option>
                )) || categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.code} - {cat.nom}
                  </option>
                ))}
              </select>
            )}
          </div>

          {formData.categorie && sousCategories && sousCategories.length > 0 && (
            <div className="form-group">
              <label className="form-label">Sous-catégorie</label>
              <select
                className="form-select"
                value={formData.sous_categorie}
                onChange={(e) => setFormData({ ...formData, sous_categorie: e.target.value })}
              >
                <option value="">Aucune</option>
                {sousCategories.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Montant Prévu (GNF) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              value={formData.montant_prevu}
              onChange={(e) => setFormData({ ...formData, montant_prevu: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Statut</label>
            <select
              className="form-select"
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
            >
              <option value="draft">Brouillon</option>
              <option value="validated">Validée</option>
              <option value="closed">Clôturée</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={saveMutation.isLoading}>
              {saveMutation.isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PrevisionForm


