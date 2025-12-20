import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { formatGNF } from '../utils/currency'
import './OperationForm.css'

const OperationForm = ({ operation, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date_operation: format(new Date(), 'yyyy-MM-dd'),
    categorie: '',
    sous_categorie: '',
    unites: '',
    prix_unitaire: '',
    description: '',
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
    if (operation) {
      setFormData({
        date_operation: operation.date_operation,
        categorie: operation.categorie,
        sous_categorie: operation.sous_categorie || '',
        unites: operation.unites,
        prix_unitaire: operation.prix_unitaire,
        description: operation.description || '',
      })
    }
  }, [operation])

  const saveMutation = useMutation(
    (data) => {
      if (operation) {
        return axios.put(`/api/operations/${operation.id}/`, data)
      }
      return axios.post('/api/operations/', data)
    },
    {
      onSuccess: () => {
        toast.success(operation ? 'Opération modifiée' : 'Opération créée')
        queryClient.invalidateQueries('operations')
        onSuccess?.()
      },
      onError: (error) => {
        const message = error.response?.data?.detail || 'Erreur lors de la sauvegarde'
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
    
    if (!formData.unites || parseFloat(formData.unites) <= 0) {
      toast.error('Le nombre d\'unités doit être supérieur à 0')
      return
    }
    
    if (!formData.prix_unitaire || parseFloat(formData.prix_unitaire) <= 0) {
      toast.error('Le prix unitaire doit être supérieur à 0')
      return
    }

    saveMutation.mutate(formData)
  }

  const calculatedAmount = formData.unites && formData.prix_unitaire
    ? parseFloat(formData.unites) * parseFloat(formData.prix_unitaire)
    : 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{operation ? 'Modifier' : 'Nouvelle'} Opération</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Date de l'opération *</label>
            <input
              type="date"
              className="form-input"
              value={formData.date_operation}
              onChange={(e) => setFormData({ ...formData, date_operation: e.target.value })}
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Unités *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                value={formData.unites}
                onChange={(e) => setFormData({ ...formData, unites: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Prix Unitaire (GNF) *</label>
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
            <label className="form-label">Montant Total (calculé automatiquement)</label>
            <div className="calculated-amount">{formatGNF(calculatedAmount)}</div>
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

export default OperationForm


