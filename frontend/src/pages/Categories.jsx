import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import './Categories.css'

const Categories = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  // États pour les formulaires
  const [showCategorieForm, setShowCategorieForm] = useState(false)
  const [showSousCategorieForm, setShowSousCategorieForm] = useState(false)
  const [editingCategorie, setEditingCategorie] = useState(null)
  const [editingSousCategorie, setEditingSousCategorie] = useState(null)
  const [categorieFormData, setCategorieFormData] = useState({
    code: '',
    nom: '',
    description: '',
  })
  const [sousCategorieFormData, setSousCategorieFormData] = useState({
    categorie: '',
    nom: '',
    description: '',
  })
  
  const { data: categories, isLoading: isLoadingCategories, error: errorCategories } = useQuery(
    'categories',
    async () => {
      try {
        const response = await axios.get('/api/categories/')
        return response.data
      } catch (error) {
        console.error('Erreur API catégories:', error)
        throw error
      }
    },
    {
      enabled: !!user, // Ne charger que si l'utilisateur est connecté
      retry: 1,
      onError: (error) => {
        console.error('Erreur lors du chargement des catégories:', error)
        if (error.response?.status === 401) {
          toast.error('Vous devez être connecté pour voir les catégories')
        } else {
          toast.error(`Erreur lors du chargement des catégories: ${error.message}`)
        }
      }
    }
  )

  const { data: sousCategories, isLoading: isLoadingSousCategories, error: errorSousCategories } = useQuery(
    'sous-categories',
    async () => {
      try {
        const response = await axios.get('/api/sous-categories/')
        return response.data
      } catch (error) {
        console.error('Erreur API sous-catégories:', error)
        throw error
      }
    },
    {
      enabled: !!user, // Ne charger que si l'utilisateur est connecté
      retry: 1,
      onError: (error) => {
        console.error('Erreur lors du chargement des sous-catégories:', error)
        if (error.response?.status === 401) {
          toast.error('Vous devez être connecté pour voir les sous-catégories')
        } else {
          toast.error(`Erreur lors du chargement des sous-catégories: ${error.message}`)
        }
      }
    }
  )

  // Mutations pour les catégories
  const saveCategorieMutation = useMutation(
    (data) => {
      if (editingCategorie) {
        return axios.put(`/api/categories/${editingCategorie.id}/`, data)
      }
      return axios.post('/api/categories/', data)
    },
    {
      onSuccess: () => {
        toast.success(editingCategorie ? 'Catégorie modifiée' : 'Catégorie créée')
        queryClient.invalidateQueries('categories')
        handleCategorieFormClose()
      },
      onError: (error) => {
        const message = error.response?.data?.detail || error.response?.data?.code?.[0] || 'Erreur lors de la sauvegarde'
        toast.error(message)
      },
    }
  )

  const deleteCategorieMutation = useMutation(
    (id) => axios.delete(`/api/categories/${id}/`),
    {
      onSuccess: () => {
        toast.success('Catégorie supprimée')
        queryClient.invalidateQueries('categories')
        queryClient.invalidateQueries('sous-categories')
      },
      onError: (error) => {
        const message = error.response?.data?.detail || 'Erreur lors de la suppression'
        toast.error(message)
      },
    }
  )

  // Mutations pour les sous-catégories
  const saveSousCategorieMutation = useMutation(
    (data) => {
      if (editingSousCategorie) {
        return axios.put(`/api/sous-categories/${editingSousCategorie.id}/`, data)
      }
      return axios.post('/api/sous-categories/', data)
    },
    {
      onSuccess: () => {
        toast.success(editingSousCategorie ? 'Sous-catégorie modifiée' : 'Sous-catégorie créée')
        queryClient.invalidateQueries('sous-categories')
        handleSousCategorieFormClose()
      },
      onError: (error) => {
        const message = error.response?.data?.detail || error.response?.data?.nom?.[0] || 'Erreur lors de la sauvegarde'
        toast.error(message)
      },
    }
  )

  const deleteSousCategorieMutation = useMutation(
    (id) => axios.delete(`/api/sous-categories/${id}/`),
    {
      onSuccess: () => {
        toast.success('Sous-catégorie supprimée')
        queryClient.invalidateQueries('sous-categories')
      },
      onError: (error) => {
        const message = error.response?.data?.detail || 'Erreur lors de la suppression'
        toast.error(message)
      },
    }
  )

  // Handlers pour les catégories
  const handleEditCategorie = (categorie) => {
    setEditingCategorie(categorie)
    setCategorieFormData({
      code: categorie.code,
      nom: categorie.nom,
      description: categorie.description || '',
    })
    setShowCategorieForm(true)
  }

  const handleCategorieFormClose = () => {
    setShowCategorieForm(false)
    setEditingCategorie(null)
    setCategorieFormData({
      code: '',
      nom: '',
      description: '',
    })
  }

  const handleSubmitCategorie = (e) => {
    e.preventDefault()
    if (!categorieFormData.code || !categorieFormData.nom) {
      toast.error('Le code et le nom sont obligatoires')
      return
    }
    saveCategorieMutation.mutate(categorieFormData)
  }

  // Handlers pour les sous-catégories
  const handleEditSousCategorie = (sousCategorie) => {
    setEditingSousCategorie(sousCategorie)
    // Utiliser categorie_id si disponible, sinon categorie
    const categorieId = sousCategorie.categorie_id || sousCategorie.categorie
    setSousCategorieFormData({
      categorie: categorieId,
      nom: sousCategorie.nom,
      description: sousCategorie.description || '',
    })
    setShowSousCategorieForm(true)
  }

  const handleSousCategorieFormClose = () => {
    setShowSousCategorieForm(false)
    setEditingSousCategorie(null)
    setSousCategorieFormData({
      categorie: '',
      nom: '',
      description: '',
    })
  }

  const handleSubmitSousCategorie = (e) => {
    e.preventDefault()
    if (!sousCategorieFormData.categorie || !sousCategorieFormData.nom) {
      toast.error('La catégorie et le nom sont obligatoires')
      return
    }
    saveSousCategorieMutation.mutate(sousCategorieFormData)
  }

  if (isLoadingCategories || isLoadingSousCategories) {
    return (
      <div className="categories">
        <div className="breadcrumbs">
          <span>Accueil</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Catégories</span>
        </div>
        <div className="page-header">
          <h1>📁 Catégories et Sous-Catégories</h1>
        </div>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (errorCategories || errorSousCategories) {
    return (
      <div className="categories">
        <div className="breadcrumbs">
          <span>Accueil</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Catégories</span>
        </div>
        <div className="page-header">
          <h1>📁 Catégories et Sous-Catégories</h1>
        </div>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#dc3545', fontSize: '1.1rem' }}>
            Erreur lors du chargement des données.
            {errorCategories?.response?.status === 401 || errorSousCategories?.response?.status === 401 ? (
              <span> Veuillez vous connecter.</span>
            ) : (
              <span> Veuillez réessayer plus tard.</span>
            )}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="categories">
      <div className="breadcrumbs">
        <span>Accueil</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Catégories</span>
      </div>
      <div className="page-header">
        <h1>📁 Catégories et Sous-Catégories</h1>
      </div>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Catégories</h2>
          <button
            onClick={() => setShowCategorieForm(true)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            ➕ Nouvelle Catégorie
          </button>
        </div>
        {categories && categories.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Nom</th>
                <th>Description</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td><strong>{cat.code}</strong></td>
                  <td>{cat.nom}</td>
                  <td>{cat.description || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleEditCategorie(cat)}
                      className="btn btn-sm btn-secondary"
                      style={{ marginRight: '0.5rem' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${cat.nom}" ?`)) {
                          deleteCategorieMutation.mutate(cat.id)
                        }
                      }}
                      className="btn btn-sm btn-danger"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
            Aucune catégorie trouvée.
          </p>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Sous-Catégories</h2>
          <button
            onClick={() => setShowSousCategorieForm(true)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            ➕ Nouvelle Sous-Catégorie
          </button>
        </div>
        {sousCategories && (sousCategories.results || sousCategories).length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Nom</th>
                <th>Description</th>
                <th style={{ width: '120px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(sousCategories.results || sousCategories).map((sc) => (
                <tr key={sc.id}>
                  <td>{sc.categorie_code} - {sc.categorie_nom}</td>
                  <td>{sc.nom}</td>
                  <td>{sc.description || '-'}</td>
                  <td>
                    <button
                      onClick={() => handleEditSousCategorie(sc)}
                      className="btn btn-sm btn-secondary"
                      style={{ marginRight: '0.5rem' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la sous-catégorie "${sc.nom}" ?`)) {
                          deleteSousCategorieMutation.mutate(sc.id)
                        }
                      }}
                      className="btn btn-sm btn-danger"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
            Aucune sous-catégorie trouvée.
          </p>
        )}
      </div>

      {/* Modal pour créer/modifier une catégorie */}
      {showCategorieForm && (
        <div className="modal-overlay" onClick={handleCategorieFormClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategorie ? 'Modifier' : 'Nouvelle'} Catégorie</h2>
              <button onClick={handleCategorieFormClose} className="modal-close">×</button>
            </div>
            <form onSubmit={handleSubmitCategorie}>
              <div className="form-group">
                <label className="form-label">Code *</label>
                <input
                  type="text"
                  className="form-input"
                  value={categorieFormData.code}
                  onChange={(e) => setCategorieFormData({ ...categorieFormData, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="Ex: REST, TRANS, etc."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={categorieFormData.nom}
                  onChange={(e) => setCategorieFormData({ ...categorieFormData, nom: e.target.value })}
                  required
                  placeholder="Ex: Restauration, Transport, etc."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={categorieFormData.description}
                  onChange={(e) => setCategorieFormData({ ...categorieFormData, description: e.target.value })}
                  rows="3"
                  placeholder="Description optionnelle de la catégorie"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleCategorieFormClose} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saveCategorieMutation.isLoading}>
                  {saveCategorieMutation.isLoading ? 'Enregistrement...' : editingCategorie ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pour créer/modifier une sous-catégorie */}
      {showSousCategorieForm && (
        <div className="modal-overlay" onClick={handleSousCategorieFormClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSousCategorie ? 'Modifier' : 'Nouvelle'} Sous-Catégorie</h2>
              <button onClick={handleSousCategorieFormClose} className="modal-close">×</button>
            </div>
            <form onSubmit={handleSubmitSousCategorie}>
              <div className="form-group">
                <label className="form-label">Catégorie *</label>
                <select
                  className="form-select"
                  value={sousCategorieFormData.categorie}
                  onChange={(e) => setSousCategorieFormData({ ...sousCategorieFormData, categorie: e.target.value })}
                  required
                  disabled={!categories || categories.length === 0}
                >
                  <option value="">{categories && categories.length > 0 ? 'Sélectionner une catégorie' : 'Aucune catégorie disponible'}</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.code} - {cat.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={sousCategorieFormData.nom}
                  onChange={(e) => setSousCategorieFormData({ ...sousCategorieFormData, nom: e.target.value })}
                  required
                  placeholder="Ex: Déjeuner, Dîner, etc."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={sousCategorieFormData.description}
                  onChange={(e) => setSousCategorieFormData({ ...sousCategorieFormData, description: e.target.value })}
                  rows="3"
                  placeholder="Description optionnelle de la sous-catégorie"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={handleSousCategorieFormClose} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saveSousCategorieMutation.isLoading}>
                  {saveSousCategorieMutation.isLoading ? 'Enregistrement...' : editingSousCategorie ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories


