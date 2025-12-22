/**
 * Système de notifications toast (remplace react-toastify)
 */

const TOAST_DURATION = 3000; // 3 secondes

/**
 * Crée et affiche un toast
 * @param {string} message - Message à afficher
 * @param {string} type - Type de toast: 'success', 'error', 'info', 'warning'
 */
export const showToast = (message, type = 'info') => {
  const container = document.getElementById('toast-container');
  if (!container) {
    console.error('Toast container not found');
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Ajouter l'icône selon le type
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };
  toast.textContent = `${icons[type] || ''} ${message}`;

  container.appendChild(toast);

  // Animation d'entrée
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Supprimer après la durée
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, TOAST_DURATION);
};

// Méthodes de convenance
export const toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  info: (message) => showToast(message, 'info'),
  warning: (message) => showToast(message, 'warning'),
};

