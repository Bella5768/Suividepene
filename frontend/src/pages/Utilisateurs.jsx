import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '../contexts/AuthContext'
import './Utilisateurs.css'

const Utilisateurs = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  // États pour les formulaires
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_staff: false,
    is_superuser: false,
    is_active: true,
    permissions: {},
  })

  // Liste des fonctionnalités disponibles
  const fonctionnalites = [
    { code: 'dashboard', label: 'Tableau de bord', section: 'GESTION DES DÉPENSES' },
    { code: 'operations', label: 'Opérations', section: 'GESTION DES DÉPENSES' },
    { code: 'previsions', label: 'Prévisions', section: 'GESTION DES DÉPENSES' },
    { code: 'imputations', label: 'Imputations', section: 'GESTION DES DÉPENSES' },
    { code: 'rapports', label: 'Rapports', section: 'GESTION DES DÉPENSES' },
    { code: 'categories', label: 'Catégories', section: 'GESTION DES DÉPENSES' },
    { code: 'utilisateurs', label: 'Utilisateurs', section: 'ADMINISTRATION' },
    { code: 'audit', label: 'Audit', section: 'AUDIT ET TRAÇABILITÉ' },
    { code: 'restauration_commandes', label: 'Commander (Restauration)', section: 'RESTAURATION / CANTINE' },
    { code: 'restauration_valider_commandes', label: 'Valider les Commandes (Restauration)', section: 'RESTAURATION / CANTINE' },
    { code: 'restauration_menus', label: 'Menus (Restauration)', section: 'RESTAURATION / CANTINE' },
    { code: 'restauration_plats', label: 'Plats (Restauration)', section: 'RESTAURATION / CANTINE' },
    { code: 'tableau_bord_cantine', label: 'Tableau de Bord Cantine', section: 'RESTAURATION / CANTINE' },
  ]

  const { data: usersData, isLoading, error } = useQuery(
    'users',
    async () => {
      try {
        const response = await axios.get('/api/users/')
        return response.data
      } catch (error) {
        console.error('Erreur API utilisateurs:', error)
        throw error
      }
    },
    {
      enabled: !!user && user.is_superuser, // Seuls les superusers peuvent voir
      retry: 1,
      onError: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error)
        if (error.response?.status === 401) {
          toast.error('Vous devez être connecté pour voir les utilisateurs')
        } else if (error.response?.status === 403) {
          toast.error('Vous n\'avez pas les permissions nécessaires')
        } else {
          toast.error(`Erreur lors du chargement des utilisateurs: ${error.message}`)
        }
      }
    }
  )

  // Mutations
  const saveUserMutation = useMutation(
    (data) => {
      if (editingUser) {
        return axios.put(`/api/users/${editingUser.id}/`, data)
      }
      return axios.post('/api/users/', data)
    },
    {
      onSuccess: () => {
        toast.success(editingUser ? 'Utilisateur modifié' : 'Utilisateur créé')
        if (editingUser) {
          toast.info('L\'utilisateur devra se reconnecter pour voir ses nouvelles permissions.')
        }
        queryClient.invalidateQueries('users')
        handleFormClose()
      },
      onError: (error) => {
        const message = error.response?.data?.detail || 
                       error.response?.data?.username?.[0] || 
                       error.response?.data?.email?.[0] || 
                       'Erreur lors de la sauvegarde'
        toast.error(message)
      },
    }
  )

  const deleteUserMutation = useMutation(
    (id) => axios.delete(`/api/users/${id}/`),
    {
      onSuccess: () => {
        toast.success('Utilisateur supprimé')
        queryClient.invalidateQueries('users')
      },
      onError: (error) => {
        const message = error.response?.data?.detail || 'Erreur lors de la suppression'
        toast.error(message)
      },
    }
  )

  // Handlers
  const handleEdit = (user) => {
    setEditingUser(user)
    // Construire l'objet permissions à partir des permissions de l'utilisateur
    const permissionsObj = {}
    if (user.permissions && Array.isArray(user.permissions)) {
      user.permissions.forEach(perm => {
        permissionsObj[perm.fonctionnalite] = {
          peut_voir: perm.peut_voir,
          peut_creer: perm.peut_creer,
          peut_modifier: perm.peut_modifier,
          peut_supprimer: perm.peut_supprimer,
        }
      })
    }
    setFormData({
      username: user.username,
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      password: '', // Ne pas pré-remplir le mot de passe
      is_staff: user.is_staff || false,
      is_superuser: user.is_superuser || false,
      is_active: user.is_active !== undefined ? user.is_active : true,
      permissions: permissionsObj,
    })
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingUser(null)
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      is_staff: false,
      is_superuser: false,
      is_active: true,
      permissions: {},
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.username) {
      toast.error('Le nom d\'utilisateur est obligatoire')
      return
    }
    
    // Pour la modification, ne pas envoyer le mot de passe s'il est vide
    const dataToSend = { ...formData }
    if (editingUser && !dataToSend.password) {
      delete dataToSend.password
    }
    
    // Convertir l'objet permissions en tableau pour l'API
    const permissionsArray = Object.keys(dataToSend.permissions || {}).map(fonctionnalite => ({
      fonctionnalite,
      ...dataToSend.permissions[fonctionnalite],
    }))
    dataToSend.permissions_data = permissionsArray
    delete dataToSend.permissions
    
    saveUserMutation.mutate(dataToSend)
  }

  const updatePermission = (fonctionnalite, field, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [fonctionnalite]: {
          ...(prev.permissions[fonctionnalite] || { peut_voir: true, peut_creer: false, peut_modifier: false, peut_supprimer: false }),
          [field]: value,
        },
      },
    }))
  }

  const getPermissionValue = (fonctionnalite, field) => {
    return formData.permissions[fonctionnalite]?.[field] ?? (field === 'peut_voir' ? true : false)
  }

  if (isLoading) {
    return (
      <div className="utilisateurs">
        <div className="breadcrumbs">
          <span>Accueil</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Utilisateurs</span>
        </div>
        <div className="page-header">
          <h1>👥 Gestion des Utilisateurs</h1>
        </div>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="utilisateurs">
        <div className="breadcrumbs">
          <span>Accueil</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Utilisateurs</span>
        </div>
        <div className="page-header">
          <h1>👥 Gestion des Utilisateurs</h1>
        </div>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#dc3545', fontSize: '1.1rem' }}>
            Erreur lors du chargement des données.
            {error.response?.status === 401 ? (
              <span> Veuillez vous connecter.</span>
            ) : error.response?.status === 403 ? (
              <span> Vous n'avez pas les permissions nécessaires pour accéder à cette page.</span>
            ) : (
              <span> Veuillez réessayer plus tard.</span>
            )}
          </p>
        </div>
      </div>
    )
  }

  // Vérifier si l'utilisateur est superuser
  if (!user || !user.is_superuser) {
    return (
      <div className="utilisateurs">
        <div className="breadcrumbs">
          <span>Accueil</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Utilisateurs</span>
        </div>
        <div className="page-header">
          <h1>👥 Gestion des Utilisateurs</h1>
        </div>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#dc3545', fontSize: '1.1rem' }}>
            ⚠️ Accès refusé. Seuls les administrateurs peuvent gérer les utilisateurs.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="utilisateurs">
      <div className="breadcrumbs">
        <span>Accueil</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">Utilisateurs</span>
      </div>
      <div className="page-header">
        <h1>👥 Gestion des Utilisateurs</h1>
      </div>
      
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>
            Liste des Utilisateurs
            {usersData && (Array.isArray(usersData) ? usersData : usersData.results || []).length > 0 && (
              <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#666', marginLeft: '0.5rem' }}>
                ({(Array.isArray(usersData) ? usersData : usersData.results || []).length} utilisateur{(Array.isArray(usersData) ? usersData : usersData.results || []).length > 1 ? 's' : ''})
              </span>
            )}
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          >
            ➕ Nouvel Utilisateur
          </button>
        </div>
        {(() => {
          const usersList = usersData 
            ? (Array.isArray(usersData) ? usersData : usersData.results || [])
            : []
          return usersList.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Nom d'utilisateur</th>
                  <th>Email</th>
                  <th>Nom complet</th>
                  <th>Staff</th>
                  <th>Superuser</th>
                  <th>Actif</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.email || '-'}</td>
                  <td>{u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : '-'}</td>
                  <td>
                    <span className={`badge ${u.is_staff ? 'badge-success' : 'badge-secondary'}`}>
                      {u.is_staff ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_superuser ? 'badge-danger' : 'badge-secondary'}`}>
                      {u.is_superuser ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(u)}
                      className="btn btn-sm btn-secondary"
                      style={{ marginRight: '0.5rem' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${u.username}" ?`)) {
                          deleteUserMutation.mutate(u.id)
                        }
                      }}
                      className="btn btn-sm btn-danger"
                      disabled={u.id === user?.id} // Ne pas permettre de supprimer son propre compte
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
              Aucun utilisateur trouvé.
            </p>
          )
        })()}
      </div>

      {/* Modal pour créer/modifier un utilisateur */}
      {showForm && (
        <div className="modal-overlay" onClick={handleFormClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Modifier' : 'Nouvel'} Utilisateur</h2>
              <button onClick={handleFormClose} className="modal-close">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom d'utilisateur *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={!!editingUser} // Ne pas permettre de modifier le username
                  placeholder="Ex: jdupont"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Ex: jdupont@example.com"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prénom</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Ex: Jean"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Ex: Dupont"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
                </label>
                <input
                  type="password"
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  placeholder={editingUser ? "Laisser vide pour ne pas changer" : "Mot de passe"}
                />
                {!editingUser && (
                  <small style={{ color: '#666', fontSize: '0.875rem' }}>
                    Si non renseigné, le mot de passe sera identique au nom d'utilisateur
                  </small>
                )}
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '6px', 
                marginBottom: '1rem',
                border: '1px solid #dee2e6'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1rem', color: '#333' }}>
                  🔐 Privilèges et Permissions
                </h3>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_staff}
                      onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div>
                      <strong>Accès au panneau d'administration (Staff)</strong>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                        Permet d'accéder à l'interface d'administration Django et aux fonctionnalités avancées
                      </div>
                    </div>
                  </label>
                </div>
                <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_superuser}
                      onChange={(e) => {
                        const newValue = e.target.checked
                        setFormData({ 
                          ...formData, 
                          is_superuser: newValue,
                          is_staff: newValue ? true : formData.is_staff // Superuser implique staff
                        })
                      }}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div>
                      <strong>Superutilisateur (tous les privilèges)</strong>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                        Accès complet : peut créer/modifier/supprimer des utilisateurs, gérer toutes les données, accéder à toutes les fonctionnalités
                      </div>
                    </div>
                  </label>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <div>
                      <strong>Compte actif</strong>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                        Si désactivé, l'utilisateur ne pourra plus se connecter au système
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Section Permissions par Fonctionnalité */}
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '6px', 
                marginBottom: '1rem',
                border: '1px solid #dee2e6'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem', color: '#333' }}>
                  🔐 Permissions par Fonctionnalité
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                  Définissez les permissions pour chaque fonctionnalité du menu. Les superusers ont automatiquement tous les accès.
                </p>
                
                {['GESTION DES DÉPENSES', 'ADMINISTRATION', 'RESTAURATION / CANTINE', 'AUDIT ET TRAÇABILITÉ'].map(section => (
                  <div key={section} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#495057', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                      {section}
                    </h4>
                    {fonctionnalites
                      .filter(f => f.section === section)
                      .map(fonctionnalite => (
                        <div key={fonctionnalite.code} style={{ 
                          marginBottom: '1rem', 
                          padding: '0.75rem', 
                          backgroundColor: '#fff', 
                          borderRadius: '4px',
                          border: '1px solid #e9ecef'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '0.9rem' }}>{fonctionnalite.label}</strong>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={getPermissionValue(fonctionnalite.code, 'peut_voir')}
                                onChange={(e) => updatePermission(fonctionnalite.code, 'peut_voir', e.target.checked)}
                                disabled={formData.is_superuser}
                              />
                              <span style={{ fontSize: '0.875rem' }}>Voir</span>
                            </label>
                          </div>
                          {getPermissionValue(fonctionnalite.code, 'peut_voir') && !formData.is_superuser && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                <input
                                  type="checkbox"
                                  checked={getPermissionValue(fonctionnalite.code, 'peut_creer')}
                                  onChange={(e) => updatePermission(fonctionnalite.code, 'peut_creer', e.target.checked)}
                                />
                                <span>Créer</span>
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                <input
                                  type="checkbox"
                                  checked={getPermissionValue(fonctionnalite.code, 'peut_modifier')}
                                  onChange={(e) => updatePermission(fonctionnalite.code, 'peut_modifier', e.target.checked)}
                                />
                                <span>Modifier</span>
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                <input
                                  type="checkbox"
                                  checked={getPermissionValue(fonctionnalite.code, 'peut_supprimer')}
                                  onChange={(e) => updatePermission(fonctionnalite.code, 'peut_supprimer', e.target.checked)}
                                />
                                <span>Supprimer</span>
                              </label>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={handleFormClose} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saveUserMutation.isLoading}>
                  {saveUserMutation.isLoading ? 'Enregistrement...' : editingUser ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Utilisateurs

