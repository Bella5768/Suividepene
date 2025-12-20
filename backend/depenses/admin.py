from django.contrib import admin
from .models import (
    Categorie, SousCategorie, Prevision, Operation, Imputation,
    Plat, Menu, MenuPlat, FenetreCommande, RegleSubvention, Commande, CommandeLigne, Facture, UserPermission,
    ExtraRestauration
)


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'created_at']
    search_fields = ['nom', 'code']
    list_filter = ['created_at']


@admin.register(SousCategorie)
class SousCategorieAdmin(admin.ModelAdmin):
    list_display = ['nom', 'categorie', 'created_at']
    list_filter = ['categorie', 'created_at']
    search_fields = ['nom', 'categorie__nom']


@admin.register(Prevision)
class PrevisionAdmin(admin.ModelAdmin):
    list_display = ['mois', 'categorie', 'sous_categorie', 'montant_prevu', 'statut', 'created_by', 'created_at']
    list_filter = ['statut', 'mois', 'categorie']
    search_fields = ['categorie__nom', 'sous_categorie__nom']
    date_hierarchy = 'mois'
    readonly_fields = ['montant_impute', 'solde_restant']


@admin.register(Operation)
class OperationAdmin(admin.ModelAdmin):
    list_display = ['date_operation', 'categorie', 'sous_categorie', 'montant_depense', 'created_by', 'created_at']
    list_filter = ['date_operation', 'categorie', 'semaine_iso']
    search_fields = ['description', 'categorie__nom']
    date_hierarchy = 'date_operation'
    readonly_fields = ['montant_depense', 'jour', 'semaine_iso', 'ecart']


@admin.register(Imputation)
class ImputationAdmin(admin.ModelAdmin):
    list_display = ['operation', 'prevision', 'montant_impute', 'created_by', 'created_at']
    list_filter = ['created_at', 'prevision__mois']
    search_fields = ['operation__description', 'prevision__categorie__nom']


# ============================================================================
# ADMIN RESTAURATION / CANTINE
# ============================================================================

@admin.register(Plat)
class PlatAdmin(admin.ModelAdmin):
    list_display = ['nom', 'categorie_restau', 'prix_standard', 'actif', 'created_at']
    list_filter = ['categorie_restau', 'actif', 'created_at']
    search_fields = ['nom', 'description']
    ordering = ['categorie_restau', 'nom']


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ['date_menu', 'est_publie', 'publication_at', 'created_at']
    list_filter = ['publication_at', 'created_at']
    search_fields = ['date_menu']
    date_hierarchy = 'date_menu'
    readonly_fields = ['est_publie']


class MenuPlatInline(admin.TabularInline):
    model = MenuPlat
    extra = 1
    fields = ['plat', 'prix_jour', 'stock_max', 'ordre']


@admin.register(MenuPlat)
class MenuPlatAdmin(admin.ModelAdmin):
    list_display = ['menu', 'plat', 'prix_jour', 'stock_max', 'ordre']
    list_filter = ['menu__date_menu']
    search_fields = ['plat__nom', 'menu__date_menu']
    raw_id_fields = ['menu', 'plat']


@admin.register(FenetreCommande)
class FenetreCommandeAdmin(admin.ModelAdmin):
    list_display = ['categorie_restau', 'heure_limite', 'actif']
    list_filter = ['actif', 'categorie_restau']
    search_fields = ['categorie_restau']


@admin.register(RegleSubvention)
class RegleSubventionAdmin(admin.ModelAdmin):
    list_display = ['type_subvention', 'valeur', 'plafond_par_jour', 'actif', 'effectif_de', 'effectif_a']
    list_filter = ['type_subvention', 'actif', 'effectif_de']
    search_fields = ['type_subvention']


class CommandeLigneInline(admin.TabularInline):
    model = CommandeLigne
    extra = 0
    readonly_fields = ['montant_ligne']
    fields = ['menu_plat', 'quantite', 'prix_unitaire', 'montant_ligne']


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = ['utilisateur', 'date_commande', 'etat', 'montant_brut', 'montant_subvention', 'montant_net', 'created_at']
    list_filter = ['etat', 'date_commande', 'created_at']
    search_fields = ['utilisateur__username', 'date_commande']
    date_hierarchy = 'date_commande'
    readonly_fields = ['montant_brut', 'montant_subvention', 'montant_net']
    inlines = [CommandeLigneInline]
    raw_id_fields = ['utilisateur', 'operation']


@admin.register(CommandeLigne)
class CommandeLigneAdmin(admin.ModelAdmin):
    list_display = ['commande', 'menu_plat', 'quantite', 'prix_unitaire', 'montant_ligne']
    list_filter = ['commande__date_commande', 'commande__etat']
    search_fields = ['commande__utilisateur__username', 'menu_plat__plat__nom']
    raw_id_fields = ['commande', 'menu_plat']
    readonly_fields = ['montant_ligne']


@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):
    list_display = ['numero_facture', 'date_facture', 'total_commandes', 'total_net', 'total_supplement', 'genere_le']
    list_filter = ['date_facture', 'genere_le']
    search_fields = ['numero_facture', 'date_facture']
    date_hierarchy = 'date_facture'
    readonly_fields = ['numero_facture', 'total_commandes', 'total_brut', 'total_subvention', 'total_net', 'total_supplement', 'genere_le', 'modifie_le']


@admin.register(ExtraRestauration)
class ExtraRestaurationAdmin(admin.ModelAdmin):
    list_display = ['date_operation', 'type_extra', 'nom_personne', 'plat_nom', 'quantite', 'prix_unitaire', 'montant_total', 'created_by', 'created_at']
    list_filter = ['type_extra', 'date_operation', 'created_at']
    search_fields = ['nom_personne', 'plat_nom', 'description']
    date_hierarchy = 'date_operation'
    readonly_fields = ['montant_total', 'operation', 'created_by', 'created_at', 'updated_at']
    fieldsets = (
        ('Informations principales', {
            'fields': ('type_extra', 'nom_personne', 'date_operation')
        }),
        ('Détails de la commande', {
            'fields': ('plat_nom', 'quantite', 'prix_unitaire', 'montant_total', 'description')
        }),
        ('Opération budgétaire', {
            'fields': ('operation',),
            'classes': ('collapse',)
        }),
        ('Métadonnées', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserPermission)
class UserPermissionAdmin(admin.ModelAdmin):
    list_display = ['utilisateur', 'fonctionnalite', 'peut_voir', 'peut_creer', 'peut_modifier', 'peut_supprimer', 'modifie_le']
    list_filter = ['fonctionnalite', 'peut_voir', 'peut_creer', 'peut_modifier', 'peut_supprimer']
    search_fields = ['utilisateur__username', 'fonctionnalite']
    raw_id_fields = ['utilisateur']


