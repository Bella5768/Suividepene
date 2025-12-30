from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Categorie, SousCategorie, Prevision, Operation, Imputation,
    Plat, Menu, MenuPlat, FenetreCommande, RegleSubvention, Commande, CommandeLigne, UserPermission,
    ExtraRestauration
)


class UserPermissionSerializer(serializers.ModelSerializer):
    fonctionnalite_display = serializers.CharField(source='get_fonctionnalite_display', read_only=True)
    
    class Meta:
        model = UserPermission
        fields = ['id', 'fonctionnalite', 'fonctionnalite_display', 'peut_voir', 'peut_creer', 'peut_modifier', 'peut_supprimer']


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    permissions_input = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False,
        help_text="Liste des permissions à créer/modifier"
    )
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'is_active', 'password', 'date_joined', 'last_login', 'permissions', 'permissions_input']
        read_only_fields = ['date_joined', 'last_login']
    
    def get_permissions(self, obj):
        """Retourner les permissions sérialisées en lecture"""
        permissions = UserPermission.objects.filter(utilisateur=obj)
        return UserPermissionSerializer(permissions, many=True).data
    
    def create(self, validated_data):
        permissions_data = validated_data.pop('permissions_input', [])
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
        else:
            # Par défaut, mot de passe = username
            user.set_password(user.username)
        user.save()
        
        # Créer les permissions
        self._update_permissions(user, permissions_data)
        
        return user
    
    def update(self, instance, validated_data):
        permissions_data = validated_data.pop('permissions_input', None)
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        
        # Mettre à jour les permissions si fournies
        if permissions_data is not None:
            self._update_permissions(instance, permissions_data)
        
        return instance
    
    def _update_permissions(self, user, permissions_data):
        """Met à jour les permissions d'un utilisateur"""
        for perm_data in permissions_data:
            fonctionnalite = perm_data.get('fonctionnalite')
            if fonctionnalite:
                UserPermission.objects.update_or_create(
                    utilisateur=user,
                    fonctionnalite=fonctionnalite,
                    defaults={
                        'peut_voir': perm_data.get('peut_voir', True),
                        'peut_creer': perm_data.get('peut_creer', False),
                        'peut_modifier': perm_data.get('peut_modifier', False),
                        'peut_supprimer': perm_data.get('peut_supprimer', False),
                    }
                )


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'code', 'description', 'created_at', 'updated_at']


class SousCategorieSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    categorie_code = serializers.CharField(source='categorie.code', read_only=True)

    class Meta:
        model = SousCategorie
        fields = ['id', 'categorie', 'categorie_nom', 'categorie_code', 'nom', 'description', 'created_at', 'updated_at']


class PrevisionSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    categorie_code = serializers.CharField(source='categorie.code', read_only=True)
    sous_categorie_nom = serializers.CharField(source='sous_categorie.nom', read_only=True, allow_null=True)
    montant_impute = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    solde_restant = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = Prevision
        fields = [
            'id', 'mois', 'categorie', 'categorie_nom', 'categorie_code',
            'sous_categorie', 'sous_categorie_nom', 'montant_prevu',
            'statut', 'montant_impute', 'solde_restant',
            'created_by', 'created_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by']


class OperationSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)
    categorie_code = serializers.CharField(source='categorie.code', read_only=True)
    sous_categorie_nom = serializers.CharField(source='sous_categorie.nom', read_only=True, allow_null=True)
    ecart = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, allow_null=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = Operation
        fields = [
            'id', 'date_operation', 'jour', 'semaine_iso',
            'categorie', 'categorie_nom', 'categorie_code',
            'sous_categorie', 'sous_categorie_nom',
            'unites', 'prix_unitaire', 'montant_depense',
            'description', 'ecart', 'created_by', 'created_by_username',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['montant_depense', 'jour', 'semaine_iso', 'created_by']


class ImputationSerializer(serializers.ModelSerializer):
    operation_date = serializers.DateField(source='operation.date_operation', read_only=True)
    operation_montant = serializers.DecimalField(source='operation.montant_depense', max_digits=12, decimal_places=2, read_only=True)
    prevision_mois = serializers.DateField(source='prevision.mois', read_only=True)
    prevision_categorie = serializers.CharField(source='prevision.categorie.code', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = Imputation
        fields = [
            'id', 'operation', 'operation_date', 'operation_montant',
            'prevision', 'prevision_mois', 'prevision_categorie',
            'montant_impute', 'created_by', 'created_by_username',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by']


# ============================================================================
# SERIALIZERS RESTAURATION / CANTINE
# ============================================================================

class PlatSerializer(serializers.ModelSerializer):
    categorie_restau_display = serializers.CharField(source='get_categorie_restau_display', read_only=True)
    
    class Meta:
        model = Plat
        fields = [
            'id', 'nom', 'description', 'categorie_restau', 'categorie_restau_display',
            'prix_standard', 'actif', 'created_at', 'updated_at'
        ]


class MenuPlatSerializer(serializers.ModelSerializer):
    plat = PlatSerializer(read_only=True)
    plat_id = serializers.PrimaryKeyRelatedField(queryset=Plat.objects.filter(actif=True), source='plat', write_only=True)
    stock_restant = serializers.SerializerMethodField()
    
    class Meta:
        model = MenuPlat
        fields = [
            'id', 'menu', 'plat', 'plat_id', 'prix_jour', 'stock_max', 'stock_restant',
            'ordre', 'plat'
        ]
    
    def get_stock_restant(self, obj):
        return obj.get_stock_restant()


class MenuSerializer(serializers.ModelSerializer):
    menu_plats = MenuPlatSerializer(many=True, read_only=True)
    est_publie = serializers.BooleanField(read_only=True)
    lien_public = serializers.SerializerMethodField()
    
    class Meta:
        model = Menu
        fields = [
            'id', 'date_menu', 'publication_at', 'est_publie',
            'token_public', 'lien_public',
            'menu_plats', 'created_at', 'updated_at'
        ]
        read_only_fields = ['token_public']
    
    def get_lien_public(self, obj):
        """Génère le lien public complet - toujours vers Django (port 8000)"""
        if not obj.token_public:
            return None
        
        # Toujours utiliser localhost:8000 (Django) pour le formulaire public
        # même si la requête vient de localhost:3001 (Vite)
        request = self.context.get('request')
        if request:
            scheme = request.scheme  # http ou https
        else:
            scheme = 'http'
        
        # Construire le lien avec le token réel
        return f"{scheme}://localhost:8000/commander/{obj.token_public}/"


class FenetreCommandeSerializer(serializers.ModelSerializer):
    categorie_restau_display = serializers.CharField(source='get_categorie_restau_display', read_only=True)
    
    class Meta:
        model = FenetreCommande
        fields = [
            'id', 'categorie_restau', 'categorie_restau_display',
            'heure_limite', 'actif'
        ]


class RegleSubventionSerializer(serializers.ModelSerializer):
    type_subvention_display = serializers.CharField(source='get_type_subvention_display', read_only=True)
    
    class Meta:
        model = RegleSubvention
        fields = [
            'id', 'type_subvention', 'type_subvention_display', 'valeur',
            'plafond_par_jour', 'actif', 'effectif_de', 'effectif_a',
            'created_at', 'updated_at'
        ]


class CommandeLigneSerializer(serializers.ModelSerializer):
    menu_plat_detail = MenuPlatSerializer(source='menu_plat', read_only=True)
    montant_ligne = serializers.DecimalField(max_digits=18, decimal_places=2, read_only=True)
    plat_nom = serializers.CharField(source='menu_plat.plat.nom', read_only=True)
    prix_effectif = serializers.DecimalField(max_digits=18, decimal_places=2, read_only=True)
    
    class Meta:
        model = CommandeLigne
        fields = [
            'id', 'commande', 'menu_plat', 'menu_plat_detail', 'plat_nom',
            'quantite', 'prix_unitaire', 'prix_effectif', 'montant_ligne'
        ]


class CommandeSerializer(serializers.ModelSerializer):
    lignes = CommandeLigneSerializer(many=True, read_only=True)
    utilisateur_username = serializers.CharField(source='utilisateur.username', read_only=True)
    utilisateur_nom = serializers.SerializerMethodField()
    etat_display = serializers.CharField(source='get_etat_display', read_only=True)
    prix_reel_total = serializers.SerializerMethodField()
    supplement_total = serializers.SerializerMethodField()
    
    class Meta:
        model = Commande
        fields = [
            'id', 'utilisateur', 'utilisateur_username', 'utilisateur_nom', 'date_commande', 'etat', 'etat_display',
            'montant_brut', 'montant_subvention', 'montant_net',
            'prix_reel_total', 'supplement_total',
            'operation', 'lignes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['utilisateur', 'montant_brut', 'montant_subvention', 'montant_net', 'operation']
    
    def get_prix_reel_total(self, obj):
        """Retourne le prix réel total des plats (sans plafond)"""
        total = 0
        for ligne in obj.lignes.all():
            total += float(ligne.prix_unitaire) * ligne.quantite
        return total
    
    def get_supplement_total(self, obj):
        """Retourne le supplément total (montant au-delà de 30 000 GNF par plat)"""
        total = 0
        for ligne in obj.lignes.all():
            prix = float(ligne.prix_unitaire)
            if prix > 30000:
                total += (prix - 30000) * ligne.quantite
        return total
    
    def get_utilisateur_nom(self, obj):
        """Retourne le nom de l'utilisateur (first_name ou username)"""
        if obj.utilisateur:
            # Pour les commandes publiques, le nom est dans first_name
            if obj.utilisateur.first_name:
                return obj.utilisateur.first_name
            # Sinon, utiliser le username (pour les utilisateurs normaux)
            return obj.utilisateur.username
        return 'Utilisateur inconnu'


class CommandeCreateSerializer(serializers.Serializer):
    """Serializer pour créer une commande avec ses lignes"""
    date_commande = serializers.DateField()
    lignes = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    
    def validate_lignes(self, value):
        """Valide que chaque ligne contient menu_plat_id, quantite"""
        for ligne in value:
            if 'menu_plat_id' not in ligne:
                raise serializers.ValidationError("Chaque ligne doit contenir 'menu_plat_id'")
            if 'quantite' not in ligne:
                raise serializers.ValidationError("Chaque ligne doit contenir 'quantite'")
            try:
                quantite = int(ligne['quantite'])
                if quantite <= 0:
                    raise serializers.ValidationError("La quantité doit être supérieure à 0")
            except (ValueError, TypeError):
                raise serializers.ValidationError("La quantité doit être un nombre entier")
        return value


class ExtraRestaurationSerializer(serializers.ModelSerializer):
    type_extra_display = serializers.CharField(source='get_type_extra_display', read_only=True)
    operation_id = serializers.SerializerMethodField()
    created_by_username = serializers.SerializerMethodField()
    
    class Meta:
        model = ExtraRestauration
        fields = [
            'id', 'type_extra', 'type_extra_display', 'nom_personne', 'date_operation',
            'plat_nom', 'quantite', 'prix_unitaire', 'montant_total', 'description',
            'operation', 'operation_id', 'created_by', 'created_by_username',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['montant_total', 'operation', 'created_by', 'created_at', 'updated_at']
    
    def get_operation_id(self, obj):
        """Retourne l'ID de l'opération si elle existe"""
        return obj.operation.id if obj.operation else None
    
    def get_created_by_username(self, obj):
        """Retourne le nom d'utilisateur si created_by existe"""
        return obj.created_by.username if obj.created_by else None
    
    def create(self, validated_data):
        """Créer l'extra et l'opération associée"""
        from django.db import transaction
        import logging
        
        logger = logging.getLogger(__name__)
        
        # Récupérer l'utilisateur depuis validated_data (passé par perform_create) ou depuis le contexte
        user = validated_data.pop('created_by', None)
        if not user:
            request = self.context.get('request')
            user = request.user if request and request.user.is_authenticated else None
        
        try:
            with transaction.atomic():
                # Créer l'extra d'abord
                extra = ExtraRestauration.objects.create(
                    **validated_data,
                    created_by=user
                )
                logger.info(f"Extra créé avec succès: {extra.id}")
                
                # Créer automatiquement l'opération budgétaire
                try:
                    operation = extra.creer_operation(user=user)
                    logger.info(f"Opération créée avec succès: {operation.id}")
                except Exception as op_error:
                    error_msg = str(op_error)
                    logger.error(f"Erreur lors de la création de l'opération: {error_msg}", exc_info=True)
                    # Si la création de l'opération échoue, on supprime l'extra
                    try:
                        extra.delete()
                    except:
                        pass
                    # Lever une exception avec un message clair
                    from rest_framework.exceptions import ValidationError
                    raise ValidationError({
                        'non_field_errors': [f"Erreur lors de la création de l'opération: {error_msg}"]
                    })
                
                # Recharger l'objet avec toutes les relations
                extra.refresh_from_db()
                
                return extra
        except Exception as e:
            # Logger l'erreur pour le débogage
            logger.error(f"Erreur lors de la création d'un extra: {str(e)}", exc_info=True)
            raise
    
    def update(self, instance, validated_data):
        """Mettre à jour l'extra et l'opération associée"""
        from django.db import transaction
        
        # Ne pas modifier created_by lors de la mise à jour
        validated_data.pop('created_by', None)
        
        with transaction.atomic():
            # Mettre à jour les champs
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            
            # Si l'opération existe, la mettre à jour aussi
            if instance.operation:
                instance.operation.date_operation = instance.date_operation
                instance.operation.unites = instance.quantite
                instance.operation.prix_unitaire = instance.prix_unitaire
                instance.operation.description = f"{instance.get_type_extra_display()} - {instance.nom_personne}: {instance.plat_nom}"
                instance.operation.save()
            
            return instance


