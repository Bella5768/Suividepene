/**
 * Formate un montant en Franc Guinéen (GNF)
 * @param {number|string} amount - Montant à formater
 * @param {boolean} showSymbol - Afficher le symbole (défaut: true)
 * @returns {string} Montant formaté
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || amount === '' || isNaN(amount)) {
    return showSymbol ? '0,00 GNF' : '0,00';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Format avec séparateur de milliers (espace) et virgule pour les décimales
  const formatted = numAmount.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return showSymbol ? `${formatted} GNF` : formatted;
};

/**
 * Formate un montant avec le symbole GNF
 * @param {number} amount - Montant à formater
 * @returns {string} Montant formaté avec GNF
 */
export const formatGNF = (amount) => {
  return formatCurrency(amount, true);
};

