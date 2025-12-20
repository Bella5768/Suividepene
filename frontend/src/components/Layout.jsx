import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logoCsig from '../assets/logocsig.png'
import './Layout.css'

const Layout = () => {
  const { logout, user } = useAuth()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  // Fonction pour vérifier si l'utilisateur a accès à une fonctionnalité
  const hasPermission = (fonctionnalite, action = 'peut_voir') => {
    // Les superusers ont tous les accès
    if (user?.is_superuser) return true
    
    // Si l'utilisateur n'a pas de permissions définies, on retourne false
    if (!user?.permissions) {
      return false
    }
    
    // Chercher la permission correspondante
    if (Array.isArray(user.permissions)) {
      const permission = user.permissions.find(p => p.fonctionnalite === fonctionnalite)
      return permission ? permission[action] : false
    }
    
    // Par défaut, pas d'accès si pas de permission explicite
    return false
  }

  return (
    <div className="layout">
      <header className="main-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-brand">
              <img src={logoCsig} alt="Logo CSIG" className="header-logo" />
              <h1 className="header-title">Suivi Dépense CSIG</h1>
            </div>
          </div>
          <div className="header-right">
            <span className="header-welcome">BIENVENUE, {user?.username?.toUpperCase() || 'UTILISATEUR'}.</span>
            <Link to="/dashboard" className="header-link">VOIR LE SITE</Link>
            <button onClick={logout} className="header-link header-button">DÉCONNEXION</button>
          </div>
        </div>
      </header>
      
      <div className="layout-body">
        <aside className="sidebar">
          <div className="sidebar-search">
            <input 
              type="text" 
              placeholder="Écrivez ici pour filtrer..." 
              className="sidebar-filter-input"
            />
          </div>
          
          <div className="sidebar-section">
            <div className="sidebar-section-header">GESTION DES DÉPENSES</div>
            <ul className="sidebar-menu">
              {hasPermission('dashboard') && (
                <li>
                  <Link to="/dashboard" className={`sidebar-item ${isActive('/dashboard') ? 'active' : ''}`}>
                    Accueil
                  </Link>
                </li>
              )}
              {hasPermission('operations') && (
                <li>
                  <Link to="/operations" className={`sidebar-item ${isActive('/operations') ? 'active' : ''}`}>
                    Opérations
                  </Link>
                </li>
              )}
              {hasPermission('previsions') && (
                <li>
                  <Link to="/previsions" className={`sidebar-item ${isActive('/previsions') ? 'active' : ''}`}>
                    Prévisions
                  </Link>
                </li>
              )}
              {hasPermission('imputations') && (
                <li>
                  <Link to="/imputations" className={`sidebar-item ${isActive('/imputations') ? 'active' : ''}`}>
                    Imputations
                  </Link>
                </li>
              )}
              {hasPermission('rapports') && (
                <li>
                  <Link to="/rapports" className={`sidebar-item ${isActive('/rapports') ? 'active' : ''}`}>
                    Rapports
                  </Link>
                </li>
              )}
              {hasPermission('categories') && (
                <li>
                  <Link to="/categories" className={`sidebar-item ${isActive('/categories') ? 'active' : ''}`}>
                    Catégories
                  </Link>
                </li>
              )}
            </ul>
          </div>
          
          {(user?.is_superuser || hasPermission('utilisateurs')) && (
            <div className="sidebar-section">
              <div className="sidebar-section-header">ADMINISTRATION</div>
              <ul className="sidebar-menu">
                {hasPermission('utilisateurs') && (
                  <li>
                    <Link to="/utilisateurs" className={`sidebar-item ${isActive('/utilisateurs') ? 'active' : ''}`}>
                      Utilisateurs
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {(hasPermission('restauration_commandes') || hasPermission('restauration_menus') || hasPermission('restauration_plats') || hasPermission('tableau_bord_cantine') || hasPermission('operations')) && (
            <div className="sidebar-section">
              <div className="sidebar-section-header">RESTAURATION / CANTINE</div>
              <ul className="sidebar-menu">
                {hasPermission('restauration_commandes') && (
                  <li>
                    <Link to="/restauration/commandes" className={`sidebar-item ${isActive('/restauration/commandes') ? 'active' : ''}`}>
                      Commander
                    </Link>
                  </li>
                )}
                {hasPermission('operations') && (
                  <li>
                    <Link to="/restauration/extras" className={`sidebar-item ${isActive('/restauration/extras') ? 'active' : ''}`}>
                      🍽️ Extras (Visiteurs/Stagiaires)
                    </Link>
                  </li>
                )}
                {hasPermission('restauration_menus') && (
                  <li>
                    <Link to="/restauration/menus" className={`sidebar-item ${isActive('/restauration/menus') ? 'active' : ''}`}>
                      Menus
                    </Link>
                  </li>
                )}
                {hasPermission('restauration_plats') && (
                  <li>
                    <Link to="/restauration/plats" className={`sidebar-item ${isActive('/restauration/plats') ? 'active' : ''}`}>
                      Plats
                    </Link>
                  </li>
                )}
                {hasPermission('tableau_bord_cantine') && (
                  <li>
                    <Link to="/tableau-bord-cantine" className={`sidebar-item ${isActive('/tableau-bord-cantine') ? 'active' : ''}`}>
                      Tableau de Bord Cantine
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {hasPermission('audit') && (
            <div className="sidebar-section">
              <div className="sidebar-section-header">AUDIT ET TRAÇABILITÉ</div>
              <ul className="sidebar-menu">
                <li>
                  <Link to="/audit" className={`sidebar-item ${isActive('/audit') ? 'active' : ''}`}>
                    Journaux d'Audit
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout


