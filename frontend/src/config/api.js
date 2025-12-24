/**
 * Configuration API pour l'application
 * Gère les URLs de l'API selon l'environnement (développement/production)
 */

import axios from 'axios'

// Déterminer l'URL de base de l'API
const getApiBaseUrl = () => {
  try {
    // En production (Vercel), utiliser la variable d'environnement
    if (import.meta.env.PROD) {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://bella5768.pythonanywhere.com';
      return apiUrl;
    }
    
    // En développement, utiliser le proxy Vite (localhost:8000)
    return '';
  } catch (error) {
    console.error('Erreur lors de la configuration API:', error);
    return 'https://bella5768.pythonanywhere.com';
  }
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Crée une URL complète pour un endpoint API
 */
export const getApiUrl = (endpoint) => {
  try {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    if (API_BASE_URL) {
      return `${API_BASE_URL}${normalizedEndpoint}`;
    }
    
    return normalizedEndpoint;
  } catch (error) {
    console.error('Erreur lors de la création de l\'URL API:', error);
    return endpoint;
  }
};

// Configurer axios globalement
try {
  if (API_BASE_URL) {
    axios.defaults.baseURL = API_BASE_URL;
  }
  axios.defaults.timeout = 30000;
  axios.defaults.headers.common['Content-Type'] = 'application/json';
} catch (error) {
  console.error('Erreur lors de la configuration d\'axios:', error);
}

// Log pour le débogage
if (import.meta.env.DEV) {
  console.log('🔧 Configuration API:', {
    mode: import.meta.env.MODE,
    apiBaseUrl: API_BASE_URL || '(proxy Vite)',
  });
}

