/**
 * Configuration API pour l'application
 * Gère les URLs de l'API selon l'environnement (développement/production)
 */

// Déterminer l'URL de base de l'API
const getApiBaseUrl = () => {
  // En production, utiliser la variable d'environnement ou l'URL configurée
  if (window.API_BASE_URL) {
    return window.API_BASE_URL;
  }
  
  // En développement, utiliser le chemin relatif (proxy ou localhost:8000)
  // Si on est sur localhost:8000, utiliser le chemin relatif
  if (window.location.hostname === 'localhost' && window.location.port === '8000') {
    return '';
  }
  
  // Sinon, essayer de détecter depuis la configuration
  // Par défaut, utiliser le chemin relatif
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
  
  // En développement, utiliser le chemin relatif
  return normalizedEndpoint;
};

// Log pour le débogage (uniquement en développement)
if (window.location.hostname === 'localhost') {
  console.log('🔧 Configuration API:', {
    apiBaseUrl: API_BASE_URL || '(chemin relatif)',
    currentHost: window.location.host,
  });
}

