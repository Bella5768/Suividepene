/**
 * Configuration API pour l'application
 * Gère les URLs de l'API selon l'environnement (développement/production)
 */

// Déterminer l'URL de base de l'API
const getApiBaseUrl = () => {
  // En production (Vercel), utiliser la variable d'environnement
  if (import.meta.env.PROD) {
    // Vercel injecte les variables d'environnement avec le préfixe VITE_
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl || apiUrl === 'https://votre-backend-url.com') {
      console.warn('⚠️ VITE_API_URL non configurée correctement. Utilisez: https://bella5768.pythonanywhere.com');
      return 'https://bella5768.pythonanywhere.com';
    }
    return apiUrl;
  }
  
  // En développement, utiliser le proxy Vite (localhost:8000)
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Crée une URL complète pour un endpoint API
 * @param {string} endpoint - L'endpoint relatif (ex: '/api/operations/')
 * @returns {string} URL complète
 */
export const getApiUrl = (endpoint) => {
  // Si l'endpoint commence déjà par http, le retourner tel quel
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // S'assurer que l'endpoint commence par /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // En production, utiliser l'URL complète
  if (API_BASE_URL) {
    return `${API_BASE_URL}${normalizedEndpoint}`;
  }
  
  // En développement, utiliser le chemin relatif (proxy Vite)
  return normalizedEndpoint;
};

/**
 * Configuration axios pour la production
 * À utiliser dans les composants qui font des appels API directs
 */
export const axiosConfig = {
  baseURL: API_BASE_URL || undefined,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Log pour le débogage (uniquement en développement)
if (import.meta.env.DEV) {
  console.log('🔧 Configuration API:', {
    mode: import.meta.env.MODE,
    apiBaseUrl: API_BASE_URL || '(proxy Vite)',
    env: {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      PROD: import.meta.env.PROD,
      DEV: import.meta.env.DEV,
    },
  });
}

