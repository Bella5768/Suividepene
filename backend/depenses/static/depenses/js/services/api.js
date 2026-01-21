/**
 * Service API générique
 * Gère les appels HTTP avec authentification
 */

import { getApiUrl } from '/static/depenses/js/config/api.js';
import { authService } from '/static/depenses/js/services/auth.js';

class ApiService {
  /**
   * Faire une requête GET
   */
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, null, options);
  }

  /**
   * Faire une requête POST
   */
  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  /**
   * Faire une requête PUT
   */
  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  /**
   * Faire une requête PATCH
   */
  async patch(endpoint, data, options = {}) {
    return this.request('PATCH', endpoint, data, options);
  }

  /**
   * Faire une requête DELETE
   */
  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }

  /**
   * Faire une requête HTTP générique
   */
  async request(method, endpoint, data = null, options = {}) {
    const url = getApiUrl(endpoint);
    const token = authService.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
      ...options,
    };

    if (data && method !== 'GET' && method !== 'DELETE') {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);

      // Gérer les réponses non-JSON (comme les fichiers)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        
        if (!response.ok) {
          throw {
            response,
            data: jsonData,
            message: jsonData.detail || jsonData.message || 'Erreur de requête',
          };
        }
        
        return jsonData;
      } else {
        // Pour les fichiers (PDF, Excel, etc.)
        if (!response.ok) {
          throw {
            response,
            message: 'Erreur lors du téléchargement',
          };
        }
        return response;
      }
    } catch (error) {
      if (error.response) {
        throw error;
      }
      throw {
        message: error.message || 'Erreur de connexion',
        error,
      };
    }
  }

  /**
   * Récupérer un fichier blob (PDF, Excel, etc.)
   */
  async getBlob(endpoint) {
    const url = getApiUrl(endpoint);
    // Récupérer le token directement depuis localStorage
    const token = localStorage.getItem('access_token');
    
    console.log('getBlob - URL:', url);
    console.log('getBlob - Token présent:', !!token);

    const headers = {
      'Accept': 'application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { 
      method: 'GET', 
      headers,
      credentials: 'include'
    });
    
    console.log('getBlob - Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('getBlob - Error:', errorText);
      throw new Error(errorText || 'Erreur lors du téléchargement');
    }
    
    return await response.blob();
  }

  /**
   * Télécharger un fichier (PDF, Excel, etc.)
   */
  async downloadFile(endpoint, filename) {
    try {
      const response = await this.get(endpoint, {
        headers: {
          'Accept': 'application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

      // Si la réponse est un blob
      if (response instanceof Response) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        return { success: true };
      }

      return response;
    } catch (error) {
      throw error;
    }
  }
}

export const apiService = new ApiService();

