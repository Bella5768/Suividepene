/**
 * Page de connexion
 */

import { authService } from '/static/depenses/js/services/auth.js';
import { router } from '/static/depenses/js/router.js';
import { toast } from '/static/depenses/js/utils/toast.js';

export async function renderLogin() {
  const app = document.getElementById('app');
  if (!app) return;

  // Si déjà connecté, rediriger
  if (authService.isAuthenticated()) {
    router.navigate('/dashboard');
    return;
  }

  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div style="text-align: center; margin-bottom: 2rem;">
          <img 
            src="/static/depenses/assets/logocsig.png" 
            alt="Logo Cité des Sciences et de l'Innovation" 
            style="max-width: 120px; height: auto; margin-bottom: 1rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));" 
          />
        </div>
        <h1>Gestion des Dépenses</h1>
        <p class="login-subtitle">Cité des Sciences et de l'Innovation</p>
        <form id="login-form">
          <div class="form-group">
            <label class="form-label">Nom d'utilisateur</label>
            <input
              type="text"
              class="form-input"
              id="username"
              required
              autofocus
            />
          </div>
          <div class="form-group">
            <label class="form-label">Mot de passe</label>
            <input
              type="password"
              class="form-input"
              id="password"
              required
            />
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            id="login-btn"
            style="width: 100%; margin-top: 1rem;"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  `;

  // Attacher les événements
  const form = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');
  let loading = false;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    loading = true;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Connexion...';

    const result = await authService.login(username, password);

    loading = false;
    loginBtn.disabled = false;
    loginBtn.textContent = 'Se connecter';

    if (result.success) {
      router.navigate('/dashboard');
    }
  });
}

