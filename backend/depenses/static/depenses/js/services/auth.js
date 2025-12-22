/**
 * Service d'authentification
 * Gère la connexion, déconnexion et la vérification de l'état d'authentification
 */

import { getApiUrl } from '../config/api.js';
import { toast } from '../utils/toast.js';

class AuthService {
  constructor() {
    this.user = null;
    this.loading = false;
    this.listeners = [];
    
    // Charger l'utilisateur au démarrage
    this.loadUser();
  }

  /**
   * Ajouter un listener pour les changements d'état
   */
  onAuthChange(callback) {
    this.listeners.push(callback);
    // Appeler immédiatement avec l'état actuel
    callback(this.user, this.loading);
  }

  /**
   * Notifier tous les listeners
   */
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.user, this.loading));
  }

  /**
   * Charger l'utilisateur depuis le token ou la session Django
   */
  async loadUser() {
    this.loading = true;
    this.notifyListeners();

    const forcedLogout = sessionStorage.getItem('forceLoggedOut') === 'true';

    // Si on a forcé la déconnexion, on ignore la session Django injectée
    if (!forcedLogout && window.DJANGO_USER && window.DJANGO_USER.isAuthenticated) {
      this.user = { username: window.DJANGO_USER.username };
      this.loading = false;
      this.notifyListeners();
      return;
    }

    // Sinon, vérifier le token JWT
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await fetch(getApiUrl('/api/users/me/'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          const permissions = Array.isArray(userData.permissions) 
            ? userData.permissions 
            : (userData.permissions || []);
          
          this.user = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            is_staff: userData.is_staff,
            is_superuser: userData.is_superuser,
            is_active: userData.is_active,
            permissions: permissions,
          };
        } else {
          // Si /me ne fonctionne pas, essayer /users/
          await this.loadUserFromList();
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        await this.loadUserFromList();
      }
      
      sessionStorage.removeItem('forceLoggedOut');
    }

    this.loading = false;
    this.notifyListeners();
  }

  /**
   * Charger l'utilisateur depuis la liste des utilisateurs
   */
  async loadUserFromList() {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(getApiUrl('/api/users/'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const users = Array.isArray(data) ? data : (data.results || []);
        if (users.length > 0) {
          const userData = users[0];
          this.user = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            is_staff: userData.is_staff,
            is_superuser: userData.is_superuser,
            is_active: userData.is_active,
            permissions: userData.permissions || [],
          };
        } else {
          this.user = { username: 'User' };
        }
      } else {
        this.user = { username: 'User' };
      }
    } catch (error) {
      console.error('Erreur lors du chargement depuis la liste:', error);
      this.user = { username: 'User' };
    }
  }

  /**
   * Connexion
   */
  async login(username, password) {
    try {
      const response = await fetch(getApiUrl('/api/auth/token/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.detail || 'Erreur de connexion';
        toast.error(message);
        return { success: false, error: message };
      }

      const data = await response.json();
      const { access, refresh } = data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      // Récupérer les informations complètes de l'utilisateur
      try {
        const userResponse = await fetch(getApiUrl('/api/users/me/'), {
          headers: {
            'Authorization': `Bearer ${access}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const permissions = Array.isArray(userData.permissions) 
            ? userData.permissions 
            : (userData.permissions || []);
          
          this.user = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            is_staff: userData.is_staff,
            is_superuser: userData.is_superuser,
            is_active: userData.is_active,
            permissions: permissions,
          };
        } else {
          // Essayer de trouver dans la liste
          const usersResponse = await fetch(getApiUrl('/api/users/'), {
            headers: {
              'Authorization': `Bearer ${access}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            const users = Array.isArray(usersData) ? usersData : (usersData.results || []);
            const currentUser = users.find(u => u.username === username);
            if (currentUser) {
              this.user = {
                id: currentUser.id,
                username: currentUser.username,
                email: currentUser.email,
                is_staff: currentUser.is_staff,
                is_superuser: currentUser.is_superuser,
                is_active: currentUser.is_active,
              };
            } else {
              this.user = { username };
            }
          } else {
            this.user = { username };
          }
        }
      } catch (err) {
        this.user = { username };
      }

      sessionStorage.removeItem('forceLoggedOut');
      toast.success('Connexion réussie');
      this.notifyListeners();
      return { success: true };
    } catch (error) {
      const message = error.message || 'Erreur de connexion';
      toast.error(message);
      return { success: false, error: message };
    }
  }

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.user = null;
    sessionStorage.setItem('forceLoggedOut', 'true');
    
    if (window.DJANGO_USER) {
      window.DJANGO_USER.isAuthenticated = false;
      window.DJANGO_USER.username = '';
    }
    
    toast.info('Déconnexion réussie');
    this.notifyListeners();
    window.location.href = '/login';
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated() {
    return !!this.user;
  }

  /**
   * Vérifier si l'utilisateur a une permission
   */
  hasPermission(fonctionnalite, action = 'peut_voir') {
    // Les superusers ont tous les accès
    if (this.user?.is_superuser) return true;
    
    // Si l'utilisateur n'a pas de permissions définies, on retourne false
    if (!this.user?.permissions) {
      return false;
    }
    
    // Chercher la permission correspondante
    if (Array.isArray(this.user.permissions)) {
      const permission = this.user.permissions.find(p => p.fonctionnalite === fonctionnalite);
      return permission ? permission[action] : false;
    }
    
    // Par défaut, pas d'accès si pas de permission explicite
    return false;
  }

  /**
   * Obtenir le token d'authentification
   */
  getToken() {
    return localStorage.getItem('access_token');
  }

  /**
   * Ajouter le token aux headers
   */
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }
}

// Instance singleton
export const authService = new AuthService();

