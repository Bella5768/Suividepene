/**
 * Routeur vanilla JS (remplace react-router-dom)
 */

class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.notFoundHandler = null;
    
    // Écouter les changements d'URL
    window.addEventListener('popstate', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  /**
   * Ajouter une route
   */
  addRoute(path, handler, requiresAuth = false) {
    this.routes.push({
      path,
      handler,
      requiresAuth,
      regex: this.pathToRegex(path),
      keys: this.extractKeys(path),
    });
  }

  /**
   * Définir le handler 404
   */
  setNotFound(handler) {
    this.notFoundHandler = handler;
  }

  /**
   * Convertir un chemin en regex
   */
  pathToRegex(path) {
    const escapedPath = path
      .replace(/\//g, '\\/')
      .replace(/:(\w+)/g, '([^/]+)');
    return new RegExp(`^${escapedPath}$`);
  }

  /**
   * Extraire les clés de paramètres d'un chemin
   */
  extractKeys(path) {
    const keys = [];
    const matches = path.matchAll(/:(\w+)/g);
    for (const match of matches) {
      keys.push(match[1]);
    }
    return keys;
  }

  /**
   * Obtenir les paramètres d'une route
   */
  getParams(route, pathname) {
    const matches = pathname.match(route.regex);
    if (!matches) return null;

    const params = {};
    route.keys.forEach((key, index) => {
      params[key] = matches[index + 1];
    });
    return params;
  }

  /**
   * Gérer la route actuelle
   */
  async handleRoute() {
    const pathname = window.location.pathname;
    
    // Trouver la route correspondante
    for (const route of this.routes) {
      if (route.regex.test(pathname)) {
        const params = this.getParams(route, pathname);
        
        // Vérifier l'authentification si nécessaire
        if (route.requiresAuth) {
          const { authService } = await import('./services/auth.js');
          if (!authService.isAuthenticated()) {
            this.navigate('/login');
            return;
          }
        }
        
        this.currentRoute = { route, params, pathname };
        await route.handler(params);
        return;
      }
    }

    // Route non trouvée
    if (this.notFoundHandler) {
      await this.notFoundHandler();
    } else {
      console.error('Route not found:', pathname);
    }
  }

  /**
   * Naviguer vers une route
   */
  navigate(path, replace = false) {
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    this.handleRoute();
  }

  /**
   * Obtenir la route actuelle
   */
  getCurrentRoute() {
    return this.currentRoute;
  }
}

export const router = new Router();

