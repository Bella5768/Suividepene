from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.db.models import Sum
from django.utils import timezone
from decimal import Decimal
import calendar
from datetime import datetime


class Categorie(models.Model):
    """Catégorie principale des dépenses"""
    nom = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Catégorie"
        verbose_name_plural = "Catégories"
        ordering = ['nom']

    def __str__(self):
        return f"{self.code} - {self.nom}"


class SousCategorie(models.Model):
    """Sous-catégorie rattachée à une catégorie"""
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE, related_name='sous_categories')
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Sous-catégorie"
        verbose_name_plural = "Sous-catégories"
        unique_together = ['categorie', 'nom']
        ordering = ['categorie', 'nom']

    def __str__(self):
        return f"{self.categorie.code} - {self.nom}"


class Prevision(models.Model):
    """Prévision mensuelle par catégorie/sous-catégorie"""
    STATUT_CHOICES = [
        ('draft', 'Brouillon'),
        ('validated', 'Validée'),
        ('closed', 'Clôturée'),
    ]

    mois = models.DateField(help_text="Premier jour du mois")
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE, related_name='previsions')
    sous_categorie = models.ForeignKey(SousCategorie, on_delete=models.CASCADE, related_name='previsions', null=True, blank=True)
    montant_prevu = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='draft')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='previsions_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Prévision"
        verbose_name_plural = "Prévisions"
        unique_together = ['mois', 'categorie', 'sous_categorie']
        ordering = ['-mois', 'categorie', 'sous_categorie']
        indexes = [
            models.Index(fields=['mois']),
            models.Index(fields=['categorie']),
            models.Index(fields=['mois', 'categorie']),
        ]

    def __str__(self):
        mois_str = self.mois.strftime('%Y-%m')
        sous_cat = f" - {self.sous_categorie.nom}" if self.sous_categorie else ""
        return f"{mois_str} - {self.categorie.code}{sous_cat} - {self.montant_prevu} GNF"

    @property
    def montant_impute(self):
        """Montant total déjà imputé sur cette prévision"""
        from django.db.models import Sum
        total = self.imputations.aggregate(total=Sum('montant_impute'))['total']
        return total if total is not None else Decimal('0.00')

    @property
    def solde_restant(self):
        """Solde restant disponible pour imputation"""
        return self.montant_prevu - self.montant_impute


class Operation(models.Model):
    """Opération de dépense journalière"""
    date_operation = models.DateField()
    jour = models.IntegerField(help_text="Jour du mois (1-31)")
    semaine_iso = models.IntegerField(help_text="Numéro de semaine ISO (1-53)")
    categorie = models.ForeignKey(Categorie, on_delete=models.PROTECT, related_name='operations')
    sous_categorie = models.ForeignKey(SousCategorie, on_delete=models.PROTECT, related_name='operations', null=True, blank=True)
    unites = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Nombre d'unités"
    )
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    montant_depense = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Montant total dépensé (calculé automatiquement)"
    )
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='operations_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Opération"
        verbose_name_plural = "Opérations"
        ordering = ['-date_operation', '-created_at']
        indexes = [
            models.Index(fields=['date_operation']),
            models.Index(fields=['categorie', 'sous_categorie']),
            models.Index(fields=['semaine_iso']),
        ]

    def __str__(self):
        return f"{self.date_operation} - {self.categorie.code} - {self.montant_depense} GNF"

    def save(self, *args, **kwargs):
        """Calcul automatique du montant dépensé et extraction du jour/semaine"""
        # Calcul automatique du montant
        self.montant_depense = self.unites * self.prix_unitaire
        
        # Extraction du jour
        self.jour = self.date_operation.day
        
        # Calcul de la semaine ISO
        self.semaine_iso = self.date_operation.isocalendar()[1]
        
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Créer automatiquement une imputation si c'est une nouvelle opération
        if is_new:
            self.create_imputation_if_needed()

    @property
    def ecart(self):
        """Écart par rapport à la prévision du mois (si existe)"""
        # Trouver la prévision correspondante pour le mois de l'opération
        mois_prevision = self.date_operation.replace(day=1)
        try:
            # Utiliser filter().first() au lieu de get() pour éviter MultipleObjectsReturned
            prevision = Prevision.objects.filter(
                mois=mois_prevision,
                categorie=self.categorie,
                sous_categorie=self.sous_categorie
            ).first()
            
            if prevision:
                montant_prev = prevision.montant_prevu
                # Calculer l'écart (peut être négatif si dépense > prévu)
                return self.montant_depense - montant_prev
            return None
        except Exception:
            return None

    def create_imputation_if_needed(self):
        """Créer automatiquement une imputation si une prévision correspondante existe"""
        # Import ici pour éviter les imports circulaires
        from django.apps import apps
        Imputation = apps.get_model('depenses', 'Imputation')
        
        mois_prevision = self.date_operation.replace(day=1)
        
        # Chercher une prévision correspondante
        prevision = Prevision.objects.filter(
            mois=mois_prevision,
            categorie=self.categorie,
            sous_categorie=self.sous_categorie
        ).first()
        
        if prevision and self.created_by:
            # Vérifier si l'imputation n'existe pas déjà
            imputation, created = Imputation.objects.get_or_create(
                operation=self,
                prevision=prevision,
                defaults={
                    'montant_impute': min(self.montant_depense, prevision.solde_restant),
                    'created_by': self.created_by
                }
            )
            
            # Si l'imputation existe déjà, mettre à jour le montant si nécessaire
            if not created and imputation.montant_impute < self.montant_depense:
                imputation.montant_impute = min(self.montant_depense, prevision.solde_restant)
                imputation.save()
            
            return imputation
        return None


class Imputation(models.Model):
    """Imputation d'une opération sur une prévision (multi-imputation)"""
    operation = models.ForeignKey(Operation, on_delete=models.CASCADE, related_name='imputations')
    prevision = models.ForeignKey(Prevision, on_delete=models.CASCADE, related_name='imputations')
    montant_impute = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='imputations_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Imputation"
        verbose_name_plural = "Imputations"
        unique_together = ['operation', 'prevision']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.operation} -> {self.prevision} ({self.montant_impute} GNF)"

    def clean(self):
        """Validation : vérifier que le montant imputé ne dépasse pas le solde restant"""
        from django.core.exceptions import ValidationError
        if self.montant_impute > self.prevision.solde_restant:
            raise ValidationError(
                f"Le montant imputé ({self.montant_impute} GNF) dépasse le solde restant "
                f"de la prévision ({self.prevision.solde_restant} GNF)"
            )


# ============================================================================
# MODÈLES RESTAURATION / CANTINE
# ============================================================================

class Plat(models.Model):
    """Référentiel des plats disponibles"""
    CATEGORIE_RESTAU_CHOICES = [
        ('PetitDej', 'Petit-déjeuner'),
        ('Dejeuner', 'Déjeuner'),
        ('Diner', 'Dîner'),
        ('Snack', 'Collation'),
    ]
    
    nom = models.CharField(max_length=150)
    description = models.TextField(blank=True, max_length=500)
    categorie_restau = models.CharField(max_length=20, choices=CATEGORIE_RESTAU_CHOICES)
    prix_standard = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Prix catalogue standard (GNF)"
    )
    actif = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Plat"
        verbose_name_plural = "Plats"
        ordering = ['categorie_restau', 'nom']
    
    def __str__(self):
        return f"{self.nom} ({self.get_categorie_restau_display()}) - {self.prix_standard} GNF"


class Menu(models.Model):
    """Menu du jour / par date"""
    date_menu = models.DateField(unique=True, help_text="Date du menu (ex: 2026-01-18)")
    publication_at = models.DateTimeField(null=True, blank=True, help_text="Date de publication")
    token_public = models.CharField(max_length=64, unique=True, null=True, blank=True, help_text="Token pour accès public")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Menu"
        verbose_name_plural = "Menus"
        ordering = ['-date_menu']
    
    def __str__(self):
        return f"Menu du {self.date_menu.strftime('%d/%m/%Y')}"
    
    def save(self, *args, **kwargs):
        """Générer un token unique si le menu est publié et n'en a pas"""
        import secrets
        if self.publication_at and not self.token_public:
            self.token_public = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)
    
    @property
    def est_publie(self):
        """Vérifie si le menu est publié"""
        return self.publication_at is not None
    
    def get_lien_public(self):
        """Génère le lien public pour commander"""
        if self.token_public:
            # Utiliser l'URL de la requête si disponible, sinon localhost
            return f"/commander/{self.token_public}"
        return None


class MenuPlat(models.Model):
    """Association Menu ↔ Plats avec prix/stock du jour"""
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='menu_plats')
    plat = models.ForeignKey(Plat, on_delete=models.CASCADE, related_name='menu_plats')
    prix_jour = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Prix du jour (peut différer du prix standard)"
    )
    stock_max = models.IntegerField(null=True, blank=True, help_text="Stock maximum (NULL = illimité)")
    ordre = models.IntegerField(default=0, help_text="Ordre d'affichage")
    
    class Meta:
        verbose_name = "Plat du Menu"
        verbose_name_plural = "Plats du Menu"
        unique_together = ['menu', 'plat']
        ordering = ['ordre', 'plat__nom']
    
    def __str__(self):
        return f"{self.menu} - {self.plat.nom}"
    
    def get_stock_restant(self):
        """Calcule le stock restant pour ce plat du menu"""
        if self.stock_max is None:
            return None  # Illimité
        
        # Import ici pour éviter les références circulaires
        from django.apps import apps
        CommandeLigne = apps.get_model('depenses', 'CommandeLigne')
        
        total_commandes = CommandeLigne.objects.filter(
            menu_plat=self,
            commande__etat__in=['brouillon', 'validee', 'livree']
        ).aggregate(total=Sum('quantite'))['total'] or 0
        
        return max(0, self.stock_max - total_commandes)


class FenetreCommande(models.Model):
    """Configuration des fenêtres de commande par créneau"""
    CATEGORIE_RESTAU_CHOICES = [
        ('PetitDej', 'Petit-déjeuner'),
        ('Dejeuner', 'Déjeuner'),
        ('Diner', 'Dîner'),
        ('Snack', 'Collation'),
    ]
    
    categorie_restau = models.CharField(max_length=20, choices=CATEGORIE_RESTAU_CHOICES, unique=True)
    heure_limite = models.TimeField(help_text="Heure limite pour commander (ex: 10:00)")
    actif = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "Fenêtre de Commande"
        verbose_name_plural = "Fenêtres de Commande"
        ordering = ['categorie_restau']
    
    def __str__(self):
        return f"{self.get_categorie_restau_display()} - Limite: {self.heure_limite}"
    
    @classmethod
    def est_dans_fenetre(cls, categorie_restau, date_commande=None, est_public=False):
        """Vérifie si on est dans la fenêtre de commande pour un créneau
        
        Args:
            categorie_restau: Catégorie de restauration
            date_commande: Date de la commande (par défaut: aujourd'hui)
            est_public: Si True, applique la restriction 13h00 GMT pour les commandes publiques
        """
        from django.utils import timezone
        from datetime import time
        
        if date_commande is None:
            date_commande = timezone.now().date()
        
        # Pour les commandes publiques, vérifier la limite de 13h00 GMT
        if est_public:
            # Heure limite pour les commandes publiques: 13h00 GMT
            heure_limite_public = time(13, 0, 0)
            heure_actuelle = timezone.now().time()
            
            # Si la date de commande est aujourd'hui
            if date_commande == timezone.now().date():
                return heure_actuelle <= heure_limite_public
            # Si la date est dans le futur, on accepte
            elif date_commande > timezone.now().date():
                return True
            # Si la date est dans le passé, on refuse
            else:
                return False
        
        # Pour les commandes authentifiées, appliquer la restriction horaire
        # Limite par défaut: 13h00 GMT si aucune fenêtre n'est configurée
        try:
            fenetre = cls.objects.get(categorie_restau=categorie_restau, actif=True)
            heure_limite = fenetre.heure_limite
        except cls.DoesNotExist:
            # Si pas de fenêtre configurée, utiliser la limite par défaut de 13h00 GMT
            heure_limite = time(13, 0, 0)
        
        heure_actuelle = timezone.now().time()
        
        # Si la date de commande est aujourd'hui
        if date_commande == timezone.now().date():
            return heure_actuelle <= heure_limite
        # Si la date est dans le futur, on accepte
        elif date_commande > timezone.now().date():
            return True
        # Si la date est dans le passé, on refuse
        else:
            return False


class RegleSubvention(models.Model):
    """Règles de subvention restauration"""
    TYPE_SUBVENTION_CHOICES = [
        ('AUCUNE', 'Aucune subvention'),
        ('FIXE', 'Montant fixe par plat'),
        ('POURCENT', 'Pourcentage du montant'),
    ]
    
    type_subvention = models.CharField(
        max_length=20,
        choices=TYPE_SUBVENTION_CHOICES,
        default='AUCUNE'
    )
    valeur = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Montant fixe (GNF) ou pourcentage (0-100)"
    )
    plafond_par_jour = models.IntegerField(
        null=True,
        blank=True,
        help_text="Nombre maximum de plats subventionnés par jour"
    )
    actif = models.BooleanField(default=True)
    effectif_de = models.DateField(null=True, blank=True, help_text="Date de début de validité")
    effectif_a = models.DateField(null=True, blank=True, help_text="Date de fin de validité")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Règle de Subvention"
        verbose_name_plural = "Règles de Subvention"
        ordering = ['-effectif_de', '-created_at']
    
    def __str__(self):
        return f"{self.get_type_subvention_display()} - {self.valeur or 'N/A'} GNF"
    
    def est_valide(self, date=None):
        """Vérifie si la règle est valide pour une date donnée"""
        if not self.actif:
            return False
        
        if date is None:
            date = timezone.now().date()
        
        if self.effectif_de and date < self.effectif_de:
            return False
        
        if self.effectif_a and date > self.effectif_a:
            return False
        
        return True


class Commande(models.Model):
    """Commandes d'un employé pour une date"""
    ETAT_CHOICES = [
        ('brouillon', 'Brouillon'),
        ('validee', 'Validée'),
        ('annulee', 'Annulée'),
        ('livree', 'Livrée'),
    ]
    
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='commandes')
    date_commande = models.DateField(help_text="Date de consommation")
    etat = models.CharField(max_length=20, choices=ETAT_CHOICES, default='brouillon')
    montant_brut = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Montant total avant subvention"
    )
    montant_subvention = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Montant de la subvention"
    )
    montant_net = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        default=Decimal('0.00'),
        help_text="Montant net à imputer au budget (brut - subvention)"
    )
    operation = models.ForeignKey(
        Operation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='commandes',
        help_text="Opération budgétaire liée (créée à la validation)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Commande"
        verbose_name_plural = "Commandes"
        unique_together = ['utilisateur', 'date_commande']
        ordering = ['-date_commande', '-created_at']
        indexes = [
            models.Index(fields=['utilisateur']),
            models.Index(fields=['date_commande']),
            models.Index(fields=['utilisateur', 'date_commande']),
            models.Index(fields=['etat']),
        ]
    
    def __str__(self):
        return f"Commande {self.utilisateur.username} - {self.date_commande} ({self.etat})"
    
    def calculer_montants(self):
        """Calcule les montants brut, subvention et net"""
        lignes = self.lignes.all()
        
        # Montant brut = somme de toutes les lignes
        self.montant_brut = sum(ligne.montant_ligne for ligne in lignes)
        
        # Calcul de la subvention (nécessite montant_brut)
        self.montant_subvention = self._calculer_subvention(self.montant_brut)
        
        # Montant net = brut - subvention
        self.montant_net = self.montant_brut - self.montant_subvention
        
        return {
            'brut': self.montant_brut,
            'subvention': self.montant_subvention,
            'net': self.montant_net
        }
    
    def _calculer_subvention(self, montant_brut=None):
        """Calcule la subvention selon les règles actives"""
        if montant_brut is None:
            montant_brut = self.montant_brut
        
        # Récupérer la règle active pour la date de commande
        regle = RegleSubvention.objects.filter(
            actif=True,
            effectif_de__lte=self.date_commande,
            effectif_a__gte=self.date_commande
        ).first()
        
        if not regle or regle.type_subvention == 'AUCUNE':
            return Decimal('0.00')
        
        lignes = self.lignes.all()
        nb_plats = sum(ligne.quantite for ligne in lignes)
        
        if regle.type_subvention == 'FIXE':
            # Subvention fixe par plat, plafonnée si nécessaire
            nb_subventionnables = nb_plats
            if regle.plafond_par_jour:
                nb_subventionnables = min(nb_plats, regle.plafond_par_jour)
            return regle.valeur * nb_subventionnables
        
        elif regle.type_subvention == 'POURCENT':
            # Pourcentage du montant brut
            subvention = (montant_brut * regle.valeur) / 100
            return subvention
        
        return Decimal('0.00')


class CommandeLigne(models.Model):
    """Détails d'une commande (lignes)"""
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name='lignes')
    menu_plat = models.ForeignKey(MenuPlat, on_delete=models.CASCADE, related_name='commande_lignes')
    quantite = models.IntegerField(validators=[MinValueValidator(1)])
    prix_unitaire = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Prix unitaire au moment de la commande"
    )
    
    class Meta:
        verbose_name = "Ligne de Commande"
        verbose_name_plural = "Lignes de Commande"
        ordering = ['commande', 'menu_plat__ordre']
        indexes = [
            models.Index(fields=['commande']),
            models.Index(fields=['menu_plat']),
        ]
    
    def __str__(self):
        return f"{self.commande} - {self.menu_plat.plat.nom} x{self.quantite}"
    
    @property
    def prix_effectif(self):
        """Calcule le prix effectif: si prix > 30000, utilise 30000, sinon utilise le prix réel"""
        if self.prix_unitaire > 30000:
            return Decimal('30000.00')
        return self.prix_unitaire
    
    @property
    def supplement(self):
        """Calcule le supplément à payer si le prix dépasse 30000 GNF"""
        if self.prix_unitaire > 30000:
            return (self.prix_unitaire - Decimal('30000.00')) * self.quantite
        return Decimal('0.00')
    
    @property
    def montant_ligne(self):
        """Calcule le montant de la ligne (quantité × prix effectif)"""
        return self.quantite * self.prix_effectif


class Facture(models.Model):
    """Facture journalière des commandes de restauration"""
    date_facture = models.DateField(unique=True, help_text="Date de la facture (une facture par jour)")
    numero_facture = models.CharField(max_length=50, unique=True, help_text="Numéro unique de la facture")
    total_commandes = models.IntegerField(default=0, help_text="Nombre total de commandes")
    total_brut = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal('0.00'))
    total_subvention = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal('0.00'))
    total_net = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal('0.00'))
    total_supplement = models.DecimalField(max_digits=18, decimal_places=2, default=Decimal('0.00'), help_text="Total des suppléments (> 30 000 GNF)")
    fichier_pdf = models.FileField(upload_to='factures/', blank=True, null=True, help_text="Fichier PDF de la facture")
    genere_le = models.DateTimeField(auto_now_add=True)
    modifie_le = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Facture"
        verbose_name_plural = "Factures"
        ordering = ['-date_facture']
    
    def __str__(self):
        return f"Facture {self.numero_facture} - {self.date_facture}"
    
    @staticmethod
    def generer_numero(date_facture):
        """Génère un numéro de facture unique basé sur la date"""
        return f"FACT-{date_facture.strftime('%Y%m%d')}"
    
    def calculer_totaux(self):
        """Calcule les totaux à partir des commandes de la date"""
        from django.db.models import Sum, Count, Q
        
        commandes = Commande.objects.filter(
            date_commande=self.date_facture,
            etat='validee'
        )
        
        self.total_commandes = commandes.count()
        self.total_brut = commandes.aggregate(Sum('montant_brut'))['montant_brut__sum'] or Decimal('0.00')
        self.total_subvention = commandes.aggregate(Sum('montant_subvention'))['montant_subvention__sum'] or Decimal('0.00')
        self.total_net = commandes.aggregate(Sum('montant_net'))['montant_net__sum'] or Decimal('0.00')
        
        # Calculer le total des suppléments (différence entre prix réel et prix effectif pour plats >= 50000)
        total_supplement = Decimal('0.00')
        for commande in commandes:
            for ligne in commande.lignes.all():
                if ligne.prix_unitaire >= 50000:
                    # Supplément = (prix réel - prix effectif) × quantité
                    supplement = (ligne.prix_unitaire - ligne.prix_effectif) * ligne.quantite
                    total_supplement += supplement
        
        self.total_supplement = total_supplement
        self.save()


class UserPermission(models.Model):
    """Permissions personnalisées par utilisateur pour les fonctionnalités du menu"""
    FONCTIONNALITE_CHOICES = [
        ('dashboard', 'Tableau de bord'),
        ('operations', 'Opérations'),
        ('previsions', 'Prévisions'),
        ('imputations', 'Imputations'),
        ('rapports', 'Rapports'),
        ('categories', 'Catégories'),
        ('utilisateurs', 'Utilisateurs'),
        ('audit', 'Audit'),
        ('restauration_commandes', 'Commander (Restauration)'),
        ('restauration_valider_commandes', 'Valider les Commandes (Restauration)'),
        ('restauration_menus', 'Menus (Restauration)'),
        ('restauration_plats', 'Plats (Restauration)'),
        ('tableau_bord_cantine', 'Tableau de Bord Cantine'),
        ('extras_restauration', 'Extras Restauration (Visiteurs/Stagiaires)'),
    ]
    
    utilisateur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='permissions')
    fonctionnalite = models.CharField(max_length=50, choices=FONCTIONNALITE_CHOICES)
    peut_voir = models.BooleanField(default=True, help_text="Peut voir cette fonctionnalité dans le menu")
    peut_creer = models.BooleanField(default=False, help_text="Peut créer des éléments")
    peut_modifier = models.BooleanField(default=False, help_text="Peut modifier des éléments")
    peut_supprimer = models.BooleanField(default=False, help_text="Peut supprimer des éléments")
    cree_le = models.DateTimeField(auto_now_add=True)
    modifie_le = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Permission Utilisateur"
        verbose_name_plural = "Permissions Utilisateurs"
        unique_together = ['utilisateur', 'fonctionnalite']
        ordering = ['utilisateur', 'fonctionnalite']
    
    def __str__(self):
        return f"{self.utilisateur.username} - {self.get_fonctionnalite_display()}"


class ExtraRestauration(models.Model):
    """Opérations de restauration pour les personnes externes (visiteurs, stagiaires, activités)"""
    TYPE_EXTRA_CHOICES = [
        ('visiteur', 'Visiteur'),
        ('stagiaire', 'Stagiaire'),
        ('activite', 'Activité'),
    ]
    
    type_extra = models.CharField(max_length=20, choices=TYPE_EXTRA_CHOICES, help_text="Type de personne externe")
    nom_personne = models.CharField(max_length=200, help_text="Nom de la personne ou nom de l'activité")
    date_operation = models.DateField(help_text="Date de l'opération")
    plat_nom = models.CharField(max_length=200, help_text="Nom du plat commandé")
    quantite = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        default=Decimal('1.00'),
        help_text="Quantité de plats"
    )
    prix_unitaire = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Prix unitaire du plat (GNF)"
    )
    montant_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))],
        help_text="Montant total (calculé automatiquement)"
    )
    description = models.TextField(blank=True, help_text="Description supplémentaire")
    operation = models.OneToOneField(
        Operation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='extra_restauration',
        help_text="Opération budgétaire liée"
    )
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='extras_restauration_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Extra Restauration"
        verbose_name_plural = "Extras Restauration"
        ordering = ['-date_operation', '-created_at']
        indexes = [
            models.Index(fields=['date_operation']),
            models.Index(fields=['type_extra']),
        ]
    
    def __str__(self):
        return f"{self.get_type_extra_display()} - {self.nom_personne} - {self.date_operation} - {self.montant_total} GNF"
    
    def save(self, *args, **kwargs):
        """Calcul automatique du montant total"""
        self.montant_total = self.quantite * self.prix_unitaire
        super().save(*args, **kwargs)
    
    def creer_operation(self, user=None):
        """Crée automatiquement l'opération budgétaire liée à la catégorie RESTAURATION"""
        import logging
        from decimal import Decimal
        
        logger = logging.getLogger(__name__)
        
        try:
            # S'assurer que l'extra a un ID (doit être sauvegardé avant)
            if not self.pk:
                raise ValueError("L'extra doit être sauvegardé avant de créer l'opération")
            
            # Récupérer ou créer la catégorie RESTAURATION
            categorie_restauration = Categorie.objects.filter(code='RESTAURATION').first()
            if not categorie_restauration:
                categorie_restauration = Categorie.objects.create(
                    nom='Restauration',
                    code='RESTAURATION',
                    description='Dépenses de restauration/cantine'
                )
                logger.info(f"Catégorie RESTAURATION créée: {categorie_restauration.id}")
            
            # S'assurer que les valeurs sont des Decimal
            quantite = Decimal(str(self.quantite))
            prix_unitaire = Decimal(str(self.prix_unitaire))
            
            # Créer l'opération (la méthode save() de Operation créera automatiquement l'imputation si nécessaire)
            operation = Operation.objects.create(
                date_operation=self.date_operation,
                categorie=categorie_restauration,
                sous_categorie=None,
                unites=quantite,
                prix_unitaire=prix_unitaire,
                description=f"{self.get_type_extra_display()} - {self.nom_personne}: {self.plat_nom}",
                created_by=user or self.created_by
            )
            logger.info(f"Opération créée: {operation.id} pour extra {self.pk}")
            
            # Lier l'opération à l'extra (utiliser update pour éviter de recalculer montant_total)
            ExtraRestauration.objects.filter(pk=self.pk).update(operation=operation)
            # Recharger l'objet pour avoir la relation chargée
            self.refresh_from_db()
            
            return operation
        except Exception as e:
            logger.error(f"Erreur dans creer_operation pour extra {getattr(self, 'pk', 'N/A')}: {str(e)}", exc_info=True)
            raise


class TicketRepas(models.Model):
    """Tickets de repas pour les travailleurs"""
    STATUT_CHOICES = [
        ('disponible', 'Disponible'),
        ('utilise', 'Utilisé'),
        ('annule', 'Annulé'),
    ]
    
    code_unique = models.CharField(
        max_length=20,
        unique=True,
        help_text="Code unique du ticket (ex: TKT-2026-XXXX)"
    )
    lot = models.ForeignKey(
        'LotTickets',
        on_delete=models.CASCADE,
        related_name='tickets',
        help_text="Lot auquel appartient ce ticket"
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='disponible'
    )
    date_utilisation = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Date et heure d'utilisation du ticket"
    )
    utilisateur_beneficiaire = models.CharField(
        max_length=200,
        blank=True,
        help_text="Nom du travailleur bénéficiaire"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Ticket Repas"
        verbose_name_plural = "Tickets Repas"
        ordering = ['-created_at', 'code_unique']
        indexes = [
            models.Index(fields=['code_unique']),
            models.Index(fields=['statut']),
            models.Index(fields=['lot']),
        ]
    
    def __str__(self):
        return f"{self.code_unique} - {self.get_statut_display()}"
    
    @classmethod
    def generer_code_unique(cls):
        """Génère un code unique pour un ticket"""
        import uuid
        from django.utils import timezone
        annee = timezone.now().year
        # Générer un code aléatoire de 8 caractères
        code_aleatoire = uuid.uuid4().hex[:8].upper()
        code = f"TKT-{annee}-{code_aleatoire}"
        # S'assurer que le code est unique
        while cls.objects.filter(code_unique=code).exists():
            code_aleatoire = uuid.uuid4().hex[:8].upper()
            code = f"TKT-{annee}-{code_aleatoire}"
        return code
    
    def marquer_utilise(self, beneficiaire=None):
        """Marque le ticket comme utilisé"""
        from django.utils import timezone
        if self.statut != 'disponible':
            raise ValueError(f"Le ticket {self.code_unique} n'est pas disponible (statut: {self.statut})")
        self.statut = 'utilise'
        self.date_utilisation = timezone.now()
        if beneficiaire:
            self.utilisateur_beneficiaire = beneficiaire
        self.save()


class LotTickets(models.Model):
    """Lot de tickets générés ensemble"""
    nom = models.CharField(
        max_length=100,
        help_text="Nom descriptif du lot (ex: 'Lot Janvier 2026')"
    )
    description = models.TextField(
        blank=True,
        help_text="Description ou notes sur ce lot"
    )
    nombre_tickets = models.PositiveIntegerField(
        help_text="Nombre de tickets dans ce lot"
    )
    date_validite = models.DateField(
        null=True,
        blank=True,
        help_text="Date limite de validité des tickets"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='lots_tickets_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Lot de Tickets"
        verbose_name_plural = "Lots de Tickets"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.nom} ({self.nombre_tickets} tickets)"
    
    @property
    def tickets_disponibles(self):
        """Retourne le nombre de tickets disponibles dans ce lot"""
        return self.tickets.filter(statut='disponible').count()
    
    @property
    def tickets_utilises(self):
        """Retourne le nombre de tickets utilisés dans ce lot"""
        return self.tickets.filter(statut='utilise').count()
    
    def generer_tickets(self):
        """Génère les tickets pour ce lot"""
        tickets_crees = []
        for _ in range(self.nombre_tickets):
            code = TicketRepas.generer_code_unique()
            ticket = TicketRepas.objects.create(
                code_unique=code,
                lot=self,
                statut='disponible'
            )
            tickets_crees.append(ticket)
        return tickets_crees

